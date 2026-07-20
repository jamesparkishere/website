/* ================= Shared chatbot knowledge base =================
   Loaded by index.html, purchase.html, refinance.html, renewal.html,
   mortgage-pre-approval.html, burn-my-mortgage.html — the widget shell
   (pushChatBubble/sendChatMessage/showChatbot) stays local to each page
   since it references page-local DOM ids, but the actual Q&A brain lives
   here so it only needs expanding once.

   Keyword design note: keywords are short, atomic words/acronyms rather
   than long exact phrases — "how much do i need" as a keyword only fires
   on that exact wording, which is why real visitors kept hitting the
   fallback bounce on completely ordinary questions. Single strong words
   match far more real phrasing while staying specific enough to the
   domain (mortgage chat) to avoid false positives. */

const CHATBOT_KB = [
  // ---------- small talk ----------
  {kw:['hello','hi','hey','sup','yo','morning','afternoon','evening'], reply:"Hey there! 👋 Ask me anything mortgage — rates, down payments, the stress test, how the whole process works. Nothing's too basic."},
  {kw:['thank','thanks','appreciate','cheers'], reply:"Anytime! What else is on your mind?"},
  {kw:['bye','goodbye','later','done','that helps','helped'], reply:"Take care! James is one click away if a real number would help. 🙂"},
  {kw:['who are you','what are you','are you a robot','are you a bot','are you human','are you real'], reply:"I'm James's assistant — trained on his mortgage knowledge to answer common questions instantly. For anything tied to your actual file, James reviews it personally."},

  // ---------- absolute basics ----------
  {kw:['what is a mortgage','mortgage mean','mortgage definition','explain a mortgage'], reply:"A mortgage is a loan secured against a property — you borrow the difference between the purchase price and your down payment, then repay it (principal + interest) over a set amortization, usually in fixed-term chunks of 1–5 years at a time."},
  {kw:['how does a mortgage work','how do mortgages work','how it works'], reply:"You put down a down payment, borrow the rest from a lender, and repay it monthly over your amortization (often 25 years). Each payment splits between interest (the lender's cost of lending) and principal (paying down what you owe) — early on it's mostly interest, that shifts over time."},
  {kw:['principal','interest portion','how payments split','principal vs interest','how payments work'], reply:"Every payment splits into interest (cost of borrowing, calculated on what you still owe) and principal (reduces your balance). Early in the mortgage interest dominates; as your balance shrinks, more of each payment chips away at principal."},
  {kw:['how much can i afford','how much can i borrow','how much house','how much home','what can i qualify for','how much mortgage can i get','maximum mortgage'], reply:"Comes down to income, debts, down payment, and the stress test — roughly, lenders want your housing costs under ~39% of income (GDS) and total debts under ~44% (TDS). The estimator on this page gives you a real number in under a minute — try it above, or ask James for the exact math."},
  {kw:['getting started','first step','where do i start','how do i start','how do i begin','process overview','what is the process','steps to buy'], reply:"Usually: get pre-qualified (that's what this page does), talk to a broker to lock a real pre-approval, house-hunt with a realtor, make an offer, then the lender finalizes everything before closing. Start with the estimator above — it takes 60 seconds."},
  {kw:['how long does it take','how long to get approved','turnaround time','how fast','how quickly'], reply:"A pre-approval can happen in a day or two once your docs are in. Full approval after an accepted offer usually takes about a week. Closing itself is set by your offer date — often 30–60 days out."},
  {kw:['documents','what do i need','paperwork','docs needed','what to bring'], reply:"Typically: ID, proof of income (pay stubs, T4s, or 2 years of NOAs if self-employed), proof of down payment (bank statements), and details on any existing debts. James will send you the exact checklist once your file starts."},
  {kw:['mortgage vs rent','rent vs buy','renting vs buying','should i rent or buy','better to rent'], reply:"There's no universal answer — buying builds equity but comes with closing costs, maintenance, and less flexibility; renting is cheaper short-term and flexible but builds no ownership. Depends on how long you're staying put and your local rent-vs-payment math. Worth a real conversation."},
  {kw:['equity','home equity','what is equity'], reply:"Equity is what you actually own — your home's value minus what you still owe on it. It grows as you pay down principal and as your home's value rises, and it's what you can borrow against later (refinance, HELOC)."},
  {kw:['is now a good time','good time to buy','should i buy now','should i wait'], reply:"Timing the market perfectly is a myth — the better question is whether your finances and life plans are ready. That said, worth a real conversation with James on where rates and your specific numbers stand right now."},

  // ---------- rate mechanics ----------
  {kw:['fixed rate','variable rate','which is better fixed','floating rate','fixed or variable'], reply:"Fixed = locked rate, easy to budget. Variable = tracks prime, historically cheaper more often than not — but payments (or the interest/principal split) can shift. Comes down to your risk tolerance, worth a real chat with James."},
  {kw:['current rate','todays rate','rates right now','what are rates','interest rate today','rate today','best rate'], reply:"Rates move with every Bank of Canada announcement and vary by lender, term, and your file — I can't responsibly quote a live number here. Plug your numbers into the estimator above for a real read, or ask James what's live today."},
  {kw:['apr','annual percentage rate','difference apr'], reply:"Your posted mortgage rate is the interest cost alone. APR folds in extra costs (like mortgage default insurance premiums) to show the true annualized cost — mortgages don't always advertise APR the way other loans do, so ask for the all-in number."},
  {kw:['prime rate','bank of canada','overnight rate','boc','policy rate'], reply:"The Bank of Canada sets the overnight rate at scheduled dates — prime usually follows within a day. Fixed rates move separately, tracking the bond market instead."},
  {kw:['bond yield','bond market','why do fixed rates move'], reply:"Fixed mortgage rates track government bond yields, not the Bank of Canada rate directly — lenders price fixed terms off what it costs them to borrow long-term in the bond market."},
  {kw:['posted rate','discounted rate','advertised rate','rate comparison site'], reply:"Banks' 'posted' rates are inflated — real rates get negotiated down. They still matter for penalty calculations though, so don't ignore them."},
  {kw:['rate hold','how long is a rate held','lock in my rate','rate lock','pre-approval expire','how long is a pre-approval good'], reply:"Typically 90–120 days. Lock today's rate while you shop, and most lenders still give you a lower rate if one drops before closing."},
  {kw:['float down','rate float','float-down'], reply:"Some lenders offer a float-down — if rates drop during your hold period, you get the lower rate automatically. Not universal, worth asking about."},
  {kw:['open mortgage','closed mortgage'], reply:"Open = pay off anytime, no penalty, higher rate. Closed = lower rate, prepayment limits. Most Canadians choose closed — the math usually favours it."},
  {kw:['adjustable rate','arm ','adjustable-rate'], reply:"Variable = fixed payment, interest/principal split shifts with prime. ARM = your payment itself moves with prime. Both track prime, different mechanics."},
  {kw:['what if rates go up','rates increase during my term','locked in rate protection'], reply:"On a fixed rate, you're protected — your rate's locked for the whole term regardless of what happens after. Variable-rate payments (or the split) can move with prime, which is the trade-off for the historically lower average cost."},

  // ---------- qualifying ----------
  {kw:['down payment','downpayment','minimum down','deposit','deposit needed to buy'], reply:"5% on the first $500K, 10% up to $1.5M, 20% above that. Rentals usually need 20% minimum regardless of price."},
  {kw:['gifted down payment','gift down payment','can my parents gift'], reply:"Yes — most lenders accept a gifted down payment from immediate family, with a signed gift letter confirming it's not a loan. Doesn't need to come entirely from your own savings."},
  {kw:['down payment sources','where can down payment come from','savings for down payment'], reply:"Common sources: personal savings, RRSP via the Home Buyers' Plan, a gift from immediate family, or proceeds from selling another property. Lenders want to see the money's been in your account for a while (or its clear origin) — ask James what they'll want to see for your file."},
  {kw:['no down payment','zero down','100% financing'], reply:"Standard mortgages in Canada require a minimum down payment — there's no true zero-down option like some US programs. Some newcomer or specialty programs stretch further, but a down payment is generally required."},
  {kw:['cmhc','default insurance','mortgage insurance','insured mortgage'], reply:"Under 20% down means default insurance (CMHC or private) — protects the lender, costs roughly 2.8–4% of the loan, added right onto your mortgage."},
  {kw:['stress test','qualify at','qualifying rate'], reply:"You qualify at your rate +2%, or the benchmark rate — whichever's higher. Trips a lot of people up, but there are often ways around it worth asking James about."},
  {kw:['gds','tds','debt ratio','ratios','debt to income'], reply:"GDS = housing costs (mortgage, property tax, heat, half of strata fees) ÷ income, aim under ~39%. TDS = housing + other debts ÷ income, aim under ~44%. Lenders flex a bit depending on the rest of your file."},
  {kw:['strata fee','condo fee','maintenance fee affect'], reply:"Lenders count roughly half your monthly strata/condo fees toward your GDS ratio — a high-strata-fee building can meaningfully shrink what you qualify for, worth checking before you fall for a unit."},
  {kw:['amortization','25 year','30 year','how many years mortgage','how long is my mortgage'], reply:"25 years standard under 20% down. 30 years possible with more down (uninsured), or for first-time buyers on new builds."},
  {kw:['credit score','credit rating','bad credit','minimum credit score','what score do i need'], reply:"680+ gets you the best A-lender pricing. 600–620 still works with the right file. Below that, B-lenders and alt-lending are real options."},
  {kw:['improve my credit','raise my credit','build credit','how to fix credit'], reply:"Pay everything on time, keep credit card balances well under their limit, don't apply for a bunch of new credit right before applying, and let older accounts age. Even a few months of clean history can move the needle."},
  {kw:['bankruptcy','consumer proposal','discharged'], reply:"Doable, but timing matters — most A-lenders want 2 years past discharge with rebuilt credit; some B-lenders will work with you sooner. Bring James the specifics."},
  {kw:['student loan','car loan','debt affect qualify','existing debt'], reply:"Any regular debt payment (student loans, car loans, credit cards, other loans) factors into your TDS ratio and shrinks what you qualify for — paying one down before applying can genuinely move your number."},
  {kw:['self employed','self-employed','stated income','business owner'], reply:"Totally doable. Lenders typically want 2 years of NOAs, and 'stated income' programs exist for write-off-heavy files."},
  {kw:['bank statement program','gig income','freelance income'], reply:"For self-employed or gig-income borrowers who can't easily show NOAs — lenders assess deposits instead. A real alternative-lending path."},
  {kw:['cosign','co-sign','guarantor'], reply:"A co-signer goes on title and shares full responsibility. A guarantor backs the loan without necessarily being on title. Both are a real commitment."},
  {kw:['co-borrower','joint mortgage','buying with a friend','buying together'], reply:"A co-borrower is on title and the mortgage equally, combining both incomes to qualify — common for couples, family, or friends buying together. Everyone's credit and debt gets weighed."},
  {kw:['lower my gds','lower my tds','improve my ratios','how to qualify for more'], reply:"Pay down debt, extend amortization, add a co-borrower, or increase your down payment — all move the needle. Which one depends on your numbers."},
  {kw:['new to canada','newcomer','immigrant mortgage','just moved','recently moved','moved to canada','no canadian credit'], reply:"Newcomer programs exist for limited or no Canadian credit history — often need a bigger down payment or proof of income/assets from abroad, but it's a real path."},

  // ---------- pre-approval vs pre-qual ----------
  {kw:['pre-approval','preapproval','pre-qualification','prequalification','pre approval','pre qualification'], reply:"Pre-qual = quick estimate from what you tell us. Pre-approval = a lender reviews real docs and holds a rate. This tool gets you the estimate — James gets you the real thing."},
  {kw:['underwriting','underwriter','what does underwriting mean'], reply:"Underwriting is the lender's formal review of your income, credit, and the property before final approval — it's what turns a conditional yes into a locked-in commitment."},
  {kw:['conditional approval','final approval','commitment letter'], reply:"Conditional approval means the lender's on board pending a few items (appraisal, docs, etc.) — final approval or a commitment letter means those conditions are cleared and the funds are secured for closing."},

  // ---------- the transaction itself ----------
  {kw:['offer condition','subject to financing','financing condition'], reply:"A 'subject to financing' clause in your offer gives you a window (often 5–7 business days) to firm up your mortgage before you're locked into the purchase — don't waive it unless you're already fully approved."},
  {kw:['subject removal','remove subjects','firm offer'], reply:"Removing subjects (a BC term) means confirming in writing that your financing, inspection, and any other conditions are satisfied — the deal becomes binding. Don't remove financing subjects until your lender's actually signed off."},
  {kw:['deposit vs down payment','earnest money','how much deposit offer'], reply:"They're different: your deposit is money you put down with your offer (often 5%, held in trust) to show you're serious; your down payment is the total equity you're putting toward the purchase at closing. The deposit counts toward your down payment, it's not extra."},
  {kw:['multiple offers','bidding war','competing offers'], reply:"In a bidding war, waiving financing conditions can make your offer more competitive — but it's risky unless you're already fully pre-approved with real numbers, not just an estimate. Talk to James before you waive anything."},
  {kw:['appraisal','appraised value'], reply:"An independent check that the home's actually worth what you're paying. A low appraisal can affect how much a lender will lend."},
  {kw:['home inspection','inspection contingency'], reply:"Not mortgage-related directly, but it protects you — a professional checks the property for issues before you're locked in. Almost always worth including as a condition unless you're in a hot bidding war."},
  {kw:['closing cost','legal fee','land transfer','notary fee','lawyer fee'], reply:"Budget 1.5–4% of purchase price: legal fees, land transfer tax, title insurance, inspection, adjustments. BC's Property Transfer Tax starts at 1%."},
  {kw:['property transfer tax','ptt'], reply:"BC's Property Transfer Tax is 1% on the first $200K, 2% up to $2M, 3% above that (plus more on very high-value homes). First-time buyers and some new builds can qualify for an exemption — worth checking before you assume it applies."},
  {kw:['title insurance'], reply:"A one-time policy protecting against title defects, fraud, or survey issues — typically a few hundred dollars, usually arranged by your lawyer/notary as part of closing."},
  {kw:['notary vs lawyer','use a notary'], reply:"In BC, either a real estate lawyer or a notary public can handle your closing — notaries are often a bit cheaper but can't give legal advice on disputes. Most straightforward residential deals work fine with either."},
  {kw:['closing day','possession day','what happens on closing'], reply:"Closing is when the legal transfer and mortgage funding happen (your lawyer/notary handles it); possession is when you actually get the keys — sometimes the same day, sometimes a day or two apart depending on your contract."},
  {kw:['realtor role','what does a realtor do','realtor vs broker','difference realtor mortgage broker'], reply:"A realtor represents you on the property side — finding homes, negotiating price, handling the offer. A mortgage broker handles the money side — finding and securing your financing. You'll want both, and they work together."},
  {kw:['broker','bank','why use a broker','difference between broker and bank','mortgage broker vs bank'], reply:"A bank sells you their own products. A broker shops dozens of lenders — usually free to you, since the lender pays the commission."},
  {kw:['broker fee','how do brokers get paid','broker commission','does a broker cost money'], reply:"Free on almost every residential deal — the lender pays. Exceptions (private/complex files) must be disclosed upfront, never a surprise."},
  {kw:['how many lenders','shop around banks'], reply:"A broker already shops dozens for you in one file — no need to apply separately to multiple banks and rack up extra credit pulls."},
  {kw:['multiple credit inquiries','credit pulls','shopping hurts credit'], reply:"Rate-shopping for a mortgage within a short window (usually 14–45 days) typically counts as one inquiry for scoring — comparing lenders won't tank your score."},
  {kw:['licensed','regulated','bcfsa','are you regulated','how do i know youre legit'], reply:"BC brokers are licensed by BCFSA, license number publicly verifiable. James's is right in the site footer — always worth checking."},
  {kw:['mortgage fraud','red flags','scam'], reply:"Be wary of anyone guaranteeing approval sight-unseen, asking you to falsify income, or rushing you to sign without reading terms — legitimate brokers never do that."},

  // ---------- payments, prepayment, renewal ----------
  {kw:['prepay','penalty','break my mortgage','pay it off early','extra payment'], reply:"Most mortgages let you pay 15–20%/year extra, free. Break it early and you'll pay 3 months' interest (variable) or an IRD (fixed) — fixed penalties can get steep."},
  {kw:['ird','interest rate differential'], reply:"IRD compares your rate to the lender's current rate for your remaining term — bigger gap, bigger penalty. Fixed mortgages can get hit hard here."},
  {kw:['payment frequency','biweekly','accelerated biweekly','weekly payment'], reply:"Switching to accelerated biweekly payments (half your monthly payment, every two weeks) sneaks in the equivalent of one extra monthly payment a year — a quiet way to pay your mortgage off faster with no extra strain."},
  {kw:['skip a payment','skip payment'], reply:"Some lenders let you skip a payment once a year if you're ahead on prepayments — interest still accrues, so it's a cash-flow tool, not free money."},
  {kw:['renew','renewal','when should i start renewing','how early renew','120 day renewal'], reply:"Don't just sign your bank's renewal letter — they often quietly offer less than a new client would get. Lock a renewal rate 90–120 days out, and start shopping around 4 months before your term ends. Costs nothing to compare."},
  {kw:['what happens if i do nothing renewal','auto renew','automatic renewal'], reply:"If you don't act, your lender auto-renews you — usually at a less competitive rate than a new client would get. Worth comparing 90-120 days ahead so you're not defaulting into their number."},
  {kw:['switch lender','switching lenders','change lenders at renewal'], reply:"You can switch lenders at renewal with no penalty (your term simply ends) — just needs new paperwork and requalifying under current rules. Often the leverage that gets you the better rate."},
  {kw:['refinance','refinancing','pull equity'], reply:"Access up to 80% of your home's value. Usually means breaking your term and requalifying under today's stress test."},
  {kw:['refinance vs renewal','difference refinance renewal'], reply:"Renewal is simply your term ending and rolling into a new one — same loan amount, no requalifying needed if staying with the same lender. Refinancing means changing the loan itself (usually pulling equity or restructuring), which does require requalifying under today's stress test."},
  {kw:['blend and extend','blended rate','early renewal'], reply:"Blends your current rate with today's to extend your term early, no full penalty. Not always cheaper than waiting — run the comparison."},
  {kw:['discharge fee','payout statement','mortgage discharge'], reply:"Expect $200–400 to release your mortgage from title when you pay off or switch, plus a payout statement fee."},
  {kw:['collateral charge','standard charge','registered mortgage'], reply:"Most big bank mortgages register as a collateral charge — harder to switch lenders at renewal without a full refinance. Worth checking which you have."},
  {kw:['term vs amortization','what is a term','mortgage term'], reply:"Amortization = total payoff timeline (e.g. 25 years). Term = how long your current rate/lender deal lasts (e.g. 5 years) before you renew. Not the same thing."},

  // ---------- special situations ----------
  {kw:['missed payment','default on mortgage','power of sale','foreclosure','behind on payments'], reply:"Talk to your lender early — deferrals and restructuring exist. Lenders want their money, not your house."},
  {kw:['lose my job','income drop','cant afford payments'], reply:"Reach out to your lender before you miss a payment — most offer deferral or restructuring options for a temporary income hit. The earlier you flag it, the more options stay open."},
  {kw:['divorce','separation','buyout','equity split'], reply:"A buyout usually means refinancing into one name and qualifying solo for the full mortgage — doable, just a fresh application."},
  {kw:['reverse mortgage','55+','equity release'], reply:"55+, no monthly payments, loan + interest repaid when you sell or pass away. Good for retirement cash flow — but the interest compounds, understand it fully first."},
  {kw:['rental','investment property','second property','rental income','investment property qualifying'], reply:"20%+ down usually required. Lenders count 50–80% of rental income toward qualifying, depending on the lender."},
  {kw:['multiple properties','portfolio'], reply:"Lenders count 50–80% of rental income toward qualifying on a portfolio deal — treatment varies a lot, worth shopping across lenders."},
  {kw:['multigenerational','multi-generational','secondary suite mortgage'], reply:"There are specific programs recognizing multigenerational households and suite income — can sometimes stretch what you qualify for. Worth asking James if it fits your situation."},
  {kw:['rent to own'], reply:"Part of your rent gets credited toward a future down payment, with an option (not always an obligation) to buy later at a pre-set price — higher effective rent, and the fine print really matters. Have a professional review any rent-to-own contract before signing."},
  {kw:['pre-sale','pre sale','new construction','builder','assignment'], reply:"Different rules — deposit structures, builder holdbacks, financing arranged closer to completion. Plan around the builder's timeline early."},
  {kw:['construction mortgage','draw mortgage','builder financing'], reply:"Funds release in stages as construction milestones hit. Interest charged only on what's drawn. Not every lender offers these — confirm early."},
  {kw:['assumable mortgage','assume the mortgage','take over mortgage'], reply:"The buyer takes over the seller's existing mortgage — rate, term, and all. Great if the rate's good, but the buyer still has to qualify."},
  {kw:['port','portable','moving house','sell my house buy another'], reply:"Move your existing mortgage — rate, term, and all — to a new property, no breaking it, no penalty."},
  {kw:['bridge','bridge loan','bridge financing'], reply:"Covers the gap when your new home closes before your old one sells. Short-term, higher cost, solves a real timing problem."},
  {kw:['b lender','private lender','alternative lending'], reply:"For files banks won't touch — credit, income type, timeline. Higher rate, but a real bridge back to an A-lender in a year or two."},
  {kw:['private mortgage','mic','mortgage investment corporation'], reply:"A step beyond B-lenders — higher cost, but built for credit/income situations no traditional lender will touch. Meant to be short-term."},
  {kw:['second mortgage'], reply:"A second charge behind your primary mortgage, usually a different lender — higher rate, used when you need cash without touching your first mortgage's rate."},
  {kw:['heloc','home equity line of credit','readvanceable'], reply:"A revolving credit line against your equity, usually up to 65–80% combined with your mortgage. Easy to lean on interest-only — have a payoff plan."},
  {kw:['line of credit for reno','renovation financing','reno loan'], reply:"A HELOC or a second mortgage can both fund renovations — HELOC is more flexible (draw as needed), a second mortgage gives a lump sum. Depends on the project."},
  {kw:['cash back mortgage','cash-back mortgage'], reply:"A lump sum at closing for a higher rate. You're paying it back with interest over the term — run the real numbers first."},
  {kw:['mortgage life insurance','creditor insurance','disability insurance','mortgage protection insurance'], reply:"Lender-offered creditor insurance is convenient but 'post-claim underwritten' — they check your health when you claim, not when you sign up. Compare to standalone term life first."},
  {kw:['foreign buyer','non resident','non-resident'], reply:"Non-residents face extra restrictions and a foreign buyer tax in the Metro Vancouver area (20%). Rules shift often — confirm current status before assuming."},
  {kw:['underused housing tax','uht'], reply:"A federal tax targeting vacant homes owned by non-resident/non-Canadian owners. Doesn't touch most primary residences, but worth knowing on an investment property."},
  {kw:['vacant home tax','empty homes tax'], reply:"Vancouver's Empty Homes Tax is separate from the federal one — applies if a property sits vacant 6+ months a year. City-specific, don't assume it doesn't apply."},
  {kw:['joint tenancy','tenants in common'], reply:"Joint tenancy = equal ownership, automatically passes to the survivor. Tenants in common = unequal shares, goes to your estate. Talk to a lawyer on this one, not just your broker."},
  {kw:['loan to value','ltv'], reply:"Loan-to-value is your mortgage balance divided by your home's value — 80% LTV means you owe 80% of what it's worth. Lower LTV (more equity) generally means better rates and more refinancing room."},
  {kw:['spousal rrsp','hbp couple','home buyers plan','hbp'], reply:"FHSA: $8K/yr, $40K lifetime, tax-free. HBP: pull $60K from your RRSP tax-free — both spouses can each pull up to $60K, $120K combined, repayable over 15 years each."},
  {kw:['first time','fthb','fhsa'], reply:"FHSA: $8K/yr, $40K lifetime, tax-free. HBP: pull $60K from your RRSP tax-free. BC also has a Property Transfer Tax exemption for first-timers."},
  {kw:['gst new build','hst new home','gst rebate'], reply:"New construction often has GST/HST baked into the price or added separately — confirm which before closing. A federal rebate can offset some of it on qualifying homes."},

  // ---------- misc / meta ----------
  {kw:['app','mobile app','download','ios','android','iphone','phone app'], reply:"There's a free mortgage app — pre-qualify, track your file, message James directly, zero hold music. Link's in the footer. 📱"},
];

