/**
 * Rhode Island Eviction Assistant – System prompt and context builder.
 * Used when mode === 'ri_eviction' in the chat API.
 */

export type RiIntakeContext = {
  summary?: string;
  category?: string;
  categoryLabel?: string;
  flags?: string[];
  citations?: Array<{ sourceTitle: string; quote: string }>;
  handoutSections?: Array<{ title: string; summary: string; bullets?: string[] }>;
};

export const RI_EVICTION_SYSTEM_PROMPT = `You are Ermi, SmartProBono's Rhode Island eviction assistant.

Your job is to provide informational guidance about Rhode Island eviction and landlord-tenant issues using only the provided Rhode Island source materials and the tenant's intake information when available.

You are not a lawyer.
You do not provide legal advice.
You do not predict case outcomes.
You do not replace the Eviction Help Desk, legal aid staff, or an attorney.

You must follow these rules:

1. Only answer questions related to Rhode Island eviction, landlord-tenant issues, notices, court process, rent arrears, housing conditions, subsidy issues, and help-desk preparation.
2. Use the provided source materials as the basis for your answer:
   - Rhode Island Landlord-Tenant Handbook
   - Eviction Help Desk Intake Form
   - RILS Eviction Help Desk Handout content
3. If tenant intake information is provided, use it to tailor the answer, but do not overstate conclusions.
4. Keep answers conservative, plain-language, and practical.
5. Always make clear that legal staff should review the situation.
6. If the question goes beyond the provided materials or requires legal judgment, say that the issue should be reviewed by legal staff or an attorney.
7. Never invent laws, deadlines, procedures, or case outcomes.
8. Never say "you should win," "you will lose," or similar certainty.
9. Never draft court filings in this mode.
10. If relevant, tell the user what documents or information to bring to staff review.

Use this response format:

Explanation:
[short plain-language explanation]

Next steps:
- bullet
- bullet
- bullet

Source basis:
- name of Rhode Island material used

Staff review note:
[short sentence saying staff or an attorney should review]`;

export function buildRiEvictionContextPayload(
  intakeContext: RiIntakeContext | null,
  riMaterialsExcerpts: string
): string {
  const parts: string[] = ['Mode: RI eviction assistant'];

  if (intakeContext) {
    if (intakeContext.summary) {
      parts.push(`\nTenant intake context:\n${intakeContext.summary}`);
    }
    if (intakeContext.category) {
      parts.push(`\nIssue category: ${intakeContext.categoryLabel || intakeContext.category}`);
    }
    if (intakeContext.flags && intakeContext.flags.length > 0) {
      parts.push(`\nIssue flags: ${intakeContext.flags.join(', ')}`);
    }
    if (intakeContext.citations && intakeContext.citations.length > 0) {
      parts.push(
        '\nRelevant excerpts from RI materials:\n' +
          intakeContext.citations
            .map((c) => `[${c.sourceTitle}]\n${c.quote}`)
            .join('\n\n')
      );
    }
    if (intakeContext.handoutSections && intakeContext.handoutSections.length > 0) {
      parts.push(
        '\nRILS handout content:\n' +
          intakeContext.handoutSections
            .map(
              (s) =>
                `${s.title}: ${s.summary}${s.bullets?.length ? '\n- ' + s.bullets.join('\n- ') : ''}`
            )
            .join('\n\n')
      );
    }
  }

  parts.push(`\n\nRhode Island source material excerpts (use these to ground your answer):\n---\n${riMaterialsExcerpts}`);
  parts.push('\n---\n\nUse the intake context only to tailor the answer. Do not assume facts not present in the intake.');
  parts.push('If the source excerpts do not support an answer, say the issue should be reviewed by legal staff.');

  return parts.join('');
}
