import { getUser } from '@/access'
import { getFarmUsers, sendRiskAlert } from '@/lib/email-service'
import {
    calculateAverageRateForLastNDays,
    calculateObservationRates,
    calculateRateRisk,
    type RiskLevel,
} from '@/lib/risk-calculator'
import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

export const PestObservations: CollectionConfig = {
  slug: 'pest-observations',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['date', 'count', 'isBaseline', 'trap', 'createdAt'],
  },
  access: {
    // Plugin handles tenant filtering
    read: ({ req }) => {
      const user = getUser(req)
      if (!user) return false
      if (user.isSuperAdmin) return true
      return true // Plugin filters by tenant
    },
    // Farmers and technicians can create observations
    create: ({ req }) => {
      const user = getUser(req)
      if (!user) return false
      if (user.isSuperAdmin) return true
      return ['farmer', 'technician'].includes(user.role)
    },
    // Farmers and technicians can update observations in their farms (plugin filters by tenant)
    update: ({ req }) => {
      const user = getUser(req)
      if (!user) return false
      if (user.isSuperAdmin) return true
      return ['farmer', 'technician'].includes(user.role)
    },
    // Farmers and technicians can delete observations in their farms (plugin filters by tenant)
    delete: ({ req }) => {
      const user = getUser(req)
      if (!user) return false
      if (user.isSuperAdmin) return true
      return ['farmer', 'technician'].includes(user.role)
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && data.trap && data.date) {
          // Check if observation already exists for this trap + date
          const existing = await req.payload.find({
            collection: 'pest-observations',
            where: {
              and: [
                { trap: { equals: typeof data.trap === 'object' ? data.trap.id : data.trap } },
                { date: { equals: data.date } },
              ],
            },
            limit: 1,
          })

          if (existing.docs.length > 0) {
            // Format the date for a user-friendly error message
            const observationDate = new Date(data.date)
            const formattedDate = observationDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })

            throw new APIError(
              `An observation for this trap already exists on ${formattedDate}. ` +
                `You can edit the existing observation in the admin panel or choose a different date. ` +
                `Only one observation per trap per day is allowed.`,
              400,
            )
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation, context }) => {
        // Only process new observations
        if (operation !== 'create') return doc

        // Skip if this is triggered from another hook to prevent loops
        if (context.skipEmailNotifications) return doc

        // Skip baseline observations (they don't affect risk)
        if (doc.isBaseline) return doc

        // Fire-and-forget: don't await to keep response fast
        ;(async () => {
          try {
            // Get trap with farm and pest type
            const trapId = typeof doc.trap === 'object' ? doc.trap.id : doc.trap
            const trap = await req.payload.findByID({
              collection: 'traps',
              id: trapId,
              depth: 2,
            })

            if (!trap || !trap.farm) return

            const farm = typeof trap.farm === 'object' ? trap.farm : await req.payload.findByID({
              collection: 'farms',
              id: trap.farm,
              depth: 1,
            })

            if (!farm || !farm.pestType) return

            const pestType = typeof farm.pestType === 'object' ? farm.pestType : await req.payload.findByID({
              collection: 'pest-types',
              id: farm.pestType,
            })

            if (!pestType) return

            // Get recent observations for this trap (last 30 days, sorted by date descending)
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            thirtyDaysAgo.setHours(0, 0, 0, 0)

            const observations = await req.payload.find({
              collection: 'pest-observations',
              where: {
                and: [
                  { trap: { equals: trapId } },
                  { date: { greater_than_equal: thirtyDaysAgo.toISOString().split('T')[0] } },
                ],
              },
              sort: '-date',
              limit: 100,
              depth: 0,
            })

            if (observations.docs.length === 0) return

            // Calculate rates and risk
            const observationsWithRates = calculateObservationRates(
              observations.docs.map((obs) => ({
                id: obs.id,
                date: obs.date,
                count: obs.count,
                isBaseline: obs.isBaseline ?? undefined,
              })),
            )

            // Calculate 3-day average rate
            const averageRate = calculateAverageRateForLastNDays(observationsWithRates, 3)
            const riskResult = calculateRateRisk(averageRate)
            const currentRiskLevel: RiskLevel = riskResult.level

            // Get previous risk level from trap
            const previousRiskLevel: RiskLevel | null =
              (trap.currentRiskLevel as RiskLevel | null) || null

            // Determine if we should send email
            const shouldSendEmail =
              currentRiskLevel === 'danger' || // Always send for danger
              (currentRiskLevel === 'warning' && previousRiskLevel !== 'warning') // Send for warning only if it changed

            if (shouldSendEmail) {
              // Get users associated with this farm
              const farmId = farm.id
              const users = await getFarmUsers(req.payload, farmId)

              // Send email to each user
              for (const user of users) {
                if (!user.email) continue

                await sendRiskAlert(req.payload, {
                  userName: user.name || 'there',
                  userEmail: user.email,
                  farmName: farm.name || 'Unknown Farm',
                  trapName: trap.name || 'Unknown Trap',
                  pestTypeName: pestType.name || 'Unknown Pest',
                  riskLevel: currentRiskLevel,
                  previousRiskLevel,
                  currentRate: averageRate,
                  ratePercentage: riskResult.ratePercentage,
                  message: riskResult.message,
                  actionMessage: riskResult.actionMessage,
                  observationDate: doc.date,
                  observationCount: doc.count,
                })
              }
            }

            // Update trap's current risk level (fire-and-forget, use context to prevent hook loop)
            await req.payload.update({
              collection: 'traps',
              id: trapId,
              data: {
                currentRiskLevel,
              },
              context: { skipEmailNotifications: true },
              req,
            })
          } catch (error) {
            // Log error but don't throw - email failures shouldn't break observation creation
            console.error('Failed to process risk alert:', error)
          }
        })().catch((error) => {
          console.error('Error in risk alert processing:', error)
        })

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'date',
      type: 'date',
      required: true,
      label: 'Observation Date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'count',
      type: 'number',
      required: true,
      label: 'New Insects Since Last Check',
      admin: {
        description: 'Additional insects caught since last observation',
      },
      min: 0,
    },
    {
      name: 'isBaseline',
      type: 'checkbox',
      label: 'Trap Setup',
      defaultValue: false,
      admin: {
        description: 'Marks when the trap was set up or reset (count should be 0)',
      },
    },
    {
      name: 'trap',
      type: 'relationship',
      relationTo: 'traps',
      required: true,
      label: 'Trap',
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes',
      admin: {
        description: 'Optional notes about this observation',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Photo',
      admin: {
        description: 'Optional photo of the trap (for V4 AI feature)',
      },
    },
  ],
  timestamps: true,
}
