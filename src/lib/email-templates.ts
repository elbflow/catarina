import type { RiskLevel } from './risk-calculator'

/**
 * Email templates for Catarina notifications
 */

const BASE_STYLES = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
    
    body {
      font-family: 'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #111827;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fafafa;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      text-align: center;
      padding: 40px 30px;
      margin: 0;
    }
    .logo {
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .header-subtitle {
      color: rgba(255, 255, 255, 0.85);
      margin: 0;
      font-size: 14px;
      font-weight: 400;
    }
    .content {
      padding: 30px;
      margin: 0;
    }
    .content h1 {
      color: #111827;
      font-size: 28px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 20px;
      line-height: 1.2;
    }
    .content p {
      color: #374151;
      font-size: 16px;
      line-height: 1.6;
      margin: 16px 0;
    }
    .risk-badge {
      display: inline-block;
      padding: 10px 20px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 20px 0;
    }
    .risk-safe {
      background-color: #dcfce7;
      color: #166534;
    }
    .risk-warning {
      background-color: #fef3c7;
      color: #92400e;
    }
    .risk-danger {
      background-color: #fee2e2;
      color: #991b1b;
    }
    .action-message {
      background-color: #f9fafb;
      border-left: 4px solid #2563eb;
      padding: 20px;
      margin: 24px 0;
      border-radius: 8px;
    }
    .action-message strong {
      color: #111827;
      font-weight: 600;
      display: block;
      margin-bottom: 8px;
    }
    .action-message p {
      color: #6b7280;
      margin: 0;
    }
    .action-message ul {
      margin: 12px 0;
      padding-left: 24px;
      color: #374151;
    }
    .action-message li {
      margin: 8px 0;
    }
    .details {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
      border: 1px solid #e5e7eb;
    }
    .details-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .details-row:last-child {
      border-bottom: none;
    }
    .details-label {
      font-weight: 600;
      color: #6b7280;
      font-size: 14px;
    }
    .details-value {
      color: #111827;
      font-weight: 500;
      text-align: right;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #2563eb;
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      margin: 24px 0;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #1d4ed8;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 8px 0;
      color: #6b7280;
    }
    .footer small {
      color: #9ca3af;
      font-size: 12px;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 10px;
      }
      .header {
        padding: 30px 20px;
      }
      .content {
        padding: 24px 20px;
      }
      .content h1 {
        font-size: 24px;
      }
      .button {
        padding: 12px 24px;
        font-size: 15px;
      }
    }
  </style>
`

function getRiskBadgeClass(level: RiskLevel): string {
  switch (level) {
    case 'safe':
      return 'risk-safe'
    case 'warning':
      return 'risk-warning'
    case 'danger':
      return 'risk-danger'
    default:
      return 'risk-safe'
  }
}

function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'safe':
      return 'Safe'
    case 'warning':
      return 'Warning'
    case 'danger':
      return 'Action Required'
    default:
      return 'Safe'
  }
}

export function getWelcomeEmailTemplate(userName: string, userEmail: string): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${BASE_STYLES}
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🐞 Catarina</div>
      <p class="header-subtitle">Integrated Pest Management</p>
    </div>
    
    <div class="content">
      <h1>Welcome to Catarina!</h1>
      
      <p>Hi ${userName || 'there'},</p>
      
      <p>Welcome to Catarina, your IPM (Integrated Pest Management) scout-to-action platform. We're excited to help you track pest observations and identify when intervention is needed.</p>
      
      <div class="action-message">
        <strong>What you can do:</strong>
        <ul>
          <li>Track pest observations across your farms</li>
          <li>Monitor risk levels with real-time alerts</li>
          <li>Get notified when action is needed</li>
          <li>Visualize trends with interactive charts</li>
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/admin" class="button">
          Go to Dashboard
        </a>
      </div>
      
      <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
        If you have any questions, feel free to reach out. Happy scouting!
      </p>
    </div>
    
    <div class="footer">
      <p>Catarina IPM Platform</p>
      <small>This is an automated message. Please do not reply to this email.</small>
    </div>
  </div>
</body>
</html>
  `.trim()

  const text = `
Welcome to Catarina!

Hi ${userName || 'there'},

Welcome to Catarina, your IPM (Integrated Pest Management) scout-to-action platform. We're excited to help you track pest observations and identify when intervention is needed.

What you can do:
- Track pest observations across your farms
- Monitor risk levels with real-time alerts
- Get notified when action is needed
- Visualize trends with interactive charts

Go to Dashboard: ${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/admin

If you have any questions, feel free to reach out. Happy scouting!

---
Catarina IPM Platform
This is an automated message. Please do not reply to this email.
  `.trim()

  return { html, text }
}

