---
title: "Cellular Identifiers: ICCID, IMSI, IMEI, EID and MSISDN"
date: 2026-05-14T15:36:33
image: "/wp-content/uploads/2026/05/Cellular-Identifiers-Hub-ICCID-IMSI-IMEI-EID-MSISDN-TAC-EUICCID-Decoded.png"
category: "Telecom"
---


<div style="background-color: #fff4e5; border-left: 5px solid #FF9800; padding: 1.4em 1.6em; margin: 2em 0; border-radius: 6px; font-family: Arial, sans-serif; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
<div style="color: #ff9800; font-size: 1.05em; font-weight: bold; margin-bottom: 0.9em;">TL;DR</div>
<p style="margin: 0; line-height: 1.6;">A cellular network relies on multiple identifiers, each tied to a different layer of the system. The <span style="font-weight: bold;">ICCID</span> identifies the SIM card, the <span style="font-weight: bold;">IMSI</span> identifies the subscriber, the <span style="font-weight: bold;">IMEI</span> identifies the device, the <span style="font-weight: bold;">EID (or EUICCID)</span> identifies the eSIM chip, and the <span style="font-weight: bold;">MSISDN</span> represents the phone number users dial. The first eight digits of the IMEI form the <span style="font-weight: bold;">TAC</span>, which identifies the device model. <br /><br />The <span style="font-weight: bold;">ICCID</span> and <span style="font-weight: bold;">IMSI</span> belong to the <span style="font-weight: bold;">SIM profile</span> and can change when profiles are updated. In contrast, the <span style="font-weight: bold;">IMEI</span> and <span style="font-weight: bold;">EID</span> are <span style="font-weight: bold;">hardware-bound identifiers</span> that typically remain fixed for the life of the device.</p>
</div>



<figure class="wp-block-image aligncenter size-large is-resized"><img loading="lazy" decoding="async" width="888" height="500" class="wp-image-17681" style="width: 888px;" src="/wp-content/uploads/2026/05/ChatGPT-Image-May-14-2026-09_11_43-PM-1024x576.png" alt="Illustration showing the hierarchy of mobile network identifiers in an eSIM-enabled smartphone. The diagram maps the relationship between Device (IMEI/TAC), eUICC chip (EID), eSIM profile (ICCID), Subscriber identity (IMSI), and Phone Number (MSISDN), connected in a top-to-bottom flow" srcset="/wp-content/uploads/2026/05/ChatGPT-Image-May-14-2026-09_11_43-PM-1024x576.png 1024w, /wp-content/uploads/2026/05/ChatGPT-Image-May-14-2026-09_11_43-PM-300x169.png 300w, /wp-content/uploads/2026/05/ChatGPT-Image-May-14-2026-09_11_43-PM-768x432.png 768w, /wp-content/uploads/2026/05/ChatGPT-Image-May-14-2026-09_11_43-PM-1536x864.png 1536w, /wp-content/uploads/2026/05/ChatGPT-Image-May-14-2026-09_11_43-PM.png 1672w" sizes="(max-width: 888px) 100vw, 888px" /></figure>



<h2 class="wp-block-heading"><strong>Check Your ICCID, IMEI or IMSI Instantly</strong></h2>



<p class="wp-block-paragraph">Use the free tool below. It parses all three identifiers, validates the Luhn checksum on ICCIDs and IMEIs, and shows you what each segment means. Everything runs client-side in your browser, with no data sent anywhere.</p>



<p>&nbsp;</p>
<div id="sci-root" class="sci-root">
<div class="sci-shell"><!-- Header --><header class="sci-head">
<div class="sci-head-badge">SPENZA  TOOL</div>
<h2 class="sci-h2">Cellular Identifier Tools</h2>
<p class="sci-sub">Decode any ICCID, IMEI or IMSI. Validates checksums and breaks down every segment. Runs entirely in your browser — nothing is uploaded.</p>
</header><!-- Tabs -->
<div class="sci-tabs" role="tablist" aria-label="Identifier tools"><button class="sci-tab sci-tab-on" role="tab" aria-selected="true" data-tab="iccid">ICCID Parser</button> <button class="sci-tab" role="tab" aria-selected="false" data-tab="imei">IMEI / TAC Decoder</button> <button class="sci-tab" role="tab" aria-selected="false" data-tab="imsi">IMSI Breakdown</button></div>
<!-- ============ ICCID PANEL ============ -->
<section class="sci-panel sci-panel-on" data-panel="iccid"><label class="sci-label" for="sci-iccid-in">Enter a 19 or 20 digit ICCID (SIM serial number)</label>
<div class="sci-inrow"><input id="sci-iccid-in" class="sci-input" spellcheck="false" autocomplete="off" type="text" placeholder="e.g. 8991101200003204510" /> <button id="sci-iccid-go" class="sci-btn">Parse</button></div>
<div class="sci-hintrow"><button class="sci-sample" data-fill="sci-iccid-in" data-val="8944500712983201555">Try a sample</button> <span class="sci-priv" title="This tool runs 100% in your browser. No ICCID, IMEI or IMSI you enter is ever sent to a server or logged.">ⓘ Private &amp; client-side</span></div>
<div id="sci-iccid-out" class="sci-out" hidden=""> </div>
</section>
<!-- ============ IMEI PANEL ============ -->
<section class="sci-panel" data-panel="imei"><label class="sci-label" for="sci-imei-in">Enter a 15 digit IMEI (device identifier) — dial *#06# to find yours</label>
<div class="sci-inrow"><input id="sci-imei-in" class="sci-input" spellcheck="false" autocomplete="off" type="text" placeholder="e.g. 490154203237518" /> <button id="sci-imei-go" class="sci-btn">Decode</button></div>
<div class="sci-hintrow"><button class="sci-sample" data-fill="sci-imei-in" data-val="356938035643809">Try a sample</button> <span class="sci-priv" title="This tool runs 100% in your browser. No ICCID, IMEI or IMSI you enter is ever sent to a server or logged.">ⓘ Private &amp; client-side</span></div>
<div id="sci-imei-out" class="sci-out" hidden=""> </div>
</section>
<!-- ============ IMSI PANEL ============ -->
<section class="sci-panel" data-panel="imsi"><label class="sci-label" for="sci-imsi-in">Enter an IMSI (up to 15 digits, subscriber identity)</label>
<div class="sci-inrow"><input id="sci-imsi-in" class="sci-input" spellcheck="false" autocomplete="off" type="text" placeholder="e.g. 310260123456789" /> <button id="sci-imsi-go" class="sci-btn">Break down</button></div>
<div class="sci-hintrow"><button class="sci-sample" data-fill="sci-imsi-in" data-val="404451234567890">Try a sample</button> <span class="sci-priv" title="This tool runs 100% in your browser. No ICCID, IMEI or IMSI you enter is ever sent to a server or logged.">ⓘ Private &amp; client-side</span></div>
<div id="sci-imsi-out" class="sci-out" hidden=""> </div>
</section>
<!-- Embed + CTA footer --><footer class="sci-foot"><details class="sci-embed">
<summary>&lt;/&gt;  Embed this tool on your site</summary>
<p class="sci-embed-note">Copy the snippet below. Replace the URL with the published page once it is live.</p>
<code id="sci-embed-code" class="sci-embed-code">&lt;iframe src="https://spenza.com/telecom/cellular-identifiers-decoded/" width="100%" height="640" style="border:0;border-radius:14px" title="Spenza Cellular Identifier Tools" loading="lazy"&gt;&lt;/iframe&gt;</code> <button id="sci-copy" class="sci-copy">Copy embed code</button></details><a class="sci-cta" href="https://spenza.com/contact-us/" target="_blank" rel="noopener"> Managing ICCIDs and IMSIs across a fleet? <strong>See how Spenza handles it →</strong> </a></footer></div>
</div>
<p><style>
/* ---- Scoped brand tokens ---- */
.sci-root{
  --sci-orange:#EA580C;
  --sci-orange-dk:#C2410C;
  --sci-ink:#1A1A1A;
  --sci-charcoal:#262626;
  --sci-grey:#5C5C5C;
  --sci-line:#E6E3DF;
  --sci-bg:#F7F7F7;
  --sci-card:#FFFFFF;
  --sci-tint:#FBEDE6;
  --sci-good:#15803D;
  --sci-good-bg:#E7F4EC;
  --sci-bad:#B91C1C;
  --sci-bad-bg:#FBEAEA;
  --sci-c1:#EA580C; /* segment colors */
  --sci-c2:#2563EB;
  --sci-c3:#7C3AED;
  --sci-c4:#0D9488;
  --sci-c5:#64748B;
  --sci-radius:16px;
  --sci-display:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  --sci-body:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  all:initial;
  display:block;
  font-family:var(--sci-body);
  color:var(--sci-ink);
  -webkit-font-smoothing:antialiased;
  line-height:1.55;
  box-sizing:border-box;
}
.sci-root *,.sci-root *::before,.sci-root *::after{box-sizing:border-box;margin:0;padding:0;}

.sci-shell{
  max-width:760px;
  margin:0 auto;
  background:var(--sci-card);
  border:1px solid var(--sci-line);
  border-radius:var(--sci-radius);
  overflow:hidden;
  box-shadow:0 1px 2px rgba(20,20,20,.04),0 18px 40px -22px rgba(20,20,20,.22);
}

/* ---- Header ---- */
.sci-head{
  padding:26px 26px 22px;
  background:
    radial-gradient(120% 140% at 100% 0%, rgba(234,88,12,.10) 0%, rgba(234,88,12,0) 55%),
    var(--sci-card);
  border-bottom:1px solid var(--sci-line);
}
.sci-head-badge{
  display:inline-block;
  font-family:var(--sci-display);
  font-weight:800;
  font-size:11px;
  letter-spacing:.14em;
  color:var(--sci-orange);
  background:var(--sci-tint);
  padding:5px 10px;
  border-radius:6px;
  margin-bottom:12px;
}
.sci-h2{
  font-family:var(--sci-display);
  font-weight:800;
  font-size:25px;
  letter-spacing:-.02em;
  color:var(--sci-ink);
  margin-bottom:6px;
}
.sci-sub{
  font-size:14px;
  color:var(--sci-grey);
  max-width:56ch;
}

/* ---- Tabs ---- */
.sci-tabs{
  display:flex;
  gap:4px;
  padding:14px 14px 0;
  background:var(--sci-bg);
  border-bottom:1px solid var(--sci-line);
  flex-wrap:wrap;
}
.sci-tab{
  font-family:var(--sci-display);
  font-weight:700;
  font-size:13.5px;
  color:var(--sci-grey);
  background:transparent;
  border:1px solid transparent;
  border-bottom:none;
  padding:11px 16px;
  border-radius:10px 10px 0 0;
  cursor:pointer;
  transition:background .15s,color .15s;
}
.sci-tab:hover{color:var(--sci-ink);}
.sci-tab-on{
  background:var(--sci-card);
  color:var(--sci-orange);
  border-color:var(--sci-line);
  box-shadow:0 -2px 0 var(--sci-orange) inset;
}

