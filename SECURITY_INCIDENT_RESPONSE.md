# 🚨 SECURITY INCIDENT: Resend API Key Compromised

## ⚠️ **IMMEDIATE ACTION REQUIRED**

Your Resend API key has been compromised and is being used by unauthorized individuals to send spam/phishing emails (French package delivery scam emails).

---

## 🎯 **STEP 1: Revoke All API Keys in Resend (DO THIS NOW)**

1. **Go to:** https://resend.com/api-keys
2. **Delete ALL existing API keys** (click the trash icon on each one)
3. **Create a NEW API key:**
   - Name: `SmartProBono Lite - NEW [DATE]`
   - Permissions: Send emails only
   - Click "Create"
   - **Copy the new key immediately** (you won't see it again)

---

## 🔒 **STEP 2: Update Your Environment Variables**

### Local Development (.env.local)
1. Open your `.env.local` file
2. Replace the old `RESEND_API_KEY` with your new key:
   ```env
   RESEND_API_KEY=re_your_new_api_key_here
   ```
3. **Save the file**
4. **Restart your development server**

### Production/Deployment (Netlify/Vercel)
1. **Netlify:**
   - Go to: Site Settings → Environment Variables
   - Find `RESEND_API_KEY`
   - Update it with your new key
   - Redeploy your site

2. **Vercel:**
   - Go to: Project Settings → Environment Variables
   - Find `RESEND_API_KEY`
   - Update it with your new key
   - Redeploy your site

---

## 🔍 **STEP 3: Check Where Your Key Might Have Been Exposed**

### Possible Exposure Points:
1. **Git Repository:**
   - Check if `.env.local` was accidentally committed
   - Check git history: `git log --all --full-history -- .env*`
   - If found, remove it from history (contact me for help)

2. **Deployment Platform:**
   - Check if environment variables are visible in build logs
   - Check if they're exposed in public settings

3. **Shared Access:**
   - Did you share your API key with anyone?
   - Did you paste it in a chat, email, or documentation?

4. **Code Repository:**
   - Check if API key is hardcoded in any files
   - Check if it's in any public GitHub repos

5. **Browser/DevTools:**
   - Check browser developer tools for any exposed keys
   - Clear browser cache and stored credentials

---

## 🛡️ **STEP 4: Secure Your Resend Account**

1. **Change your Resend account password**
2. **Enable two-factor authentication (2FA)** if available
3. **Review account activity logs** in Resend dashboard
4. **Check email notifications** for suspicious activity

---

## 🔐 **STEP 5: Review Other API Keys**

While you're at it, check these other services:

### Supabase Keys
- Check if Supabase keys are secure
- Rotate them if necessary
- Review database access logs

### Groq/AI Provider Keys
- Check Groq API key usage
- Review API usage logs
- Rotate if suspicious activity

### PostHog Keys
- Check PostHog analytics keys
- Review if they're exposed

---

## 📋 **STEP 6: Verify Your Code is Secure**

### ✅ Good Practices (Your code already does this):
- ✅ API keys only in `process.env` (server-side)
- ✅ `.env.local` is in `.gitignore`
- ✅ No API keys in client-side code
- ✅ No API keys in console.log statements

### ⚠️ Things to Check:
- [ ] No API keys in git history
- [ ] No API keys in deployment logs
- [ ] No API keys in error messages
- [ ] No API keys in public repositories

---

## 🚨 **STEP 7: Contact Resend Support**

1. **Email Resend Support** about the security incident
2. **Explain:**
   - Your account was compromised
   - Unauthorized emails were sent (French package delivery scam)
   - You've revoked all API keys
   - You need help securing your account
3. **Request:**
   - Account security review
   - Removal of suspension if possible
   - Guidance on preventing future incidents

---

## 🔄 **STEP 8: Update All Deployments**

After getting your new API key:

1. **Update local .env.local**
2. **Update Netlify environment variables**
3. **Update Vercel environment variables** (if used)
4. **Update any other deployment platforms**
5. **Redeploy all applications**

---

## 📊 **STEP 9: Monitor for Future Issues**

1. **Set up alerts** in Resend for unusual activity
2. **Monitor email sending volume** regularly
3. **Review API key usage** weekly
4. **Check for suspicious emails** in your sent folder

---

## 🎯 **PREVENTION: Best Practices Going Forward**

### ✅ DO:
- ✅ Use environment variables for all API keys
- ✅ Rotate API keys regularly (every 90 days)
- ✅ Use different API keys for different environments
- ✅ Limit API key permissions (send emails only, not full access)
- ✅ Monitor API key usage regularly
- ✅ Use API key naming conventions (include date/version)

### ❌ DON'T:
- ❌ Commit API keys to git
- ❌ Share API keys in emails/chats
- ❌ Store API keys in client-side code
- ❌ Log API keys in console.log
- ❌ Use the same API key for multiple projects
- ❌ Give API keys more permissions than needed

---

## 📞 **Need Help?**

If you need assistance with any of these steps, let me know. I can help you:
- Check git history for exposed keys
- Update deployment configurations
- Review code for security issues
- Set up monitoring and alerts

---

## ✅ **CHECKLIST**

- [ ] Revoked all old Resend API keys
- [ ] Created new Resend API key
- [ ] Updated `.env.local` with new key
- [ ] Updated Netlify environment variables
- [ ] Updated Vercel environment variables (if used)
- [ ] Restarted development server
- [ ] Redeployed production site
- [ ] Changed Resend account password
- [ ] Enabled 2FA (if available)
- [ ] Checked git history for exposed keys
- [ ] Reviewed other API keys (Supabase, Groq, PostHog)
- [ ] Contacted Resend support
- [ ] Set up monitoring/alerts

---

**Last Updated:** [Current Date]
**Status:** 🔴 ACTIVE INCIDENT - Action Required

