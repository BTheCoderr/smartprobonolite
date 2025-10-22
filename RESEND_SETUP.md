# 📧 Resend Email Setup Guide

## 🎯 **What You Get**

With Resend integration:
- ✅ **Early access requests** sent to your email
- ✅ **Confirmation emails** sent to users
- ✅ **Professional email templates**
- ✅ **Email tracking and delivery**

---

## 📋 **Step 1: Create Resend Account**

1. **Go to:** https://resend.com
2. **Sign up** with your email
3. **Verify your email** when prompted

---

## 📋 **Step 2: Get Your API Key**

1. **Go to:** https://resend.com/api-keys
2. **Click "Create API Key"**
3. **Settings:**
   ```
   Name: SmartProBono Lite
   Permissions: Send emails
   ```
4. **Click "Create"**
5. **Copy the API key** (starts with `your_resend_api_key_here`)

---

## 📋 **Step 3: Add to .env.local**

Add this line to your `.env.local` file:

```env
RESEND_API_KEY=your_resend_api_key_here
```

---

## 🚀 **How It Works**

The application uses Resend to:
- Send magic link emails for authentication
- Send confirmation emails for early access requests
- Handle all transactional email needs

## 📋 **Testing**

To test email functionality:
1. Start the development server
2. Try the "Request Early Access" form
3. Check your email for the confirmation message