/* ---- Panels ---- */
.sci-panel{display:none;padding:24px 26px 8px;}
.sci-panel-on{display:block;}
.sci-label{
  display:block;
  font-size:13px;
  font-weight:600;
  color:var(--sci-charcoal);
  margin-bottom:9px;
}
.sci-inrow{display:flex;gap:9px;flex-wrap:wrap;}
.sci-input{
  flex:1 1 240px;
  font-family:var(--sci-body);
  font-size:15px;
  letter-spacing:.04em;
  color:var(--sci-ink);
  padding:13px 14px;
  border:1.5px solid var(--sci-line);
  border-radius:11px;
  background:var(--sci-card);
  outline:none;
  transition:border-color .15s,box-shadow .15s;
  min-width:0;
}
.sci-input:focus{
  border-color:var(--sci-orange);
  box-shadow:0 0 0 3px rgba(234,88,12,.13);
}
.sci-btn{
  font-family:var(--sci-display);
  font-weight:700;
  font-size:14px;
  color:#fff;
  background:var(--sci-orange);
  border:none;
  padding:0 22px;
  border-radius:11px;
  cursor:pointer;
  transition:background .15s,transform .05s;
  min-height:48px;
}
.sci-btn:hover{background:var(--sci-orange-dk);}
.sci-btn:active{transform:translateY(1px);}

.sci-hintrow{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  margin-top:10px;
  flex-wrap:wrap;
}
.sci-sample{
  font-family:var(--sci-body);
  font-size:12.5px;
  font-weight:600;
  color:var(--sci-orange);
  background:none;
  border:none;
  border-bottom:1px dashed var(--sci-orange);
  cursor:pointer;
  padding:0 0 1px;
}
.sci-priv{
  font-size:12px;
  color:var(--sci-grey);
  cursor:help;
}

/* ---- Output ---- */
.sci-out{margin-top:20px;}
.sci-status{
  display:flex;
  align-items:center;
  gap:9px;
  font-family:var(--sci-display);
  font-weight:700;
  font-size:14px;
  padding:11px 14px;
  border-radius:11px;
  margin-bottom:16px;
}
.sci-status-ok{color:var(--sci-good);background:var(--sci-good-bg);}
.sci-status-bad{color:var(--sci-bad);background:var(--sci-bad-bg);}
.sci-status-warn{color:var(--sci-orange-dk);background:var(--sci-tint);}
.sci-dot{width:8px;height:8px;border-radius:50%;background:currentColor;flex:none;}

/* digit ribbon */
.sci-ribbon{
  display:flex;
  flex-wrap:wrap;
  gap:3px;
  padding:14px;
  background:var(--sci-bg);
  border:1px solid var(--sci-line);
  border-radius:12px;
  margin-bottom:16px;
}
.sci-seg{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:5px;
}
.sci-seg-digits{
  font-family:var(--sci-body);
  font-weight:600;
  font-size:15px;
  letter-spacing:.06em;
  color:#fff;
  padding:7px 8px;
  border-radius:7px;
  line-height:1;
}
.sci-seg-tag{
  font-family:var(--sci-display);
  font-weight:700;
  font-size:9.5px;
  letter-spacing:.05em;
  text-transform:uppercase;
}
.sci-c1 .sci-seg-digits{background:var(--sci-c1);} .sci-c1 .sci-seg-tag{color:var(--sci-c1);}
.sci-c2 .sci-seg-digits{background:var(--sci-c2);} .sci-c2 .sci-seg-tag{color:var(--sci-c2);}
.sci-c3 .sci-seg-digits{background:var(--sci-c3);} .sci-c3 .sci-seg-tag{color:var(--sci-c3);}
.sci-c4 .sci-seg-digits{background:var(--sci-c4);} .sci-c4 .sci-seg-tag{color:var(--sci-c4);}
.sci-c5 .sci-seg-digits{background:var(--sci-c5);} .sci-c5 .sci-seg-tag{color:var(--sci-c5);}

/* breakdown rows */
.sci-rows{border:1px solid var(--sci-line);border-radius:12px;overflow:hidden;}
.sci-row{
  display:grid;
  grid-template-columns:140px 1fr;
  gap:14px;
  padding:12px 15px;
  font-size:13.5px;
  border-bottom:1px solid var(--sci-line);
}
.sci-row:last-child{border-bottom:none;}
.sci-row:nth-child(odd){background:var(--sci-bg);}
.sci-row-k{
  font-weight:700;
  font-family:var(--sci-display);
  color:var(--sci-charcoal);
  display:flex;align-items:center;gap:7px;
}
.sci-swatch{width:9px;height:9px;border-radius:3px;flex:none;}
.sci-row-v{color:var(--sci-ink);}
.sci-row-v b{font-weight:600;}
.sci-mono{
  font-family:var(--sci-body);
  letter-spacing:.05em;
  font-weight:600;
}
.sci-note{
  font-size:12px;
  color:var(--sci-grey);
  margin-top:12px;
  padding-left:2px;
}
.sci-note a{color:var(--sci-orange);text-decoration:none;font-weight:600;}
.sci-note a:hover{text-decoration:underline;}

/* ---- Footer ---- */
.sci-foot{
  margin-top:14px;
  padding:18px 26px 24px;
  border-top:1px solid var(--sci-line);
  background:var(--sci-bg);
}
.sci-embed{margin-bottom:16px;}
.sci-embed summary{
  font-family:var(--sci-display);
  font-weight:700;
  font-size:13px;
  color:var(--sci-charcoal);
  cursor:pointer;
  list-style:none;
}
.sci-embed summary::-webkit-details-marker{display:none;}
.sci-embed-note{font-size:12.5px;color:var(--sci-grey);margin:10px 0 8px;}
.sci-embed-code{
  display:block;
  font-family:var(--sci-body);
  font-size:11.5px;
  color:var(--sci-ink);
  background:var(--sci-card);
  border:1px solid var(--sci-line);
  border-radius:9px;
  padding:11px 12px;
  word-break:break-all;
  margin-bottom:9px;
}
.sci-copy{
  font-family:var(--sci-display);
  font-weight:700;
  font-size:12.5px;
  color:var(--sci-charcoal);
  background:var(--sci-card);
  border:1px solid var(--sci-line);
  border-radius:9px;
  padding:8px 14px;
  cursor:pointer;
}
.sci-copy:hover{border-color:var(--sci-orange);color:var(--sci-orange);}
.sci-cta{
  display:block;
  font-family:var(--sci-body);
  font-size:14px;
  color:var(--sci-ink);
  text-decoration:none;
  background:var(--sci-card);
  border:1px solid var(--sci-line);
  border-left:4px solid var(--sci-orange);
  border-radius:11px;
  padding:14px 16px;
  transition:box-shadow .15s;
}
.sci-cta:hover{box-shadow:0 8px 22px -12px rgba(234,88,12,.4);}
.sci-cta strong{color:var(--sci-orange);font-weight:700;white-space:nowrap;}

