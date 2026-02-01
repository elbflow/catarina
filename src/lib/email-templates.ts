import type { RiskLevel } from './risk-calculator'

/**
 * Email templates for Catarina notifications
 */

const BASE_STYLES = `
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e5e5;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #2c5530;
      margin-bottom: 10px;
    }
    .risk-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 20px 0;
    }
    .risk-safe {
      background-color: #d4edda;
      color: #155724;
    }
    .risk-warning {
      background-color: #fff3cd;
      color: #856404;
    }
    .risk-danger {
      background-color: #f8d7da;
      color: #721c24;
    }
    .content {
      margin: 20px 0;
    }
    .action-message {
      background-color: #f8f9fa;
      border-left: 4px solid #2c5530;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .details {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .details-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e5e5;
    }
    .details-row:last-child {
      border-bottom: none;
    }
    .details-label {
      font-weight: 600;
      color: #666;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #2c5530;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
      font-weight: 600;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 10px;
      }
      .container {
        padding: 20px;
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
      <div class="logo">🌾 Catarina</div>
      <p style="color: #666; margin: 0;">Integrated Pest Management</p>
    </div>
    
    <div class="content">
      <h1 style="color: #2c5530; margin-top: 0;">Welcome to Catarina!</h1>
      
      <p>Hi ${userName || 'there'},</p>
      
      <p>Welcome to Catarina, your IPM (Integrated Pest Management) scout-to-action platform. We're excited to help you track pest observations and identify when intervention is needed.</p>
      
      <div class="action-message">
        <strong>What you can do:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
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
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        If you have any questions, feel free to reach out. Happy scouting!
      </p>
    </div>
    
    <div class="footer">
      <p>Catarina IPM Platform</p>
      <p style="font-size: 12px; color: #999;">
        This is an automated message. Please do not reply to this email.
      </p>
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
      <div class="logo">🌾 Catarina</div>
      <p style="color: #666; margin: 0;">Integrated Pest Management</p>
    </div>
    
    <div class="content">
      <h1 style="color: #2c5530; margin-top: 0;">${mainMessage}</h1>
      
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
          <span>${farmName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Trap:</span>
          <span>${trapName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Pest Type:</span>
          <span>${pestTypeName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Observation Date:</span>
          <span>${new Date(observationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Count:</span>
          <span>${observationCount} insects</span>
        </div>
        <div class="details-row">
          <span class="details-label">Average Rate:</span>
          <span><strong>${currentRate.toFixed(2)}/day</strong></span>
        </div>
        ${previousRiskLevel !== null ? `
        <div class="details-row">
          <span class="details-label">Previous Risk:</span>
          <span>${getRiskLabel(previousRiskLevel)}</span>
        </div>
        ` : ''}
      </div>
      
      <div class="action-message">
        <strong>${message}</strong>
        <p style="margin: 10px 0 0 0;">${actionMessage}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'}/admin/collections/pest-observations" class="button">
          View Observations
        </a>
      </div>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        Monitor your traps regularly to stay ahead of pest activity.
      </p>
    </div>
    
    <div class="footer">
      <p>Catarina IPM Platform</p>
      <p style="font-size: 12px; color: #999;">
        This is an automated message. Please do not reply to this email.
      </p>
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