const CHATBOT_FALLBACK = [
  "Good question — depends on your specific numbers more than I can guess at here. Worth running past James directly.",
  "Don't want to guess on that one and steer you wrong — James will have a real answer fast.",
  "A bit outside what I can responsibly estimate here — quick, no-obligation question for James."
];

const CHATBOT_DISCLAIMER = "Quick heads-up: everything here is general mortgage knowledge to get you oriented — not a formal offer or advice specific to your file. James Park (Licensed Mortgage Broker, BC #503774) reviews every application personally, and his word is the final say on your numbers. With that said — ask me anything. 🙂";
const CHATBOT_VERIFY_NOTE = "Verifiable only through James Park, Licensed Mortgage Broker (BC #503774).";

/* Filler words stripped out when scoring multi-word keywords, so a real question
   ("how much deposit do I need to buy a house") still hits a keyword phrase
   ("deposit needed to buy") even though the exact wording never lines up —
   matching on the words that actually carry meaning, not sentence structure. */
const CHATBOT_STOPWORDS = new Set(['a','an','the','is','are','was','were','do','does','did','done','i','my','me','you','your','youre',
  'it','its','to','of','in','on','for','and','or','but','if','so','what','whats','how','when','where','why','who',
  'can','could','would','should','will','need','needed','needs','want','wanted','wants','get','getting','gets','got',
  'have','has','had','be','been','being','this','that','these','those','with','about','out','up','down','at','as',
  'im','ive','id','ill','not','no','yes','just','really','actually','also','than','then','there','here']);