/* ---- Responsive ---- */
@media (max-width:560px){
  .sci-head,.sci-panel,.sci-foot{padding-left:18px;padding-right:18px;}
  .sci-h2{font-size:21px;}
  .sci-btn{flex:1 1 100%;}
  .sci-row{grid-template-columns:1fr;gap:3px;}
  .sci-row-v{padding-left:16px;}
  .sci-tab{flex:1 1 auto;text-align:center;font-size:12.5px;padding:10px 8px;}
}
</style> <script>
(function(){
  var root = document.getElementById('sci-root');
  if(!root) return;

  /* ---------- data ---------- */
  // ITU-T E.164 telephone country codes (used as the ICCID country segment).
  // Longest-prefix match. Not exhaustive but covers the common cases.
  var E164 = {
    "1":"North America (US / Canada)","7":"Russia / Kazakhstan","20":"Egypt","27":"South Africa",
    "30":"Greece","31":"Netherlands","32":"Belgium","33":"France","34":"Spain","36":"Hungary",
    "39":"Italy","40":"Romania","41":"Switzerland","43":"Austria","44":"United Kingdom","45":"Denmark",
    "46":"Sweden","47":"Norway","48":"Poland","49":"Germany","51":"Peru","52":"Mexico","53":"Cuba",
    "54":"Argentina","55":"Brazil","56":"Chile","57":"Colombia","58":"Venezuela","60":"Malaysia",
    "61":"Australia","62":"Indonesia","63":"Philippines","64":"New Zealand","65":"Singapore",
    "66":"Thailand","81":"Japan","82":"South Korea","84":"Vietnam","86":"China","90":"Turkey",
    "91":"India","92":"Pakistan","93":"Afghanistan","94":"Sri Lanka","95":"Myanmar","98":"Iran",
    "212":"Morocco","213":"Algeria","216":"Tunisia","218":"Libya","220":"Gambia","221":"Senegal",
    "233":"Ghana","234":"Nigeria","254":"Kenya","255":"Tanzania","256":"Uganda","260":"Zambia",
    "263":"Zimbabwe","351":"Portugal","352":"Luxembourg","353":"Ireland","354":"Iceland",
    "356":"Malta","357":"Cyprus","358":"Finland","359":"Bulgaria","370":"Lithuania","371":"Latvia",
    "372":"Estonia","380":"Ukraine","385":"Croatia","386":"Slovenia","420":"Czech Republic",
    "421":"Slovakia","886":"Taiwan","960":"Maldives","961":"Lebanon","962":"Jordan","963":"Syria",
    "964":"Iraq","965":"Kuwait","966":"Saudi Arabia","968":"Oman","971":"United Arab Emirates",
    "972":"Israel","973":"Bahrain","974":"Qatar","977":"Nepal","992":"Tajikistan","998":"Uzbekistan"
  };

  // Mobile Country Codes (ITU-T E.212) for IMSI. Common set.
  var MCC = {
    "202":"Greece","204":"Netherlands","206":"Belgium","208":"France","214":"Spain","216":"Hungary",
    "222":"Italy","226":"Romania","228":"Switzerland","230":"Czech Republic","231":"Slovakia",
    "232":"Austria","234":"United Kingdom","235":"United Kingdom","238":"Denmark","240":"Sweden",
    "242":"Norway","244":"Finland","246":"Lithuania","247":"Latvia","248":"Estonia","250":"Russia",
    "255":"Ukraine","262":"Germany","266":"Gibraltar","268":"Portugal","270":"Luxembourg",
    "272":"Ireland","274":"Iceland","276":"Albania","278":"Malta","280":"Cyprus","284":"Bulgaria",
    "286":"Turkey","293":"Slovenia","294":"North Macedonia","302":"Canada","310":"United States",
    "311":"United States","312":"United States","313":"United States","314":"United States",
    "315":"United States","316":"United States","330":"Puerto Rico","334":"Mexico","404":"India",
    "405":"India","406":"India","410":"Pakistan","413":"Sri Lanka","414":"Myanmar","415":"Lebanon",
    "416":"Jordan","418":"Iraq","419":"Kuwait","420":"Saudi Arabia","424":"United Arab Emirates",
    "425":"Israel","426":"Bahrain","427":"Qatar","432":"Iran","440":"Japan","441":"Japan",
    "450":"South Korea","452":"Vietnam","454":"Hong Kong","455":"Macau","460":"China","466":"Taiwan",
    "470":"Bangladesh","472":"Maldives","502":"Malaysia","505":"Australia","510":"Indonesia",
    "515":"Philippines","520":"Thailand","525":"Singapore","530":"New Zealand","602":"Egypt",
    "605":"Tunisia","607":"Gambia","608":"Senegal","620":"Ghana","621":"Nigeria","639":"Kenya",
    "640":"Tanzania","641":"Uganda","645":"Zambia","648":"Zimbabwe","655":"South Africa",
    "722":"Argentina","724":"Brazil","730":"Chile","732":"Colombia","734":"Venezuela","748":"Uruguay"
  };

  // MCCs where the MNC is conventionally 3 digits (North America + a few others).
  var MNC3 = {"302":1,"310":1,"311":1,"312":1,"313":1,"314":1,"315":1,"316":1,"330":1,"334":1,"338":1,"342":1,"344":1,"346":1,"348":1,"352":1,"356":1,"358":1,"360":1,"365":1,"366":1,"376":1,"708":1,"722":1,"732":1};

  // A small, well-known sample of MCC+MNC -> operator. Illustrative only.
  var OPERATOR = {
    "310260":"T-Mobile US","310410":"AT&T US","311480":"Verizon US","310120":"Sprint / T-Mobile US",
    "302220":"Telus (Canada)","302610":"Bell (Canada)","302720":"Rogers (Canada)",
    "23410":"O2 (UK)","23415":"Vodafone (UK)","23420":"Three (UK)","23430":"EE (UK)",
    "26201":"Telekom (Germany)","26202":"Vodafone (Germany)","26203":"Telefonica/O2 (Germany)",
    "20801":"Orange (France)","20810":"SFR (France)","20820":"Bouygues (France)","20815":"Free (France)",
    "40410":"Airtel (India)","40445":"Airtel (India)","40551":"Airtel (India)","40486":"Vi (India)",
    "405840":"Jio (India)","405854":"Jio (India)","52001":"AIS (Thailand)","50501":"Telstra (Australia)",
    "50502":"Optus (Australia)","46000":"China Mobile","46001":"China Unicom","46011":"China Telecom"
  };

  /* ---------- utils ---------- */
  function digits(s){ return (s||'').replace(/\D/g,''); }

  // Luhn checksum validation over a full numeric string (last digit = check digit).
  function luhnValid(num){
    if(num.length < 2) return false;
    var sum=0, alt=false;
    for(var i=num.length-1;i>=0;i--){
      var d=parseInt(num.charAt(i),10);
      if(alt){ d*=2; if(d>9) d-=9; }
      sum+=d; alt=!alt;
    }
    return sum%10===0;
  }
  // Compute the Luhn check digit for a base string (no check digit yet).
  function luhnDigit(base){
    var sum=0, alt=true;
    for(var i=base.length-1;i>=0;i--){
      var d=parseInt(base.charAt(i),10);
      if(alt){ d*=2; if(d>9) d-=9; }
      sum+=d; alt=!alt;
    }
    return (10-(sum%10))%10;
  }
  function esc(s){ return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];}); }

  function statusHtml(kind,text){
    var cls = kind==='ok'?'sci-status-ok':kind==='bad'?'sci-status-bad':'sci-status-warn';
    return '<div class="sci-status '+cls+'"><span class="sci-dot"></span>'+esc(text)+'</div>';
  }
  // segments: [{digits, tag, color}]
  function ribbonHtml(segs){
    var h='<div class="sci-ribbon">';
    segs.forEach(function(s){
      if(!s.digits) return;
      h+='<div class="sci-seg '+s.color+'"><span class="sci-seg-digits">'+esc(s.digits)+'</span><span class="sci-seg-tag">'+esc(s.tag)+'</span></div>';
    });
    return h+'</div>';
  }
  // rows: [{k, v, color}]
  function rowsHtml(rows){
    var h='<div class="sci-rows">';
    rows.forEach(function(r){
      var sw = r.color ? '<span class="sci-swatch" style="background:'+colorVar(r.color)+'"></span>' : '';
      h+='<div class="sci-row"><div class="sci-row-k">'+sw+esc(r.k)+'</div><div class="sci-row-v">'+r.v+'</div></div>';
    });
    return h+'</div>';
  }
  function colorVar(c){
    return {'sci-c1':'#EA580C','sci-c2':'#2563EB','sci-c3':'#7C3AED','sci-c4':'#0D9488','sci-c5':'#64748B'}[c]||'#64748B';
  }

  /* ---------- ICCID ---------- */
  function parseIccid(raw){
    var n = digits(raw);
    var out = document.getElementById('sci-iccid-out');
    if(n.length < 18 || n.length > 22){
      out.hidden=false;
      out.innerHTML = statusHtml('bad','Enter a valid ICCID. Expected 19 to 20 digits (some run 18 to 22). You entered '+n.length+'.');
      return;
    }
    // MII
    var mii = n.slice(0,2);
    var miiTxt = mii==='89' ? 'Telecommunications (valid SIM prefix)' : 'Unexpected. Real SIM ICCIDs begin with 89.';
    // Country code: greedy longest-prefix match against E.164 (3 -> 2 -> 1 digits)
    var cc='', ccName='Not matched (issuer may use a non-standard code)';
    for(var len=3; len>=1; len--){
      var cand = n.slice(2,2+len);
      if(E164[cand]){ cc=cand; ccName=E164[cand]; break; }
    }
    var afterCc = 2 + (cc?cc.length:0);
    // Issuer identifier: convention is the next 2 digits (can be longer)
    var issuer = n.slice(afterCc, afterCc+2);
    // Account id = everything between issuer and the final check digit
    var account = n.slice(afterCc+2, n.length-1);
    var check = n.slice(-1);
    // Luhn: standard ICCID validates across the whole number incl. check digit
    var valid = luhnValid(n);
    var expected = luhnDigit(n.slice(0,-1));

    var segs = [
      {digits:mii, tag:'MII', color:'sci-c1'},
      {digits:cc||'?', tag:'Country', color:'sci-c2'},
      {digits:issuer, tag:'Issuer', color:'sci-c3'},
      {digits:account, tag:'Account ID', color:'sci-c4'},
      {digits:check, tag:'Check', color:'sci-c5'}
    ];
    var rows = [
      {k:'Length', v:'<span class="sci-mono">'+n.length+'</span> digits', color:null},
      {k:'MII (1-2)', v:'<span class="sci-mono">'+esc(mii)+'</span> &mdash; '+esc(miiTxt), color:'sci-c1'},
      {k:'Country code', v: cc ? '<span class="sci-mono">'+esc(cc)+'</span> &mdash; <b>'+esc(ccName)+'</b>' : '<b>'+esc(ccName)+'</b>', color:'sci-c2'},
      {k:'Issuer identifier', v:'<span class="sci-mono">'+esc(issuer)+'</span> &mdash; identifies the issuing operator (assigned under ITU-T E.118)', color:'sci-c3'},
      {k:'Account ID', v:'<span class="sci-mono">'+esc(account)+'</span> &mdash; the unique SIM serial within the issuer', color:'sci-c4'},
      {k:'Check digit', v:'<span class="sci-mono">'+esc(check)+'</span> &mdash; Luhn (Mod 10). Expected for these digits: <span class="sci-mono">'+expected+'</span>', color:'sci-c5'}
    ];

    out.hidden=false;
    out.innerHTML =
      statusHtml(valid?'ok':'bad', valid ? 'Valid ICCID. Luhn checksum passes.' : 'Checksum fails. This is not a valid ICCID (or it was mistyped).')
      + ribbonHtml(segs)
      + rowsHtml(rows)
      + '<p class="sci-note">Country and issuer parsing follows ITU-T E.118 conventions. The country segment is variable length, so on rare issuer numbering it may not resolve. Need to manage ICCIDs in bulk? See <a href="https://spenza.com/esim/what-is-iccid-number/" target="_blank" rel="noopener">Spenza\u2019s ICCID guide</a>.</p>';
  }

  /* ---------- IMEI ---------- */
  function parseImei(raw){
    var n = digits(raw);
    var out = document.getElementById('sci-imei-out');
    if(n.length !== 15){
      out.hidden=false;
      out.innerHTML = statusHtml('bad','An IMEI is exactly 15 digits. You entered '+n.length+'. Tip: dial *#06# on the device.');
      return;
    }
    var tac = n.slice(0,8);
    var snr = n.slice(8,14);
    var check = n.slice(14,15);
    var valid = luhnValid(n);
    var expected = luhnDigit(n.slice(0,14));

    var segs = [
      {digits:tac, tag:'TAC', color:'sci-c1'},
      {digits:snr, tag:'Serial (SNR)', color:'sci-c4'},
      {digits:check, tag:'Check', color:'sci-c5'}
    ];
    var rows = [
      {k:'Length', v:'<span class="sci-mono">15</span> digits (standard IMEI)', color:null},
      {k:'TAC (1-8)', v:'<span class="sci-mono">'+esc(tac)+'</span> &mdash; Type Allocation Code. Identifies the device make and model, allocated through the GSMA.', color:'sci-c1'},
      {k:'Serial / SNR (9-14)', v:'<span class="sci-mono">'+esc(snr)+'</span> &mdash; uniquely identifies this unit among all devices sharing the same TAC.', color:'sci-c4'},
      {k:'Check digit (15)', v:'<span class="sci-mono">'+esc(check)+'</span> &mdash; Luhn check over the first 14 digits. Expected: <span class="sci-mono">'+expected+'</span>', color:'sci-c5'},
      {k:'IMEISV note', v:'The 16-digit IMEISV variant replaces the check digit with a 2-digit Software Version Number.', color:null}
    ];

    out.hidden=false;
    out.innerHTML =
      statusHtml(valid?'ok':'bad', valid ? 'Valid IMEI. Luhn checksum passes.' : 'Checksum fails. This IMEI is invalid or mistyped.')
      + ribbonHtml(segs)
      + rowsHtml(rows)
      + '<p class="sci-note">To confirm the exact make and model behind a TAC, check the official <a href="https://www.gsma.com/solutions-and-impact/industry-services/imei-services/" target="_blank" rel="noopener">GSMA IMEI database</a>. Changing a device IMEI is illegal in most jurisdictions.</p>';
  }

  /* ---------- IMSI ---------- */
  function parseImsi(raw){
    var n = digits(raw);
    var out = document.getElementById('sci-imsi-out');
    if(n.length < 6 || n.length > 15){
      out.hidden=false;
      out.innerHTML = statusHtml('bad','An IMSI is up to 15 digits (typically 14 to 15). You entered '+n.length+'.');
      return;
    }
    var mcc = n.slice(0,3);
    var mccName = MCC[mcc] || 'Not matched in the common MCC set';
    var mncLen = MNC3[mcc] ? 3 : 2;
    var mnc = n.slice(3,3+mncLen);
    var msin = n.slice(3+mncLen);
    var key = mcc + mnc;
    var op = OPERATOR[key] || null;
    // also try the alternate MNC length as a hint
    var altLen = mncLen===3?2:3;
    var altMnc = n.slice(3,3+altLen);
    var altOp = OPERATOR[mcc+altMnc] || null;

    var segs = [
      {digits:mcc, tag:'MCC', color:'sci-c2'},
      {digits:mnc, tag:'MNC', color:'sci-c1'},
      {digits:msin, tag:'MSIN', color:'sci-c4'}
    ];
    var opRow = op
      ? '<b>'+esc(op)+'</b>'
      : (altOp ? 'Likely <b>'+esc(altOp)+'</b> (if MNC is '+altLen+' digits: <span class="sci-mono">'+esc(altMnc)+'</span>)' : 'Operator not in this tool\u2019s sample lookup');
    var rows = [
      {k:'Length', v:'<span class="sci-mono">'+n.length+'</span> digits', color:null},
      {k:'MCC (1-3)', v:'<span class="sci-mono">'+esc(mcc)+'</span> &mdash; <b>'+esc(mccName)+'</b>. Mobile Country Code, the subscriber\u2019s home country.', color:'sci-c2'},
      {k:'MNC ('+mncLen+' digit)', v:'<span class="sci-mono">'+esc(mnc)+'</span> &mdash; Mobile Network Code, the home operator. '+(MNC3[mcc]?'This MCC conventionally uses 3-digit MNCs.':'This MCC conventionally uses 2-digit MNCs.'), color:'sci-c1'},
      {k:'Operator', v:opRow, color:null},
      {k:'MSIN', v:'<span class="sci-mono">'+esc(msin)+'</span> &mdash; Mobile Subscriber Identification Number, unique within the operator.', color:'sci-c4'}
    ];

    out.hidden=false;
    out.innerHTML =
      statusHtml('warn','IMSI parsed. Note: MNC length varies by country, so the MNC / MSIN split is the conventional best guess.')
      + ribbonHtml(segs)
      + rowsHtml(rows)
      + '<p class="sci-note">The IMSI has no checksum, so it cannot be validated the way an ICCID or IMEI can. For multi-IMSI strategy, see <a href="https://spenza.com/esim/multi-imsi-vs-euicc-guide-iot/" target="_blank" rel="noopener">Spenza\u2019s multi-IMSI vs eUICC guide</a>.</p>';
  }

  /* ---------- wiring ---------- */
  function bind(id, fn, inputId){
    var btn=document.getElementById(id);
    var inp=document.getElementById(inputId);
    btn.addEventListener('click', function(){ fn(inp.value); });
    inp.addEventListener('keydown', function(e){ if(e.key==='Enter'){ fn(inp.value); } });
  }
  bind('sci-iccid-go', parseIccid, 'sci-iccid-in');
  bind('sci-imei-go', parseImei, 'sci-imei-in');
  bind('sci-imsi-go', parseImsi, 'sci-imsi-in');

  // tabs
  root.querySelectorAll('.sci-tab').forEach(function(tab){
    tab.addEventListener('click', function(){
      var name=tab.getAttribute('data-tab');
      root.querySelectorAll('.sci-tab').forEach(function(t){
        var on = t===tab;
        t.classList.toggle('sci-tab-on', on);
        t.setAttribute('aria-selected', on?'true':'false');
      });
      root.querySelectorAll('.sci-panel').forEach(function(p){
        p.classList.toggle('sci-panel-on', p.getAttribute('data-panel')===name);
      });
    });
  });

  // sample fillers
  root.querySelectorAll('.sci-sample').forEach(function(b){
    b.addEventListener('click', function(){
      var el=document.getElementById(b.getAttribute('data-fill'));
      el.value=b.getAttribute('data-val');
      el.focus();
    });
  });

  // copy embed
  var copyBtn=document.getElementById('sci-copy');
  if(copyBtn){
    copyBtn.addEventListener('click', function(){
      var code=document.getElementById('sci-embed-code').textContent;
      var done=function(){ copyBtn.textContent='Copied'; setTimeout(function(){copyBtn.textContent='Copy embed code';},1600); };
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(code).then(done, done);
      } else {
        var ta=document.createElement('textarea'); ta.value=code; document.body.appendChild(ta);
        ta.select(); try{document.execCommand('copy');}catch(e){} document.body.removeChild(ta); done();
      }
    });
  }
})();
</script></p>
<!-- ============================================================
     OPTIONAL: SoftwareApplication schema for the tool.
     Paste this into the SAME Custom HTML block, or into your SEO
     plugin's schema field. Helps AI search engines recognise the
     embedded utility. Safe to omit if your theme injects its own.
     ============================================================ -->
