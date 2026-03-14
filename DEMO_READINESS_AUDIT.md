# SmartProBono Demo Readiness Audit

**Date:** March 13, 2025  
**Scope:** Full site and codebase for RWU/RILS demo

---

## 1. User Experience

| Issue | File location | Recommended fix | Severity |
|-------|---------------|----------------|----------|
| Summary page shows raw flag keys (e.g. `urgentCourtDate`, `languageAccess`) instead of human-readable labels | `app/ri/eviction/summary/page.tsx` lines 173–179 | Map `flagsOn` to human-readable labels (e.g. "Urgent court date", "Language access") like the results page does | **Medium** |
| Assistant page lacks "Case summary" link in header; users may not discover printable summary | `app/ri/assistant/page.tsx` header | Add "Case summary" link to header nav for consistency with results page | **Low** |
| "View Case Summary (if started)" CTA may confuse users who haven't started—page shows empty state | `app/page.tsx` line 41 | Consider keeping as-is; empty state handles it. Or shorten to "View Case Summary" | **Low** |
| Results page "upload more at /ri/materials" uses raw path in user-facing text | `app/ri/eviction/results/page.tsx` line 197 | Change to "upload more in Materials" or link text "Materials" | **Low** |
| Homepage has no link back to Results or Summary from hero—user must scroll or use Materials | `app/page.tsx` | No change; flow is clear. Results/Summary reached via intake flow | **Low** |

---

## 2. Content and Credibility

| Issue | File location | Recommended fix | Severity |
|-------|---------------|----------------|----------|
| "Rhode Island materials (demo grounding)"—"demo" visible to partners | `app/ri/materials/page.tsx` line 64 | Change to "Rhode Island materials" or "Rhode Island materials (grounding)" | **Medium** |
| "stored in local demo memory"—"demo" visible | `app/ri/materials/page.tsx` line 80 | Change to "stored in this browser" or "stored locally in this session" | **Medium** |
| "Manually transcribed from the handout for demo grounding"—"demo" visible | `app/ri/eviction/results/page.tsx` line 168 | Change to "Manually transcribed from the handout. Cross-checked with RI Landlord-Tenant Handbook." | **Low** |
| "Manually transcribed for demo. See full details on results page."—"demo" visible | `app/ri/eviction/summary/page.tsx` line 200 | Change to "Manually transcribed from RILS materials. See full details on results page." | **Low** |
| "Prototype note: answers are stored only in this browser for demo purposes" | `app/ri/eviction/intake/page.tsx` line 657 | Change to "Note: answers are stored only in this browser. No account required." | **Low** |
| Intake error: "Please confirm this prototype is not a law firm" | `app/ri/eviction/intake/page.tsx` line 131 | Change to "Please confirm you understand this is not a law firm." | **Low** |
| Layout metadata: "AI-powered intake assistant for small law firms" doesn't match RI eviction focus | `app/layout.tsx` lines 9–12 | Update description to "Rhode Island Eviction Help Desk prototype—informational intake and guidance for tenants" | **Low** |

---

## 3. Technical Stability

| Issue | File location | Recommended fix | Severity |
|-------|---------------|----------------|----------|
| Duplicate `captureEvent('chat_message_sent', ...)` call | `app/dashboard/components/ChatBox.tsx` lines 155–163 | Remove one of the duplicate calls | **Low** |
| Hugging Face fallback uses `'hf_demo_token'`—API will fail if GROQ not set | `pages/api/chat.ts` line 81 | Ensure `AI_PROVIDER=groq` and `GROQ_API_KEY` are set for demo; document in .env.example | **Medium** |
| Build warning: baseline-browser-mapping outdated | `package.json` / npm | Run `npm i baseline-browser-mapping@latest -D` | **Low** |
| ExperimentalWarning: Type Stripping | Node/Next.js | Informational; no fix needed for demo | **Low** |

---

## 4. Demo Readiness

| Issue | File location | Recommended fix | Severity |
|-------|---------------|----------------|----------|
| "prototype" wording is intentional for RWU/RILS—keeps expectations clear | Multiple | Keep "prototype" in titles; it sets appropriate expectations | **N/A** |
| Print layout: Summary uses `print:hidden` for header/buttons; no print-specific styles | `app/ri/eviction/summary/page.tsx` | Add `@media print` in globals.css if needed (e.g. hide bg colors, ensure margins). Current setup likely fine | **Low** |
| Intake storage: localStorage—clears on incognito/clear; no persistence across devices | `lib/ri/storage.ts` | Document for demo: use same browser, don't clear data. "Load sample" helps reset | **Low** |
| `/demo` redirects to `/ri/assistant`—login/glossary still link to `/demo` | `app/login/page.tsx`, `app/glossary/page.tsx` | For RI demo, consider linking to `/ri/assistant` directly. Or keep /demo as alias | **Low** |
| Dashboard uses ChatBox in default `ri_eviction` mode but without intakeContext—different flow | `app/dashboard/page.tsx` | Dashboard is separate from RI flow. For demo, focus on /ri/* routes. No change needed | **N/A** |

---

## 5. AI Behavior Safety

| Issue | File location | Recommended fix | Severity |
|-------|---------------|----------------|----------|
| RI system prompt correctly restricts scope to RI eviction, no legal advice | `lib/prompts/riEvictionPrompt.ts` | No change; prompt is well-scoped | **N/A** |
| Fallback response in chat API includes "Staff review note" disclaimer | `pages/api/chat.ts` lines 233–247 | No change; fallback is safe | **N/A** |
| Assistant page NoticeBox: "Informational guidance only" | `app/ri/assistant/page.tsx` | No change; disclaimer present | **N/A** |
| ChatBox RI initial message: "Legal staff should review your situation" | `app/dashboard/components/ChatBox.tsx` line 33 | No change; disclaimer present | **N/A** |
| RI suggestions are RI-scoped (5-day notice, Eviction Help Desk, lockout) | `app/dashboard/components/ChatBox.tsx` lines 291–313 | No change; suggestions appropriate | **N/A** |

---

## Summary

| Severity | Count |
|----------|-------|
| High | 0 |
| Medium | 3 |
| Low | 14 |

**Recommended priority fixes before demo:**
1. Summary page: human-readable flag labels (Medium)
2. Materials page: remove "demo" from user-facing text (Medium)
3. Chat API: ensure GROQ_API_KEY is set; document in deployment notes (Medium)
4. ChatBox: remove duplicate captureEvent (Low)
5. Results/summary/intake: soften "demo"/"prototype" wording where it weakens credibility (Low)
