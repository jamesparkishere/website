/* ================= Shared lead-capture module =================
   Consolidates what used to be copy-pasted into index.html, purchase.html,
   refinance.html, renewal.html, mortgage-pre-approval.html, burn-my-mortgage.html.
   pushPrequalLead() now inserts a real row into Supabase's `leads` table instead
   of localStorage. Notification functions keep their existing localStorage
   write (admin.html's Email Marketing log still reads it) and additionally fire
   a real send via the `send-email` Edge Function, non-blocking. */

function timestamp(){
  const d = new Date();
  return d.toLocaleDateString('en-CA', {month:'short', day:'numeric'}) + ', ' + d.toLocaleTimeString('en-CA', {hour:'numeric', minute:'2-digit'});
}

function generatePrequalCode(){
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const key = 'jp_prequal_codes_v1';
  let used;
  try { used = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e){ used = []; }
  let letters;
  do {
    letters = '';
    for(let i=0;i<8;i++) letters += chars[Math.floor(Math.random()*chars.length)];
  } while(used.includes(letters));
  used.push(letters);
  localStorage.setItem(key, JSON.stringify(used));
  const d = new Date();
  const dateStr = d.getFullYear() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
  return letters + '-' + dateStr;
}

function maskCodeHTML(code){
  // First 6 characters stay hidden until the client logs in — see client-login.html for the reveal.
  return '<span class="code-mask">&#42;&#42;&#42;&#42;&#42;&#42;</span>' + code.slice(6);
}

async function pushPrequalLead(payload, contact){
  const todayStr = new Date().toISOString().slice(0,10);
  const nameParts = contact.name.split(' ');
  const newLead = {
    id: 'lead-web-' + Date.now(), code: payload.code, name: contact.name, firstName: nameParts[0] || contact.name, lastName: nameParts.slice(1).join(' '),
    email: contact.email, phone: contact.phone, city: payload.city, purposeType: payload.purpose, keyDate: todayStr,
    amount: payload.mortgageAmount, gds: Math.round(payload.gds*10)/10, tds: Math.round(payload.tds*10)/10, credit: payload.credit, score: payload.score,
    temperature: payload.compliant === false ? 'warm' : (payload.score >= 70 ? 'hot' : payload.score >= 40 ? 'warm' : 'dead'),
    notes: [{text: (payload.compliant === false ? '⚠ NEEDS MANUAL REVIEW — outside GDS/TDS guidelines. ' : '') + 'Created certificate account. Code: ' + payload.code + '.', date: timestamp()}],
    scoreLog: [{delta: payload.score, reason:'Online pre-qualification submission', date: todayStr}],
    registered: todayStr, pipeline: (payload.purpose === 'Refinance' ? 'Refinance Pipeline' : payload.purpose === 'Renewal' ? 'Renewal Pipeline' : 'Purchase Pipeline'),
    stage: 'New', opens: 0, clicks: 0, custom: {},
    certificatePayload: payload
  };
  const { error } = await sb.from('leads').insert({ id: newLead.id, record_type: 'lead', email: newLead.email, data: newLead });
  if(error) console.error('[Supabase] pushPrequalLead failed', error);
  return newLead;
}

async function assignLeadToRealtor(leadId, realtor, shareAmount){
  const { data, error: fetchErr } = await sb.from('leads').select('data').eq('id', leadId).single();
  if(fetchErr || !data){ console.error('[Supabase] assignLeadToRealtor fetch failed', fetchErr); return; }
  const lead = data.data;
  lead.assignedPartnerId = realtor.id;
  lead.assignedPartnerName = realtor.name;
  lead.partnerStage = 'New';
  lead.notes = lead.notes || [];
  lead.notes.push({text: `Referred to realtor ${realtor.name}${shareAmount ? ' (pre-qualification amount shared)' : ''}.`, date: timestamp()});
  const { error } = await sb.from('leads').update({ data: lead }).eq('id', leadId);
  if(error) console.error('[Supabase] assignLeadToRealtor update failed', error);
}

function pushRealtorSmsAlert(payload, contact, realtor, shareAmount){
  const key = 'jp_sms_history_v1';
  let history;
  try { history = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e){ history = []; }
  const budgetLine = shareAmount ? `, budget ~${payload.priceFormatted}` : '';
  history.push({id:'sms'+Date.now()+Math.random(), leadName: realtor.name + ' — realtor referral', phone: realtor.phone, direction:'out',
    body: `James Park referred a client your way: ${contact.name}, ${contact.phone}, ${contact.email}. Looking to ${payload.purpose.toLowerCase()} in ${payload.city}${budgetLine}. Reach out when you can.`,
    when: timestamp(), status:'delivered'});
  localStorage.setItem(key, JSON.stringify(history));
}

