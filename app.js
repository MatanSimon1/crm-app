const HEB_MONTHS=['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
let state={leads:[],spreadsheetId:'',sheetTab:'Main CRM',clientName:'',clientId:'',sortField:'date',sortDir:-1,editingId:null,nextId:1,avgMonths:5,colMap:null,budgets:{}};
let selectedMonth='all';

// ── CLIENT STORAGE (Apps Script = synced everywhere) ───────────────────────
async function fetchClients(){
  const res=await fetch(APPS_SCRIPT_URL+'?action=getClients');
  const d=await res.json();
  if(d.status==='error') throw new Error(d.message);
  return d.clients||[];
}
async function pushSaveClient(client){
  await fetch(APPS_SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'saveClient',client})});
  await sleep(1000);
}
async function pushDeleteClient(clientId){
  await fetch(APPS_SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'deleteClient',clientId})});
  await sleep(1000);
}

// ── BUDGET STORAGE (per client per month) ─────────────────────────────────
async function fetchBudgets(clientId){
  const res=await fetch(APPS_SCRIPT_URL+'?action=getBudgets&clientId='+encodeURIComponent(clientId));
  const d=await res.json();
  if(d.status==='error') return {};
  return d.budgets||{};
}
async function saveBudget(clientId,month,budget){
  await fetch(APPS_SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'saveBudget',clientId,month,budget})});
}

function getBudgetKey(){return selectedMonth==='all'?'all':selectedMonth;}
function getCurrentBudget(){return state.budgets[getBudgetKey()]||0;}

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

// ── INIT ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  const saved=sessionStorage.getItem('crm_session');
  if(saved){
    const s=JSON.parse(saved);
    if(s.role==='admin') showAdminScreen();
    else if(s.role==='client') reloadClientSession(s);
  } else showLoginScreen();
});

async function reloadClientSession(s){
  try{
    const clients=await fetchClients();
    const c=clients.find(x=>x.id===s.clientId);
    if(c) loadClientCRM(c);else showLoginScreen();
  }catch{showLoginScreen();}
}

function showLoginScreen(){hideAll();document.getElementById('login-screen').classList.add('active');}
function hideAll(){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));}

// ── LOGIN ──────────────────────────────────────────────────────────────────
async function doLogin(){
  const u=document.getElementById('login-username').value.trim();
  const p=document.getElementById('login-password').value;
  document.getElementById('login-error').style.display='none';
  const btn=document.querySelector('#login-screen .btn-primary');
  btn.innerHTML='<div class="spinner"></div>';btn.disabled=true;

  if((u.toLowerCase()==='admin'||u==='מנהל')&&p===ADMIN_PASSWORD){
    sessionStorage.setItem('crm_session',JSON.stringify({role:'admin'}));
    btn.innerHTML='כניסה';btn.disabled=false;
    showAdminScreen();return;
  }
  try{
    const clients=await fetchClients();
    const c=clients.find(x=>x.username.toLowerCase()===u.toLowerCase()&&x.password===p&&x.active!==false);
    if(c){sessionStorage.setItem('crm_session',JSON.stringify({role:'client',clientId:c.id}));loadClientCRM(c);}
    else document.getElementById('login-error').style.display='block';
  }catch(e){document.getElementById('login-error').textContent='שגיאת חיבור: '+e.message;document.getElementById('login-error').style.display='block';}
  btn.innerHTML='כניסה';btn.disabled=false;
}

function doLogout(){
  sessionStorage.removeItem('crm_session');
  if(autoSyncInterval)clearInterval(autoSyncInterval);
  showLoginScreen();document.getElementById('login-password').value='';
}