<p><script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Spenza Cellular Identifier Tools",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Any (web browser)",
  "description": "Free client-side tool to parse and validate cellular identifiers: ICCID parser with Luhn check, IMEI / TAC decoder, and IMSI MCC/MNC breakdown.",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "publisher": { "@type": "Organization", "name": "Spenza", "url": "https://spenza.com" }
}
</script></p>



<p class="wp-block-paragraph">One smartphone on a network carries at least four active identifiers at once, and an IoT device with an eSIM carries more. Most guides explain one number in isolation, so anyone asking &#8220;<strong>what is the difference between an ICCID and an IMSI</strong>&#8221; ends up stitching the answer together from four browser tabs. <strong>This blog fixes that.</strong> It decodes all seven identifiers in one place, shows how they fit together, and gives you a working parser tool to inspect a real ICCID, IMEI or IMSI yourself. It serves two readers: the telecom architect who needs standards-grade definitions, and the device owner who just wants to know which number to read off their phone.</p>



<h2 class="wp-block-heading"><strong>The Seven Cellular Identifiers at a Glance</strong></h2>



<p class="wp-block-paragraph">Before decoding each number, it helps to see them side by side. Every identifier below answers a different question: which card, which subscriber, which device, which network profile, which phone number. They are issued by different bodies and governed by different standards, which is exactly why they are so easy to confuse.</p>



<p><style>
  .table-scroll {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }

  .table-scroll::-webkit-scrollbar {
    height: 10px;
  }

  .table-scroll::-webkit-scrollbar-track {
    background: #f3f3f3;
    border-radius: 20px;
  }

  .table-scroll::-webkit-scrollbar-thumb {
    background: #cfcfcf;
    border-radius: 20px;
  }

  .table-scroll::-webkit-scrollbar-thumb:hover {
    background: #b5b5b5;
  }

  .responsive-table {
    min-width: 1400px; /* desktop + mobile scroll */
    border-collapse: collapse;
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  }

  .responsive-table thead {
    background-color: #FCEAD7;
  }

  .responsive-table th,
  .responsive-table td {
    padding: 14px 16px;
    text-align: left;
    border-bottom: 1px solid #eee;
    vertical-align: top;
    font-size: 14px;
    line-height: 1.5;
    color: #111;
  }

  .responsive-table th {
    font-weight: 600;
    white-space: nowrap;
  }

  /* Column sizing */
  .responsive-table th:nth-child(1),
  .responsive-table td:nth-child(1) { width: 160px; }

  .responsive-table th:nth-child(2),
  .responsive-table td:nth-child(2) { width: 140px; }

  .responsive-table th:nth-child(3),
  .responsive-table td:nth-child(3) { width: 260px; }

  .responsive-table th:nth-child(4),
  .responsive-table td:nth-child(4) { width: 140px; }

  .responsive-table th:nth-child(5),
  .responsive-table td:nth-child(5) { width: 280px; }

  .responsive-table th:nth-child(6),
  .responsive-table td:nth-child(6) { width: 260px; }

  /* Vertical dividers */
  .responsive-table th:not(:last-child),
  .responsive-table td:not(:last-child) {
    border-right: 1px solid #eee;
  }

  /* Zebra rows */
  .responsive-table tbody tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  /* Hover effect */
  .responsive-table tbody tr:hover {
    background-color: #fde7cc;
  }
</style></p>
<div class="table-scroll">
<table class="responsive-table">
<thead>
<tr>
<th>Identifier</th>
<th>Length</th>
<th>What it identifies</th>
<th>Can it change?</th>
<th>Standard</th>
</tr>
</thead>
<tbody>
<tr>
<td>ICCID</td>
<td>19–20 digits</td>
<td>The physical SIM or eSIM profile</td>
<td>Yes, with a new SIM or profile</td>
<td>ITU-T E.118, ISO/IEC 7812</td>
</tr>
<tr>
<td>IMSI</td>
<td>Up to 15 digits</td>
<td>The subscriber on the network</td>
<td>Yes, when reissued by operator</td>
<td>3GPP TS 23.003, ITU-T E.212</td>
</tr>
<tr>
<td>IMEI</td>
<td>15 digits</td>
<td>The device hardware</td>
<td>No, fixed at manufacture</td>
<td>3GPP TS 23.003</td>
</tr>
<tr>
<td>EID</td>
<td>32 digits</td>
<td>The eUICC (eSIM) chip itself</td>
<td>No, permanent for chip life</td>
<td>GSMA SGP.02 / SGP.22 / SGP.32</td>
</tr>
<tr>
<td>MSISDN</td>
<td>Up to 15 digits</td>
<td>The dialable phone number</td>
<td>Yes, can have multiple over time</td>
<td>ITU-T E.164</td>
</tr>
<tr>
<td>TAC</td>
<td>8 digits</td>
<td>Device type/model identifier (part of IMEI)</td>
<td>No</td>
<td>3GPP TS 23.003 / GSMA allocation</td>
</tr>
<tr>
<td>EUICCID</td>
<td>32 digits</td>
<td>Same as EID, identifies eUICC</td>
<td>No, permanent for chip life</td>
<td>GSMA SGP standards</td>
</tr>
</tbody>
</table>
</div>



<h2 class="wp-block-heading"><strong>ICCID:</strong> The SIM card’s serial number</h2>



