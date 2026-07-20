const sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// Absolute site URL for links inside emails — emails have no "current page" to resolve a
// relative href against, so every in-email link must go through this. Automatically correct
// whether running on localhost during testing or on jamespark.ca after go-live.
function siteUrl(path){ return window.location.origin + '/' + path; }

function toast(message){
  let el = document.getElementById('sbToast');
  if(!el){
    el = document.createElement('div');
    el.id = 'sbToast';
    el.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#fff;padding:10px 18px;border-radius:8px;font-size:13px;font-family:system-ui,sans-serif;z-index:99999;box-shadow:0 4px 16px rgba(0,0,0,.25);max-width:90vw;text-align:center;';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.style.display = 'block';
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => { el.style.display = 'none'; }, 4000);
}

async function sendRealEmail(to, subject, html){
  try {
    const { error } = await sb.functions.invoke('send-email', { body: { to, subject, html } });
    if(error) console.error('[send-email] failed', error);
  } catch(err){
    console.error('[send-email] invoke threw', err);
  }
}
