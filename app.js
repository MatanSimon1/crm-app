const LOGO_SRC='data:image/jpeg;base64,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';
const HEB_MONTHS=['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

let state={leads:[],spreadsheetId:'',sheetTab:'Main CRM',clientName:'',sortField:'date',sortDir:-1,editingId:null,nextId:1,avgMonths:5};
let selectedMonth='all';

// ── STORAGE HELPERS ────────────────────────────────────────────────────────
function getClients(){try{return JSON.parse(localStorage.getItem('crm_clients')||'[]');}catch{return[];}}
function saveClients(clients){localStorage.setItem('crm_clients',JSON.stringify(clients));}

// ── INIT ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  ['login-logo-img','admin-logo-img','crm-logo-img'].forEach(id=>{const el=document.getElementById(id);if(el)el.src=LOGO_SRC;});
  const saved=sessionStorage.getItem('crm_session');
  if(saved){const s=JSON.parse(saved);if(s.role==='admin')showAdminScreen();else if(s.role==='client'){const clients=getClients();const c=clients.find(x=>x.id===s.clientId);if(c)loadClientCRM(c);else showLoginScreen();}}
  else showLoginScreen();
});

function showLoginScreen(){hideAllScreens();document.getElementById('login-screen').classList.add('active');}
function hideAllScreens(){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));}

// ── LOGIN ──────────────────────────────────────────────────────────────────
function doLogin(){
  const username=document.getElementById('login-username').value.trim();
  const password=document.getElementById('login-password').value;
  const errEl=document.getElementById('login-error');errEl.style.display='none';

  // Check admin
  if((username.toLowerCase()==='admin'||username==='מנהל')&&password===ADMIN_PASSWORD){
    sessionStorage.setItem('crm_session',JSON.stringify({role:'admin'}));
    showAdminScreen();return;
  }
  // Check clients
  const clients=getClients();
  const client=clients.find(c=>c.username.toLowerCase()===username.toLowerCase()&&c.password===password&&c.active!==false);
  if(client){
    sessionStorage.setItem('crm_session',JSON.stringify({role:'client',clientId:client.id}));
    loadClientCRM(client);return;
  }
  errEl.style.display='block';
}

function doLogout(){
  sessionStorage.removeItem('crm_session');
  if(autoSyncInterval)clearInterval(autoSyncInterval);
  showLoginScreen();
  document.getElementById('login-password').value='';
}

// ── ADMIN SCREEN ───────────────────────────────────────────────────────────
function showAdminScreen(){
  hideAllScreens();
  document.getElementById('admin-screen').classList.add('active');
  renderAdminClients();
  renderAdminStats();
}

function renderAdminStats(){
  const clients=getClients();
  const active=clients.filter(c=>c.active!==false).length;
  document.getElementById('admin-stats').innerHTML=
    '<span style="color:var(--text2);font-size:13px">'+clients.length+' לקוחות · '+active+' פעילים</span>';
}

function renderAdminClients(){
  const clients=getClients();
  const el=document.getElementById('client-list');
  if(!clients.length){
    el.innerHTML='<div style="color:var(--text3);font-size:14px;padding:2rem;text-align:center">עדיין אין לקוחות. הוסף לקוח ראשון ↑</div>';
    return;
  }
  el.innerHTML=clients.map(c=>`
    <div class="client-row" id="crow-${c.id}">
      <div class="client-row-info" onclick="adminOpenClient('${c.id}')">
        <div class="client-row-name">${esc(c.name)}</div>
        <div class="client-row-sub">@${esc(c.username)} · ${esc(c.sheetTab||'Main CRM')}</div>
      </div>
      <div class="client-row-actions">
        <button class="btn-row-admin" onclick="adminOpenClient('${c.id}')">פתח CRM</button>
        <button class="btn-row-admin" onclick="editClient('${c.id}')">ערוך</button>
        <button class="btn-row-admin danger" onclick="deleteClient('${c.id}')">מחק</button>
      </div>
    </div>
  `).join('');
}

