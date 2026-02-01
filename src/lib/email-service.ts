import type { Payload } from 'payload'
import type { User } from '@/payload-types'
import { getRiskAlertEmailTemplate, getWelcomeEmailTemplate, type RiskAlertData } from './email-templates'

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Log email to console in development mode
 */
function logEmail(type: string, to: string, subject: string, html: string, text: string) {
  if (!isDevelopment) return

  console.log('\n' + '='.repeat(60))
  console.log(`📧 EMAIL (${type})`)
  console.log('='.repeat(60))
  console.log(`To: ${to}`)
  console.log(`Subject: ${subject}`)
  console.log('\n--- HTML Preview ---')
  console.log(html.substring(0, 500) + (html.length > 500 ? '...' : ''))
  console.log('\n--- Plain Text ---')
  console.log(text.substring(0, 500) + (text.length > 500 ? '...' : ''))
  console.log('='.repeat(60) + '\n')
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  payload: Payload,
  user: User,
): Promise<void> {
  try {
    const { html, text } = getWelcomeEmailTemplate(
      user.name || 'there',
      user.email || '',
    )

    const subject = 'Welcome to Catarina!'

    // Log in development
    logEmail('WELCOME', user.email || '', subject, html, text)

    // Send email in production only (not in development)
    if (!isDevelopment && process.env.RESEND_API_KEY) {
      await payload.sendEmail({
        to: user.email || '',
        subject,
        html,
        text,
      })
    }
  } catch (error) {
    // Log error but don't throw - email failures shouldn't break user creation
    console.error('Failed to send welcome email:', error)
  }
}

/**
 * Send risk alert email to users associated with a farm
 */
export async function sendRiskAlert(
  payload: Payload,
  data: RiskAlertData,
): Promise<void> {
  try {
    const { html, text } = getRiskAlertEmailTemplate(data)

    const subject =
      data.riskLevel === 'danger'
        ? `🚨 Action Required: ${data.pestTypeName} Alert - ${data.farmName}`
        : `⚠️ Risk Alert: ${data.pestTypeName} - ${data.farmName}`

    // Log in development
    logEmail('RISK_ALERT', data.userEmail, subject, html, text)

    // Send email in production only (not in development)
    if (!isDevelopment && process.env.RESEND_API_KEY) {
      await payload.sendEmail({
        to: data.userEmail,
        subject,
        html,
        text,
      })
    }
  } catch (error) {
    // Log error but don't throw - email failures shouldn't break observation creation
    console.error('Failed to send risk alert email:', error)
  }
}

/**
 * Get users associated with a farm (for sending risk alerts)
 */
export async function getFarmUsers(
  payload: Payload,
  farmId: string | number,
): Promise<User[]> {
  try {
    // Find all users who have access to this farm
    // Users have a tenants array field with { tenant: farmId } objects
    // Query the nested tenant field within the tenants array
    const users = await payload.find({
      collection: 'users',
      where: {
        'tenants.tenant': {
          equals: farmId,
        },
      },
      depth: 0,
      limit: 100,
      overrideAccess: true, // Need admin access to query all users
    })

    return users.docs as User[]
  } catch (error) {
    console.error('Failed to get farm users:', error)
    return []
  }
}