<div style="background-color: #fff4e5; border-left: 5px solid #FF9800; padding: 1.4em 1.6em; margin: 2em 0; border-radius: 6px; font-family: Arial, sans-serif; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
<div style="color: #ff9800; font-size: 1.05em; font-weight: bold; margin-bottom: 0.9em;">Definition</div>
<p style="margin: 0; line-height: 1.6;">The <span style="font-weight: bold;">ICCID (Integrated Circuit Card Identifier)</span> is the unique serial number of a <span style="font-weight: bold;">SIM card or eSIM profile</span>, typically 19–20 digits long. It is defined under <span style="font-weight: bold;">ITU-T E.118</span> and follows the <span style="font-weight: bold;">ISO/IEC 7812 numbering scheme</span>. It identifies the card or profile itself, not the <span style="font-weight: bold;">subscriber</span> or the <span style="font-weight: bold;">network connection</span>.</p>
</div>



<figure class="wp-block-image aligncenter size-large is-resized"><img loading="lazy" decoding="async" width="666" height="444" class="wp-image-17664" style="width: 666px;" src="/wp-content/uploads/2026/05/ICCID-Image-1024x683.png" alt="What is an ICCID Number? 
" srcset="/wp-content/uploads/2026/05/ICCID-Image-1024x683.png 1024w, /wp-content/uploads/2026/05/ICCID-Image-300x200.png 300w, /wp-content/uploads/2026/05/ICCID-Image-768x512.png 768w, /wp-content/uploads/2026/05/ICCID-Image.png 1536w" sizes="(max-width: 666px) 100vw, 666px" /></figure>



<h3 class="wp-block-heading"><strong>How an ICCID Is Structured</strong></h3>



<p class="wp-block-paragraph">Read left to right, an ICCID breaks into five parts:</p>



<ul class="wp-block-list">
<li><strong>Major Industry Identifier (MII), digits 1 to 2. </strong>Always 89 for telecommunications, which is what tells a system this is a SIM and not a credit card.</li>



<li><strong>Country code, digits 3 onward. </strong>A one to three digit ITU country code for where the card was issued, which is why ICCID length varies slightly by country.</li>



<li><strong>Issuer Identifier Number, the next two or more digits. </strong>Identifies the issuing operator. It is often close to, but not always identical to, the Mobile Network Code.</li>



<li><strong>Individual Account Identification, the long middle block. </strong>The unique serial that distinguishes one card from every other card from the same issuer.</li>



<li><strong>Luhn check digit, the final digit. </strong>A Mod 10 checksum that lets a network instantly catch a transposed or corrupted number.</li>
</ul>



<p class="wp-block-paragraph">ITU-T E.118 specifies a maximum of 19 digits, while older GSM specifications allow a 20th digit. Some modem commands also return an extra trailing digit that is not officially part of the ICCID, which is the usual source of the &#8220;<strong>is my ICCID 19 or 20 digits</strong>&#8221; confusion. Spenza&#8217;s <a href="https://spenza.com/esim/what-is-iccid-number/" target="_blank" rel="noreferrer noopener">dedicated ICCID guide</a> goes deeper on the encoding and on bulk ICCID extraction for fleets.</p>



<div style="background-color: #fff4e5; border-left: 5px solid #FF9800; padding: 1.4em 1.6em; margin: 2em 0; border-radius: 6px; font-family: Arial, sans-serif; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
<div style="color: #ff9800; font-size: 1.05em; font-weight: bold; margin-bottom: 0.9em;">Try It</div>
<p style="margin: 0; line-height: 1.6;">Paste any <span style="font-weight: bold;">ICCID</span> into the interactive parser embedded near the top of this page. It validates the <span style="font-weight: bold;">Luhn checksum</span> and decodes the <span style="font-weight: bold;">industry</span>, <span style="font-weight: bold;">country</span>, and <span style="font-weight: bold;">issuer segments</span> entirely in your browser, with <span style="font-weight: bold;">no data sent to a server</span>.</p>
</div>



<h2 class="wp-block-heading"><strong>IMSI:</strong> The subscriber’s network identity.</h2>



<div style="background-color: #fff4e5; border-left: 5px solid #FF9800; padding: 1.4em 1.6em; margin: 2em 0; border-radius: 6px; font-family: Arial, sans-serif; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
<div style="color: #ff9800; font-size: 1.05em; font-weight: bold; margin-bottom: 0.9em;">Definition</div>
<p style="margin: 0; line-height: 1.6;">The <span style="font-weight: bold;">IMSI (International Mobile Subscriber Identity)</span> is the number that identifies a <span style="font-weight: bold;">subscriber on a mobile network</span>. It is up to <span style="font-weight: bold;">15 digits</span> long, defined by <span style="font-weight: bold;">3GPP TS 23.003</span> and <span style="font-weight: bold;">ITU-T E.212</span>, and is stored on the <span style="font-weight: bold;">SIM</span>. It acts as the key the network uses to locate and authenticate the subscriber in the <span style="font-weight: bold;">home subscriber database</span>.</p>
</div>



<figure class="wp-block-image aligncenter size-large is-resized"><img loading="lazy" decoding="async" width="666" height="375" class="wp-image-17666" style="width: 666px;" src="/wp-content/uploads/2026/05/IMSI-Image-1024x576.png" alt="What is an IMSI? 
" srcset="/wp-content/uploads/2026/05/IMSI-Image-1024x576.png 1024w, /wp-content/uploads/2026/05/IMSI-Image-300x169.png 300w, /wp-content/uploads/2026/05/IMSI-Image-768x432.png 768w, /wp-content/uploads/2026/05/IMSI-Image-1536x864.png 1536w, /wp-content/uploads/2026/05/IMSI-Image.png 1672w" sizes="(max-width: 666px) 100vw, 666px" /></figure>



<h3 class="wp-block-heading"><strong>How an IMSI Is Structured</strong></h3>



<p class="wp-block-paragraph">The IMSI has three parts:</p>



<ol class="wp-block-list">
<li><strong>Mobile Country Code (MCC), 3 digits. </strong>Identifies the subscriber&#8217;s home country. The United States uses the 310 to 316 range; India uses 404 and 405.</li>



<li><strong>Mobile Network Code (MNC), 2 or 3 digits. </strong>Identifies the home operator within that country. The MCC and MNC together point any network in the world to your home operator.</li>



<li><strong>Mobile Subscriber Identification Number (MSIN), up to 10 digits. </strong>The unique subscriber serial inside that one operator.</li>
</ol>



<p class="wp-block-paragraph">The IMSI is deliberately hidden from end users. Because broadcasting it constantly would let anyone track a device, networks assign a temporary identity for over-the-air signaling. On 4G and 5G this is the GUTI, and 5G adds concealment so the permanent IMSI is never sent in the clear. This is the open gap in most identifier content: it is the identifier that actually authenticates every call and message, yet it is the least explained.</p>



<p class="wp-block-paragraph">For IoT fleets, the IMSI is where multi-IMSI and eUICC strategies live. A single eSIM can hold multiple profiles, each with its own IMSI, which is how a device switches home networks for better roaming economics. Spenza covers this in the <a href="https://spenza.com/esim/multi-imsi-vs-euicc-guide-iot/" target="_blank" rel="noreferrer noopener">multi-IMSI versus eUICC guide</a>.</p>



<h2 class="wp-block-heading"><strong>IMEI: </strong>The Device’s Unique Hardware Identifier</h2>



<div style="background-color: #fff4e5; border-left: 5px solid #FF9800; padding: 1.4em 1.6em; margin: 2em 0; border-radius: 6px; font-family: Arial, sans-serif; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
<div style="color: #ff9800; font-size: 1.05em; font-weight: bold; margin-bottom: 0.9em;">Definition</div>
<p style="margin: 0; line-height: 1.6;">The <span style="font-weight: bold;">IMEI (International Mobile Equipment Identity)</span> is a <span style="font-weight: bold;">15-digit identifier</span> that uniquely identifies the <span style="font-weight: bold;">device hardware</span> itself, independent of any SIM card. It is defined under <span style="font-weight: bold;">3GPP TS 23.003</span>. Because it is tied to the physical device, mobile networks can use it to <span style="font-weight: bold;">block or blacklist stolen handsets</span> regardless of which SIM is inserted.</p>
</div>



<figure class="wp-block-image aligncenter size-full is-resized"><img loading="lazy" decoding="async" width="666" height="666" class="wp-image-17668" style="width: 666px;" src="/wp-content/uploads/2026/05/IMEI-Image.png" alt="What is an IMEI Number? 
" srcset="/wp-content/uploads/2026/05/IMEI-Image.png 1024w, /wp-content/uploads/2026/05/IMEI-Image-300x300.png 300w, /wp-content/uploads/2026/05/IMEI-Image-150x150.png 150w, /wp-content/uploads/2026/05/IMEI-Image-768x768.png 768w" sizes="(max-width: 666px) 100vw, 666px" /></figure>



<h3 class="wp-block-heading"><strong>How an IMEI Is Structured</strong></h3>



<p class="wp-block-paragraph">The 15 digits split into three blocks:</p>



<ol class="wp-block-list">
<li><strong>Type Allocation Code (TAC), 8 digits. </strong>Identifies the make and model. Allocated through the GSMA. More on this in the TAC section below.</li>



<li><strong>Serial Number (SNR), 6 digits. </strong>Uniquely identifies one device among all devices that share the same TAC.</li>



<li><strong>Check Digit, 1 digit. </strong>A Luhn checksum over the first 14 digits.</li>
</ol>



<p class="wp-block-paragraph">There is a related variant, the IMEISV, which is 16 digits long: the first 14 digits of the IMEI plus a two-digit Software Version Number. The IMEI you dial up with <strong>*#06#</strong> is the 15-digit form. Changing an IMEI to disguise a device is illegal in most jurisdictions, which is a useful contrast for the comparison section: you can legally swap the SIM, but not the IMEI.</p>



<h2 class="wp-block-heading"><strong>EID and EUICCID: </strong>The eSIM Identifier</h2>



<div style="background-color: #fff4e5; border-left: 5px solid #FF9800; padding: 1.4em 1.6em; margin: 2em 0; border-radius: 6px; font-family: Arial, sans-serif; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
<div style="color: #ff9800; font-size: 1.05em; font-weight: bold; margin-bottom: 0.9em;">Definition</div>
<p style="margin: 0; line-height: 1.6;">The <span style="font-weight: bold;">EID (eUICC Identifier)</span> is a fixed <span style="font-weight: bold;">32-digit serial number</span> assigned to an <span style="font-weight: bold;">eUICC</span>, the secure chip inside an eSIM-capable device. <span style="font-weight: bold;">EUICCID</span> is another name for the same identifier. Unlike the <span style="font-weight: bold;">ICCID</span>, the <span style="font-weight: bold;">EID never changes</span> for the lifetime of the chip, making it the stable anchor for <span style="font-weight: bold;">remote SIM provisioning</span> under the <span style="font-weight: bold;">GSMA SGP standards</span>.</p>
</div>