function openAddClient(){
  document.getElementById('client-modal-title').textContent='הוסף לקוח';
  document.getElementById('cm-id').value='';
  document.getElementById('cm-name').value='';
  document.getElementById('cm-username').value='';
  document.getElementById('cm-password').value='';
  document.getElementById('cm-sheet-url').value='';
  document.getElementById('cm-sheet-tab').value='Main CRM';
  document.getElementById('cm-avg-months').value='5';
  document.getElementById('client-modal').classList.add('open');
  setTimeout(()=>document.getElementById('cm-name').focus(),80);
}

function editClient(id){
  const c=getClients().find(x=>x.id===id);if(!c)return;
  document.getElementById('client-modal-title').textContent='ערוך לקוח';
  document.getElementById('cm-id').value=c.id;
  document.getElementById('cm-name').value=c.name;
  document.getElementById('cm-username').value=c.username;
  document.getElementById('cm-password').value=c.password;
  document.getElementById('cm-sheet-url').value=c.sheetUrl||'';
  document.getElementById('cm-sheet-tab').value=c.sheetTab||'Main CRM';
  document.getElementById('cm-avg-months').value=c.avgMonths||5;
  document.getElementById('client-modal').classList.add('open');
}

function saveClient(){
  const id=document.getElementById('cm-id').value;
  const name=document.getElementById('cm-name').value.trim();
  const username=document.getElementById('cm-username').value.trim();
  const password=document.getElementById('cm-password').value.trim();
  const sheetUrl=document.getElementById('cm-sheet-url').value.trim();
  const sheetTab=document.getElementById('cm-sheet-tab').value.trim()||'Main CRM';
  const avgMonths=parseInt(document.getElementById('cm-avg-months').value)||5;
  if(!name||!username||!password||!sheetUrl){showAdminToast('כל השדות הם חובה','error');return;}
  const sheetId=extractSheetId(sheetUrl);
  if(!sheetId){showAdminToast('קישור גיליון לא תקין','error');return;}
  const clients=getClients();
  if(id){
    const idx=clients.findIndex(x=>x.id===id);
    if(idx>-1)clients[idx]={...clients[idx],name,username,password,sheetUrl,sheetId,sheetTab,avgMonths};
  }else{
    clients.push({id:Date.now().toString(),name,username,password,sheetUrl,sheetId,sheetTab,avgMonths,active:true});
  }
  saveClients(clients);
  document.getElementById('client-modal').classList.remove('open');
  renderAdminClients();renderAdminStats();
  showAdminToast(id?'לקוח עודכן ✓':'לקוח נוסף ✓','success');
}

function deleteClient(id){
  const c=getClients().find(x=>x.id===id);if(!c)return;
  if(!confirm('למחוק את הלקוח "'+c.name+'"?\nהנתונים בגיליון לא יימחקו.'))return;
  const clients=getClients().filter(x=>x.id!==id);
  saveClients(clients);renderAdminClients();renderAdminStats();
  showAdminToast('לקוח נמחק','success');
}

function adminOpenClient(id){
  const c=getClients().find(x=>x.id===id);if(!c)return;
  document.getElementById('btn-back-admin').style.display='flex';
  loadClientCRM(c);
}
function goBackAdmin(){if(autoSyncInterval)clearInterval(autoSyncInterval);showAdminScreen();}

let adminToastTimer=null;
function showAdminToast(msg,type){
  const t=document.getElementById('admin-toast');
  t.textContent=msg;t.className='admin-toast show '+(type||'');
  if(adminToastTimer)clearTimeout(adminToastTimer);
  adminToastTimer=setTimeout(()=>t.classList.remove('show'),2500);
}

