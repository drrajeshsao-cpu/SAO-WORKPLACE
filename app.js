const app=(()=>{
const KEY='sao_workplace_v1';
const FILE_DB='sao_workplace_files_v1';
const CATEGORIES=['Home','Doctor / Clinical','Clinic Management','Office / Administration','Student / Study','Research','App Development & AI','App Development','Banking & Insurance','Family Responsibility','Friends / Social','Health & Fitness','Spiritual / Sadhana','Travel / Seminar','Blogging / Content','Finance / Purchase','Other'];
const PRIORITIES=[{value:'Red',label:'Red • Critical / Do First'},{value:'Orange',label:'Orange • High'},{value:'Yellow',label:'Yellow • Important'},{value:'Green',label:'Green • Routine / Low'}];
const STATUSES=['Idea / Capture','Start Today','Started Today','Work Started','Will Start Soon','Done','Pending','Need Modification','Need More Suggestion','Need Help to Run','Waiting','Need to Stop','Stopped'];
const HORIZONS=['Today','Tomorrow','2-3 Days','1 Week Later','1 Month Later','3 Months Later','6 Months Later','1 Year Later','Someday / No Date','Custom Date'];
const SOURCE_TYPES=['Online Course','Offline Course','Book','Article / Journal','YouTube','Seminar','Webinar','Guru / Mentor','Friend / Colleague','Clinical Experience','My Notes PDF','My Notes Printout','Other'];
const TRAVEL_STATUSES=['Idea','Planning','Ticket Pending','Ticket Booked','Confirmed','In Progress','Completed','Postponed','Cancelled'];
const IDEA_STATUSES=['New / Captured','Under Review','Ready to Work','Working','Waiting','For Later','Postponed','Completed','Cancelled','Impossible'];
const IDEA_AREAS=['App Development & AI','Clinic / Clinical','Study / Research','Home / Family','Health / Wellness','Spiritual / Sadhana','Business / Finance','Creative / Writing','Travel / Seminar','Other'];

const defaultSettings={appName:'SAO Workplace for Office & Home',ownerName:'Dr Rajesh Sao',dailyJapaTarget:5000,weekStarts:'Monday',theme:'Soft Blue',lastBackupAt:'',finalStable:true};
const WORKSPACES={
  home:{label:'Home',icon:'🏠',color:'home',categories:['Home','Family Responsibility','Friends / Social','Health & Fitness','Spiritual / Sadhana','Banking & Insurance','Finance / Purchase'],quickCategory:'Home',subtitle:'Family, personal responsibilities, health, finance and home planning.'},
  clinic:{label:'Clinic / Office',icon:'🩺',color:'clinic',categories:['Doctor / Clinical','Clinic Management','Office / Administration'],quickCategory:'Clinic Management',subtitle:'Clinical work, clinic management, administration and office responsibilities.'},
  study:{label:'Study',icon:'📚',color:'study',categories:['Student / Study','Research'],quickCategory:'Student / Study',subtitle:'Study topics, research work, learning sources and deadlines.'},
  ai:{label:'App Development & AI',icon:'🤖',color:'ai',categories:['App Development & AI','App Development'],quickCategory:'App Development & AI',subtitle:'Apps, websites, AI experiments, GitHub work and technology projects.'}
};
let db=JSON.parse(localStorage.getItem(KEY)||'null')||{tasks:[],study:[],wellness:[],travel:[],settings:defaultSettings};
db.tasks=db.tasks||[];db.study=db.study||[];db.wellness=db.wellness||[];db.travel=db.travel||[];db.ideas=db.ideas||[];db.travelStays=db.travelStays||[];db.travelDocs=db.travelDocs||[];db.emergencyContacts=db.emergencyContacts||[];db.travelFinance=db.travelFinance||[];db.healthProviders=db.healthProviders||[];db.healthContacts=db.healthContacts||[];db.patientReferrals=db.patientReferrals||[];db.professionalEvents=db.professionalEvents||[];db.settings={...defaultSettings,...(db.settings||{})};db.reflections=db.reflections||[];db.ideas=db.ideas||[];db.tasks=db.tasks.map(t=>({estimatedMinutes:0,nextAction:'',waitingFor:'',waitingContact:'',repeat:'None',focus:false,progress:t.status==='Done'?100:0,...t}));
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>(s??'').toString().replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
let currentView='dashboard';
const normalizeDb=x=>{
  x=x||{};
  x.tasks=x.tasks||[];x.study=x.study||[];x.wellness=x.wellness||[];x.travel=x.travel||[];x.ideas=x.ideas||[];x.travelStays=x.travelStays||[];x.travelDocs=x.travelDocs||[];x.emergencyContacts=x.emergencyContacts||[];x.travelFinance=x.travelFinance||[];x.healthProviders=x.healthProviders||[];x.healthContacts=x.healthContacts||[];x.patientReferrals=x.patientReferrals||[];x.professionalEvents=x.professionalEvents||[];
  x.reflections=x.reflections||[];
  x.settings={...defaultSettings,...(x.settings||{})};
  x.tasks=x.tasks.map(t=>({estimatedMinutes:0,nextAction:'',waitingFor:'',waitingContact:'',repeat:'None',focus:false,progress:t.status==='Done'?100:0,...t}));
  return x;
};
const save=()=>{
  localStorage.setItem(KEY,JSON.stringify(db));
  window.dispatchEvent(new CustomEvent('sao-local-save',{detail:{at:Date.now()}}));
};
const getCloudSnapshot=()=>JSON.parse(JSON.stringify(db));
const applyCloudSnapshot=(incoming)=>{
  if(!incoming||typeof incoming!=='object')return false;
  db=normalizeDb(incoming);
  localStorage.setItem(KEY,JSON.stringify(db));
  try{showView(currentView||'dashboard')}catch(e){console.warn('Cloud refresh render',e)}
  return true;
};
const today=()=>new Date().toISOString().slice(0,10);const fmt=d=>d?new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'-';
const isDone=t=>t.status==='Done';const priorityRank=p=>({Red:1,Orange:2,Yellow:3,Green:4}[p]||9);const horizonRank=h=>HORIZONS.indexOf(h)<0?99:HORIZONS.indexOf(h);const tpl=id=>document.getElementById(id).content.cloneNode(true);
function fillOptions(el,items,blank=false,blankText='Select'){el.innerHTML=(blank?`<option value="">${blankText}</option>`:'')+items.map(x=>{const v=typeof x==='string'?x:x.value,l=typeof x==='string'?x:x.label;return `<option value="${esc(v)}">${esc(l)}</option>`}).join('')}
const titles={dashboard:['Dashboard','Your work, study, health, family and life responsibilities in one place.'],
  myday:['My Day','Focus on what truly needs attention today.'],tasks:['Tasks & Projects','Capture, prioritize, schedule and finish responsibilities.'],
  board:['Status Board','A visual flow of ideas, active work, waiting and completion.'],ideas:['My Ideas & Creativity','Capture, develop, review and learn from every useful idea.'],study:['Study Planner','Plan what to learn, from where, when and how much.'],wellness:['Wellness & Sadhana','Track health habits, spiritual practice and seva.'],travel:['Travel & Seminar','Plan purpose, tickets, time, budget and nearby visits.'],referrals:['Referral Network','Hospitals, diagnostics, doctors, PRO/staff, referrals and follow-up in one searchable directory.'],review:['Review Center','Daily, weekly and monthly review of forgotten and blocked work.'],ai:['AI Insights','Smart local analysis, focus strategy and future-ready decision support.'],
  summary:['Master Summary','A single review of everything requiring your attention.'],files:['Files & Notes','Keep supporting documents linked to tasks and life areas.'],backup:['Backup / Restore','Protect your workplace data and move it between devices.'],settings:['Settings','Personal targets and app preferences.']};
function showView(name){currentView=name;
  try{
    const meta=titles[name]||titles.dashboard;
    $$('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
    $('#pageTitle').textContent=meta[0];$('#pageSubtitle').textContent=meta[1];
    const v=$('#view'), t=document.getElementById(name+'Tpl');
    if(!t){v.innerHTML='<div class="card"><h3>Section unavailable</h3><p class="muted">Please reload the latest app version.</p></div>';return}
    v.innerHTML='';v.appendChild(t.content.cloneNode(true));
    const renderers={dashboard:renderDashboard,myday:renderMyDay,tasks:renderTasks,board:renderBoard,ideas:renderIdeas,study:renderStudy,wellness:renderWellness,travel:renderTravel,referrals:renderReferralNetwork,review:renderReview,ai:renderAI,summary:renderSummary,files:renderFiles,backup:renderBackup,settings:renderSettings};
    if(renderers[name]) renderers[name]();
  }catch(err){
    console.error('View error',name,err);
    const v=$('#view');if(v)v.innerHTML='<div class="card error-card"><h3>This section could not open.</h3><p class="muted">Please use Backup regularly and reload the latest version. Technical detail: '+esc(err.message||err)+'</p></div>';
  }
}
function openQuickAdd(defaultCategory='Other'){const m=$('#modal');m.classList.add('open');fillOptions($('#q_category'),CATEGORIES);fillOptions($('#q_priority'),PRIORITIES);fillOptions($('#q_horizon'),HORIZONS);fillOptions($('#q_status'),STATUSES);$('#q_category').value=CATEGORIES.includes(defaultCategory)?defaultCategory:'Other';$('#q_priority').value='Yellow';$('#q_horizon').value='Today';$('#q_status').value='Idea / Capture';$('#q_title').focus()}
function closeQuick(){$('#modal').classList.remove('open');['#q_title','#q_notes','#q_reminder','#q_minutes','#q_next'].forEach(s=>$(s).value='')}
function saveQuick(){const title=$('#q_title').value.trim();if(!title){alert('Please write the task / idea.');return}db.tasks.push({id:uid(),title,category:$('#q_category').value,project:'',priority:$('#q_priority').value,status:$('#q_status').value,horizon:$('#q_horizon').value,startDate:'',dueDate:'',reminderDate:$('#q_reminder').value,owner:'Self',context:'',notes:$('#q_notes').value,tags:'',estimatedMinutes:+($('#q_minutes').value||0),nextAction:$('#q_next').value,waitingFor:'',waitingContact:'',repeat:'None',focus:false,progress:0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});save();closeQuick();alert('Saved to SAO Workplace.');if($('#pageTitle')?.textContent==='Dashboard')renderDashboard()}
function dueAttention(t){if(isDone(t))return false;return t.priority==='Red'||t.horizon==='Today'||t.status==='Start Today'||t.status==='Started Today'||(t.reminderDate&&t.reminderDate<=today())||(t.dueDate&&t.dueDate<today())}
function taskMini(t){return `<div class="task-card p-${t.priority.toLowerCase()}"><div class="task-head"><div><div class="task-title">${esc(t.title)}</div><div class="chips"><span class="chip ${t.priority.toLowerCase()}">${esc(t.priority)}</span><span class="chip">${esc(t.category)}</span><span class="chip blue">${esc(t.horizon)}</span></div></div><span class="chip">${esc(t.status)}</span></div></div>`}
function drawPriorityChart(c,tasks){const ctx=c.getContext('2d'),W=c.width,H=c.height;ctx.clearRect(0,0,W,H);const vals=PRIORITIES.map(p=>tasks.filter(t=>t.priority===p.value).length),cols=['#c44f4f','#d78234','#d8ad38','#32805a'],max=Math.max(1,...vals);vals.forEach((v,i)=>{const x=90+i*190,bw=90,h=v/max*(H-100);ctx.fillStyle=cols[i];ctx.fillRect(x,H-50-h,bw,h);ctx.fillStyle='#364456';ctx.font='16px sans-serif';ctx.fillText(PRIORITIES[i].value,x,H-20);ctx.fillText(String(v),x+36,H-60-h)})}

function workspaceTasks(key){const w=WORKSPACES[key];return db.tasks.filter(t=>w.categories.includes(t.category))}
function renderMainWorkspaceButtons(){
  const el=$('#mainWorkspaceButtons');if(!el)return;
  el.innerHTML=Object.entries(WORKSPACES).map(([key,w])=>{
    const all=workspaceTasks(key),open=all.filter(t=>!isDone(t)),attention=open.filter(dueAttention),done=all.filter(isDone).length;
    return `<button class="workspace-launch ${w.color}" onclick="app.openWorkspace('${key}')">
      <span class="workspace-icon">${w.icon}</span><span class="workspace-label">${esc(w.label)}</span>
      <span class="workspace-stats"><b>${open.length}</b> open • <b>${attention.length}</b> attention • ${done} done</span>
    </button>`;
  }).join('');
}
function openWorkspace(key){
  const w=WORKSPACES[key];if(!w)return;
  $$('#nav button').forEach(b=>b.classList.remove('active'));
  $('#pageTitle').textContent=w.label+' Workspace';$('#pageSubtitle').textContent=w.subtitle;
  const v=$('#view'),t=document.getElementById('workspaceTpl');v.innerHTML='';v.appendChild(t.content.cloneNode(true));
  const all=workspaceTasks(key),open=all.filter(t=>!isDone(t)),attention=open.filter(dueAttention).sort((a,b)=>priorityRank(a.priority)-priorityRank(b.priority)),done=all.filter(isDone),todayItems=open.filter(t=>t.horizon==='Today'||t.dueDate===today()||t.reminderDate===today());
  $('#workspaceHero').innerHTML=`<div><span class="workspace-big-icon">${w.icon}</span><span class="eyebrow">FOCUSED WORKSPACE</span><h2>${esc(w.label)}</h2><p>${esc(w.subtitle)}</p><div class="actionrow"><button onclick="app.openQuickAdd('${esc(w.quickCategory)}')">+ Quick Add to ${esc(w.label)}</button><button class="ghost" onclick="app.showView('tasks')">Open All Tasks</button></div></div>`;
  $('#workspaceKpis').innerHTML=[['Open',open.length],['Needs Attention',attention.length],['Today',todayItems.length],['Red Priority',open.filter(t=>t.priority==='Red').length],['Waiting',open.filter(t=>['Waiting','Need Help to Run'].includes(t.status)).length],['Done',done.length]].map(x=>`<div class="kpi"><b>${x[1]}</b><span>${x[0]}</span></div>`).join('');
  $('#workspaceAttention').innerHTML=attention.slice(0,10).map(workspaceTaskRow).join('')||'<p class="muted">Nothing urgent in this workspace.</p>';
  const upcoming=open.filter(t=>!attention.includes(t)).sort((a,b)=>horizonRank(a.horizon)-horizonRank(b.horizon)).slice(0,10);
  $('#workspaceUpcoming').innerHTML=upcoming.map(workspaceTaskRow).join('')||'<p class="muted">No upcoming item yet.</p>';
  $('#workspaceTasks').innerHTML=open.sort((a,b)=>priorityRank(a.priority)-priorityRank(b.priority)||horizonRank(a.horizon)-horizonRank(b.horizon)).map(workspaceTaskRow).join('')||'<p class="muted">No open task in this workspace. Use + Add Here.</p>';
  $('#workspaceQuickAdd').onclick=()=>openQuickAdd(w.quickCategory);
  if(key==='clinic'){
    $('#workspaceExtra').innerHTML=`<div class="card referral-workspace-shortcut"><div class="cardhead"><div><span class="eyebrow">CLINICAL NETWORK</span><h3>🏥 Hospital & Diagnostic Referral Network</h3><p class="muted">Search hospitals, doctors, PRO/staff, diagnostics and referral history from one directory.</p></div><button onclick="app.showView('referrals')">Open Referral Network</button></div><div class="future-kpis"><div class="metric"><b>${db.healthProviders?.filter(x=>x.status==='Active').length||0}</b><span>Active Providers</span></div><div class="metric"><b>${db.healthContacts?.filter(x=>x.status==='Active').length||0}</b><span>Active Contacts</span></div><div class="metric"><b>${db.patientReferrals?.filter(x=>!['Completed','Cancelled','Lost to follow-up'].includes(x.status)).length||0}</b><span>Open Referrals</span></div></div></div>`;
  }
  if(key==='study'){
    $('#workspaceExtra').innerHTML=`<div class="card"><div class="cardhead"><div><h3>Study Topics</h3><p class="muted">Study Planner records are shown here too.</p></div><button class="ghost" onclick="app.showView('study')">Open Full Study Planner</button></div>${db.study.filter(s=>s.status!=='Done').map(s=>`<div class="timeline-item"><b>${esc(s.topic)}</b><span>${esc(s.sourceType)} • ${fmt(s.targetDate)} • ${esc(s.status)}</span></div>`).join('')||'<p class="muted">No study topic yet.</p>'}</div>`;
  }
}
function workspaceTaskRow(t){return `<div class="workspace-task-row"><div><b>${esc(t.title)}</b><span>${esc(t.category)} • ${esc(t.priority)} • ${esc(t.status)} • ${esc(t.horizon)}</span>${t.nextAction?`<small>Next: ${esc(t.nextAction)}</small>`:''}</div><div class="actionrow"><button class="ghost" onclick="app.editTask('${t.id}')">Edit</button><button class="ghost" onclick="app.markDone('${t.id}')">Done</button></div></div>`}
function showWorkspaceTasks(key){const w=WORKSPACES[key];showView('tasks');setTimeout(()=>{const f=$('#taskCategoryFilter');if(f&&w.categories.length===1){f.value=w.categories[0];drawTasks()}else if($('#taskSearch')){$('#taskSearch').value=w.categories.join(' ');drawTasks()}},10)}

function renderDashboard(){renderMainWorkspaceButtons();const open=db.tasks.filter(t=>!isDone(t)),attention=open.filter(dueAttention),overdue=open.filter(t=>t.dueDate&&t.dueDate<today()),dueToday=open.filter(t=>t.dueDate===today()||t.reminderDate===today()||t.horizon==='Today'),completed=db.tasks.filter(isDone).length,focus=open.filter(t=>t.focus).length,total=db.tasks.length||1;const focusScore=Math.max(0,Math.min(100,Math.round((completed/total)*45+Math.max(0,40-overdue.length*5)+Math.min(15,focus*5))));const homeFocus=$('#homeFocusScore');if(homeFocus)homeFocus.textContent=focusScore+'%';const hour=new Date().getHours(),greet=hour<12?'Good Morning':hour<17?'Good Afternoon':'Good Evening';$('#futureGreeting').textContent=`${greet}, ${db.settings.ownerName||'Dr Rajesh Sao'}`;$('#dashKpis').innerHTML=[['Total Tasks',db.tasks.length,'neutral'],['In Progress',open.filter(t=>['Work Started','Started Today'].includes(t.status)).length,'blue'],['Today',dueToday.length,'cyan'],['Overdue',overdue.length,'red'],['Completed',completed,'green'],['Focus Score',focusScore+'%','violet']].map(x=>`<div class="future-kpi ${x[2]}"><span>${x[0]}</span><b>${x[1]}</b><small>${x[0]==='Overdue'?'Needs attention':x[0]==='Focus Score'?'Adaptive score':'Live planner data'}</small></div>`).join('');$('#todayList').innerHTML=attention.sort((a,b)=>priorityRank(a.priority)-priorityRank(b.priority)).slice(0,7).map(t=>`<div class="future-action-row"><span class="priority-dot ${t.priority.toLowerCase()}"></span><div><b>${esc(t.title)}</b><small>${esc(t.category)} • ${esc(t.status)}</small></div><span class="future-chip">${esc(t.priority)}</span></div>`).join('')||'<p class="muted">No urgent action right now.</p>';$('#horizonBoard').innerHTML=HORIZONS.slice(0,6).map(h=>{const n=open.filter(t=>t.horizon===h).length;return `<div class="future-horizon"><span>${esc(h)}</span><b>${n}</b><i style="--w:${Math.min(100,n*14)}%"></i></div>`}).join('');drawPriorityChart($('#priorityChart'),open);$('#areaOverview').innerHTML=`<div class="future-area-grid">${CATEGORIES.map(c=>{const n=open.filter(t=>t.category===c).length;return n?`<div><b>${n}</b><span>${esc(c)}</span></div>`:''}).join('')}</div>`;$('#studyQueue').innerHTML=db.study.filter(x=>x.status!=='Done').slice(0,5).map(s=>`<div class="future-list-row"><div><b>${esc(s.topic)}</b><span>${esc(s.sourceType)} • ${esc(s.status)}</span></div><small>${s.targetDate?fmt(s.targetDate):'No date'}</small></div>`).join('')||'<p class="muted">No study topic planned.</p>';const w=db.wellness.find(x=>x.date===today());$('#wellnessToday').innerHTML=w?`<div class="future-wellness-grid"><div><b>${w.japa||0}</b><span>Naam Japa</span></div><div><b>${w.exercise||0}m</b><span>Exercise</span></div><div><b>${w.sleep||0}h</b><span>Sleep</span></div><div><b>${w.water||0}L</b><span>Water</span></div></div>`:'<p class="muted">No wellness log today.</p>';$('#aiDashboardInsight').innerHTML=buildDashboardInsight(open,overdue);
  const ideas=db.ideas||[], ideaOpen=ideas.filter(i=>!['Completed','Cancelled','Impossible'].includes(i.status));
  const ideaEl=$('#ideaDashStats');
  if(ideaEl) ideaEl.innerHTML=`<span><b>${ideas.length}</b>Total</span><span><b>${ideaOpen.length}</b>Open</span><span><b>${ideas.filter(i=>i.status==='Working').length}</b>Working</span><span><b>${ideas.filter(i=>i.status==='Completed').length}</b>Done</span>`;
  checkReminders()}
function buildDashboardInsight(open,overdue){const red=open.filter(t=>t.priority==='Red'),waiting=open.filter(t=>['Waiting','Need Help to Run'].includes(t.status)),study=open.filter(t=>['Student / Study','Research'].includes(t.category)),msg=[];if(red.length)msg.push(`<li><b>${red.length} critical item${red.length>1?'s':''}</b> should be reviewed first.</li>`);if(overdue.length)msg.push(`<li><b>${overdue.length} overdue</b> — reschedule, delegate or close them.</li>`);if(waiting.length)msg.push(`<li><b>${waiting.length} blocked/waiting</b> items may need one call or message.</li>`);if(study.length)msg.push(`<li><b>${study.length} study/research tasks</b> are active; protect focus time.</li>`);if(!msg.length)msg.push('<li>Your workload is currently balanced. Keep Today intentionally small.</li>');return `<ul class="ai-insight-list">${msg.slice(0,4).join('')}</ul>`}

function renderMyDay(){
  const open=db.tasks.filter(t=>!isDone(t));
  const focus=open.filter(t=>t.focus).sort((a,b)=>priorityRank(a.priority)-priorityRank(b.priority));
  const agenda=open.filter(t=>t.horizon==='Today'||t.status==='Start Today'||t.status==='Started Today'||t.dueDate===today()||t.reminderDate===today()).sort((a,b)=>priorityRank(a.priority)-priorityRank(b.priority));
  const overdue=open.filter(t=>t.dueDate&&t.dueDate<today()).sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)));
  const waiting=open.filter(t=>['Waiting','Need Help to Run','Need More Suggestion'].includes(t.status)||t.waitingFor);
  const minutes=agenda.reduce((s,t)=>s+(+t.estimatedMinutes||0),0);
  $('#myDayMinutes').textContent=minutes;
  $('#myDayKpis').innerHTML=[['Focus',focus.length],['Today',agenda.length],['Overdue',overdue.length],['Waiting',waiting.length],['Est. Hours',(minutes/60).toFixed(1)],['Done Today',db.tasks.filter(t=>t.status==='Done'&&(t.updatedAt||'').slice(0,10)===today()).length]].map(x=>`<div class="kpi"><b>${x[1]}</b><span>${x[0]}</span></div>`).join('');
  const mini=a=>a.map(t=>`<div class="task-card p-${t.priority.toLowerCase()}"><div class="task-head"><div><div class="task-title">${esc(t.title)}</div><div class="chips"><span class="chip ${t.priority.toLowerCase()}">${esc(t.priority)}</span><span class="chip">${esc(t.status)}</span></div></div><div class="actionrow"><button onclick="app.editTask('${t.id}')">Open</button><button class="ghost" onclick="app.markDone('${t.id}')">Done</button></div></div>${t.nextAction?`<p class="muted"><b>Next:</b> ${esc(t.nextAction)}</p>`:''}</div>`).join('');
  $('#focusList').innerHTML=mini(focus)||'<p class="muted">No Top Focus task. Edit a task and mark it as Top Focus.</p>';
  $('#agendaList').innerHTML=mini(agenda)||'<p class="muted">Nothing specifically planned for today.</p>';
  $('#rescueList').innerHTML=mini(overdue)||'<p class="muted">No overdue task.</p>';
  $('#waitingList').innerHTML=mini(waiting)||'<p class="muted">Nothing waiting for help or response.</p>';
}
function renderBoard(){
  fillOptions($('#boardArea'),CATEGORIES,true,'All Areas');$('#boardArea').onchange=drawBoard;drawBoard();
}
function drawBoard(){
  const area=$('#boardArea')?.value||'';
  const arr=db.tasks.filter(t=>!area||t.category===area);
  const cols=[
    ['Ideas',t=>['Idea / Capture','Will Start Soon'].includes(t.status)],
    ['Ready',t=>['Start Today','Pending'].includes(t.status)],
    ['Doing',t=>['Started Today','Work Started','Need Modification'].includes(t.status)],
    ['Waiting',t=>['Waiting','Need More Suggestion','Need Help to Run'].includes(t.status)],
    ['Done',t=>t.status==='Done'],
    ['Stopped',t=>['Need to Stop','Stopped'].includes(t.status)]
  ];
  $('#kanbanBoard').innerHTML=cols.map(([name,fn])=>`<div class="kanban-col"><div class="kanban-head"><b>${name}</b><span>${arr.filter(fn).length}</span></div>${arr.filter(fn).sort((a,b)=>priorityRank(a.priority)-priorityRank(b.priority)).map(t=>`<div class="kanban-task p-${t.priority.toLowerCase()}"><b>${esc(t.title)}</b><span>${esc(t.category)}</span><button class="ghost" onclick="app.editTask('${t.id}')">Open</button></div>`).join('')||'<p class="muted tiny">Empty</p>'}</div>`).join('');
}
function renderReview(){
  $('#reviewRefresh').onclick=renderReview;
  const open=db.tasks.filter(t=>!isDone(t));
  const overdue=open.filter(t=>t.dueDate&&t.dueDate<today());
  const stale=open.filter(t=>{const d=(t.updatedAt||t.createdAt||'').slice(0,10);if(!d)return false;return (new Date(today())-new Date(d))/86400000>=14});
  const waiting=open.filter(t=>['Waiting','Need Help to Run','Need More Suggestion'].includes(t.status)||t.waitingFor);
  const long=open.filter(t=>['3 Months Later','6 Months Later','1 Year Later','Someday / No Date'].includes(t.horizon));
  $('#reviewKpis').innerHTML=[['Overdue',overdue.length],['Stale 14+ days',stale.length],['Waiting / Help',waiting.length],['Long-term',long.length],['Open',open.length],['Done',db.tasks.filter(isDone).length]].map(x=>`<div class="kpi"><b>${x[1]}</b><span>${x[0]}</span></div>`).join('');
  const list=a=>a.map(t=>`<div class="task-card p-${t.priority.toLowerCase()}"><div class="task-head"><div class="task-title">${esc(t.title)}</div><button onclick="app.editTask('${t.id}')">Review</button></div><div class="chips"><span class="chip ${t.priority.toLowerCase()}">${esc(t.priority)}</span><span class="chip">${esc(t.status)}</span><span class="chip blue">${esc(t.horizon)}</span></div><div class="actionrow"><button class="ghost" onclick="app.reschedule('${t.id}','Tomorrow')">Tomorrow</button><button class="ghost" onclick="app.reschedule('${t.id}','1 Week Later')">Next Week</button></div></div>`).join('')||'<p class="muted">None.</p>';
  $('#reviewOverdue').innerHTML=list(overdue);$('#reviewStale').innerHTML=list(stale);$('#reviewWaiting').innerHTML=list(waiting);$('#reviewLong').innerHTML=list(long);
  $('#reflectionHistory').innerHTML=db.reflections.slice().reverse().slice(0,6).map(r=>`<div class="timeline-item"><b>${fmt(r.date)}</b><span><b>Went well:</b> ${esc(r.good||'-')}<br><b>Stuck:</b> ${esc(r.stuck||'-')}<br><b>Next:</b> ${esc(r.next||'-')}</span></div>`).join('')||'<p class="muted">No reflection saved yet.</p>';
  $('#saveReflection').onclick=()=>{db.reflections.push({id:uid(),date:today(),good:$('#rv_good').value,stuck:$('#rv_stuck').value,next:$('#rv_next').value});save();alert('Weekly reflection saved.');renderReview()};
}
function reschedule(id,horizon){const t=db.tasks.find(x=>x.id===id);if(!t)return;t.horizon=horizon;t.updatedAt=new Date().toISOString();if(horizon==='Tomorrow'){const d=new Date();d.setDate(d.getDate()+1);t.startDate=d.toISOString().slice(0,10)}save();if($('#pageTitle')?.textContent==='Review Center')renderReview();else if($('#pageTitle')?.textContent==='Tasks & Projects')drawTasks()}

