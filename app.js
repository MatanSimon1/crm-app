const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1Mnojbk2Z6xnuWtMC1ABge_r6vXGcz_Ey9wyDVR-lybI/edit';
const DEFAULT_TAB = 'Main CRM';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbytkowR3MiDFvF8KCQy414NoX1PbFFAVqoiixVzSOjInX7ArW0VVnc0YRObOJh4KYjX/exec';

let state = {
  leads: [], spreadsheetId: '', apiKey: '', sheetTab: 'Main CRM',
  clientName: '', sheetUrl: '', sortField: 'date', sortDir: -1,
  editingId: null, nextId: 1,
};

let charts = {};

// ── SESSIONS ───────────────────────────────────────────────────────────────
function getSessions() { try { return JSON.parse(localStorage.getItem('crm_sessions')||'[]'); } catch { return []; } }
function saveSession(s) {
  const sessions = getSessions().filter(x => x.spreadsheetId !== s.spreadsheetId);
  sessions.unshift(s);
  localStorage.setItem('crm_sessions', JSON.stringify(sessions.slice(0,8)));
}
function renderSavedSessions() {
  const sessions = getSessions();
  const el = document.getElementById('saved-list');
  if (!sessions.length) { el.innerHTML=''; return; }
  el.innerHTML = `<div class="saved-list-title">Recent sheets</div>
    ${sessions.map(s=>`<div class="saved-item" onclick="loadSession('${s.spreadsheetId}')">
      <div><div class="saved-item-name">${s.clientName||'Unnamed'}</div>
      <div class="saved-item-sub">${s.sheetTab} · ${s.spreadsheetId.slice(0,22)}...</div></div>
      <div class="saved-item-arrow">→</div></div>`).join('')}`;
}
function loadSession(id) {
  const s = getSessions().find(x=>x.spreadsheetId===id); if(!s) return;
  document.getElementById('sheet-url').value = s.sheetUrl||'';
  document.getElementById('api-key').value = s.apiKey||'';
  document.getElementById('sheet-tab').value = s.sheetTab||DEFAULT_TAB;
  connectSheet();
}

// ── CONNECT ────────────────────────────────────────────────────────────────
function extractSheetId(url) { const m=url.match(/\/d\/([a-zA-Z0-9-_]+)/); return m?m[1]:null; }
async function connectSheet() {
  const url=document.getElementById('sheet-url').value.trim();
  const apiKey=document.getElementById('api-key').value.trim();
  const tab=document.getElementById('sheet-tab').value.trim()||DEFAULT_TAB;
  const errEl=document.getElementById('setup-error');
  errEl.style.display='none';
  if(!url){showSetupError('Please enter a Google Sheet URL.');return;}
  if(!apiKey){showSetupError('Please enter your Google API Key.');return;}
  const id=extractSheetId(url);
  if(!id){showSetupError('Invalid Google Sheets URL.');return;}
  const btn=document.querySelector('#setup-screen .btn-primary');
  btn.innerHTML='<div class="spinner"></div>'; btn.disabled=true;
  state.spreadsheetId=id; state.apiKey=apiKey; state.sheetTab=tab; state.sheetUrl=url;
  try {
    await fetchFromSheet();
    try {
      const meta=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}?key=${apiKey}&fields=properties.title`);
      const mj=await meta.json();
      state.clientName=mj.properties?.title||tab;
    } catch { state.clientName=tab; }
    saveSession({spreadsheetId:id,apiKey,sheetTab:tab,sheetUrl:url,clientName:state.clientName});
    showCRM();
  } catch(e) {
    showSetupError('Could not load sheet. Check:\n1. API key is valid\n2. Google Sheets API is enabled\n3. Sheet is shared as "Anyone with the link"\n\nError: '+e.message);
  } finally {
    btn.innerHTML='<span>Connect Sheet</span><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    btn.disabled=false;
  }
}
function showSetupError(msg){const el=document.getElementById('setup-error');el.textContent=msg;el.style.display='block';}

// ── FETCH ──────────────────────────────────────────────────────────────────
async function fetchFromSheet() {
  const range=encodeURIComponent(`${state.sheetTab}!A1:I300`);
  const res=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${state.spreadsheetId}/values/${range}?key=${state.apiKey}`);
  if(!res.ok){const e=await res.json();throw new Error(e.error?.message||`HTTP ${res.status}`);}
  const data=await res.json();
  const rows=data.values||[];
  state.leads=[]; state.nextId=1;
  for(let i=1;i<rows.length;i++){
    const r=rows[i];
    if(!(r[1]||'').trim()) continue;
    state.leads.push({id:state.nextId++,rowIndex:i+1,date:r[0]||'',name:r[1]||'',phone:r[2]||'',status:r[3]||'',notes:r[4]||'',income:r[5]||'',campaign:r[6]||'',ad:r[7]||'',platform:r[8]||''});
  }
}