// ── LOAD CLIENT CRM ────────────────────────────────────────────────────────
async function loadClientCRM(client){
  state.spreadsheetId=client.sheetId;
  state.sheetTab=client.sheetTab||'Main CRM';
  state.clientName=client.name;
  state.avgMonths=client.avgMonths||5;
  hideAllScreens();
  document.getElementById('crm-screen').classList.add('active');
  document.getElementById('s-client-name').textContent=client.name;
  setSyncStatus('טוען...','saving');
  const isAdmin=JSON.parse(sessionStorage.getItem('crm_session')||'{}').role==='admin';
  document.getElementById('btn-back-admin').style.display=isAdmin?'flex':'none';
  try{
    await fetchFromSheet();
    buildMonthFilter();renderTable();renderSidebar();
    setSyncStatus('נטען ✓','success');startAutoSync();
  }catch(e){setSyncStatus('שגיאה בטעינה','error');showToast('שגיאה: '+e.message,'error');}
}

// ── MONTH FILTER ───────────────────────────────────────────────────────────
function buildMonthFilter(){
  const months=new Set();
  state.leads.forEach(l=>{const p=(l.date||'').split('/');if(p.length===3)months.add(p[2]+'-'+p[1].padStart(2,'0'));});
  const sorted=[...months].sort().reverse();
  const sel=document.getElementById('month-filter');
  sel.innerHTML='<option value="all">כל הזמן</option>'+
    sorted.map(m=>{const[y,mo]=m.split('-');const label=HEB_MONTHS[parseInt(mo)-1]+' '+y;return `<option value="${m}">${label}</option>`;}).join('');
  sel.value=selectedMonth;
}
function onMonthFilterChange(){
  selectedMonth=document.getElementById('month-filter').value;
  renderTable();renderSidebar();
  if(document.getElementById('view-analytics').style.display!=='none'){calcFinance();renderAnalytics();}
}
function getFilteredByMonth(leads){
  if(selectedMonth==='all')return leads;
  const[y,mo]=selectedMonth.split('-');
  return leads.filter(l=>{const p=(l.date||'').split('/');if(p.length!==3)return false;return p[2]===y&&p[1].padStart(2,'0')===mo;});
}

