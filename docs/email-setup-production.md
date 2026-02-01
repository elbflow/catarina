# Email Notifications - Production Setup Guide

This guide walks you through setting up email notifications for Catarina in production using Resend.

## Prerequisites

- Resend account (free tier available)
- Access to your domain's DNS settings (if using custom domain)
- Production deployment platform access (Vercel, etc.)

---

## Step 1: Create Resend Account & Get API Key

1. **Sign up for Resend**
   - Go to [resend.com](https://resend.com)
   - Sign up for a free account (100 emails/day free tier)

2. **Create API Key**
   - Navigate to **API Keys** in the Resend dashboard
   - Click **Create API Key**
   - Name it: `Catarina Production` (or similar)
   - Copy the API key (starts with `re_`)
   - ⚠️ **Important**: Save this key securely - you won't be able to see it again!

---

## Step 2: Choose Email Sending Strategy

You have two options:

### Option A: Use Resend's Default Domain (Quick Start)
- **Pros**: No DNS configuration needed, works immediately
- **Cons**: Uses `onboarding@resend.dev` (not branded), limited deliverability
- **Best for**: Testing, MVP, or if you don't own a domain

### Option B: Use Custom Domain (Recommended for Production)
- **Pros**: Branded emails (`alerts@catarina.app`), better deliverability, professional
- **Cons**: Requires DNS configuration
- **Best for**: Production deployments

---

## Step 3: Set Up Custom Domain (Option B - Recommended)

### 3.1 Add Domain in Resend

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `catarina.app` or `notifications.catarina.app`)
4. Click **Add Domain**

### 3.2 Configure DNS Records

Resend will provide you with DNS records to add. You'll need to add these to your domain's DNS settings:

#### Required Records:

1. **SPF Record** (TXT)
   ```
   Type: TXT
   Name: @ (or your subdomain)
   Value: v=spf1 include:_spf.resend.com ~all
   TTL: 3600
   ```

2. **DKIM Record** (TXT)
   ```
   Type: TXT
   Name: resend._domainkey (or provided by Resend)
   Value: [Provided by Resend - unique per domain]
   TTL: 3600
   ```

3. **DMARC Record** (TXT) - Optional but recommended
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:dmarc@catarina.app
   TTL: 3600
   ```

#### Where to Add DNS Records:

- **Vercel**: Project Settings → Domains → DNS Records
- **Cloudflare**: DNS → Records → Add Record
- **Namecheap/GoDaddy**: Domain Management → Advanced DNS

### 3.3 Verify Domain

1. After adding DNS records, wait 5-15 minutes for propagation
2. Go back to Resend dashboard → Domains
3. Click **Verify** next to your domain
4. Wait for verification (usually takes a few minutes)

**Note**: DNS propagation can take up to 48 hours, but usually completes within 1-2 hours.

---

## Step 4: Update Payload Configuration

Once your domain is verified, update the `from` address in production:

### Update `src/payload.config.ts`:

```typescript
email: resendAdapter({
  defaultFromAddress: process.env.RESEND_FROM_ADDRESS || 'onboarding@resend.dev',
  defaultFromName: 'Catarina',
  apiKey: process.env.RESEND_API_KEY || '',
}),
```

### Add to `.env.example`:

```bash
# Resend Email Configuration
RESEND_API_KEY=re_xxxxxxxxx  # Get from resend.com/api-keys
RESEND_FROM_ADDRESS=alerts@catarina.app  # Your verified domain (or onboarding@resend.dev for testing)
```

---

## Step 5: Set Environment Variables in Production

### For Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following:

   ```
   RESEND_API_KEY = re_xxxxxxxxx
   RESEND_FROM_ADDRESS = alerts@catarina.app  # (or onboarding@resend.dev)
   NODE_ENV = production
   ```

4. **Important**: Make sure `NODE_ENV=production` is set (emails won't send in development mode)

5. Redeploy your application for changes to take effect

### For Other Platforms:

Set the same environment variables in your deployment platform's settings.

---

## Step 6: Test Email Sending

### 6.1 Test Welcome Email

1. Create a new user in your production admin panel
2. Check that the welcome email is sent
3. Verify it arrives in the inbox (check spam folder if needed)

### 6.2 Test Risk Alert Email

1. Create a new observation that triggers a **Danger** level
2. Verify the risk alert email is sent to farm users
3. Check email content and formatting

### 6.3 Use Resend Test Addresses (Safe Testing)

Resend provides test addresses for safe testing:

- `delivered@resend.dev` - Simulates successful delivery
- `bounced@resend.dev` - Simulates hard bounce
- `complained@resend.dev` - Simulates spam complaint

**⚠️ Never test with fake addresses** like `test@gmail.com` - this will bounce and hurt your sender reputation!

---

## Step 7: Monitor Email Delivery

### 7.1 Resend Dashboard

- Go to **Emails** in Resend dashboard
- View sent emails, delivery status, opens, clicks
- Monitor bounce rates and spam complaints

### 7.2 Set Up Webhooks (Optional)

For real-time email event tracking, set up webhooks:

1. Go to **Webhooks** in Resend dashboard
2. Add webhook URL: `https://your-domain.com/api/webhooks/resend`
3. Select events: `email.delivered`, `email.bounced`, `email.complained`
4. Implement webhook handler in your app (see Resend docs)