function renderTasks(){fillOptions($('#taskCategoryFilter'),CATEGORIES,true,'All Areas');fillOptions($('#taskPriorityFilter'),PRIORITIES,true,'All Priority');fillOptions($('#taskStatusFilter'),STATUSES,true,'All Status');fillOptions($('#taskHorizonFilter'),HORIZONS,true,'All Start Horizons');$('#newTaskBtn').onclick=()=>editTask();['#taskSearch','#taskCategoryFilter','#taskPriorityFilter','#taskStatusFilter','#taskHorizonFilter'].forEach(s=>$(s).oninput=drawTasks);drawTasks()}
function editTask(id=''){
  const t=id?db.tasks.find(x=>x.id===id):{};
  $('#taskEditor').innerHTML=`<div class="card final-task-editor"><div class="cardhead"><div><span class="eyebrow">TASK / PROJECT DETAILS</span><h3>${t.id?'Edit':'New'} Task or Project</h3><p class="muted">Plan the work, define the next action, estimate time and decide whether it is recurring or a focus item.</p></div><button class="ghost" id="closeTaskEditor">Close</button></div>
  <div class="formgrid">
    <label>Title *<input id="t_title" value="${esc(t.title||'')}"></label>
    <label>Area<select id="t_category"></select></label>
    <label>Project / Subject<input id="t_project" value="${esc(t.project||'')}"></label>
    <label>Priority<select id="t_priority"></select></label>
    <label>Status<select id="t_status"></select></label>
    <label>When to Start<select id="t_horizon"></select></label>
    <label>Start Date<input id="t_start" type="date" value="${t.startDate||''}"></label>
    <label>Due Date<input id="t_due" type="date" value="${t.dueDate||''}"></label>
    <label>Reminder Date<input id="t_reminder" type="date" value="${t.reminderDate||''}"></label>
    <label>Responsible / With Whom<input id="t_owner" value="${esc(t.owner||'Self')}"></label>
    <label>Context / Place<input id="t_context" value="${esc(t.context||'')}"></label>
    <label>Tags<input id="t_tags" value="${esc(t.tags||'')}"></label>
    <label>Next Concrete Action<input id="t_next" value="${esc(t.nextAction||'')}" placeholder="First action to move this forward"></label>
    <label>Estimated Minutes<input id="t_minutes" type="number" min="0" step="5" value="${t.estimatedMinutes||0}"></label>
    <label>Progress %<input id="t_progress" type="number" min="0" max="100" value="${t.progress||0}"></label>
    <label>Waiting For / Delegated To<input id="t_waiting" value="${esc(t.waitingFor||'')}"></label>
    <label>Waiting Contact<input id="t_waitcontact" value="${esc(t.waitingContact||'')}"></label>
    <label>Repeat<select id="t_repeat"><option>None</option><option>Daily</option><option>Weekly</option><option>Monthly</option><option>Yearly</option></select></label>
    <label>Top Focus<select id="t_focus"><option value="false">No</option><option value="true">Yes</option></select></label>
  </div>
  <label>Notes / Why / Strategy / Help Needed<textarea id="t_notes">${esc(t.notes||'')}</textarea></label>
  <div class="actionrow sticky-final-actions"><button id="saveTaskBtn">Save Task / Project</button><button class="ghost" id="saveCloseTaskBtn">Save & Close</button></div></div>`;
  fillOptions($('#t_category'),CATEGORIES);fillOptions($('#t_priority'),PRIORITIES);fillOptions($('#t_status'),STATUSES);fillOptions($('#t_horizon'),HORIZONS);
  $('#t_category').value=t.category||'Other';$('#t_priority').value=t.priority||'Yellow';$('#t_status').value=t.status||'Idea / Capture';$('#t_horizon').value=t.horizon||'Today';$('#t_repeat').value=t.repeat||'None';$('#t_focus').value=String(!!t.focus);
  $('#closeTaskEditor').onclick=()=>$('#taskEditor').innerHTML='';
  $('#saveTaskBtn').onclick=()=>saveTask(id,false);$('#saveCloseTaskBtn').onclick=()=>saveTask(id,true);
  $('#taskEditor').scrollIntoView({behavior:'smooth',block:'start'});
}
function saveTask(id,closeAfter=true){
  try{
    const title=$('#t_title').value.trim();if(!title){alert('Title required.');return}
    const existing=id?db.tasks.find(t=>t.id===id):null;
    const x={id:id||uid(),title,category:$('#t_category').value,project:$('#t_project').value,priority:$('#t_priority').value,status:$('#t_status').value,horizon:$('#t_horizon').value,startDate:$('#t_start').value,dueDate:$('#t_due').value,reminderDate:$('#t_reminder').value,owner:$('#t_owner').value,context:$('#t_context').value,tags:$('#t_tags').value,nextAction:$('#t_next').value,estimatedMinutes:+$('#t_minutes').value||0,progress:Math.max(0,Math.min(100,+$('#t_progress').value||0)),waitingFor:$('#t_waiting').value,waitingContact:$('#t_waitcontact').value,repeat:$('#t_repeat').value,focus:$('#t_focus').value==='true',notes:$('#t_notes').value,createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
    if(x.status==='Done')x.progress=100;
    if(id)db.tasks=db.tasks.map(t=>t.id===id?x:t);else db.tasks.push(x);
    save();if(closeAfter)$('#taskEditor').innerHTML='';drawTasks();alert('Task saved successfully.');
  }catch(err){console.error(err);alert('Task could not be saved. Please refresh and try again.');}
}
function drawTasks(){const q=($('#taskSearch')?.value||'').toLowerCase(),cat=$('#taskCategoryFilter')?.value||'',pri=$('#taskPriorityFilter')?.value||'',st=$('#taskStatusFilter')?.value||'',hor=$('#taskHorizonFilter')?.value||'';const arr=db.tasks.filter(t=>[t.title,t.category,t.project,t.owner,t.context,t.tags,t.notes].join(' ').toLowerCase().includes(q)).filter(t=>!cat||t.category===cat).filter(t=>!pri||t.priority===pri).filter(t=>!st||t.status===st).filter(t=>!hor||t.horizon===hor).sort((a,b)=>priorityRank(a.priority)-priorityRank(b.priority)||horizonRank(a.horizon)-horizonRank(b.horizon));const open=arr.filter(t=>!isDone(t));$('#taskKpis').innerHTML=[['Shown',arr.length],['Open',open.length],['Red',open.filter(t=>t.priority==='Red').length],['Pending',open.filter(t=>t.status==='Pending').length],['Done',arr.filter(isDone).length]].map(x=>`<div class="kpi"><b>${x[1]}</b><span>${x[0]}</span></div>`).join('');$('#tasksList').innerHTML=arr.map(t=>`<div class="task-card p-${t.priority.toLowerCase()}"><div class="task-head"><div><div class="task-title">${esc(t.title)}</div><div class="chips"><span class="chip ${t.priority.toLowerCase()}">${esc(t.priority)}</span><span class="chip">${esc(t.category)}</span>${t.project?`<span class="chip blue">${esc(t.project)}</span>`:''}<span class="chip">${esc(t.status)}</span></div></div><div class="actionrow"><button onclick="app.editTask('${t.id}')">Edit</button><button class="ghost" onclick="app.markDone('${t.id}')">Done</button><button class="ghost" onclick="app.shareTask('${t.id}')">Share</button><button class="ghost" onclick="app.deleteTask('${t.id}')">Delete</button></div></div><div class="task-meta"><div>Start Horizon<b>${esc(t.horizon)}</b></div><div>Due<b>${fmt(t.dueDate)}</b></div><div>Reminder<b>${fmt(t.reminderDate)}</b></div><div>Responsibility<b>${esc(t.owner||'-')}</b></div></div>${t.notes?`<p class="muted">${esc(t.notes)}</p>`:''}</div>`).join('')||'<p class="muted">No matching task.</p>'}
function addDaysISO(d,n){const x=new Date((d||today())+'T00:00:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)}
function addMonthsISO(d,n){const x=new Date((d||today())+'T00:00:00');x.setMonth(x.getMonth()+n);return x.toISOString().slice(0,10)}
function markDone(id){const t=db.tasks.find(x=>x.id===id);if(!t)return;t.status='Done';t.progress=100;t.updatedAt=new Date().toISOString();if(t.repeat&&t.repeat!=='None'){const next={...t,id:uid(),status:'Pending',progress:0,focus:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};const base=t.dueDate||t.startDate||today();if(t.repeat==='Daily')next.dueDate=addDaysISO(base,1);if(t.repeat==='Weekly')next.dueDate=addDaysISO(base,7);if(t.repeat==='Monthly')next.dueDate=addMonthsISO(base,1);if(t.repeat==='Yearly')next.dueDate=addMonthsISO(base,12);next.startDate=next.dueDate;next.reminderDate=next.dueDate;db.tasks.push(next)}save();if($('#tasksList'))drawTasks();}function deleteTask(id){if(confirm('Delete this task?')){db.tasks=db.tasks.filter(x=>x.id!==id);save();drawTasks()}}async function shareTask(id){const t=db.tasks.find(x=>x.id===id);if(!t)return;const text=`${t.title}\nArea: ${t.category}\nPriority: ${t.priority}\nStatus: ${t.status}\nStart: ${t.horizon}\nDue: ${fmt(t.dueDate)}\nNotes: ${t.notes||'-'}`;if(navigator.share)await navigator.share({title:'SAO Workplace Task',text});else{await navigator.clipboard.writeText(text);alert('Copied.')}}
function renderStudy(){fillOptions($('#studyStatusFilter'),STATUSES,true,'All Status');$('#studyStatusFilter').onchange=drawStudy;$('#newStudyBtn').onclick=()=>editStudy();drawStudy()}
function editStudy(id=''){const s=id?db.study.find(x=>x.id===id):{};$('#studyEditor').innerHTML=`<div class="formgrid"><label>Topic *<input id="s_topic" value="${esc(s.topic||'')}"></label><label>Subject / Domain<input id="s_subject" value="${esc(s.subject||'')}"></label><label>Source Type<select id="s_source"></select></label><label>Source / Link / Person<input id="s_detail" value="${esc(s.sourceDetail||'')}"></label><label>Target Date<input id="s_target" type="date" value="${s.targetDate||''}"></label><label>Planned Hours<input id="s_hours" type="number" step=".5" value="${s.hours||''}"></label><label>Status<select id="s_status"></select></label><label>Priority<select id="s_priority"></select></label></div><label>Study Strategy / Notes<textarea id="s_notes">${esc(s.notes||'')}</textarea></label><div class="actionrow"><button id="saveStudy">Save Study Topic</button><button class="ghost" id="closeStudy">Cancel</button></div>`;fillOptions($('#s_source'),SOURCE_TYPES);fillOptions($('#s_status'),STATUSES);fillOptions($('#s_priority'),PRIORITIES);$('#s_source').value=s.sourceType||'Book';$('#s_status').value=s.status||'Will Start Soon';$('#s_priority').value=s.priority||'Yellow';$('#saveStudy').onclick=()=>{const topic=$('#s_topic').value.trim();if(!topic){alert('Topic required.');return}const x={id:id||uid(),topic,subject:$('#s_subject').value,sourceType:$('#s_source').value,sourceDetail:$('#s_detail').value,targetDate:$('#s_target').value,hours:+$('#s_hours').value||0,status:$('#s_status').value,priority:$('#s_priority').value,notes:$('#s_notes').value};if(id)db.study=db.study.map(y=>y.id===id?x:y);else db.study.push(x);save();$('#studyEditor').innerHTML='';drawStudy()};$('#closeStudy').onclick=()=>$('#studyEditor').innerHTML=''}
function drawStudy(){const st=$('#studyStatusFilter')?.value||'',arr=db.study.filter(x=>!st||x.status===st).sort((a,b)=>priorityRank(a.priority)-priorityRank(b.priority)||(a.targetDate||'9999').localeCompare(b.targetDate||'9999'));$('#studyList').innerHTML=arr.map(s=>`<div class="task-card p-${s.priority.toLowerCase()}"><div class="task-head"><div><div class="task-title">${esc(s.topic)}</div><div class="chips"><span class="chip ${s.priority.toLowerCase()}">${esc(s.priority)}</span><span class="chip">${esc(s.sourceType)}</span><span class="chip">${esc(s.status)}</span></div></div><button onclick="app.editStudy('${s.id}')">Edit</button></div><div class="task-meta"><div>Subject<b>${esc(s.subject||'-')}</b></div><div>Target<b>${fmt(s.targetDate)}</b></div><div>Hours<b>${s.hours||0}</b></div><div>Source<b>${esc(s.sourceDetail||'-')}</b></div></div></div>`).join('')||'<p class="muted">No study topic.</p>'}
function renderWellness(){$('#wellnessDate').value=today();$('#wellnessDate').onchange=drawWellnessForm;drawWellnessForm()}
function drawWellnessForm(){const d=$('#wellnessDate').value||today(),w=db.wellness.find(x=>x.date===d)||{};$('#wellnessForm').innerHTML=`<div class="wellness-grid"><div class="wellbox"><h4>Radha Naam Japa</h4><label>Count<input id="w_japa" type="number" value="${w.japa||0}"></label><label>Mala<input id="w_mala" type="number" value="${w.mala||0}"></label></div><div class="wellbox"><h4>Sadhana / Pooja</h4><label>Minutes<input id="w_sadhana" type="number" value="${w.sadhana||0}"></label><label>Vrata / Ekadashi<select id="w_vrata"><option>No</option><option ${w.vrata==='Yes'?'selected':''}>Yes</option></select></label></div><div class="wellbox"><h4>Body Health</h4><label>Exercise min<input id="w_exercise" type="number" value="${w.exercise||0}"></label><label>Yoga min<input id="w_yoga" type="number" value="${w.yoga||0}"></label></div><div class="wellbox"><h4>Recovery</h4><label>Sleep hours<input id="w_sleep" type="number" step=".5" value="${w.sleep||0}"></label><label>Diet adherence %<input id="w_diet" type="number" min="0" max="100" value="${w.diet||0}"></label></div><div class="wellbox"><h4>Dana / Donation</h4><label>Amount ₹<input id="w_donation" type="number" value="${w.donation||0}"></label><label>Where / Purpose<input id="w_donationNote" value="${esc(w.donationNote||'')}"></label></div><div class="wellbox"><h4>Steps / Walk</h4><label>Steps<input id="w_steps" type="number" value="${w.steps||0}"></label><label>Water (L)<input id="w_water" type="number" step=".1" value="${w.water||0}"></label></div><div class="wellbox"><h4>Temple / Darshan</h4><label>Darshan / Yatra<input id="w_darshan" value="${esc(w.darshan||'')}"></label></div><div class="wellbox"><h4>Reflection</h4><label>Notes<textarea id="w_notes">${esc(w.notes||'')}</textarea></label></div></div><div class="actionrow"><button id="saveWellness">Save Daily Log</button></div>`;$('#saveWellness').onclick=()=>saveWellness(d);renderWellnessTotals();renderWellnessHistory()}
function saveWellness(date){const x={date,japa:+$('#w_japa').value||0,mala:+$('#w_mala').value||0,sadhana:+$('#w_sadhana').value||0,vrata:$('#w_vrata').value,exercise:+$('#w_exercise').value||0,yoga:+$('#w_yoga').value||0,sleep:+$('#w_sleep').value||0,diet:+$('#w_diet').value||0,donation:+$('#w_donation').value||0,donationNote:$('#w_donationNote').value,steps:+$('#w_steps').value||0,water:+$('#w_water').value||0,darshan:$('#w_darshan').value,notes:$('#w_notes').value};const i=db.wellness.findIndex(y=>y.date===date);if(i>=0)db.wellness[i]=x;else db.wellness.push(x);save();renderWellnessTotals();renderWellnessHistory();alert('Daily wellness / sadhana log saved.')}
function renderWellnessTotals(){const month=($('#wellnessDate').value||today()).slice(0,7),a=db.wellness.filter(x=>x.date.startsWith(month));const sum=k=>a.reduce((s,x)=>s+(+x[k]||0),0),avg=k=>a.length?(sum(k)/a.length).toFixed(1):0;$('#wellnessTotals').innerHTML=`<div class="metric-grid"><div class="metric"><b>${sum('japa').toLocaleString()}</b><span>Total Naam Japa</span></div><div class="metric"><b>${sum('mala')}</b><span>Total Mala</span></div><div class="metric"><b>${a.filter(x=>x.vrata==='Yes').length}</b><span>Vrata / Ekadashi</span></div><div class="metric"><b>₹${sum('donation').toLocaleString()}</b><span>Dana</span></div><div class="metric"><b>${sum('exercise')}</b><span>Exercise min</span></div><div class="metric"><b>${avg('sleep')}</b><span>Avg Sleep h</span></div><div class="metric"><b>${sum('steps').toLocaleString()}</b><span>Steps</span></div><div class="metric"><b>${a.length}</b><span>Days Logged</span></div></div>`}
function renderWellnessHistory(){$('#wellnessHistory').innerHTML=db.wellness.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10).map(w=>`<div class="timeline-item"><b>${fmt(w.date)}</b><span>Japa ${w.japa||0} • Mala ${w.mala||0} • Exercise ${w.exercise||0} min • Sleep ${w.sleep||0}h ${w.vrata==='Yes'?'• Vrata':''}</span></div>`).join('')||'<p class="muted">No log yet.</p>'}

const TRAVEL_MODES=['Train','Flight','Bus','Car','Bike / Motorcycle','Taxi / Cab','Auto / Rapido','Metro','Local Train','Walking','Mixed'];
const TRAVEL_INTERESTS=[
'Krishna / Vishnu / Rama Temple','Shiva / Jyotirlinga','Other Devi / Devata Temple','Famous Sadhu-Sant Ashram / Statue',
'Ganga / Holy River','Yamuna','Narmada','Other Holy River','Ocean Darshan / Snan','Beach',
'Hill Station / Viewpoint','Garden / Park','Historical Place','Famous Statue / Landmark','Museum / Culture',
'Shopping / Market','Adventure','Outing / Night Stay','Outside Food','Walking','Bike Riding','Sunrise','Sunset','Pond / Lake','Other'
];
const TRAVEL_STAY_TYPES=['Hotel / Lodge','ISKCON Guest House','Other Ashram / Guest House','Dharamshala','Friend Home','Relative Home','Self Home','Hostel','Sleep During Train Travel','Sleep During Bus Travel','Sleep During Car Travel','Other'];
const TRAVEL_FOOD_TYPES=['ISKCON Guest House Prasadam','ISKCON Govinda Restaurant','ISKCON Tiffin Service','ISKCON Online Delivery','ISKCON Thali on Train','Jain Restaurant','Jain Thali','Jain Online Delivery','Jain Thali on Train','Pure Veg — No Onion/Garlic','Pure Veg — Special Order No Onion/Garlic','Pure Veg — Self Adjustment','Self Cooking','Relative Home Food','Friend Home Food','Home Food / Packed Food','Fruits','Snacks','Milk / Light Food','Fasting / Vrata','Other'];
const TRAVEL_SLEEP_TYPES=['Self Home','Hotel / Lodge','ISKCON Guest House','Other Guest House / Ashram','Friend Home','Relative Home','Dharamshala','Train','Bus','Car','Other Place'];
const TRAIN_CLASSES=['1A','2A','3A','3E','CC','EC','SL','2S','General','Other'];
const TRAIN_BERTH_TYPES=['Lower','Middle','Upper','Side Lower','Side Upper','Chair Car Seat','Not allotted','Other'];
const TRAIN_MEAL_TYPES=['Breakfast','Lunch','Evening Snack','Dinner'];
const TRAIN_FOOD_SOURCES=['Home / Packed Food','Railway Pantry / On-board','IRCTC eCatering / Food on Track','ISKCON / Govinda / Prasadam','Jain Food / Jain Thali','Pure Veg No Onion-Garlic','Pure Veg Special Order','Fruits / Snacks','Fasting / Vrata','Station Vendor','Other'];
const TRAIN_TICKET_STATUS=['Confirmed (CNF)','RAC','GNWL','RLWL','PQWL','TQWL','CKWL','WL — Other','Chart Prepared','Cancelled','Not booked','Other'];
const TRAIN_QUOTAS=['GN','TQ','LD','SS','HO','DF','HP','PH','Other'];
const BUS_TYPES=['AC Sleeper','Non-AC Sleeper','AC Seater','Non-AC Seater','Volvo / Multi-axle','Electric Bus','Government Bus','Private Bus','Mini Bus','Other'];
const BUS_TICKET_STATUS=['Confirmed','Waitlisted / Pending','Boarding Pass Issued','Cancelled','Not booked','Other'];




function renderTravel(){
  fillOptions($('#travelStatusFilter'),TRAVEL_STATUSES,true,'All Status');
  $('#travelStatusFilter').onchange=drawTravel;
  $('#newTravelBtn').onclick=()=>editTravel();
  drawTravel(); renderTravelKpis();
peInit();
}
function renderTravelKpis(){
  const arr=db.travel||[];
  const upcoming=arr.filter(t=>t.startDate && new Date(t.startDate+'T23:59:59')>=new Date() && t.status!=='Cancelled').length;
  const active=arr.filter(t=>t.status==='In Progress').length;
  const booked=arr.filter(t=>/booked|confirmed/i.test(t.ticketStatus||'')).length;
  const completed=arr.filter(t=>t.status==='Completed').length;
  const el=$('#travelKpis'); if(!el)return;
  el.innerHTML=[
    ['Total Plans',arr.length,'🗂'],['Upcoming',upcoming,'🧳'],['In Progress',active,'🛣'],['Ticket Ready',booked,'🎫'],['Completed',completed,'✅']
  ].map(x=>`<div><span>${x[2]} ${x[0]}</span><b>${x[1]}</b></div>`).join('');
}
function tripDays(start,end){
  if(!start||!end)return {days:0,nights:0};
  const a=new Date(start+'T00:00:00'),b=new Date(end+'T00:00:00');
  const diff=Math.round((b-a)/86400000);
  return diff>=0?{days:diff+1,nights:diff}:{days:0,nights:0};
}
function travelModeOptions(selected='Train'){
  return TRAVEL_MODES.map(x=>`<option ${x===selected?'selected':''}>${x}</option>`).join('');
}
function genericOptions(arr,selected=''){return arr.map(x=>`<option ${x===selected?'selected':''}>${esc(x)}</option>`).join('')}

function interestChecks(selected=[]){
  const set=new Set(Array.isArray(selected)?selected:String(selected||'').split('|').filter(Boolean));
  return TRAVEL_INTERESTS.map((x,i)=>`<label class="travel-check"><input type="checkbox" class="tr_interest" value="${esc(x)}" ${set.has(x)?'checked':''}>${esc(x)}</label>`).join('');
}
function travelPlanTemplate(t={}){
  const stayStart=t.stayStart||t.startDate||'', stayEnd=t.stayEnd||t.returnDate||'';
  return `
  <input id="tr_id" type="hidden" value="${esc(t.id||'')}">

  <div class="travel-v6-command">
    <div class="travel-v6-hero">
      <div>
        <div class="eyebrow">SAO TRAVEL COMPANION • V6 FOUNDATION</div>
        <h3>Plan once. Carry everything. Recover fast.</h3>
        <p>Route → booking → stay → food → documents → emergency → memories, with reusable records and offline-first access.</p>
      </div>
      <div class="travel-readiness-ring"><b id="travelReadinessScore">--</b><span>Trip Readiness</span></div>
    </div>
    <div class="travel-v6-shortcuts">
      <button type="button" id="tr_jump_plan">🗺 Plan Trip<small>Route & tickets</small></button>
      <button type="button" id="tr_jump_stay">🛕 Stay & Ashram<small>Booking details</small></button>
      <button type="button" id="tr_jump_vault">🪪 Travel Vault<small>ID & membership</small></button>
      <button type="button" id="tr_jump_emergency">🆘 Emergency Pack<small>Contacts & recovery</small></button>
      <button type="button" id="tr_generate_trip_pack">📄 Trip Pack<small>Print / PDF / share</small></button>
    </div>
  </div>

  <div class="travel-section route-discovery-hub" id="travelPlanHub">
    <div class="travel-section-title"><span>0</span><div><b>🧠 Smart Route Discovery & Booking Hub</b><small>Start here: From → To → Date. Reuse saved travel details, compare train/bus options, check route, then continue planning.</small></div></div>

    <div class="formgrid route-discovery-grid">
      <label>From<input id="tr_discovery_from" value="${esc(t.origin||'Raipur')}" placeholder="Raipur"></label>
      <label>To<input id="tr_discovery_to" value="${esc(t.place||'')}" placeholder="Pune"></label>
      <label>Journey date<input id="tr_discovery_date" type="date" value="${t.startDate||t.journeyDate||''}"></label>
      <label>Preferred mode
        <select id="tr_discovery_mode">
          <option>Compare Train + Bus</option>
          <option>Train</option>
          <option>Bus</option>
          <option>Car</option>
          <option>Flight</option>
        </select>
      </label>
    </div>

    <div class="route-discovery-actions">
      <button type="button" id="tr_discover_route" class="travel-ai-btn">✨ Discover Route Options</button>
      <button type="button" id="tr_copy_route_to_plan" class="ghost">↓ Use These Details in Planner</button>
      <button type="button" id="tr_load_saved_template" class="ghost">📂 Load Saved Journey</button>
      <button type="button" id="tr_save_as_template" class="ghost">💾 Save as Reusable Journey</button>
    </div>

    <div id="tr_route_discovery_result" class="route-discovery-result">
      Enter From, To and Date. The app can estimate straight-line distance and open live search/booking services. Exact road/rail distance, fares, availability and timetable remain provider-verified.
    </div>

    <div class="booking-launch-grid">
      <button type="button" id="tr_book_irctc" class="booking-btn rail">🚆 IRCTC Train Booking</button>
      <button type="button" id="tr_open_railone" class="booking-btn railone">📱 RailOne</button>
      <button type="button" id="tr_book_paytm_train" class="booking-btn paytm">🚆 Paytm Trains</button>
      <button type="button" id="tr_book_redbus" class="booking-btn bus">🚌 redBus</button>
      <button type="button" id="tr_book_paytm_bus" class="booking-btn paytm">🚌 Paytm Bus</button>
      <button type="button" id="tr_open_google_route" class="booking-btn map">🗺 Google Route</button>
    </div>

    <div class="saved-travel-panel">
      <div class="train-subhead"><div><b>Saved Journey Templates</b><small>Frequent routes can be loaded without typing again.</small></div></div>
      <div id="tr_saved_template_list" class="saved-template-list"></div>
    </div>
  </div>

  <div class="travel-section">
    <div class="travel-section-title"><span>1</span><div><b>Trip identity</b><small>Where, why, dates and companion</small></div></div>
    <div class="formgrid">
      <label>Event / Trip title *<input id="tr_title" value="${esc(t.title||'')}" placeholder="Raipur → Pune → Raipur"></label>
      <label>Purpose<input id="tr_purpose" value="${esc(t.purpose||'')}" placeholder="Seminar / family / pilgrimage / work / leisure"></label>
      <label>Origin city *<input id="tr_origin" value="${esc(t.origin||'Raipur')}" placeholder="Raipur"></label>
      <label>Destination city *<input id="tr_place" value="${esc(t.place||'')}" placeholder="Pune"></label>
      <label>Status<select id="tr_status"></select></label>
      <label>With whom<input id="tr_with" value="${esc(t.withWhom||'')}" placeholder="Self / family / colleague"></label>
    </div>
  </div>

  <div class="travel-section">
    <div class="travel-section-title"><span>2</span><div><b>Outward journey</b><small>Raipur → destination; multi-mode supported</small></div></div>
    <div class="formgrid">
      <label>Mode<select id="tr_mode">${travelModeOptions(t.mode||'Train')}</select></label>
      <label>Departure date<input id="tr_start" type="date" value="${t.startDate||''}"></label>
      <label>Departure time<input id="tr_depart_time" type="time" value="${t.departTime||''}"></label>
      <label>Expected arrival date<input id="tr_arrival_date" type="date" value="${t.arrivalDate||t.startDate||''}"></label>
      <label>Expected arrival time<input id="tr_arrival_time" type="time" value="${t.arrivalTime||''}"></label>
      <label>Train / Flight / Bus / Vehicle no.<input id="tr_out_ref" value="${esc(t.outRef||'')}" placeholder="Train no., flight no., PNR, vehicle"></label>
      <label>Boarding point<input id="tr_boarding" value="${esc(t.boarding||'')}" placeholder="Station / airport / pickup point"></label>
      <label>Arrival point<input id="tr_arrival_point" value="${esc(t.arrivalPoint||'')}" placeholder="Station / airport / stop"></label>
    </div>
    <div class="travel-smart-actions">
      <button type="button" id="tr_route_search" class="ghost">🔎 Live Route / Schedule Search</button>
    </div>
  </div>

  <div class="travel-section train-intel-section">
    <div class="travel-section-title"><span>2A</span><div><b>🚆 Train Journey Intelligence</b><small>Use when any major leg is by train — PNR, coach/seat, stoppages and meal-window planning</small></div></div>

    <div class="formgrid">
      <label>Train number<input id="tr_train_no" value="${esc(t.trainNo||'')}" placeholder="e.g. 12851"></label>
      <label>Train name<input id="tr_train_name" value="${esc(t.trainName||'')}" placeholder="Train name"></label>
      <label>PNR number<input id="tr_pnr" inputmode="numeric" maxlength="10" value="${esc(t.pnr||'')}" placeholder="10-digit PNR"></label>
      <label>Ticket status<select id="tr_train_ticket_status">${genericOptions(TRAIN_TICKET_STATUS,t.trainTicketStatus||'Confirmed (CNF)')}</select></label>
      <label>Quota<select id="tr_train_quota">${genericOptions(TRAIN_QUOTAS,t.trainQuota||'GN')}</select></label>
      <label>Date of journey<input id="tr_journey_date" type="date" value="${t.journeyDate||t.startDate||''}"></label>
      <label>Class<select id="tr_train_class">${genericOptions(TRAIN_CLASSES,t.trainClass||'3A')}</select></label>
      <label>Coach<input id="tr_coach" value="${esc(t.coach||'')}" placeholder="e.g. B2"></label>
      <label>Seat / Berth no.<input id="tr_seat" value="${esc(t.seat||'')}" placeholder="e.g. 35"></label>
      <label>Berth type<select id="tr_berth_type">${genericOptions(TRAIN_BERTH_TYPES,t.berthType||'Not allotted')}</select></label>
      <label>Boarding station<input id="tr_train_board" value="${esc(t.trainBoard||t.boarding||'')}" placeholder="Raipur Jn"></label>
      <label>Boarding code<input id="tr_train_board_code" value="${esc(t.trainBoardCode||'')}" placeholder="R / RPR"></label>
      <label>Destination station<input id="tr_train_dest" value="${esc(t.trainDest||t.arrivalPoint||'')}" placeholder="Pune Jn"></label>
      <label>Destination code<input id="tr_train_dest_code" value="${esc(t.trainDestCode||'')}" placeholder="PUNE"></label>
    </div>

    <div class="train-quick-links">
      <button type="button" id="tr_pnr_check" class="ghost">🎫 Check PNR — Official Railway</button>
      <button type="button" id="tr_train_schedule" class="ghost">🕒 Find Train Route / Stoppages</button>
      <button type="button" id="tr_ecatering" class="ghost">🍱 IRCTC eCatering / Food on Track</button>
      <button type="button" id="tr_iskcon_train_food" class="ghost">🙏 Search ISKCON Food on Train / Route</button>
    </div>

    <div class="train-ticket-import">
      <div class="train-subhead">
        <div><b>🎟 Smart Ticket / PNR Detail Import</b><small>Paste text copied from ticket, SMS, WhatsApp or booking summary and let the app fill matching fields locally.</small></div>
      </div>
      <textarea id="tr_ticket_text" placeholder="Paste ticket text here: Train no/name, PNR, journey date, coach, berth/seat, boarding, destination, status...">${esc(t.ticketText||'')}</textarea>
      <div class="travel-smart-actions">
        <button type="button" id="tr_parse_ticket" class="travel-ai-btn secondary">✨ Auto-fill Train Fields from Pasted Text</button>
        <button type="button" id="tr_clear_ticket_text" class="ghost">Clear pasted text</button>
      </div>
      <div id="tr_ticket_parse_status" class="travel-online-status">No ticket text parsed yet.</div>
    </div>

    <div class="train-subsection">
      <div class="train-subhead">
        <div><b>Station & Stoppage Timeline</b><small>Enter important stations manually from the verified timetable. Meal planner uses these times.</small></div>
        <button type="button" id="tr_add_stop" class="ghost">＋ Add Station Stop</button>
      </div>
      <div class="train-stop-head">
        <span>Date</span><span>Station / City</span><span>Code</span><span>Arrival</span><span>Departure</span><span>Halt min</span><span>Major / Food</span><span></span>
      </div>
      <div id="tr_train_stops" class="train-stop-list"></div>
      <div class="travel-smart-actions">
        <button type="button" id="tr_build_route_visual" class="travel-ai-btn secondary">🗺 Build Full Train Route Timeline</button>
      </div>
      <div id="tr_train_route_visual" class="train-route-visual">${t.trainRouteVisualHtml||''}</div>
    </div>

    <div class="train-subsection">
      <div class="train-subhead"><div><b>Meal Timing Intelligence</b><small>Shows likely station / in-transit location near your preferred meal times.</small></div></div>
      <div class="train-meal-time-grid">
        <label>Breakfast<input id="tr_breakfast_time" type="time" value="${t.breakfastTime||'08:00'}"></label>
        <label>Lunch<input id="tr_lunch_time" type="time" value="${t.lunchTime||'13:00'}"></label>
        <label>Snack<input id="tr_snack_time" type="time" value="${t.snackTime||'17:00'}"></label>
        <label>Dinner<input id="tr_dinner_time" type="time" value="${t.dinnerTime||'20:00'}"></label>
        <label>Preferred source<select id="tr_train_food_source">${genericOptions(TRAIN_FOOD_SOURCES,t.trainFoodSource||'ISKCON / Govinda / Prasadam')}</select></label>
      </div>
      <div class="travel-smart-actions">
        <button type="button" id="tr_build_meal_plan" class="travel-ai-btn secondary">🍽 Build Train Meal Plan</button>
      </div>
      <div id="tr_train_meal_plan" class="train-meal-plan"></div>
    </div>

    <div class="travel-record-actions">
      <button type="button" id="tr_save_train_snapshot">💾 Save Train Details</button>
      <button type="button" id="tr_share_train_snapshot" class="ghost">↗ Share Train Details</button>
      <button type="button" id="tr_copy_train_snapshot" class="ghost">📋 Copy</button>
      <button type="button" id="tr_print_train_snapshot" class="ghost">🖨 Print</button>
    </div>
    <div id="tr_train_save_status" class="travel-online-status"></div>
    <div class="travel-live-data-note">
      <b>Important:</b> PNR status, platform, delays, live stoppage times, pantry/eCatering availability and vendor menus can change. Keep the train number + PNR here, but verify final live details with Indian Railways / IRCTC before travel or ordering food.
    </div>
  </div>


  <div class="travel-section bus-intel-section">
    <div class="travel-section-title"><span>2B</span><div><b>🚌 Bus Journey Intelligence</b><small>For intercity / overnight bus legs — operator, bus no., seat, boarding, dropping, major halts and food stops</small></div></div>
    <div class="formgrid">
      <label>Bus operator<input id="tr_bus_operator" value="${esc(t.busOperator||'')}" placeholder="Operator / ST / Travels"></label>
      <label>Bus / Service number<input id="tr_bus_no" value="${esc(t.busNo||'')}" placeholder="Bus no. / service no."></label>
      <label>Bus type<select id="tr_bus_type">${genericOptions(BUS_TYPES,t.busType||'AC Sleeper')}</select></label>
      <label>Ticket status<select id="tr_bus_ticket_status">${genericOptions(BUS_TICKET_STATUS,t.busTicketStatus||'Confirmed')}</select></label>
      <label>Seat / Berth<input id="tr_bus_seat" value="${esc(t.busSeat||'')}" placeholder="e.g. L5 / 12"></label>
      <label>Journey date<input id="tr_bus_date" type="date" value="${t.busDate||t.startDate||''}"></label>
      <label>Boarding city / point<input id="tr_bus_board" value="${esc(t.busBoard||'')}" placeholder="Raipur / pickup point"></label>
      <label>Dropping city / point<input id="tr_bus_drop" value="${esc(t.busDrop||'')}" placeholder="Pune / drop point"></label>
    </div>
    <div class="train-ticket-import">
      <textarea id="tr_bus_ticket_text" placeholder="Paste bus ticket / SMS / booking details here...">${esc(t.busTicketText||'')}</textarea>
      <div class="travel-smart-actions">
        <button type="button" id="tr_parse_bus_ticket" class="travel-ai-btn secondary">✨ Auto-fill Bus Fields from Pasted Text</button>
        <button type="button" id="tr_bus_route_search" class="ghost">🔎 Search Bus Route / Stops / Fare</button>
      </div>
    </div>
    <div class="train-subsection">
      <div class="train-subhead"><div><b>Major Bus Stops / Food Breaks</b><small>Add major cities, scheduled halts or meal breaks. Longer halts are highlighted automatically.</small></div>
      <button type="button" id="tr_add_bus_stop" class="ghost">＋ Add Bus Stop</button></div>
      <div class="bus-stop-head"><span>Date</span><span>City / Stop</span><span>Arrival</span><span>Departure</span><span>Halt min</span><span>Food / Break</span><span></span></div>
      <div id="tr_bus_stops" class="bus-stop-list"></div>
      <div class="travel-smart-actions"><button type="button" id="tr_build_bus_visual" class="travel-ai-btn secondary">🗺 Build Bus Route Timeline</button></div>
      <div id="tr_bus_route_visual" class="train-route-visual">${t.busRouteVisualHtml||''}</div>
    </div>
    <div class="travel-record-actions">
      <button type="button" id="tr_save_bus_snapshot">💾 Save Bus Details</button>
      <button type="button" id="tr_share_bus_snapshot" class="ghost">↗ Share Bus Details</button>
      <button type="button" id="tr_copy_bus_snapshot" class="ghost">📋 Copy</button>
      <button type="button" id="tr_print_bus_snapshot" class="ghost">🖨 Print</button>
    </div>
    <div id="tr_bus_save_status" class="travel-online-status"></div>
  </div>


  <div class="travel-section stay-booking-vault" id="travelStayVault">
    <div class="travel-section-title"><span>3A</span><div><b>🛕 Stay / ISKCON / Ashram Booking Vault</b><small>Save accommodation once, keep booking, room, charges, facilities and authorized contact together.</small></div></div>
    <div class="formgrid">
      <label>Stay type<select id="sv_type"><option>ISKCON Guest House</option><option>Ashram</option><option>Dharamshala</option><option>Hotel</option><option>Lodge</option><option>Friend / Relative Home</option><option>Other Guest House</option></select></label>
      <label>Temple / property name<input id="sv_name" placeholder="ISKCON Pune / Guest House"></label>
      <label>City / address<input id="sv_city" placeholder="City / address"></label>
      <label>Booking reference<input id="sv_booking" placeholder="Booking / reservation ID"></label>
      <label>Check-in<input id="sv_checkin" type="datetime-local"></label>
      <label>Check-out<input id="sv_checkout" type="datetime-local"></label>
      <label>Room / bed no.<input id="sv_room" placeholder="Room / bed"></label>
      <label>Total charges ₹<input id="sv_charges" type="number" min="0" placeholder="0"></label>
      <label>Advance / token ₹<input id="sv_advance" type="number" min="0" placeholder="0"></label>
      <label>Balance ₹<input id="sv_balance" type="number" min="0" placeholder="0"></label>
      <label>Authorized person / desk<input id="sv_contact_name" placeholder="Name / reception"></label>
      <label>Contact number<input id="sv_contact_phone" inputmode="tel" placeholder="Phone / WhatsApp"></label>
      <label>Membership / LTM ID<input id="sv_membership" placeholder="ISKCON Life Membership ID"></label>
      <label>Facilities<input id="sv_facilities" placeholder="Prasadam, parking, lift, hot water, Wi-Fi..."></label>
    </div>
    <label>Booking / stay notes<textarea id="sv_notes" placeholder="Rules, check-in instructions, darshan timing, gate, food timing, special requirements..."></textarea></label>
    <div class="travel-record-actions">
      <button type="button" id="sv_save">💾 Save Stay Booking</button>
      <button type="button" id="sv_share" class="ghost">↗ Share</button>
      <button type="button" id="sv_print" class="ghost">🖨 Print / PDF</button>
    </div>
    <div id="sv_saved_list" class="saved-template-list"></div>
  </div>

  <div class="travel-section travel-stay-section">
    <div class="travel-section-title"><span>3</span><div><b>Stay + Sleep Plan</b><small>Destination residence and nightly sleep preference</small></div></div>
    <div class="formgrid">
      <label>Stay from<input id="tr_stay_start" type="date" value="${stayStart}"></label>
      <label>Stay until<input id="tr_stay_end" type="date" value="${stayEnd}"></label>
      <label>Stay type<select id="tr_stay_type">${genericOptions(TRAVEL_STAY_TYPES,t.stayType||'ISKCON Guest House')}</select></label>
      <label>Accommodation / Name<input id="tr_stay" value="${esc(t.stay||'')}" placeholder="Name of lodge / ISKCON / relative / guest house"></label>
      <label>Area / locality<input id="tr_locality" value="${esc(t.locality||'')}" placeholder="e.g. Camp, Pune"></label>
      <label>Primary sleeping place<select id="tr_sleep_type">${genericOptions(TRAVEL_SLEEP_TYPES,t.sleepType||'ISKCON Guest House')}</select></label>
    </div>
    <div id="tr_stay_summary" class="travel-stay-summary">Select stay dates to calculate duration.</div>
    <div class="travel-smart-actions">
      <button type="button" id="tr_find_stay" class="ghost">🏨 Search Stay Near Destination</button>
      <button type="button" id="tr_find_iskcon" class="ghost">🛕 Search ISKCON / Ashram Stay</button>
    </div>
  </div>

  <div class="travel-section">
    <div class="travel-section-title"><span>4</span><div><b>Food & Fasting Plan</b><small>Default food preference for this trip; editable day-wise</small></div></div>
    <div class="formgrid">
      <label>Primary food preference<select id="tr_food_type">${genericOptions(TRAVEL_FOOD_TYPES,t.foodType||'Pure Veg — No Onion/Garlic')}</select></label>
      <label>Backup food option<select id="tr_food_backup">${genericOptions(TRAVEL_FOOD_TYPES,t.foodBackup||'Fruits')}</select></label>
      <label>Meal pattern<select id="tr_meal_pattern">${genericOptions(['2 meals','3 meals','Breakfast + Lunch + Snack + Dinner','Fasting / Parana based','Flexible as per travel','Other'],t.mealPattern||'Flexible as per travel')}</select></label>
      <label>Special instruction<input id="tr_food_note" value="${esc(t.foodNote||'')}" placeholder="No onion/garlic, Jain, Ekadashi, packed food, etc."></label>
    </div>
    <div class="travel-smart-actions">
      <button type="button" id="tr_find_food" class="ghost">🥗 Search Preferred Food Nearby</button>
      <button type="button" id="tr_find_govinda" class="ghost">🍛 Search ISKCON Govinda / Prasadam</button>
    </div>
  </div>

  <div class="travel-section">
    <div class="travel-section-title"><span>5</span><div><b>Spiritual-first nearby discovery & exploration</b><small>Select categories → discover → review → add to trip</small></div></div>
    <div class="formgrid">
      <label>Primary local transport<select id="tr_local_mode">${travelModeOptions(t.localMode||'Taxi / Cab')}</select></label>
      <label>Explore radius
        <select id="tr_radius">
          <option value="3000">3 km</option><option value="5000">5 km</option><option value="10000">10 km</option>
          <option value="25000">25 km</option><option value="50000">50 km</option><option value="100000">100 km</option>
        </select>
      </label>
      <label>Daily pace
        <select id="tr_pace">
          <option value="2">Relaxed — 2 places/day</option><option value="3" selected>Balanced — 3 places/day</option>
          <option value="4">Active — 4 places/day</option><option value="5">Fast — 5 places/day</option>
        </select>
      </label>
      <label>Preferred visit window
        <select id="tr_window"><option>06:00–12:00</option><option>07:00–14:00</option><option>09:00–18:00</option><option>10:00–20:00</option><option>Sunrise-focused</option><option>Sunset-focused</option><option>Flexible</option></select>
      </label>
    </div>
    <div class="travel-interest-grid">${interestChecks(t.interests||[])}</div>
    <div class="travel-smart-actions">
      <button type="button" id="tr_discover" class="travel-ai-btn">✨ Discover Nearby Places</button>
      <button type="button" id="tr_generate" class="travel-ai-btn secondary">🗓 Generate Day-wise Life Plan</button>
      <button type="button" id="tr_maps" class="ghost">📍 Open Destination Map</button>
    </div>
    <div id="tr_online_status" class="travel-online-status">Public map discovery can suggest named places. Opening hours, fees and live availability must be verified before finalizing.</div>
    <label>Nearby / shortlisted places<textarea id="tr_nearby" placeholder="Discovered or manually added places, one per line">${esc(t.nearby||'')}</textarea></label>
    <div id="tr_discovery_cards" class="travel-discovery-cards"></div>
  </div>

  <div class="travel-section">
    <div class="travel-section-title"><span>6</span><div><b>Daily Flow Map</b><small>Date-wise waking, meals, travel, darshan/visit, rest and sleep</small></div></div>
    <div class="travel-smart-actions">
      <button type="button" id="tr_generate_visual" class="travel-ai-btn secondary">🪄 Build Visual Daily Flow</button>
    </div>
    <div id="tr_day_flow" class="travel-day-flow">${t.dayFlowHtml||''}</div>
    <label>Editable day-wise itinerary<textarea id="tr_schedule" class="travel-itinerary-text" placeholder="Day 1..., Day 2...">${esc(t.schedule||'')}</textarea></label>
  </div>

  <div class="travel-section">
    <div class="travel-section-title"><span>7</span><div><b>Return journey</b><small>Destination → home</small></div></div>
    <div class="formgrid">
      <label>Return mode<select id="tr_return_mode">${travelModeOptions(t.returnMode||t.mode||'Train')}</select></label>
      <label>Return departure date<input id="tr_return" type="date" value="${t.returnDate||''}"></label>
      <label>Return departure time<input id="tr_return_time" type="time" value="${t.returnTime||''}"></label>
      <label>Expected home arrival date<input id="tr_home_date" type="date" value="${t.homeDate||t.returnDate||''}"></label>
      <label>Expected home arrival time<input id="tr_home_time" type="time" value="${t.homeTime||''}"></label>
      <label>Return reference / PNR<input id="tr_return_ref" value="${esc(t.returnRef||'')}"></label>
    </div>
  </div>

  <div class="travel-section">
    <div class="travel-section-title"><span>8</span><div><b>Tickets, budget, live-data notes & final summary</b><small>Save what is confirmed and what still needs verification</small></div></div>
    <div class="formgrid">
      <label>Ticket status<input id="tr_ticket" value="${esc(t.ticketStatus||'')}" placeholder="Booked / Waiting / RAC / Not needed"></label>
      <label>Estimated total cost ₹<input id="tr_cost" type="number" value="${t.cost||''}"></label>
      <label>Travel fare / schedule note<input id="tr_live_note" value="${esc(t.liveNote||'')}" placeholder="e.g. Train 12851 ₹___; verify on booking provider"></label>
      <label>Rules / booking / timing note<input id="tr_rules_note" value="${esc(t.rulesNote||'')}" placeholder="Temple closing, ticket rule, ID requirement, etc."></label>
    </div>
    <label>Why / Strategy / Notes<textarea id="tr_notes" placeholder="Purpose, important contacts, medicines, luggage, seminar timing, special needs...">${esc(t.notes||'')}</textarea></label>
  </div>

  <div class="travel-live-data-note">
    <b>Live-data safety:</b> current train/flight/bus availability, fares, exact opening hours, ticket rules and seasonal restrictions can change. The planner can organize and launch targeted searches; confirm final details with the actual operator/venue before booking.
  </div>


  <div class="travel-section travel-security-vault" id="travelDocVault">
    <div class="travel-section-title"><span>8</span><div><b>🪪 Secure Travel Document Vault</b><small>Keep essential travel documents discoverable. Prefer masked Aadhaar. Files stay local-first; optional Firebase Storage backup is attempted when signed in.</small></div></div>
    <div class="travel-security-warning"><b>Financial safety:</b> Do not store card PIN, CVV, OTP or full debit/credit-card numbers here. Save only bank/card nickname + last 4 digits + blocking helpline.</div>
    <div class="formgrid">
      <label>Document type<select id="td_type"><option>Masked Aadhaar</option><option>PAN Card</option><option>Driving Licence</option><option>Passport</option><option>ISKCON Life Membership Card</option><option>Visiting Card</option><option>Travel Insurance</option><option>Vehicle RC</option><option>Rail / Bus Ticket</option><option>Medical / Prescription</option><option>Other</option></select></label>
      <label>Document label<input id="td_label" placeholder="e.g. Masked Aadhaar / LTM Pune"></label>
      <label>ID / last 4 / reference<input id="td_number" placeholder="Avoid unnecessary full sensitive numbers"></label>
      <label>Expiry / valid until<input id="td_expiry" type="date"></label>
    </div>
    <label>Notes<input id="td_note" placeholder="Issuer, emergency use, where accepted, etc."></label>
    <div class="travel-doc-upload">
      <input id="td_file" type="file" accept="image/*,application/pdf">
      <button type="button" id="td_pick_contact" class="ghost">👤 Pick Contact (supported phones)</button>
      <button type="button" id="td_save">💾 Save Document</button>
    </div>
    <div id="td_status" class="travel-online-status"></div>
    <div id="td_list" class="travel-doc-list"></div>
  </div>

  <div class="travel-section emergency-pack" id="travelEmergencyPack">
    <div class="travel-section-title"><span>9</span><div><b>🆘 Emergency & Recovery Pack</b><small>What you need if phone, wallet, documents or connectivity are lost.</small></div></div>
    <div class="emergency-grid">
      <div class="emergency-card">
        <h4>☎ Essential Contacts</h4>
        <div class="formgrid">
          <label>Name<input id="ec_name" placeholder="Person / service"></label>
          <label>Relation / role<input id="ec_role" placeholder="Family / doctor / bank / host"></label>
          <label>Phone<input id="ec_phone" inputmode="tel"></label>
          <label>Priority<select id="ec_priority"><option>Top 10</option><option>Top 50</option><option>Normal</option></select></label>
        </div>
        <button type="button" id="ec_save">＋ Save Contact</button>
        <div id="ec_list" class="emergency-contact-list"></div>
      </div>
      <div class="emergency-card">
        <h4>💳 Financial Recovery — masked only</h4>
        <div class="formgrid">
          <label>Bank / payment method<input id="tf_bank" placeholder="SBI / ICICI / UPI backup"></label>
          <label>Card/account nickname<input id="tf_name" placeholder="Travel backup card"></label>
          <label>Last 4 digits<input id="tf_last4" maxlength="4" inputmode="numeric" placeholder="1234"></label>
          <label>Lost-card / help number<input id="tf_help" inputmode="tel" placeholder="Official helpline"></label>
          <label>Fallback<select id="tf_fallback"><option>Secondary bank / card</option><option>UPI backup</option><option>Emergency cash</option><option>Trusted family transfer</option><option>Other</option></select></label>
          <label>Cash reserve ₹<input id="tf_cash" type="number" min="0" placeholder="Optional"></label>
        </div>
        <label>Recovery note<input id="tf_note" placeholder="What to do first if wallet/phone is lost"></label>
        <button type="button" id="tf_save">💾 Save Recovery Method</button>
        <div id="tf_list" class="emergency-contact-list"></div>
      </div>
    </div>
    <div class="emergency-actions">
      <button type="button" id="ec_contact_picker" class="ghost">📱 Import selected phone contacts</button>
      <button type="button" id="ec_print">📄 Print / Save Emergency Pack PDF</button>
      <button type="button" id="ec_share" class="ghost">↗ Share Emergency Pack</button>
      <button type="button" id="ec_digilocker" class="ghost">🔐 Open DigiLocker</button>
      <button type="button" id="ec_myaadhaar" class="ghost">🪪 Open MyAadhaar</button>
    </div>
  </div>

  <div class="actionrow travel-save-row">
    <button id="saveTravel">💾 Save Complete Travel Plan</button>
    <button type="button" id="tr_share_full_plan" class="ghost">↗ Share Full Plan</button>
    <button type="button" id="tr_print_full_plan" class="ghost">🖨 Print / Save PDF</button>
    <button type="button" id="tr_copy_full_plan" class="ghost">📋 Copy Summary</button>
    <button class="ghost" id="cancelTravel">Cancel</button>
  </div>`;
}
function editTravel(id=''){
  const t=id?db.travel.find(x=>x.id===id):{};
  $('#travelEditor').innerHTML=travelPlanTemplate(t||{});
  $('#travelEditorTitle').textContent=id?'Edit Complete Trip Plan':'Complete Trip Planner';
  fillOptions($('#tr_status'),TRAVEL_STATUSES);
  $('#tr_status').value=t?.status||'Idea';
  $('#tr_radius').value=String(t?.radius||10000);
  $('#tr_pace').value=String(t?.pace||3);
  $('#tr_window').value=t?.visitWindow||'09:00–18:00';

  const stayUpdate=()=>{
    const r=tripDays($('#tr_stay_start').value,$('#tr_stay_end').value);
    $('#tr_stay_summary').innerHTML=r.days?`🏨 <b>${r.days} day(s)</b> at destination • <b>${r.nights} night(s)</b>`:'Select valid stay dates to calculate duration.';
  };
  $('#tr_stay_start').onchange=stayUpdate; $('#tr_stay_end').onchange=stayUpdate; stayUpdate();

  $('#tr_arrival_date').onchange=()=>{if(!$('#tr_stay_start').value)$('#tr_stay_start').value=$('#tr_arrival_date').value;stayUpdate()};
  $('#tr_return').onchange=()=>{if(!$('#tr_stay_end').value)$('#tr_stay_end').value=$('#tr_return').value;if(!$('#tr_home_date').value)$('#tr_home_date').value=$('#tr_return').value;stayUpdate()};
  $('#tr_discover').onclick=discoverNearbyPlaces;
  $('#tr_generate').onclick=generateTravelItinerary;
  $('#tr_maps').onclick=openTravelMap;
  $('#tr_route_search').onclick=openLiveRouteSearch;
  $('#tr_pnr_check').onclick=openOfficialPNR;
  $('#tr_train_schedule').onclick=openTrainScheduleSearch;
  $('#tr_ecatering').onclick=openIRCTCEcatering;
  $('#tr_iskcon_train_food').onclick=openISKCONTrainFoodSearch;
  $('#tr_parse_ticket').onclick=parseTrainTicketText;
  $('#tr_clear_ticket_text').onclick=()=>{$('#tr_ticket_text').value='';$('#tr_ticket_parse_status').textContent='Cleared.'};
  $('#tr_build_route_visual').onclick=buildTrainRouteVisual;
  $('#tr_parse_bus_ticket').onclick=parseBusTicketText;
  $('#tr_bus_route_search').onclick=openBusRouteSearch;
  $('#tr_add_bus_stop').onclick=()=>addBusStopRow();
  $('#tr_build_bus_visual').onclick=buildBusRouteVisual;
  $('#tr_discover_route').onclick=discoverRouteHub;
  $('#tr_copy_route_to_plan').onclick=copyDiscoveryToPlanner;
  $('#tr_save_as_template').onclick=saveCurrentJourneyTemplate;
  $('#tr_load_saved_template').onclick=showSavedJourneyTemplates;
  $('#tr_book_irctc').onclick=openIRCTCBooking;
  $('#tr_open_railone').onclick=openRailOne;
  $('#tr_book_paytm_train').onclick=()=>openBookingSearch('paytm-train');
  $('#tr_book_redbus').onclick=()=>openBookingSearch('redbus');
  $('#tr_book_paytm_bus').onclick=()=>openBookingSearch('paytm-bus');
  $('#tr_open_google_route').onclick=openGoogleRouteFromHub;
  $('#tr_save_train_snapshot').onclick=saveTrainSnapshot;
  $('#tr_share_train_snapshot').onclick=()=>shareText(buildTrainSummary(),'Train Journey Details');
  $('#tr_copy_train_snapshot').onclick=()=>copyText(buildTrainSummary(),'Train details copied.');
  $('#tr_print_train_snapshot').onclick=()=>printTextCard('Train Journey Details',buildTrainSummary());
  $('#tr_save_bus_snapshot').onclick=saveBusSnapshot;
  $('#tr_share_bus_snapshot').onclick=()=>shareText(buildBusSummary(),'Bus Journey Details');
  $('#tr_copy_bus_snapshot').onclick=()=>copyText(buildBusSummary(),'Bus details copied.');
  $('#tr_print_bus_snapshot').onclick=()=>printTextCard('Bus Journey Details',buildBusSummary());
  $('#tr_share_full_plan').onclick=()=>shareText(buildFullTravelSummary(),'Complete Travel Plan');
  $('#tr_copy_full_plan').onclick=()=>copyText(buildFullTravelSummary(),'Travel summary copied.');
  $('#tr_print_full_plan').onclick=()=>printTextCard('Complete Travel Plan',buildFullTravelSummary());
  showSavedJourneyTemplates();
  $('#tr_jump_plan').onclick=()=>$('#travelPlanHub')?.scrollIntoView({behavior:'smooth'});
  $('#tr_jump_stay').onclick=()=>$('#travelStayVault')?.scrollIntoView({behavior:'smooth'});
  $('#tr_jump_vault').onclick=()=>$('#travelDocVault')?.scrollIntoView({behavior:'smooth'});
  $('#tr_jump_emergency').onclick=()=>$('#travelEmergencyPack')?.scrollIntoView({behavior:'smooth'});
  $('#tr_generate_trip_pack').onclick=()=>printTextCard('SAO Travel Trip Pack',buildTripPackSummary());
  $('#sv_save').onclick=saveStayBooking; $('#sv_share').onclick=()=>shareText(buildCurrentStaySummary(),'Stay Booking'); $('#sv_print').onclick=()=>printTextCard('Stay Booking',buildCurrentStaySummary());
  $('#td_save').onclick=saveTravelDocument; $('#td_pick_contact').onclick=pickTravelContact;
  $('#ec_save').onclick=saveEmergencyContact; $('#tf_save').onclick=saveTravelFinance;
  $('#ec_contact_picker').onclick=pickEmergencyContacts; $('#ec_print').onclick=()=>printTextCard('Emergency Travel Pack',buildEmergencyPack());
  $('#ec_share').onclick=()=>shareText(buildEmergencyPack(),'Emergency Travel Pack');
  $('#ec_digilocker').onclick=()=>window.open('https://www.digilocker.gov.in/','_blank','noopener');
  $('#ec_myaadhaar').onclick=()=>window.open('https://myaadhaar.uidai.gov.in/','_blank','noopener');
  renderStayBookings(); renderTravelDocs(); renderEmergencyContacts(); renderTravelFinance(); updateTravelReadiness();
  $('#tr_add_stop').onclick=()=>addTrainStopRow();
  $('#tr_build_meal_plan').onclick=buildTrainMealPlan;
  $('#tr_find_stay').onclick=()=>openTravelSearch('stay');
  $('#tr_find_iskcon').onclick=()=>openTravelSearch('iskcon');
  $('#tr_find_food').onclick=()=>openTravelSearch('food');
  $('#tr_find_govinda').onclick=()=>openTravelSearch('govinda');
  $('#tr_generate_visual').onclick=buildTravelDayFlow;
  renderTrainStopRows(Array.isArray(t?.trainStops)?t.trainStops:[]);
  if(t?.trainMealPlanHtml) $('#tr_train_meal_plan').innerHTML=t.trainMealPlanHtml;
  renderBusStopRows(Array.isArray(t?.busStops)?t.busStops:[]);
  if(t?.trainRouteVisualHtml) $('#tr_train_route_visual').innerHTML=t.trainRouteVisualHtml;
  if(t?.busRouteVisualHtml) $('#tr_bus_route_visual').innerHTML=t.busRouteVisualHtml;
  if($('#tr_discovery_from')) $('#tr_discovery_from').value=t?.origin||'Raipur';
  if($('#tr_discovery_to')) $('#tr_discovery_to').value=t?.place||'';
  if($('#tr_discovery_date')) $('#tr_discovery_date').value=t?.startDate||t?.journeyDate||'';


  $('#saveTravel').onclick=()=>{
    const title=$('#tr_title').value.trim(),place=$('#tr_place').value.trim(),origin=$('#tr_origin').value.trim();
    if(!title||!place||!origin){alert('Trip title, origin and destination are required.');return}
    const interests=[...document.querySelectorAll('.tr_interest:checked')].map(x=>x.value);
    const x={
      id:id||uid(),title,purpose:$('#tr_purpose').value,origin,place,startDate:$('#tr_start').value,departTime:$('#tr_depart_time').value,
      arrivalDate:$('#tr_arrival_date').value,arrivalTime:$('#tr_arrival_time').value,outRef:$('#tr_out_ref').value,
      boarding:$('#tr_boarding').value,arrivalPoint:$('#tr_arrival_point').value,status:$('#tr_status').value,mode:$('#tr_mode').value,
      trainNo:$('#tr_train_no').value.trim(),trainName:$('#tr_train_name').value.trim(),pnr:$('#tr_pnr').value.trim(),
        trainTicketStatus:$('#tr_train_ticket_status').value,trainQuota:$('#tr_train_quota').value,ticketText:$('#tr_ticket_text').value,
        journeyDate:$('#tr_journey_date').value,trainClass:$('#tr_train_class').value,coach:$('#tr_coach').value.trim(),seat:$('#tr_seat').value.trim(),berthType:$('#tr_berth_type').value,
        trainBoard:$('#tr_train_board').value.trim(),trainBoardCode:$('#tr_train_board_code').value.trim(),trainDest:$('#tr_train_dest').value.trim(),trainDestCode:$('#tr_train_dest_code').value.trim(),
        trainStops:collectTrainStops(),trainRouteVisualHtml:$('#tr_train_route_visual').innerHTML,breakfastTime:$('#tr_breakfast_time').value,lunchTime:$('#tr_lunch_time').value,snackTime:$('#tr_snack_time').value,dinnerTime:$('#tr_dinner_time').value,
        trainFoodSource:$('#tr_train_food_source').value,trainMealPlanHtml:$('#tr_train_meal_plan').innerHTML,
        busOperator:$('#tr_bus_operator').value.trim(),busNo:$('#tr_bus_no').value.trim(),busType:$('#tr_bus_type').value,busTicketStatus:$('#tr_bus_ticket_status').value,busSeat:$('#tr_bus_seat').value.trim(),busDate:$('#tr_bus_date').value,busBoard:$('#tr_bus_board').value.trim(),busDrop:$('#tr_bus_drop').value.trim(),busTicketText:$('#tr_bus_ticket_text').value,busStops:collectBusStops(),busRouteVisualHtml:$('#tr_bus_route_visual').innerHTML,
        stayStart:$('#tr_stay_start').value,stayEnd:$('#tr_stay_end').value,stayType:$('#tr_stay_type').value,stay:$('#tr_stay').value,locality:$('#tr_locality').value,sleepType:$('#tr_sleep_type').value,foodType:$('#tr_food_type').value,foodBackup:$('#tr_food_backup').value,mealPattern:$('#tr_meal_pattern').value,foodNote:$('#tr_food_note').value,
      localMode:$('#tr_local_mode').value,radius:+$('#tr_radius').value||10000,pace:+$('#tr_pace').value||3,visitWindow:$('#tr_window').value,
      interests,ticketStatus:$('#tr_ticket').value,withWhom:$('#tr_with').value,cost:+$('#tr_cost').value||0,
      nearby:$('#tr_nearby').value,schedule:$('#tr_schedule').value,returnMode:$('#tr_return_mode').value,returnDate:$('#tr_return').value,
      returnTime:$('#tr_return_time').value,homeDate:$('#tr_home_date').value,homeTime:$('#tr_home_time').value,
      returnRef:$('#tr_return_ref').value,liveNote:$('#tr_live_note').value,rulesNote:$('#tr_rules_note').value,dayFlowHtml:$('#tr_day_flow').innerHTML,notes:$('#tr_notes').value,updatedAt:new Date().toISOString(),createdAt:t?.createdAt||new Date().toISOString()
    };
    if(id)db.travel=db.travel.map(y=>y.id===id?x:y);else db.travel.push(x);
    save();$('#travelEditor').innerHTML='';drawTravel();renderTravelKpis();alert('Complete travel plan saved.');
  };
  $('#cancelTravel').onclick=()=>$('#travelEditor').innerHTML='';
}
function selectedTravelInterests(){
  return [...document.querySelectorAll('.tr_interest:checked')].map(x=>x.value);
}
function overpassFilters(interests){
  const f=[];
  const has=r=>interests.some(x=>r.test(x));
  if(has(/Krishna|Vishnu|Rama/))f.push('["amenity"="place_of_worship"]["religion"="hindu"]');
  if(has(/Shiva|Jyotirlinga/))f.push('["amenity"="place_of_worship"]["religion"="hindu"]');
  if(has(/Devi|Devata/))f.push('["amenity"="place_of_worship"]["religion"="hindu"]');
  if(has(/Ashram|Sadhu|Sant|Statue/))f.push('["amenity"="place_of_worship"]','["tourism"="artwork"]','["historic"="memorial"]');
  if(has(/River|Ganga|Yamuna|Narmada/))f.push('["waterway"="river"]','["natural"="water"]');
  if(has(/Ocean|Beach/))f.push('["natural"="beach"]','["natural"="coastline"]');
  if(has(/Hill|Viewpoint|Sunrise|Sunset/))f.push('["tourism"="viewpoint"]','["natural"="peak"]');
  if(has(/Garden|Park/))f.push('["leisure"="park"]','["leisure"="garden"]');
  if(has(/Historical/))f.push('["historic"]');
  if(has(/Landmark|Statue/))f.push('["tourism"="attraction"]','["tourism"="artwork"]');
  if(has(/Museum|Culture/))f.push('["tourism"="museum"]','["tourism"="gallery"]');
  if(has(/Shopping|Market/))f.push('["shop"]','["amenity"="marketplace"]');
  if(has(/Adventure/))f.push('["sport"]','["leisure"]');
  if(has(/Pond|Lake/))f.push('["natural"="water"]','["water"="lake"]','["water"="pond"]');
  if(!f.length)f.push('["tourism"="attraction"]','["historic"]','["leisure"="park"]','["amenity"="place_of_worship"]');
  return [...new Set(f)].slice(0,10);
}
function haversineKm(a,b,c,d){
  const R=6371,rad=x=>x*Math.PI/180,dl=rad(c-a),dn=rad(d-b);
  const h=Math.sin(dl/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(dn/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}
function guessPlaceCategory(tags={}){
  if(tags.amenity==='place_of_worship') return tags.religion==='hindu'?'Temple / Ashram':'Place of Worship';
  if(tags.historic) return 'Historical';
  if(tags.tourism==='museum') return 'Museum';
  if(tags.tourism==='viewpoint') return 'Viewpoint';
  if(tags.natural==='beach') return 'Beach';
  if(tags.leisure==='park'||tags.leisure==='garden') return 'Garden / Park';
  if(tags.shop||tags.amenity==='marketplace') return 'Shopping';
  if(tags.natural==='water'||tags.water||tags.waterway) return 'Water / River / Lake';
  return tags.tourism||tags.natural||tags.leisure||'Attraction';
}
async function discoverNearbyPlaces(){
  const city=$('#tr_place').value.trim(),locality=$('#tr_locality').value.trim();
  if(!city){alert('Please enter destination city first.');return}
  const status=$('#tr_online_status');status.textContent='🔎 Finding destination and nearby places…';
  try{
    const q=encodeURIComponent([locality,city,'India'].filter(Boolean).join(', '));
    const geo=await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`,{headers:{'Accept':'application/json'}});
    if(!geo.ok)throw new Error('Destination lookup failed');
    const g=await geo.json(); if(!g.length)throw new Error('Destination not found');
    const lat=+g[0].lat,lon=+g[0].lon,radius=+$('#tr_radius').value||10000;
    const filters=overpassFilters(selectedTravelInterests());
    const parts=filters.map(f=>`nwr(around:${radius},${lat},${lon})${f}["name"];`).join('');
    const query=`[out:json][timeout:20];(${parts});out center tags 60;`;
    const ov=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:'data='+encodeURIComponent(query)});
    if(!ov.ok)throw new Error('Nearby place service unavailable');
    const data=await ov.json();
    const seen=new Set(),items=[];
    for(const e of data.elements||[]){
      const n=(e.tags?.name||'').trim(); if(!n||seen.has(n.toLowerCase()))continue;
      seen.add(n.toLowerCase());
      const plat=+(e.lat??e.center?.lat),plon=+(e.lon??e.center?.lon);
      const dist=(Number.isFinite(plat)&&Number.isFinite(plon))?haversineKm(lat,lon,plat,plon):null;
      items.push({name:n,category:guessPlaceCategory(e.tags||{}),distance:dist,opening:e.tags?.opening_hours||'',fee:e.tags?.fee||'',website:e.tags?.website||e.tags?.['contact:website']||'',religion:e.tags?.religion||'',denomination:e.tags?.denomination||''});
      if(items.length>=24)break;
    }
    if(!items.length)throw new Error('No named places returned');
    items.sort((a,b)=>(a.distance??999)-(b.distance??999));
    $('#tr_nearby').value=items.map(x=>x.name).join('\n');
    const cards=$('#tr_discovery_cards');
    cards.innerHTML=items.map((x,i)=>`<div class="travel-place-card">
      <div><b>${i+1}. ${esc(x.name)}</b><span>${esc(x.category)}${x.distance!=null?` • ~${x.distance.toFixed(1)} km`:''}</span></div>
      <div class="travel-place-meta">
        <span>🕒 ${esc(x.opening||'Hours: verify live')}</span>
        <span>🎫 ${esc(x.fee?`Fee: ${x.fee}`:'Ticket/Fee: verify')}</span>
        ${x.religion?`<span>🙏 ${esc(x.religion)}${x.denomination?` • ${esc(x.denomination)}`:''}</span>`:''}
      </div>
      <button class="ghost" type="button" onclick="app.openNamedPlace('${encodeURIComponent(x.name+' '+city)}')">Map / Details</button>
    </div>`).join('');
    status.innerHTML=`✅ Found <b>${items.length}</b> nearby place(s) around ${esc(city)}. Distances are approximate straight-line distance; verify route time, opening hours, tickets and rules before finalizing.`;
  }catch(e){
    status.innerHTML=`⚠ Automatic discovery could not complete (${esc(e.message||'network issue')}). Existing data is safe. Add places manually or use “Open Destination Map”.`;
  }
}
function generateTravelItinerary(){
  const start=$('#tr_stay_start').value,end=$('#tr_stay_end').value,city=$('#tr_place').value.trim();
  if(!start||!end){alert('Please enter stay start and end dates first.');return}
  const r=tripDays(start,end); if(!r.days){alert('Please check the stay dates.');return}
  const raw=$('#tr_nearby').value.split(/\n|,/).map(x=>x.trim()).filter(Boolean);
  const pace=+$('#tr_pace').value||3,windowTxt=$('#tr_window').value,local=$('#tr_local_mode').value;
  const stay=$('#tr_stay_type').value,food=$('#tr_food_type').value,backup=$('#tr_food_backup').value,sleep=$('#tr_sleep_type').value,meal=$('#tr_meal_pattern').value;
  const days=[];
  for(let i=0;i<r.days;i++){
    const d=new Date(start+'T00:00:00');d.setDate(d.getDate()+i);
    const spots=raw.slice(i*pace,(i+1)*pace);
    const date=d.toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short',year:'numeric'});
    let text=`Day ${i+1} • ${date} • ${city||'Destination'}\n`;
    text+=`Stay: ${stay} • Sleep: ${sleep}\nFood: ${food} • Backup: ${backup} • Pattern: ${meal}\n`;
    text+=`Preferred outing window: ${windowTxt} • Local movement: ${local}\n`;
    if(i===0)text+=`Arrival / settle-in / bath-rest / local orientation as needed.\n`;
    if(spots.length)spots.forEach((p,j)=>text+=`${j+1}. ${p} — verify route, opening hours, ticket/rules, darshan timing and local conditions.\n`);
    else text+=`Flexible block: seminar / family / rest / sadhana / personal work.\n`;
    if(i===r.days-1)text+=`Return buffer: packing, checkout, food/water preparation and departure.\n`;
    days.push(text);
  }
  const remaining=raw.slice(r.days*pace);
  if(remaining.length)days.push(`Optional / overflow places:\n- ${remaining.join('\n- ')}`);
  $('#tr_schedule').value=days.join('\n');
  buildTravelDayFlow(false);
  $('#tr_online_status').innerHTML=`✅ Day-wise life plan generated for <b>${r.days} day(s)</b>. It includes stay, food, sleep and visit blocks. Verify all live details before booking.`;
}
function buildTravelDayFlow(showAlert=true){
  const start=$('#tr_stay_start').value,end=$('#tr_stay_end').value,city=$('#tr_place').value.trim();
  if(!start||!end){if(showAlert)alert('Enter stay dates first.');return}
  const r=tripDays(start,end); if(!r.days)return;
  const raw=$('#tr_nearby').value.split(/\n|,/).map(x=>x.trim()).filter(Boolean),pace=+$('#tr_pace').value||3;
  const stay=$('#tr_stay_type').value,food=$('#tr_food_type').value,sleep=$('#tr_sleep_type').value,local=$('#tr_local_mode').value;
  const rows=[];
  for(let i=0;i<r.days;i++){
    const d=new Date(start+'T00:00:00');d.setDate(d.getDate()+i);
    const date=d.toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short'});
    const spots=raw.slice(i*pace,(i+1)*pace);
    rows.push(`<div class="travel-day-card"><div class="travel-day-head"><b>Day ${i+1}</b><span>${date}</span></div>
      <div class="travel-flowline">
        <span>🌅 Wake / Morning</span><i>→</i><span>🙏 Sadhana / Ready</span><i>→</i><span>🥗 ${esc(food)}</span><i>→</i>
        <span>🚕 ${esc(local)}</span><i>→</i><span>📍 ${esc(spots.join(' • ')||'Flexible / Rest')}</span><i>→</i>
        <span>🏨 ${esc(stay)}</span><i>→</i><span>😴 ${esc(sleep)}</span>
      </div></div>`);
  }
  $('#tr_day_flow').innerHTML=rows.join('');
}
function renderTrainStopRows(rows=[]){
  const box=$('#tr_train_stops'); if(!box)return;
  box.innerHTML='';
  rows.forEach(r=>addTrainStopRow(r));
}
function addTrainStopRow(r={}){
  const box=$('#tr_train_stops'); if(!box)return;
  const row=document.createElement('div'); row.className='train-stop-row';
  row.innerHTML=`
    <input class="ts-date" type="date" value="${r.date||''}">
    <input class="ts-station" value="${esc(r.station||'')}" placeholder="Station / City">
    <input class="ts-code" value="${esc(r.code||'')}" placeholder="Code">
    <input class="ts-arrival" type="time" value="${r.arrival||''}">
    <input class="ts-departure" type="time" value="${r.departure||''}">
    <input class="ts-halt" type="number" min="0" value="${r.halt||''}" placeholder="min">
    <input class="ts-food" value="${esc(r.food||'')}" placeholder="🍽 Food / eCatering / major city">
    <button type="button" class="train-remove-stop" title="Remove">×</button>`;
  row.querySelector('.train-remove-stop').onclick=()=>row.remove();
  box.appendChild(row);
}function collectTrainStops(){
  return [...document.querySelectorAll('#tr_train_stops .train-stop-row')].map(r=>({
    date:r.querySelector('.ts-date').value,
    station:r.querySelector('.ts-station').value.trim(),
    code:r.querySelector('.ts-code').value.trim(),
    arrival:r.querySelector('.ts-arrival').value,
    departure:r.querySelector('.ts-departure').value,
    halt:r.querySelector('.ts-halt').value,
    food:r.querySelector('.ts-food').value.trim()
  })).filter(x=>x.date||x.station||x.arrival||x.departure);
}
function dtOf(date,time){
  if(!date||!time)return null;
  const d=new Date(`${date}T${time}:00`);
  return Number.isNaN(d.getTime())?null:d;
}
function stationPointTime(s){
  return dtOf(s.date,s.arrival)||dtOf(s.date,s.departure);
}
function nearestTrainContext(target,stops){
  const withTime=stops.map(s=>({s,t:stationPointTime(s)})).filter(x=>x.t).sort((a,b)=>a.t-b.t);
  if(!withTime.length)return {kind:'unknown'};
  let best=null;
  for(const x of withTime){
    const diff=Math.abs(x.t-target);
    if(!best||diff<best.diff)best={...x,diff};
  }
  if(best && best.diff<=60*60*1000)return {kind:'station',stop:best.s,diffMin:Math.round(best.diff/60000)};
  let prev=null,next=null;
  for(const x of withTime){if(x.t<=target)prev=x;if(x.t>target){next=x;break}}
  if(prev&&next)return {kind:'between',prev:prev.s,next:next.s};
  if(prev)return {kind:'after',prev:prev.s};
  if(next)return {kind:'before',next:next.s};
  return {kind:'unknown'};
}
function normalizeDateToISO(s){
  if(!s)return '';
  let m=s.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if(m)return `${m[3]}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;
  return '';
}
function parseTrainTicketText(){
  const txt=$('#tr_ticket_text').value.trim(); if(!txt){alert('Paste train ticket / SMS text first.');return}
  const one=txt.replace(/\s+/g,' ');
  const pnr=(one.match(/\bPNR(?:\s*(?:No|Number|:|-))?\s*[:#-]?\s*(\d{10})\b/i)||one.match(/\b(\d{10})\b/))?.[1]||'';
  const train=(one.match(/\b(?:Train|Train No|Train Number)\s*[:#-]?\s*(\d{4,6})\b/i)||[])?.[1]||'';
  const coach=(one.match(/\b(?:Coach|Coach No)\s*[:#-]?\s*([A-Z]{1,3}\d{0,2})\b/i)||[])?.[1]||'';
  const berth=(one.match(/\b(?:Berth|Seat|Seat No|Berth No)\s*[:#-]?\s*([A-Z]?\d{1,3})\b/i)||[])?.[1]||'';
  const cls=(one.match(/\b(1A|2A|3A|3E|SL|CC|EC|2S)\b/)||[])?.[1]||'';
  const status=(one.match(/\b(CNF|CONFIRMED|RAC|RLWL|GNWL|PQWL|TQWL|CKWL|WL)\b/i)||[])?.[1]||'';
  const date=normalizeDateToISO(one);
  if(pnr)$('#tr_pnr').value=pnr;if(train)$('#tr_train_no').value=train;if(coach)$('#tr_coach').value=coach;if(berth)$('#tr_seat').value=berth;if(cls)$('#tr_train_class').value=cls;if(date)$('#tr_journey_date').value=date;
  if(status){
    const map={CNF:'Confirmed (CNF)',CONFIRMED:'Confirmed (CNF)',RAC:'RAC',RLWL:'RLWL',GNWL:'GNWL',PQWL:'PQWL',TQWL:'TQWL',CKWL:'CKWL',WL:'WL — Other'};
    $('#tr_train_ticket_status').value=map[status.toUpperCase()]||'Other';
  }
  $('#tr_ticket_parse_status').innerHTML=`✅ Parsed locally: ${[pnr&&'PNR',train&&'train no.',coach&&'coach',berth&&'seat/berth',cls&&'class',status&&'status',date&&'date'].filter(Boolean).join(', ')||'no standard field confidently recognized'}. Please verify before saving.`;
}
function classifyStop(s,maxHalt){
  const h=+s.halt||0, food=(s.food||'').toLowerCase();
  const major=h>=15 || /major|junction|jn|city|break|meal/.test(food);
  const foodFlag=/food|meal|thali|breakfast|lunch|dinner|ecater|iskcon|govinda|jain|veg|pantry|snack/.test(food);
  const max=h===maxHalt && h>0;
  return {major,foodFlag,max};
}
function buildTrainRouteVisual(){
  const stops=collectTrainStops(); if(!stops.length){alert('Add verified train stoppages first.');return}
  const maxHalt=Math.max(...stops.map(s=>+s.halt||0));
  $('#tr_train_route_visual').innerHTML=stops.map((s,i)=>{
    const c=classifyStop(s,maxHalt);
    return `<div class="route-stop-card ${c.max?'max-halt':''} ${c.major?'major-stop':''}">
      <div class="route-seq">${i+1}</div><div class="route-main"><b>${esc(s.station||'Station')}</b><span>${esc(s.code||'')} ${s.date?`• ${esc(s.date)}`:''}</span>
      <small>${s.arrival?`Arr ${s.arrival}`:''}${s.departure?` • Dep ${s.departure}`:''}${s.halt?` • Halt ${s.halt} min`:''}</small></div>
      <div class="route-icons">${c.max?'<span title="Longest entered halt">⏱️ MAX HALT</span>':''}${c.major?'<span title="Major / useful stop">🏙️</span>':''}${c.foodFlag?'<span title="Food opportunity">🍱</span>':''}</div>
      ${s.food?`<div class="route-food-note">🥗 ${esc(s.food)}</div>`:''}
    </div>`;
  }).join('');
}
function parseBusTicketText(){
  const txt=$('#tr_bus_ticket_text').value.trim();if(!txt){alert('Paste bus ticket / SMS text first.');return}
  const one=txt.replace(/\s+/g,' ');
  const seat=(one.match(/\b(?:Seat|Berth)\s*[:#-]?\s*([A-Z]?\d{1,3})\b/i)||[])?.[1]||'';
  const svc=(one.match(/\b(?:Bus|Service|Bus No|Service No)\s*[:#-]?\s*([A-Z0-9\-]{3,15})\b/i)||[])?.[1]||'';
  const date=normalizeDateToISO(one);
  if(seat)$('#tr_bus_seat').value=seat;if(svc)$('#tr_bus_no').value=svc;if(date)$('#tr_bus_date').value=date;
}
function renderBusStopRows(rows=[]){const box=$('#tr_bus_stops');if(!box)return;box.innerHTML='';rows.forEach(r=>addBusStopRow(r))}
function addBusStopRow(r={}){
  const box=$('#tr_bus_stops');if(!box)return;const row=document.createElement('div');row.className='bus-stop-row';
  row.innerHTML=`<input class="bs-date" type="date" value="${r.date||''}"><input class="bs-city" value="${esc(r.city||'')}" placeholder="Major city / halt"><input class="bs-arrival" type="time" value="${r.arrival||''}"><input class="bs-departure" type="time" value="${r.departure||''}"><input class="bs-halt" type="number" min="0" value="${r.halt||''}" placeholder="min"><input class="bs-food" value="${esc(r.food||'')}" placeholder="🍽 Food / washroom / break"><button type="button" class="train-remove-stop">×</button>`;
  row.querySelector('.train-remove-stop').onclick=()=>row.remove();box.appendChild(row);
}
function collectBusStops(){return [...document.querySelectorAll('#tr_bus_stops .bus-stop-row')].map(r=>({date:r.querySelector('.bs-date').value,city:r.querySelector('.bs-city').value.trim(),arrival:r.querySelector('.bs-arrival').value,departure:r.querySelector('.bs-departure').value,halt:r.querySelector('.bs-halt').value,food:r.querySelector('.bs-food').value.trim()})).filter(x=>x.date||x.city||x.arrival||x.departure)}
function buildBusRouteVisual(){
  const stops=collectBusStops();if(!stops.length){alert('Add bus stops / halts first.');return}
  const maxHalt=Math.max(...stops.map(s=>+s.halt||0));
  $('#tr_bus_route_visual').innerHTML=stops.map((s,i)=>{const h=+s.halt||0,food=!!s.food,max=h===maxHalt&&h>0,major=h>=20;
    return `<div class="route-stop-card ${max?'max-halt':''} ${major?'major-stop':''}"><div class="route-seq">${i+1}</div><div class="route-main"><b>${esc(s.city||'Bus stop')}</b><span>${s.date||''}</span><small>${s.arrival?`Arr ${s.arrival}`:''}${s.departure?` • Dep ${s.departure}`:''}${s.halt?` • Halt ${s.halt} min`:''}</small></div><div class="route-icons">${max?'<span>⏱️ MAX HALT</span>':''}${major?'<span>🏙️</span>':''}${food?'<span>🍱</span>':''}</div>${food?`<div class="route-food-note">🥗 ${esc(s.food)}</div>`:''}</div>`;
  }).join('');
}


function stayObjFromForm(){
  return {id:uid(),type:$('#sv_type').value,name:$('#sv_name').value.trim(),city:$('#sv_city').value.trim(),booking:$('#sv_booking').value.trim(),checkin:$('#sv_checkin').value,checkout:$('#sv_checkout').value,room:$('#sv_room').value.trim(),charges:$('#sv_charges').value,advance:$('#sv_advance').value,balance:$('#sv_balance').value,contactName:$('#sv_contact_name').value.trim(),contactPhone:$('#sv_contact_phone').value.trim(),membership:$('#sv_membership').value.trim(),facilities:$('#sv_facilities').value.trim(),notes:$('#sv_notes').value.trim(),savedAt:new Date().toISOString()}
}
function buildCurrentStaySummary(){
  const x=stayObjFromForm();
  return `STAY BOOKING
Type: ${x.type}
Property: ${x.name||'-'}
City / Address: ${x.city||'-'}
Booking Ref: ${x.booking||'-'}
Check-in: ${x.checkin||'-'}
Check-out: ${x.checkout||'-'}
Room / Bed: ${x.room||'-'}
Charges: ₹${x.charges||0} | Advance: ₹${x.advance||0} | Balance: ₹${x.balance||0}
Authorized person: ${x.contactName||'-'} ${x.contactPhone||''}
Membership/LTM: ${x.membership||'-'}
Facilities: ${x.facilities||'-'}
Notes: ${x.notes||'-'}`;
}
function saveStayBooking(){
  const x=stayObjFromForm(); if(!x.name&&!x.city){alert('Enter stay/property or city first.');return}
  db.travelStays.push(x); save(); renderStayBookings(); updateTravelReadiness();
}
function renderStayBookings(){
  const box=$('#sv_saved_list'); if(!box)return;
  box.innerHTML=(db.travelStays||[]).slice().reverse().slice(0,15).map(x=>`<div class="saved-template-card"><div><b>${esc(x.name||x.type)}</b><span>${esc(x.city||'')} • ${esc(x.checkin||'')} → ${esc(x.checkout||'')} • Room ${esc(x.room||'-')}</span></div><div class="saved-template-actions"><button type="button" class="ghost" onclick="app.shareStay('${x.id}')">Share</button><button type="button" class="ghost danger-lite" onclick="app.deleteStay('${x.id}')">Delete</button></div></div>`).join('')||'<div class="empty-template">No stay booking saved yet.</div>'
}
function shareStay(id){const x=(db.travelStays||[]).find(a=>a.id===id);if(x)shareText(`STAY BOOKING\n${x.name}\n${x.city}\nBooking: ${x.booking||'-'}\nCheck-in: ${x.checkin||'-'}\nCheck-out: ${x.checkout||'-'}\nRoom: ${x.room||'-'}\nContact: ${x.contactName||'-'} ${x.contactPhone||''}\nFacilities: ${x.facilities||'-'}`,'Stay Booking')}
function deleteStay(id){if(confirm('Delete saved stay?')){db.travelStays=(db.travelStays||[]).filter(x=>x.id!==id);save();renderStayBookings();updateTravelReadiness()}}

async function saveTravelDocument(){
  const f=$('#td_file').files?.[0]; const type=$('#td_type').value,label=$('#td_label').value.trim()||type,number=$('#td_number').value.trim(),expiry=$('#td_expiry').value,note=$('#td_note').value.trim();
  if(!f){alert('Choose an image or PDF first.');return}
  const fileId='traveldoc_'+uid();
  await putFile({id:fileId,category:'Travel / Seminar',taskId:'',note:`TRAVEL VAULT • ${type} • ${note}`,name:f.name,type:f.type,size:f.size,date:today(),blob:f});
  const meta={id:uid(),fileId,type,label,number,expiry,note,name:f.name,size:f.size,savedAt:new Date().toISOString(),cloudStatus:'Local only'};
  db.travelDocs.push(meta);save();$('#td_file').value='';$('#td_status').textContent='✅ Saved locally. Attempting optional encrypted-account cloud file backup if Firebase Storage is available…';
  try{
    if(window.SAOCloudFiles?.uploadTravelDocument){
      const res=await window.SAOCloudFiles.uploadTravelDocument(fileId,f,{type,label,name:f.name});
      if(res?.path){meta.cloudPath=res.path;meta.cloudStatus='Cloud backed up';save();$('#td_status').textContent='✅ Saved locally + cloud file backup complete.'}
    }
  }catch(e){console.warn(e);$('#td_status').textContent='✅ Saved locally. Cloud file backup unavailable; structured metadata still syncs.'}
  renderTravelDocs();updateTravelReadiness();
}
async function renderTravelDocs(){
  const box=$('#td_list');if(!box)return;
  box.innerHTML=(db.travelDocs||[]).slice().reverse().map(x=>`<div class="travel-doc-card"><div class="travel-doc-icon">${docIcon(x.type)}</div><div><b>${esc(x.label)}</b><span>${esc(x.type)}${x.number?` • ${esc(x.number)}`:''}${x.expiry?` • valid to ${esc(x.expiry)}`:''}</span><small>${esc(x.cloudStatus||'Local only')} • ${esc(x.name||'')}</small></div><div class="saved-template-actions"><button type="button" class="ghost" onclick="app.openTravelDoc('${x.id}')">Open</button><button type="button" class="ghost" onclick="app.shareTravelDoc('${x.id}')">Share</button><button type="button" class="ghost" onclick="app.downloadTravelDoc('${x.id}')">Download</button><button type="button" class="ghost danger-lite" onclick="app.deleteTravelDoc('${x.id}')">Delete</button></div></div>`).join('')||'<div class="empty-template">No travel document saved yet.</div>'
}
function docIcon(t){if(/Aadhaar|PAN|Licence|Passport|RC/.test(t))return '🪪';if(/ISKCON/.test(t))return '🛕';if(/Insurance/.test(t))return '🛡️';if(/Ticket/.test(t))return '🎟️';if(/Medical/.test(t))return '🩺';return '📄'}
async function openTravelDoc(id){const x=db.travelDocs.find(a=>a.id===id);if(!x)return;let f=await getFile(x.fileId);if(!f&&x.cloudPath&&window.SAOCloudFiles?.downloadTravelDocument){try{const blob=await window.SAOCloudFiles.downloadTravelDocument(x.cloudPath);if(blob){await putFile({id:x.fileId,category:'Travel / Seminar',taskId:'',note:'Restored from cloud',name:x.name||'travel-document',type:blob.type,size:blob.size,date:today(),blob});f=await getFile(x.fileId)}}catch(e){}}if(f)window.open(URL.createObjectURL(f.blob),'_blank');else alert('File is not on this device and cloud restore was unavailable.')}
async function downloadTravelDoc(id){const x=db.travelDocs.find(a=>a.id===id);if(!x)return;await openTravelDoc(id);const f=await getFile(x.fileId);if(f){const a=document.createElement('a');a.href=URL.createObjectURL(f.blob);a.download=f.name;a.click()}}
async function shareTravelDoc(id){const x=db.travelDocs.find(a=>a.id===id);if(!x)return;let f=await getFile(x.fileId);if(f&&navigator.share&&navigator.canShare?.({files:[new File([f.blob],f.name,{type:f.type})]})){try{await navigator.share({title:x.label,text:`${x.type}${x.number?` • ${x.number}`:''}`,files:[new File([f.blob],f.name,{type:f.type})]});return}catch(e){if(e?.name==='AbortError')return}}shareText(`${x.label}\n${x.type}\nReference: ${x.number||'-'}\nExpiry: ${x.expiry||'-'}`,'Travel Document')}
async function deleteTravelDoc(id){const x=db.travelDocs.find(a=>a.id===id);if(!x)return;if(confirm('Delete this travel document from this device record?')){try{await delFile(x.fileId)}catch(e){}db.travelDocs=db.travelDocs.filter(a=>a.id!==id);save();renderTravelDocs();updateTravelReadiness()}}
async function pickTravelContact(){
  if(!navigator.contacts?.select){
    alert('Direct phone contact access is not supported in this browser. Use CSV/VCF import in Referral Network → Doctors / PRO / Staff, or add the contact manually.');
    return
  }
  try{const a=await navigator.contacts.select(['name','tel'],{multiple:false});if(a?.[0]){$('#td_note').value=[a[0].name?.[0],a[0].tel?.[0]].filter(Boolean).join(' • ')}}catch(e){}
}

function saveEmergencyContact(){
  const x={id:uid(),name:$('#ec_name').value.trim(),role:$('#ec_role').value.trim(),phone:$('#ec_phone').value.trim(),priority:$('#ec_priority').value,savedAt:new Date().toISOString()};if(!x.name||!x.phone){alert('Enter contact name and phone.');return}db.emergencyContacts.push(x);save();renderEmergencyContacts();updateTravelReadiness()
}
function renderEmergencyContacts(){
  const box=$('#ec_list');if(!box)return;
  const rank={'Top 10':1,'Top 50':2,'Normal':3};
  box.innerHTML=(db.emergencyContacts||[]).slice().sort((a,b)=>(rank[a.priority]||9)-(rank[b.priority]||9)).map(x=>`<div class="emergency-line"><div><b>${esc(x.name)}</b><span>${esc(x.role||'')} • ${esc(x.priority)}</span></div><a href="tel:${esc(x.phone)}">${esc(x.phone)}</a><button type="button" class="ghost danger-lite" onclick="app.deleteEmergencyContact('${x.id}')">×</button></div>`).join('')||'<div class="empty-template">No emergency contact saved yet.</div>'
}
function deleteEmergencyContact(id){db.emergencyContacts=(db.emergencyContacts||[]).filter(x=>x.id!==id);save();renderEmergencyContacts();updateTravelReadiness()}
async function pickEmergencyContacts(){
  if(!navigator.contacts?.select){
    alert('This desktop/browser cannot directly read phone contacts. Use manual entry or import selected contacts from CSV/VCF in the Referral Network.');
    return
  }
  try{const a=await navigator.contacts.select(['name','tel'],{multiple:true});for(const c of a||[]){const name=c.name?.[0]||'Contact',phone=c.tel?.[0]||'';if(phone)db.emergencyContacts.push({id:uid(),name,role:'Imported selected contact',phone,priority:'Top 50',savedAt:new Date().toISOString()})}save();renderEmergencyContacts();updateTravelReadiness()}catch(e){}
}
function saveTravelFinance(){
  const last4=$('#tf_last4').value.trim();if(last4&&!/^\d{4}$/.test(last4)){alert('Use only the last 4 digits. Do not store a full card number.');return}
  const x={id:uid(),bank:$('#tf_bank').value.trim(),name:$('#tf_name').value.trim(),last4,help:$('#tf_help').value.trim(),fallback:$('#tf_fallback').value,cash:$('#tf_cash').value,note:$('#tf_note').value.trim(),savedAt:new Date().toISOString()};if(!x.bank&&!x.name){alert('Enter bank or payment method.');return}db.travelFinance.push(x);save();renderTravelFinance();updateTravelReadiness()
}
function renderTravelFinance(){
  const box=$('#tf_list');if(!box)return;
  box.innerHTML=(db.travelFinance||[]).map(x=>`<div class="emergency-line"><div><b>${esc(x.bank||x.name)}</b><span>${esc(x.name||'')}${x.last4?` • •••• ${esc(x.last4)}`:''} • ${esc(x.fallback||'')}</span></div><span>${x.help?`☎ ${esc(x.help)}`:''}</span><button type="button" class="ghost danger-lite" onclick="app.deleteTravelFinance('${x.id}')">×</button></div>`).join('')||'<div class="empty-template">No recovery payment method saved yet.</div>'
}
function deleteTravelFinance(id){db.travelFinance=(db.travelFinance||[]).filter(x=>x.id!==id);save();renderTravelFinance();updateTravelReadiness()}
function buildEmergencyPack(){
  const contacts=(db.emergencyContacts||[]).map(x=>`${x.priority} • ${x.name} (${x.role||'-'}): ${x.phone}`).join('\n')||'No emergency contacts saved.';
  const finance=(db.travelFinance||[]).map(x=>`${x.bank||x.name} ${x.name||''}${x.last4?` ••••${x.last4}`:''} | Help: ${x.help||'-'} | Fallback: ${x.fallback||'-'} | Cash reserve: ₹${x.cash||0}`).join('\n')||'No recovery method saved.';
  return `SAO TRAVEL — EMERGENCY & RECOVERY PACK

ESSENTIAL CONTACTS
${contacts}

FINANCIAL RECOVERY (MASKED)
${finance}

DOCUMENT RECOVERY
Use DigiLocker / MyAadhaar where applicable. Keep only masked/reference data in shared copies.

FIRST ACTIONS IF PHONE/WALLET IS LOST
1. Move to a safe place and contact a trusted person.
2. Block SIM/payment instruments using official channels.
3. Use secondary payment/cash/family transfer.
4. Access DigiLocker or cloud-backed travel documents on a trusted device.
5. Re-check current bookings, stay contact and onward journey.`
}
function buildTripPackSummary(){
  return `${buildFullTravelSummary()}

LATEST STAYS
${(db.travelStays||[]).slice(-3).map(x=>`${x.name||x.type} • ${x.city||'-'} • ${x.checkin||'-'} → ${x.checkout||'-'} • ${x.contactPhone||''}`).join('\n')||'None'}

TRAVEL DOCUMENT INDEX
${(db.travelDocs||[]).map(x=>`${x.type}: ${x.label}${x.number?` • ${x.number}`:''}${x.expiry?` • valid to ${x.expiry}`:''}`).join('\n')||'None'}

${buildEmergencyPack()}`
}
function updateTravelReadiness(){
  const el=$('#travelReadinessScore');if(!el)return;
  let score=0;
  const d=captureCurrentTravelBasics();
  if(d.origin&&d.place)score+=20;if(d.startDate)score+=10;if(d.trainNo||d.busNo)score+=15;
  if((db.travelStays||[]).length)score+=15;if((db.travelDocs||[]).length>=2)score+=15;if((db.emergencyContacts||[]).length>=2)score+=15;if((db.travelFinance||[]).length)score+=10;
  el.textContent=Math.min(score,100)+'%';
}
function getJourneyTemplates(){
  try{return JSON.parse(localStorage.getItem('saoTravelJourneyTemplatesV1')||'[]')}catch(e){return[]}
}
function setJourneyTemplates(x){
  localStorage.setItem('saoTravelJourneyTemplatesV1',JSON.stringify(x||[]));
}
function showSavedJourneyTemplates(){
  const box=$('#tr_saved_template_list'); if(!box)return;
  const list=getJourneyTemplates();
  if(!list.length){box.innerHTML='<div class="empty-template">No reusable journey saved yet.</div>';return}
  box.innerHTML=list.slice().reverse().map(x=>`<div class="saved-template-card">
    <div><b>${esc(x.name||`${x.origin||''} → ${x.place||''}`)}</b><span>${esc(x.origin||'')} → ${esc(x.place||'')} ${x.mode?`• ${esc(x.mode)}`:''}</span></div>
    <div class="saved-template-actions">
      <button type="button" class="ghost" onclick="app.loadTravelTemplate('${x.id}')">Load</button>
      <button type="button" class="ghost" onclick="app.shareTravelTemplate('${x.id}')">Share</button>
      <button type="button" class="ghost danger-lite" onclick="app.deleteTravelTemplate('${x.id}')">Delete</button>
    </div>
  </div>`).join('');
}
function captureCurrentTravelBasics(){
  return {
    origin:$('#tr_origin')?.value.trim()||$('#tr_discovery_from')?.value.trim()||'',
    place:$('#tr_place')?.value.trim()||$('#tr_discovery_to')?.value.trim()||'',
    mode:$('#tr_mode')?.value||'',
    startDate:$('#tr_start')?.value||$('#tr_discovery_date')?.value||'',
    returnDate:$('#tr_return')?.value||'',
    trainNo:$('#tr_train_no')?.value.trim()||'',trainName:$('#tr_train_name')?.value.trim()||'',pnr:$('#tr_pnr')?.value.trim()||'',
    trainTicketStatus:$('#tr_train_ticket_status')?.value||'',trainQuota:$('#tr_train_quota')?.value||'',journeyDate:$('#tr_journey_date')?.value||'',
    trainClass:$('#tr_train_class')?.value||'',coach:$('#tr_coach')?.value.trim()||'',seat:$('#tr_seat')?.value.trim()||'',berthType:$('#tr_berth_type')?.value||'',
    trainBoard:$('#tr_train_board')?.value.trim()||'',trainBoardCode:$('#tr_train_board_code')?.value.trim()||'',trainDest:$('#tr_train_dest')?.value.trim()||'',trainDestCode:$('#tr_train_dest_code')?.value.trim()||'',
    busOperator:$('#tr_bus_operator')?.value.trim()||'',busNo:$('#tr_bus_no')?.value.trim()||'',busType:$('#tr_bus_type')?.value||'',busTicketStatus:$('#tr_bus_ticket_status')?.value||'',busSeat:$('#tr_bus_seat')?.value.trim()||'',busDate:$('#tr_bus_date')?.value||'',busBoard:$('#tr_bus_board')?.value.trim()||'',busDrop:$('#tr_bus_drop')?.value.trim()||'',
    stayType:$('#tr_stay_type')?.value||'',stay:$('#tr_stay')?.value.trim()||'',foodType:$('#tr_food_type')?.value||'',sleepType:$('#tr_sleep_type')?.value||''
  }
}
function saveCurrentJourneyTemplate(){
  const d=captureCurrentTravelBasics();
  if(!d.origin||!d.place){alert('Enter origin and destination first.');return}
  const name=prompt('Name this reusable journey:',`${d.origin} → ${d.place}`); if(name===null)return;
  const list=getJourneyTemplates();
  list.push({...d,id:'jt_'+Date.now(),name:name.trim()||`${d.origin} → ${d.place}`,savedAt:new Date().toISOString()});
  setJourneyTemplates(list.slice(-30));
  showSavedJourneyTemplates();
  $('#tr_route_discovery_result').innerHTML=`✅ Reusable journey saved: <b>${esc(name.trim()||`${d.origin} → ${d.place}`)}</b>.`;
}
function loadTravelTemplate(id){
  const x=getJourneyTemplates().find(a=>a.id===id);if(!x)return;
  const set=(sel,val)=>{const el=$(sel);if(el && val!==undefined && val!==null)el.value=val};
  set('#tr_origin',x.origin);set('#tr_place',x.place);set('#tr_mode',x.mode);set('#tr_start',x.startDate);set('#tr_return',x.returnDate);
  set('#tr_discovery_from',x.origin);set('#tr_discovery_to',x.place);set('#tr_discovery_date',x.startDate);
  set('#tr_train_no',x.trainNo);set('#tr_train_name',x.trainName);set('#tr_pnr',x.pnr);set('#tr_train_ticket_status',x.trainTicketStatus);set('#tr_train_quota',x.trainQuota);
  set('#tr_journey_date',x.journeyDate);set('#tr_train_class',x.trainClass);set('#tr_coach',x.coach);set('#tr_seat',x.seat);set('#tr_berth_type',x.berthType);set('#tr_train_board',x.trainBoard);set('#tr_train_board_code',x.trainBoardCode);set('#tr_train_dest',x.trainDest);set('#tr_train_dest_code',x.trainDestCode);
  set('#tr_bus_operator',x.busOperator);set('#tr_bus_no',x.busNo);set('#tr_bus_type',x.busType);set('#tr_bus_ticket_status',x.busTicketStatus);set('#tr_bus_seat',x.busSeat);set('#tr_bus_date',x.busDate);set('#tr_bus_board',x.busBoard);set('#tr_bus_drop',x.busDrop);
  set('#tr_stay_type',x.stayType);set('#tr_stay',x.stay);set('#tr_food_type',x.foodType);set('#tr_sleep_type',x.sleepType);
  $('#tr_route_discovery_result').innerHTML=`✅ Loaded saved journey <b>${esc(x.name||'')}</b>. Edit only what changed, then save the trip.`;
}
function deleteTravelTemplate(id){
  if(!confirm('Delete this saved reusable journey?'))return;
  setJourneyTemplates(getJourneyTemplates().filter(x=>x.id!==id));showSavedJourneyTemplates();
}
function shareTravelTemplate(id){
  const x=getJourneyTemplates().find(a=>a.id===id);if(!x)return;
  shareText(`${x.name}\n${x.origin} → ${x.place}\nMode: ${x.mode||'-'}\nTrain: ${x.trainNo||'-'} ${x.trainName||''}\nBus: ${x.busOperator||'-'} ${x.busNo||''}`,'Saved Journey');
}
function copyDiscoveryToPlanner(){
  const a=$('#tr_discovery_from').value.trim(),b=$('#tr_discovery_to').value.trim(),d=$('#tr_discovery_date').value;
  $('#tr_origin').value=a;$('#tr_place').value=b;$('#tr_start').value=d;
  if($('#tr_journey_date')&&!$('#tr_journey_date').value)$('#tr_journey_date').value=d;
  if($('#tr_bus_date')&&!$('#tr_bus_date').value)$('#tr_bus_date').value=d;
  $('#tr_route_discovery_result').innerHTML='✅ Route details copied into the planner. Continue with train/bus/ticket details.';
}
async function discoverRouteHub(){
  const a=$('#tr_discovery_from').value.trim(),b=$('#tr_discovery_to').value.trim(),d=$('#tr_discovery_date').value,mode=$('#tr_discovery_mode').value;
  const box=$('#tr_route_discovery_result');
  if(!a||!b){alert('Enter From and To first.');return}
  box.textContent='🔎 Estimating route and preparing live search options…';
  try{
    const getGeo=async q=>{
      const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q+', India')}`,{headers:{'Accept':'application/json'}});
      const j=await r.json();return j?.[0]?{lat:+j[0].lat,lon:+j[0].lon,name:j[0].display_name}:null;
    };
    const [ga,gb]=await Promise.all([getGeo(a),getGeo(b)]);
    let dist='Unavailable';
    if(ga&&gb)dist=`~${haversineKm(ga.lat,ga.lon,gb.lat,gb.lon).toFixed(0)} km straight-line`;
    box.innerHTML=`<div class="route-summary-card"><b>${esc(a)} → ${esc(b)}</b>
      <span>📅 ${esc(d||'Date not selected')} • ${esc(mode)}</span>
      <span>📏 ${esc(dist)}</span>
      <small>Road/rail distance, journey duration, fares and actual available services must be confirmed on the booking provider.</small></div>
      <div class="route-search-shortcuts">
        <button type="button" class="ghost" onclick="app.searchLiveOption('train')">🚆 Search trains for this date</button>
        <button type="button" class="ghost" onclick="app.searchLiveOption('bus')">🚌 Search buses for this date</button>
        <button type="button" class="ghost" onclick="app.searchLiveOption('route')">🗺 Route & distance</button>
      </div>`;
  }catch(e){
    box.innerHTML='⚠ Could not estimate the route automatically. Your entered data is safe; use the booking/search buttons below.';
  }
}
function searchLiveOption(kind){
  const a=$('#tr_discovery_from')?.value.trim()||'',b=$('#tr_discovery_to')?.value.trim()||'',d=$('#tr_discovery_date')?.value||'';
  let q='';
  if(kind==='train')q=`${a} to ${b} trains ${d} availability train number timing fare`;
  if(kind==='bus')q=`${a} to ${b} buses ${d} operator sleeper seater timing fare`;
  if(kind==='route')q=`${a} to ${b} distance route travel time`;
  window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`,'_blank','noopener');
}
function openIRCTCBooking(){window.open('https://www.irctc.co.in/nget/train-search','_blank','noopener')}
function openRailOne(){window.open('https://play.google.com/store/apps/details?id=org.cris.aikyam','_blank','noopener')}
function openBookingSearch(kind){
  if(kind==='redbus')window.open('https://www.redbus.in/bus-tickets','_blank','noopener');
  if(kind==='paytm-bus')window.open('https://tickets.paytm.com/bus/','_blank','noopener');
  if(kind==='paytm-train')window.open('https://tickets.paytm.com/trains/','_blank','noopener');
}
function openGoogleRouteFromHub(){
  const a=$('#tr_discovery_from').value.trim(),b=$('#tr_discovery_to').value.trim();
  if(!a||!b){alert('Enter From and To first.');return}
  window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(a)}&destination=${encodeURIComponent(b)}`,'_blank','noopener');
}
function buildTrainSummary(){
  const d=captureCurrentTravelBasics();
  return `TRAIN JOURNEY
${d.origin||'-'} → ${d.place||'-'}
Train: ${d.trainNo||'-'} ${d.trainName||''}
PNR: ${d.pnr||'-'} | Status: ${d.trainTicketStatus||'-'}
Date: ${d.journeyDate||d.startDate||'-'} | Class: ${d.trainClass||'-'} | Quota: ${d.trainQuota||'-'}
Coach: ${d.coach||'-'} | Seat/Berth: ${d.seat||'-'} | Type: ${d.berthType||'-'}
Boarding: ${d.trainBoard||'-'} ${d.trainBoardCode||''}
Destination: ${d.trainDest||'-'} ${d.trainDestCode||''}`;
}
function buildBusSummary(){
  const d=captureCurrentTravelBasics();
  return `BUS JOURNEY
${d.origin||'-'} → ${d.place||'-'}
Operator: ${d.busOperator||'-'}
Bus / Service: ${d.busNo||'-'} | Type: ${d.busType||'-'}
Status: ${d.busTicketStatus||'-'} | Seat/Berth: ${d.busSeat||'-'}
Date: ${d.busDate||d.startDate||'-'}
Boarding: ${d.busBoard||'-'}
Dropping: ${d.busDrop||'-'}`;
}
function buildFullTravelSummary(){
  const d=captureCurrentTravelBasics();
  return `SAO WORKPLACE — COMPLETE TRAVEL PLAN
Route: ${d.origin||'-'} → ${d.place||'-'}
Start: ${d.startDate||'-'} | Return: ${d.returnDate||'-'} | Mode: ${d.mode||'-'}

${buildTrainSummary()}

${buildBusSummary()}

Stay: ${d.stayType||'-'} ${d.stay||''}
Food: ${d.foodType||'-'}
Sleep: ${d.sleepType||'-'}`;
}
function saveTrainSnapshot(){
  const x={id:'train_'+Date.now(),type:'train',summary:buildTrainSummary(),data:captureCurrentTravelBasics(),savedAt:new Date().toISOString()};
  const arr=JSON.parse(localStorage.getItem('saoSavedTravelSnapshotsV1')||'[]');arr.push(x);localStorage.setItem('saoSavedTravelSnapshotsV1',JSON.stringify(arr.slice(-100)));
  $('#tr_train_save_status').textContent='✅ Train details saved on this device. Complete Travel Plan save will also preserve the trip record.';
}
function saveBusSnapshot(){
  const x={id:'bus_'+Date.now(),type:'bus',summary:buildBusSummary(),data:captureCurrentTravelBasics(),savedAt:new Date().toISOString()};
  const arr=JSON.parse(localStorage.getItem('saoSavedTravelSnapshotsV1')||'[]');arr.push(x);localStorage.setItem('saoSavedTravelSnapshotsV1',JSON.stringify(arr.slice(-100)));
  $('#tr_bus_save_status').textContent='✅ Bus details saved on this device. Complete Travel Plan save will also preserve the trip record.';
}
async function shareText(text,title='SAO Workplace'){
  try{
    if(navigator.share){await navigator.share({title,text});return}
  }catch(e){if(e?.name==='AbortError')return}
  await copyText(text,'Sharing is not available here, so the details were copied.');
}
async function copyText(text,msg='Copied.'){
  try{await navigator.clipboard.writeText(text);alert(msg)}
  catch(e){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();alert(msg)}
}
function printTextCard(title,text){
  const w=window.open('','_blank','width=820,height=900');
  if(!w){alert('Pop-up blocked. Allow pop-ups for printing.');return}
  w.document.write(`<html><head><title>${esc(title)}</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#17324a}h1{font-size:24px}pre{white-space:pre-wrap;font:16px/1.5 Arial,sans-serif;border:1px solid #dfe7ec;border-radius:14px;padding:20px;background:#f9fcfe}</style></head><body><h1>${esc(title)}</h1><pre>${esc(text)}</pre><script>window.onload=()=>window.print()<\/script></body></html>`);
  w.document.close();
}
function openBusRouteSearch(){
  const a=$('#tr_bus_board').value.trim()||$('#tr_origin').value.trim(),b=$('#tr_bus_drop').value.trim()||$('#tr_place').value.trim(),op=$('#tr_bus_operator').value.trim();
  window.open(`https://www.google.com/search?q=${encodeURIComponent([a,'to',b,op,'bus schedule stops fare boarding dropping points'].filter(Boolean).join(' '))}`,'_blank','noopener');
}
function buildTrainMealPlan(){
  const journey=$('#tr_journey_date').value||$('#tr_start').value;
  const stops=collectTrainStops();
  if(!journey){alert('Enter date of journey first.');return}
  const meals=[
    ['Breakfast',$('#tr_breakfast_time').value],
    ['Lunch',$('#tr_lunch_time').value],
    ['Evening Snack',$('#tr_snack_time').value],
    ['Dinner',$('#tr_dinner_time').value]
  ];
  const source=$('#tr_train_food_source').value;
  const cards=[];
  meals.forEach(([name,time])=>{
    if(!time)return;
    const target=dtOf(journey,time); if(!target)return;
    const c=nearestTrainContext(target,stops);
    let where='Route context unavailable — add verified station times.';
    let action='Keep packed food / pantry as fallback.';
    if(c.kind==='station'){
      const s=c.stop; where=`Near ${s.station||'station'}${s.code?` (${s.code})`:''} • ${c.diffMin} min from meal time`;
      action=s.food||`Check IRCTC eCatering / station food availability for ${s.station||s.code||'this station'}.`;
    }else if(c.kind==='between'){
      where=`On train between ${c.prev.station||c.prev.code||'previous stop'} → ${c.next.station||c.next.code||'next stop'}`;
      action=`Plan delivery at ${c.next.station||c.next.code||'next suitable stop'} if available; otherwise use on-board/packed food.`;
    }else if(c.kind==='after'){
      where=`After ${c.prev.station||c.prev.code||'last entered stop'} — add later stoppages for better prediction.`;
    }else if(c.kind==='before'){
      where=`Before ${c.next.station||c.next.code||'first entered stop'}.`;
    }
    cards.push(`<div class="train-meal-card"><div class="train-meal-title"><b>${name}</b><span>${time}</span></div>
      <div class="train-meal-where">📍 ${esc(where)}</div>
      <div class="train-meal-source">🍱 Preferred: ${esc(source)}</div>
      <div class="train-meal-action">${esc(action)}</div></div>`);
  });
  $('#tr_train_meal_plan').innerHTML=cards.join('');
}
function openOfficialPNR(){
  window.open('https://indianrail.gov.in/enquiry/PNR/PnrEnquiry.html?locale=en','_blank','noopener');
}
function openTrainScheduleSearch(){
  const no=$('#tr_train_no').value.trim(),name=$('#tr_train_name').value.trim(),board=$('#tr_train_board').value.trim(),dest=$('#tr_train_dest').value.trim();
  const q=[no,name,board,'to',dest,'Indian Railways route schedule stoppages halt minutes'].filter(Boolean).join(' ');
  window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`,'_blank','noopener');
}
function openIRCTCEcatering(){
  window.open('https://www.ecatering.irctc.co.in/','_blank','noopener');
}
function openISKCONTrainFoodSearch(){
  const no=$('#tr_train_no').value.trim(),board=$('#tr_train_board').value.trim(),dest=$('#tr_train_dest').value.trim();
  const q=['ISKCON Govinda prasadam food on train',no,board,dest].filter(Boolean).join(' ');
  window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`,'_blank','noopener');
}
function openTravelSearch(kind){
  const city=$('#tr_place').value.trim(),locality=$('#tr_locality').value.trim();
  if(!city){alert('Enter destination city first.');return}
  let q='';
  if(kind==='stay')q=`hotel lodge guest house ${locality} ${city}`;
  if(kind==='iskcon')q=`ISKCON guest house ashram accommodation ${city}`;
  if(kind==='food')q=`pure vegetarian restaurant no onion garlic Jain food ${locality} ${city}`;
  if(kind==='govinda')q=`ISKCON Govinda restaurant prasadam tiffin ${city}`;
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`,'_blank','noopener');
}
function openLiveRouteSearch(){
  const a=$('#tr_origin').value.trim(),b=$('#tr_place').value.trim(),mode=$('#tr_mode').value;
  if(!a||!b){alert('Enter origin and destination first.');return}
  window.open(`https://www.google.com/search?q=${encodeURIComponent(a+' to '+b+' '+mode+' schedule fare availability')}`,'_blank','noopener');
}
function openNamedPlace(q){window.open(`https://www.google.com/maps/search/?api=1&query=${q}`,'_blank','noopener')}
function openTravelMap(){
  const city=$('#tr_place').value.trim(),locality=$('#tr_locality').value.trim();
  if(!city){alert('Enter destination city first.');return}
  const q=encodeURIComponent([locality,city].filter(Boolean).join(', '));
  window.open(`https://www.google.com/maps/search/?api=1&query=${q}`,'_blank','noopener');
}
function drawTravel(){
  const st=$('#travelStatusFilter')?.value||'',
    arr=(db.travel||[]).filter(x=>!st||x.status===st).sort((a,b)=>(a.startDate||'9999').localeCompare(b.startDate||'9999'));
  $('#travelList').innerHTML=arr.map(t=>{
    const stay=tripDays(t.stayStart||t.startDate,t.stayEnd||t.returnDate);
    const route=`${t.origin||'-'} → ${t.place||'-'} → ${t.origin||'-'}`;
    return `<div class="task-card travel-card p-${t.status==='Cancelled'?'red':'green'}">
      <div class="task-head"><div><div class="task-title">${esc(t.title)}</div>
      <div class="chips"><span class="chip blue">${esc(t.status)}</span><span class="chip">${esc(t.mode||'-')} out</span><span class="chip">${esc(t.returnMode||t.mode||'-')} return</span></div></div>
      <button onclick="app.editTravel('${t.id}')">Open Planner</button></div>
      <div class="travel-route-line">🧭 <b>${esc(route)}</b></div>
      <div class="task-meta">
        <div>Departure<b>${fmt(t.startDate)}</b></div><div>Stay<b>${stay.days?stay.days+' day(s) • '+stay.nights+' night(s)':'-'}</b></div>
        <div>Return<b>${fmt(t.returnDate)}</b></div><div>Cost<b>₹${(t.cost||0).toLocaleString()}</b></div>
      </div>
      <p class="muted"><b>Tickets:</b> ${esc(t.ticketStatus||'-')} • <b>With:</b> ${esc(t.withWhom||'-')} • <b>Local:</b> ${esc(t.localMode||'-')}</p>
      ${t.nearby?`<p class="muted"><b>Explore:</b> ${esc(t.nearby.split(/\n/).slice(0,4).join(' • '))}${t.nearby.split(/\n/).length>4?' …':''}</p>`:''}
    </div>`;
  }).join('')||'<p class="muted">No travel or seminar plan.</p>';
}

let interpretedTask=null;
function localInterpretCommand(text){
  const raw=(text||'').trim(), s=raw.toLowerCase();
  if(!raw)return null;
  let category='Other';
  if(/clinic|patient|doctor|opd|hospital/.test(s))category='Clinic Management';
  else if(/study|read|book|article|research|thesis|learn/.test(s))category=/research|thesis/.test(s)?'Research':'Student / Study';
  else if(/home|family|house|ghar/.test(s))category='Home';
  else if(/app|github|code|website|ai|software/.test(s))category='App Development & AI';
  else if(/bank|insurance|policy|loan/.test(s))category='Banking & Insurance';
  else if(/yoga|exercise|sleep|diet|health/.test(s))category='Health & Fitness';
  else if(/pooja|puja|japa|mala|sadhana|vrata|ekadashi|temple/.test(s))category='Spiritual / Sadhana';
  else if(/travel|seminar|flight|train|tour|darshan/.test(s))category='Travel / Seminar';

  let priority='Yellow';
  if(/urgent|critical|immediately|asap|red priority|very important/.test(s))priority='Red';
  else if(/high priority|important soon/.test(s))priority='Orange';
  else if(/routine|low priority|whenever/.test(s))priority='Green';

  let horizon='Today';
  if(/tomorrow|kal\b/.test(s))horizon='Tomorrow';
  else if(/next week|one week|1 week/.test(s))horizon='1 Week Later';
  else if(/next month|one month|1 month/.test(s))horizon='1 Month Later';
  else if(/three months|3 months/.test(s))horizon='3 Months Later';
  else if(/six months|6 months/.test(s))horizon='6 Months Later';
  else if(/one year|1 year|next year/.test(s))horizon='1 Year Later';
  else if(/someday|later sometime/.test(s))horizon='Someday / No Date';

  const mm=s.match(/(\d+)\s*(minute|min|minutes|mins)\b/); const hh=s.match(/(\d+(?:\.\d+)?)\s*(hour|hours|hr|hrs)\b/);
  const estimatedMinutes=mm?+mm[1]:(hh?Math.round(+hh[1]*60):0);
  let status='Idea / Capture';
  if(/start today/.test(s))status='Start Today';
  else if(/started today/.test(s))status='Started Today';
  else if(/waiting/.test(s))status='Waiting';
  else if(/pending/.test(s))status='Pending';
  else if(/need help|help me/.test(s))status='Need Help to Run';

  let title=raw.replace(/\b(today|tomorrow|next week|next month|urgent|critical|high priority|low priority|red priority|\d+\s*(minutes?|mins?|hours?|hrs?))\b/gi,' ').replace(/\s+/g,' ').trim();
  title=title.replace(/^(please\s+)?(remind me to|remember to|i need to|need to|please)\s+/i,'').trim();
  if(!title)title=raw;
  return {title,category,priority,horizon,status,estimatedMinutes,nextAction:title,notes:'Captured by SAO Smart Command',reminderDate:'',focus:false};
}
function showCommandPreview(){
  const el=$('#commandPreview'); if(!el)return;
  const t=interpretedTask;
  if(!t){el.innerHTML='<p class="muted">Enter a sentence, then choose Interpret & Preview.</p>';return}
  el.innerHTML=`<div class="preview-grid"><div><span>Task</span><b>${esc(t.title)}</b></div><div><span>Area</span><b>${esc(t.category)}</b></div><div><span>Priority</span><b>${esc(t.priority)}</b></div><div><span>Start</span><b>${esc(t.horizon)}</b></div><div><span>Status</span><b>${esc(t.status)}</b></div><div><span>Estimate</span><b>${t.estimatedMinutes||0} min</b></div></div>`;
}
function saveInterpretedTask(){
  if(!interpretedTask){alert('Please Interpret & Preview first.');return}
  const t=interpretedTask;
  db.tasks.push({id:uid(),project:'',startDate:'',dueDate:'',owner:'Self',context:'',tags:'',waitingFor:'',waitingContact:'',repeat:'None',progress:0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),...t});
  save(); alert('Smart task saved to SAO Workplace.'); interpretedTask=null; if($('#aiCommandInput'))$('#aiCommandInput').value=''; showCommandPreview(); renderAI();
}
function startVoiceCapture(targetSelector='#aiCommandInput'){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const state=$('#voiceState');
  if(!SR){if(state)state.textContent='Voice recognition is not supported in this browser. You can still type normally.';alert('Voice recognition is not supported in this browser.');return}
  const r=new SR(); r.lang='en-IN'; r.interimResults=false; r.maxAlternatives=1;
  if(state)state.textContent='Listening… speak your task naturally.';
  r.onresult=e=>{const text=e.results[0][0].transcript;const target=$(targetSelector);if(target)target.value=text;if(state)state.textContent='Voice captured. Review the text, then Interpret & Preview.';interpretedTask=localInterpretCommand(text);showCommandPreview()};
  r.onerror=e=>{if(state)state.textContent='Voice capture could not complete: '+e.error};
  r.start();
}
function buildDailyBrief(){
  const open=db.tasks.filter(t=>!isDone(t));
  const overdue=open.filter(t=>t.dueDate&&t.dueDate<today());
  const attention=open.filter(dueAttention).sort((a,b)=>priorityRank(a.priority)-priorityRank(b.priority)||horizonRank(a.horizon)-horizonRank(b.horizon));
  const top=attention.slice(0,3);
  const waiting=open.filter(t=>['Waiting','Need Help to Run','Need More Suggestion'].includes(t.status));
  const study=db.study.filter(s=>s.status!=='Done').length;
  const mins=attention.filter(t=>t.horizon==='Today'||t.dueDate===today()).reduce((s,t)=>s+(+t.estimatedMinutes||0),0);
  let lines=[];
  lines.push(`You have ${open.length} open task${open.length===1?'':'s'}, ${overdue.length} overdue, and ${attention.length} needing attention.`);
  if(top.length)lines.push('Top focus: '+top.map(t=>t.title).join(' • ')+'.');
  if(mins)lines.push(`Estimated planned workload today is about ${mins} minutes.`);
  if(waiting.length)lines.push(`${waiting.length} item${waiting.length===1?' is':'s are'} waiting or need help; follow-up may unlock progress.`);
  if(study)lines.push(`${study} study topic${study===1?' is':'s are'} still open.`);
  if(!open.length)lines.push('Your task list is clear. Use the time for review, recovery or long-term planning.');
  return lines;
}
function speakText(text){
  if(!('speechSynthesis' in window)){alert('Read-aloud is not supported in this browser.');return}
  speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text);u.lang='en-IN';u.rate=.96;speechSynthesis.speak(u);
}
function prepareMyDay(){
  const candidates=db.tasks.filter(t=>!isDone(t)).sort((a,b)=>priorityRank(a.priority)-priorityRank(b.priority)||horizonRank(a.horizon)-horizonRank(b.horizon)).slice(0,3);
  if(!candidates.length){alert('No open tasks to prepare.');return}
  if(!confirm('Mark the top 3 suggested tasks as Focus and Start Today?'))return;
  const ids=new Set(candidates.map(t=>t.id));
  db.tasks=db.tasks.map(t=>ids.has(t.id)?{...t,focus:true,horizon:'Today',status:t.status==='Idea / Capture'?'Start Today':t.status,updatedAt:new Date().toISOString()}:t);save();renderAI();alert('My Day prepared with top 3 focus tasks.');
}
let deferredInstallPrompt=null;
function updateInstallButtons(){
  const installed=window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
  ['#installAppBtn','#settingsInstallBtn'].forEach(sel=>{const b=$(sel);if(!b)return;if(installed){b.hidden=false;b.textContent='✓ App Installed';b.disabled=true}else{b.hidden=false;b.disabled=false;b.textContent='⬇ Install App'}});
}
async function installApp(){
  const installed=window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
  if(installed){alert('SAO Workplace is already installed on this device.');return}
  if(deferredInstallPrompt){deferredInstallPrompt.prompt();const choice=await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;updateInstallButtons();return}
  alert('Install option depends on your browser. In Chrome/Edge use the browser menu → Install app / Add to Home screen. On iPhone/iPad use Share → Add to Home Screen.');
}
function registerPWA(){
  if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js?v=5.0.0').catch(err=>console.warn('Service worker registration failed',err))}
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;updateInstallButtons()});
  window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;updateInstallButtons()});
  updateInstallButtons();
}
function dataHealth(){
  let localOk=true;try{localStorage.setItem('__sao_test','1');localStorage.removeItem('__sao_test')}catch(e){localOk=false}
  return {localOk,tasks:db.tasks.length,study:db.study.length,wellness:db.wellness.length,travel:db.travel.length,lastBackup:db.settings.lastBackupAt||''};
}
function renderAppHealth(){
  const el=$('#appHealth');if(!el)return;const h=dataHealth();const installed=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
  el.innerHTML=`<div class="health-grid"><div class="health-item ${h.localOk?'ok':'bad'}"><b>${h.localOk?'Healthy':'Problem'}</b><span>Local Data Storage</span></div><div class="health-item"><b>${h.tasks}</b><span>Tasks</span></div><div class="health-item"><b>${h.study}</b><span>Study Topics</span></div><div class="health-item"><b>${h.wellness}</b><span>Wellness Logs</span></div><div class="health-item"><b>${h.travel}</b><span>Travel Plans</span></div><div class="health-item ${installed?'ok':'warn'}"><b>${installed?'Installed':'Browser'}</b><span>App Mode</span></div><div class="health-item ${h.lastBackup?'ok':'warn'}"><b>${h.lastBackup?fmt(h.lastBackup.slice(0,10)):'Not Yet'}</b><span>Last Backup</span></div></div>`;
}
function applyTheme(){document.body.classList.toggle('dark-mode',db.settings.theme==='Dark')}

function ideaDefaults(){
  return {id:'',title:'',area:'App Development & AI',type:'New Idea',priority:'Medium',status:'New / Captured',
    horizon:'This Month',progress:0,reviewDate:'',reviewInterval:'1 Week',details:'',why:'',nextAction:'',
    reason:'',result:'',wentWell:'',gap:'',improve:'',rating:'Not rated',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
}
function daysAgoIso(days){const d=new Date();d.setDate(d.getDate()-days);return d.toISOString()}
function quickIdea(){
  showView('ideas');
  setTimeout(()=>{document.getElementById('ideaTitle')?.focus()},80);
}
function renderIdeas(){
  db.ideas=db.ideas||[];
  fillOptions($('#ideaStatusFilter'),IDEA_STATUSES,true,'All Status');
  fillOptions($('#ideaAreaFilter'),IDEA_AREAS,true,'All Areas');
  $('#newIdeaBtn').onclick=()=>{clearIdeaForm();$('#ideaTitle').focus()};
  $('#saveIdeaBtn').onclick=saveIdea;
  $('#clearIdeaBtn').onclick=clearIdeaForm;
  $('#ideaSearch').oninput=drawIdeas;
  $('#ideaStatusFilter').onchange=drawIdeas;
  $('#ideaAreaFilter').onchange=drawIdeas;
  $('#ideaStatementRefresh').onclick=drawIdeaStatement;
  $('#ideaStatementPeriod').onchange=drawIdeaStatement;
  $('#ideaPrintBtn').onclick=printIdeaStatement;
  $('#ideaShareBtn').onclick=shareIdeaStatement;
  $('#ideaCsvBtn').onclick=exportIdeasCsv;
  clearIdeaForm();
  drawIdeas();drawIdeaStatement();renderIdeaKpis();
}
function renderIdeaKpis(){
  const a=db.ideas||[];
  const values=[
    ['Total Ideas',a.length,'violet'],
    ['Working',a.filter(i=>i.status==='Working').length,'blue'],
    ['For Later',a.filter(i=>i.status==='For Later').length,'cyan'],
    ['Postponed',a.filter(i=>i.status==='Postponed').length,'neutral'],
    ['Completed',a.filter(i=>i.status==='Completed').length,'green'],
    ['Cancelled / Impossible',a.filter(i=>['Cancelled','Impossible'].includes(i.status)).length,'red']
  ];
  const el=$('#ideaKpis'); if(el)el.innerHTML=values.map(x=>`<div class="future-kpi ${x[2]}"><span>${x[0]}</span><b>${x[1]}</b><small>Idea register</small></div>`).join('');
}
function clearIdeaForm(){
  const d=ideaDefaults();
  const map={ideaId:'id',ideaTitle:'title',ideaArea:'area',ideaType:'type',ideaPriority:'priority',ideaStatus:'status',
    ideaHorizon:'horizon',ideaProgress:'progress',ideaReviewDate:'reviewDate',ideaReviewInterval:'reviewInterval',
    ideaDetails:'details',ideaWhy:'why',ideaNext:'nextAction',ideaReason:'reason',ideaResult:'result',
    ideaWentWell:'wentWell',ideaGap:'gap',ideaImprove:'improve',ideaRating:'rating'};
  Object.entries(map).forEach(([id,k])=>{const el=document.getElementById(id);if(el)el.value=d[k]??''});
  if($('#ideaEditorTitle'))$('#ideaEditorTitle').textContent='New Idea';
}
function readIdeaForm(){
  const get=id=>document.getElementById(id)?.value||'';
  return {
    id:get('ideaId')||uid(),title:get('ideaTitle').trim(),area:get('ideaArea'),type:get('ideaType'),
    priority:get('ideaPriority'),status:get('ideaStatus'),horizon:get('ideaHorizon'),
    progress:Math.max(0,Math.min(100,+get('ideaProgress')||0)),reviewDate:get('ideaReviewDate'),
    reviewInterval:get('ideaReviewInterval'),details:get('ideaDetails'),why:get('ideaWhy'),
    nextAction:get('ideaNext'),reason:get('ideaReason'),result:get('ideaResult'),wentWell:get('ideaWentWell'),
    gap:get('ideaGap'),improve:get('ideaImprove'),rating:get('ideaRating')
  };
}
function saveIdea(){
  const x=readIdeaForm();
  if(!x.title){alert('Please write the idea/title first.');$('#ideaTitle')?.focus();return}
  const existing=db.ideas.find(i=>i.id===x.id);
  if(existing){
    Object.assign(existing,x,{updatedAt:new Date().toISOString()});
  }else{
    db.ideas.push({...ideaDefaults(),...x,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
  }
  if(x.status==='Completed' && x.progress<100){
    const i=db.ideas.find(i=>i.id===x.id);if(i)i.progress=100;
  }
  save();renderIdeaKpis();drawIdeas();drawIdeaStatement();clearIdeaForm();
  alert('Idea saved in My Ideas & Creativity.');
}
function editIdea(id){
  const x=db.ideas.find(i=>i.id===id);if(!x)return;
  const map={ideaId:'id',ideaTitle:'title',ideaArea:'area',ideaType:'type',ideaPriority:'priority',ideaStatus:'status',
    ideaHorizon:'horizon',ideaProgress:'progress',ideaReviewDate:'reviewDate',ideaReviewInterval:'reviewInterval',
    ideaDetails:'details',ideaWhy:'why',ideaNext:'nextAction',ideaReason:'reason',ideaResult:'result',
    ideaWentWell:'wentWell',ideaGap:'gap',ideaImprove:'improve',ideaRating:'rating'};
  Object.entries(map).forEach(([elid,k])=>{const el=document.getElementById(elid);if(el)el.value=x[k]??''});
  $('#ideaEditorTitle').textContent='Edit Idea';
  document.querySelector('.idea-editor-card')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function deleteIdea(id){
  if(!confirm('Delete this idea permanently?'))return;
  db.ideas=db.ideas.filter(i=>i.id!==id);save();renderIdeaKpis();drawIdeas();drawIdeaStatement();
}
function ideaStatusClass(s){
  if(s==='Completed')return'idea-done';if(['Cancelled','Impossible'].includes(s))return'idea-stop';
  if(s==='Working')return'idea-working';if(['Postponed','For Later','Waiting'].includes(s))return'idea-later';return'idea-new';
}
function drawIdeas(){
  const q=($('#ideaSearch')?.value||'').toLowerCase(),status=$('#ideaStatusFilter')?.value||'',area=$('#ideaAreaFilter')?.value||'';
  const arr=(db.ideas||[]).filter(i=>(!q||[i.title,i.details,i.why,i.nextAction,i.result].join(' ').toLowerCase().includes(q))&&(!status||i.status===status)&&(!area||i.area===area)).sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''));
  $('#ideaList').innerHTML=arr.length?arr.map(i=>`<div class="idea-card ${ideaStatusClass(i.status)}">
    <div class="idea-card-head"><div><b>${esc(i.title)}</b><span>${esc(i.type)} • ${esc(i.area)}</span></div><span class="idea-status-pill">${esc(i.status)}</span></div>
    <div class="idea-progress"><i style="width:${Math.max(0,Math.min(100,+i.progress||0))}%"></i></div>
    <div class="idea-meta"><span>Priority: ${esc(i.priority)}</span><span>Progress: ${i.progress||0}%</span><span>Review: ${i.reviewDate?fmt(i.reviewDate):'Not set'}</span></div>
    ${i.nextAction?`<p><b>Next:</b> ${esc(i.nextAction)}</p>`:''}
    ${i.reason?`<p class="muted"><b>Reason:</b> ${esc(i.reason)}</p>`:''}
    <div class="actionrow"><button onclick="app.editIdea('${i.id}')">Open / Review</button><button class="ghost" onclick="app.deleteIdea('${i.id}')">Delete</button></div>
  </div>`).join(''):'<p class="muted">No idea saved yet. Use “Capture New Idea” the moment something comes to mind.</p>';
}
function ideaPeriodItems(){
  const v=$('#ideaStatementPeriod')?.value||'30';
  if(v==='all')return [...(db.ideas||[])];
  const cutoff=Date.now()-(+v)*86400000;
  return (db.ideas||[]).filter(i=>new Date(i.createdAt||i.updatedAt||0).getTime()>=cutoff);
}
function drawIdeaStatement(){
  const arr=ideaPeriodItems().sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
  const stats={working:arr.filter(i=>i.status==='Working').length,pending:arr.filter(i=>!['Completed','Cancelled','Impossible'].includes(i.status)).length,done:arr.filter(i=>i.status==='Completed').length,later:arr.filter(i=>i.status==='For Later').length,post:arr.filter(i=>i.status==='Postponed').length,cancel:arr.filter(i=>i.status==='Cancelled').length,impossible:arr.filter(i=>i.status==='Impossible').length};
  const el=$('#ideaStatement');if(!el)return;
  el.innerHTML=`<div class="idea-statement-summary">
    <span><b>${arr.length}</b>Ideas</span><span><b>${stats.working}</b>Working</span><span><b>${stats.pending}</b>Open</span><span><b>${stats.done}</b>Completed</span>
    <span><b>${stats.later}</b>Later</span><span><b>${stats.post}</b>Postponed</span><span><b>${stats.cancel}</b>Cancelled</span><span><b>${stats.impossible}</b>Impossible</span>
  </div>
  <div class="idea-table-wrap"><table class="summary-table idea-statement-table"><thead><tr><th>Date</th><th>Idea</th><th>Area</th><th>Status</th><th>Progress</th><th>Result / Feedback</th></tr></thead>
  <tbody>${arr.map(i=>`<tr><td>${new Date(i.createdAt).toLocaleDateString('en-IN')}</td><td><b>${esc(i.title)}</b><br><small>${esc(i.type)}</small></td><td>${esc(i.area)}</td><td>${esc(i.status)}</td><td>${i.progress||0}%</td><td>${esc(i.result||i.improve||i.reason||'-')}</td></tr>`).join('')||'<tr><td colspan="6">No ideas in this period.</td></tr>'}</tbody></table></div>`;
}
function ideaStatementText(){
  const arr=ideaPeriodItems();
  const period=$('#ideaStatementPeriod')?.selectedOptions?.[0]?.textContent||'Selected period';
  return `SAO Workplace — My Ideas & Creativity\n${period}\n\n`+arr.map((i,n)=>`${n+1}. ${i.title}\nArea: ${i.area}\nStatus: ${i.status}\nProgress: ${i.progress||0}%\nNext: ${i.nextAction||'-'}\nResult: ${i.result||'-'}\nImprovement: ${i.improve||'-'}\n`).join('\n');
}
function printIdeaStatement(){
  document.body.classList.add('printing-ideas');
  window.print();
  setTimeout(()=>document.body.classList.remove('printing-ideas'),800);
}
async function shareIdeaStatement(){
  const text=ideaStatementText();
  if(navigator.share)await navigator.share({title:'SAO Workplace — Ideas Progress Statement',text});
  else{await navigator.clipboard.writeText(text);alert('Ideas statement copied.')}
}
function exportIdeasCsv(){
  const h=['Created','Idea','Area','Type','Priority','Status','Horizon','Progress','Review Date','Review Interval','Details','Why Useful','Next Action','Reason','Result','Went Well','Gap','Improvement','Rating'];
  const rows=ideaPeriodItems().map(i=>[i.createdAt,i.title,i.area,i.type,i.priority,i.status,i.horizon,i.progress,i.reviewDate,i.reviewInterval,i.details,i.why,i.nextAction,i.reason,i.result,i.wentWell,i.gap,i.improve,i.rating]);
  download('SAO-Workplace-Ideas-'+today()+'.csv',[h,...rows].map(r=>r.map(x=>`"${String(x??'').replaceAll('"','""')}"`).join(',')).join('\n'),'text/csv');
}

function renderAI(){
  const open=db.tasks.filter(t=>!isDone(t)),overdue=open.filter(t=>t.dueDate&&t.dueDate<today()),red=open.filter(t=>t.priority==='Red'),waiting=open.filter(t=>['Waiting','Need Help to Run','Need More Suggestion'].includes(t.status)),longTerm=open.filter(t=>['3 Months Later','6 Months Later','1 Year Later','Someday / No Date'].includes(t.horizon)),todayWork=open.filter(t=>t.horizon==='Today'||t.dueDate===today()||t.reminderDate===today()),mins=todayWork.reduce((s,t)=>s+(+t.estimatedMinutes||0),0);
  $('#aiKpis').innerHTML=[['Critical',red.length,'red'],['Overdue',overdue.length,'orange'],['Waiting',waiting.length,'blue'],['Long-term',longTerm.length,'violet'],['Today Load',mins+'m','cyan'],['Open Work',open.length,'green']].map(x=>`<div class="future-kpi ${x[2]}"><span>${x[0]}</span><b>${x[1]}</b><small>Live planner analysis</small></div>`).join('');
  $('#aiAttention').innerHTML=buildDashboardInsight(open,overdue);
  const top=open.slice().sort((a,b)=>priorityRank(a.priority)-priorityRank(b.priority)||horizonRank(a.horizon)-horizonRank(b.horizon)).slice(0,5);
  $('#aiStrategy').innerHTML=`<ol class="ai-strategy-list">${top.map((t,i)=>`<li><b>${i+1}. ${esc(t.title)}</b><span>${esc(t.category)} • ${esc(t.nextAction||'Define the next concrete action')}</span></li>`).join('')||'<li>No open task. Use this time for review or recovery.</li>'}</ol>`;
  const areas=CATEGORIES.map(c=>({c,n:open.filter(t=>t.category===c).length})).filter(x=>x.n).sort((a,b)=>b.n-a.n).slice(0,8);
  $('#aiBalance').innerHTML=`<div class="balance-bars">${areas.map(x=>`<div><span>${esc(x.c)}</span><b>${x.n}</b><i style="--w:${Math.min(100,x.n/Math.max(1,areas[0]?.n||1)*100)}%"></i></div>`).join('')||'<p class="muted">No workload yet.</p>'}</div>`;
  const risks=[];if(overdue.length>=3)risks.push(`${overdue.length} overdue tasks indicate scheduling debt.`);if(waiting.length>=3)risks.push(`${waiting.length} blocked/waiting tasks may need delegation.`);if(longTerm.length>=5)risks.push(`${longTerm.length} long-term items risk becoming forgotten commitments.`);const untouched=open.filter(t=>t.updatedAt&&Math.floor((Date.now()-new Date(t.updatedAt))/86400000)>=14).length;if(untouched)risks.push(`${untouched} open task${untouched>1?'s':''} untouched for 14+ days.`);$('#aiRisks').innerHTML=risks.length?`<ul class="risk-list">${risks.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<div class="ai-clear-state">No major planning risk detected from current local data.</div>';
  const brief=buildDailyBrief();$('#smartDailyBrief').innerHTML=`<ul class="smart-brief-list">${brief.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
  $('#interpretCommandBtn').onclick=()=>{interpretedTask=localInterpretCommand($('#aiCommandInput').value);showCommandPreview()};
  $('#saveInterpretedBtn').onclick=saveInterpretedTask;$('#clearCommandBtn').onclick=()=>{$('#aiCommandInput').value='';interpretedTask=null;showCommandPreview()};
  $('#aiVoiceBtn').onclick=()=>startVoiceCapture('#aiCommandInput');$('#prepareDayBtn').onclick=prepareMyDay;$('#speakBriefBtn').onclick=()=>speakText(brief.join(' '));showCommandPreview();
}
function renderSummary(){const open=db.tasks.filter(t=>!isDone(t)),byPri=p=>open.filter(t=>t.priority===p),soon=open.filter(t=>['Today','Tomorrow','2-3 Days','1 Week Later'].includes(t.horizon));$('#masterSummary').innerHTML=`<div class="metric-grid"><div class="metric"><b>${open.length}</b><span>Open Tasks</span></div><div class="metric"><b>${byPri('Red').length}</b><span>Critical Red</span></div><div class="metric"><b>${soon.length}</b><span>Next 7 Days</span></div><div class="metric"><b>${db.study.filter(s=>s.status!=='Done').length}</b><span>Study Pending</span></div></div><div class="summary-section"><h4>Critical / Red Priority</h4>${summaryTasks(byPri('Red'))}</div><div class="summary-section"><h4>Start Today / Tomorrow / This Week</h4>${summaryTasks(soon)}</div><div class="summary-section"><h4>By Area</h4><div class="area-grid">${CATEGORIES.map(c=>{const n=open.filter(t=>t.category===c).length;return n?`<div class="area-box"><b>${n}</b><span>${esc(c)}</span></div>`:''}).join('')}</div></div><div class="summary-section"><h4>Status Snapshot</h4><div class="area-grid">${STATUSES.map(s=>{const n=db.tasks.filter(t=>t.status===s).length;return n?`<div class="area-box"><b>${n}</b><span>${esc(s)}</span></div>`:''}).join('')}</div></div>`;$('#printSummary').onclick=()=>window.print();$('#shareSummary').onclick=shareSummary}
function summaryTasks(a){return a.length?`<table class="summary-table"><thead><tr><th>Task</th><th>Area</th><th>Priority</th><th>Status</th><th>Start</th><th>Due</th></tr></thead><tbody>${a.slice(0,30).map(t=>`<tr><td>${esc(t.title)}</td><td>${esc(t.category)}</td><td>${esc(t.priority)}</td><td>${esc(t.status)}</td><td>${esc(t.horizon)}</td><td>${fmt(t.dueDate)}</td></tr>`).join('')}</tbody></table>`:'<p class="muted">None.</p>'}async function shareSummary(){const text=$('#masterSummary').innerText;if(navigator.share)await navigator.share({title:'SAO Workplace Summary',text});else{await navigator.clipboard.writeText(text);alert('Summary copied.')}}
let fileDB,picked=[];function openFileDB(){return new Promise((res,rej)=>{const r=indexedDB.open(FILE_DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('files',{keyPath:'id'});r.onsuccess=()=>{fileDB=r.result;res()};r.onerror=()=>rej(r.error)})}async function putFile(x){if(!fileDB)await openFileDB();return new Promise((res,rej)=>{const tx=fileDB.transaction('files','readwrite');tx.objectStore('files').put(x);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}async function allFiles(){if(!fileDB)await openFileDB();return new Promise((res,rej)=>{const r=fileDB.transaction('files').objectStore('files').getAll();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}async function getFile(id){return (await allFiles()).find(x=>x.id===id)}async function delFile(id){if(!fileDB)await openFileDB();return new Promise((res,rej)=>{const tx=fileDB.transaction('files','readwrite');tx.objectStore('files').delete(id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}
async function renderFiles(){fillOptions($('#fileCategory'),CATEGORIES);fillOptions($('#fileFilter'),CATEGORIES,true,'All Areas');$('#fileTask').innerHTML='<option value="">General / not linked</option>'+db.tasks.map(t=>`<option value="${t.id}">${esc(t.title)}</option>`).join('');picked=[];$('#fileInput').onchange=e=>{picked.push(...e.target.files);$('#pickedFiles').innerHTML=picked.map(f=>`<span class="filechip">${esc(f.name)}</span>`).join('')};$('#saveFiles').onclick=saveFiles;$('#fileFilter').onchange=drawFiles;drawFiles()}async function saveFiles(){if(!picked.length){alert('Select file(s).');return}for(const f of picked)await putFile({id:uid(),category:$('#fileCategory').value,taskId:$('#fileTask').value,note:$('#fileNote').value,name:f.name,type:f.type,size:f.size,date:today(),blob:f});picked=[];$('#pickedFiles').innerHTML='';$('#fileInput').value='';drawFiles()}async function drawFiles(){const filter=$('#fileFilter')?.value||'',a=(await allFiles()).filter(f=>!filter||f.category===filter).reverse();$('#filesList').innerHTML=a.map(f=>`<div class="fileitem"><b>${esc(f.name)}</b><div class="tiny muted">${esc(f.category)} • ${fmt(f.date)} • ${Math.round(f.size/1024)} KB</div><div>${esc(f.note||'')}</div><div class="actionrow"><button class="ghost" onclick="app.openFile('${f.id}')">Open</button><button class="ghost" onclick="app.downloadFile('${f.id}')">Download</button><button class="ghost" onclick="app.removeFile('${f.id}')">Delete</button></div></div>`).join('')||'<p class="muted">No file.</p>'}async function openFile(id){const f=await getFile(id);if(f)window.open(URL.createObjectURL(f.blob),'_blank')}async function downloadFile(id){const f=await getFile(id);if(!f)return;const a=document.createElement('a');a.href=URL.createObjectURL(f.blob);a.download=f.name;a.click()}async function removeFile(id){if(confirm('Delete file?')){await delFile(id);drawFiles()}}

const HEALTH_PROVIDER_TYPES=['Hospital','Multispeciality Hospital','Nursing Home','Diagnostic Centre','Pathology Lab','Imaging Centre','CT / MRI Centre','PET Scan Centre','Endoscopy / GI Centre','Biopsy / Histopathology','Microbiology / Culture','Blood Bank','Physiotherapy / Rehab','Other'];
const HEALTH_CONTACT_ROLES=['Consultant Doctor','Visiting Doctor','Owner / Director','Medical Superintendent','PRO','Referral Coordinator','Admission Desk','Reception','Nursing Staff','Dresser','Radiologist','Pathologist','Lab Technician','CT / MRI Technician','Endoscopy Staff','Insurance / TPA Desk','Ayushman Desk','Billing Desk','Ambulance','Other'];

function renderReferralNetwork(){
  const root=$('#view'); root.innerHTML=''; root.appendChild(tpl('referralsTpl'));
  fillOptions($('#ref_type_filter'),HEALTH_PROVIDER_TYPES,true,'All Provider Types');
  fillOptions($('#rp_type'),HEALTH_PROVIDER_TYPES);
  fillOptions($('#rc_role'),HEALTH_CONTACT_ROLES);
  $('#rp_verified').value=today(); $('#rc_verified').value=today(); $('#rr_date').value=today();
  bindReferralTabs(); bindReferralActions(); refreshReferralProviderSelects(); drawReferralNetwork(); updateReferralKpis();
  const picker=$('#rc_contact_picker');
  if(picker && !navigator.contacts?.select){picker.textContent='📱 Phone Picker unavailable here';picker.disabled=true;picker.title='Use CSV/VCF import or manual entry on this browser.'}
}
function bindReferralTabs(){
  $$('.referral-tabs button').forEach(b=>b.onclick=()=>{
    $$('.referral-tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');
    const key=b.dataset.refTab; $$('.ref-tab-pane').forEach(p=>p.hidden=true); $('#ref_tab_'+key).hidden=false;
  });
}
function bindReferralActions(){
  $('#ref_new_provider').onclick=()=>{switchRefTab('directory');clearProviderForm();$('#rp_name').focus()};
  $('#rp_save').onclick=saveHealthProvider; $('#rp_clear').onclick=clearProviderForm;
  $('#rc_save').onclick=saveHealthContact; $('#rc_clear').onclick=clearContactForm; $('#rc_import_btn').onclick=importHealthContactsFile; $('#rc_contact_picker').onclick=pickHealthContact;
  $('#rr_save').onclick=savePatientReferral; $('#rr_clear').onclick=clearReferralForm; $('#rr_share').onclick=()=>shareText(buildReferralFormSummary(),'Patient Referral'); $('#rr_print').onclick=()=>printTextCard('Patient Referral',buildReferralFormSummary()); $('#rr_attach').onclick=attachReferralFile;
  $('#ref_search').oninput=drawReferralNetwork; $('#ref_type_filter').onchange=drawReferralNetwork; $('#ref_status_filter').onchange=drawReferralNetwork;
  $('#ref_print_directory').onclick=()=>printTextCard('SAO Provider Directory',buildProviderDirectorySummary());
  $('#rr_provider').onchange=()=>refreshReferralContacts();
  $$('.diagnostic-service-filter button').forEach(b=>b.onclick=()=>drawDiagnosticNetwork(b.dataset.diag));
}
function switchRefTab(key){
  const b=$(`.referral-tabs button[data-ref-tab="${key}"]`); if(b)b.click()
}
function refreshReferralProviderSelects(){
  const opts=(db.healthProviders||[]).slice().sort((a,b)=>(a.status==='Active'?-1:1)-(b.status==='Active'?-1:1)||a.name.localeCompare(b.name));
  const html='<option value="">Select provider</option>'+opts.map(x=>`<option value="${x.id}">${esc(x.name)} • ${esc(x.city||'')}</option>`).join('');
  ['#rc_provider','#rr_provider'].forEach(s=>{const el=$(s);if(el){const old=el.value;el.innerHTML=html;el.value=old}});
  refreshReferralContacts();
}
function refreshReferralContacts(){
  const p=$('#rr_provider')?.value||'';
  const list=(db.healthContacts||[]).filter(x=>x.status==='Active'&&(!p||x.providerId===p));
  const el=$('#rr_contact');if(!el)return;el.innerHTML='<option value="">Select contacted person</option>'+list.map(x=>`<option value="${x.id}">${esc(x.name)} • ${esc(x.role)}${x.specialty?` • ${esc(x.specialty)}`:''}</option>`).join('');
}
function providerFromForm(){
  return {id:$('#rp_id').value||uid(),type:$('#rp_type').value,name:$('#rp_name').value.trim(),city:$('#rp_city').value.trim(),address:$('#rp_address').value.trim(),phone:$('#rp_phone').value.trim(),whatsapp:$('#rp_whatsapp').value.trim(),website:$('#rp_website').value.trim(),maps:$('#rp_maps').value.trim(),timings:$('#rp_timings').value.trim(),emergency:$('#rp_emergency').value.trim(),beds:+($('#rp_beds').value||0),doctorsCount:+($('#rp_doctors_count').value||0),owner:$('#rp_owner').value.trim(),bookingDesk:$('#rp_bookingdesk').value.trim(),ayushman:$('#rp_ayushman').value,insurance:$('#rp_insurance').value,status:$('#rp_status').value,verified:$('#rp_verified').value,specialties:$('#rp_specialties').value.trim(),services:$('#rp_services').value.trim(),schemes:$('#rp_schemes').value.trim(),notes:$('#rp_notes').value.trim(),updatedAt:new Date().toISOString()}
}
function saveHealthProvider(){
  const x=providerFromForm();if(!x.name){alert('Provider name is required.');return}
  const i=db.healthProviders.findIndex(a=>a.id===x.id); if(i>=0)db.healthProviders[i]=x; else db.healthProviders.push(x);
  save();clearProviderForm();refreshReferralProviderSelects();drawReferralNetwork();updateReferralKpis();
}
function clearProviderForm(){['#rp_id','#rp_name','#rp_city','#rp_address','#rp_phone','#rp_whatsapp','#rp_website','#rp_maps','#rp_timings','#rp_emergency','#rp_beds','#rp_doctors_count','#rp_owner','#rp_bookingdesk','#rp_specialties','#rp_services','#rp_schemes','#rp_notes'].forEach(s=>{const e=$(s);if(e)e.value=''});$('#rp_status').value='Active';$('#rp_verified').value=today();$('#ref_provider_title').textContent='Add Hospital / Diagnostic Centre'}
function editHealthProvider(id){
  const x=db.healthProviders.find(a=>a.id===id);if(!x)return;switchRefTab('directory');
  const set=(s,v)=>{const e=$(s);if(e)e.value=v??''};set('#rp_id',x.id);set('#rp_type',x.type);set('#rp_name',x.name);set('#rp_city',x.city);set('#rp_address',x.address);set('#rp_phone',x.phone);set('#rp_whatsapp',x.whatsapp);set('#rp_website',x.website);set('#rp_maps',x.maps);set('#rp_timings',x.timings);set('#rp_emergency',x.emergency);set('#rp_beds',x.beds);set('#rp_doctors_count',x.doctorsCount);set('#rp_owner',x.owner);set('#rp_bookingdesk',x.bookingDesk);set('#rp_ayushman',x.ayushman);set('#rp_insurance',x.insurance);set('#rp_status',x.status);set('#rp_verified',x.verified);set('#rp_specialties',x.specialties);set('#rp_services',x.services);set('#rp_schemes',x.schemes);set('#rp_notes',x.notes);$('#ref_provider_title').textContent='Edit Provider';$('#rp_name').scrollIntoView({behavior:'smooth',block:'center'})
}
function deleteHealthProvider(id){if(confirm('Delete provider? Staff/referral history will remain but lose its direct provider card link.')){db.healthProviders=db.healthProviders.filter(x=>x.id!==id);save();refreshReferralProviderSelects();drawReferralNetwork();updateReferralKpis()}}
function providerShareText(x){return `${x.name}\n${x.type} • ${x.city||'-'}\nAddress: ${x.address||'-'}\nPhone: ${x.phone||'-'}${x.whatsapp?`\nWhatsApp: ${x.whatsapp}`:''}\nTimings: ${x.timings||'-'}\nSpecialties: ${x.specialties||'-'}\nServices: ${x.services||'-'}\nAyushman: ${x.ayushman||'Unknown'} | Insurance/TPA: ${x.insurance||'Unknown'}\nWebsite: ${x.website||'-'}\nMap: ${x.maps||'-'}`}
function shareHealthProvider(id){const x=db.healthProviders.find(a=>a.id===id);if(x)shareText(providerShareText(x),'Hospital / Diagnostic Centre')}
function drawReferralNetwork(){
  const q=($('#ref_search')?.value||'').toLowerCase().trim(),type=$('#ref_type_filter')?.value||'',st=$('#ref_status_filter')?.value||'';
  const contactIndex=(db.healthContacts||[]).map(c=>({...c,providerName:db.healthProviders.find(p=>p.id===c.providerId)?.name||''}));
  const referralIndex=(db.patientReferrals||[]);
  const providers=(db.healthProviders||[]).filter(x=>{
    const extra=contactIndex.filter(c=>c.providerId===x.id).map(c=>`${c.name} ${c.role} ${c.specialty} ${c.phone}`).join(' ');
    const pts=referralIndex.filter(r=>r.providerId===x.id).map(r=>`${r.patient} ${r.reason}`).join(' ');
    const hay=`${x.name} ${x.type} ${x.city} ${x.address} ${x.specialties} ${x.services} ${x.owner} ${extra} ${pts}`.toLowerCase();
    return (!q||hay.includes(q))&&(!type||x.type===type)&&(!st||x.status===st)
  }).sort((a,b)=>(a.status==='Active'?0:1)-(b.status==='Active'?0:1)||a.name.localeCompare(b.name));
  const box=$('#rp_list');if(box)box.innerHTML=providers.map(x=>{
    const n=(db.healthContacts||[]).filter(c=>c.providerId===x.id&&c.status==='Active').length;
    return `<div class="provider-card ${x.status==='Inactive'?'inactive':''}">
      <div class="provider-head"><div><b>${esc(x.name)}</b><span>${esc(x.type)} • ${esc(x.city||'')}</span></div><span class="provider-status ${x.status.toLowerCase()}">${esc(x.status)}</span></div>
      <div class="provider-tags">${(x.specialties||'').split(/[,;\n]/).filter(Boolean).slice(0,5).map(s=>`<span>${esc(s.trim())}</span>`).join('')}</div>
      <div class="provider-meta">☎ ${esc(x.phone||'-')} • 👥 ${n} active contacts • 🛏 ${x.beds||0} beds • Ayushman: ${esc(x.ayushman||'Unknown')}</div>
      <div class="provider-actions">
        ${x.phone?`<a href="tel:${esc(x.phone)}">☎ Call</a>`:''}
        ${x.whatsapp?`<a target="_blank" rel="noopener" href="https://wa.me/${esc((x.whatsapp||'').replace(/\D/g,''))}">🟢 WhatsApp</a>`:''}
        ${x.maps?`<a target="_blank" rel="noopener" href="${esc(x.maps)}">📍 Map</a>`:''}
        ${x.website?`<a target="_blank" rel="noopener" href="${esc(x.website)}">🌐 Website</a>`:''}
        <button class="ghost" onclick="app.shareHealthProvider('${x.id}')">↗ Share</button>
        <button class="ghost" onclick="app.editHealthProvider('${x.id}')">Edit</button>
        <button class="ghost danger-lite" onclick="app.deleteHealthProvider('${x.id}')">Delete</button>
      </div></div>`
  }).join('')||'<p class="muted">No matching provider.</p>';
  drawHealthContacts(q);drawReferralWorklist(q);drawDiagnosticNetwork();
}
function contactFromForm(){return{id:$('#rc_id').value||uid(),providerId:$('#rc_provider').value,name:$('#rc_name').value.trim(),role:$('#rc_role').value,degree:$('#rc_degree').value.trim(),specialty:$('#rc_specialty').value.trim(),phone:$('#rc_phone').value.trim(),whatsapp:$('#rc_whatsapp').value.trim(),timing:$('#rc_timing').value.trim(),status:$('#rc_status').value,verified:$('#rc_verified').value,notes:$('#rc_notes').value.trim(),updatedAt:new Date().toISOString()}}
function saveHealthContact(){const x=contactFromForm();if(!x.name||!x.phone){alert('Name and phone are required.');return}const i=db.healthContacts.findIndex(a=>a.id===x.id);if(i>=0)db.healthContacts[i]=x;else db.healthContacts.push(x);save();clearContactForm();refreshReferralContacts();drawReferralNetwork();updateReferralKpis()}
function clearContactForm(){['#rc_id','#rc_name','#rc_degree','#rc_specialty','#rc_phone','#rc_whatsapp','#rc_timing','#rc_notes'].forEach(s=>{const e=$(s);if(e)e.value=''});$('#rc_status').value='Active';$('#rc_verified').value=today()}
function editHealthContact(id){const x=db.healthContacts.find(a=>a.id===id);if(!x)return;switchRefTab('contacts');const set=(s,v)=>{const e=$(s);if(e)e.value=v??''};set('#rc_id',x.id);set('#rc_provider',x.providerId);set('#rc_name',x.name);set('#rc_role',x.role);set('#rc_degree',x.degree);set('#rc_specialty',x.specialty);set('#rc_phone',x.phone);set('#rc_whatsapp',x.whatsapp);set('#rc_timing',x.timing);set('#rc_status',x.status);set('#rc_verified',x.verified);set('#rc_notes',x.notes)}
function deleteHealthContact(id){if(confirm('Delete contact?')){db.healthContacts=db.healthContacts.filter(x=>x.id!==id);save();refreshReferralContacts();drawReferralNetwork();updateReferralKpis()}}
function drawHealthContacts(q=''){
  const box=$('#rc_list');if(!box)return;const pmap=Object.fromEntries((db.healthProviders||[]).map(p=>[p.id,p]));
  const list=(db.healthContacts||[]).filter(x=>!q||`${x.name} ${x.role} ${x.degree} ${x.specialty} ${x.phone} ${pmap[x.providerId]?.name||''}`.toLowerCase().includes(q)).sort((a,b)=>(a.status==='Active'?0:1)-(b.status==='Active'?0:1)||a.name.localeCompare(b.name));
  box.innerHTML=list.map(x=>`<div class="contact-card ${x.status==='Inactive'?'inactive':''}"><div><b>${esc(x.name)}</b><span>${esc(x.role)}${x.specialty?` • ${esc(x.specialty)}`:''}${x.degree?` • ${esc(x.degree)}`:''}</span><small>${esc(pmap[x.providerId]?.name||'Unlinked provider')} • ${esc(x.timing||'')}</small></div><div class="contact-phone"><a href="tel:${esc(x.phone)}">${esc(x.phone)}</a>${x.whatsapp?`<a target="_blank" rel="noopener" href="https://wa.me/${esc(x.whatsapp.replace(/\D/g,''))}">WhatsApp</a>`:''}</div><div><span class="provider-status ${x.status.toLowerCase()}">${esc(x.status)}</span><button class="ghost" onclick="app.editHealthContact('${x.id}')">Edit</button><button class="ghost danger-lite" onclick="app.deleteHealthContact('${x.id}')">×</button></div></div>`).join('')||'<p class="muted">No contact saved.</p>'
}
async function pickHealthContact(){
  if(!navigator.contacts?.select){alert('Direct phone contact access is not supported in this browser. Use Import CSV / VCF instead.');return}
  try{const a=await navigator.contacts.select(['name','tel'],{multiple:false});if(a?.[0]){$('#rc_name').value=a[0].name?.[0]||'';$('#rc_phone').value=a[0].tel?.[0]||''}}catch(e){}
}
async function importHealthContactsFile(){
  const f=$('#rc_import_file').files?.[0];if(!f){alert('Choose a CSV or VCF file first.');return}
  const text=await f.text();let rows=[];
  if(/\.vcf$/i.test(f.name)||/BEGIN:VCARD/i.test(text)){
    const cards=text.split(/END:VCARD/i);for(const c of cards){const name=(c.match(/\nFN:(.+)/i)||[])[1]?.trim();const phone=(c.match(/\nTEL[^:]*:(.+)/i)||[])[1]?.trim();if(name&&phone)rows.push({name,phone})}
  }else{
    const lines=text.split(/\r?\n/).filter(Boolean);const head=(lines.shift()||'').split(',').map(x=>x.trim().toLowerCase());
    const ni=head.findIndex(x=>/name/.test(x)),pi=head.findIndex(x=>/phone|mobile|tel/.test(x)),ri=head.findIndex(x=>/role/.test(x)),si=head.findIndex(x=>/special/.test(x));
    for(const line of lines){const cols=line.split(',').map(x=>x.replace(/^"|"$/g,'').trim());if(cols[ni]&&cols[pi])rows.push({name:cols[ni],phone:cols[pi],role:cols[ri]||'Other',specialty:cols[si]||''})}
  }
  const providerId=$('#rc_provider').value;for(const r of rows){db.healthContacts.push({id:uid(),providerId,name:r.name,role:HEALTH_CONTACT_ROLES.includes(r.role)?r.role:'Other',degree:'',specialty:r.specialty||'',phone:r.phone,whatsapp:'',timing:'',status:'Active',verified:today(),notes:'Imported from '+f.name,updatedAt:new Date().toISOString()})}
  save();$('#rc_import_file').value='';refreshReferralContacts();drawReferralNetwork();updateReferralKpis();alert(`Imported ${rows.length} contact(s).`)
}
function referralFromForm(){return{id:$('#rr_id').value||uid(),patient:$('#rr_patient').value.trim(),patientId:$('#rr_patient_id').value.trim(),mobile:$('#rr_mobile').value.trim(),reason:$('#rr_reason').value.trim(),urgency:$('#rr_urgency').value,date:$('#rr_date').value,time:$('#rr_time').value,providerId:$('#rr_provider').value,consultant:$('#rr_consultant').value.trim(),contactId:$('#rr_contact').value,communication:$('#rr_communication').value,status:$('#rr_status').value,appt:$('#rr_appt').value,reminder:$('#rr_reminder').value,note:$('#rr_note').value.trim(),ward:$('#rr_ward').value.trim(),bed:$('#rr_bed').value.trim(),discharge:$('#rr_discharge').value,totalCost:+($('#rr_total_cost').value||0),schemePaid:+($('#rr_scheme_paid').value||0),insurancePaid:+($('#rr_insurance_paid').value||0),patientPaid:+($('#rr_patient_paid').value||0),discount:+($('#rr_discount').value||0),outcome:$('#rr_outcome').value.trim(),updatedAt:new Date().toISOString()}}
function savePatientReferral(){
  const x=referralFromForm();if(!x.patient||!x.reason){alert('Patient name and referral reason are required.');return}
  const old=db.patientReferrals.find(a=>a.id===x.id);if(old?.attachments)x.attachments=old.attachments;
  const i=db.patientReferrals.findIndex(a=>a.id===x.id);if(i>=0)db.patientReferrals[i]=x;else db.patientReferrals.push(x);
  if(x.reminder){db.tasks.push({id:uid(),title:`Referral follow-up: ${x.patient}`,category:'Doctor / Clinical',project:'Referral Network',priority:x.urgency==='Emergency'?'Red':x.urgency==='Urgent'?'Orange':'Yellow',status:'Waiting',horizon:'Custom Date',startDate:x.reminder.slice(0,10),dueDate:x.reminder.slice(0,10),reminderDate:x.reminder.slice(0,10),owner:'Dr Rajesh Sao',context:x.reason,tags:'referral follow-up',notes:`Follow up ${x.patient} referral status / appointment / admission.`})}
  save();clearReferralForm();drawReferralNetwork();updateReferralKpis();
}
function clearReferralForm(){['#rr_id','#rr_patient','#rr_patient_id','#rr_mobile','#rr_reason','#rr_consultant','#rr_note','#rr_ward','#rr_bed','#rr_total_cost','#rr_scheme_paid','#rr_insurance_paid','#rr_patient_paid','#rr_discount','#rr_outcome','#rr_appt','#rr_reminder','#rr_discharge'].forEach(s=>{const e=$(s);if(e)e.value=''});$('#rr_date').value=today();$('#rr_status').value='Planned';$('#rr_communication').value='Not contacted';$('#rr_file_status').textContent=''}
function editPatientReferral(id){const x=db.patientReferrals.find(a=>a.id===id);if(!x)return;switchRefTab('referrals');const set=(s,v)=>{const e=$(s);if(e)e.value=v??''};set('#rr_id',x.id);set('#rr_patient',x.patient);set('#rr_patient_id',x.patientId);set('#rr_mobile',x.mobile);set('#rr_reason',x.reason);set('#rr_urgency',x.urgency);set('#rr_date',x.date);set('#rr_time',x.time);set('#rr_provider',x.providerId);refreshReferralContacts();set('#rr_consultant',x.consultant);set('#rr_contact',x.contactId);set('#rr_communication',x.communication);set('#rr_status',x.status);set('#rr_appt',x.appt);set('#rr_reminder',x.reminder);set('#rr_note',x.note);set('#rr_ward',x.ward);set('#rr_bed',x.bed);set('#rr_discharge',x.discharge);set('#rr_total_cost',x.totalCost);set('#rr_scheme_paid',x.schemePaid);set('#rr_insurance_paid',x.insurancePaid);set('#rr_patient_paid',x.patientPaid);set('#rr_discount',x.discount);set('#rr_outcome',x.outcome)}
function deletePatientReferral(id){if(confirm('Delete referral record?')){db.patientReferrals=db.patientReferrals.filter(x=>x.id!==id);save();drawReferralNetwork();updateReferralKpis()}}
function referralSummary(x){
  const p=db.healthProviders.find(a=>a.id===x.providerId),c=db.healthContacts.find(a=>a.id===x.contactId);
  return `PATIENT REFERRAL SUMMARY
Patient: ${x.patient} ${x.patientId?`• ${x.patientId}`:''}
Mobile: ${x.mobile||'-'}
Reason: ${x.reason}
Urgency: ${x.urgency}
Referral: ${x.date||'-'} ${x.time||''}
Provider: ${p?.name||'-'} • ${p?.city||''}
Consultant/Department: ${x.consultant||'-'}
Contacted: ${c?.name||'-'} ${c?.role?`(${c.role})`:''} ${c?.phone||''}
Communication: ${x.communication}
Status: ${x.status}
Appointment/Admission: ${x.appt||'-'}
Ward/Bed: ${x.ward||'-'} / ${x.bed||'-'}
Clinical note: ${x.note||'-'}
Outcome/Treatment: ${x.outcome||'-'}
Total cost: ₹${x.totalCost||0}
Scheme: ₹${x.schemePaid||0} • Insurance: ₹${x.insurancePaid||0} • Patient paid: ₹${x.patientPaid||0} • Discount/Waiver: ₹${x.discount||0}`
}
function buildReferralFormSummary(){return referralSummary(referralFromForm())}
function sharePatientReferral(id){const x=db.patientReferrals.find(a=>a.id===id);if(x)shareText(referralSummary(x),'Patient Referral')}
function printPatientReferral(id){const x=db.patientReferrals.find(a=>a.id===id);if(x)printTextCard('Patient Referral',referralSummary(x))}
function drawReferralWorklist(q=''){
  const box=$('#rr_list');if(!box)return;const pmap=Object.fromEntries((db.healthProviders||[]).map(p=>[p.id,p]));
  const list=(db.patientReferrals||[]).filter(x=>!q||`${x.patient} ${x.reason} ${x.consultant} ${pmap[x.providerId]?.name||''} ${x.status}`.toLowerCase().includes(q)).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  box.innerHTML=list.map(x=>`<div class="referral-work-card"><div class="referral-work-head"><div><b>${esc(x.patient)}</b><span>${esc(x.reason)} • ${esc(x.urgency)}</span></div><span class="ref-status">${esc(x.status)}</span></div><div class="provider-meta">${fmt(x.date)} • ${esc(pmap[x.providerId]?.name||'Provider not selected')} • ${esc(x.consultant||'')}</div><div class="provider-actions"><button class="ghost" onclick="app.sharePatientReferral('${x.id}')">↗ Share</button><button class="ghost" onclick="app.printPatientReferral('${x.id}')">🖨 PDF</button><button class="ghost" onclick="app.editPatientReferral('${x.id}')">Edit</button><button class="ghost danger-lite" onclick="app.deletePatientReferral('${x.id}')">Delete</button></div></div>`).join('')||'<p class="muted">No referral records yet.</p>'
}
async function attachReferralFile(){
  const f=$('#rr_file').files?.[0];if(!f){alert('Choose referral/prescription PDF or image first.');return}
  let rid=$('#rr_id').value;if(!rid){const temp=referralFromForm();if(!temp.patient||!temp.reason){alert('Enter patient name and referral reason first.');return}rid=temp.id;$('#rr_id').value=rid;db.patientReferrals.push(temp);save()}
  const fileId='referral_'+uid();await putFile({id:fileId,category:'Doctor / Clinical',taskId:'',note:'Referral / prescription attachment',name:f.name,type:f.type,size:f.size,date:today(),blob:f});
  const r=db.patientReferrals.find(x=>x.id===rid);r.attachments=r.attachments||[];const meta={id:uid(),fileId,name:f.name,type:f.type,size:f.size,cloudStatus:'Local only'};r.attachments.push(meta);save();$('#rr_file').value='';$('#rr_file_status').textContent='✅ Referral file saved locally. Attempting cloud backup if available…';
  try{if(window.SAOCloudFiles?.uploadClinicalFile){const res=await window.SAOCloudFiles.uploadClinicalFile(fileId,f,{name:f.name,recordId:rid});if(res?.path){meta.cloudPath=res.path;meta.cloudStatus='Cloud backed up';save();$('#rr_file_status').textContent='✅ Referral file saved locally + cloud backup complete.'}}}catch(e){console.warn(e);$('#rr_file_status').textContent='✅ Saved locally. Cloud file backup unavailable; referral record metadata still syncs.'}
}
function drawDiagnosticNetwork(service=''){
  const box=$('#diagnostic_network_list');if(!box)return;
  const diagTypes=['Diagnostic Centre','Pathology Lab','Imaging Centre','CT / MRI Centre','PET Scan Centre','Endoscopy / GI Centre','Biopsy / Histopathology','Microbiology / Culture','Blood Bank'];
  let list=(db.healthProviders||[]).filter(x=>x.status==='Active'&&(diagTypes.includes(x.type)||/path|x-ray|xray|ct|mri|pet|endosc|biopsy|culture|blood bank/i.test(`${x.services} ${x.specialties}`)));
  if(service){const rx=new RegExp(service.replace('-','.?'),'i');list=list.filter(x=>rx.test(`${x.type} ${x.services} ${x.specialties}`))}
  box.innerHTML=list.map(x=>`<div class="diagnostic-card"><div><b>${esc(x.name)}</b><span>${esc(x.city||'')} • ${esc(x.type)}</span><small>${esc(x.services||x.specialties||'')}</small></div><div class="provider-actions">${x.phone?`<a href="tel:${esc(x.phone)}">☎ Call</a>`:''}${x.whatsapp?`<a target="_blank" rel="noopener" href="https://wa.me/${esc(x.whatsapp.replace(/\D/g,''))}">WhatsApp</a>`:''}<button class="ghost" onclick="app.shareHealthProvider('${x.id}')">Share</button></div></div>`).join('')||'<p class="muted">No matching diagnostic provider saved yet.</p>'
}
function updateReferralKpis(){
  const p=db.healthProviders||[],c=db.healthContacts||[],r=db.patientReferrals||[];
  const active=p.filter(x=>x.status==='Active').length,diag=p.filter(x=>/Diagnostic|Pathology|Imaging|CT|MRI|PET|Endoscopy|Biopsy|Culture|Blood Bank/i.test(x.type)).length,pending=r.filter(x=>!['Completed','Cancelled','Lost to follow-up'].includes(x.status)).length;
  const box=$('#ref_kpis');if(box)box.innerHTML=`<div class="metric"><b>${p.length}</b><span>Total Providers</span></div><div class="metric"><b>${active}</b><span>Active</span></div><div class="metric"><b>${c.filter(x=>x.status==='Active').length}</b><span>Active Contacts</span></div><div class="metric"><b>${diag}</b><span>Diagnostics</span></div><div class="metric"><b>${pending}</b><span>Open Referrals</span></div>`;
  if($('#referralNetworkCount'))$('#referralNetworkCount').textContent=p.length
}
function buildProviderDirectorySummary(){
  return (db.healthProviders||[]).filter(x=>x.status==='Active').map(providerShareText).join('\n\n---------------------------\n\n')||'No active providers saved.'
}


const PE_IDS="domain formality type orgtype name theme startdate starttime enddate endtime tithi city venue address map organizer coorganizer contact phone email url status priority with reason competing regopen early reglast latelast onspot category fee latefee tax paid paymode payref paydate regid batch cme feenotes refund chief guest trainer keynote speakers agenda paper poster abstract submission objectives handson route connect distance stayin stay local foodnotes attendance certstatus certno certdate useful skill learning change followup feedback recommend sr sl sf sh st sc".split(" ");
const PE_CHECKS="breakfast lunch snacks dinner kit material".split(" ");
function peVal(k){return $('#pe_'+k)?.value||''} function peSet(k,v){let e=$('#pe_'+k);if(e)e.value=v??''}
function peRecord(){let x={id:peVal('id')||uid(),updatedAt:new Date().toISOString()};PE_IDS.forEach(k=>x[k]=peVal(k));PE_CHECKS.forEach(k=>x[k]=!!$('#pe_'+k)?.checked);x.priorityScore=['sr','sl','sf','sh','st','sc'].reduce((a,k)=>a+(+x[k]||0),0);let old=db.professionalEvents.find(z=>z.id===x.id);if(old?.documents)x.documents=old.documents;return x}
function peInit(){let p=$('#proEventPanel'),t=$('#travelPrimary'),bt=$('#proTravelMode'),be=$('#proEventMode');if(!p)return;
 bt.onclick=()=>{p.hidden=true;if(t)t.hidden=false;bt.classList.add('active');be.classList.remove('active')};
 be.onclick=()=>{p.hidden=false;if(t)t.hidden=true;be.classList.add('active');bt.classList.remove('active');peDraw();peCount()};
 $$('.event-tabs button').forEach(b=>b.onclick=()=>{$$('.event-tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.pe-pane').forEach(x=>x.hidden=true);$('#petab_'+b.dataset.petab).hidden=false});
 ['sr','sl','sf','sh','st','sc'].forEach(k=>$('#pe_'+k)?.addEventListener('input',peScore));
 $('#pe_save').onclick=peSave;$('#pe_clear').onclick=peClear;$('#pe_share').onclick=()=>shareText(peSummary(peRecord()),'Professional Event');$('#pe_print').onclick=()=>printTextCard('Professional Event',peSummary(peRecord()));
 $('#pe_search').oninput=peDraw;$('#pe_fdomain').onchange=peDraw;$('#pe_fstatus').onchange=peDraw;$('#pe_attach').onclick=peAttach;$('#pe_autoread').onclick=peAutoRead;$('#pe_apply').onclick=peApply;$('#pe_discard').onclick=()=>{$('#pe_reviewbox').hidden=true;window.__peSug=null};
 if(!peVal('startdate'))peSet('startdate',today());peScore();peCount();peDraw()
}
function peScore(){let n=['sr','sl','sf','sh','st','sc'].reduce((a,k)=>a+(+peVal(k)||0),0),label=n>=24?'Excellent fit':n>=18?'Strong option':n>=12?'Compare carefully':'Low priority / incomplete';if($('#peScore'))$('#peScore').textContent=`Priority score: ${n} / 30 • ${label}`}
function peSave(){let x=peRecord();if(!x.name)return alert('Event / workshop name is required.');let i=db.professionalEvents.findIndex(z=>z.id===x.id);if(i>=0)db.professionalEvents[i]=x;else db.professionalEvents.push(x);save();peSet('id',x.id);peDraw();peCount();alert('Professional event saved successfully.')}
function peClear(){peSet('id','');PE_IDS.forEach(k=>{let e=$('#pe_'+k);if(!e)return;e.tagName==='SELECT'?e.selectedIndex=0:e.value=''});PE_CHECKS.forEach(k=>{let e=$('#pe_'+k);if(e)e.checked=false});['sr','sl','sf','sh','st','sc'].forEach(k=>peSet(k,0));peSet('startdate',today());if($('#pe_doclist'))$('#pe_doclist').innerHTML='';peScore()}
function peEdit(id){let x=db.professionalEvents.find(z=>z.id===id);if(!x)return;$('#proEventMode')?.click();peSet('id',x.id);PE_IDS.forEach(k=>peSet(k,x[k]));PE_CHECKS.forEach(k=>{let e=$('#pe_'+k);if(e)e.checked=!!x[k]});peScore();peDocs(id);scrollTo({top:0,behavior:'smooth'})}
function peDelete(id){if(confirm('Delete this professional event?')){db.professionalEvents=db.professionalEvents.filter(x=>x.id!==id);save();peDraw();peCount()}}
function peCount(){if($('#peCount'))$('#peCount').textContent=db.professionalEvents.length}
function peSummary(x){return `${x.domain} • ${x.formality} • ${x.type}
${x.name||'Untitled'}
Theme: ${x.theme||'-'}
Date/time: ${x.startdate||'-'} ${x.starttime||''} → ${x.enddate||'-'} ${x.endtime||''}
Tithi: ${x.tithi||'-'}
Venue: ${x.venue||'-'}, ${x.city||'-'}
Address: ${x.address||'-'}
Organizer: ${x.organizer||'-'} • ${x.orgtype||'-'}
Contact: ${x.contact||'-'} ${x.phone||''}
Registration: ${x.status||'-'} • ${x.category||'-'} • ID ${x.regid||'-'}
Deadline: Early ${x.early||'-'} • Regular ${x.reglast||'-'} • Late ${x.latelast||'-'} • On-spot ${x.onspot||'-'}
Fees: ₹${x.fee||0} + late ₹${x.latefee||0}; paid ₹${x.paid||0} by ${x.paymode||'-'} ${x.payref||''}
CME points: ${x.cme||'-'} • Priority ${x.priority||'-'} • score ${x.priorityScore||0}/30
Master trainer: ${x.trainer||'-'} • Keynote: ${x.keynote||'-'}
Speakers: ${x.speakers||'-'}
Agenda: ${x.agenda||'-'}
Paper/Poster: ${x.paper||'-'} / ${x.poster||'-'} • Abstract ${x.abstract||'-'} • ${x.submission||'-'}
Route/connectivity: ${x.route||'-'} • ${x.connect||'-'}
Stay: ${x.stayin||'-'} • ${x.stay||'-'}
Meals: Breakfast ${x.breakfast?'Yes':'No'} • Lunch ${x.lunch?'Yes':'No'} • Snacks ${x.snacks?'Yes':'No'} • Dinner ${x.dinner?'Yes':'No'} • Kit ${x.kit?'Yes':'No'}
Food notes: ${x.foodnotes||'-'}
Attendance: ${x.attendance||'-'} • Certificate ${x.certstatus||'-'} ${x.certno||''}
Learning: ${x.learning||'-'}
Practice/study change: ${x.change||'-'}
Feedback: ${x.feedback||'-'}`}
function peDraw(){let b=$('#pe_archive');if(!b)return;let q=(peValSearch()||'').toLowerCase(),d=$('#pe_fdomain')?.value||'',s=$('#pe_fstatus')?.value||'';let L=db.professionalEvents.filter(x=>(!q||`${x.name} ${x.city} ${x.organizer} ${x.trainer} ${x.keynote} ${x.speakers} ${x.theme}`.toLowerCase().includes(q))&&(!d||x.domain===d)&&(!s||x.status===s)).sort((a,b)=>(b.startdate||'').localeCompare(a.startdate||''));b.innerHTML=L.map(x=>`<div class="professional-event-card"><div class="provider-head"><div><b>${esc(x.name||'Untitled')}</b><span>${esc(x.type||'')} • ${esc(x.domain||'')} • ${esc(x.city||'')}</span></div><span class="ref-status">${esc(x.status||'')}</span></div><div class="provider-meta">${fmt(x.startdate)} → ${fmt(x.enddate)} • ${esc(x.organizer||'')} • Score ${x.priorityScore||0}/30</div><div class="provider-actions"><button class="ghost" onclick="app.peEdit('${x.id}')">Open / Edit</button><button class="ghost" onclick="app.peShare('${x.id}')">↗ Share</button><button class="ghost" onclick="app.pePrint('${x.id}')">🖨 PDF</button><button class="ghost danger-lite" onclick="app.peDelete('${x.id}')">Delete</button></div></div>`).join('')||'<p class="muted">No professional event saved yet.</p>'}
function peValSearch(){return $('#pe_search')?.value||''}
function peShare(id){let x=db.professionalEvents.find(z=>z.id===id);if(x)shareText(peSummary(x),'Professional Event')}
function pePrint(id){let x=db.professionalEvents.find(z=>z.id===id);if(x)printTextCard('Professional Event',peSummary(x))}
async function peAttach(){let f=$('#pe_file')?.files?.[0];if(!f)return alert('Choose a document first.');let id=peVal('id');if(!id){let x=peRecord();if(!x.name)return alert('Enter event name first.');db.professionalEvents.push(x);save();id=x.id;peSet('id',id)}let fid='pe_'+uid();await putFile({id:fid,category:'Travel & Seminar',taskId:'',note:peVal('doctype'),name:f.name,type:f.type,size:f.size,date:today(),blob:f});let e=db.professionalEvents.find(x=>x.id===id);e.documents=e.documents||[];e.documents.push({id:uid(),fileId:fid,name:f.name,docType:peVal('doctype'),size:f.size});save();$('#pe_file').value='';$('#pe_docstatus').textContent='✅ Document saved locally.';peDocs(id)}
function peDocs(id){let b=$('#pe_doclist');if(!b)return;let e=db.professionalEvents.find(x=>x.id===id),D=e?.documents||[];b.innerHTML=D.map(d=>`<div class="contact-card"><div><b>${esc(d.docType)}</b><span>${esc(d.name)}</span></div><div class="provider-actions"><button class="ghost" onclick="app.openFile('${d.fileId}')">Open</button><button class="ghost" onclick="app.downloadFile('${d.fileId}')">Download</button></div></div>`).join('')||'<p class="muted">No event documents saved.</p>'}
async function peAutoRead(){let f=$('#pe_file')?.files?.[0];if(!f)return alert('Choose brochure PDF/text first.');let text='';if(f.type==='text/plain')text=await f.text();else if(f.type==='application/pdf'){let raw=new TextDecoder('latin1').decode(new Uint8Array(await f.arrayBuffer()));text=(raw.match(/[\x20-\x7E]{6,}/g)||[]).join(' ').replace(/\s+/g,' ').slice(0,30000)}else{$('#pe_docstatus').textContent='Image OCR is not included in this offline stable build. Save the image and verify manually, or use a digital PDF/text brochure.';return}window.__peSug=peExtract(text);$('#pe_reviewbox').hidden=false;$('#pe_suggestions').value=JSON.stringify(window.__peSug,null,2);$('#pe_docstatus').textContent='✅ Suggestions ready — verify against original brochure.'}
function peExtract(t){t=(t||'').replace(/\s+/g,' ');let p=r=>((t.match(r)||[])[1]||'').trim();return{name:(t.match(/(?:CME|WORKSHOP|SEMINAR|CONFERENCE|HANDS-ON TRAINING)[^|]{0,120}/i)||[])[0]||'',date:p(/(?:date|on)\s*[:\-]?\s*((?:0?[1-9]|[12]\d|3[01])[\-\/.](?:0?[1-9]|1[0-2])[\-\/.](?:20)?\d{2})/i),phone:p(/(?:contact|mobile|phone)\s*[:\-]?\s*(\+?\d[\d\s-]{8,16})/i),email:p(/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i),fee:p(/(?:registration fee|delegate fee|fees?)\s*[:₹Rs.\s-]*([\d,]+)/i),venue:p(/(?:venue|place)\s*[:\-]\s*([^|]{4,100}?)(?=(?:date|time|contact|registration|fee|organised|organized|$))/i),organizer:p(/(?:organised by|organized by|organiser|organizer)\s*[:\-]\s*([^|]{3,120}?)(?=(?:venue|date|time|contact|registration|fee|$))/i),theme:p(/(?:theme|topic|aim)\s*[:\-]\s*([^|]{4,160}?)(?=(?:venue|date|time|contact|registration|fee|$))/i)}}
function peApply(){let s=window.__peSug||{},set=(k,v)=>{if(v&&!peVal(k))peSet(k,v)};set('name',s.name);set('phone',s.phone);set('email',s.email);set('venue',s.venue);set('organizer',s.organizer);set('theme',s.theme);set('fee',(s.fee||'').replace(/,/g,''));if(s.date){let a=s.date.split(/[-/.]/);if(a.length===3)set('startdate',`${a[2].length===2?'20'+a[2]:a[2]}-${a[1].padStart(2,'0')}-${a[0].padStart(2,'0')}`)}$('#pe_reviewbox').hidden=true;$('#pe_docstatus').textContent='✅ Suggestions applied. Verify every field before saving.'}

function renderBackup(){$('#backupBtn').onclick=()=>{db.settings.lastBackupAt=new Date().toISOString();save();download('SAO-Workplace-backup-'+today()+'.json',JSON.stringify(db,null,2),'application/json');};$('#restoreInput').onchange=async e=>{try{db=JSON.parse(await e.target.files[0].text());db.settings={...defaultSettings,...(db.settings||{})};db.reflections=db.reflections||[];db.tasks=db.tasks.map(t=>({estimatedMinutes:0,nextAction:'',waitingFor:'',waitingContact:'',repeat:'None',focus:false,progress:t.status==='Done'?100:0,...t}));save();alert('Restored.');showView('dashboard')}catch{alert('Invalid backup.')}};$('#csvBtn').onclick=()=>{const h=['Title','Area','Project','Priority','Status','Start Horizon','Start Date','Due Date','Reminder','Responsible','Context','Tags','Notes'];const rows=db.tasks.map(t=>[t.title,t.category,t.project,t.priority,t.status,t.horizon,t.startDate,t.dueDate,t.reminderDate,t.owner,t.context,t.tags,t.notes]);download('SAO-Workplace-tasks.csv',[h,...rows].map(r=>r.map(x=>`"${String(x??'').replaceAll('"','""')}"`).join(',')).join('\n'),'text/csv')}}function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click()}
function renderSettings(){
  $('#settingsForm').innerHTML=`<div class="formgrid"><label>App Name<input id="set_name" value="${esc(db.settings.appName)}"></label><label>Owner Name<input id="set_owner" value="${esc(db.settings.ownerName)}"></label><label>Daily Naam Japa Target<input id="set_japa" type="number" value="${db.settings.dailyJapaTarget}"></label><label>Week Starts<select id="set_week"><option>Monday</option><option ${db.settings.weekStarts==='Sunday'?'selected':''}>Sunday</option></select></label><label>Appearance<select id="set_theme"><option ${db.settings.theme!=='Dark'?'selected':''}>Soft Blue</option><option ${db.settings.theme==='Dark'?'selected':''}>Dark</option></select></label></div><div class="actionrow"><button id="saveSettings">Save Settings</button></div>`;
  $('#saveSettings').onclick=()=>{db.settings={...db.settings,appName:$('#set_name').value,ownerName:$('#set_owner').value,dailyJapaTarget:+$('#set_japa').value||5000,weekStarts:$('#set_week').value,theme:$('#set_theme').value};save();applyTheme();alert('Settings saved.')};
  renderAppHealth();updateInstallButtons();if($('#settingsInstallBtn'))$('#settingsInstallBtn').onclick=installApp;if($('#testDataBtn'))$('#testDataBtn').onclick=()=>{const h=dataHealth();alert(h.localOk?'Data health check passed. Local storage is working.':'Local storage test failed on this browser.');renderAppHealth()};$('#notificationState').textContent='Current permission: '+(window.Notification?Notification.permission:'Not supported');
  $('#notificationBtn').onclick=async()=>{if(!window.Notification){alert('Notifications not supported in this browser.');return}const p=await Notification.requestPermission();$('#notificationState').textContent='Current permission: '+p;if(p==='granted')new Notification('SAO Workplace',{body:'Notifications enabled. In-app due reminders will be shown while the app is active.'})};
}
function checkReminders(){const due=db.tasks.filter(t=>!isDone(t)&&t.reminderDate===today());if(!due.length)return;const key='sao_reminder_seen_'+today();if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');if(window.Notification&&Notification.permission==='granted')new Notification('SAO Workplace Reminder',{body:`${due.length} task${due.length===1?'':'s'} need attention today.`})}
function init(){
  document.documentElement.classList.toggle('touch-device', matchMedia('(pointer:coarse)').matches);
  document.documentElement.classList.toggle('standalone-mode', matchMedia('(display-mode:standalone)').matches || navigator.standalone===true);
  const setViewportClass=()=>{document.documentElement.dataset.viewport=innerWidth<700?'mobile':innerWidth<1100?'tablet':'desktop'};
  setViewportClass(); addEventListener('resize',()=>{clearTimeout(window.__saoResize);window.__saoResize=setTimeout(setViewportClass,120)},{passive:true});
applyTheme();registerPWA();openFileDB().catch(()=>{});$$('#nav button').forEach(b=>b.onclick=()=>showView(b.dataset.view));$('#quickAddBtn').onclick=openQuickAdd;$('#installAppBtn').onclick=installApp;$('#voiceQuickBtn').onclick=()=>{showView('ai');setTimeout(()=>startVoiceCapture('#aiCommandInput'),100)};$('#closeModal').onclick=closeQuick;$('#cancelQuick').onclick=closeQuick;$('#saveQuick').onclick=saveQuick;$('#globalSearch').onkeydown=e=>{if(e.key==='Enter'){showView('tasks');$('#taskSearch').value=e.target.value;drawTasks()}};document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openQuickAdd()}});showView('dashboard')}
return{peEdit,peDelete,peShare,pePrint,init,showView,openQuickAdd,quickIdea,openWorkspace,editTask,markDone,shareTask,deleteTask,editIdea,deleteIdea,editStudy,editTravel,openNamedPlace,loadTravelTemplate,shareTravelTemplate,deleteTravelTemplate,searchLiveOption,shareStay,deleteStay,openTravelDoc,downloadTravelDoc,shareTravelDoc,deleteTravelDoc,deleteEmergencyContact,deleteTravelFinance,editHealthProvider,deleteHealthProvider,shareHealthProvider,editHealthContact,deleteHealthContact,editPatientReferral,deletePatientReferral,sharePatientReferral,printPatientReferral,openFile,downloadFile,removeFile,reschedule,startVoiceCapture,installApp,getCloudSnapshot,applyCloudSnapshot};})();window.app = app;
document.addEventListener('DOMContentLoaded',app.init);