function pushInternalSmsAlert(payload, contact){
  const key = 'jp_sms_history_v1';
  let history;
  try { history = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e){ history = []; }
  const smsPrefix = payload.compliant === false ? '⚠ REVIEW NEEDED — ' : '';
  history.push({id:'sms'+Date.now()+Math.random(), leadName:'James — new lead alert', phone:'778-222-7109', direction:'out',
    body: `${smsPrefix}New pre-qualification: ${contact.name}, score ${payload.score}/100 (${payload.verdictLabel}), ${payload.purpose} in ${payload.city}, ${payload.mortgageFormatted}. Code ${payload.code}. Call within 30 min.`,
    when: timestamp(), status:'delivered'});
  localStorage.setItem(key, JSON.stringify(history));
}

function pushEmailNotification(payload, contact){
  const key = 'jp_email_log_v1';
  let log;
  try { log = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e){ log = []; }
  const subjectPrefix = payload.compliant === false ? '⚠ REVIEW NEEDED — ' : '';
  const bodyPrefix = payload.compliant === false ? 'This file is OUTSIDE standard GDS/TDS guidelines — please look this over personally and find the best lender/rate fit before responding.\n\n' : '';
  const subject = subjectPrefix + 'New Pre-Qualification — ' + contact.name + ' (' + payload.code + ')';
  const body = bodyPrefix + `Name: ${contact.name}\nEmail: ${contact.email}\nPhone: ${contact.phone}\nCode: ${payload.code}\nScore: ${payload.score}/100 (${payload.verdictLabel})\nPurpose: ${payload.purpose}\nCity: ${payload.city}\nMortgage amount: ${payload.mortgageFormatted}\nEstimated payment: ${payload.paymentFormatted}\nGDS/TDS: ${payload.gds.toFixed(1)}% / ${payload.tds.toFixed(1)}%\nCredit: ${payload.credit}`;
  log.push({id:'email'+Date.now(), to:'james@jamespark.ca', subject, body, when: timestamp(), read:false});
  localStorage.setItem(key, JSON.stringify(log));
  sendRealEmail('james@jamespark.ca', subject, body.replace(/\n/g, '<br>'));
}

function pushRealtorReferralEmail(payload, contact, realtor, shareAmount){
  const key = 'jp_email_log_v1';
  let log;
  try { log = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e){ log = []; }
  const body = shareAmount
    ? `Hi ${realtor.name},\n\nJames Park referred a client your way:\n\nName: ${contact.name}\nPhone: ${contact.phone}\nEmail: ${contact.email}\nLooking to: ${payload.purpose} in ${payload.city}\nPre-qualified amount: ${payload.mortgageFormatted}\n\nThey've agreed to share their pre-qualification amount with you so you know their budget going in. Reach out whenever works — they're expecting to hear from you.\n\n— James Park Mortgage`
    : `Hi ${realtor.name},\n\nJames Park referred a client your way who may need a realtor:\n\nName: ${contact.name}\nPhone: ${contact.phone}\nEmail: ${contact.email}\nLooking to: ${payload.purpose} in ${payload.city}\n\nThey haven't shared specific budget details yet, but they're pre-qualified and actively looking. Reach out whenever works.\n\n— James Park Mortgage`;
  const subject = `New Referral — ${contact.name} is looking to ${payload.purpose.toLowerCase()} in ${payload.city}`;
  log.push({id:'email'+Date.now()+'-referral', to: realtor.email, subject, body, when: timestamp(), read:false});
  localStorage.setItem(key, JSON.stringify(log));
  sendRealEmail(realtor.email, subject, body.replace(/\n/g, '<br>'));
}

function sendWelcomeEmail(payload, contact){
  const key = 'jp_email_log_v1';
  let log;
  try { log = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e){ log = []; }
  const subject = 'Welcome, ' + contact.name.split(' ')[0] + ' — Your Pre-Qualification Certificate & Account';
  const body = `Hi ${contact.name.split(' ')[0]},\n\nYour pre-qualification account is ready. Here's your code: ${payload.code}\n\nLog in anytime at ${siteUrl('client-login.html')} with this email address and the password you just set to check your file status, key dates, and re-download your certificate.\n\nJames has been notified and will follow up personally.\n\n— James Park Mortgage`;
  log.push({id:'email'+Date.now()+'-welcome', to: contact.email, subject, body, when: timestamp(), read:false});
  localStorage.setItem(key, JSON.stringify(log));
  sendRealEmail(contact.email, subject, body.replace(/\n/g, '<br>'));
}
