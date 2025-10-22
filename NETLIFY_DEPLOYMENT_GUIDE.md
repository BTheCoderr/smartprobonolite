# 🚀 Netlify Deployment Guide

## 🎯 **Deploy SmartProBono Lite to Production**

Let's get your AI legal assistant live on the internet! Netlify makes this super easy.

## 📋 **Step 1: Prepare for Deployment**

### **Build Settings**
Your Next.js app needs these build settings for Netlify:

**Build Command:**
```bash
npm run build
```

**Publish Directory:**
```
.next
```

**Node Version:**
```
18.x
```

## 📋 **Step 2: Deploy from GitHub**

1. **Go to Netlify**: https://netlify.com
2. **Sign up/Login** with your GitHub account
3. **Click "New site from Git"**
4. **Choose GitHub** as your Git provider
5. **Select your repository**: `BTheCoderr/smartprobonolite`
6. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `18.x`

## 📋 **Step 3: Environment Variables**

In Netlify dashboard, go to **Site settings > Environment variables** and add:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AI Provider Configuration
GROQ_API_KEY=your_groq_api_key_here
AI_PROVIDER=groq

# Email Service
RESEND_API_KEY=your_resend_api_key_here

# Production Environment
NODE_ENV=production
```

## 📋 **Step 4: Deploy!**

1. **Click "Deploy site"**
2. **Wait for build** (usually 2-3 minutes)
3. **Get your live URL** (something like `https://amazing-name-123456.netlify.app`)

## 🎉 **Your App is Live!**

Once deployed, you'll have:
- ✅ **Live URL** for your AI legal assistant
- ✅ **Automatic deployments** on every GitHub push
- ✅ **HTTPS** enabled by default
- ✅ **Global CDN** for fast loading
- ✅ **Production-ready** application

## 🔧 **Optional: Custom Domain**

If you want a custom domain:
1. **Go to Domain settings** in Netlify
2. **Add custom domain**
3. **Update DNS** records
4. **Enable HTTPS**

## 🚀 **Deployment Checklist**

- [ ] Repository pushed to GitHub
- [ ] Netlify account created
- [ ] Site connected to GitHub repo
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Site deployed successfully
- [ ] Live URL working
- [ ] Authentication working
- [ ] AI chat working
- [ ] Document generation working

## 🎯 **Production Features**

Your deployed app will have:
- **Professional landing page** with animations
- **Magic link authentication** via Supabase
- **AI chat interface** with Ermi
- **Document upload** and processing
- **Document generation** and export
- **User dashboard** with history
- **Mobile responsive** design
- **Secure data** with RLS

## 🔗 **Share Your Creation**

Once deployed, you can share:
- **Live demo URL** with professors/classmates
- **GitHub repository** for code review
- **Documentation** for setup instructions
- **Screenshots** of the working application

---

**Ready to go live? Let's deploy! 🚀⚖️**