// ── FETCH & WRITE ──────────────────────────────────────────────────────────
function extractSheetId(url){const m=url.match(/\/d\/([a-zA-Z0-9-_]+)/);return m?m[1]:null;}
async function fetchFromSheet(){
  const range=encodeURIComponent(`${state.sheetTab}!A1:I300`);
  const res=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${state.spreadsheetId}/values/${range}?key=${GLOBAL_API_KEY}`);
  if(!res.ok){const e=await res.json();throw new Error(e.error?.message||`HTTP ${res.status}`);}
  const data=await res.json();const rows=data.values||[];
  state.leads=[];state.nextId=1;
  for(let i=1;i<rows.length;i++){const r=rows[i];if(!(r[1]||'').trim())continue;
    state.leads.push({id:state.nextId++,rowIndex:i+1,date:r[0]||'',name:r[1]||'',phone:r[2]||'',status:r[3]||'',notes:r[4]||'',income:r[5]||'',campaign:r[6]||'',ad:r[7]||'',platform:r[8]||''});}
}
function leadToRow(l){return[l.date,l.name,l.phone,l.status,l.notes,l.income,l.campaign,l.ad,l.platform];}
async function scriptPost(payload){await fetch(GLOBAL_APPS_SCRIPT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});await new Promise(r=>setTimeout(r,1400));}
async function appendToSheet(lead){await scriptPost({action:'append',row:leadToRow(lead)});}
async function updateRowInSheet(lead){if(!lead.rowIndex){await appendToSheet(lead);return;}await scriptPost({action:'update',rowIndex:lead.rowIndex,row:leadToRow(lead)});}
async function deleteRowInSheet(lead){if(!lead.rowIndex)return;await scriptPost({action:'clear',rowIndex:lead.rowIndex});}

// ── AUTO SYNC ──────────────────────────────────────────────────────────────
let autoSyncInterval=null;
function startAutoSync(){
  if(autoSyncInterval)clearInterval(autoSyncInterval);
  autoSyncInterval=setInterval(async()=>{
    if(!document.getElementById('modal-overlay').classList.contains('open')){
      try{await fetchFromSheet();buildMonthFilter();renderTable();renderSidebar();setSyncStatus('עודכן '+new Date().toLocaleTimeString('he-IL'),'success');}catch{}
    }
  },30000);
}
function setSyncStatus(msg,type){const el=document.getElementById('sync-status');if(el){el.textContent=msg;el.className='sync-status '+(type||'');}}

// ── TABS ───────────────────────────────────────────────────────────────────
function switchTab(tab,btn){
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));btn.classList.add('active');
  document.getElementById('view-leads').style.display=tab==='leads'?'flex':'none';
  document.getElementById('view-analytics').style.display=tab==='analytics'?'block':'none';
  document.getElementById('fin-section').style.display=tab==='analytics'?'block':'none';
  if(tab==='analytics'){calcFinance();renderAnalytics();}
}

// ── SIDEBAR ────────────────────────────────────────────────────────────────
function renderSidebar(){
  const l=getFilteredByMonth(state.leads);
  const total=l.length,nw=l.filter(x=>x.status==='ליד חדש').length,ip=l.filter(x=>x.status==='פולואפ'||x.status==='ביקש פרטים נוספים בוואטסאפ').length,ir=l.filter(x=>x.status==='לא רלוונטי').length,reg=l.filter(x=>x.status==='נרשם').length;
  document.getElementById('s-stats').innerHTML=`
    <div class="s-stat"><span class="s-stat-label">סה"כ</span><span class="s-stat-val">${total}</span></div>
    <div class="s-stat"><span class="s-stat-label">ליד חדש</span><span class="s-stat-val blue">${nw}</span></div>
    <div class="s-stat"><span class="s-stat-label">בתהליך</span><span class="s-stat-val amber">${ip}</span></div>
    <div class="s-stat"><span class="s-stat-label">לא רלוונטי</span><span class="s-stat-val red">${ir}</span></div>
    <div class="s-stat"><span class="s-stat-label">נרשם</span><span class="s-stat-val green">${reg}</span></div>`;
}

// ── FINANCE ────────────────────────────────────────────────────────────────
function calcFinance(){
  const l=getFilteredByMonth(state.leads);
  const budget=parseFloat(document.getElementById('budget')?.value)||0;
  const avgM=state.avgMonths||1;
  const total=l.length,reg=l.filter(x=>x.status==='נרשם').length;
  const costPerLead=total>0&&budget>0?Math.round(budget/total):0;
  const totalInc=l.filter(x=>x.income&&x.status==='נרשם').reduce((s,x)=>s+(parseFloat(x.income)||0),0);
  const avgMonthlyInc=reg>0?Math.round(totalInc/reg):0;
  const ltv=Math.round(avgMonthlyInc*avgM);
  const totalRev=reg*ltv;
  const roas=budget>0?Math.round((totalRev/budget)*100)+'%':'—';
  const el=document.getElementById('fin-results');if(!el)return;
  el.innerHTML=`
    <div class="fin-row"><span class="fin-label">עלות לליד</span><span class="fin-val">₪${costPerLead.toLocaleString()}</span></div>
    <div class="fin-row"><span class="fin-label">ממוצע הכנסה חודשית</span><span class="fin-val">₪${avgMonthlyInc.toLocaleString()}</span></div>
    <div class="fin-row"><span class="fin-label">LTV (ערך לקוח)</span><span class="fin-val">₪${ltv.toLocaleString()}</span></div>
    <div class="fin-row"><span class="fin-label">סה"כ הכנסות</span><span class="fin-val">₪${totalRev.toLocaleString()}</span></div>
    <div class="fin-row"><span class="fin-label">ROAS</span><span class="fin-val">${roas}</span></div>`;
}

// ── ANALYTICS ─────────────────────────────────────────────────────────────
function renderAnalytics(){
  const l=getFilteredByMonth(state.leads);
  const budget=parseFloat(document.getElementById('budget')?.value)||0;
  const avgM=state.avgMonths||1;
  const total=l.length,reg=l.filter(x=>x.status==='נרשם').length;
  const conv=total>0?Math.round((reg/total)*100):0;
  const totalInc=l.filter(x=>x.income&&x.status==='נרשם').reduce((s,x)=>s+(parseFloat(x.income)||0),0);
  const avgInc=reg>0?Math.round(totalInc/reg):0;const ltv=Math.round(avgInc*avgM);
  const roas=budget>0?Math.round((reg*ltv/budget)*100)+'%':'—';
  const costPerLead=total>0&&budget>0?Math.round(budget/total):0;
  document.getElementById('kpi-row').innerHTML=`
    ${kpiCard('סה"כ לידים',total,'','var(--blue)')}
    ${kpiCard('נרשמו',reg,reg+' מתוך '+total,'var(--green)')}
    ${kpiCard('המרה',conv+'%','','var(--accent)')}
    ${kpiCard('עלות לליד',costPerLead>0?'₪'+costPerLead:'—','','var(--amber)')}
    ${kpiCard('LTV',ltv>0?'₪'+ltv.toLocaleString():'—','x'+avgM+' חודשים','var(--green)')}
    ${kpiCard('ROAS',roas,'','var(--accent)')}`;
  const statuses=[{s:'ליד חדש',c:'#60a5fa'},{s:'ביקש פרטים נוספים בוואטסאפ',c:'#4ade80'},{s:'פולואפ',c:'#fbbf24'},{s:'לא רלוונטי',c:'#f87171'},{s:'נרשם',c:'#d4ff5c'},{s:'לא נרשם',c:'#9ca3af'}];
  document.getElementById('status-bars').innerHTML=statuses.map(({s,c})=>{
    const cnt=l.filter(x=>x.status===s).length;const pct=total>0?Math.round(cnt/total*100):0;
    const label=s.length>22?s.slice(0,22)+'...':s;
    return `<div class="bar-row"><div class="bar-label-row"><span style="color:var(--text2)">${label}</span><span style="color:${c};font-weight:600">${cnt} (${pct}%)</span></div><div class="bar-track"><div class="bar-fill" style="background:${c};width:${pct}%"></div></div></div>`;
  }).join('');
  const adMap={};l.forEach(x=>{if(x.ad)adMap[x.ad]=(adMap[x.ad]||0)+1;});
  const ads=Object.entries(adMap).sort((a,b)=>b[1]-a[1]).slice(0,8);const maxAd=ads[0]?ads[0][1]:1;
  document.getElementById('ad-bars').innerHTML=ads.length?ads.map(([ad,cnt])=>`<div class="bar-row"><div class="bar-label-row"><span style="color:var(--text2)">${ad}</span><span style="color:var(--amber);font-weight:600">${cnt}</span></div><div class="bar-track"><div class="bar-fill" style="background:var(--amber);width:${Math.round(cnt/maxAd*100)}%"></div></div></div>`).join(''):'<div style="color:var(--text3);font-size:12px">אין נתוני מודעות</div>';
}
function kpiCard(label,val,sub,color){return `<div class="kpi-card"><div class="kpi-label">${label}</div><div class="kpi-val" style="color:${color}">${val}</div>${sub?`<div class="kpi-sub">${sub}</div>`:''}</div>`;}

// ── TABLE ──────────────────────────────────────────────────────────────────
function getFiltered(){
  const q=(document.getElementById('search')?.value||'').toLowerCase();
  const st=document.getElementById('filter-status')?.value||'';
  const pl=document.getElementById('filter-platform')?.value||'';
  return getFilteredByMonth(state.leads).filter(l=>{
    if(q&&!l.name.toLowerCase().includes(q)&&!l.phone.includes(q))return false;
    if(st&&l.status!==st)return false;if(pl&&l.platform!==pl)return false;return true;
  }).sort((a,b)=>{const av=a[state.sortField]||'',bv=b[state.sortField]||'';return av>bv?state.sortDir:av<bv?-state.sortDir:0;});
}
function badgeClass(s){if(s==='ליד חדש')return 'badge-new';if(s==='ביקש פרטים נוספים בוואטסאפ')return 'badge-details';if(s==='פולואפ')return 'badge-followup';if(s==='נרשם')return 'badge-registered';if(s==='לא נרשם')return 'badge-notregistered';return 'badge-irrelevant';}
function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function renderTable(){
  const rows=getFiltered();
  const tbody=document.getElementById('table-body');const empty=document.getElementById('empty-state');const cards=document.getElementById('cards-body');
  document.getElementById('row-count').textContent=rows.length+' מתוך '+getFilteredByMonth(state.leads).length+' לידים';
  if(!rows.length){if(tbody)tbody.innerHTML='';if(empty)empty.style.display='flex';if(cards)cards.innerHTML='';return;}
  if(empty)empty.style.display='none';
  if(tbody)tbody.innerHTML=rows.map(l=>`<tr>
    <td class="date-cell">${l.date||'—'}</td><td class="name-cell">${esc(l.name)}</td>
    <td class="phone-cell"><a href="tel:${l.phone}">${l.phone}</a></td>
    <td><span class="badge ${badgeClass(l.status)}">${esc(l.status)}</span></td>
    <td class="note-cell" title="${esc(l.notes)}">${esc(l.notes)||'—'}</td>
    <td class="income-cell">${l.income?'₪'+esc(l.income):'—'}</td>
    <td><div class="platform-cell"><span>${l.platform==='fb'?'Facebook':l.platform==='ig'?'Instagram':l.platform||'—'}</span><div class="platform-dot ${l.platform==='fb'?'dot-fb':l.platform==='ig'?'dot-ig':''}"></div></div></td>
    <td class="ad-cell" title="${esc(l.ad)}">${esc(l.ad)||'—'}</td>
    <td><div class="row-actions"><button class="btn-row" onclick="openEdit(${l.id})">ערוך</button><button class="btn-row danger" onclick="deleteLead(${l.id})">✕</button></div></td>
  </tr>`).join('');
  if(cards)cards.innerHTML=rows.map(l=>`<div class="lead-card">
    <div class="lead-card-top"><div class="lead-card-name">${esc(l.name)}</div><div class="lead-card-date">${l.date||'—'}</div></div>
    <div class="lead-card-phone">📞 ${l.phone}</div>
    <div class="lead-card-row"><span class="badge ${badgeClass(l.status)}">${esc(l.status)}</span>${l.income?'<span style="color:var(--green);font-size:12px;font-family:monospace">₪'+esc(l.income)+'</span>':''}</div>
    ${l.notes?'<div style="font-size:12px;color:var(--text2);margin-top:6px">'+esc(l.notes)+'</div>':''}
    <div class="lead-card-actions"><button class="btn-card" onclick="openEdit(${l.id})">ערוך</button><button class="btn-card danger" onclick="deleteLead(${l.id})">מחק</button></div>
  </div>`).join('');
}
function sortBy(f){if(state.sortField===f)state.sortDir*=-1;else{state.sortField=f;state.sortDir=1;}renderTable();}

// ── MODAL ──────────────────────────────────────────────────────────────────
function openModal(){state.editingId=null;document.getElementById('modal-title').textContent='הוסף ליד חדש';document.getElementById('save-btn-text').textContent='שמור לגיליון';document.getElementById('f-date').value=new Date().toISOString().slice(0,10);['f-name','f-phone','f-notes','f-income','f-campaign','f-ad'].forEach(id=>document.getElementById(id).value='');document.getElementById('f-platform').value='fb';setStatusPill('ליד חדש');document.getElementById('modal-overlay').classList.add('open');setTimeout(()=>document.getElementById('f-name').focus(),100);}
function openEdit(id){const l=state.leads.find(x=>x.id===id);if(!l)return;state.editingId=id;document.getElementById('modal-title').textContent='ערוך ליד';document.getElementById('save-btn-text').textContent='עדכן גיליון';const dp=(l.date||'').split('/');document.getElementById('f-date').value=dp.length===3?`${dp[2]}-${dp[1]}-${dp[0]}`:l.date;document.getElementById('f-name').value=l.name;document.getElementById('f-phone').value=l.phone;document.getElementById('f-notes').value=l.notes;document.getElementById('f-income').value=l.income;document.getElementById('f-campaign').value=l.campaign;document.getElementById('f-ad').value=l.ad;document.getElementById('f-platform').value=l.platform||'fb';setStatusPill(l.status);document.getElementById('modal-overlay').classList.add('open');}
function closeModal(){document.getElementById('modal-overlay').classList.remove('open');}
function handleOverlayClick(e){if(e.target===document.getElementById('modal-overlay'))closeModal();}
function selectStatus(btn){document.querySelectorAll('#modal-overlay .pill').forEach(p=>p.classList.remove('active'));btn.classList.add('active');}
function setStatusPill(val){document.querySelectorAll('#modal-overlay .pill').forEach(p=>p.classList.toggle('active',p.dataset.val===val));}
function getSelectedStatus(){const a=document.querySelector('#modal-overlay .pill.active');return a?a.dataset.val:'ליד חדש';}

// ── SAVE / DELETE ──────────────────────────────────────────────────────────
async function saveLead(){
  const raw=document.getElementById('f-date').value;const dp=raw?raw.split('-'):[];
  const date=dp.length===3?`${dp[2]}/${dp[1]}/${dp[0]}`:raw;
  const name=document.getElementById('f-name').value.trim();const phone=document.getElementById('f-phone').value.trim();
  if(!name){showToast('שם הוא שדה חובה','error');return;}if(!phone){showToast('טלפון הוא שדה חובה','error');return;}
  const lead={date,name,phone,status:getSelectedStatus(),notes:document.getElementById('f-notes').value.trim(),income:document.getElementById('f-income').value.trim(),campaign:document.getElementById('f-campaign').value.trim(),ad:document.getElementById('f-ad').value.trim(),platform:document.getElementById('f-platform').value};
  const saveBtn=document.querySelector('.modal-footer .btn-primary');saveBtn.innerHTML='<div class="spinner"></div>';saveBtn.disabled=true;setSyncStatus('שומר...','saving');
  try{
    if(state.editingId){const existing=state.leads.find(x=>x.id===state.editingId);const updated={...existing,...lead};await updateRowInSheet(updated);state.leads=state.leads.map(l=>l.id===state.editingId?updated:l);showToast('עודכן ✓','success');}
    else{await appendToSheet(lead);await fetchFromSheet();buildMonthFilter();showToast('נוסף ✓','success');}
    closeModal();renderTable();renderSidebar();setSyncStatus('עודכן ✓','success');
  }catch(e){showToast('שגיאה: '+e.message,'error');setSyncStatus('שמירה נכשלה','error');}
  finally{saveBtn.innerHTML=`<span id="save-btn-text">${state.editingId?'עדכן גיליון':'שמור לגיליון'}</span>`;saveBtn.disabled=false;}
}
async function deleteLead(id){
  const lead=state.leads.find(x=>x.id===id);if(!lead)return;
  if(!confirm(`למחוק את "${lead.name}"?`))return;
  setSyncStatus('מוחק...','saving');
  try{await deleteRowInSheet(lead);state.leads=state.leads.filter(x=>x.id!==id);renderTable();renderSidebar();showToast('נמחק ✓','success');setSyncStatus('עודכן ✓','success');}
  catch(e){showToast('מחיקה נכשלה','error');}
}
let toastTimer=null;
function showToast(msg,type){const t=document.getElementById('toast');t.textContent=msg;t.className='toast show '+(type||'');if(toastTimer)clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2800);}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();document.getElementById('client-modal')?.classList.remove('open');}if((e.metaKey||e.ctrlKey)&&e.key==='Enter'&&document.getElementById('modal-overlay').classList.contains('open'))saveLead();});
