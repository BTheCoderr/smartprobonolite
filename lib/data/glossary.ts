export interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
}

export const glossaryTerms: GlossaryTerm[] = [
  // Family Law Terms
  {
    term: 'Custody',
    definition: 'The legal right and responsibility to make decisions about a child\'s upbringing, including where they live, their education, healthcare, and other important matters. Custody can be physical (where the child lives) or legal (decision-making authority).',
    category: 'Family Law',
    relatedTerms: ['Visitation', 'Child Support', 'Parenting Plan']
  },
  {
    term: 'Visitation',
    definition: 'The right of a non-custodial parent to spend time with their child. Visitation schedules can be supervised (with a third party present) or unsupervised, and can vary in frequency and duration.',
    category: 'Family Law',
    relatedTerms: ['Custody', 'Parenting Plan']
  },
  {
    term: 'Child Support',
    definition: 'Financial payments made by one parent to the other to help cover the costs of raising a child. The amount is typically calculated based on both parents\' incomes, the number of children, and custody arrangements.',
    category: 'Family Law',
    relatedTerms: ['Custody', 'Alimony']
  },
  {
    term: 'Alimony',
    definition: 'Also known as spousal support or maintenance, this is financial support paid by one spouse to the other after divorce or separation. It is intended to help the lower-earning spouse maintain a similar standard of living.',
    category: 'Family Law',
    relatedTerms: ['Divorce', 'Child Support']
  },
  {
    term: 'Divorce',
    definition: 'The legal dissolution of a marriage by a court. Divorce involves dividing assets, determining custody of children, and establishing support obligations.',
    category: 'Family Law',
    relatedTerms: ['Alimony', 'Custody', 'Property Division']
  },
  {
    term: 'Parenting Plan',
    definition: 'A written agreement that outlines how parents will share responsibilities for their children after separation or divorce. It includes custody arrangements, visitation schedules, and decision-making authority.',
    category: 'Family Law',
    relatedTerms: ['Custody', 'Visitation']
  },
  {
    term: 'Modification',
    definition: 'A legal request to change an existing court order, such as custody, visitation, or child support. Modifications require showing a significant change in circumstances.',
    category: 'Family Law',
    relatedTerms: ['Custody', 'Child Support']
  },
  {
    term: 'Joint Custody',
    definition: 'A custody arrangement where both parents share decision-making authority and/or physical custody of their children. Can be joint legal custody, joint physical custody, or both.',
    category: 'Family Law',
    relatedTerms: ['Custody', 'Sole Custody', 'Shared Custody']
  },
  {
    term: 'Sole Custody',
    definition: 'A custody arrangement where one parent has exclusive legal and/or physical custody of the child, with the other parent typically having visitation rights.',
    category: 'Family Law',
    relatedTerms: ['Custody', 'Joint Custody', 'Visitation']
  },
  {
    term: 'Physical Custody',
    definition: 'The right to have the child live with you and provide day-to-day care. Physical custody determines where the child primarily resides.',
    category: 'Family Law',
    relatedTerms: ['Custody', 'Legal Custody', 'Residential Custody']
  },
  {
    term: 'Legal Custody',
    definition: 'The right to make important decisions about a child\'s upbringing, including education, healthcare, religion, and other major life decisions.',
    category: 'Family Law',
    relatedTerms: ['Custody', 'Physical Custody', 'Decision-Making']
  },
  {
    term: 'Supervised Visitation',
    definition: 'Visitation that occurs in the presence of a third party (supervisor) to ensure the child\'s safety. Often ordered when there are concerns about a parent\'s ability to care for the child.',
    category: 'Family Law',
    relatedTerms: ['Visitation', 'Custody', 'Child Safety']
  },
  {
    term: 'Unsupervised Visitation',
    definition: 'Visitation that occurs without a third party present. This is the standard arrangement when there are no safety concerns.',
    category: 'Family Law',
    relatedTerms: ['Visitation', 'Custody']
  },
  {
    term: 'Parenting Time',
    definition: 'The schedule that determines when each parent spends time with the child. Also called visitation schedule or time-sharing arrangement.',
    category: 'Family Law',
    relatedTerms: ['Visitation', 'Custody', 'Parenting Plan']
  },
  {
    term: 'Best Interests of the Child',
    definition: 'The legal standard used by courts to make decisions about custody, visitation, and other matters affecting children. Factors include stability, parental fitness, and the child\'s needs.',
    category: 'Family Law',
    relatedTerms: ['Custody', 'Child Welfare']
  },
  {
    term: 'Paternity',
    definition: 'Legal recognition of a man as the father of a child. Establishing paternity creates legal rights and obligations, including child support and custody rights.',
    category: 'Family Law',
    relatedTerms: ['Child Support', 'Custody', 'DNA Testing']
  },
  {
    term: 'Paternity Test',
    definition: 'A genetic test (usually DNA) used to determine whether a man is the biological father of a child. Results are used to establish legal paternity.',
    category: 'Family Law',
    relatedTerms: ['Paternity', 'DNA Testing']
  },
  {
    term: 'Adoption',
    definition: 'The legal process of permanently transferring parental rights and responsibilities from biological parents to adoptive parents, creating a permanent parent-child relationship.',
    category: 'Family Law',
    relatedTerms: ['Custody', 'Termination of Parental Rights']
  },
  {
    term: 'Termination of Parental Rights',
    definition: 'A court order that permanently ends a parent\'s legal relationship with their child. This is a severe action typically taken in cases of abuse, neglect, or abandonment.',
    category: 'Family Law',
    relatedTerms: ['Adoption', 'Child Welfare', 'Custody']
  },
  {
    term: 'Guardianship',
    definition: 'A legal arrangement where a court appoints someone (guardian) to care for a child when parents cannot. Guardianship can be temporary or permanent.',
    category: 'Family Law',
    relatedTerms: ['Custody', 'Child Welfare']
  },
  {
    term: 'Emancipation',
    definition: 'The legal process by which a minor becomes legally independent from their parents before reaching the age of majority, typically 18. Emancipated minors can make their own decisions.',
    category: 'Family Law',
    relatedTerms: ['Minor', 'Legal Independence']
  },
  {
    term: 'Restraining Order',
    definition: 'A court order that prohibits one person from contacting, approaching, or harming another person. In family law, often used in cases of domestic violence.',
    category: 'Family Law',
    relatedTerms: ['Protective Order', 'Domestic Violence', 'Order']
  },
  {
    term: 'Protective Order',
    definition: 'A court order designed to protect a person from harassment, abuse, or threats. Similar to a restraining order but may have different legal requirements.',
    category: 'Family Law',
    relatedTerms: ['Restraining Order', 'Domestic Violence']
  },
  {
    term: 'Domestic Violence',
    definition: 'Abuse or violence committed by one family or household member against another. Includes physical, emotional, sexual, or financial abuse.',
    category: 'Family Law',
    relatedTerms: ['Restraining Order', 'Protective Order', 'Abuse']
  },
  {
    term: 'No-Fault Divorce',
    definition: 'A type of divorce where neither spouse is required to prove that the other did something wrong. Most states allow no-fault divorce based on irreconcilable differences.',
    category: 'Family Law',
    relatedTerms: ['Divorce', 'Fault Divorce']
  },
  {
    term: 'Fault Divorce',
    definition: 'A type of divorce where one spouse must prove the other committed a marital fault, such as adultery, abandonment, or cruelty. Less common than no-fault divorce.',
    category: 'Family Law',
    relatedTerms: ['Divorce', 'No-Fault Divorce']
  },
  {
    term: 'Separation',
    definition: 'When spouses live apart but remain legally married. Can be informal or formal (legal separation), which may involve court orders for support and custody.',
    category: 'Family Law',
    relatedTerms: ['Divorce', 'Legal Separation']
  },
  {
    term: 'Legal Separation',
    definition: 'A court-ordered arrangement where spouses live apart but remain married. The court can issue orders for support, custody, and property division without dissolving the marriage.',
    category: 'Family Law',
    relatedTerms: ['Separation', 'Divorce']
  },
  {
    term: 'Annulment',
    definition: 'A legal declaration that a marriage never legally existed, as opposed to divorce which ends a valid marriage. Grounds include fraud, bigamy, or incapacity.',
    category: 'Family Law',
    relatedTerms: ['Divorce', 'Marriage']
  },
  {
    term: 'Prenuptial Agreement',
    definition: 'A contract signed before marriage that determines how property and assets will be divided in case of divorce. Also called a prenup.',
    category: 'Family Law',
    relatedTerms: ['Divorce', 'Property Division', 'Marital Property']
  },
  {
    term: 'Postnuptial Agreement',
    definition: 'A contract signed after marriage that determines how property and assets will be divided in case of divorce. Similar to a prenuptial agreement but created during marriage.',
    category: 'Family Law',
    relatedTerms: ['Divorce', 'Property Division', 'Prenuptial Agreement']
  },
  {
    term: 'Spousal Support',
    definition: 'Financial payments from one spouse to the other after divorce or separation. Also called alimony or maintenance. Intended to help the lower-earning spouse maintain their standard of living.',
    category: 'Family Law',
    relatedTerms: ['Alimony', 'Maintenance', 'Divorce']
  },
  {
    term: 'Maintenance',
    definition: 'Another term for alimony or spousal support - financial payments made by one spouse to the other after divorce.',
    category: 'Family Law',
    relatedTerms: ['Alimony', 'Spousal Support']
  },
  {
    term: 'Temporary Support',
    definition: 'Financial support ordered by the court during the divorce process, before a final order is issued. Can include temporary child support or spousal support.',
    category: 'Family Law',
    relatedTerms: ['Child Support', 'Alimony', 'Temporary Order']
  },
  {
    term: 'Temporary Order',
    definition: 'A court order issued during a pending case that remains in effect until a final order is issued. Common in divorce cases for custody, support, and property matters.',
    category: 'Family Law',
    relatedTerms: ['Order', 'Temporary Support', 'Hearing']
  },
  {
    term: 'Marital Property',
    definition: 'Assets and debts acquired during the marriage that are subject to division in divorce. Generally includes income, real estate, vehicles, and debts incurred during marriage.',
    category: 'Family Law',
    relatedTerms: ['Property Division', 'Separate Property', 'Divorce']
  },
  {
    term: 'Separate Property',
    definition: 'Assets owned by one spouse before marriage, received as gifts or inheritance, or acquired after separation. Generally not divided in divorce.',
    category: 'Family Law',
    relatedTerms: ['Marital Property', 'Property Division']
  },
  {
    term: 'Equitable Distribution',
    definition: 'A method of dividing marital property in divorce where assets are divided fairly (not necessarily equally) based on factors like each spouse\'s contribution and needs.',
    category: 'Family Law',
    relatedTerms: ['Property Division', 'Marital Property', 'Divorce']
  },
  {
    term: 'Community Property',
    definition: 'A legal system in some states where all property acquired during marriage is considered jointly owned by both spouses and divided equally in divorce.',
    category: 'Family Law',
    relatedTerms: ['Marital Property', 'Property Division']
  },
  {
    term: 'Mediation',
    definition: 'A process where a neutral third party (mediator) helps divorcing spouses reach agreements on issues like custody, support, and property division without going to trial.',
    category: 'Family Law',
    relatedTerms: ['Divorce', 'Settlement', 'Negotiation']
  },
  {
    term: 'Collaborative Divorce',
    definition: 'A divorce process where both spouses and their attorneys agree to work together to reach a settlement without going to court. If it fails, both attorneys must withdraw.',
    category: 'Family Law',
    relatedTerms: ['Divorce', 'Mediation', 'Settlement']
  },
  {
    term: 'Contested Divorce',
    definition: 'A divorce where spouses cannot agree on issues like custody, support, or property division, requiring court intervention and potentially a trial.',
    category: 'Family Law',
    relatedTerms: ['Divorce', 'Uncontested Divorce', 'Trial']
  },
  {
    term: 'Uncontested Divorce',
    definition: 'A divorce where spouses agree on all issues, allowing for a faster, less expensive process without a trial.',
    category: 'Family Law',
    relatedTerms: ['Divorce', 'Contested Divorce', 'Settlement']
  },
  {
    term: 'Grounds for Divorce',
    definition: 'The legal reasons or basis for seeking a divorce. In no-fault states, this is typically "irreconcilable differences" or "irretrievable breakdown of marriage."',
    category: 'Family Law',
    relatedTerms: ['Divorce', 'No-Fault Divorce', 'Fault Divorce']
  },
  {
    term: 'Residency Requirement',
    definition: 'The requirement that one or both spouses must live in a state for a certain period before filing for divorce in that state. Requirements vary by state.',
    category: 'Family Law',
    relatedTerms: ['Divorce', 'Jurisdiction']
  },
  {
    term: 'Waiting Period',
    definition: 'The mandatory time period between filing for divorce and when it can be finalized. Varies by state, typically 30-90 days.',
    category: 'Family Law',
    relatedTerms: ['Divorce', 'Final Decree']
  },
  {
    term: 'Final Decree',
    definition: 'The final court order that officially ends a marriage and resolves all issues including custody, support, and property division.',
    category: 'Family Law',
    relatedTerms: ['Divorce', 'Judgment', 'Order']
  },
  {
    term: 'Child Support Guidelines',
    definition: 'State-specific formulas used to calculate child support amounts based on parents\' incomes, number of children, custody arrangements, and other factors.',
    category: 'Family Law',
    relatedTerms: ['Child Support', 'Income', 'Custody']
  },
  {
    term: 'Income Withholding',
    definition: 'The automatic deduction of child support or alimony payments directly from a parent\'s paycheck. Often ordered to ensure consistent payment.',
    category: 'Family Law',
    relatedTerms: ['Child Support', 'Garnishment', 'Enforcement']
  },
  {
    term: 'Arrears',
    definition: 'Past-due child support or alimony payments that have accumulated over time. The paying parent owes these back payments in addition to current support.',
    category: 'Family Law',
    relatedTerms: ['Child Support', 'Alimony', 'Enforcement']
  },
  {
    term: 'Modification of Support',
    definition: 'A request to change an existing child support or alimony order due to a significant change in circumstances, such as job loss, income increase, or change in custody.',
    category: 'Family Law',
    relatedTerms: ['Child Support', 'Alimony', 'Modification']
  },
  {
    term: 'Enforcement',
    definition: 'Legal actions taken to ensure compliance with court orders, such as collecting unpaid child support or enforcing custody arrangements. Can include wage garnishment or contempt proceedings.',
    category: 'Family Law',
    relatedTerms: ['Child Support', 'Contempt of Court', 'Garnishment']
  },
  {
    term: 'Relocation',
    definition: 'When a custodial parent wants to move with the child to a different location, often requiring court approval and potentially modifying custody or visitation arrangements.',
    category: 'Family Law',
    relatedTerms: ['Custody', 'Modification', 'Visitation']
  },
  {
    term: 'Grandparent Visitation',
    definition: 'The right of grandparents to visit with their grandchildren. Laws vary by state, and grandparents may need to petition the court for visitation rights.',
    category: 'Family Law',
    relatedTerms: ['Visitation', 'Custody', 'Family Rights']
  },
  
  // Court & Legal Process Terms
  {
    term: 'Petition',
    definition: 'A formal written request to a court asking for a specific action or order. For example, a petition for custody modification requests the court to change an existing custody arrangement.',
    category: 'Court Process',
    relatedTerms: ['Motion', 'Complaint']
  },
  {
    term: 'Motion',
    definition: 'A formal request made to a judge during a case asking for a specific action or decision. Motions can request temporary orders, dismissals, or other procedural actions.',
    category: 'Court Process',
    relatedTerms: ['Petition', 'Order']
  },
  {
    term: 'Order',
    definition: 'A written decision or directive issued by a judge that requires a party to do or refrain from doing something. Court orders are legally binding and enforceable.',
    category: 'Court Process',
    relatedTerms: ['Judgment', 'Decree']
  },
  {
    term: 'Hearing',
    definition: 'A court proceeding where parties present arguments and evidence to a judge. Hearings can be for temporary orders, motions, or final decisions.',
    category: 'Court Process',
    relatedTerms: ['Trial', 'Motion']
  },
  {
    term: 'Trial',
    definition: 'A formal court proceeding where evidence is presented, witnesses testify, and a judge or jury makes a final decision on the case.',
    category: 'Court Process',
    relatedTerms: ['Hearing', 'Evidence']
  },
  {
    term: 'Mediation',
    definition: 'A process where a neutral third party (mediator) helps parties reach an agreement without going to trial. Mediation is often required in family law cases before a trial.',
    category: 'Court Process',
    relatedTerms: ['Settlement', 'Arbitration']
  },
  {
    term: 'Settlement',
    definition: 'An agreement reached between parties to resolve a legal dispute without a trial. Settlements are often formalized in a written agreement and approved by the court.',
    category: 'Court Process',
    relatedTerms: ['Mediation', 'Agreement']
  },
  {
    term: 'Affidavit',
    definition: 'A written statement of facts made under oath and signed before a notary public or court officer. Affidavits are used as evidence in court proceedings.',
    category: 'Court Process',
    relatedTerms: ['Evidence', 'Testimony']
  },
  {
    term: 'Service of Process',
    definition: 'The legal delivery of court documents (such as a petition or summons) to notify a party that legal action has been taken against them. Proper service is required for the court to have jurisdiction.',
    category: 'Court Process',
    relatedTerms: ['Summons', 'Petition']
  },
  {
    term: 'Summons',
    definition: 'A legal document that notifies a person that a lawsuit has been filed against them and that they must respond within a certain time period.',
    category: 'Court Process',
    relatedTerms: ['Service of Process', 'Complaint']
  },
  {
    term: 'Complaint',
    definition: 'The initial document filed by a plaintiff that starts a lawsuit. It states the facts of the case, legal claims, and what relief is being sought.',
    category: 'Court Process',
    relatedTerms: ['Petition', 'Plaintiff', 'Lawsuit']
  },
  {
    term: 'Answer',
    definition: 'The defendant\'s formal response to a complaint, admitting or denying the allegations and stating any defenses.',
    category: 'Court Process',
    relatedTerms: ['Complaint', 'Defendant', 'Response']
  },
  {
    term: 'Counterclaim',
    definition: 'A claim made by the defendant against the plaintiff in response to the original complaint. The defendant becomes a plaintiff for the counterclaim.',
    category: 'Court Process',
    relatedTerms: ['Complaint', 'Answer', 'Defendant']
  },
  {
    term: 'Cross-Claim',
    definition: 'A claim made by one defendant against another defendant in the same lawsuit, or by one plaintiff against another plaintiff.',
    category: 'Court Process',
    relatedTerms: ['Counterclaim', 'Defendant']
  },
  {
    term: 'Default Judgment',
    definition: 'A judgment entered against a defendant who fails to respond to a lawsuit or appear in court within the required time period.',
    category: 'Court Process',
    relatedTerms: ['Default', 'Judgment', 'Answer']
  },
  {
    term: 'Ex Parte',
    definition: 'A proceeding or motion where only one party is present. Ex parte orders are typically temporary and require notice to the other party afterward.',
    category: 'Court Process',
    relatedTerms: ['Motion', 'Temporary Order', 'Hearing']
  },
  {
    term: 'Continuance',
    definition: 'A postponement of a court hearing or trial to a later date. Can be requested by either party or ordered by the court.',
    category: 'Court Process',
    relatedTerms: ['Hearing', 'Trial', 'Postponement']
  },
  {
    term: 'Subpoena',
    definition: 'A court order requiring a person to appear in court to testify as a witness or to produce documents or evidence.',
    category: 'Court Process',
    relatedTerms: ['Witness', 'Evidence', 'Testimony']
  },
  {
    term: 'Subpoena Duces Tecum',
    definition: 'A subpoena that requires a person to bring specific documents or records to court.',
    category: 'Court Process',
    relatedTerms: ['Subpoena', 'Evidence', 'Documents']
  },
  {
    term: 'Deposition',
    definition: 'A pre-trial discovery procedure where a witness gives sworn testimony outside of court, typically in an attorney\'s office. The testimony is recorded and can be used at trial.',
    category: 'Court Process',
    relatedTerms: ['Discovery', 'Testimony', 'Witness']
  },
  {
    term: 'Interrogatories',
    definition: 'Written questions sent by one party to another during discovery that must be answered under oath in writing.',
    category: 'Court Process',
    relatedTerms: ['Discovery', 'Questions', 'Evidence']
  },
  {
    term: 'Request for Production',
    definition: 'A discovery request asking the other party to produce specific documents, records, or other evidence for inspection and copying.',
    category: 'Court Process',
    relatedTerms: ['Discovery', 'Documents', 'Evidence']
  },
  {
    term: 'Request for Admissions',
    definition: 'A discovery request asking the other party to admit or deny specific facts or the authenticity of documents. Facts admitted are considered proven.',
    category: 'Court Process',
    relatedTerms: ['Discovery', 'Facts', 'Evidence']
  },
  {
    term: 'Motion to Dismiss',
    definition: 'A request to the court to dismiss a case, typically arguing that the complaint fails to state a valid legal claim or that the court lacks jurisdiction.',
    category: 'Court Process',
    relatedTerms: ['Motion', 'Dismissal', 'Complaint']
  },
  {
    term: 'Motion for Summary Judgment',
    definition: 'A request for the court to decide the case without a trial, arguing that there are no disputed facts and the law clearly favors one party.',
    category: 'Court Process',
    relatedTerms: ['Motion', 'Trial', 'Judgment']
  },
  {
    term: 'Motion to Compel',
    definition: 'A request asking the court to order the other party to comply with discovery requests or answer questions they have refused to answer.',
    category: 'Court Process',
    relatedTerms: ['Motion', 'Discovery', 'Enforcement']
  },
  {
    term: 'Motion for Sanctions',
    definition: 'A request for the court to penalize a party for improper conduct, such as failing to comply with discovery or filing frivolous motions.',
    category: 'Court Process',
    relatedTerms: ['Motion', 'Penalties', 'Contempt']
  },
  {
    term: 'Motion in Limine',
    definition: 'A pre-trial motion asking the court to exclude certain evidence from trial or to limit how evidence can be used.',
    category: 'Court Process',
    relatedTerms: ['Motion', 'Evidence', 'Trial']
  },
  {
    term: 'Objection',
    definition: 'A formal protest made during a hearing or trial when a party believes the other side is violating the rules of evidence or procedure.',
    category: 'Court Process',
    relatedTerms: ['Evidence', 'Trial', 'Hearing']
  },
  {
    term: 'Sustained',
    definition: 'When a judge agrees with an objection and excludes evidence or testimony. The opposite of "overruled."',
    category: 'Court Process',
    relatedTerms: ['Objection', 'Evidence', 'Judge']
  },
  {
    term: 'Overruled',
    definition: 'When a judge disagrees with an objection and allows evidence or testimony to be presented. The opposite of "sustained."',
    category: 'Court Process',
    relatedTerms: ['Objection', 'Evidence', 'Judge']
  },
  {
    term: 'Arbitration',
    definition: 'An alternative dispute resolution process where a neutral third party (arbitrator) hears both sides and makes a binding decision, similar to a private trial.',
    category: 'Court Process',
    relatedTerms: ['Mediation', 'Settlement', 'Alternative Dispute Resolution']
  },
  {
    term: 'Alternative Dispute Resolution',
    definition: 'Methods of resolving disputes outside of court, including mediation, arbitration, and negotiation. Often faster and less expensive than litigation.',
    category: 'Court Process',
    relatedTerms: ['Mediation', 'Arbitration', 'Settlement']
  },
  {
    term: 'Settlement Conference',
    definition: 'A meeting between parties and their attorneys, often with a judge or mediator, to try to reach a settlement before trial.',
    category: 'Court Process',
    relatedTerms: ['Settlement', 'Mediation', 'Negotiation']
  },
  {
    term: 'Pretrial Conference',
    definition: 'A meeting between the judge and attorneys before trial to discuss case management, settlement possibilities, and trial procedures.',
    category: 'Court Process',
    relatedTerms: ['Trial', 'Settlement', 'Case Management']
  },
  {
    term: 'Jury Trial',
    definition: 'A trial where a jury of citizens hears the evidence and decides the facts of the case, while the judge decides legal issues.',
    category: 'Court Process',
    relatedTerms: ['Trial', 'Jury', 'Bench Trial']
  },
  {
    term: 'Bench Trial',
    definition: 'A trial where the judge decides both the facts and the law, without a jury. Also called a court trial.',
    category: 'Court Process',
    relatedTerms: ['Trial', 'Judge', 'Jury Trial']
  },
  {
    term: 'Voir Dire',
    definition: 'The process of questioning potential jurors to determine if they can be fair and impartial. Attorneys can challenge jurors for cause or use peremptory challenges.',
    category: 'Court Process',
    relatedTerms: ['Jury', 'Trial', 'Jury Selection']
  },
  {
    term: 'Opening Statement',
    definition: 'An attorney\'s initial presentation to the jury or judge at the start of trial, outlining what they expect the evidence will show.',
    category: 'Court Process',
    relatedTerms: ['Trial', 'Jury', 'Evidence']
  },
  {
    term: 'Closing Argument',
    definition: 'An attorney\'s final presentation to the jury or judge at the end of trial, summarizing the evidence and arguing why their client should win.',
    category: 'Court Process',
    relatedTerms: ['Trial', 'Jury', 'Evidence']
  },
  {
    term: 'Verdict',
    definition: 'The jury\'s or judge\'s decision on the outcome of a case. In civil cases, determines liability and damages. In criminal cases, determines guilt or innocence.',
    category: 'Court Process',
    relatedTerms: ['Trial', 'Jury', 'Judgment']
  },
  {
    term: 'Burden of Proof',
    definition: 'The obligation to prove the facts of a case. In civil cases, typically "preponderance of the evidence." In criminal cases, "beyond a reasonable doubt."',
    category: 'Court Process',
    relatedTerms: ['Evidence', 'Trial', 'Proof']
  },
  {
    term: 'Preponderance of the Evidence',
    definition: 'The standard of proof in most civil cases, meaning the evidence shows it is more likely than not that something is true (more than 50% likely).',
    category: 'Court Process',
    relatedTerms: ['Burden of Proof', 'Evidence', 'Standard of Proof']
  },
  {
    term: 'Beyond a Reasonable Doubt',
    definition: 'The highest standard of proof, used in criminal cases. Requires that the evidence be so strong that there is no reasonable doubt of guilt.',
    category: 'Court Process',
    relatedTerms: ['Burden of Proof', 'Criminal Case', 'Standard of Proof']
  },
  {
    term: 'Clear and Convincing Evidence',
    definition: 'A standard of proof higher than preponderance but lower than beyond a reasonable doubt. Used in some civil cases like termination of parental rights.',
    category: 'Court Process',
    relatedTerms: ['Burden of Proof', 'Standard of Proof', 'Evidence']
  },
  {
    term: 'Hearsay',
    definition: 'An out-of-court statement offered to prove the truth of what it asserts. Generally not admissible as evidence unless it falls under an exception.',
    category: 'Court Process',
    relatedTerms: ['Evidence', 'Testimony', 'Objection']
  },
  {
    term: 'Expert Witness',
    definition: 'A witness with specialized knowledge, training, or experience who is allowed to give opinions in court to help the judge or jury understand complex issues.',
    category: 'Court Process',
    relatedTerms: ['Witness', 'Testimony', 'Evidence']
  },
  {
    term: 'Lay Witness',
    definition: 'An ordinary witness who testifies about what they personally observed or experienced. Unlike expert witnesses, lay witnesses generally cannot give opinions.',
    category: 'Court Process',
    relatedTerms: ['Witness', 'Testimony', 'Expert Witness']
  },
  {
    term: 'Direct Examination',
    definition: 'The questioning of a witness by the party who called them to testify. Attorneys must ask open-ended questions and cannot lead the witness.',
    category: 'Court Process',
    relatedTerms: ['Witness', 'Testimony', 'Cross-Examination']
  },
  {
    term: 'Cross-Examination',
    definition: 'The questioning of a witness by the opposing party after direct examination. Attorneys can ask leading questions to challenge the witness\'s testimony.',
    category: 'Court Process',
    relatedTerms: ['Witness', 'Testimony', 'Direct Examination']
  },
  {
    term: 'Redirect Examination',
    definition: 'Additional questioning of a witness by the party who called them, after cross-examination, to clarify or rebut points raised during cross-examination.',
    category: 'Court Process',
    relatedTerms: ['Witness', 'Testimony', 'Cross-Examination']
  },
  {
    term: 'Stipulation',
    definition: 'An agreement between parties to accept certain facts as true without requiring proof. Stipulations can simplify and speed up proceedings.',
    category: 'Court Process',
    relatedTerms: ['Agreement', 'Facts', 'Evidence']
  },
  {
    term: 'Court Reporter',
    definition: 'A professional who creates a verbatim transcript of court proceedings, depositions, and other legal proceedings using stenography or voice recording.',
    category: 'Court Process',
    relatedTerms: ['Transcript', 'Trial', 'Deposition']
  },
  {
    term: 'Transcript',
    definition: 'The written record of everything said during a court proceeding, deposition, or hearing. Created by a court reporter.',
    category: 'Court Process',
    relatedTerms: ['Court Reporter', 'Trial', 'Hearing']
  },
  {
    term: 'Stay',
    definition: 'A court order that temporarily stops or suspends a legal proceeding or the enforcement of a judgment. Can be automatic or ordered by the court.',
    category: 'Court Process',
    relatedTerms: ['Order', 'Suspension', 'Appeal']
  },
  {
    term: 'Venue',
    definition: 'The geographic location where a case is heard. Different from jurisdiction, which is about the court\'s authority. Venue determines which specific court location.',
    category: 'Court Process',
    relatedTerms: ['Jurisdiction', 'Court', 'Location']
  },
  
  // Legal Rights & Status Terms
  {
    term: 'Jurisdiction',
    definition: 'The authority of a court to hear and decide a case. Jurisdiction can be based on geographic location, subject matter, or the parties involved.',
    category: 'Legal Rights',
    relatedTerms: ['Venue', 'Court']
  },
  {
    term: 'Statute of Limitations',
    definition: 'The time limit within which a legal action must be filed. Once this time period expires, the right to bring a claim is lost.',
    category: 'Legal Rights',
    relatedTerms: ['Filing', 'Deadline']
  },
  {
    term: 'Pro Se',
    definition: 'Representing oneself in court without an attorney. Also known as "pro per" or "self-represented."',
    category: 'Legal Rights',
    relatedTerms: ['Attorney', 'Legal Aid']
  },
  {
    term: 'Legal Aid',
    definition: 'Free or low-cost legal services provided to people who cannot afford an attorney. Legal aid organizations help with civil matters like family law, housing, and public benefits.',
    category: 'Legal Rights',
    relatedTerms: ['Pro Se', 'Attorney']
  },
  {
    term: 'Contempt of Court',
    definition: 'Failure to comply with a court order, which can result in penalties such as fines or jail time. Contempt can be civil (to enforce compliance) or criminal (to punish disobedience).',
    category: 'Legal Rights',
    relatedTerms: ['Order', 'Enforcement']
  },
  {
    term: 'Due Process',
    definition: 'The constitutional right to fair treatment and procedures in legal proceedings. Requires notice, opportunity to be heard, and fair procedures before the government can deprive someone of life, liberty, or property.',
    category: 'Legal Rights',
    relatedTerms: ['Constitutional Rights', 'Fair Trial']
  },
  {
    term: 'Equal Protection',
    definition: 'The constitutional right to be treated equally under the law, without discrimination based on race, gender, religion, or other protected characteristics.',
    category: 'Legal Rights',
    relatedTerms: ['Constitutional Rights', 'Discrimination']
  },
  {
    term: 'Right to Counsel',
    definition: 'The constitutional right to have an attorney represent you in criminal proceedings. In some civil cases, there may be a right to appointed counsel for indigent parties.',
    category: 'Legal Rights',
    relatedTerms: ['Attorney', 'Criminal Law', 'Legal Aid']
  },
  {
    term: 'Miranda Rights',
    definition: 'Rights that must be read to a person in police custody before questioning, including the right to remain silent and the right to an attorney. Named after the Supreme Court case Miranda v. Arizona.',
    category: 'Legal Rights',
    relatedTerms: ['Criminal Law', 'Right to Counsel', 'Police']
  },
  {
    term: 'Right to Remain Silent',
    definition: 'The constitutional right to refuse to answer questions or provide information that could incriminate you. Part of the Fifth Amendment protection against self-incrimination.',
    category: 'Legal Rights',
    relatedTerms: ['Miranda Rights', 'Fifth Amendment', 'Self-Incrimination']
  },
  {
    term: 'Self-Incrimination',
    definition: 'Making statements that could be used as evidence against you in a criminal case. The Fifth Amendment protects against being forced to incriminate yourself.',
    category: 'Legal Rights',
    relatedTerms: ['Right to Remain Silent', 'Fifth Amendment', 'Criminal Law']
  },
  {
    term: 'Fourth Amendment',
    definition: 'The constitutional right to be free from unreasonable searches and seizures. Generally requires a warrant based on probable cause, with some exceptions.',
    category: 'Legal Rights',
    relatedTerms: ['Search Warrant', 'Privacy', 'Constitutional Rights']
  },
  {
    term: 'Fifth Amendment',
    definition: 'Constitutional protections including the right to remain silent, protection against double jeopardy, and the right to due process. Also includes the takings clause for property.',
    category: 'Legal Rights',
    relatedTerms: ['Right to Remain Silent', 'Due Process', 'Double Jeopardy']
  },
  {
    term: 'Sixth Amendment',
    definition: 'Constitutional rights in criminal cases, including the right to a speedy trial, public trial, jury trial, right to counsel, and right to confront witnesses.',
    category: 'Legal Rights',
    relatedTerms: ['Right to Counsel', 'Jury Trial', 'Speedy Trial']
  },
  {
    term: 'Fourteenth Amendment',
    definition: 'Constitutional amendment that extends due process and equal protection rights to state actions. Also includes the privileges and immunities clause.',
    category: 'Legal Rights',
    relatedTerms: ['Due Process', 'Equal Protection', 'Constitutional Rights']
  },
  {
    term: 'Double Jeopardy',
    definition: 'The constitutional protection against being tried twice for the same crime. Prevents the government from retrying someone after an acquittal or conviction.',
    category: 'Legal Rights',
    relatedTerms: ['Fifth Amendment', 'Criminal Law', 'Acquittal']
  },
  {
    term: 'Speedy Trial',
    definition: 'The constitutional right to a trial without unreasonable delay. Statutes and court rules set specific time limits for bringing cases to trial.',
    category: 'Legal Rights',
    relatedTerms: ['Sixth Amendment', 'Trial', 'Delay']
  },
  {
    term: 'Public Trial',
    definition: 'The constitutional right to have criminal trials open to the public, ensuring transparency and fairness in the justice system.',
    category: 'Legal Rights',
    relatedTerms: ['Sixth Amendment', 'Trial', 'Transparency']
  },
  {
    term: 'Confrontation Clause',
    definition: 'The constitutional right to confront and cross-examine witnesses against you in criminal cases. Part of the Sixth Amendment.',
    category: 'Legal Rights',
    relatedTerms: ['Sixth Amendment', 'Witness', 'Cross-Examination']
  },
  {
    term: 'Search Warrant',
    definition: 'A court order authorizing law enforcement to search a specific location for evidence. Must be based on probable cause and describe what can be searched and seized.',
    category: 'Legal Rights',
    relatedTerms: ['Fourth Amendment', 'Search', 'Probable Cause']
  },
  {
    term: 'Probable Cause',
    definition: 'A reasonable belief that a crime has been committed or that evidence of a crime exists. Required for search warrants, arrest warrants, and some searches.',
    category: 'Legal Rights',
    relatedTerms: ['Search Warrant', 'Arrest', 'Fourth Amendment']
  },
  {
    term: 'Reasonable Suspicion',
    definition: 'A lower standard than probable cause, requiring specific facts that would lead a reasonable person to suspect criminal activity. Allows for brief stops and limited searches.',
    category: 'Legal Rights',
    relatedTerms: ['Probable Cause', 'Search', 'Police']
  },
  {
    term: 'Exclusionary Rule',
    definition: 'A legal rule that evidence obtained in violation of constitutional rights (like an illegal search) cannot be used in court against the defendant.',
    category: 'Legal Rights',
    relatedTerms: ['Fourth Amendment', 'Evidence', 'Search Warrant']
  },
  {
    term: 'Standing',
    definition: 'The legal right to bring a lawsuit or participate in a case. Requires that the person has a sufficient stake in the outcome to have standing.',
    category: 'Legal Rights',
    relatedTerms: ['Lawsuit', 'Plaintiff', 'Jurisdiction']
  },
  {
    term: 'Moot',
    definition: 'A case that no longer presents a live controversy because the issue has been resolved or circumstances have changed. Moot cases are typically dismissed.',
    category: 'Legal Rights',
    relatedTerms: ['Case', 'Dismissal', 'Controversy']
  },
  {
    term: 'Ripeness',
    definition: 'A requirement that a case must be ready for judicial decision, meaning the harm has occurred or is imminent. Courts will not decide hypothetical or premature issues.',
    category: 'Legal Rights',
    relatedTerms: ['Case', 'Standing', 'Jurisdiction']
  },
  {
    term: 'Sovereign Immunity',
    definition: 'The legal doctrine that the government cannot be sued without its consent. Limited by various exceptions and waivers at federal and state levels.',
    category: 'Legal Rights',
    relatedTerms: ['Government', 'Lawsuit', 'Immunity']
  },
  {
    term: 'Qualified Immunity',
    definition: 'A legal doctrine that protects government officials from personal liability for actions taken in their official capacity, unless they violate clearly established rights.',
    category: 'Legal Rights',
    relatedTerms: ['Government', 'Liability', 'Immunity']
  },
  {
    term: 'Civil Rights',
    definition: 'Rights guaranteed by the Constitution and laws, including freedom of speech, religion, equal protection, and due process. Civil rights laws protect against discrimination.',
    category: 'Legal Rights',
    relatedTerms: ['Constitutional Rights', 'Discrimination', 'Equal Protection']
  },
  {
    term: 'Discrimination',
    definition: 'Unfair treatment based on protected characteristics such as race, gender, religion, age, disability, or national origin. Prohibited by various federal and state laws.',
    category: 'Legal Rights',
    relatedTerms: ['Equal Protection', 'Civil Rights', 'Protected Class']
  },
  {
    term: 'Protected Class',
    definition: 'Groups of people protected from discrimination under federal and state laws, including race, color, religion, sex, national origin, age, and disability.',
    category: 'Legal Rights',
    relatedTerms: ['Discrimination', 'Civil Rights', 'Equal Protection']
  },
  {
    term: 'Disability Rights',
    definition: 'Legal protections for people with disabilities, including the Americans with Disabilities Act (ADA), which prohibits discrimination and requires reasonable accommodations.',
    category: 'Legal Rights',
    relatedTerms: ['Discrimination', 'ADA', 'Accommodation']
  },
  {
    term: 'Reasonable Accommodation',
    definition: 'Modifications or adjustments to policies, practices, or environments that allow people with disabilities to have equal access and opportunities.',
    category: 'Legal Rights',
    relatedTerms: ['Disability Rights', 'ADA', 'Employment']
  },
  {
    term: 'Right to Privacy',
    definition: 'The constitutional right to privacy, including protection from unreasonable government intrusion into personal matters, though not explicitly stated in the Constitution.',
    category: 'Legal Rights',
    relatedTerms: ['Privacy', 'Fourth Amendment', 'Constitutional Rights']
  },
  {
    term: 'Freedom of Speech',
    definition: 'The First Amendment right to express opinions and ideas without government censorship, with some limitations for obscenity, defamation, and incitement to violence.',
    category: 'Legal Rights',
    relatedTerms: ['First Amendment', 'Constitutional Rights', 'Expression']
  },
  {
    term: 'Freedom of Religion',
    definition: 'The First Amendment right to practice any religion or no religion, and protection from government establishment of religion.',
    category: 'Legal Rights',
    relatedTerms: ['First Amendment', 'Constitutional Rights', 'Religious Freedom']
  },
  {
    term: 'Right to Assemble',
    definition: 'The First Amendment right to gather peacefully in groups for protests, meetings, or other purposes.',
    category: 'Legal Rights',
    relatedTerms: ['First Amendment', 'Protest', 'Constitutional Rights']
  },
  {
    term: 'Right to Petition',
    definition: 'The First Amendment right to petition the government for redress of grievances, including filing lawsuits and making complaints to government agencies.',
    category: 'Legal Rights',
    relatedTerms: ['First Amendment', 'Government', 'Constitutional Rights']
  },
  {
    term: 'Eminent Domain',
    definition: 'The government\'s power to take private property for public use, with payment of just compensation. The Fifth Amendment requires compensation for takings.',
    category: 'Legal Rights',
    relatedTerms: ['Property', 'Fifth Amendment', 'Government']
  },
  {
    term: 'Just Compensation',
    definition: 'Fair market value payment required when the government takes private property through eminent domain. Must be paid to the property owner.',
    category: 'Legal Rights',
    relatedTerms: ['Eminent Domain', 'Property', 'Fifth Amendment']
  },
  {
    term: 'Right to Vote',
    definition: 'The constitutional right to vote in elections, protected by the Fifteenth, Nineteenth, and Twenty-Sixth Amendments, which prohibit discrimination based on race, gender, and age (18+).',
    category: 'Legal Rights',
    relatedTerms: ['Constitutional Rights', 'Elections', 'Voting Rights']
  },
  {
    term: 'Voting Rights',
    definition: 'Legal protections ensuring the right to vote, including prohibitions on discrimination and requirements for accessible voting procedures.',
    category: 'Legal Rights',
    relatedTerms: ['Right to Vote', 'Elections', 'Civil Rights']
  },
  {
    term: 'Jury Duty',
    definition: 'The civic obligation to serve on a jury when summoned. Citizens are randomly selected and must serve unless excused for hardship or other valid reasons.',
    category: 'Legal Rights',
    relatedTerms: ['Jury', 'Trial', 'Civic Duty']
  },
  {
    term: 'Jury Nullification',
    definition: 'The power of a jury to acquit a defendant even when the evidence shows they violated the law. Juries cannot be punished for their verdicts.',
    category: 'Legal Rights',
    relatedTerms: ['Jury', 'Verdict', 'Acquittal']
  },
  {
    term: 'Right to a Public Defender',
    definition: 'The right of indigent criminal defendants to have a court-appointed attorney at no cost if they cannot afford to hire one.',
    category: 'Legal Rights',
    relatedTerms: ['Right to Counsel', 'Criminal Law', 'Indigent']
  },
  {
    term: 'Indigent',
    definition: 'A person who cannot afford to pay for legal services or court costs. Indigent parties may qualify for court-appointed attorneys or fee waivers.',
    category: 'Legal Rights',
    relatedTerms: ['Legal Aid', 'Public Defender', 'Fee Waiver']
  },
  {
    term: 'Fee Waiver',
    definition: 'A court order allowing a person to proceed with a case without paying filing fees or other court costs, typically granted to indigent parties.',
    category: 'Legal Rights',
    relatedTerms: ['Indigent', 'Court Costs', 'Filing Fee']
  },
  {
    term: 'In Forma Pauperis',
    definition: 'A Latin term meaning "in the manner of a pauper," allowing indigent parties to proceed with lawsuits without paying fees or costs.',
    category: 'Legal Rights',
    relatedTerms: ['Indigent', 'Fee Waiver', 'Pro Se']
  },
  {
    term: 'Access to Courts',
    definition: 'The constitutional right to have meaningful access to the court system, including the right to file lawsuits and have cases heard fairly.',
    category: 'Legal Rights',
    relatedTerms: ['Due Process', 'Court', 'Constitutional Rights']
  },
  {
    term: 'Right to a Fair Trial',
    definition: 'The constitutional guarantee of a fair and impartial trial, including an unbiased judge, fair procedures, and the right to present evidence and witnesses.',
    category: 'Legal Rights',
    relatedTerms: ['Due Process', 'Trial', 'Constitutional Rights']
  },
  {
    term: 'Right to Confront Witnesses',
    definition: 'The Sixth Amendment right to face and cross-examine witnesses who testify against you in criminal cases.',
    category: 'Legal Rights',
    relatedTerms: ['Sixth Amendment', 'Witness', 'Cross-Examination']
  },
  {
    term: 'Right to Compulsory Process',
    definition: 'The Sixth Amendment right to subpoena witnesses to testify on your behalf in criminal cases.',
    category: 'Legal Rights',
    relatedTerms: ['Sixth Amendment', 'Witness', 'Subpoena']
  },
  {
    term: 'Presumption of Innocence',
    definition: 'The fundamental principle that a person is presumed innocent until proven guilty. The burden is on the prosecution to prove guilt beyond a reasonable doubt.',
    category: 'Legal Rights',
    relatedTerms: ['Criminal Law', 'Burden of Proof', 'Beyond a Reasonable Doubt']
  },
  {
    term: 'Right to Bail',
    definition: 'The right to be released from custody before trial by posting bail, unless the person is a flight risk or danger to the community. The Eighth Amendment prohibits excessive bail.',
    category: 'Legal Rights',
    relatedTerms: ['Criminal Law', 'Eighth Amendment', 'Pretrial Release']
  },
  {
    term: 'Cruel and Unusual Punishment',
    definition: 'Punishment that violates the Eighth Amendment prohibition against cruel and unusual punishment. Includes torture and punishments disproportionate to the crime.',
    category: 'Legal Rights',
    relatedTerms: ['Eighth Amendment', 'Punishment', 'Constitutional Rights']
  },
  {
    term: 'Right to Appeal',
    definition: 'The right to ask a higher court to review a lower court\'s decision for legal errors. Not all decisions are appealable, and there are time limits for filing appeals.',
    category: 'Legal Rights',
    relatedTerms: ['Appeal', 'Court', 'Review']
  },
  
  // Property & Financial Terms
  {
    term: 'Property Division',
    definition: 'The process of dividing assets and debts between spouses during divorce. Property can be classified as marital (acquired during marriage) or separate (owned before marriage or inherited).',
    category: 'Property & Finance',
    relatedTerms: ['Divorce', 'Marital Property']
  },
  {
    term: 'Marital Property',
    definition: 'Assets and debts acquired during the marriage that are subject to division in a divorce. This typically includes income, real estate, vehicles, and debts incurred during marriage.',
    category: 'Property & Finance',
    relatedTerms: ['Property Division', 'Separate Property']
  },
  {
    term: 'Separate Property',
    definition: 'Assets owned by one spouse before marriage, received as gifts or inheritance, or acquired after separation. Separate property is generally not divided in divorce.',
    category: 'Property & Finance',
    relatedTerms: ['Marital Property', 'Property Division']
  },
  {
    term: 'Garnishment',
    definition: 'A legal process where money is taken directly from a person\'s wages or bank account to pay debts, such as child support or alimony.',
    category: 'Property & Finance',
    relatedTerms: ['Child Support', 'Enforcement']
  },
  {
    term: 'Wage Garnishment',
    definition: 'A court order requiring an employer to withhold a portion of an employee\'s wages to pay debts, such as child support, alimony, or judgments.',
    category: 'Property & Finance',
    relatedTerms: ['Garnishment', 'Wages', 'Enforcement']
  },
  {
    term: 'Bank Levy',
    definition: 'A legal process where money is seized directly from a bank account to satisfy a debt or judgment. Requires a court order.',
    category: 'Property & Finance',
    relatedTerms: ['Garnishment', 'Debt', 'Enforcement']
  },
  {
    term: 'Asset',
    definition: 'Property or resources owned by a person or entity that have value, including real estate, vehicles, bank accounts, investments, and personal property.',
    category: 'Property & Finance',
    relatedTerms: ['Property', 'Property Division', 'Marital Property']
  },
  {
    term: 'Liability',
    definition: 'A debt or financial obligation owed by a person or entity, including loans, credit card debt, mortgages, and judgments.',
    category: 'Property & Finance',
    relatedTerms: ['Debt', 'Property Division', 'Marital Property']
  },
  {
    term: 'Equity',
    definition: 'The value of property after subtracting debts secured by that property. For example, home equity is the value of the home minus the mortgage balance.',
    category: 'Property & Finance',
    relatedTerms: ['Property', 'Mortgage', 'Asset']
  },
  {
    term: 'Appraisal',
    definition: 'A professional assessment of the value of property, typically real estate, performed by a licensed appraiser. Used in property division and sales.',
    category: 'Property & Finance',
    relatedTerms: ['Property', 'Value', 'Real Estate']
  },
  {
    term: 'Fair Market Value',
    definition: 'The price that property would sell for on the open market between a willing buyer and willing seller, both with reasonable knowledge of the facts.',
    category: 'Property & Finance',
    relatedTerms: ['Value', 'Property', 'Appraisal']
  },
  {
    term: 'Real Property',
    definition: 'Land and anything permanently attached to it, such as buildings, trees, and fixtures. Also called real estate.',
    category: 'Property & Finance',
    relatedTerms: ['Property', 'Real Estate', 'Land']
  },
  {
    term: 'Personal Property',
    definition: 'Movable property that is not real estate, including vehicles, furniture, electronics, jewelry, and other personal belongings.',
    category: 'Property & Finance',
    relatedTerms: ['Property', 'Asset', 'Property Division']
  },
  {
    term: 'Intangible Property',
    definition: 'Property that has value but no physical form, such as stocks, bonds, intellectual property, business interests, and retirement accounts.',
    category: 'Property & Finance',
    relatedTerms: ['Property', 'Asset', 'Property Division']
  },
  {
    term: 'Retirement Account',
    definition: 'Tax-advantaged savings accounts for retirement, such as 401(k)s, IRAs, and pensions. These accounts are often subject to division in divorce.',
    category: 'Property & Finance',
    relatedTerms: ['Property Division', 'Asset', 'QDRO']
  },
  {
    term: 'QDRO',
    definition: 'Qualified Domestic Relations Order - a court order that divides retirement accounts between spouses in divorce, allowing tax-free transfers.',
    category: 'Property & Finance',
    relatedTerms: ['Retirement Account', 'Property Division', 'Divorce']
  },
  {
    term: 'Pension',
    definition: 'A retirement plan that provides regular payments to employees after retirement. Pensions are often marital property subject to division in divorce.',
    category: 'Property & Finance',
    relatedTerms: ['Retirement Account', 'Property Division', 'QDRO']
  },
  {
    term: '401(k)',
    definition: 'A tax-advantaged retirement savings plan offered by employers. Contributions are made pre-tax, and accounts are often divided in divorce.',
    category: 'Property & Finance',
    relatedTerms: ['Retirement Account', 'Property Division', 'QDRO']
  },
  {
    term: 'IRA',
    definition: 'Individual Retirement Account - a tax-advantaged retirement savings account. Traditional IRAs use pre-tax money; Roth IRAs use after-tax money.',
    category: 'Property & Finance',
    relatedTerms: ['Retirement Account', 'Property Division', '401(k)']
  },
  {
    term: 'Stock Options',
    definition: 'The right to buy company stock at a set price. Stock options earned during marriage are often marital property subject to division.',
    category: 'Property & Finance',
    relatedTerms: ['Asset', 'Property Division', 'Marital Property']
  },
  {
    term: 'Business Interest',
    definition: 'Ownership stake in a business, such as shares in a corporation or membership in an LLC. Business interests acquired during marriage are often marital property.',
    category: 'Property & Finance',
    relatedTerms: ['Asset', 'Property Division', 'Marital Property']
  },
  {
    term: 'Valuation',
    definition: 'The process of determining the value of property or assets, often requiring expert appraisers or accountants, especially for businesses or complex assets.',
    category: 'Property & Finance',
    relatedTerms: ['Value', 'Appraisal', 'Asset']
  },
  {
    term: 'Hidden Assets',
    definition: 'Assets that one spouse attempts to conceal during divorce proceedings to avoid including them in property division. Hiding assets is illegal and can result in penalties.',
    category: 'Property & Finance',
    relatedTerms: ['Asset', 'Property Division', 'Discovery']
  },
  {
    term: 'Dissipation',
    definition: 'The wasteful or improper spending of marital assets, often done intentionally before or during divorce to reduce the amount available for property division.',
    category: 'Property & Finance',
    relatedTerms: ['Marital Property', 'Property Division', 'Waste']
  },
  {
    term: 'Waste',
    definition: 'The destruction, damage, or improper use of property, often referring to one spouse\'s improper use of marital assets during divorce proceedings.',
    category: 'Property & Finance',
    relatedTerms: ['Dissipation', 'Marital Property', 'Property Division']
  },
  {
    term: 'Commingling',
    definition: 'Mixing separate property with marital property, which can convert separate property into marital property subject to division in divorce.',
    category: 'Property & Finance',
    relatedTerms: ['Separate Property', 'Marital Property', 'Property Division']
  },
  {
    term: 'Transmutation',
    definition: 'The conversion of separate property into marital property, or vice versa, through agreement or commingling of assets.',
    category: 'Property & Finance',
    relatedTerms: ['Separate Property', 'Marital Property', 'Commingling']
  },
  {
    term: 'Inheritance',
    definition: 'Property received from a deceased person\'s estate. Inheritances are typically separate property not subject to division in divorce, unless commingled.',
    category: 'Property & Finance',
    relatedTerms: ['Separate Property', 'Estate', 'Property Division']
  },
  {
    term: 'Gift',
    definition: 'Property received as a gift, typically considered separate property not subject to division in divorce, unless given to both spouses or commingled.',
    category: 'Property & Finance',
    relatedTerms: ['Separate Property', 'Property Division']
  },
  {
    term: 'Debt Division',
    definition: 'The process of allocating marital debts between spouses in divorce. Debts incurred during marriage are typically divided, while pre-marital debts usually remain with the debtor.',
    category: 'Property & Finance',
    relatedTerms: ['Debt', 'Property Division', 'Marital Property']
  },
  {
    term: 'Marital Debt',
    definition: 'Debts incurred during the marriage that are subject to division in divorce. Both spouses may be responsible for marital debts regardless of who incurred them.',
    category: 'Property & Finance',
    relatedTerms: ['Debt', 'Property Division', 'Marital Property']
  },
  {
    term: 'Separate Debt',
    definition: 'Debts incurred before marriage or after separation that are typically not divided in divorce and remain the responsibility of the spouse who incurred them.',
    category: 'Property & Finance',
    relatedTerms: ['Debt', 'Separate Property', 'Property Division']
  },
  {
    term: 'Mortgage',
    definition: 'A loan secured by real estate, where the property serves as collateral. Mortgages are often the largest marital debt and must be addressed in divorce.',
    category: 'Property & Finance',
    relatedTerms: ['Debt', 'Real Property', 'Property Division']
  },
  {
    term: 'Refinancing',
    definition: 'The process of replacing an existing loan with a new loan, often to get better terms or remove one spouse from a joint mortgage in divorce.',
    category: 'Property & Finance',
    relatedTerms: ['Mortgage', 'Debt', 'Property Division']
  },
  {
    term: 'Buyout',
    definition: 'When one spouse buys out the other spouse\'s interest in property, typically the marital home, by paying them their share of the equity.',
    category: 'Property & Finance',
    relatedTerms: ['Property Division', 'Real Property', 'Equity']
  },
  {
    term: 'Sale of Property',
    definition: 'Selling marital property, often the family home, and dividing the proceeds between spouses. Common when neither spouse can afford to keep the property.',
    category: 'Property & Finance',
    relatedTerms: ['Property Division', 'Real Property', 'Equity']
  },
  {
    term: 'Tax Consequences',
    definition: 'The tax implications of property division and support payments in divorce. Property transfers between spouses are typically tax-free, but support payments may have tax consequences.',
    category: 'Property & Finance',
    relatedTerms: ['Property Division', 'Alimony', 'Taxes']
  },
  {
    term: 'Capital Gains Tax',
    definition: 'Tax on the profit from selling property. When marital property is sold, capital gains tax may apply, affecting the net proceeds available for division.',
    category: 'Property & Finance',
    relatedTerms: ['Tax Consequences', 'Property Sale', 'Taxes']
  },
  {
    term: 'Tax Deduction',
    definition: 'An expense that reduces taxable income. In divorce, child support is not deductible, but alimony payments may be deductible by the payer and taxable to the recipient.',
    category: 'Property & Finance',
    relatedTerms: ['Tax Consequences', 'Alimony', 'Child Support']
  },
  {
    term: 'Income',
    definition: 'Money received from employment, investments, business, or other sources. Income is used to calculate child support and alimony amounts.',
    category: 'Property & Finance',
    relatedTerms: ['Child Support', 'Alimony', 'Wages']
  },
  {
    term: 'Gross Income',
    definition: 'Total income before deductions, including wages, bonuses, commissions, business income, investment income, and other sources. Used in child support calculations.',
    category: 'Property & Finance',
    relatedTerms: ['Income', 'Child Support', 'Net Income']
  },
  {
    term: 'Net Income',
    definition: 'Income after deductions such as taxes, Social Security, and health insurance. Some states use net income for child support calculations.',
    category: 'Property & Finance',
    relatedTerms: ['Income', 'Gross Income', 'Child Support']
  },
  {
    term: 'Imputed Income',
    definition: 'Income attributed to a person who is unemployed or underemployed, based on their earning capacity rather than actual earnings. Used in child support calculations.',
    category: 'Property & Finance',
    relatedTerms: ['Income', 'Child Support', 'Earning Capacity']
  },
  {
    term: 'Earning Capacity',
    definition: 'The amount a person is capable of earning based on their education, skills, work history, and job market conditions. Used to calculate imputed income.',
    category: 'Property & Finance',
    relatedTerms: ['Imputed Income', 'Child Support', 'Income']
  },
  {
    term: 'Overtime',
    definition: 'Hours worked beyond the standard workweek, typically paid at a higher rate. Overtime income may or may not be included in child support calculations, depending on state law.',
    category: 'Property & Finance',
    relatedTerms: ['Income', 'Wages', 'Child Support']
  },
  {
    term: 'Bonus',
    definition: 'Additional compensation beyond regular salary, such as year-end bonuses or performance bonuses. May be included in income calculations for support.',
    category: 'Property & Finance',
    relatedTerms: ['Income', 'Wages', 'Child Support']
  },
  {
    term: 'Commission',
    definition: 'Payment based on sales or performance, often variable. Commission income may be averaged or calculated differently for support purposes.',
    category: 'Property & Finance',
    relatedTerms: ['Income', 'Wages', 'Child Support']
  },
  {
    term: 'Self-Employment Income',
    definition: 'Income from operating a business or working as an independent contractor. Self-employment income can be more complex to calculate for support purposes.',
    category: 'Property & Finance',
    relatedTerms: ['Income', 'Business', 'Child Support']
  },
  {
    term: 'Business Expenses',
    definition: 'Costs of operating a business that can be deducted from income. Legitimate business expenses reduce income for support calculations, but personal expenses disguised as business expenses do not.',
    category: 'Property & Finance',
    relatedTerms: ['Income', 'Business', 'Self-Employment Income']
  },
  {
    term: 'Financial Disclosure',
    definition: 'The requirement to provide complete and accurate information about income, assets, and debts during divorce proceedings. Failure to disclose can result in penalties.',
    category: 'Property & Finance',
    relatedTerms: ['Discovery', 'Income', 'Asset']
  },
  {
    term: 'Financial Affidavit',
    definition: 'A sworn statement detailing income, expenses, assets, and debts. Required in many divorce cases to determine support and property division.',
    category: 'Property & Finance',
    relatedTerms: ['Financial Disclosure', 'Income', 'Asset']
  },
  {
    term: 'Bank Statement',
    definition: 'A record of transactions in a bank account, showing deposits, withdrawals, and balances. Used as evidence of income and expenses in divorce cases.',
    category: 'Property & Finance',
    relatedTerms: ['Financial Disclosure', 'Income', 'Asset']
  },
  {
    term: 'Tax Return',
    definition: 'Annual tax filing showing income, deductions, and tax liability. Tax returns are commonly used as evidence of income in support and property division cases.',
    category: 'Property & Finance',
    relatedTerms: ['Financial Disclosure', 'Income', 'Taxes']
  },
  {
    term: 'W-2',
    definition: 'A tax form showing wages and taxes withheld for the year. Used as evidence of employment income in support calculations.',
    category: 'Property & Finance',
    relatedTerms: ['Income', 'Tax Return', 'Wages']
  },
  {
    term: '1099',
    definition: 'A tax form showing income from sources other than employment, such as self-employment, interest, dividends, or contract work. Used to document various types of income.',
    category: 'Property & Finance',
    relatedTerms: ['Income', 'Tax Return', 'Self-Employment Income']
  },
  {
    term: 'Pay Stub',
    definition: 'A document showing earnings and deductions for a specific pay period. Used to verify current income and calculate support amounts.',
    category: 'Property & Finance',
    relatedTerms: ['Income', 'Wages', 'Child Support']
  },
  {
    term: 'Credit Report',
    definition: 'A record of a person\'s credit history, including debts, payment history, and credit score. May be relevant in property division and debt allocation.',
    category: 'Property & Finance',
    relatedTerms: ['Debt', 'Credit', 'Financial Disclosure']
  },
  {
    term: 'Credit Score',
    definition: 'A numerical rating of creditworthiness based on credit history. Can be affected by divorce, especially when joint accounts are closed or debts are divided.',
    category: 'Property & Finance',
    relatedTerms: ['Credit Report', 'Debt', 'Credit']
  },
  {
    term: 'Joint Account',
    definition: 'A bank account, credit card, or loan held by both spouses. Both parties are responsible for joint debts, and both have access to joint accounts.',
    category: 'Property & Finance',
    relatedTerms: ['Debt', 'Marital Property', 'Property Division']
  },
  {
    term: 'Separate Account',
    definition: 'A bank account or credit card held in only one spouse\'s name. Separate accounts may still be marital property if funded with marital income.',
    category: 'Property & Finance',
    relatedTerms: ['Asset', 'Marital Property', 'Property Division']
  },
  {
    term: 'Spousal Support Modification',
    definition: 'A request to change an existing alimony order due to a significant change in circumstances, such as job loss, remarriage, or income changes.',
    category: 'Property & Finance',
    relatedTerms: ['Alimony', 'Modification', 'Spousal Support']
  },
  {
    term: 'Termination of Support',
    definition: 'The ending of alimony or spousal support obligations, which may occur upon remarriage of the recipient, death of either party, or expiration of the support period.',
    category: 'Property & Finance',
    relatedTerms: ['Alimony', 'Spousal Support', 'Termination']
  },
  
  // Evidence & Documentation Terms
  {
    term: 'Evidence',
    definition: 'Information presented in court to prove or disprove facts in a case. Evidence can include documents, witness testimony, physical objects, or expert opinions.',
    category: 'Evidence',
    relatedTerms: ['Testimony', 'Affidavit', 'Exhibit']
  },
  {
    term: 'Testimony',
    definition: 'Oral or written statements made by witnesses under oath in court proceedings. Testimony is a form of evidence used to establish facts.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Witness', 'Affidavit']
  },
  {
    term: 'Exhibit',
    definition: 'A document or object formally introduced as evidence in a court proceeding. Exhibits are typically numbered and marked for identification.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Document']
  },
  {
    term: 'Documentary Evidence',
    definition: 'Written or printed materials used as evidence, including contracts, letters, emails, text messages, medical records, and financial documents.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Document', 'Exhibit']
  },
  {
    term: 'Physical Evidence',
    definition: 'Tangible objects used as evidence, such as weapons, clothing, photographs, or other items relevant to the case.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Exhibit', 'Object']
  },
  {
    term: 'Demonstrative Evidence',
    definition: 'Visual aids used to help explain evidence, such as charts, diagrams, models, or reconstructions. Not actual evidence but helps illustrate facts.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Visual Aid', 'Trial']
  },
  {
    term: 'Circumstantial Evidence',
    definition: 'Indirect evidence that suggests a fact but does not directly prove it. Requires inference to connect the evidence to the conclusion.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Direct Evidence', 'Inference']
  },
  {
    term: 'Direct Evidence',
    definition: 'Evidence that directly proves a fact without requiring inference, such as eyewitness testimony that the defendant committed the act.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Circumstantial Evidence', 'Testimony']
  },
  {
    term: 'Character Evidence',
    definition: 'Evidence about a person\'s character or reputation. Generally not admissible to prove conduct, but may be admissible in certain circumstances.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Reputation', 'Admissibility']
  },
  {
    term: 'Habit Evidence',
    definition: 'Evidence of a person\'s regular response to a specific situation. More reliable than character evidence and may be admissible to show conduct.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Character Evidence', 'Conduct']
  },
  {
    term: 'Prior Bad Acts',
    definition: 'Evidence of other crimes, wrongs, or acts. Generally not admissible to prove character, but may be admissible for other purposes like motive or intent.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Character Evidence', 'Admissibility']
  },
  {
    term: 'Relevance',
    definition: 'Evidence is relevant if it has any tendency to make a fact more or less probable than it would be without the evidence. Only relevant evidence is admissible.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Admissibility', 'Probative Value']
  },
  {
    term: 'Probative Value',
    definition: 'The extent to which evidence helps prove or disprove a fact in dispute. Evidence must have probative value to be admissible.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Relevance', 'Admissibility']
  },
  {
    term: 'Prejudicial Effect',
    definition: 'The risk that evidence will unfairly influence the jury or judge, even if it is relevant. Evidence may be excluded if its prejudicial effect outweighs its probative value.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Admissibility', 'Probative Value']
  },
  {
    term: 'Admissibility',
    definition: 'Whether evidence can be introduced in court. Evidence must be relevant, not hearsay (or fall under an exception), and not violate other rules of evidence.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Relevance', 'Hearsay']
  },
  {
    term: 'Authentication',
    definition: 'The process of proving that evidence is what it claims to be. Documents, objects, and other evidence must be authenticated before being admitted.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Document', 'Exhibit']
  },
  {
    term: 'Chain of Custody',
    definition: 'The documented trail showing who had possession of evidence from the time it was collected until it is presented in court. Required to prove evidence was not tampered with.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Physical Evidence', 'Authentication']
  },
  {
    term: 'Best Evidence Rule',
    definition: 'A rule requiring that the original document be produced as evidence, rather than a copy, unless the original is unavailable or there is a valid reason to use a copy.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Document', 'Original']
  },
  {
    term: 'Original',
    definition: 'The first or primary version of a document. The best evidence rule generally requires originals, but copies may be admissible in certain circumstances.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Document', 'Best Evidence Rule']
  },
  {
    term: 'Duplicate',
    definition: 'A copy of an original document. Duplicates are generally admissible if they accurately reproduce the original.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Document', 'Original']
  },
  {
    term: 'Privilege',
    definition: 'A legal right to refuse to disclose certain information or communications, such as attorney-client privilege, doctor-patient privilege, or spousal privilege.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Confidentiality', 'Attorney-Client Privilege']
  },
  {
    term: 'Attorney-Client Privilege',
    definition: 'The right to keep communications between an attorney and client confidential. Prevents disclosure of these communications in court.',
    category: 'Evidence',
    relatedTerms: ['Privilege', 'Attorney', 'Confidentiality']
  },
  {
    term: 'Doctor-Patient Privilege',
    definition: 'The right to keep communications between a doctor and patient confidential. Protects medical information from disclosure in court.',
    category: 'Evidence',
    relatedTerms: ['Privilege', 'Medical Records', 'Confidentiality']
  },
  {
    term: 'Spousal Privilege',
    definition: 'The right of spouses to refuse to testify against each other or to keep marital communications confidential. Varies by state and type of case.',
    category: 'Evidence',
    relatedTerms: ['Privilege', 'Spouse', 'Testimony']
  },
  {
    term: 'Work Product',
    definition: 'Materials prepared by an attorney in anticipation of litigation, such as notes, memos, or strategy documents. Generally protected from discovery.',
    category: 'Evidence',
    relatedTerms: ['Privilege', 'Attorney', 'Discovery']
  },
  {
    term: 'Confidentiality',
    definition: 'The protection of private information from disclosure. Various privileges and rules protect confidential communications and information.',
    category: 'Evidence',
    relatedTerms: ['Privilege', 'Privacy', 'Disclosure']
  },
  {
    term: 'Hearsay Exception',
    definition: 'Circumstances where hearsay evidence is admissible despite the general rule against hearsay. Common exceptions include excited utterances, business records, and dying declarations.',
    category: 'Evidence',
    relatedTerms: ['Hearsay', 'Evidence', 'Admissibility']
  },
  {
    term: 'Excited Utterance',
    definition: 'A hearsay exception for statements made under the stress of a startling event. Considered reliable because people are unlikely to lie when excited or shocked.',
    category: 'Evidence',
    relatedTerms: ['Hearsay', 'Hearsay Exception', 'Statement']
  },
  {
    term: 'Business Records Exception',
    definition: 'A hearsay exception allowing business records to be admitted as evidence if they are kept in the regular course of business and are reliable.',
    category: 'Evidence',
    relatedTerms: ['Hearsay', 'Hearsay Exception', 'Document']
  },
  {
    term: 'Present Sense Impression',
    definition: 'A hearsay exception for statements describing an event made while or immediately after the person perceived it. Considered reliable due to immediacy.',
    category: 'Evidence',
    relatedTerms: ['Hearsay', 'Hearsay Exception', 'Statement']
  },
  {
    term: 'Dying Declaration',
    definition: 'A hearsay exception for statements made by a person who believes they are about to die, regarding the cause or circumstances of their death.',
    category: 'Evidence',
    relatedTerms: ['Hearsay', 'Hearsay Exception', 'Statement']
  },
  {
    term: 'Statement Against Interest',
    definition: 'A hearsay exception for statements that are against the speaker\'s interest, such as admissions of wrongdoing. Considered reliable because people don\'t usually make false statements against their own interest.',
    category: 'Evidence',
    relatedTerms: ['Hearsay', 'Hearsay Exception', 'Admission']
  },
  {
    term: 'Admission',
    definition: 'A statement by a party that can be used against them as evidence. Admissions are not considered hearsay and are always admissible.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Statement', 'Hearsay']
  },
  {
    term: 'Confession',
    definition: 'An admission of guilt, typically in a criminal case. Confessions must be voluntary and obtained without coercion to be admissible.',
    category: 'Evidence',
    relatedTerms: ['Admission', 'Criminal Law', 'Guilt']
  },
  {
    term: 'Coercion',
    definition: 'The use of force, threats, or pressure to obtain a statement or confession. Coerced statements are not admissible as evidence.',
    category: 'Evidence',
    relatedTerms: ['Confession', 'Voluntary', 'Police']
  },
  {
    term: 'Voluntary',
    definition: 'A statement or confession made freely, without coercion, threats, or promises. Only voluntary statements are admissible as evidence.',
    category: 'Evidence',
    relatedTerms: ['Confession', 'Coercion', 'Admission']
  },
  {
    term: 'Miranda Warning',
    definition: 'Rights that must be read to a person in custody before questioning, including the right to remain silent and the right to an attorney. Failure to give Miranda warnings can make statements inadmissible.',
    category: 'Evidence',
    relatedTerms: ['Confession', 'Miranda Rights', 'Police']
  },
  {
    term: 'Suppression',
    definition: 'The exclusion of evidence from trial, typically because it was obtained illegally or in violation of constitutional rights. Evidence can be suppressed by motion.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Exclusionary Rule', 'Motion']
  },
  {
    term: 'Motion to Suppress',
    definition: 'A request to exclude evidence from trial, typically arguing that it was obtained illegally or in violation of constitutional rights.',
    category: 'Evidence',
    relatedTerms: ['Suppression', 'Evidence', 'Motion']
  },
  {
    term: 'Fruit of the Poisonous Tree',
    definition: 'A legal doctrine that evidence obtained as a result of illegal police conduct is also inadmissible, even if the evidence itself was obtained legally.',
    category: 'Evidence',
    relatedTerms: ['Exclusionary Rule', 'Suppression', 'Illegal Search']
  },
  {
    term: 'Independent Source',
    definition: 'An exception to the exclusionary rule where evidence is admissible if it was obtained from a source independent of the illegal conduct.',
    category: 'Evidence',
    relatedTerms: ['Exclusionary Rule', 'Suppression', 'Evidence']
  },
  {
    term: 'Inevitable Discovery',
    definition: 'An exception to the exclusionary rule where illegally obtained evidence is admissible if it would have been discovered legally anyway through normal investigation.',
    category: 'Evidence',
    relatedTerms: ['Exclusionary Rule', 'Suppression', 'Evidence']
  },
  {
    term: 'Expert Testimony',
    definition: 'Testimony by an expert witness who has specialized knowledge and can give opinions to help the judge or jury understand complex issues.',
    category: 'Evidence',
    relatedTerms: ['Expert Witness', 'Testimony', 'Opinion']
  },
  {
    term: 'Lay Opinion',
    definition: 'An opinion given by a non-expert witness, limited to opinions based on personal observation that are helpful to understanding the testimony.',
    category: 'Evidence',
    relatedTerms: ['Testimony', 'Witness', 'Expert Testimony']
  },
  {
    term: 'Scientific Evidence',
    definition: 'Evidence based on scientific methods, such as DNA testing, fingerprint analysis, or medical tests. Must meet reliability standards to be admissible.',
    category: 'Evidence',
    relatedTerms: ['Expert Testimony', 'DNA', 'Forensic']
  },
  {
    term: 'DNA Evidence',
    definition: 'Genetic evidence used to identify individuals or establish relationships. DNA testing is highly reliable and commonly used in criminal and paternity cases.',
    category: 'Evidence',
    relatedTerms: ['Scientific Evidence', 'Paternity', 'Forensic']
  },
  {
    term: 'Fingerprint Evidence',
    definition: 'Evidence based on fingerprint analysis to identify individuals. Fingerprints are unique and can link a person to a location or object.',
    category: 'Evidence',
    relatedTerms: ['Scientific Evidence', 'Forensic', 'Identification']
  },
  {
    term: 'Forensic Evidence',
    definition: 'Scientific evidence collected and analyzed using scientific methods, such as DNA, fingerprints, ballistics, or toxicology. Used to establish facts in legal cases.',
    category: 'Evidence',
    relatedTerms: ['Scientific Evidence', 'Forensic', 'Expert Testimony']
  },
  {
    term: 'Medical Records',
    definition: 'Documents containing medical information about a patient, including diagnoses, treatments, and test results. May be admissible as business records or with proper authentication.',
    category: 'Evidence',
    relatedTerms: ['Document', 'Business Records Exception', 'Health']
  },
  {
    term: 'Photograph',
    definition: 'Visual evidence in the form of photographs. Photographs must be authenticated and relevant to be admissible as evidence.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Visual', 'Exhibit']
  },
  {
    term: 'Video Evidence',
    definition: 'Video recordings used as evidence, such as surveillance footage or body camera videos. Must be authenticated and shown to be unaltered.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Visual', 'Recording']
  },
  {
    term: 'Audio Recording',
    definition: 'Sound recordings used as evidence, such as phone calls or conversations. Must be authenticated and may require consent depending on state wiretapping laws.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Recording', 'Authentication']
  },
  {
    term: 'Text Message',
    definition: 'Electronic messages sent via text that may be used as evidence. Text messages are generally admissible if authenticated and relevant.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Document', 'Electronic']
  },
  {
    term: 'Email',
    definition: 'Electronic mail messages that may be used as evidence. Emails are generally admissible if authenticated and relevant, similar to other documents.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Document', 'Electronic']
  },
  {
    term: 'Social Media Evidence',
    definition: 'Content from social media platforms used as evidence, such as posts, photos, or messages. Must be authenticated and relevant to be admissible.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Electronic', 'Document']
  },
  {
    term: 'Presumption',
    definition: 'A legal inference that a fact is true unless proven otherwise. Some presumptions are rebuttable (can be overcome), while others are conclusive.',
    category: 'Evidence',
    relatedTerms: ['Inference', 'Burden of Proof', 'Fact']
  },
  {
    term: 'Rebuttable Presumption',
    definition: 'A presumption that can be overcome by evidence to the contrary. The party against whom the presumption operates can present evidence to rebut it.',
    category: 'Evidence',
    relatedTerms: ['Presumption', 'Evidence', 'Burden of Proof']
  },
  {
    term: 'Conclusive Presumption',
    definition: 'A presumption that cannot be rebutted by evidence. The fact is considered conclusively proven once the basic facts are established.',
    category: 'Evidence',
    relatedTerms: ['Presumption', 'Fact', 'Evidence']
  },
  {
    term: 'Judicial Notice',
    definition: 'The court\'s recognition of a fact as true without requiring evidence, typically for facts that are commonly known or easily verifiable.',
    category: 'Evidence',
    relatedTerms: ['Fact', 'Evidence', 'Court']
  },
  {
    term: 'Stipulated Fact',
    definition: 'A fact that both parties agree is true, eliminating the need to prove it with evidence. Stipulations can simplify and speed up proceedings.',
    category: 'Evidence',
    relatedTerms: ['Fact', 'Stipulation', 'Evidence']
  },
  {
    term: 'Burden of Production',
    definition: 'The obligation to produce evidence sufficient to support a claim. If not met, the claim fails as a matter of law.',
    category: 'Evidence',
    relatedTerms: ['Burden of Proof', 'Evidence', 'Claim']
  },
  {
    term: 'Burden of Persuasion',
    definition: 'The obligation to convince the judge or jury that your version of the facts is true. The standard varies (preponderance, clear and convincing, or beyond reasonable doubt).',
    category: 'Evidence',
    relatedTerms: ['Burden of Proof', 'Standard of Proof', 'Evidence']
  },
  {
    term: 'Weight of Evidence',
    definition: 'The persuasiveness or credibility of evidence. The judge or jury determines the weight to give each piece of evidence when deciding the case.',
    category: 'Evidence',
    relatedTerms: ['Evidence', 'Credibility', 'Persuasion']
  },
  {
    term: 'Credibility',
    definition: 'The believability of a witness or evidence. Judges and juries assess credibility when deciding how much weight to give testimony or evidence.',
    category: 'Evidence',
    relatedTerms: ['Witness', 'Testimony', 'Weight of Evidence']
  },
  {
    term: 'Impeachment',
    definition: 'The process of challenging a witness\'s credibility, typically by showing prior inconsistent statements, bias, or other factors that affect believability.',
    category: 'Evidence',
    relatedTerms: ['Credibility', 'Witness', 'Cross-Examination']
  },
  {
    term: 'Prior Inconsistent Statement',
    definition: 'A statement made by a witness that contradicts their current testimony. Can be used to impeach the witness\'s credibility.',
    category: 'Evidence',
    relatedTerms: ['Impeachment', 'Credibility', 'Witness']
  },
  {
    term: 'Bias',
    definition: 'A witness\'s prejudice or interest in the outcome of a case. Evidence of bias can be used to impeach a witness\'s credibility.',
    category: 'Evidence',
    relatedTerms: ['Impeachment', 'Credibility', 'Witness']
  },
  
  // Housing & Tenant Terms
  {
    term: 'Eviction',
    definition: 'The legal process of removing a tenant from rental property. Eviction requires proper notice and a court order in most jurisdictions.',
    category: 'Housing Law',
    relatedTerms: ['Landlord', 'Tenant', 'Notice']
  },
  {
    term: 'Security Deposit',
    definition: 'Money paid by a tenant to a landlord at the beginning of a lease to cover potential damages or unpaid rent. The deposit must typically be returned (minus deductions) after the tenant moves out.',
    category: 'Housing Law',
    relatedTerms: ['Lease', 'Tenant']
  },
  {
    term: 'Lease',
    definition: 'A legal contract between a landlord and tenant that specifies the terms of rental, including rent amount, duration, and responsibilities of each party.',
    category: 'Housing Law',
    relatedTerms: ['Tenant', 'Landlord']
  },
  {
    term: 'Landlord',
    definition: 'The owner of rental property who rents it to tenants. Also called a lessor. Landlords have rights and responsibilities under landlord-tenant law.',
    category: 'Housing Law',
    relatedTerms: ['Tenant', 'Lease', 'Rental Property']
  },
  {
    term: 'Tenant',
    definition: 'A person who rents property from a landlord. Also called a lessee. Tenants have rights and responsibilities under landlord-tenant law.',
    category: 'Housing Law',
    relatedTerms: ['Landlord', 'Lease', 'Rental Property']
  },
  {
    term: 'Rental Agreement',
    definition: 'A contract between a landlord and tenant, which can be written or oral. Written agreements are leases; oral agreements are typically month-to-month.',
    category: 'Housing Law',
    relatedTerms: ['Lease', 'Landlord', 'Tenant']
  },
  {
    term: 'Month-to-Month Tenancy',
    definition: 'A rental arrangement that continues from month to month without a fixed end date. Either party can terminate with proper notice, typically 30 days.',
    category: 'Housing Law',
    relatedTerms: ['Lease', 'Tenancy', 'Notice']
  },
  {
    term: 'Fixed-Term Lease',
    definition: 'A lease with a specific start and end date. The tenant has the right to occupy the property for the entire term, and the landlord cannot evict without cause.',
    category: 'Housing Law',
    relatedTerms: ['Lease', 'Term', 'Tenancy']
  },
  {
    term: 'Rent',
    definition: 'Payment made by a tenant to a landlord for the right to occupy rental property. Rent is typically due monthly and specified in the lease.',
    category: 'Housing Law',
    relatedTerms: ['Lease', 'Tenant', 'Payment']
  },
  {
    term: 'Rent Control',
    definition: 'Laws that limit how much landlords can increase rent. Rent control laws vary by location and may apply to certain types of housing or areas.',
    category: 'Housing Law',
    relatedTerms: ['Rent', 'Landlord', 'Tenant Rights']
  },
  {
    term: 'Rent Stabilization',
    definition: 'Laws that limit rent increases to a certain percentage each year. Less restrictive than rent control but still provides tenant protection.',
    category: 'Housing Law',
    relatedTerms: ['Rent', 'Rent Control', 'Tenant Rights']
  },
  {
    term: 'Late Fee',
    definition: 'A charge imposed by a landlord when rent is paid after the due date. Late fees must be reasonable and specified in the lease.',
    category: 'Housing Law',
    relatedTerms: ['Rent', 'Lease', 'Payment']
  },
  {
    term: 'Rent Increase',
    definition: 'An increase in the amount of rent charged. For month-to-month tenancies, landlords typically must give notice (often 30-60 days) before increasing rent.',
    category: 'Housing Law',
    relatedTerms: ['Rent', 'Notice', 'Lease']
  },
  {
    term: 'Notice to Quit',
    definition: 'A written notice from a landlord to a tenant demanding that they vacate the property. Required before filing an eviction lawsuit in most jurisdictions.',
    category: 'Housing Law',
    relatedTerms: ['Eviction', 'Notice', 'Termination']
  },
  {
    term: 'Pay or Quit Notice',
    definition: 'A notice giving a tenant a specified number of days to pay overdue rent or vacate the property. Typically 3-5 days, depending on state law.',
    category: 'Housing Law',
    relatedTerms: ['Eviction', 'Notice', 'Rent']
  },
  {
    term: 'Cure or Quit Notice',
    definition: 'A notice giving a tenant a specified number of days to fix a lease violation (cure) or vacate the property. Used for non-payment of rent or other violations.',
    category: 'Housing Law',
    relatedTerms: ['Eviction', 'Notice', 'Lease Violation']
  },
  {
    term: 'Unconditional Quit Notice',
    definition: 'A notice requiring a tenant to vacate without the option to cure the violation. Used for serious violations like illegal activity or repeated violations.',
    category: 'Housing Law',
    relatedTerms: ['Eviction', 'Notice', 'Termination']
  },
  {
    term: 'Constructive Eviction',
    definition: 'When a landlord\'s actions make the property uninhabitable, forcing the tenant to leave. The tenant may be able to terminate the lease and recover damages.',
    category: 'Housing Law',
    relatedTerms: ['Eviction', 'Habitability', 'Landlord']
  },
  {
    term: 'Self-Help Eviction',
    definition: 'Illegal actions by a landlord to force a tenant out without going through the court process, such as changing locks, shutting off utilities, or removing belongings.',
    category: 'Housing Law',
    relatedTerms: ['Eviction', 'Illegal', 'Landlord']
  },
  {
    term: 'Lockout',
    definition: 'When a landlord illegally prevents a tenant from entering the property, typically by changing locks. Lockouts are illegal in most jurisdictions and require court eviction.',
    category: 'Housing Law',
    relatedTerms: ['Eviction', 'Self-Help Eviction', 'Illegal']
  },
  {
    term: 'Writ of Possession',
    definition: 'A court order authorizing law enforcement to remove a tenant from the property after an eviction judgment. The final step in the eviction process.',
    category: 'Housing Law',
    relatedTerms: ['Eviction', 'Court Order', 'Removal']
  },
  {
    term: 'Unlawful Detainer',
    definition: 'A legal action to evict a tenant who remains in the property after the lease has ended or after proper notice. The formal name for eviction lawsuits in many states.',
    category: 'Housing Law',
    relatedTerms: ['Eviction', 'Lawsuit', 'Tenant']
  },
  {
    term: 'Habitability',
    definition: 'The legal requirement that rental property be fit for human habitation, including working plumbing, heating, electricity, and structural safety. Landlords must maintain habitability.',
    category: 'Housing Law',
    relatedTerms: ['Landlord', 'Tenant Rights', 'Warranty of Habitability']
  },
  {
    term: 'Warranty of Habitability',
    definition: 'The implied legal guarantee that rental property is habitable and safe. Landlords must maintain the property in habitable condition throughout the tenancy.',
    category: 'Housing Law',
    relatedTerms: ['Habitability', 'Landlord', 'Tenant Rights']
  },
  {
    term: 'Repair and Deduct',
    definition: 'A tenant\'s right to pay for necessary repairs and deduct the cost from rent when a landlord fails to make required repairs. Laws vary by state.',
    category: 'Housing Law',
    relatedTerms: ['Repairs', 'Landlord', 'Tenant Rights']
  },
  {
    term: 'Withhold Rent',
    definition: 'A tenant\'s right to stop paying rent when a landlord fails to maintain habitability. Must be done properly under state law, often requiring notice and escrow.',
    category: 'Housing Law',
    relatedTerms: ['Rent', 'Habitability', 'Tenant Rights']
  },
  {
    term: 'Rent Escrow',
    definition: 'A court-ordered account where a tenant deposits rent while habitability issues are being resolved. Protects the tenant while ensuring the landlord gets paid if issues are fixed.',
    category: 'Housing Law',
    relatedTerms: ['Rent', 'Habitability', 'Court']
  },
  {
    term: 'Code Violation',
    definition: 'A violation of housing, building, or health codes. Code violations can affect habitability and may give tenants rights to repairs or termination.',
    category: 'Housing Law',
    relatedTerms: ['Habitability', 'Repairs', 'Health Department']
  },
  {
    term: 'Lead Paint',
    definition: 'Paint containing lead, which is hazardous, especially to children. Landlords must disclose known lead paint hazards and provide information to tenants.',
    category: 'Housing Law',
    relatedTerms: ['Habitability', 'Disclosure', 'Health Hazard']
  },
  {
    term: 'Mold',
    definition: 'Fungal growth that can cause health problems. Landlords may be required to remediate mold that affects habitability or poses health risks.',
    category: 'Housing Law',
    relatedTerms: ['Habitability', 'Health Hazard', 'Repairs']
  },
  {
    term: 'Bedbugs',
    definition: 'Parasitic insects that infest living spaces. Landlords may be responsible for extermination, and tenants may have rights if landlords fail to address infestations.',
    category: 'Housing Law',
    relatedTerms: ['Habitability', 'Pest Control', 'Landlord']
  },
  {
    term: 'Quiet Enjoyment',
    definition: 'The tenant\'s right to use and enjoy the property without unreasonable interference from the landlord. Includes freedom from excessive noise, harassment, or entry.',
    category: 'Housing Law',
    relatedTerms: ['Tenant Rights', 'Landlord', 'Lease']
  },
  {
    term: 'Covenant of Quiet Enjoyment',
    definition: 'An implied promise in every lease that the tenant will have peaceful enjoyment of the property. Landlord violations can give rise to claims for damages or lease termination.',
    category: 'Housing Law',
    relatedTerms: ['Quiet Enjoyment', 'Tenant Rights', 'Lease']
  },
  {
    term: 'Right to Entry',
    definition: 'A landlord\'s right to enter rental property, which is limited by law. Landlords typically must give reasonable notice (often 24-48 hours) except in emergencies.',
    category: 'Housing Law',
    relatedTerms: ['Landlord', 'Tenant Rights', 'Privacy']
  },
  {
    term: 'Reasonable Notice',
    definition: 'Advance notice that is fair and appropriate under the circumstances. For landlord entry, typically 24-48 hours, though laws vary by state.',
    category: 'Housing Law',
    relatedTerms: ['Right to Entry', 'Landlord', 'Notice']
  },
  {
    term: 'Emergency Entry',
    definition: 'A landlord\'s right to enter rental property without notice in case of emergency, such as fire, flood, or other immediate danger to persons or property.',
    category: 'Housing Law',
    relatedTerms: ['Right to Entry', 'Landlord', 'Emergency']
  },
  {
    term: 'Security Deposit Return',
    definition: 'The landlord\'s obligation to return the security deposit, minus lawful deductions, within a specified time after the tenant moves out. Typically 14-30 days, depending on state law.',
    category: 'Housing Law',
    relatedTerms: ['Security Deposit', 'Landlord', 'Tenant']
  },
  {
    term: 'Security Deposit Deduction',
    definition: 'Amounts a landlord can legally deduct from a security deposit, typically for unpaid rent, damages beyond normal wear and tear, or cleaning costs.',
    category: 'Housing Law',
    relatedTerms: ['Security Deposit', 'Damages', 'Landlord']
  },
  {
    term: 'Normal Wear and Tear',
    definition: 'Expected deterioration of property from normal use, such as faded paint or worn carpet. Landlords cannot charge for normal wear and tear.',
    category: 'Housing Law',
    relatedTerms: ['Security Deposit', 'Damages', 'Tenant']
  },
  {
    term: 'Damage',
    definition: 'Harm to property beyond normal wear and tear, such as holes in walls, broken windows, or excessive filth. Tenants are responsible for damages they cause.',
    category: 'Housing Law',
    relatedTerms: ['Security Deposit', 'Normal Wear and Tear', 'Tenant']
  },
  {
    term: 'Itemized Statement',
    definition: 'A detailed list of security deposit deductions that landlords must provide when withholding part of a deposit. Required by law in most states.',
    category: 'Housing Law',
    relatedTerms: ['Security Deposit', 'Deduction', 'Landlord']
  },
  {
    term: 'Security Deposit Interest',
    definition: 'Interest that must be paid on security deposits in some jurisdictions. Landlords may be required to hold deposits in interest-bearing accounts and pay interest to tenants.',
    category: 'Housing Law',
    relatedTerms: ['Security Deposit', 'Interest', 'Landlord']
  },
  {
    term: 'Application Fee',
    definition: 'A fee charged by landlords to process rental applications. Application fees are typically non-refundable and cover costs like credit checks and background checks.',
    category: 'Housing Law',
    relatedTerms: ['Application', 'Fee', 'Landlord']
  },
  {
    term: 'Application Deposit',
    definition: 'Money paid with a rental application, which may be refundable if the application is rejected or applied toward the security deposit if accepted.',
    category: 'Housing Law',
    relatedTerms: ['Application', 'Security Deposit', 'Landlord']
  },
  {
    term: 'Credit Check',
    definition: 'A review of a potential tenant\'s credit history to assess their ability to pay rent. Landlords typically require credit checks as part of the application process.',
    category: 'Housing Law',
    relatedTerms: ['Application', 'Tenant Screening', 'Credit']
  },
  {
    term: 'Background Check',
    definition: 'A review of a potential tenant\'s criminal history, rental history, and other background information. Used by landlords to screen tenants.',
    category: 'Housing Law',
    relatedTerms: ['Application', 'Tenant Screening', 'Criminal History']
  },
  {
    term: 'Tenant Screening',
    definition: 'The process of evaluating potential tenants, including credit checks, background checks, income verification, and rental history. Must comply with fair housing laws.',
    category: 'Housing Law',
    relatedTerms: ['Application', 'Credit Check', 'Background Check']
  },
  {
    term: 'Fair Housing',
    definition: 'Laws prohibiting discrimination in housing based on protected characteristics such as race, color, religion, sex, national origin, familial status, or disability.',
    category: 'Housing Law',
    relatedTerms: ['Discrimination', 'Protected Class', 'Landlord']
  },
  {
    term: 'Housing Discrimination',
    definition: 'Illegal discrimination in housing based on protected characteristics. Includes refusing to rent, different terms, or harassment based on protected status.',
    category: 'Housing Law',
    relatedTerms: ['Fair Housing', 'Discrimination', 'Protected Class']
  },
  {
    term: 'Reasonable Accommodation',
    definition: 'Changes to rules, policies, or practices that allow people with disabilities to have equal access to housing. Landlords must provide reasonable accommodations.',
    category: 'Housing Law',
    relatedTerms: ['Disability', 'Fair Housing', 'Landlord']
  },
  {
    term: 'Reasonable Modification',
    definition: 'Physical changes to rental property that allow people with disabilities to use and enjoy the property. Tenants may be required to pay for modifications, depending on circumstances.',
    category: 'Housing Law',
    relatedTerms: ['Disability', 'Fair Housing', 'Modification']
  },
  {
    term: 'Emotional Support Animal',
    definition: 'An animal that provides emotional support to a person with a disability. Under fair housing laws, landlords must allow emotional support animals even if they have a no-pet policy.',
    category: 'Housing Law',
    relatedTerms: ['Disability', 'Fair Housing', 'Reasonable Accommodation']
  },
  {
    term: 'Service Animal',
    definition: 'An animal trained to perform tasks for a person with a disability. Under fair housing and ADA laws, service animals must be allowed in housing.',
    category: 'Housing Law',
    relatedTerms: ['Disability', 'Fair Housing', 'ADA']
  },
  {
    term: 'No-Pet Policy',
    definition: 'A landlord\'s rule prohibiting pets in rental property. No-pet policies do not apply to service animals or emotional support animals, which are protected by law.',
    category: 'Housing Law',
    relatedTerms: ['Pet', 'Landlord', 'Service Animal']
  },
  {
    term: 'Pet Deposit',
    definition: 'An additional security deposit charged for tenants with pets, intended to cover potential pet-related damages. Some states limit or prohibit pet deposits.',
    category: 'Housing Law',
    relatedTerms: ['Pet', 'Security Deposit', 'Landlord']
  },
  {
    term: 'Pet Fee',
    definition: 'A non-refundable fee charged for tenants with pets, separate from a security deposit. Some states limit or prohibit pet fees.',
    category: 'Housing Law',
    relatedTerms: ['Pet', 'Fee', 'Landlord']
  },
  {
    term: 'Sublease',
    definition: 'When a tenant rents the property to another person (subtenant) for part of the lease term. Subleasing typically requires landlord permission.',
    category: 'Housing Law',
    relatedTerms: ['Lease', 'Tenant', 'Assignment']
  },
  {
    term: 'Assignment',
    definition: 'When a tenant transfers their entire lease to another person. Assignments typically require landlord permission and release the original tenant from liability.',
    category: 'Housing Law',
    relatedTerms: ['Lease', 'Sublease', 'Tenant']
  },
  {
    term: 'Lease Violation',
    definition: 'A breach of the lease terms, such as non-payment of rent, unauthorized pets, or illegal activity. Can result in eviction if not cured.',
    category: 'Housing Law',
    relatedTerms: ['Lease', 'Eviction', 'Cure or Quit Notice']
  },
  {
    term: 'Abandonment',
    definition: 'When a tenant leaves the property without notice and stops paying rent, indicating they have given up their tenancy. Landlords may be able to retake possession.',
    category: 'Housing Law',
    relatedTerms: ['Tenant', 'Lease', 'Eviction']
  },
  {
    term: 'Surrender',
    definition: 'When a tenant voluntarily gives up their right to occupy the property, typically by returning keys and vacating. Ends the lease and tenant obligations.',
    category: 'Housing Law',
    relatedTerms: ['Lease', 'Tenant', 'Termination']
  },
  {
    term: 'Holdover Tenant',
    definition: 'A tenant who remains in the property after the lease has expired. Holdover tenants may become month-to-month tenants or may be subject to eviction.',
    category: 'Housing Law',
    relatedTerms: ['Lease', 'Tenant', 'Eviction']
  },
  {
    term: 'Tenant at Sufferance',
    definition: 'A tenant who remains in the property without the landlord\'s permission after the lease has ended. Can be evicted without notice in some jurisdictions.',
    category: 'Housing Law',
    relatedTerms: ['Holdover Tenant', 'Lease', 'Eviction']
  },
  {
    term: 'Renters Insurance',
    definition: 'Insurance that protects a tenant\'s personal property and provides liability coverage. Landlords may require renters insurance as a lease condition.',
    category: 'Housing Law',
    relatedTerms: ['Tenant', 'Insurance', 'Lease']
  },
  {
    term: 'Landlord Insurance',
    definition: 'Insurance that protects the landlord\'s property and provides liability coverage. Does not cover tenant\'s personal property, which requires renters insurance.',
    category: 'Housing Law',
    relatedTerms: ['Landlord', 'Insurance', 'Property']
  },
  {
    term: 'Section 8',
    definition: 'A federal housing assistance program that provides rental subsidies to low-income tenants. Landlords who accept Section 8 vouchers must comply with program requirements.',
    category: 'Housing Law',
    relatedTerms: ['Housing Assistance', 'Subsidy', 'Low Income']
  },
  {
    term: 'Housing Voucher',
    definition: 'A government subsidy that helps low-income tenants pay rent. Tenants use vouchers to rent from private landlords who agree to participate in the program.',
    category: 'Housing Law',
    relatedTerms: ['Section 8', 'Housing Assistance', 'Subsidy']
  },
  {
    term: 'Public Housing',
    definition: 'Government-owned and operated housing for low-income families. Public housing is managed by local housing authorities and has specific eligibility requirements.',
    category: 'Housing Law',
    relatedTerms: ['Housing Assistance', 'Low Income', 'Government']
  },
  {
    term: 'Housing Authority',
    definition: 'A government agency that administers public housing and housing assistance programs, such as Section 8 vouchers.',
    category: 'Housing Law',
    relatedTerms: ['Public Housing', 'Section 8', 'Government']
  },
  {
    term: 'Tenant Organization',
    definition: 'A group of tenants who organize to advocate for their rights, negotiate with landlords, or address housing issues collectively.',
    category: 'Housing Law',
    relatedTerms: ['Tenant Rights', 'Advocacy', 'Collective Action']
  },
  {
    term: 'Rent Strike',
    definition: 'When tenants collectively withhold rent to protest landlord violations or demand improvements. Rent strikes have legal risks and should be done carefully with legal advice.',
    category: 'Housing Law',
    relatedTerms: ['Tenant Organization', 'Rent', 'Protest']
  },
  
  // General Legal Terms
  {
    term: 'Plaintiff',
    definition: 'The person or party who files a lawsuit or initiates legal action against another party.',
    category: 'General Legal',
    relatedTerms: ['Defendant', 'Complaint']
  },
  {
    term: 'Defendant',
    definition: 'The person or party being sued or against whom legal action is taken.',
    category: 'General Legal',
    relatedTerms: ['Plaintiff', 'Complaint']
  },
  {
    term: 'Judgment',
    definition: 'The final decision of a court resolving a case and determining the rights and obligations of the parties.',
    category: 'General Legal',
    relatedTerms: ['Order', 'Verdict']
  },
  {
    term: 'Appeal',
    definition: 'A request to a higher court to review and potentially reverse a lower court\'s decision. Appeals must be based on legal errors, not just disagreement with the outcome.',
    category: 'General Legal',
    relatedTerms: ['Judgment', 'Court']
  },
  {
    term: 'Default',
    definition: 'Failure to respond to a lawsuit or appear in court, which can result in a default judgment being entered against the non-responsive party.',
    category: 'General Legal',
    relatedTerms: ['Judgment', 'Summons']
  },
  {
    term: 'Discovery',
    definition: 'The pre-trial process where parties exchange information and gather evidence. Discovery can include depositions, interrogatories, and document requests.',
    category: 'General Legal',
    relatedTerms: ['Evidence', 'Trial']
  },
  
  // Eviction Court Terms
  {
    term: 'Unlawful Detainer',
    definition: 'LEGAL: A legal action to recover possession of real property from a tenant who remains in possession after the right to possession has terminated. It is a summary proceeding designed to provide a speedy remedy for landlords. IN EVERYDAY TERMS: This is the official name for an eviction lawsuit. When your landlord files to evict you, they\'re filing an "unlawful detainer" case. It\'s called "unlawful" because you\'re staying in the property without the legal right to be there anymore.',
    category: 'Eviction Court',
    relatedTerms: ['Eviction', 'Writ of Possession', 'Notice to Quit']
  },
  {
    term: 'Writ of Possession',
    definition: 'LEGAL: A court order issued after a judgment in an unlawful detainer action, directing the sheriff or constable to remove the tenant and restore possession of the property to the landlord. IN EVERYDAY TERMS: This is the piece of paper that gives the sheriff permission to physically remove you from your home. Once the judge rules against you in eviction court, the landlord gets this writ, and the sheriff will come to your door to make you leave. This is the final step - after this, you\'ll be locked out.',
    category: 'Eviction Court',
    relatedTerms: ['Unlawful Detainer', 'Eviction', 'Judgment']
  },
  {
    term: 'Notice to Quit',
    definition: 'LEGAL: A written notice from a landlord to a tenant demanding that the tenant vacate the premises. It is a prerequisite to filing an unlawful detainer action and must comply with statutory requirements regarding timing and content. IN EVERYDAY TERMS: This is the warning letter your landlord gives you before they can file an eviction. It tells you that you need to move out by a certain date. Think of it as your "last chance" notice - if you don\'t leave by the date specified, the landlord can take you to court.',
    category: 'Eviction Court',
    relatedTerms: ['Eviction', 'Unlawful Detainer', 'Termination']
  },
  {
    term: 'Pay or Quit Notice',
    definition: 'LEGAL: A type of notice to quit that gives the tenant a specified number of days (typically 3-5 days) to either pay overdue rent or vacate the premises. Failure to comply allows the landlord to file an unlawful detainer action. IN EVERYDAY TERMS: This is a notice that says "pay your rent or get out." Your landlord gives you a few days (usually 3-5) to either pay what you owe or move out. If you don\'t do either, they can file to evict you in court.',
    category: 'Eviction Court',
    relatedTerms: ['Notice to Quit', 'Rent', 'Eviction']
  },
  {
    term: 'Cure or Quit Notice',
    definition: 'LEGAL: A notice requiring the tenant to remedy a lease violation (cure the default) within a specified time or vacate the premises. Used for violations other than non-payment of rent, such as unauthorized pets or noise violations. IN EVERYDAY TERMS: This notice says "fix the problem or move out." If you\'ve broken a rule in your lease (like having a pet when you\'re not allowed, or making too much noise), your landlord gives you a chance to fix it. If you don\'t fix it by the deadline, they can evict you.',
    category: 'Eviction Court',
    relatedTerms: ['Notice to Quit', 'Lease Violation', 'Cure']
  },
  {
    term: 'Unconditional Quit Notice',
    definition: 'LEGAL: A notice requiring the tenant to vacate without the opportunity to cure the violation. Used for serious breaches such as illegal activity, substantial damage to property, or repeated violations after prior notices. IN EVERYDAY TERMS: This is a "no second chances" notice. Your landlord is telling you to leave immediately, and you can\'t fix the problem to stay. This happens for serious issues like illegal activity in your apartment, major property damage, or when you\'ve already been warned multiple times.',
    category: 'Eviction Court',
    relatedTerms: ['Notice to Quit', 'Termination', 'Eviction']
  },
  {
    term: 'Summary Proceeding',
    definition: 'LEGAL: An expedited legal process designed to resolve disputes quickly, with simplified procedures and shortened timelines. Unlawful detainer actions are summary proceedings, allowing landlords to regain possession faster than regular civil lawsuits. IN EVERYDAY TERMS: This means eviction cases move fast. Unlike other court cases that can take months, eviction court is designed to be quick - usually just a few weeks from filing to judgment. This is why you need to act fast if you get an eviction notice.',
    category: 'Eviction Court',
    relatedTerms: ['Unlawful Detainer', 'Eviction', 'Expedited']
  },
  {
    term: 'Forcible Entry and Detainer',
    definition: 'LEGAL: A common law action and statutory remedy for recovering possession of real property from someone who wrongfully entered or remained on the property. The modern equivalent is unlawful detainer. IN EVERYDAY TERMS: This is the old legal name for what we now call eviction. It refers to the act of taking back property from someone who shouldn\'t be there. Some states still use this term, but most call it "unlawful detainer" now.',
    category: 'Eviction Court',
    relatedTerms: ['Unlawful Detainer', 'Eviction', 'Possession']
  },
  {
    term: 'Constructive Eviction',
    definition: 'LEGAL: A legal doctrine where a landlord\'s actions or failure to act make the premises uninhabitable, effectively forcing the tenant to vacate. The tenant may terminate the lease and may recover damages without being in breach. IN EVERYDAY TERMS: This is when your landlord makes your home unlivable (like not fixing broken heat in winter, or letting dangerous conditions exist), so you have no choice but to move out. Even though you\'re the one leaving, the law treats it as if the landlord evicted you, and you might be able to sue them for damages.',
    category: 'Eviction Court',
    relatedTerms: ['Habitability', 'Landlord', 'Tenant Rights']
  },
  {
    term: 'Self-Help Eviction',
    definition: 'LEGAL: Illegal actions by a landlord to remove a tenant without following the proper legal process, such as changing locks, shutting off utilities, removing belongings, or using threats or force. Prohibited in all jurisdictions. IN EVERYDAY TERMS: This is when your landlord tries to kick you out without going through the court. They might change your locks, turn off your electricity, or throw your stuff out. This is ILLEGAL - landlords must go through the court system. If this happens to you, you can sue them and might get money damages.',
    category: 'Eviction Court',
    relatedTerms: ['Eviction', 'Illegal', 'Lockout']
  },
  {
    term: 'Lockout',
    definition: 'LEGAL: The act of a landlord preventing a tenant from entering the premises, typically by changing locks, without a court order. Illegal in all jurisdictions and constitutes a self-help eviction. IN EVERYDAY TERMS: When your landlord changes the locks on your door so you can\'t get in. This is illegal unless a judge has ordered it (after you lose an eviction case). If your landlord locks you out without a court order, call the police and a lawyer immediately.',
    category: 'Eviction Court',
    relatedTerms: ['Self-Help Eviction', 'Illegal', 'Eviction']
  },
  {
    term: 'Stay of Execution',
    definition: 'LEGAL: A court order that temporarily stops or delays the enforcement of a judgment, such as delaying the execution of a writ of possession. May be granted for various reasons including pending appeals or payment arrangements. IN EVERYDAY TERMS: This is when the judge puts the eviction on hold temporarily. Even though the landlord won the case, you get a little more time before the sheriff comes. This might happen if you\'re appealing the decision, or if you and the landlord are working out a payment plan.',
    category: 'Eviction Court',
    relatedTerms: ['Writ of Possession', 'Judgment', 'Appeal']
  },
  {
    term: 'Retaliatory Eviction',
    definition: 'LEGAL: An eviction filed in retaliation for a tenant exercising legal rights, such as complaining about habitability issues, requesting repairs, or organizing with other tenants. Prohibited by law in most jurisdictions. IN EVERYDAY TERMS: This is when your landlord tries to evict you because you complained about problems (like asking them to fix things or reporting code violations). The law protects you from this - if you can prove the eviction is retaliation, the court should dismiss it.',
    category: 'Eviction Court',
    relatedTerms: ['Eviction', 'Retaliation', 'Tenant Rights']
  },
  {
    term: 'Habitability',
    definition: 'LEGAL: The legal requirement that rental property be fit for human habitation, including working plumbing, heating, electricity, structural safety, and compliance with health and building codes. Landlords have a duty to maintain habitability. IN EVERYDAY TERMS: This means your home has to be safe and livable. Your landlord must provide working heat, water, electricity, and fix dangerous problems. If your place isn\'t habitable, you might be able to use this as a defense in eviction court, or withhold rent, or sue for damages.',
    category: 'Eviction Court',
    relatedTerms: ['Warranty of Habitability', 'Landlord', 'Tenant Rights']
  },
  {
    term: 'Warranty of Habitability',
    definition: 'LEGAL: An implied legal guarantee in every residential lease that the property is habitable and will remain so throughout the tenancy. Landlords cannot waive this warranty, and breach may give tenants various remedies. IN EVERYDAY TERMS: This is the unspoken promise that comes with every rental - your landlord guarantees your home will be safe and livable. They can\'t get out of this responsibility, even if your lease says otherwise. If they break this promise, you have legal rights.',
    category: 'Eviction Court',
    relatedTerms: ['Habitability', 'Landlord', 'Implied Warranty']
  },
  {
    term: 'Rent Escrow',
    definition: 'LEGAL: A court-ordered account where a tenant deposits rent payments while habitability issues are being resolved. Protects the tenant from eviction for non-payment while ensuring the landlord receives payment if issues are fixed. IN EVERYDAY TERMS: Instead of paying rent to your landlord when they won\'t fix problems, you pay it to the court to hold. The court keeps the money safe until the problems are fixed. This protects you from eviction for not paying, but the landlord still gets paid if they fix the issues.',
    category: 'Eviction Court',
    relatedTerms: ['Habitability', 'Rent', 'Court']
  },
  {
    term: 'Repair and Deduct',
    definition: 'LEGAL: A tenant\'s right to pay for necessary repairs and deduct the cost from rent when a landlord fails to make required repairs affecting habitability. Must comply with statutory requirements regarding notice and cost limits. IN EVERYDAY TERMS: If your landlord won\'t fix something important (like a broken heater), you can pay to fix it yourself and subtract that cost from your rent. But you have to follow the rules - give proper notice first, and there are usually limits on how much you can deduct.',
    category: 'Eviction Court',
    relatedTerms: ['Repairs', 'Habitability', 'Rent']
  },
  {
    term: 'Withhold Rent',
    definition: 'LEGAL: A tenant\'s right to stop paying rent when a landlord fails to maintain habitability, subject to strict legal requirements including proper notice and often requiring rent to be placed in escrow. IN EVERYDAY TERMS: When your home has serious problems and your landlord won\'t fix them, you might be able to stop paying rent. But be careful - you usually have to put the money in a special account (escrow) or follow other rules, or you could still be evicted for non-payment.',
    category: 'Eviction Court',
    relatedTerms: ['Rent', 'Habitability', 'Rent Escrow']
  },
  {
    term: 'Possession',
    definition: 'LEGAL: The right to occupy and control property. In eviction cases, the landlord seeks to regain possession from the tenant. IN EVERYDAY TERMS: This just means who has the right to be in the property. When you rent, you have "possession" - you get to live there. When you\'re evicted, the landlord gets "possession" back - they get to control who lives there.',
    category: 'Eviction Court',
    relatedTerms: ['Eviction', 'Landlord', 'Tenant']
  },
  {
    term: 'Tenancy at Will',
    definition: 'LEGAL: A rental arrangement that continues indefinitely without a fixed term, terminable by either party with proper notice. Typically month-to-month tenancies. IN EVERYDAY TERMS: This is when you rent without a lease, or your lease has ended and you\'re staying month-to-month. Either you or your landlord can end it with proper notice (usually 30 days), but you still have all the same tenant rights.',
    category: 'Eviction Court',
    relatedTerms: ['Month-to-Month Tenancy', 'Notice', 'Termination']
  },
  {
    term: 'Holdover Tenant',
    definition: 'LEGAL: A tenant who remains in possession of the property after the lease term has expired without the landlord\'s consent. The landlord may treat them as a tenant at will or seek immediate eviction. IN EVERYDAY TERMS: This is when your lease has ended but you\'re still living there. Your landlord can either let you stay (making you month-to-month) or evict you right away. You\'re still a tenant with rights, but your situation is less secure.',
    category: 'Eviction Court',
    relatedTerms: ['Lease', 'Tenancy at Will', 'Eviction']
  },
  {
    term: 'Abandonment',
    definition: 'LEGAL: When a tenant leaves the property without notice and stops paying rent, indicating they have given up their tenancy. Landlords may be able to retake possession without formal eviction proceedings. IN EVERYDAY TERMS: This is when you just up and leave without telling your landlord. If you stop paying rent and it\'s clear you\'re gone for good, your landlord might be able to take the property back without going through the full eviction process. But they still have to follow rules about your belongings.',
    category: 'Eviction Court',
    relatedTerms: ['Tenant', 'Lease', 'Possession']
  },
  {
    term: 'Surrender',
    definition: 'LEGAL: The voluntary return of possession of property from tenant to landlord, typically by returning keys and vacating. Ends the lease and tenant obligations. IN EVERYDAY TERMS: This is when you give up and move out voluntarily. You hand back the keys and leave. Once you surrender, your lease is over and you\'re no longer responsible for rent (unless you owe back rent).',
    category: 'Eviction Court',
    relatedTerms: ['Lease', 'Possession', 'Termination']
  },
  {
    term: 'Damages',
    definition: 'LEGAL: Monetary compensation awarded by a court for losses or injuries. In eviction cases, may include unpaid rent, late fees, court costs, and attorney fees. IN EVERYDAY TERMS: This is money the judge orders you to pay. In eviction cases, this usually means back rent you owe, plus sometimes late fees, the landlord\'s court costs, and even their lawyer fees. You might have to pay this even after you move out.',
    category: 'Eviction Court',
    relatedTerms: ['Judgment', 'Rent', 'Court Costs']
  },
  {
    term: 'Back Rent',
    definition: 'LEGAL: Unpaid rent that has accumulated over time. In eviction cases, landlords typically seek judgment for back rent in addition to possession. IN EVERYDAY TERMS: This is all the rent you haven\'t paid. If you\'re behind on rent, the landlord can ask the judge to make you pay everything you owe, even if you move out. This debt doesn\'t go away just because you leave.',
    category: 'Eviction Court',
    relatedTerms: ['Rent', 'Damages', 'Judgment']
  },
  {
    term: 'Court Costs',
    definition: 'LEGAL: Fees and expenses associated with filing and prosecuting a lawsuit, including filing fees, service fees, and other administrative costs. The prevailing party may be awarded court costs. IN EVERYDAY TERMS: These are all the fees the landlord had to pay to file the eviction case - things like the filing fee, the cost to have someone serve you the papers, etc. If the landlord wins, the judge might make you pay these costs.',
    category: 'Eviction Court',
    relatedTerms: ['Filing Fee', 'Damages', 'Judgment']
  },
  {
    term: 'Attorney Fees',
    definition: 'LEGAL: The cost of legal representation. In eviction cases, if the lease allows it or state law permits, the prevailing party (usually the landlord) may be awarded attorney fees. IN EVERYDAY TERMS: This is what the landlord paid their lawyer. If your lease says the loser pays lawyer fees, or if your state allows it, you might have to pay the landlord\'s legal bills if you lose. This can add thousands of dollars to what you owe.',
    category: 'Eviction Court',
    relatedTerms: ['Damages', 'Judgment', 'Lease']
  },
  {
    term: 'Filing Fee',
    definition: 'LEGAL: The fee required to file a lawsuit with the court. In eviction cases, typically paid by the landlord but may be recoverable as part of damages if they prevail. IN EVERYDAY TERMS: This is the money the landlord had to pay just to start the eviction case (usually $100-$400 depending on your area). If they win, they might ask the judge to make you pay this fee back to them.',
    category: 'Eviction Court',
    relatedTerms: ['Court Costs', 'Filing', 'Damages']
  },
  {
    term: 'Service Fee',
    definition: 'LEGAL: The cost of having legal documents delivered to the defendant. Typically paid to a process server or sheriff. May be recoverable as court costs. IN EVERYDAY TERMS: This is what it costs to have someone officially deliver the eviction papers to you (usually $50-$150). The landlord pays this upfront, but if they win, you might have to pay it back.',
    category: 'Eviction Court',
    relatedTerms: ['Service of Process', 'Court Costs', 'Process Server']
  },
  {
    term: 'Process Server',
    definition: 'LEGAL: A person authorized to deliver legal documents (serve process) to parties in a lawsuit. May be a sheriff, constable, or private process server. IN EVERYDAY TERMS: This is the person who hands you the eviction papers. It might be a sheriff, a constable, or someone the landlord hired. They have to follow strict rules about how to give you the papers - if they don\'t do it right, you might be able to challenge the eviction.',
    category: 'Eviction Court',
    relatedTerms: ['Service of Process', 'Summons', 'Service Fee']
  },
  {
    term: 'Sheriff',
    definition: 'LEGAL: A law enforcement officer who serves legal documents and executes court orders, including writs of possession in eviction cases. IN EVERYDAY TERMS: This is the police officer who will actually come to your door to remove you if you lose the eviction case. After the judge orders you out and the landlord gets a writ of possession, the sheriff will come with the landlord to change the locks and make you leave.',
    category: 'Eviction Court',
    relatedTerms: ['Writ of Possession', 'Eviction', 'Execution']
  },
  {
    term: 'Execution',
    definition: 'LEGAL: The process of carrying out or enforcing a court order or judgment. In eviction cases, execution refers to the sheriff physically removing the tenant and restoring possession to the landlord. IN EVERYDAY TERMS: This is when the sheriff actually comes to kick you out. After the judge rules against you and the landlord gets the writ, the sheriff will come to your home, remove you and your belongings, and give the property back to the landlord. This is the final step.',
    category: 'Eviction Court',
    relatedTerms: ['Writ of Possession', 'Sheriff', 'Eviction']
  },
  {
    term: 'Redemption Period',
    definition: 'LEGAL: A statutory period after a judgment during which a tenant may prevent eviction by paying all amounts owed, including rent, fees, and costs. Not available in all jurisdictions. IN EVERYDAY TERMS: This is a last chance to save your home after you lose in court. Some states give you a few days (usually 5-10) to pay everything you owe - all the back rent, fees, and costs. If you pay it all in time, the eviction stops and you get to stay.',
    category: 'Eviction Court',
    relatedTerms: ['Judgment', 'Back Rent', 'Stay']
  },
  {
    term: 'Dismissal',
    definition: 'LEGAL: The termination of a lawsuit before a final judgment. May be voluntary (by the plaintiff) or involuntary (by court order). In eviction cases, dismissal means the tenant gets to stay. IN EVERYDAY TERMS: This is when the eviction case gets thrown out or dropped. The landlord might dismiss it if you pay what you owe, or the judge might dismiss it if the landlord didn\'t follow the rules. Either way, you get to stay in your home.',
    category: 'Eviction Court',
    relatedTerms: ['Case', 'Termination', 'Settlement']
  },
  {
    term: 'Affirmative Defense',
    definition: 'LEGAL: A defense that doesn\'t deny the allegations but provides a legal reason why the plaintiff shouldn\'t win. In eviction cases, common defenses include habitability issues, retaliatory eviction, or improper notice. IN EVERYDAY TERMS: This is when you admit the landlord\'s facts might be true, but you have a legal reason why they still shouldn\'t win. For example, "Yes, I didn\'t pay rent, but that\'s because the landlord won\'t fix the broken heater, so I don\'t owe it."',
    category: 'Eviction Court',
    relatedTerms: ['Defense', 'Answer', 'Habitability']
  },
  {
    term: 'Tenant\'s Rights',
    definition: 'LEGAL: Legal protections and entitlements afforded to tenants under landlord-tenant law, including the right to habitable housing, privacy, and protection from illegal eviction. IN EVERYDAY TERMS: These are your legal protections as a renter. You have the right to a safe, livable home, privacy, proper notice before eviction, and protection from illegal actions by your landlord. Know your rights!',
    category: 'Eviction Court',
    relatedTerms: ['Habitability', 'Privacy', 'Legal Protections']
  },
  {
    term: 'Security Deposit',
    definition: 'LEGAL: Money paid by a tenant to a landlord at the beginning of a tenancy, held as security for damages or unpaid rent. State laws regulate the amount, handling, and return of security deposits. IN EVERYDAY TERMS: This is the money you pay upfront when you move in (usually first month\'s rent plus deposit). The landlord holds it and can use it to fix damages when you move out, or must return it if everything is fine. They have to follow strict rules about when and how to return it.',
    category: 'Eviction Court',
    relatedTerms: ['Rent', 'Lease', 'Damages']
  },
  {
    term: 'Mediation',
    definition: 'LEGAL: A voluntary or court-ordered process where a neutral third party helps the landlord and tenant reach a settlement agreement. Often used in eviction cases to avoid trial. IN EVERYDAY TERMS: This is when you and your landlord sit down with a neutral person (a mediator) to try to work things out without going to trial. It\'s often free or low-cost, and can help you reach a deal like a payment plan or extra time to move out.',
    category: 'Eviction Court',
    relatedTerms: ['Settlement', 'Agreement', 'Negotiation']
  },
  {
    term: 'Settlement Agreement',
    definition: 'LEGAL: A written contract between landlord and tenant resolving the eviction case, often including payment plans, move-out dates, or dismissal of the case. Must be approved by the court. IN EVERYDAY TERMS: This is a deal you make with your landlord to end the eviction case. It might say you\'ll pay back rent in installments, or move out by a certain date, or both. Once the judge approves it, it becomes a court order you both have to follow.',
    category: 'Eviction Court',
    relatedTerms: ['Mediation', 'Stipulation', 'Dismissal']
  },
  {
    term: 'Stipulation',
    definition: 'LEGAL: An agreement between parties in a lawsuit, often used in eviction cases to set terms like payment plans or move-out dates. When approved by the court, it becomes a binding order. IN EVERYDAY TERMS: This is a formal agreement you and your landlord make in court. It\'s like a contract that says what each of you will do - maybe you\'ll pay $200 a month toward back rent, or move out by March 1st. If you break it, the landlord can ask the judge to enforce it immediately.',
    category: 'Eviction Court',
    relatedTerms: ['Settlement Agreement', 'Court Order', 'Agreement']
  },
  {
    term: 'Default Judgment',
    definition: 'LEGAL: A judgment entered against a defendant who fails to respond to a lawsuit or appear in court. In eviction cases, results in automatic win for the landlord. IN EVERYDAY TERMS: This is when you lose the case automatically because you didn\'t show up or respond. If you get eviction papers and ignore them, the landlord wins by default. You\'ll be evicted and might owe money. Always respond to court papers!',
    category: 'Eviction Court',
    relatedTerms: ['Judgment', 'Default', 'Answer']
  },
  {
    term: 'Motion to Set Aside',
    definition: 'LEGAL: A request to the court to vacate or cancel a default judgment, typically filed when the defendant had a good reason for not responding (like not receiving notice). IN EVERYDAY TERMS: This is asking the judge to undo a default judgment because you had a good reason for not showing up - like you never got the papers, or you were in the hospital. You have to file this quickly and explain why you didn\'t respond.',
    category: 'Eviction Court',
    relatedTerms: ['Default Judgment', 'Motion', 'Vacate']
  },
  {
    term: 'Continuance',
    definition: 'LEGAL: A postponement of a court hearing or trial to a later date. May be granted for various reasons including need for more time to prepare, obtain counsel, or gather evidence. IN EVERYDAY TERMS: This is when the judge moves your court date to later. You might ask for this if you need more time to find a lawyer, gather evidence, or work out a deal with your landlord. The judge decides whether to grant it.',
    category: 'Eviction Court',
    relatedTerms: ['Hearing', 'Trial', 'Postponement']
  },
  {
    term: 'Rent Control',
    definition: 'LEGAL: Government regulation limiting how much landlords can charge for rent and how often they can increase it. Not available in all jurisdictions. IN EVERYDAY TERMS: This is when the government limits how much your landlord can raise your rent. In rent-controlled areas, landlords can only increase rent by a certain percentage each year, and there are strict rules about when and how they can do it. This protects you from huge rent hikes.',
    category: 'Eviction Court',
    relatedTerms: ['Rent', 'Rent Stabilization', 'Just Cause Eviction']
  },
  {
    term: 'Just Cause Eviction',
    definition: 'LEGAL: A legal requirement that landlords can only evict tenants for specific, legally recognized reasons (like non-payment of rent, lease violations, or owner move-in). Protects tenants from arbitrary evictions. IN EVERYDAY TERMS: This means your landlord can\'t just kick you out for no reason. They need a valid legal reason, like you didn\'t pay rent, you broke the lease, or they need to move in themselves. This protects you from being evicted just because the landlord doesn\'t like you.',
    category: 'Eviction Court',
    relatedTerms: ['Eviction', 'No-Fault Eviction', 'Good Cause']
  },
  {
    term: 'Fair Housing Act',
    definition: 'LEGAL: Federal law prohibiting housing discrimination based on race, color, religion, sex, national origin, familial status, or disability. Violations can be used as a defense in eviction cases. IN EVERYDAY TERMS: This is the federal law that says landlords can\'t discriminate against you because of your race, religion, gender, whether you have kids, or if you have a disability. If your eviction is really about discrimination, you can fight it using this law.',
    category: 'Eviction Court',
    relatedTerms: ['Discrimination', 'Tenant Rights', 'Housing']
  },
  {
    term: 'Right to Counsel',
    definition: 'LEGAL: A legal right to have an attorney represent you in court, even if you can\'t afford one. Some jurisdictions provide free lawyers for tenants in eviction cases. IN EVERYDAY TERMS: This is your right to have a lawyer, even if you can\'t pay. Some cities and states now provide free lawyers for tenants facing eviction. Having a lawyer dramatically increases your chances of winning or getting a better deal. Check if your area has this program!',
    category: 'Eviction Court',
    relatedTerms: ['Legal Aid', 'Attorney', 'Pro Bono']
  },
  {
    term: 'Emergency Rental Assistance',
    definition: 'LEGAL: Government or nonprofit programs providing financial aid to help tenants pay rent and avoid eviction. Often available during emergencies or for low-income households. IN EVERYDAY TERMS: This is money available to help you pay rent when you\'re in crisis. Programs like ERAP (Emergency Rental Assistance Program) can pay your back rent and sometimes future rent to help you avoid eviction. Apply as soon as possible - funds are limited!',
    category: 'Eviction Court',
    relatedTerms: ['Rent', 'Back Rent', 'Eviction Prevention']
  },
  {
    term: 'Answer',
    definition: 'LEGAL: A written response to a complaint filed by the defendant, admitting or denying the allegations and asserting any defenses. Must be filed within a specified time (usually 5-20 days in eviction cases). IN EVERYDAY TERMS: This is your written response to the eviction lawsuit. You have to file it quickly (usually within 5-20 days) or you\'ll lose by default. In it, you say whether you agree or disagree with what the landlord claims, and explain your side of the story.',
    category: 'Eviction Court',
    relatedTerms: ['Complaint', 'Defense', 'Response']
  },
  {
    term: 'Motion to Dismiss',
    definition: 'LEGAL: A request to the court to throw out the case without a trial, typically based on legal defects in the complaint, improper service, or lack of jurisdiction. IN EVERYDAY TERMS: This is asking the judge to throw out the eviction case because the landlord did something wrong - like didn\'t give you proper notice, filed the papers incorrectly, or the court doesn\'t have the right to hear the case. If granted, you get to stay.',
    category: 'Eviction Court',
    relatedTerms: ['Dismissal', 'Motion', 'Complaint']
  },
];

export const categories = [
  'All Terms',
  'Eviction Court',
  'Family Law',
  'Court Process',
  'Legal Rights',
  'Property & Finance',
  'Evidence',
  'Housing Law',
  'General Legal'
];