export interface RiskAlertData {
  userName: string
  userEmail: string
  farmName: string
  trapName: string
  pestTypeName: string
  riskLevel: RiskLevel
  previousRiskLevel: RiskLevel | null
  currentRate: number
  ratePercentage: number
  message: string
  actionMessage: string
  observationDate: string
  observationCount: number
}

export function getRiskAlertEmailTemplate(data: RiskAlertData): { html: string; text: string } {
  const { userName, farmName, trapName, pestTypeName, riskLevel, previousRiskLevel, currentRate, message, actionMessage, observationDate, observationCount } = data

  const riskChanged = previousRiskLevel !== null && previousRiskLevel !== riskLevel
  const isDanger = riskLevel === 'danger'
  const isWarning = riskLevel === 'warning'

  // Determine the main message
  let mainMessage = ''
  if (isDanger) {
    mainMessage = '🚨 Immediate action required!'
  } else if (isWarning && riskChanged) {
    mainMessage = '⚠️ Risk level has increased'
  } else if (isWarning) {
    mainMessage = '⚠️ Warning level detected'
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${BASE_STYLES}
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🐞 Catarina</div>
      <p class="header-subtitle">Integrated Pest Management</p>
    </div>
    
    <div class="content">
      <h1>${mainMessage}</h1>
      
      <p>Hi ${userName},</p>
      
      <p>We detected a change in pest activity that requires your attention.</p>
      
      <div style="text-align: center;">
        <span class="risk-badge ${getRiskBadgeClass(riskLevel)}">
          ${getRiskLabel(riskLevel)}
        </span>
      </div>
      
      <div class="details">
        <div class="details-row">
          <span class="details-label">Farm:</span>
          <span class="details-value">${farmName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Trap:</span>
          <span class="details-value">${trapName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Pest Type:</span>
          <span class="details-value">${pestTypeName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Observation Date:</span>
          <span class="details-value">${new Date(observationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Count:</span>
          <span class="details-value">${observationCount} insects</span>
        </div>
        <div class="details-row">
          <span class="details-label">Average Rate:</span>
          <span class="details-value"><strong>${currentRate.toFixed(2)}/day</strong></span>
        </div>
        ${previousRiskLevel !== null ? `
        <div class="details-row">
          <span class="details-label">Previous Risk:</span>
          <span class="details-value">${getRiskLabel(previousRiskLevel)}</span>
        </div>
        ` : ''}
      </div>
      
      <div class="action-message">
        <strong>${message}</strong>
        <p>${actionMessage}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/admin/collections/pest-observations" class="button">
          View Observations
        </a>
      </div>
      
      <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
        Monitor your traps regularly to stay ahead of pest activity.
      </p>
    </div>
    
    <div class="footer">
      <p>Catarina IPM Platform</p>
      <small>This is an automated message. Please do not reply to this email.</small>
    </div>
  </div>
</body>
</html>
  `.trim()

  const text = `
${mainMessage}

Hi ${userName},

We detected a change in pest activity that requires your attention.

Risk Level: ${getRiskLabel(riskLevel).toUpperCase()}

Details:
- Farm: ${farmName}
- Trap: ${trapName}
- Pest Type: ${pestTypeName}
- Observation Date: ${new Date(observationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
- Count: ${observationCount} insects
- Average Rate: ${currentRate.toFixed(2)}/day
${previousRiskLevel !== null ? `- Previous Risk: ${getRiskLabel(previousRiskLevel)}\n` : ''}

${message}
${actionMessage}

View Observations: ${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/admin/collections/pest-observations

Monitor your traps regularly to stay ahead of pest activity.

---
Catarina IPM Platform
This is an automated message. Please do not reply to this email.
  `.trim()

  return { html, text }
}
