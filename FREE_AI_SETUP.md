# 🆓 Free AI Setup Guide

SmartProBono Lite now works with **100% FREE** AI providers! No credit card required.

## 🚀 Option 1: Hugging Face (Recommended - 30k requests/month)

### Setup:
1. **Sign up:** Go to [huggingface.co](https://huggingface.co) (free account)
2. **Get token:** Settings → Access Tokens → New token
3. **Update .env.local:**
   ```env
   HUGGINGFACE_API_KEY=hf_your_token_here
   AI_PROVIDER=huggingface
   ```

### Models Available:
- Microsoft DialoGPT (conversational)
- Llama 3.1 (if you have access)
- Mistral 7B

---

## 🆓 Option 2: Groq (14k requests/day)

### Setup:
1. **Sign up:** Go to [console.groq.com](https://console.groq.com) (free account)
2. **Get API key:** API Keys → Create API Key
3. **Update .env.local:**
   ```env
   GROQ_API_KEY=your_groq_key_here
   AI_PROVIDER=groq
   ```

### Models Available:
- Llama 3.1 70B (excellent quality)
- Mixtral 8x7B
- Gemma 7B

---

## 🎭 Option 3: Demo Mode (No API Key Needed!)

**Perfect for testing the UI without any setup:**

```env
AI_PROVIDER=fallback
```

Ermi will respond with intelligent fallback messages:
- "I'd be happy to help draft a document. What type of legal document are you working on?"
- "I can help extract key facts from intake forms..."
- Context-aware responses based on keywords

---

## 🧪 Test All Options

### Test Fallback Mode (Right Now):
1. Set `AI_PROVIDER=fallback` in `.env.local`
2. Restart server: `npm run dev`
3. Go to dashboard → Chat with Ermi
4. Type: "Help me draft a client letter"

**Result:** Ermi responds intelligently without any API calls!

### Test with Real AI:
1. Pick Hugging Face or Groq
2. Get your API key
3. Update `.env.local`
4. Restart server
5. Chat with Ermi gets real AI responses!

---

## 💰 Cost Comparison

| Provider | Free Tier | Quality | Setup |
|----------|-----------|---------|-------|
| **Hugging Face** | 30k requests/month | Good | 2 minutes |
| **Groq** | 14k requests/day | Excellent | 2 minutes |
| **Fallback** | Unlimited | Demo quality | 0 minutes |

---

## 🎯 Recommended Path

### For Development/Demo:
```env
AI_PROVIDER=fallback
```
- ✅ Works immediately
- ✅ No API keys needed
- ✅ Perfect for UI testing

### For Production:
```env
HUGGINGFACE_API_KEY=your_token
AI_PROVIDER=huggingface
```
- ✅ 30k requests/month free
- ✅ Reliable and fast
- ✅ Good quality responses

### For Best Quality:
```env
GROQ_API_KEY=your_key
AI_PROVIDER=groq
```
- ✅ Excellent responses
- ✅ 14k requests/day free
- ✅ Fast inference

---

## 🚀 Quick Start (Demo Mode)

Want to see Ermi working right now? Just run:

```bash
# Set demo mode
echo "AI_PROVIDER=fallback" >> .env.local

# Restart server
npm run dev

# Open http://localhost:3000/dashboard
# Chat with Ermi - it works!
```

---

## 🔧 Environment File Example

```env
# Choose ONE option:

# Option 1: Hugging Face (FREE)
HUGGINGFACE_API_KEY=hf_your_token_here
AI_PROVIDER=huggingface

# Option 2: Groq (FREE) 
# GROQ_API_KEY=your_groq_key_here
# AI_PROVIDER=groq

# Option 3: Demo Mode (FREE)
# AI_PROVIDER=fallback

# Supabase (optional - for auth/storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 🎉 What You Get

### With Any Free Option:
✅ **Working chat interface**  
✅ **Ermi personality responses**  
✅ **File upload functionality**  
✅ **Document generation**  
✅ **Export to DOCX/TXT**  
✅ **Professional UI**  

### With Real AI (Hugging Face/Groq):
✅ **Intelligent responses**  
✅ **Context understanding**  
✅ **Document drafting**  
✅ **Information extraction**  

### With Supabase:
✅ **User authentication**  
✅ **Save conversations**  
✅ **Persistent storage**  

---

## 🚀 Ready to Test?

1. **Demo Mode (0 setup):** Set `AI_PROVIDER=fallback`
2. **Real AI (2 min setup):** Get Hugging Face token
3. **Full Stack (5 min setup):** Add Supabase keys

**All options are completely FREE!** 🎉

---

*Choose your adventure and start building!*
