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
db.tasks=db.tasks||[];db.study=db.study||[];db.wellness=db.wellness||[];db.travel=db.travel||[];db.ideas=db.ideas||[];db.settings={...defaultSettings,...(db.settings||{})};db.reflections=db.reflections||[];db.ideas=db.ideas||[];db.tasks=db.tasks.map(t=>({estimatedMinutes:0,nextAction:'',waitingFor:'',waitingContact:'',repeat:'None',focus:false,progress:t.status==='Done'?100:0,...t}));
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>(s??'').toString().replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
let currentView='dashboard';
const normalizeDb=x=>{
  x=x||{};
  x.tasks=x.tasks||[];x.study=x.study||[];x.wellness=x.wellness||[];x.travel=x.travel||[];x.ideas=x.ideas||[];
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
  board:['Status Board','A visual flow of ideas, active work, waiting and completion.'],ideas:['My Ideas & Creativity','Capture, develop, review and learn from every useful idea.'],study:['Study Planner','Plan what to learn, from where, when and how much.'],wellness:['Wellness & Sadhana','Track health habits, spiritual practice and seva.'],travel:['Travel & Seminar','Plan purpose, tickets, time, budget and nearby visits.'],review:['Review Center','Daily, weekly and monthly review of forgotten and blocked work.'],ai:['AI Insights','Smart local analysis, focus strategy and future-ready decision support.'],
  summary:['Master Summary','A single review of everything requiring your attention.'],files:['Files & Notes','Keep supporting documents linked to tasks and life areas.'],backup:['Backup / Restore','Protect your workplace data and move it between devices.'],settings:['Settings','Personal targets and app preferences.']};