<figure class="wp-block-image aligncenter size-large is-resized"><img loading="lazy" decoding="async" width="666" height="461" class="wp-image-17671" style="width: 666px;" src="/wp-content/uploads/2026/05/EID-Image-1024x709.png" alt="What is an EID Number? 
" srcset="/wp-content/uploads/2026/05/EID-Image-1024x709.png 1024w, /wp-content/uploads/2026/05/EID-Image-300x208.png 300w, /wp-content/uploads/2026/05/EID-Image-768x532.png 768w, /wp-content/uploads/2026/05/EID-Image.png 1448w" sizes="(max-width: 666px) 100vw, 666px" /></figure>



<h3 class="wp-block-heading"><strong>Why the EID Matters in 2026</strong></h3>



<p class="wp-block-paragraph">A traditional SIM has exactly one ICCID. An eUICC can hold many network profiles, each with its own ICCID and IMSI, and switch between them over the air. The EID identifies the chip that holds all of them. That is the single most common point of confusion: people assume the EID and ICCID are interchangeable, when in fact one identifies the durable hardware and the other identifies a profile that can be added, swapped or deleted.</p>



<p class="wp-block-paragraph">This distinction became urgent with GSMA SGP.32, the IoT-focused remote provisioning standard that moved into commercial rollout through late 2025 and 2026. SGP.32 lets constrained IoT devices manage profiles without the heavy infrastructure the older consumer standard required. If you are evaluating it, Spenza&#8217;s <a href="https://spenza.com/esim/sgp-32-new-esim-standard/" target="_blank" rel="noreferrer noopener">SGP.32 explainer</a> and the <a href="https://spenza.com/esim/sgp-22-vs-sgp-32-esim-standards-guide/" target="_blank" rel="noreferrer noopener">SGP.22 versus SGP.32 comparison</a> break down what changed and who should care.</p>



<figure class="wp-block-image aligncenter size-large is-resized"><img loading="lazy" decoding="async" width="666" height="369" class="wp-image-17679" style="width: 666px;" src="/wp-content/uploads/2026/05/EUICCID-Image-1024x568.png" alt="What is an EUICCID Number?" srcset="/wp-content/uploads/2026/05/EUICCID-Image-1024x568.png 1024w, /wp-content/uploads/2026/05/EUICCID-Image-300x166.png 300w, /wp-content/uploads/2026/05/EUICCID-Image-768x426.png 768w, /wp-content/uploads/2026/05/EUICCID-Image-1536x852.png 1536w, /wp-content/uploads/2026/05/EUICCID-Image.png 1684w" sizes="(max-width: 666px) 100vw, 666px" /></figure>



<h2 class="wp-block-heading"><strong>MSISDN: </strong>The Public Phone Number</h2>



<div style="background-color: #fff4e5; border-left: 5px solid #FF9800; padding: 1.4em 1.6em; margin: 2em 0; border-radius: 6px; font-family: Arial, sans-serif; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
<div style="color: #ff9800; font-size: 1.05em; font-weight: bold; margin-bottom: 0.9em;">Definition</div>
<p style="margin: 0; line-height: 1.6;">The <span style="font-weight: bold;">MSISDN (Mobile Station International Subscriber Directory Number)</span> is the actual <span style="font-weight: bold;">dialable phone number</span> associated with a subscription. It follows the <span style="font-weight: bold;">ITU-T E.164 standard</span> and is the primary identifier users typically see and share. Unlike SIM-based identifiers, it is stored in the operator’s <span style="font-weight: bold;">subscriber database</span> and may not necessarily reside on the SIM itself.</p>
</div>



<figure class="wp-block-image aligncenter size-large is-resized"><img loading="lazy" decoding="async" width="666" height="372" class="wp-image-17674" style="width: 666px;" src="/wp-content/uploads/2026/05/MSISDN-1024x572.png" alt="What is an MSISDN Number?" srcset="/wp-content/uploads/2026/05/MSISDN-1024x572.png 1024w, /wp-content/uploads/2026/05/MSISDN-300x167.png 300w, /wp-content/uploads/2026/05/MSISDN-768x429.png 768w, /wp-content/uploads/2026/05/MSISDN.png 1376w" sizes="(max-width: 666px) 100vw, 666px" /></figure>



<h3 class="wp-block-heading"><strong>How an MSISDN Is Structured</strong></h3>



<p class="wp-block-paragraph">Under ITU-T E.164, an MSISDN is built from three parts:</p>



<ol class="wp-block-list">
<li><strong>Country Code, 1 to 3 digits. </strong>For example 1 for North America, 44 for the United Kingdom, 91 for India.</li>



<li><strong>National Destination Code. </strong>Routes to a region or network inside the country.</li>



<li><strong>Subscriber Number. </strong>The unique line within that destination.</li>
</ol>



<p class="wp-block-paragraph">The MSISDN is the most flexible identifier of the seven. It can change while the subscriber stays the same, which is what number porting does. A single IMSI can also have more than one MSISDN attached, for example a voice line and a separate data line. This is why the MSISDN is never a reliable way to identify hardware: it floats above the SIM and the device entirely.</p>



<h2 class="wp-block-heading"><strong>TAC: </strong>The Type Allocation Code</h2>



<div style="background-color: #fff4e5; border-left: 5px solid #FF9800; padding: 1.4em 1.6em; margin: 2em 0; border-radius: 6px; font-family: Arial, sans-serif; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
<div style="color: #ff9800; font-size: 1.05em; font-weight: bold; margin-bottom: 0.9em;">Definition</div>
<p style="margin: 0; line-height: 1.6;">The <span style="font-weight: bold;">TAC (Type Allocation Code)</span> is the first <span style="font-weight: bold;">8 digits of every IMEI</span>. Allocated through the <span style="font-weight: bold;">GSMA</span>, it identifies the <span style="font-weight: bold;">make</span>, <span style="font-weight: bold;">model</span>, and <span style="font-weight: bold;">manufacturing origin</span> of a device. All devices of the same model share the same TAC, while the remaining digits in the IMEI make each unit <span style="font-weight: bold;">uniquely identifiable</span>.</p>
</div>



<figure class="wp-block-image aligncenter size-large is-resized"><img loading="lazy" decoding="async" width="666" height="375" class="wp-image-17676" style="width: 666px;" src="/wp-content/uploads/2026/05/TAC-Image-1024x576.png" alt="What is an TAC Number?" srcset="/wp-content/uploads/2026/05/TAC-Image-1024x576.png 1024w, /wp-content/uploads/2026/05/TAC-Image-300x169.png 300w, /wp-content/uploads/2026/05/TAC-Image-768x432.png 768w, /wp-content/uploads/2026/05/TAC-Image-1536x864.png 1536w, /wp-content/uploads/2026/05/TAC-Image.png 1672w" sizes="(max-width: 666px) 100vw, 666px" /></figure>



<p class="wp-block-paragraph">The TAC is small but powerful. Because it maps an IMEI to a specific device model, it drives device-type analytics, fraud detection and regulatory reporting. A network can look at the TAC alone and know whether a connecting device is a phone, a tracker, a router or an industrial module, without any other information. The GSMA maintains the official TAC allocation database, and <a href="https://www.gsma.com/solutions-and-impact/industry-services/imei-services/" target="_blank" rel="noreferrer noopener">the GSMA&#8217;s IMEI and TAC resources</a> are the authoritative reference for how codes are issued.</p>



<p class="wp-block-paragraph">For an IoT operator running mixed hardware, TAC-level visibility is the difference between &#8220;40,000 devices online&#8221; and &#8220;32,000 trackers, 6,000 routers and 2,000 unknown modules, three of which should not be on this network at all&#8221;.</p>



<h2 class="wp-block-heading"><strong>ICCID vs IMSI vs IMEI vs MSISDN</strong>: The Big Comparison</h2>



<p class="wp-block-paragraph">Here is the question every other page dodges. If one phone has four identifiers active at once, which one is which? The table below is the fast answer.</p>



<p><style>
  .table-scroll {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }

  .table-scroll::-webkit-scrollbar {
    height: 10px;
  }

  .table-scroll::-webkit-scrollbar-track {
    background: #f3f3f3;
    border-radius: 20px;
  }

  .table-scroll::-webkit-scrollbar-thumb {
    background: #cfcfcf;
    border-radius: 20px;
  }

  .table-scroll::-webkit-scrollbar-thumb:hover {
    background: #b5b5b5;
  }

  .responsive-table {
    min-width: 900px; /* reduced for 2-column layout */
    border-collapse: collapse;
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  }

  .responsive-table thead {
    background-color: #FCEAD7;
  }

  .responsive-table th,
  .responsive-table td {
    padding: 14px 16px;
    text-align: left;
    border-bottom: 1px solid #eee;
    vertical-align: top;
    font-size: 14px;
    line-height: 1.5;
    color: #111;
  }

  .responsive-table th {
    font-weight: 600;
  }

  /* Column sizing for 2-column layout */
  .responsive-table th:nth-child(1),
  .responsive-table td:nth-child(1) { width: 320px; }

  .responsive-table th:nth-child(2),
  .responsive-table td:nth-child(2) { width: 600px; }

  /* Vertical divider */
  .responsive-table th:not(:last-child),
  .responsive-table td:not(:last-child) {
    border-right: 1px solid #eee;
  }

  /* Zebra rows */
  .responsive-table tbody tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  /* Hover effect */
  .responsive-table tbody tr:hover {
    background-color: #fde7cc;
  }
</style></p>
<div class="table-scroll">
<table class="responsive-table">
<thead>
<tr>
<th>Question</th>
<th>Answer</th>
</tr>
</thead>
<tbody>
<tr>
<td>Which identifies the SIM card?</td>
<td>ICCID. It is the card or profile serial number.</td>
</tr>
<tr>
<td>Which identifies the subscriber?</td>
<td>IMSI. It is the account key inside the network.</td>
</tr>
<tr>
<td>Which identifies the device?</td>
<td>IMEI. It stays with the hardware no matter the SIM.</td>
</tr>
<tr>
<td>Which is the phone number?</td>
<td>MSISDN. The only one you actually dial or share.</td>
</tr>
<tr>
<td>Which identifies the eSIM chip?</td>
<td>EID, also called EUICCID. It anchors the eUICC.</td>
</tr>
<tr>
<td>Which identifies the device model?</td>
<td>TAC. The first 8 digits of the IMEI.</td>
</tr>
</tbody>
</table>
</div>



<h3 class="wp-block-heading"><strong>Why One Device Carries Four Numbers at Once</strong></h3>



