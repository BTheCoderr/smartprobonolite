# 🚀 Running SmartProBono Lite - Quick Checklist

## Before You Start

### ✅ Prerequisites Check

1. **Dependencies installed?**
   ```bash
   npm install
   ```

2. **Environment variables set?**
   Check if `.env.local` exists with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   GROQ_API_KEY=your_groq_key
   AI_PROVIDER=groq
   ```

3. **Supabase schema loaded?**
   - Run `supabase/schema.sql` in your Supabase SQL Editor

---

## 🎬 Start the App

```bash
npm run dev
```

Open: **http://localhost:3000**

---

## 👀 What You'll See

### **Landing Page (http://localhost:3000)**
✅ "SmartProBono Lite" header  
✅ "Meet Ermi" tagline  
✅ Sign Up / Sign In form  
✅ Three feature cards  
✅ Blue and white design  

### **After Sign In (http://localhost:3000/dashboard)**
✅ **Top:** "👋 Meet Ermi — Your AI Legal Assistant"  
✅ **Left pane:** File upload area + Chat with Ermi  
✅ **Right pane:** Document preview/export  
✅ **Bottom:** Copyright and disclaimer  

---

## 🧪 Quick Test Flow

### **Test 1: Sign Up**
1. Enter email and password
2. Check email for verification link
3. Click link → Sign in

### **Test 2: Upload a File**
1. Create a test file: `test-intake.txt`
   ```
   Client Name: John Doe
   Case Type: Personal Injury
   Date: October 1, 2025
   Description: Car accident on Main Street
   ```
2. Drag and drop into upload area
3. Click "Extract Info" button

**Expected:** Ermi presents structured summary

### **Test 3: Chat**
Type: "Generate a client engagement letter"

**Expected:** Ermi creates draft with DRAFT header

### **Test 4: Export**
Click "DOCX" download button

**Expected:** File downloads

---

## 🎨 Visual Elements to Check

### **Colors (Your Brand)**
- Primary blue: `#0284c7` on headers, buttons, links
- White backgrounds with gray cards
- Gradient on Ermi's chat header

### **Layout**
- 2-pane split on desktop
- Stacks vertically on mobile
- Rounded corners on all cards
- Subtle shadows

### **Typography**
- Inter font (clean, modern)
- Good hierarchy (headings vs body)
- Readable sizes

---

## 🐛 If Something's Wrong

### **Port already in use?**
```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill
npm run dev
```

### **"Cannot find module" errors?**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### **Supabase auth not working?**
- Check `.env.local` variables
- Verify Supabase project isn't paused
- Ensure schema was run

### **AI not responding?**
- Check GROQ_API_KEY is valid
- Visit console.groq.com to verify
- Check browser console (F12) for errors

---

## 📸 What to Look For

### **Good Signs:**
✅ Page loads without errors  
✅ Landing page looks professional  
✅ Can create account  
✅ Dashboard shows 2-pane layout  
✅ File upload area is visible  
✅ Chat interface shows Ermi's greeting  
✅ Right pane shows "No Output Yet" placeholder  

### **Things to Test:**
1. Responsive design (resize browser)
2. File upload (drag-and-drop)
3. Chat input (type and send)
4. Ermi's personality (warm phrases)
5. Export buttons appear after generation

---

## 🎯 Success Criteria

After running, you should be able to:
- ✅ Access landing page
- ✅ Create account and sign in
- ✅ See dashboard with 2-pane layout
- ✅ Upload a file
- ✅ Chat with Ermi
- ✅ Generate a document
- ✅ Download as DOCX

---

## 💡 First Impressions Checklist

- [ ] Landing page looks good?
- [ ] Colors match your brand?
- [ ] Dashboard layout feels right?
- [ ] Ermi's greeting is visible?
- [ ] Upload area is clear?
- [ ] Chat interface is intuitive?
- [ ] Document preview looks professional?
- [ ] Footer shows copyright?

---

**Ready to see Ermi in action!** 🎉

Take screenshots of anything you want to change!