function showView(name){currentView=name;
  try{
    const meta=titles[name]||titles.dashboard;
    $$('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
    $('#pageTitle').textContent=meta[0];$('#pageSubtitle').textContent=meta[1];
    const v=$('#view'), t=document.getElementById(name+'Tpl');
    if(!t){v.innerHTML='<div class="card"><h3>Section unavailable</h3><p class="muted">Please reload the latest app version.</p></div>';return}
    v.innerHTML='';v.appendChild(t.content.cloneNode(true));
    const renderers={dashboard:renderDashboard,myday:renderMyDay,tasks:renderTasks,board:renderBoard,ideas:renderIdeas,study:renderStudy,wellness:renderWellness,travel:renderTravel,review:renderReview,ai:renderAI,summary:renderSummary,files:renderFiles,backup:renderBackup,settings:renderSettings};
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
  if(key==='study'){
    $('#workspaceExtra').innerHTML=`<div class="card"><div class="cardhead"><div><h3>Study Topics</h3><p class="muted">Study Planner records are shown here too.</p></div><button class="ghost" onclick="app.showView('study')">Open Full Study Planner</button></div>${db.study.filter(s=>s.status!=='Done').map(s=>`<div class="timeline-item"><b>${esc(s.topic)}</b><span>${esc(s.sourceType)} • ${fmt(s.targetDate)} • ${esc(s.status)}</span></div>`).join('')||'<p class="muted">No study topic yet.</p>'}</div>`;
  }
}
function workspaceTaskRow(t){return `<div class="workspace-task-row"><div><b>${esc(t.title)}</b><span>${esc(t.category)} • ${esc(t.priority)} • ${esc(t.status)} • ${esc(t.horizon)}</span>${t.nextAction?`<small>Next: ${esc(t.nextAction)}</small>`:''}</div><div class="actionrow"><button class="ghost" onclick="app.editTask('${t.id}')">Edit</button><button class="ghost" onclick="app.markDone('${t.id}')">Done</button></div></div>`}
function showWorkspaceTasks(key){const w=WORKSPACES[key];showView('tasks');setTimeout(()=>{const f=$('#taskCategoryFilter');if(f&&w.categories.length===1){f.value=w.categories[0];drawTasks()}else if($('#taskSearch')){$('#taskSearch').value=w.categories.join(' ');drawTasks()}},10)}

function renderDashboard(){renderMainWorkspaceButtons();const open=db.tasks.filter(t=>!isDone(t)),attention=open.filter(dueAttention),overdue=open.filter(t=>t.dueDate&&t.dueDate<today()),dueToday=open.filter(t=>t.dueDate===today()||t.reminderDate===today()||t.horizon==='Today'),completed=db.tasks.filter(isDone).length,focus=open.filter(t=>t.focus).length,total=db.tasks.length||1;const focusScore=Math.max(0,Math.min(100,Math.round((completed/total)*45+Math.max(0,40-overdue.length*5)+Math.min(15,focus*5))));const hour=new Date().getHours(),greet=hour<12?'Good Morning':hour<17?'Good Afternoon':'Good Evening';$('#futureGreeting').textContent=`${greet}, ${db.settings.ownerName||'Dr Rajesh Sao'}`;$('#dashKpis').innerHTML=[['Total Tasks',db.tasks.length,'neutral'],['In Progress',open.filter(t=>['Work Started','Started Today'].includes(t.status)).length,'blue'],['Today',dueToday.length,'cyan'],['Overdue',overdue.length,'red'],['Completed',completed,'green'],['Focus Score',focusScore+'%','violet']].map(x=>`<div class="future-kpi ${x[2]}"><span>${x[0]}</span><b>${x[1]}</b><small>${x[0]==='Overdue'?'Needs attention':x[0]==='Focus Score'?'Adaptive score':'Live planner data'}</small></div>`).join('');$('#todayList').innerHTML=attention.sort((a,b)=>priorityRank(a.priority)-priorityRank(b.priority)).slice(0,7).map(t=>`<div class="future-action-row"><span class="priority-dot ${t.priority.toLowerCase()}"></span><div><b>${esc(t.title)}</b><small>${esc(t.category)} • ${esc(t.status)}</small></div><span class="future-chip">${esc(t.priority)}</span></div>`).join('')||'<p class="muted">No urgent action right now.</p>';$('#horizonBoard').innerHTML=HORIZONS.slice(0,6).map(h=>{const n=open.filter(t=>t.horizon===h).length;return `<div class="future-horizon"><span>${esc(h)}</span><b>${n}</b><i style="--w:${Math.min(100,n*14)}%"></i></div>`}).join('');drawPriorityChart($('#priorityChart'),open);$('#areaOverview').innerHTML=`<div class="future-area-grid">${CATEGORIES.map(c=>{const n=open.filter(t=>t.category===c).length;return n?`<div><b>${n}</b><span>${esc(c)}</span></div>`:''}).join('')}</div>`;$('#studyQueue').innerHTML=db.study.filter(x=>x.status!=='Done').slice(0,5).map(s=>`<div class="future-list-row"><div><b>${esc(s.topic)}</b><span>${esc(s.sourceType)} • ${esc(s.status)}</span></div><small>${s.targetDate?fmt(s.targetDate):'No date'}</small></div>`).join('')||'<p class="muted">No study topic planned.</p>';const w=db.wellness.find(x=>x.date===today());$('#wellnessToday').innerHTML=w?`<div class="future-wellness-grid"><div><b>${w.japa||0}</b><span>Naam Japa</span></div><div><b>${w.exercise||0}m</b><span>Exercise</span></div><div><b>${w.sleep||0}h</b><span>Sleep</span></div><div><b>${w.water||0}L</b><span>Water</span></div></div>`:'<p class="muted">No wellness log today.</p>';$('#aiDashboardInsight').innerHTML=buildDashboardInsight(open,overdue);
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



function renderTravel(){
  fillOptions($('#travelStatusFilter'),TRAVEL_STATUSES,true,'All Status');
  $('#travelStatusFilter').onchange=drawTravel;
  $('#newTravelBtn').onclick=()=>editTravel();
  drawTravel(); renderTravelKpis();
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

    <div class="train-subsection">
      <div class="train-subhead">
        <div><b>Station & Stoppage Timeline</b><small>Enter important stations manually from the verified timetable. Meal planner uses these times.</small></div>
        <button type="button" id="tr_add_stop" class="ghost">＋ Add Station Stop</button>
      </div>
      <div class="train-stop-head">
        <span>Date</span><span>Station / City</span><span>Code</span><span>Arrival</span><span>Departure</span><span>Halt min</span><span>Food / Note</span><span></span>
      </div>
      <div id="tr_train_stops" class="train-stop-list"></div>
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

    <div class="travel-live-data-note">
      <b>Important:</b> PNR status, platform, delays, live stoppage times, pantry/eCatering availability and vendor menus can change. Keep the train number + PNR here, but verify final live details with Indian Railways / IRCTC before travel or ordering food.
    </div>
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

  <div class="actionrow travel-save-row">
    <button id="saveTravel">💾 Save Complete Travel Plan</button>
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
  $('#tr_add_stop').onclick=()=>addTrainStopRow();
  $('#tr_build_meal_plan').onclick=buildTrainMealPlan;
  $('#tr_find_stay').onclick=()=>openTravelSearch('stay');
  $('#tr_find_iskcon').onclick=()=>openTravelSearch('iskcon');
  $('#tr_find_food').onclick=()=>openTravelSearch('food');
  $('#tr_find_govinda').onclick=()=>openTravelSearch('govinda');
  $('#tr_generate_visual').onclick=buildTravelDayFlow;
  renderTrainStopRows(Array.isArray(t?.trainStops)?t.trainStops:[]);
  if(t?.trainMealPlanHtml) $('#tr_train_meal_plan').innerHTML=t.trainMealPlanHtml;


  $('#saveTravel').onclick=()=>{
    const title=$('#tr_title').value.trim(),place=$('#tr_place').value.trim(),origin=$('#tr_origin').value.trim();
    if(!title||!place||!origin){alert('Trip title, origin and destination are required.');return}
    const interests=[...document.querySelectorAll('.tr_interest:checked')].map(x=>x.value);
    const x={
      id:id||uid(),title,purpose:$('#tr_purpose').value,origin,place,startDate:$('#tr_start').value,departTime:$('#tr_depart_time').value,
      arrivalDate:$('#tr_arrival_date').value,arrivalTime:$('#tr_arrival_time').value,outRef:$('#tr_out_ref').value,
      boarding:$('#tr_boarding').value,arrivalPoint:$('#tr_arrival_point').value,status:$('#tr_status').value,mode:$('#tr_mode').value,
      trainNo:$('#tr_train_no').value.trim(),trainName:$('#tr_train_name').value.trim(),pnr:$('#tr_pnr').value.trim(),
        journeyDate:$('#tr_journey_date').value,trainClass:$('#tr_train_class').value,coach:$('#tr_coach').value.trim(),seat:$('#tr_seat').value.trim(),berthType:$('#tr_berth_type').value,
        trainBoard:$('#tr_train_board').value.trim(),trainBoardCode:$('#tr_train_board_code').value.trim(),trainDest:$('#tr_train_dest').value.trim(),trainDestCode:$('#tr_train_dest_code').value.trim(),
        trainStops:collectTrainStops(),breakfastTime:$('#tr_breakfast_time').value,lunchTime:$('#tr_lunch_time').value,snackTime:$('#tr_snack_time').value,dinnerTime:$('#tr_dinner_time').value,
        trainFoodSource:$('#tr_train_food_source').value,trainMealPlanHtml:$('#tr_train_meal_plan').innerHTML,
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
  const base=rows.length?rows:[];
  base.forEach(r=>addTrainStopRow(r));
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
    <input class="ts-food" value="${esc(r.food||'')}" placeholder="Food / delivery / note">
    <button type="button" class="train-remove-stop" title="Remove">×</button>`;
  row.querySelector('.train-remove-stop').onclick=()=>row.remove();
  box.appendChild(row);
}
function collectTrainStops(){
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
  const no=$('#tr_train_no').value.trim(),name=$('#tr_train_name').value.trim();
  const q=[no,name,'Indian Railways train schedule route stoppages'].filter(Boolean).join(' ');
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
function renderBackup(){$('#backupBtn').onclick=()=>{db.settings.lastBackupAt=new Date().toISOString();save();download('SAO-Workplace-backup-'+today()+'.json',JSON.stringify(db,null,2),'application/json');};$('#restoreInput').onchange=async e=>{try{db=JSON.parse(await e.target.files[0].text());db.settings={...defaultSettings,...(db.settings||{})};db.reflections=db.reflections||[];db.tasks=db.tasks.map(t=>({estimatedMinutes:0,nextAction:'',waitingFor:'',waitingContact:'',repeat:'None',focus:false,progress:t.status==='Done'?100:0,...t}));save();alert('Restored.');showView('dashboard')}catch{alert('Invalid backup.')}};$('#csvBtn').onclick=()=>{const h=['Title','Area','Project','Priority','Status','Start Horizon','Start Date','Due Date','Reminder','Responsible','Context','Tags','Notes'];const rows=db.tasks.map(t=>[t.title,t.category,t.project,t.priority,t.status,t.horizon,t.startDate,t.dueDate,t.reminderDate,t.owner,t.context,t.tags,t.notes]);download('SAO-Workplace-tasks.csv',[h,...rows].map(r=>r.map(x=>`"${String(x??'').replaceAll('"','""')}"`).join(',')).join('\n'),'text/csv')}}function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click()}
function renderSettings(){
  $('#settingsForm').innerHTML=`<div class="formgrid"><label>App Name<input id="set_name" value="${esc(db.settings.appName)}"></label><label>Owner Name<input id="set_owner" value="${esc(db.settings.ownerName)}"></label><label>Daily Naam Japa Target<input id="set_japa" type="number" value="${db.settings.dailyJapaTarget}"></label><label>Week Starts<select id="set_week"><option>Monday</option><option ${db.settings.weekStarts==='Sunday'?'selected':''}>Sunday</option></select></label><label>Appearance<select id="set_theme"><option ${db.settings.theme!=='Dark'?'selected':''}>Soft Blue</option><option ${db.settings.theme==='Dark'?'selected':''}>Dark</option></select></label></div><div class="actionrow"><button id="saveSettings">Save Settings</button></div>`;
  $('#saveSettings').onclick=()=>{db.settings={...db.settings,appName:$('#set_name').value,ownerName:$('#set_owner').value,dailyJapaTarget:+$('#set_japa').value||5000,weekStarts:$('#set_week').value,theme:$('#set_theme').value};save();applyTheme();alert('Settings saved.')};
  renderAppHealth();updateInstallButtons();if($('#settingsInstallBtn'))$('#settingsInstallBtn').onclick=installApp;if($('#testDataBtn'))$('#testDataBtn').onclick=()=>{const h=dataHealth();alert(h.localOk?'Data health check passed. Local storage is working.':'Local storage test failed on this browser.');renderAppHealth()};$('#notificationState').textContent='Current permission: '+(window.Notification?Notification.permission:'Not supported');
  $('#notificationBtn').onclick=async()=>{if(!window.Notification){alert('Notifications not supported in this browser.');return}const p=await Notification.requestPermission();$('#notificationState').textContent='Current permission: '+p;if(p==='granted')new Notification('SAO Workplace',{body:'Notifications enabled. In-app due reminders will be shown while the app is active.'})};
}
function checkReminders(){const due=db.tasks.filter(t=>!isDone(t)&&t.reminderDate===today());if(!due.length)return;const key='sao_reminder_seen_'+today();if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');if(window.Notification&&Notification.permission==='granted')new Notification('SAO Workplace Reminder',{body:`${due.length} task${due.length===1?'':'s'} need attention today.`})}
function init(){applyTheme();registerPWA();openFileDB().catch(()=>{});$$('#nav button').forEach(b=>b.onclick=()=>showView(b.dataset.view));$('#quickAddBtn').onclick=openQuickAdd;$('#installAppBtn').onclick=installApp;$('#voiceQuickBtn').onclick=()=>{showView('ai');setTimeout(()=>startVoiceCapture('#aiCommandInput'),100)};$('#closeModal').onclick=closeQuick;$('#cancelQuick').onclick=closeQuick;$('#saveQuick').onclick=saveQuick;$('#globalSearch').onkeydown=e=>{if(e.key==='Enter'){showView('tasks');$('#taskSearch').value=e.target.value;drawTasks()}};document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openQuickAdd()}});showView('dashboard')}
return{init,showView,openQuickAdd,quickIdea,openWorkspace,editTask,markDone,shareTask,deleteTask,editIdea,deleteIdea,editStudy,editTravel,openNamedPlace,openFile,downloadFile,removeFile,reschedule,startVoiceCapture,installApp,getCloudSnapshot,applyCloudSnapshot};})();window.app = app;
document.addEventListener('DOMContentLoaded',app.init);