<p class="wp-block-paragraph">Think of a single connected device. The <strong>IMEI</strong> is the chassis. The <strong>ICCID</strong> is the SIM slotted into it. The <strong>IMSI</strong> is the subscription that SIM carries. The <strong>MSISDN</strong> is the phone number routed to that subscription. Swap the SIM and the ICCID and IMSI change while the IMEI stays. Port the number and the MSISDN changes while the IMSI stays. Each layer moves independently, which is the whole point of the design.</p>



<h2 class="wp-block-heading"><strong>How to Find Each Identifier on Your Device</strong></h2>



<p class="wp-block-paragraph">The fastest universal method works on most phones: open the dialer and enter <strong>*#06#</strong>. Many devices will display the IMEI, and often the ICCID, EID and MSISDN, on a single screen. The table below covers the menu paths when you need a specific number.</p>



<p><style>
  .table-scroll {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }

  .table-scroll::-webkit-scrollbar {
    height: 10px;
  }

  .table-scroll::-webkit-scrollbar-track {
    background: #f3f3f3;
    border-radius: 20px;
  }

  .table-scroll::-webkit-scrollbar-thumb {
    background: #cfcfcf;
    border-radius: 20px;
  }

  .table-scroll::-webkit-scrollbar-thumb:hover {
    background: #b5b5b5;
  }

  .responsive-table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);

    table-layout: fixed;
    min-width: 720px;
  }

  .responsive-table thead {
    background-color: #FCEAD7;
  }

  .responsive-table th,
  .responsive-table td {
    padding: 14px 16px;
    text-align: left;
    border-bottom: 1px solid #eee;
    vertical-align: top;
    font-size: 14px;
    line-height: 1.5;
    color: #111;
    word-wrap: break-word;
  }

  .responsive-table th {
    font-weight: 600;
  }

  /* Balanced column distribution */
  .responsive-table th:nth-child(1),
  .responsive-table td:nth-child(1) { width: 28%; }

  .responsive-table th:nth-child(2),
  .responsive-table td:nth-child(2) { width: 72%; }

  /* Vertical divider */
  .responsive-table th:not(:last-child),
  .responsive-table td:not(:last-child) {
    border-right: 1px solid #eee;
  }

  /* Zebra rows */
  .responsive-table tbody tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  /* Hover effect */
  .responsive-table tbody tr:hover {
    background-color: #fde7cc;
  }
</style></p>
<div class="table-scroll">
<table class="responsive-table">
<thead>
<tr>
<th>Platform</th>
<th>Where to look</th>
</tr>
</thead>
<tbody>
<tr>
<td>iPhone (iOS 17 and later)</td>
<td>Settings → General → About. Scroll to see ICCID, IMEI, EID, and phone number.</td>
</tr>
<tr>
<td>Android (Android 14 and later)</td>
<td>Settings → About phone → Status or SIM status for ICCID, IMEI, and EID.</td>
</tr>
<tr>
<td>Windows devices</td>
<td>Settings → Network and internet → Cellular → Hardware properties.</td>
</tr>
<tr>
<td>Modems and IoT modules</td>
<td>AT commands: AT+CIMI (IMSI), AT+CGSN (IMEI), AT+CCID / AT+ICCID (ICCID).</td>
</tr>
</tbody>
</table>
</div>



<p class="wp-block-paragraph">The modem AT commands matter most at fleet scale. They are what let a provisioning system pull identifiers from thousands of devices programmatically instead of someone reading numbers off screens. A practical habit for hardware teams: photograph every SIM with the ICCID visible before installation, because once the card is seated in a sealed enclosure, that number is hard to recover.</p>



<h2 class="wp-block-heading"><strong>Identifiers in the eSIM Era</strong></h2>



<p class="wp-block-paragraph">eSIM does not add a new identifier so much as it rearranges the existing ones. On a physical SIM, the ICCID, IMSI and the card are effectively locked together. On an eUICC, they come apart.</p>



<ul class="wp-block-list">
<li><strong>The EID is per chip. </strong>One device, one eUICC, one permanent EID.</li>



<li><strong>The ICCID is per profile. </strong>A single eUICC can hold several profiles, each with its own ICCID.</li>



<li><strong>The IMSI is per profile too. </strong>Each profile carries its own subscriber identity, so switching profiles switches the active IMSI.</li>
</ul>



<p class="wp-block-paragraph">So a single eUICC might hold three profiles from three operators, which means three ICCIDs and three IMSIs behind one EID. The device activates one at a time. For consumer phones this enables clean carrier switching. For IoT, under SGP.32, it lets a device be manufactured once and provisioned for whatever market it ships to, which removes the largest logistics headache in connected hardware. If you are sourcing connectivity for this model, Spenza&#8217;s roundup of <a href="https://spenza.com/esim/iot-esim-providers/" target="_blank" rel="noreferrer noopener">IoT eSIM providers</a> is a useful starting point, and the <a href="https://spenza.com/esim/esim-vs-physical-sim-airport-decision/" target="_blank" rel="noreferrer noopener">SIM versus eSIM breakdown</a> covers the tradeoffs.</p>



<h2 class="wp-block-heading"><strong>Security and Privacy: Identifier Risks in 2026</strong></h2>



<p class="wp-block-paragraph">Each identifier is also an attack surface. Knowing which one is exposed in which scenario is basic operational hygiene for anyone managing connectivity.</p>



<p><style>
  .table-scroll {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }

  .table-scroll::-webkit-scrollbar {
    height: 10px;
  }

  .table-scroll::-webkit-scrollbar-track {
    background: #f3f3f3;
    border-radius: 20px;
  }

  .table-scroll::-webkit-scrollbar-thumb {
    background: #cfcfcf;
    border-radius: 20px;
  }

  .table-scroll::-webkit-scrollbar-thumb:hover {
    background: #b5b5b5;
  }

  .responsive-table {
    min-width: 1000px; /* slightly wider for 3 columns */
    border-collapse: collapse;
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  }

  .responsive-table thead {
    background-color: #FCEAD7;
  }

  .responsive-table th,
  .responsive-table td {
    padding: 14px 16px;
    text-align: left;
    border-bottom: 1px solid #eee;
    vertical-align: top;
    font-size: 14px;
    line-height: 1.5;
    color: #111;
  }

  .responsive-table th {
    font-weight: 600;
  }

  /* Column sizing for 3-column layout */
  .responsive-table th:nth-child(1),
  .responsive-table td:nth-child(1) { width: 220px; }

  .responsive-table th:nth-child(2),
  .responsive-table td:nth-child(2) { width: 200px; }

  .responsive-table th:nth-child(3),
  .responsive-table td:nth-child(3) { width: 580px; }

  /* Vertical divider */
  .responsive-table th:not(:last-child),
  .responsive-table td:not(:last-child) {
    border-right: 1px solid #eee;
  }

  /* Zebra rows */
  .responsive-table tbody tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  /* Hover effect */
  .responsive-table tbody tr:hover {
    background-color: #fde7cc;
  }
</style></p>
<div class="table-scroll">
<table class="responsive-table">
<thead>
<tr>
<th>Threat</th>
<th>Identifier targeted</th>
<th>What it means</th>
</tr>
</thead>
<tbody>
<tr>
<td>SIM swap fraud</td>
<td>MSISDN</td>
<td>An attacker convinces a telecom operator to move your phone number to their SIM, letting them intercept calls and one-time passwords.</td>
</tr>
<tr>
<td>IMSI catchers</td>
<td>IMSI</td>
<td>A fake cellular tower tricks nearby devices into revealing their IMSI for tracking and surveillance. Modern 5G networks reduce exposure through concealment techniques.</td>
</tr>
<tr>
<td>IMEI cloning</td>
<td>IMEI</td>
<td>A stolen device identity is copied onto another handset to evade blacklists. Carrier IMEI registries and fraud detection systems are the primary countermeasures.</td>
</tr>
</tbody>
</table>
</div>



<p class="wp-block-paragraph">The practical defenses are not exotic. For consumers: add a carrier-level port-out PIN to blunt SIM swaps, and prefer app-based authentication over SMS codes. For fleet operators: monitor for IMEI and IMSI mismatches, because a SIM that appears in a different device model than its TAC history suggests is worth investigating. Modern 5G networks help by concealing the permanent IMSI and using rotating temporary identifiers over the air.</p>



<h2 class="wp-block-heading"><strong>Identifiers in IoT Fleet Management</strong></h2>



<p class="wp-block-paragraph">Managing identifiers for one phone is trivial. Managing them for a fleet of 100,000 devices is a systems problem, and it is where the difference between identifier types stops being academic. At fleet scale you are reconciling ICCIDs against IMSIs against EIDs across an inventory that changes constantly as profiles are provisioned and devices are swapped. You are using TAC data to audit what hardware is actually on the network, and switching IMSIs to optimize roaming cost per region. None of that works from a spreadsheet. It needs a platform that treats identifiers as first-class, queryable objects.</p>



<div style="background-color: #fff4e5; border-left: 5px solid #FF9800; padding: 1.4em 1.6em; margin: 2em 0; border-radius: 6px; font-family: Arial, sans-serif; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
<div style="color: #ff9800; font-size: 1.05em; font-weight: bold; margin-bottom: 0.9em;">Where Spenza Fits</div>
<p style="margin: 0; line-height: 1.6;">Spenza’s <a style="font-weight: bold; color: #ff9800; text-decoration: none;" href="https://spenza.com/telecomhub/" target="_blank" rel="noopener"> TelecomHub </a> aggregates multi-operator connectivity and handles eSIM profile switching, while <a style="font-weight: bold; color: #ff9800; text-decoration: none;" href="https://spenza.com/controlhub/" target="_blank" rel="noopener"> ControlHub </a> unifies usage and identifier data into a single view for fleet decision-making. The <a style="font-weight: bold; color: #ff9800; text-decoration: none;" href="https://spenza.com/iot-solutions/" target="_blank" rel="noopener"> IoT solutions </a> overview shows how device makers like Angel Watch operate at scale, and the <a style="font-weight: bold; color: #ff9800; text-decoration: none;" href="https://spenza.com/telecom/angel-watch-iot-business-casestudy/" target="_blank" rel="noopener"> Angel Watch case study </a> walks through a real-world deployment.</p>
</div>



<h2 class="wp-block-heading"><strong>Bookmark This as Your Identifier Reference</strong></h2>



<p class="wp-block-paragraph">Seven identifiers, seven jobs. The ICCID is the SIM, the IMSI is the subscriber, the IMEI is the device, the EID is the eSIM chip, the MSISDN is the phone number, the TAC is the device model, and the EUICCID is the eUICC serial. Once you can see that hardware identifiers stay fixed while profile identifiers move, every cross-identifier question answers itself.</p>



<p class="wp-block-paragraph">If you manage connectivity at any real scale, the next step is not memorizing formats, it is putting identifier data into one system you can actually query and act on.</p>



<h2 class="wp-block-heading"><strong>FAQs</strong></h2>