### 7.3 Key Metrics to Monitor

- **Delivery Rate**: Should be > 95%
- **Bounce Rate**: Should be < 4%
- **Spam Complaint Rate**: Should be < 0.08%
- **Open Rate**: Varies, but 20-30% is typical for transactional emails

---

## Step 8: Production Checklist

Before going live, verify:

- [ ] Resend API key is set in production environment
- [ ] `RESEND_FROM_ADDRESS` is set (custom domain or `onboarding@resend.dev`)
- [ ] `NODE_ENV=production` is set
- [ ] Custom domain is verified (if using Option B)
- [ ] DNS records are configured correctly
- [ ] Test emails are being sent successfully
- [ ] Email templates render correctly
- [ ] Links in emails point to production URLs
- [ ] Error handling is working (check logs for email failures)

---

## Troubleshooting

### Emails Not Sending

1. **Check Environment Variables**
   ```bash
   # Verify in production logs
   echo $RESEND_API_KEY
   echo $NODE_ENV
   ```

2. **Check NODE_ENV**
   - Emails only send when `NODE_ENV !== 'development'`
   - Make sure production has `NODE_ENV=production`

3. **Check API Key**
   - Verify API key is correct and active in Resend dashboard
   - Ensure no extra spaces or quotes in environment variable

4. **Check Logs**
   - Look for error messages in application logs
   - Check Resend dashboard for failed sends

### Emails Going to Spam

1. **Verify DNS Records**
   - SPF, DKIM, and DMARC must be configured correctly
   - Use [MXToolbox](https://mxtoolbox.com/) to verify records

2. **Check Domain Reputation**
   - New domains need warm-up period
   - Start with low volume and gradually increase

3. **Email Content**
   - Avoid spam trigger words
   - Include plain text version (already done)
   - Don't use URL shorteners

### Domain Verification Failing

1. **Wait for DNS Propagation**
   - Can take up to 48 hours
   - Use [whatsmydns.net](https://www.whatsmydns.net/) to check propagation

2. **Verify DNS Records**
   - Double-check record values match Resend's requirements exactly
   - Ensure no typos in record names/values

3. **Check Record Types**
   - SPF/DKIM/DMARC must be TXT records
   - Not CNAME or A records

---

## Security Best Practices

1. **Never commit API keys** to git
2. **Use environment variables** for all sensitive data
3. **Rotate API keys** periodically
4. **Monitor for suspicious activity** in Resend dashboard
5. **Set up webhooks** to track email events
6. **Use separate API keys** for development and production

---

## Cost Considerations

### Resend Pricing (as of 2024)

- **Free Tier**: 100 emails/day, 3,000/month
- **Pro**: $20/month - 50,000 emails/month
- **Business**: Custom pricing

**For Catarina**: Free tier should be sufficient for MVP/demo. Monitor usage in Resend dashboard.

---

## Next Steps

After setup:

1. **Monitor email delivery** for first few days
2. **Collect user feedback** on email content/formatting
3. **Set up email analytics** (opens, clicks) if needed
4. **Consider email preferences** (opt-out) for future versions
5. **Plan for email warm-up** if sending high volume

---

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Dashboard](https://resend.com/emails)
- [DNS Record Verification](https://mxtoolbox.com/)
- [Email Deliverability Guide](https://resend.com/docs/dashboard/domains/introduction)

---

## Support

If you encounter issues:

1. Check Resend dashboard for error messages
2. Review application logs for email-related errors
3. Verify environment variables are set correctly
4. Test with `delivered@resend.dev` to isolate issues
5. Contact Resend support if domain verification fails
