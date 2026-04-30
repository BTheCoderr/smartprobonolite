/**
 * Pure-function intent classifier for the Ermi chat path.
 *
 * Deterministic regex rules (first match wins). No LLM, no network. Never persists
 * or returns the raw user text — callers should log only `intent` and
 * `matchedPattern` (the rule name).
 */

export type ChatIntent =
  | 'greeting'
  | 'assistant_capabilities'
  | 'file_review'
  | 'lockout'
  | 'notice_explanation'
  | 'help_desk_prep'
  | 'intake_summary'
  | 'unknown';

export type ClassifyResult = {
  intent: ChatIntent;
  /** Name of the matched rule, or null for `unknown`. Safe to log. */
  matchedPattern: string | null;
};

type Rule = {
  intent: Exclude<ChatIntent, 'unknown' | 'intake_summary'>;
  pattern: RegExp;
  name: string;
};

/**
 * Greeting requires both a tight pattern AND a short overall message,
 * so "hi, my landlord locked me out" does not collapse to a greeting.
 */
const GREETING_PATTERN = /^(hi|hey+|hello+|yo|sup|good\s+(morning|afternoon|evening))[\s.!?]*$/i;
/** Short utterances only — keeps "hi, my landlord…" from matching as a greeting. */
const GREETING_MAX_LEN = 12;

/** Very short "what is this" without housing context — meta only. */
const WHAT_IS_THIS_META =
  /^\s*(what\s+is\s+this|who\s+is\s+this|what\s+are\s+you\s+showing\s+me)\s*[\s?!.]*$/i;

/** Order matters — first match wins. Lockout before capability; capability before help_desk ("help"). */
const RULES: Rule[] = [
  {
    intent: 'lockout',
    name: 'lockout_keywords',
    pattern:
      /\b(lock(ed)?\s*me\s*out|lock(ed)?\s*out|change(d)?\s*(the\s*)?locks?|self[-\s]?help\s*(eviction|lockout)?|illegal\s*eviction|kicked\s*out\s*without|shut\s*off\s*(the\s*)?(power|water|heat|utilities)|utility\s*shut[-\s]?off)\b/i,
  },
  {
    intent: 'assistant_capabilities',
    name: 'capabilities_meta',
    pattern:
      /\b(what\s+can\s+you\s+do|what\s+do\s+you\s+do|how\s+can\s+you\s+help|how\s+do\s+you\s+help|what\s+are\s+you(\s+for)?|who\s+are\s+you|what\s+do\s+you\s+understand|how\s+does\s+this\s+work|tell\s+me\s+about\s+yourself|what\s+are\s+your\s+capabilities)\b/i,
  },
  {
    intent: 'help_desk_prep',
    name: 'help_desk_keywords',
    pattern:
      /\b(eviction\s*help\s*desk|help\s*desk|what\s*(should|do)\s*i\s*bring|prepar(e|ing)\s*for\s*(court|the\s*help\s*desk|the\s*hearing))\b/i,
  },
  {
    intent: 'file_review',
    name: 'file_review_keywords',
    pattern:
      /\b((review|look\s*at|check|read|go\s*over)\s+(my\s+|this\s+|the\s+)?(file|document|notice|paper(s|work)?|lease|letter|attachment|upload)|i\s*(uploaded|have|attached)\s+(a|my|the)\s+(file|document|notice|paper(s|work)?|lease|letter))\b/i,
  },
  {
    intent: 'notice_explanation',
    name: 'notice_keywords',
    pattern:
      /\b(\d+[-\s]?day\s*(notice|demand)?|five[-\s]?day|ten[-\s]?day|thirty[-\s]?day|demand\s*(notice|for\s*(rent|payment))|notice\s*(to\s*(quit|vacate|cure)|of\s*(eviction|nonpayment))|nonpayment\s*notice|eviction\s*notice|what\s*(does|is)\s*(a|an|this)\s*(\d+[-\s]?day|notice|demand)|what\s+a\s+notice|notice\s+from\s+(my\s+)?landlord|landlord'?s?\s+notice|help\s+me\s+explain\s+.{0,40}notice|what[^.?!]{0,40}\bnotice\b[^.?!]{0,55}\bmeans?\b|explain\s+(my\s+|the\s+|this\s+|your\s+|a\s+)?notice|meaning\s+of\s+.{0,30}notice)\b/i,
  },
];

const INTAKE_SUMMARY_PATTERN =
  /\b(my\s+(situation|case|intake)|summari[sz]e\s+(my|what)|review\s+what\s+i\s+told\s+you|what\s+did\s+i\s+(say|tell\s+you))\b/i;

export function classifyIntent(
  rawText: string,
  opts?: { hasIntake?: boolean },
): ClassifyResult {
  const text = (rawText ?? '').trim();
  if (text.length === 0) {
    return { intent: 'unknown', matchedPattern: null };
  }

  if (text.length <= GREETING_MAX_LEN && GREETING_PATTERN.test(text)) {
    return { intent: 'greeting', matchedPattern: 'greeting_short' };
  }

  if (text.length <= 48 && WHAT_IS_THIS_META.test(text)) {
    return { intent: 'assistant_capabilities', matchedPattern: 'capabilities_what_is_this' };
  }

  if (opts?.hasIntake && INTAKE_SUMMARY_PATTERN.test(text)) {
    return { intent: 'intake_summary', matchedPattern: 'intake_summary_keywords' };
  }

  for (const rule of RULES) {
    if (rule.pattern.test(text)) {
      return { intent: rule.intent, matchedPattern: rule.name };
    }
  }

  return { intent: 'unknown', matchedPattern: null };
}