// ── WRITE (Apps Script) ────────────────────────────────────────────────────
function leadToRow(l){return[l.date,l.name,l.phone,l.status,l.notes,l.income,l.campaign,l.ad,l.platform];}
async function scriptPost(payload){
  await fetch(APPS_SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  await new Promise(r=>setTimeout(r,1400));
}
async function appendToSheet(lead){await scriptPost({action:'append',row:leadToRow(lead)});}
async function updateRowInSheet(lead){
  if(!lead.rowIndex){await appendToSheet(lead);return;}
  await scriptPost({action:'update',rowIndex:lead.rowIndex,row:leadToRow(lead)});
}
async function deleteRowInSheet(lead){
  if(!lead.rowIndex) return;
  await scriptPost({action:'clear',rowIndex:lead.rowIndex});
}

// ── AUTO SYNC (every 30s) ──────────────────────────────────────────────────
let autoSyncInterval=null;
function startAutoSync(){
  if(autoSyncInterval) clearInterval(autoSyncInterval);
  autoSyncInterval=setInterval(async()=>{
    if(!document.getElementById('modal-overlay').classList.contains('open')){
      try{
        await fetchFromSheet();
        renderTable(); renderSidebar();
        setSyncStatus('עודכן '+new Date().toLocaleTimeString('he-IL'),'success');
        if(document.getElementById('view-analytics').style.display!=='none') renderAnalytics();
      }catch(e){/* silent */}
    }
  },30000);
}

function setSyncStatus(msg,type){const el=document.getElementById('sync-status');el.textContent=msg;el.className='sync-status '+(type||'');}

// ── SHOW CRM ───────────────────────────────────────────────────────────────
function showCRM(){
  document.getElementById('setup-screen').classList.remove('active');
  document.getElementById('crm-screen').classList.add('active');
  document.getElementById('s-client-name').textContent=state.clientName;
  renderTable(); renderSidebar();
  setSyncStatus('נטען מהגיליון ✓','success');
  startAutoSync();
}
function goBack(){
  if(autoSyncInterval) clearInterval(autoSyncInterval);
  document.getElementById('crm-screen').classList.remove('active');
  document.getElementById('setup-screen').classList.add('active');
  renderSavedSessions();
}

// ── TABS ───────────────────────────────────────────────────────────────────
function switchTab(tab, btn){
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('view-leads').style.display = tab==='leads'?'flex':'none';
  document.getElementById('view-analytics').style.display = tab==='analytics'?'block':'none';
  if(tab==='analytics') renderAnalytics();
}

// ── SIDEBAR ────────────────────────────────────────────────────────────────
function renderSidebar(){
  const l=state.leads;
  const total=l.length;
  const newL=l.filter(x=>x.status==='ליד חדש').length;
  const ip=l.filter(x=>x.status==='פולואפ'||x.status==='ביקש פרטים נוספים בוואטסאפ').length;
  const ir=l.filter(x=>x.status==='לא רלוונטי').length;
  const reg=l.filter(x=>x.status==='נרשם').length;
  document.getElementById('s-stats').innerHTML=`
    <div class="s-stat"><span class="s-stat-label">סה"כ</span><span class="s-stat-val">${total}</span></div>
    <div class="s-stat"><span class="s-stat-label">ליד חדש</span><span class="s-stat-val blue">${newL}</span></div>
    <div class="s-stat"><span class="s-stat-label">בתהליך</span><span class="s-stat-val amber">${ip}</span></div>
    <div class="s-stat"><span class="s-stat-label">לא רלוונטי</span><span class="s-stat-val red">${ir}</span></div>
    <div class="s-stat"><span class="s-stat-label">נרשם</span><span class="s-stat-val green">${reg}</span></div>`;
}

// ── TABLE ──────────────────────────────────────────────────────────────────
function getFiltered(){
  const q=(document.getElementById('search')?.value||'').toLowerCase();
  const st=document.getElementById('filter-status')?.value||'';
  const pl=document.getElementById('filter-platform')?.value||'';
  return state.leads.filter(l=>{
    if(q&&!l.name.toLowerCase().includes(q)&&!l.phone.includes(q)) return false;
    if(st&&l.status!==st) return false;
    if(pl&&l.platform!==pl) return false;
    return true;
  }).sort((a,b)=>{const av=a[state.sortField]||'',bv=b[state.sortField]||'';return av>bv?state.sortDir:av<bv?-state.sortDir:0;});
}

function badgeClass(s){
  if(s==='ליד חדש') return 'badge-new';
  if(s==='ביקש פרטים נוספים בוואטסאפ') return 'badge-details';
  if(s==='פולואפ') return 'badge-followup';
  if(s==='נרשם') return 'badge-registered';
  if(s==='לא נרשם') return 'badge-notregistered';
  return 'badge-irrelevant';
}

function esc(str){return(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function renderTable(){
  const rows=getFiltered();
  const tbody=document.getElementById('table-body');
  const empty=document.getElementById('empty-state');
  document.getElementById('row-count').textContent=`${rows.length} מתוך ${state.leads.length} לידים`;
  if(!rows.length){tbody.innerHTML='';empty.style.display='flex';return;}
  empty.style.display='none';
  tbody.innerHTML=rows.map(l=>`<tr>
    <td class="date-cell">${l.date||'—'}</td>
    <td class="name-cell">${esc(l.name)}</td>
    <td class="phone-cell"><a href="tel:${l.phone}">${l.phone}</a></td>
    <td><span class="badge ${badgeClass(l.status)}">${esc(l.status)}</span></td>
    <td class="note-cell" title="${esc(l.notes)}">${esc(l.notes)||'—'}</td>
    <td class="income-cell">${l.income?'₪'+esc(l.income):'—'}</td>
    <td><div class="platform-cell"><div class="platform-dot ${l.platform==='fb'?'dot-fb':l.platform==='ig'?'dot-ig':''}"></div>${l.platform==='fb'?'Facebook':l.platform==='ig'?'Instagram':l.platform||'—'}</div></td>
    <td class="ad-cell" title="${esc(l.ad)}">${esc(l.ad)||'—'}</td>
    <td><div class="row-actions">
      <button class="btn-row" onclick="openEdit(${l.id})">ערוך</button>
      <button class="btn-row danger" onclick="deleteLead(${l.id})">✕</button>
    </div></td>
  </tr>`).join('');
}

function sortBy(field){
  if(state.sortField===field) state.sortDir*=-1; else{state.sortField=field;state.sortDir=1;}
  document.querySelectorAll('th.sortable').forEach(th=>th.classList.remove('sorted'));
  const a=document.querySelector(`th[data-field="${field}"]`); if(a) a.classList.add('sorted');
  renderTable();
}

// ── ANALYTICS ─────────────────────────────────────────────────────────────
function renderAnalytics(){
  const l=state.leads;
  const total=l.length;
  const registered=l.filter(x=>x.status==='נרשם').length;
  const convRate=total>0?Math.round((registered/total)*100):0;
  const relevant=l.filter(x=>x.status!=='לא רלוונטי').length;
  const totalIncome=l.filter(x=>x.income).reduce((s,x)=>s+parseFloat(x.income.replace(/[^\d.]/g,'')||0),0);
  const avgIncome=registered>0?Math.round(totalIncome/registered):0;

  document.getElementById('kpi-row').innerHTML=`
    <div class="kpi-card"><div class="kpi-label">סה"כ לידים</div><div class="kpi-val blue">${total}</div></div>
    <div class="kpi-card"><div class="kpi-label">נרשמו</div><div class="kpi-val green">${registered}</div></div>
    <div class="kpi-card"><div class="kpi-label">אחוז המרה</div><div class="kpi-val accent">${convRate}%</div><div class="kpi-sub">${registered} מתוך ${total}</div></div>
    <div class="kpi-card"><div class="kpi-label">רלוונטיים</div><div class="kpi-val amber">${relevant}</div></div>
    <div class="kpi-card"><div class="kpi-label">הכנסה ממוצעת</div><div class="kpi-val green">${avgIncome>0?'₪'+avgIncome.toLocaleString():'—'}</div></div>`;

  // Status chart
  const statusCounts={'ליד חדש':0,'ביקש פרטים נוספים בוואטסאפ':0,'פולואפ':0,'לא רלוונטי':0,'נרשם':0,'לא נרשם':0};
  l.forEach(x=>{if(statusCounts[x.status]!==undefined) statusCounts[x.status]++;});
  drawDoughnut('chart-status', Object.keys(statusCounts), Object.values(statusCounts),
    ['#60a5fa','#4ade80','#fbbf24','#f87171','#d4ff5c','#9ca3af']);

  // Platform chart
  const fb=l.filter(x=>x.platform==='fb').length;
  const ig=l.filter(x=>x.platform==='ig').length;
  const other=l.length-fb-ig;
  drawDoughnut('chart-platform',['Facebook','Instagram','אחר'],[fb,ig,other],['#1877F2','#E1306C','#9ca3af']);

  // Daily leads (last 7 days)
  const days=[];const dayCounts=[];
  for(let i=6;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    const str=`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
    const label=`${d.getDate()}/${d.getMonth()+1}`;
    days.push(label);
    dayCounts.push(l.filter(x=>x.date===str).length);
  }
  drawBar('chart-daily',days,dayCounts,'#60a5fa','לידים ביום');

  // Conversion donut
  drawDoughnut('chart-conv',['נרשמו','לא נרשמו'],[registered,total-registered],['#d4ff5c','#252528']);

  // Ad performance
  const adMap={};
  l.forEach(x=>{if(x.ad){adMap[x.ad]=(adMap[x.ad]||0)+1;}});
  const adSorted=Object.entries(adMap).sort((a,b)=>b[1]-a[1]).slice(0,8);
  drawBar('chart-ad',adSorted.map(x=>x[0]),adSorted.map(x=>x[1]),'#fbbf24','לידים');
}

function drawDoughnut(id,labels,data,colors){
  const ctx=document.getElementById(id);
  if(!ctx) return;
  if(charts[id]) charts[id].destroy();
  charts[id]=new Chart(ctx,{type:'doughnut',data:{labels,datasets:[{data,backgroundColor:colors,borderWidth:0,hoverOffset:4}]},
    options:{responsive:true,plugins:{legend:{position:'bottom',labels:{color:'#9e9e9e',font:{size:11},boxWidth:10,padding:10}}},cutout:'65%'}});
}

function drawBar(id,labels,data,color,label){
  const ctx=document.getElementById(id);
  if(!ctx) return;
  if(charts[id]) charts[id].destroy();
  charts[id]=new Chart(ctx,{type:'bar',data:{labels,datasets:[{label,data,backgroundColor:color+'33',borderColor:color,borderWidth:1,borderRadius:4}]},
    options:{responsive:true,plugins:{legend:{display:false}},scales:{
      x:{ticks:{color:'#666',font:{size:10}},grid:{color:'rgba(255,255,255,0.04)'}},
      y:{ticks:{color:'#666',font:{size:10},stepSize:1},grid:{color:'rgba(255,255,255,0.04)'}}}}});
}

// ── MODAL ──────────────────────────────────────────────────────────────────
function openModal(){
  state.editingId=null;
  document.getElementById('modal-title').textContent='הוסף ליד חדש';
  document.getElementById('save-btn-text').textContent='שמור לגיליון';
  document.getElementById('f-date').value=new Date().toISOString().slice(0,10);
  ['f-name','f-phone','f-notes','f-income','f-campaign','f-ad'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('f-platform').value='fb';
  setStatusPill('ליד חדש');
  document.getElementById('modal-overlay').classList.add('open');
  setTimeout(()=>document.getElementById('f-name').focus(),100);
}
function openEdit(id){
  const l=state.leads.find(x=>x.id===id); if(!l) return;
  state.editingId=id;
  document.getElementById('modal-title').textContent='ערוך ליד';
  document.getElementById('save-btn-text').textContent='עדכן גיליון';
  const dp=(l.date||'').split('/');
  document.getElementById('f-date').value=dp.length===3?`${dp[2]}-${dp[1]}-${dp[0]}`:l.date;
  document.getElementById('f-name').value=l.name;
  document.getElementById('f-phone').value=l.phone;
  document.getElementById('f-notes').value=l.notes;
  document.getElementById('f-income').value=l.income;
  document.getElementById('f-campaign').value=l.campaign;
  document.getElementById('f-ad').value=l.ad;
  document.getElementById('f-platform').value=l.platform||'fb';
  setStatusPill(l.status);
  document.getElementById('modal-overlay').classList.add('open');
}
function closeModal(){document.getElementById('modal-overlay').classList.remove('open');}
function handleOverlayClick(e){if(e.target===document.getElementById('modal-overlay')) closeModal();}
function selectStatus(btn){document.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));btn.classList.add('active');}
function setStatusPill(val){document.querySelectorAll('.pill').forEach(p=>p.classList.toggle('active',p.dataset.val===val));}
function getSelectedStatus(){const a=document.querySelector('.pill.active');return a?a.dataset.val:'ליד חדש';}

// ── SAVE ───────────────────────────────────────────────────────────────────
async function saveLead(){
  const raw=document.getElementById('f-date').value;
  const dp=raw?raw.split('-'):[];
  const date=dp.length===3?`${dp[2]}/${dp[1]}/${dp[0]}`:raw;
  const name=document.getElementById('f-name').value.trim();
  const phone=document.getElementById('f-phone').value.trim();
  if(!name){showToast('שם הוא שדה חובה','error');return;}
  if(!phone){showToast('טלפון הוא שדה חובה','error');return;}
  const lead={date,name,phone,status:getSelectedStatus(),notes:document.getElementById('f-notes').value.trim(),income:document.getElementById('f-income').value.trim(),campaign:document.getElementById('f-campaign').value.trim(),ad:document.getElementById('f-ad').value.trim(),platform:document.getElementById('f-platform').value};
  const saveBtn=document.querySelector('.modal-footer .btn-primary');
  saveBtn.innerHTML='<div class="spinner"></div>'; saveBtn.disabled=true;
  setSyncStatus('שומר...','saving');
  try{
    if(state.editingId){
      const existing=state.leads.find(x=>x.id===state.editingId);
      const updated={...existing,...lead};
      await updateRowInSheet(updated);
      state.leads=state.leads.map(l=>l.id===state.editingId?updated:l);
      showToast('הליד עודכן בגיליון ✓','success');
    } else {
      await appendToSheet(lead);
      await fetchFromSheet();
      showToast('הליד נוסף לגיליון ✓','success');
    }
    closeModal(); renderTable(); renderSidebar();
    setSyncStatus('הגיליון עודכן ✓','success');
  }catch(e){showToast('שגיאה: '+e.message,'error');setSyncStatus('שמירה נכשלה','error');}
  finally{saveBtn.innerHTML=`<span id="save-btn-text">${state.editingId?'עדכן גיליון':'שמור לגיליון'}</span>`;saveBtn.disabled=false;}
}

// ── DELETE ─────────────────────────────────────────────────────────────────
async function deleteLead(id){
  const lead=state.leads.find(x=>x.id===id); if(!lead) return;
  if(!confirm(`למחוק את "${lead.name}"?\nהשורה תימחק מהגיליון.`)) return;
  setSyncStatus('מוחק...','saving');
  try{
    await deleteRowInSheet(lead);
    state.leads=state.leads.filter(x=>x.id!==id);
    renderTable(); renderSidebar();
    showToast('הליד נמחק ✓','success');
    setSyncStatus('הגיליון עודכן ✓','success');
  }catch(e){showToast('מחיקה נכשלה: '+e.message,'error');setSyncStatus('מחיקה נכשלה','error');}
}

// ── TOAST ──────────────────────────────────────────────────────────────────
let toastTimer=null;
function showToast(msg,type){
  const t=document.getElementById('toast');
  t.textContent=msg; t.className='toast show '+(type||'');
  if(toastTimer) clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),2800);
}

// ── KEYBOARD ──────────────────────────────────────────────────────────────
document.addEventListener('keydown',e=>{
  if(e.key==='Escape') closeModal();
  if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){
    if(document.getElementById('modal-overlay').classList.contains('open')) saveLead();
  }
});

// ── INIT ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('sheet-url').value=DEFAULT_SHEET_URL;
  document.getElementById('sheet-tab').value=DEFAULT_TAB;
  renderSavedSessions();
  const params=new URLSearchParams(window.location.search);
  if(params.get('sheet')) document.getElementById('sheet-url').value=params.get('sheet');
  if(params.get('key')) document.getElementById('api-key').value=params.get('key');
  if(params.get('tab')) document.getElementById('sheet-tab').value=params.get('tab');
});
