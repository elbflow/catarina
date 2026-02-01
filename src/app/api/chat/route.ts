import { google } from '@ai-sdk/google'
import { convertToModelMessages, streamText, tool, UIMessage } from 'ai'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { cookies } from 'next/headers'

export const maxDuration = 60

// System prompt for the AI Scout
const SYSTEM_PROMPT = `You are the AI Scout Assistant for Catarina, an IPM (Integrated Pest Management) application.

Your primary job is to help farmers log pest observations quickly and easily.

CAPABILITIES:
1. Log observations from photos - When a farmer sends a trap photo, analyze it to count pests and log the observation
2. Log observations from text - When a farmer tells you a count, log it for them
3. Check risk status - Tell farmers if they're close to needing to spray

INTERACTION STYLE:
- Be concise and friendly
- After logging, always tell them their current risk status
- If they send a photo without specifying a trap, ask which trap it's for
- Use the farmer's trap names (fuzzy match if needed)

RISK LEVELS:
- Safe: Average rate < 1/day - "Activity is low. Continue monitoring."
- Warning: Average rate 1-2/day - "Activity rising. Prepare controls."
- Danger: Average rate > 2/day - "Action window now. Coordinate treatment."

When counting pests in photos:
- Only count clearly identifiable moths/insects
- If image is unclear, give your best estimate
- Always confirm the count before logging`

export async function POST(req: Request) {
  const {
    messages,
    farmId,
    traps,
  }: {
    messages: UIMessage[]
    farmId: number
    traps: Array<{ id: number; name: string }>
  } = await req.json()

  // Get authenticated user from cookies
  const payload = await getPayload({ config })
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { user } = await payload.auth({ headers: new Headers({ Authorization: `JWT ${token}` }) })

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: SYSTEM_PROMPT + `\n\nFarmer's traps: ${traps.map((t) => `"${t.name}" (ID: ${t.id})`).join(', ')}`,
    messages: await convertToModelMessages(messages),
    tools: {
      createObservation: tool({
        description:
          'Log a pest observation for a trap. Use this when the farmer provides a count (either from a photo you analyzed or from text). Always confirm the trap name matches one of their traps.',
        inputSchema: z.object({
          trapId: z.number().describe('The ID of the trap'),
          trapName: z.string().describe('The name of the trap (for confirmation)'),
          count: z.number().min(0).describe('Number of pests observed'),
          notes: z.string().optional().describe('Optional notes about the observation'),
        }),
        execute: async ({ trapId, trapName, count, notes }: { trapId: number; trapName: string; count: number; notes?: string }) => {
          try {
            // Verify trap belongs to this farm
            const trap = await payload.findByID({
              collection: 'traps',
              id: trapId,
              user,
              overrideAccess: false,
            })

            if (!trap) {
              return { success: false, error: 'Trap not found or access denied' }
            }

            // Create the observation
            const observation = await payload.create({
              collection: 'pest-observations',
              data: {
                date: new Date().toISOString().split('T')[0],
                count,
                trap: trapId,
                notes: notes || undefined,
                tenant: farmId,
              },
              user,
              overrideAccess: false,
            })

            // Get updated risk info
            const recentObs = await payload.find({
              collection: 'pest-observations',
              where: {
                trap: { equals: trapId },
              },
              sort: '-date',
              limit: 10,
              user,
              overrideAccess: false,
            })

            // Calculate simple rate from last 2 observations
            let riskMessage = 'Risk status updated.'
            if (recentObs.docs.length >= 2) {
              const latest = recentObs.docs[0]
              const prev = recentObs.docs[1]
              const daysDiff = Math.max(
                (new Date(latest.date).getTime() - new Date(prev.date).getTime()) / (1000 * 60 * 60 * 24),
                0.5,
              )
              const rate = latest.count / daysDiff

              if (rate > 2) {
                riskMessage = `Rate is ${rate.toFixed(1)}/day - DANGER zone. Action window now.`
              } else if (rate >= 1) {
                riskMessage = `Rate is ${rate.toFixed(1)}/day - WARNING zone. Activity rising.`
              } else {
                riskMessage = `Rate is ${rate.toFixed(1)}/day - SAFE zone. Continue monitoring.`
              }
            }

            return {
              success: true,
              observationId: observation.id,
              trapName,
              count,
              date: new Date().toISOString().split('T')[0],
              riskMessage,
            }
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Failed to create observation',
            }
          }
        },
      }),

      getRiskStatus: tool({
        description:
          'Get the current risk status for a trap or the whole farm. Use when farmer asks "am I close to spraying?" or "how are my traps doing?"',
        inputSchema: z.object({
          trapId: z.number().optional().describe('Optional trap ID. If not provided, returns farm-wide status.'),
        }),
        execute: async ({ trapId }: { trapId?: number }) => {
          try {
            const recentObs = await payload.find({
              collection: 'pest-observations',
              where: trapId
                ? { trap: { equals: trapId } }
                : { tenant: { equals: farmId } },
              sort: '-date',
              limit: 20,
              user,
              overrideAccess: false,
            })

            if (recentObs.docs.length < 2) {
              return {
                status: 'insufficient_data',
                message: 'Need at least 2 observations to calculate risk. Keep logging!',
              }
            }

            // Calculate average rate from recent observations
            let totalRate = 0
            let rateCount = 0

            for (let i = 0; i < recentObs.docs.length - 1; i++) {
              const current = recentObs.docs[i]
              const prev = recentObs.docs[i + 1]
              const daysDiff = Math.max(
                (new Date(current.date).getTime() - new Date(prev.date).getTime()) / (1000 * 60 * 60 * 24),
                0.5,
              )
              const rate = current.count / daysDiff
              totalRate += rate
              rateCount++
            }

            const avgRate = rateCount > 0 ? totalRate / rateCount : 0

            let level: 'safe' | 'warning' | 'danger'
            let message: string
            let action: string

            if (avgRate > 2) {
              level = 'danger'
              message = `Average rate is ${avgRate.toFixed(1)}/day - in DANGER zone`
              action = 'Action window now. Coordinate treatment timing.'
            } else if (avgRate >= 1) {
              level = 'warning'
              message = `Average rate is ${avgRate.toFixed(1)}/day - in WARNING zone`
              action = 'Activity rising. Prepare biological controls and increase scouting.'
            } else {
              level = 'safe'
              message = `Average rate is ${avgRate.toFixed(1)}/day - in SAFE zone`
              action = 'Activity is low. Continue regular monitoring.'
            }

            return { level, message, action, avgRate: avgRate.toFixed(1) }
          } catch (error) {
            return {
              status: 'error',
              message: error instanceof Error ? error.message : 'Failed to get risk status',
            }
          }
        },
      }),

      listTraps: tool({
        description: "List all traps for the farmer. Use when they ask about their traps or you need to help them pick one.",
        inputSchema: z.object({}),
        execute: async () => {
          return {
            traps: traps.map((t) => ({ id: t.id, name: t.name })),
            message: `You have ${traps.length} trap${traps.length === 1 ? '' : 's'}`,
          }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