// ── ADMIN ──────────────────────────────────────────────────────────────────
let adminClients=[];
async function showAdminScreen(){
  hideAll();document.getElementById('admin-screen').classList.add('active');
  document.getElementById('client-list').innerHTML='<div style="color:var(--text3);padding:2rem;text-align:center">טוען...</div>';
  try{
    adminClients=await fetchClients();
    renderAdminClients();
    document.getElementById('admin-stats').innerHTML='<span style="color:var(--text2);font-size:12px">'+adminClients.length+' לקוחות</span>';
  }catch(e){document.getElementById('client-list').innerHTML='<div style="color:var(--red);padding:2rem">שגיאה: '+e.message+'</div>';}
}

function renderAdminClients(){
  const el=document.getElementById('client-list');
  if(!adminClients.length){el.innerHTML='<div style="color:var(--text3);font-size:14px;padding:2rem;text-align:center">עדיין אין לקוחות — לחץ "הוסף לקוח" ↑</div>';return;}
  el.innerHTML=adminClients.map(c=>`
    <div class="client-row">
      <div class="client-row-info" onclick="adminOpenClient('${c.id}')">
        <div class="client-row-name">${esc(c.name)}</div>
        <div class="client-row-sub">@${esc(c.username)} · ${esc(c.sheetTab||'Main CRM')}</div>
      </div>
      <div class="client-row-actions">
        <button class="btn-row-admin" onclick="adminOpenClient('${c.id}')">פתח CRM</button>
        <button class="btn-row-admin" onclick="editClient('${c.id}')">ערוך</button>
        <button class="btn-row-admin danger" onclick="deleteClient('${c.id}')">מחק</button>
      </div>
    </div>`).join('');
}