function containsKeyword(t, k){
  // single-word keywords need a word boundary — a raw substring check on 'hi' or
  // 'sup' matches inside "this" or "supply", which was silently derailing replies.
  if(k.indexOf(' ') === -1){
    return new RegExp('\\b' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(t);
  }
  return t.includes(k);
}

function matchChatbotReply(text){
  const t = text.toLowerCase();
  const tWordSet = new Set(t.split(/[^a-z0-9']+/).filter(Boolean));
  let best = null, bestScore = 0;
  CHATBOT_KB.forEach(entry => {
    let score = 0;
    entry.kw.forEach(k => {
      if(containsKeyword(t, k)){ score += 3; return; }
      const kWords = k.split(' ').filter(w => !CHATBOT_STOPWORDS.has(w));
      if(kWords.length < 2) return; // single significant word — already covered by the substring check above
      const hits = kWords.filter(w => tWordSet.has(w)).length;
      if(hits >= kWords.length) score += 1.5;               // every significant word present, any order
      else if(kWords.length >= 3 && hits >= kWords.length - 1) score += 0.75; // near-miss on a longer phrase
    });
    if(score > bestScore){ bestScore = score; best = entry; }
  });
  return best ? best.reply : CHATBOT_FALLBACK[Math.floor(Math.random() * CHATBOT_FALLBACK.length)];
}