<div class="wp-block-uagb-faq uagb-faq__outer-wrap uagb-block-5561fd5b uagb-faq-icon-row uagb-faq-layout-accordion uagb-faq-expand-first-true uagb-faq-inactive-other-true uagb-faq__wrap uagb-buttons-layout-wrap uagb-faq-equal-height     " data-faqtoggle="true" role="tablist"><div class="wp-block-uagb-faq-child uagb-faq-child__outer-wrap uagb-faq-item uagb-block-bf8f8d34 " role="tab" tabindex="0"><div class="uagb-faq-questions-button uagb-faq-questions">			<span class="uagb-icon uagb-faq-icon-wrap">
								<svg xmlns="https://www.w3.org/2000/svg" viewBox= "0 0 448 512"><path d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"></path></svg>
							</span>
						<span class="uagb-icon-active uagb-faq-icon-wrap">
								<svg xmlns="https://www.w3.org/2000/svg" viewBox= "0 0 448 512"><path d="M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"></path></svg>
							</span>
			<span class="uagb-question"><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong>What is the difference between IMEI and IMSI?</strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></span></div><div class="uagb-faq-content"><p>The IMEI identifies the device hardware and never changes. The IMSI identifies the subscriber and lives on the SIM, so it changes when you change SIM or when the operator reissues it. One is the phone, the other is the account.<br><a href="https://www.gsma.com/solutions-and-impact/technologies/esim/?utm_source=chatgpt.com"></a><a href="https://www.choiceiot.com/blog/why-using-a-multi-carrier-platform-is-important-to-solution-providers/?utm_source=chatgpt.com" target="_blank" rel="noreferrer noopener"></a></p></div></div><div class="wp-block-uagb-faq-child uagb-faq-child__outer-wrap uagb-faq-item uagb-block-d8e3659e " role="tab" tabindex="0"><div class="uagb-faq-questions-button uagb-faq-questions">			<span class="uagb-icon uagb-faq-icon-wrap">
								<svg xmlns="https://www.w3.org/2000/svg" viewBox= "0 0 448 512"><path d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"></path></svg>
							</span>
						<span class="uagb-icon-active uagb-faq-icon-wrap">
								<svg xmlns="https://www.w3.org/2000/svg" viewBox= "0 0 448 512"><path d="M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"></path></svg>
							</span>
			<span class="uagb-question"><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong>Can I change my ICCID?</strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></span></div><div class="uagb-faq-content"><p>Not the number on a given SIM, it is fixed at manufacture. But you get a new ICCID whenever you switch to a new SIM, and on an eSIM each profile you add brings its own ICCID.<br><a href="https://www.grandviewresearch.com/industry-analysis/managed-services-market?utm_source=chatgpt.com"></a></p></div></div><div class="wp-block-uagb-faq-child uagb-faq-child__outer-wrap uagb-faq-item uagb-block-42faebe2 " role="tab" tabindex="0"><div class="uagb-faq-questions-button uagb-faq-questions">			<span class="uagb-icon uagb-faq-icon-wrap">
								<svg xmlns="https://www.w3.org/2000/svg" viewBox= "0 0 448 512"><path d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"></path></svg>
							</span>
						<span class="uagb-icon-active uagb-faq-icon-wrap">
								<svg xmlns="https://www.w3.org/2000/svg" viewBox= "0 0 448 512"><path d="M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"></path></svg>
							</span>
			<span class="uagb-question"><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong>What is an EID number?</strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></span></div><div class="uagb-faq-content"><p>The EID is the 32-digit serial of the eUICC chip in an eSIM-capable device. It is permanent and does not change when you switch eSIM profiles. EUICCID is another name for the same number.<br><a href="https://iot-analytics.com/role-of-esim-for-iot-better-security-simplified-roaming-easier-provisioning/?utm_source=chatgpt.com"></a></p></div></div><div class="wp-block-uagb-faq-child uagb-faq-child__outer-wrap uagb-faq-item uagb-block-1145a284 " role="tab" tabindex="0"><div class="uagb-faq-questions-button uagb-faq-questions">			<span class="uagb-icon uagb-faq-icon-wrap">
								<svg xmlns="https://www.w3.org/2000/svg" viewBox= "0 0 448 512"><path d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"></path></svg>
							</span>
						<span class="uagb-icon-active uagb-faq-icon-wrap">
								<svg xmlns="https://www.w3.org/2000/svg" viewBox= "0 0 448 512"><path d="M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"></path></svg>
							</span>
			<span class="uagb-question"><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong>How do I find my MSISDN?</strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></span></div><div class="uagb-faq-content"><p>It is your phone number. On most phones it appears under Settings, then About, or you can dial *#06# on many devices to see it alongside the IMEI.</p></div></div><div class="wp-block-uagb-faq-child uagb-faq-child__outer-wrap uagb-faq-item uagb-block-134a2e77 " role="tab" tabindex="0"><div class="uagb-faq-questions-button uagb-faq-questions">			<span class="uagb-icon uagb-faq-icon-wrap">
								<svg xmlns="https://www.w3.org/2000/svg" viewBox= "0 0 448 512"><path d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"></path></svg>
							</span>
						<span class="uagb-icon-active uagb-faq-icon-wrap">
								<svg xmlns="https://www.w3.org/2000/svg" viewBox= "0 0 448 512"><path d="M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"></path></svg>
							</span>
			<span class="uagb-question"><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong>Is the IMEI the same as the serial number?</strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></span></div><div class="uagb-faq-content"><p>No. The IMEI is a standardized 15-digit network identifier governed by 3GPP. The manufacturer serial number is a separate internal code that is not used by the cellular network.<br><a href="/telecom/white-label-connectivity-solutions-for-msps/?utm_source=chatgpt.com"></a></p></div></div><div class="wp-block-uagb-faq-child uagb-faq-child__outer-wrap uagb-faq-item uagb-block-712952c8 " role="tab" tabindex="0"><div class="uagb-faq-questions-button uagb-faq-questions">			<span class="uagb-icon uagb-faq-icon-wrap">
								<svg xmlns="https://www.w3.org/2000/svg" viewBox= "0 0 448 512"><path d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"></path></svg>
							</span>
						<span class="uagb-icon-active uagb-faq-icon-wrap">
								<svg xmlns="https://www.w3.org/2000/svg" viewBox= "0 0 448 512"><path d="M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"></path></svg>
							</span>
			<span class="uagb-question"><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong>Why does my eSIM have an EID instead of an ICCID?</strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></span></div><div class="uagb-faq-content"><p>It has both. The EID identifies the physical eUICC chip, while each network profile loaded onto that chip has its own ICCID. The EID is the hardware anchor, the ICCID is the profile.<br><a href="/telecom/white-label-connectivity-solutions-for-msps/?utm_source=chatgpt.com"></a></p></div></div><div class="wp-block-uagb-faq-child uagb-faq-child__outer-wrap uagb-faq-item uagb-block-2ccd0194 " role="tab" tabindex="0"><div class="uagb-faq-questions-button uagb-faq-questions">			<span class="uagb-icon uagb-faq-icon-wrap">
								<svg xmlns="https://www.w3.org/2000/svg" viewBox= "0 0 448 512"><path d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"></path></svg>
							</span>
						<span class="uagb-icon-active uagb-faq-icon-wrap">
								<svg xmlns="https://www.w3.org/2000/svg" viewBox= "0 0 448 512"><path d="M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"></path></svg>
							</span>
			<span class="uagb-question"><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong>What is a TAC number?</strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></span></div><div class="uagb-faq-content"><p>The TAC is the first 8 digits of an IMEI. It identifies the device make and model, and is allocated through the GSMA.<br><a href="/telecom/white-label-connectivity-solutions-for-msps/?utm_source=chatgpt.com"></a></p></div></div><div class="wp-block-uagb-faq-child uagb-faq-child__outer-wrap uagb-faq-item uagb-block-867aa568 " role="tab" tabindex="0"><div class="uagb-faq-questions-button uagb-faq-questions">			<span class="uagb-icon uagb-faq-icon-wrap">
								<svg xmlns="https://www.w3.org/2000/svg" viewBox= "0 0 448 512"><path d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"></path></svg>
							</span>
						<span class="uagb-icon-active uagb-faq-icon-wrap">
								<svg xmlns="https://www.w3.org/2000/svg" viewBox= "0 0 448 512"><path d="M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"></path></svg>
							</span>
			<span class="uagb-question"><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong>Does the IMSI change when I roam?</strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></span></div><div class="uagb-faq-content"><p>Not on a single-profile SIM, your home IMSI stays the same and the visited network routes back to your home operator. On a multi-IMSI or multi-profile eSIM, the device can switch to a different IMSI for better local economics.<br><a href="/telecom/white-label-connectivity-solutions-for-msps/?utm_source=chatgpt.com"></a></p></div></div><div class="wp-block-uagb-faq-child uagb-faq-child__outer-wrap uagb-faq-item uagb-block-d2ffb139 " role="tab" tabindex="0"><div class="uagb-faq-questions-button uagb-faq-questions">			<span class="uagb-icon uagb-faq-icon-wrap">
								<svg xmlns="https://www.w3.org/2000/svg" viewBox= "0 0 448 512"><path d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"></path></svg>
							</span>
						<span class="uagb-icon-active uagb-faq-icon-wrap">
								<svg xmlns="https://www.w3.org/2000/svg" viewBox= "0 0 448 512"><path d="M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"></path></svg>
							</span>
			<span class="uagb-question"><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong><strong>Is ICCID the same as the SIM card number?</strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></strong></span></div><div class="uagb-faq-content"><p>Yes. ICCID, SIM card number and SIM serial number all refer to the same identifier printed on or stored in the SIM.<br><a href="/telecom/white-label-connectivity-solutions-for-msps/?utm_source=chatgpt.com"></a></p></div></div></div>


<p class="wp-block-paragraph"><strong><strong>Spenza gives device makers, MVNOs, and IoT operators one platform to provision, track, and switch SIM and eSIM identifiers across 180+ countries. <a href="https://calendly.com/spenza/discovery" target="_blank" rel="noreferrer noopener">Talk to the Spenza team today.</a></strong></strong></p>



<div class="wp-block-uagb-buttons uagb-buttons__outer-wrap uagb-btn__default-btn uagb-btn-tablet__default-btn uagb-btn-mobile__default-btn uagb-block-68257511">
<div class="uagb-buttons__wrap uagb-buttons-layout-wrap ">
<div class="wp-block-uagb-buttons-child uagb-buttons__outer-wrap uagb-block-74a16303 wp-block-button">
<div class="uagb-button__wrapper">
<div class="uagb-button__link">Contact Us Today</div>
</div>
</div>
</div>
</div>



<p class="wp-block-paragraph">&nbsp;</p>