function openAddClient(){
  document.getElementById('client-modal-title').textContent='הוסף לקוח';
  document.getElementById('cm-id').value='';
  ['cm-name','cm-username','cm-password','cm-sheet-url'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('cm-sheet-tab').value='Main CRM';
  document.getElementById('cm-avg-months').value='5';
  document.getElementById('client-modal').classList.add('open');
  setTimeout(()=>document.getElementById('cm-name').focus(),80);
}
function editClient(id){
  const c=adminClients.find(x=>x.id===id);if(!c)return;
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

async function saveClient(){
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
  const btn=document.querySelector('#client-modal .btn-primary');btn.innerHTML='<div class="spinner"></div>';btn.disabled=true;
  const client={id:id||Date.now().toString(),name,username,password,sheetUrl,sheetId,sheetTab,avgMonths,active:true};
  try{
    await pushSaveClient(client);
    document.getElementById('client-modal').classList.remove('open');
    showAdminToast(id?'לקוח עודכן ✓':'לקוח נוסף ✓','success');
    await showAdminScreen();
  }catch(e){showAdminToast('שגיאה: '+e.message,'error');}
  btn.innerHTML='שמור';btn.disabled=false;
}

async function deleteClient(id){
  const c=adminClients.find(x=>x.id===id);if(!c)return;
  if(!confirm('למחוק את הלקוח "'+c.name+'"?'))return;
  try{await pushDeleteClient(id);showAdminToast('לקוח נמחק','success');await showAdminScreen();}
  catch(e){showAdminToast('שגיאה','error');}
}

function adminOpenClient(id){
  const c=adminClients.find(x=>x.id===id);if(!c)return;
  document.getElementById('btn-back-admin').style.display='flex';loadClientCRM(c);
}
function goBackAdmin(){if(autoSyncInterval)clearInterval(autoSyncInterval);showAdminScreen();}

let adminToastTimer=null;
function showAdminToast(msg,type){
  const t=document.getElementById('admin-toast');t.textContent=msg;t.className='admin-toast show '+(type||'');
  if(adminToastTimer)clearTimeout(adminToastTimer);adminToastTimer=setTimeout(()=>t.classList.remove('show'),2500);
}

// ── LOAD CLIENT ────────────────────────────────────────────────────────────
async function loadClientCRM(client){
  state.spreadsheetId=client.sheetId;state.sheetTab=client.sheetTab||'Main CRM';
  state.clientName=client.name;state.clientId=client.id;state.avgMonths=client.avgMonths||5;
  hideAll();document.getElementById('crm-screen').classList.add('active');
  document.getElementById('s-client-name').textContent=client.name;
  const isAdmin=JSON.parse(sessionStorage.getItem('crm_session')||'{}').role==='admin';
  document.getElementById('btn-back-admin').style.display=isAdmin?'flex':'none';
  setSyncStatus('טוען...','saving');
  try{
    const [,budgets]=await Promise.all([fetchFromSheet(),fetchBudgets(client.id)]);
    state.budgets=budgets;
    buildMonthFilter();renderTable();renderSidebar();updateBudgetInput();
    setSyncStatus('נטען ✓','success');startAutoSync();
  }catch(e){setSyncStatus('שגיאה: '+e.message,'error');showToast('שגיאה: '+e.message,'error');}
}

// ── DATE UTILS ─────────────────────────────────────────────────────────────
function parseDate(raw){
  if(!raw) return '';
  const s=String(raw);
  if(/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
  const isoM=s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(isoM) return `${isoM[3]}/${isoM[2]}/${isoM[1]}`;
  const n=parseFloat(s);
  if(!isNaN(n)&&n>1000){
    const d=new Date((n-25569)*86400*1000);
    return `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${d.getUTCFullYear()}`;
  }
  return s;
}

// ── FETCH ──────────────────────────────────────────────────────────────────
function extractSheetId(url){const m=url.match(/\/d\/([a-zA-Z0-9-_]+)/);return m?m[1]:null;}
async function fetchFromSheet(){
  const url=APPS_SCRIPT_URL+'?action=read&sheetId='+encodeURIComponent(state.spreadsheetId)+'&tab='+encodeURIComponent(state.sheetTab);
  const res=await fetch(url);if(!res.ok)throw new Error('HTTP '+res.status);
  const data=await res.json();if(data.status==='error')throw new Error(data.message);
  const rows=data.values||[];if(rows.length<1){state.leads=[];return;}
  const headers=rows[0].map(h=>String(h||'').trim().toLowerCase());
  const col={date:0,name:1,phone:2,status:3,notes:4,income:-1,campaign:-1,ad:-1,platform:-1};
  headers.forEach((h,i)=>{
    if(h.includes('הכנסה')||h.includes('income')) col.income=i;
    else if(h.includes('קמפיין')||h.includes('campaign')) col.campaign=i;
    else if(h.includes('מודעה')||h.includes('ad')) col.ad=i;
    else if(h.includes('פלטפורמה')||h.includes('platform')) col.platform=i;
  });
  const len=headers.length;
  if(col.income===-1) col.income=len>=9?5:-1;
  if(col.campaign===-1) col.campaign=len>=9?6:len>=8?5:-1;
  if(col.ad===-1) col.ad=len>=9?7:len>=8?6:-1;
  if(col.platform===-1) col.platform=len>=9?8:len>=8?7:-1;
  state.colMap=col;
  state.leads=[];state.nextId=1;
  for(let i=1;i<rows.length;i++){
    const r=rows[i];const name=String(r[col.name]||'').trim();if(!name)continue;
    state.leads.push({id:state.nextId++,rowIndex:i+1,date:parseDate(String(r[col.date]||'')),name,
      phone:String(r[col.phone]||''),status:String(r[col.status]||''),notes:String(r[col.notes]||''),
      income:col.income>=0?String(r[col.income]||''):'',campaign:col.campaign>=0?String(r[col.campaign]||''):'',
      ad:col.ad>=0?String(r[col.ad]||''):'',platform:String(col.platform>=0?(r[col.platform]||''):'').toLowerCase()});
  }
}

// ── WRITE ──────────────────────────────────────────────────────────────────
function leadToRow(l){
  const col=state.colMap;if(!col)return[l.date,l.name,l.phone,l.status,l.notes,l.income,l.campaign,l.ad,l.platform];
  const maxCol=Math.max(...Object.values(col).filter(v=>v>=0));
  const row=new Array(maxCol+1).fill('');
  row[col.date]=l.date;row[col.name]=l.name;row[col.phone]=l.phone;row[col.status]=l.status;row[col.notes]=l.notes;
  if(col.income>=0)row[col.income]=l.income;if(col.campaign>=0)row[col.campaign]=l.campaign;
  if(col.ad>=0)row[col.ad]=l.ad;if(col.platform>=0)row[col.platform]=l.platform;
  return row;
}
async function scriptPost(payload){
  await fetch(APPS_SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({...payload,sheetId:state.spreadsheetId,sheetTab:state.sheetTab})});
  await sleep(1400);
}
async function appendToSheet(lead){await scriptPost({action:'append',row:leadToRow(lead)});}
async function updateRowInSheet(lead){if(!lead.rowIndex){await appendToSheet(lead);return;}await scriptPost({action:'update',rowIndex:lead.rowIndex,row:leadToRow(lead)});}
async function deleteRowInSheet(lead){if(!lead.rowIndex)return;await scriptPost({action:'clear',rowIndex:lead.rowIndex});}

// ── AUTO SYNC ──────────────────────────────────────────────────────────────
let autoSyncInterval=null;
function startAutoSync(){
  if(autoSyncInterval)clearInterval(autoSyncInterval);
  autoSyncInterval=setInterval(async()=>{
    const ie=document.getElementById('inline-edit-modal');
    const mo=document.getElementById('modal-overlay');
    if(!ie.classList.contains('open')&&!mo.classList.contains('open')){
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
  if(tab==='analytics'){renderFinance();renderAnalytics();}
}

// ── MONTH FILTER ───────────────────────────────────────────────────────────
function buildMonthFilter(){
  const months=new Set();
  state.leads.forEach(l=>{const p=(l.date||'').split('/');if(p.length===3)months.add(p[2]+'-'+p[1].padStart(2,'0'));});
  const sorted=[...months].sort().reverse();
  const sel=document.getElementById('month-filter');
  sel.innerHTML='<option value="all">כל הזמן</option>'+sorted.map(m=>{const[y,mo]=m.split('-');return `<option value="${m}">${HEB_MONTHS[parseInt(mo)-1]+' '+y}</option>`;}).join('');
  sel.value=selectedMonth;
}
function onMonthFilterChange(){
  selectedMonth=document.getElementById('month-filter').value;
  updateBudgetInput();renderTable();renderSidebar();
  if(document.getElementById('view-analytics').style.display!=='none'){renderFinance();renderAnalytics();}
}
function getFilteredByMonth(leads){
  if(selectedMonth==='all')return leads;
  const[y,mo]=selectedMonth.split('-');
  return leads.filter(l=>{const p=(l.date||'').split('/');return p.length===3&&p[2]===y&&p[1].padStart(2,'0')===mo;});
}

// ── BUDGET (per client per month) ──────────────────────────────────────────
function updateBudgetInput(){
  const inp=document.getElementById('budget');if(!inp)return;
  inp.value=getCurrentBudget()||'';
  const key=getBudgetKey();
  const label=key==='all'?'תקציב כולל (₪)':'תקציב '+(key==='all'?'':HEB_MONTHS[parseInt(key.split('-')[1])-1]+' '+key.split('-')[0])+' (₪)';
  const lel=document.querySelector('.fin-field label');if(lel)lel.firstChild.textContent=label;
}

async function onBudgetChange(){
  const val=parseFloat(document.getElementById('budget').value)||0;
  const key=getBudgetKey();
  state.budgets[key]=val;
  try{await saveBudget(state.clientId,key,val);}catch{}
  renderFinance();renderAnalytics();
}

// ── SIDEBAR ────────────────────────────────────────────────────────────────
function renderSidebar(){
  const l=getFilteredByMonth(state.leads);
  const total=l.length,nw=l.filter(x=>x.status==='ליד חדש').length,
    ip=l.filter(x=>x.status==='פולואפ'||x.status==='ביקש פרטים נוספים בוואטסאפ').length,
    ir=l.filter(x=>x.status==='לא רלוונטי').length,reg=l.filter(x=>x.status==='נרשם').length;
  document.getElementById('s-stats').innerHTML=`
    <div class="s-stat"><span class="s-stat-label">סה"כ</span><span class="s-stat-val">${total}</span></div>
    <div class="s-stat"><span class="s-stat-label">ליד חדש</span><span class="s-stat-val blue">${nw}</span></div>
    <div class="s-stat"><span class="s-stat-label">בתהליך</span><span class="s-stat-val amber">${ip}</span></div>
    <div class="s-stat"><span class="s-stat-label">לא רלוונטי</span><span class="s-stat-val red">${ir}</span></div>
    <div class="s-stat"><span class="s-stat-label">נרשם</span><span class="s-stat-val green">${reg}</span></div>`;
}

// ── FINANCE ────────────────────────────────────────────────────────────────
function renderFinance(){
  const l=getFilteredByMonth(state.leads);
  const budget=getCurrentBudget();
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
    <div class="fin-row"><span class="fin-label">ממוצע הכנסה</span><span class="fin-val">₪${avgMonthlyInc.toLocaleString()}</span></div>
    <div class="fin-row"><span class="fin-label">LTV</span><span class="fin-val">₪${ltv.toLocaleString()}</span></div>
    <div class="fin-row"><span class="fin-label">סה"כ הכנסות</span><span class="fin-val">₪${totalRev.toLocaleString()}</span></div>
    <div class="fin-row"><span class="fin-label">ROAS</span><span class="fin-val">${roas}</span></div>`;
}

// ── ANALYTICS ─────────────────────────────────────────────────────────────
function renderAnalytics(){
  const l=getFilteredByMonth(state.leads);
  const budget=getCurrentBudget();
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
  }).sort((a,b)=>{
    let av=a[state.sortField]||'',bv=b[state.sortField]||'';
    // Convert DD/MM/YYYY to YYYYMMDD for correct date sorting
    if(state.sortField==='date'){
      const toNum=s=>{const p=s.split('/');return p.length===3?p[2]+p[1]+p[0]:s;};
      av=toNum(av);bv=toNum(bv);
    }
    return av>bv?state.sortDir:av<bv?-state.sortDir:0;
  });
}
function badgeClass(s){if(s==='ליד חדש')return 'badge-new';if(s==='ביקש פרטים נוספים בוואטסאפ')return 'badge-details';if(s==='פולואפ')return 'badge-followup';if(s==='נרשם')return 'badge-registered';if(s==='לא נרשם')return 'badge-notregistered';return 'badge-irrelevant';}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function platformLabel(p){if(!p)return '—';const lp=String(p).toLowerCase();if(lp==='fb'||lp.includes('face'))return 'Facebook';if(lp==='ig'||lp.includes('insta'))return 'Instagram';return p;}
function platformDot(p){const lp=String(p||'').toLowerCase();if(lp==='fb'||lp.includes('face'))return 'dot-fb';if(lp==='ig'||lp.includes('insta'))return 'dot-ig';return '';}

function renderTable(){
  const rows=getFiltered();
  const tbody=document.getElementById('table-body');const empty=document.getElementById('empty-state');const cards=document.getElementById('cards-body');
  document.getElementById('row-count').textContent=rows.length+' מתוך '+getFilteredByMonth(state.leads).length+' לידים';
  if(!rows.length){if(tbody)tbody.innerHTML='';if(empty)empty.style.display='flex';if(cards)cards.innerHTML='<div style="padding:3rem;text-align:center;color:var(--text3)">לא נמצאו לידים</div>';return;}
  if(empty)empty.style.display='none';
  if(tbody)tbody.innerHTML=rows.map(l=>`<tr onclick="openInlineEdit(${l.id})" style="cursor:pointer">
    <td class="date-cell">${l.date||'—'}</td>
    <td class="name-cell">${esc(l.name)}</td>
    <td class="phone-cell">${l.phone}</td>
    <td><span class="badge ${badgeClass(l.status)}">${esc(l.status)}</span></td>
    <td><div class="tooltip-cell"><span class="cell-truncate">${esc(l.notes)||'—'}</span>${l.notes?`<div class="tooltip-box">${esc(l.notes)}</div>`:''}</div></td>
    <td class="income-cell">${l.income?'₪'+esc(l.income):'—'}</td>
    <td><div class="platform-cell"><div class="platform-dot ${platformDot(l.platform)}"></div><span>${platformLabel(l.platform)}</span></div></td>
    <td><div class="tooltip-cell"><span class="cell-truncate">${esc(l.campaign)||'—'}</span>${l.campaign?`<div class="tooltip-box">${esc(l.campaign)}</div>`:''}</div></td>
    <td><div class="tooltip-cell"><span class="cell-truncate">${esc(l.ad)||'—'}</span>${l.ad?`<div class="tooltip-box">${esc(l.ad)}</div>`:''}</div></td>
    <td><button class="btn-row danger" onclick="event.stopPropagation();deleteLead(${l.id})">✕</button></td>
  </tr>`).join('');
  if(cards)cards.innerHTML=rows.map(l=>`<div class="lead-card" onclick="openInlineEdit(${l.id})">
    <div class="lead-card-top"><div class="lead-card-name">${esc(l.name)}</div><div class="lead-card-date">${l.date||'—'}</div></div>
    <div class="lead-card-phone">${l.phone}</div>
    <div class="lead-card-row"><span class="badge ${badgeClass(l.status)}">${esc(l.status)}</span>${l.income?'<span style="color:var(--green);font-size:12px;font-family:monospace">₪'+esc(l.income)+'</span>':''}</div>
    ${l.notes?'<div style="font-size:12px;color:var(--text2);margin-top:6px">'+esc(l.notes)+'</div>':''}
    <div class="lead-card-actions"><button class="btn-card" onclick="event.stopPropagation();openInlineEdit(${l.id})">ערוך</button><button class="btn-card danger" onclick="event.stopPropagation();deleteLead(${l.id})">מחק</button></div>
  </div>`).join('');
}
function sortBy(f){if(state.sortField===f)state.sortDir*=-1;else{state.sortField=f;state.sortDir=1;}renderTable();}

// ── INLINE EDIT ────────────────────────────────────────────────────────────
const STATUSES=['ליד חדש','ביקש פרטים נוספים בוואטסאפ','פולואפ','לא רלוונטי','נרשם','לא נרשם'];
function openInlineEdit(id){
  const l=state.leads.find(x=>x.id===id);if(!l)return;
  state.editingId=id;
  document.getElementById('ie-name-val').textContent=l.name;
  document.getElementById('ie-phone').value=l.phone;
  document.getElementById('ie-name').value=l.name;
  document.getElementById('ie-notes').value=l.notes;
  document.getElementById('ie-income').value=l.income;
  document.getElementById('ie-date').textContent=l.date||'—';
  document.getElementById('ie-platform').textContent=platformLabel(l.platform);
  document.getElementById('ie-campaign').textContent=l.campaign||'—';
  document.getElementById('ie-ad').textContent=l.ad||'—';
  document.getElementById('ie-status-pills').innerHTML=STATUSES.map(s=>
    `<button class="pill ${l.status===s?'active':''}" data-val="${s}" onclick="iePickStatus(this)">${s}</button>`).join('');
  document.getElementById('inline-edit-modal').classList.add('open');
}
function iePickStatus(btn){document.querySelectorAll('#ie-status-pills .pill').forEach(p=>p.classList.remove('active'));btn.classList.add('active');}
function ieGetStatus(){const a=document.querySelector('#ie-status-pills .pill.active');return a?a.dataset.val:'ליד חדש';}
function closeInlineEdit(){document.getElementById('inline-edit-modal').classList.remove('open');}

async function saveInlineEdit(){
  const l=state.leads.find(x=>x.id===state.editingId);if(!l)return;
  const updated={...l,
    name:document.getElementById('ie-name').value.trim()||l.name,
    phone:document.getElementById('ie-phone').value.trim()||l.phone,
    status:ieGetStatus(),
    notes:document.getElementById('ie-notes').value.trim(),
    income:document.getElementById('ie-income').value.trim()
  };
  // Optimistic update — close immediately and update UI
  state.leads=state.leads.map(x=>x.id===state.editingId?updated:x);
  closeInlineEdit();renderTable();renderSidebar();
  showToast('שמור...','');setSyncStatus('שומר...','saving');
  // Sync to sheet in background
  updateRowInSheet(updated).then(()=>{
    showToast('ליד עודכן ✓','success');setSyncStatus('עודכן ✓','success');
  }).catch(e=>{
    showToast('שגיאה בשמירה — נסה שוב','error');setSyncStatus('שמירה נכשלה','error');
    // Rollback
    state.leads=state.leads.map(x=>x.id===state.editingId?l:x);
    renderTable();renderSidebar();
  });
}

// ── ADD LEAD MODAL ─────────────────────────────────────────────────────────
function openModal(){
  state.editingId=null;
  document.getElementById('modal-title').textContent='הוסף ליד חדש';
  document.getElementById('f-date').value=new Date().toISOString().slice(0,10);
  ['f-name','f-phone','f-notes','f-income','f-campaign','f-ad'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('f-platform').value='fb';setStatusPill('ליד חדש');
  document.getElementById('modal-overlay').classList.add('open');
  setTimeout(()=>document.getElementById('f-name').focus(),100);
}
function closeModal(){document.getElementById('modal-overlay').classList.remove('open');}
function handleOverlayClick(e){if(e.target===document.getElementById('modal-overlay'))closeModal();}
function selectStatus(btn){document.querySelectorAll('#modal-overlay .pill').forEach(p=>p.classList.remove('active'));btn.classList.add('active');}
function setStatusPill(val){document.querySelectorAll('#modal-overlay .pill').forEach(p=>p.classList.toggle('active',p.dataset.val===val));}
function getSelectedStatus(){const a=document.querySelector('#modal-overlay .pill.active');return a?a.dataset.val:'ליד חדש';}

async function saveLead(){
  const raw=document.getElementById('f-date').value;const dp=raw?raw.split('-'):[];
  const date=dp.length===3?`${dp[2]}/${dp[1]}/${dp[0]}`:raw;
  const name=document.getElementById('f-name').value.trim();const phone=document.getElementById('f-phone').value.trim();
  if(!name){showToast('שם הוא שדה חובה','error');return;}if(!phone){showToast('טלפון הוא שדה חובה','error');return;}
  const lead={date,name,phone,status:getSelectedStatus(),notes:document.getElementById('f-notes').value.trim(),income:document.getElementById('f-income').value.trim(),campaign:document.getElementById('f-campaign').value.trim(),ad:document.getElementById('f-ad').value.trim(),platform:document.getElementById('f-platform').value};
  const saveBtn=document.querySelector('#modal-overlay .btn-primary');saveBtn.innerHTML='<div class="spinner"></div>';saveBtn.disabled=true;
  setSyncStatus('שומר...','saving');
  try{
    await appendToSheet(lead);await fetchFromSheet();buildMonthFilter();closeModal();renderTable();renderSidebar();
    showToast('ליד נוסף ✓','success');setSyncStatus('עודכן ✓','success');
  }catch(e){showToast('שגיאה: '+e.message,'error');setSyncStatus('שמירה נכשלה','error');}
  finally{saveBtn.innerHTML='<span id="save-btn-text">שמור לגיליון</span>';saveBtn.disabled=false;}
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
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeModal();closeInlineEdit();document.getElementById('client-modal')?.classList.remove('open');}
  if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){
    if(document.getElementById('inline-edit-modal').classList.contains('open'))saveInlineEdit();
    else if(document.getElementById('modal-overlay').classList.contains('open'))saveLead();
  }
});
