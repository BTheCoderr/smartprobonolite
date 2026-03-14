# RWU/RILS Pre-Demo QA Checklist

**Purpose:** Final verification before demonstrating to RWU and Rhode Island Legal Services.

---

## 1. Flow to Test (in order)

| # | Page | URL | Verify |
|---|------|-----|--------|
| 1 | Landing | `/` | Start Intake, Ask Ermi work |
| 2 | Intake | `/ri/eviction/intake` | Load sample → Review → See results |
| 3 | Results | `/ri/eviction/results` | Guidance, category, flags, citations, **Ask Ermi** CTA |
| 4 | Ermi | `/ri/assistant` | Chat responds; "Using your intake" if intake exists |
| 5 | Summary | `/ri/eviction/summary` | Printable; Print/Save PDF |
| 6 | Redirect | `/demo` | Redirects to `/ri/assistant` |

---

## 2. Ermi Branding Check

- [ ] Chat header: **Ermi** · Rhode Island Eviction Assistant
- [ ] Page title: Ermi – Rhode Island Eviction Assistant
- [ ] CTA buttons: Ask Ermi
- [ ] Disclaimer: "Ermi provides general information... Legal staff or an attorney should review."
- [ ] No legacy broad-assistant wording visible in RI flow

---

## 3. Example Questions for Ermi

- "What does a 5-day eviction notice mean?"
- "What should I bring to the Eviction Help Desk?"
- "Can my landlord lock me out without going to court?"

**Expected format:** Explanation → Next steps → Source basis → Staff review note.

---

## 4. Environment (before demo)

- [ ] `AI_PROVIDER=groq` in `.env.local` (or Netlify)
- [ ] `GROQ_API_KEY` set
- [ ] Fallback responses work if API unavailable (no crash)

---

## 5. Demo Risks

| Risk | Mitigation |
|------|------------|
| API key missing | Fallback responses; test assistant before demo |
| localStorage cleared | Re-run intake or Load sample |
| Print | Test summary Print/Save PDF beforehand |

---

## 6. Quick Test (≈3 min)

1. `/` → **Start Intake** → **Load sample** → **See results**
2. **Ask Ermi** → Ask: "What does a 5-day eviction notice mean?"
3. **View tenant case summary** → **Print** (or Save as PDF)
