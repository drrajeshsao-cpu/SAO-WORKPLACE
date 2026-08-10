import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut,
  sendPasswordResetEmail, setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import {
  getFirestore, doc, getDocFromServer, setDoc, onSnapshot,
  enableMultiTabIndexedDbPersistence, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCfVzYtazHUzwRaoGAi4KLdvfdILF0zkmk",
  authDomain: "sao-workplace-cloud.firebaseapp.com",
  projectId: "sao-workplace-cloud",
  storageBucket: "sao-workplace-cloud.firebasestorage.app",
  messagingSenderId: "722322874733",
  appId: "1:722322874733:web:ae01a2170a64e0136bba64"
};

const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);
const firestore = getFirestore(fbApp);
setPersistence(auth, browserLocalPersistence).catch(()=>{});
enableMultiTabIndexedDbPersistence(firestore).catch((e)=>{
  console.warn("Firestore persistence fallback:", e?.code || e);
});

let currentUser = null;
let unsubscribe = null;
let writeTimer = null;
let applyingRemote = false;
let lastCloudVersion = 0;
let accountPopover = null;

const authGate = document.getElementById('cloudAuthGate');
const emailInput = document.getElementById('cloudEmail');
const passwordInput = document.getElementById('cloudPassword');
const loginBtn = document.getElementById('cloudLoginBtn');
const forgotBtn = document.getElementById('cloudForgotBtn');
const loginMessage = document.getElementById('cloudLoginMessage');
const accountBtn = document.getElementById('cloudAccountBtn');

function setLoginMessage(text, type=''){
  if(!loginMessage)return;
  loginMessage.textContent=text;
  loginMessage.className='cloud-login-message '+type;
}
function setCloudStatus(state, text){
  const el=document.getElementById('cloudStatus');
  if(!el)return;
  el.className='cloud-status cloud-'+state;
  const b=el.querySelector('b');
  if(b)b.textContent=text;
}
function cloudRef(uid){
  return doc(firestore,'users',uid,'workspace','main');
}
function cleanForCloud(data){
  const copy=JSON.parse(JSON.stringify(data||{}));
  // File blobs are IndexedDB-local in V5 and not part of this structured-data snapshot.
  copy._cloud={
    schema:1,
    clientUpdatedAt:Date.now(),
    appVersion:'5.1-cloud'
  };
  return copy;
}
function cloudComparable(data){
  const x=JSON.parse(JSON.stringify(data||{}));
  delete x._cloud;
  return JSON.stringify(x);
}
function safeLocalSnapshot(){
  try{return window.app?.getCloudSnapshot?.() || null}catch(e){return null}
}
async function waitForAppBridge(timeoutMs=5000){
  const started=Date.now();
  while(Date.now()-started < timeoutMs){
    if(window.app?.getCloudSnapshot && window.app?.applyCloudSnapshot) return true;
    await new Promise(r=>setTimeout(r,100));
  }
  return false;
}
function withTimeout(promise, ms, label='Operation'){
  let timer;
  return Promise.race([
    promise,
    new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(label+' timed out')),ms)})
  ]).finally(()=>clearTimeout(timer));
}
function hasMeaningfulLocalData(data){
  if(!data || typeof data!=='object') return false;
  return (data.tasks?.length||0)+(data.study?.length||0)+(data.wellness?.length||0)+(data.travel?.length||0) > 0;
}
async function uploadNow(reason='save'){
  if(!currentUser || applyingRemote || !navigator.onLine)return;
  const data=safeLocalSnapshot();
  if(!data)return;
  const serialized=JSON.stringify(data);
  if(serialized.length>850000){
    setCloudStatus('error','Cloud size warning');
    console.error('Structured workspace is approaching Firestore document size limit.');
    return;
  }
  setCloudStatus('syncing','Syncing…');
  const payload=cleanForCloud(data);
  payload._cloud.reason=reason;
  payload._cloud.serverUpdatedAt=serverTimestamp();
  try{
    await setDoc(cloudRef(currentUser.uid),payload,{merge:false});
    setCloudStatus('synced','☁ Synced');
  }catch(e){
    console.error('Cloud write failed',e);
    setCloudStatus(navigator.onLine?'error':'offline',navigator.onLine?'⚠ Sync error':'● Offline • queued');
  }
}
function scheduleUpload(reason='local-save'){
  if(!currentUser || applyingRemote)return;
  clearTimeout(writeTimer);
  writeTimer=setTimeout(()=>uploadNow(reason),450);
}
async function initializeUserWorkspace(user){
  currentUser=user;
  setCloudStatus(navigator.onLine?'syncing':'offline',navigator.onLine?'Connecting cloud…':'● Offline');

  const bridgeReady = await waitForAppBridge();
  if(!bridgeReady){
    setCloudStatus('error','⚠ App sync bridge unavailable');
    console.error('SAO app bridge was not exposed to cloud-sync.js');
    return;
  }
  const ref=cloudRef(user.uid);

  // Start realtime listener immediately. This prevents the UI from being held
  // indefinitely by a first get() request on some mobile/PWA environments.
  if(unsubscribe)unsubscribe();
  let firstServerSnapshotResolved=false;
  unsubscribe=onSnapshot(ref,{includeMetadataChanges:true},snapshot=>{
    if(snapshot.metadata.fromCache && !navigator.onLine){
      setCloudStatus('offline','● Offline • cached data');
    }

    if(!snapshot.exists()){
      if(!snapshot.metadata.fromCache){
        firstServerSnapshotResolved=true;
        // Do NOT auto-upload an empty mobile workspace.
        // Existing local data can seed cloud only when it is meaningful.
        const local=safeLocalSnapshot();
        if(hasMeaningfulLocalData(local)){
          setCloudStatus('syncing','Uploading this device data…');
          uploadNow('first-device-migration');
        }else{
          setCloudStatus('synced','☁ Cloud ready • no data yet');
        }
      }
      return;
    }

    const remote=snapshot.data();
    const pending=snapshot.metadata.hasPendingWrites;
    if(pending){
      setCloudStatus(navigator.onLine?'syncing':'offline',navigator.onLine?'Syncing…':'● Offline • queued');
      return;
    }

    if(!snapshot.metadata.fromCache) firstServerSnapshotResolved=true;
    const remoteVersion=remote?._cloud?.clientUpdatedAt||0;
    const localNow=safeLocalSnapshot();
    if(remoteVersion>=lastCloudVersion && cloudComparable(remote)!==cloudComparable(localNow)){
      applyingRemote=true;
      try{
        window.app?.applyCloudSnapshot?.(remote);
        lastCloudVersion=remoteVersion;
      }finally{
        setTimeout(()=>{applyingRemote=false},0);
      }
    }else{
      lastCloudVersion=Math.max(lastCloudVersion,remoteVersion);
    }
    setCloudStatus('synced','☁ Synced');
  },e=>{
    console.error('Cloud listener error',e);
    setCloudStatus(navigator.onLine?'error':'offline',
      navigator.onLine?('⚠ '+friendlyCloudError(e)):'● Offline');
  });

  // Explicit server connectivity test with timeout. Never overwrite cloud on failure.
  try{
    const snap=await withTimeout(getDocFromServer(ref),12000,'Cloud connection');
    firstServerSnapshotResolved=true;

    if(snap.exists()){
      const remote=snap.data();
      applyingRemote=true;
      try{
        window.app?.applyCloudSnapshot?.(remote);
        lastCloudVersion=remote?._cloud?.clientUpdatedAt||0;
      }finally{
        applyingRemote=false;
      }
      setCloudStatus('synced','☁ Synced');
    }else{
      const local=safeLocalSnapshot();
      if(hasMeaningfulLocalData(local)){
        await uploadNow('first-device-migration');
      }else{
        setCloudStatus('syncing','Uploading this device data…');
          const local=safeLocalSnapshot();
          if(hasMeaningfulLocalData(local)) uploadNow('first-device-migration');
          else setCloudStatus('synced','☁ Cloud ready • no data yet');
      }
    }
  }catch(e){
    console.error('Initial server connection test failed',e);
    // Keep listener active so recovery can happen automatically.
    setCloudStatus(navigator.onLine?'error':'offline',
      navigator.onLine?'⚠ Cloud connection problem':'● Offline');
  }
}

function friendlyCloudError(e){
  const c=e?.code||'';
  if(c.includes('permission-denied')) return 'Permission denied';
  if(c.includes('unauthenticated')) return 'Sign-in required';
  if(c.includes('unavailable')) return 'Cloud temporarily unavailable';
  if(c.includes('failed-precondition')) return 'Browser storage issue';
  return 'Sync error';
}

async function testCloudConnection(){
  if(!currentUser){
    setCloudStatus('offline','Cloud sign-in required');
    return false;
  }
  setCloudStatus('syncing','Testing cloud…');
  try{
    await withTimeout(getDocFromServer(cloudRef(currentUser.uid)),12000,'Cloud test');
    setCloudStatus('synced','☁ Cloud connected');
    return true;
  }catch(e){
    console.error('Cloud test failed',e);
    setCloudStatus(navigator.onLine?'error':'offline',
      navigator.onLine?('⚠ '+friendlyCloudError(e)):'● Offline');
    return false;
  }
}

window.addEventListener('sao-local-save',()=>scheduleUpload());
window.addEventListener('online',()=>{
  if(currentUser){setCloudStatus('syncing','Reconnecting…');scheduleUpload('reconnect')}
});
window.addEventListener('offline',()=>setCloudStatus('offline','● Offline • changes stay local'));

loginBtn?.addEventListener('click',async()=>{
  const email=emailInput.value.trim();
  const password=passwordInput.value;
  if(!email||!password){setLoginMessage('Enter email and password.','error');return}
  loginBtn.disabled=true;
  setLoginMessage('Signing in securely…');
  try{
    await signInWithEmailAndPassword(auth,email,password);
    passwordInput.value='';
  }catch(e){
    console.error(e);
    setLoginMessage(
      e?.code==='auth/invalid-credential'?'Email or password is incorrect.':
      e?.code==='auth/too-many-requests'?'Too many attempts. Please wait and try again.':
      'Sign-in failed: '+(e?.code||'unknown error'),
      'error'
    );
  }finally{
    loginBtn.disabled=false;
  }
});
passwordInput?.addEventListener('keydown',e=>{if(e.key==='Enter')loginBtn.click()});
forgotBtn?.addEventListener('click',async()=>{
  const email=emailInput.value.trim();
  if(!email){setLoginMessage('Enter your email first, then press Forgot Password.','error');return}
  try{
    await sendPasswordResetEmail(auth,email);
    setLoginMessage('Password reset email sent. Check Inbox and Spam.','ok');
  }catch(e){
    setLoginMessage('Could not send reset email: '+(e?.code||'error'),'error');
  }
});

function closePopover(){
  accountPopover?.remove();
  accountPopover=null;
}
accountBtn?.addEventListener('click',()=>{
  if(accountPopover){closePopover();return}
  accountPopover=document.createElement('div');
  accountPopover.className='cloud-account-popover';
  accountPopover.innerHTML=currentUser?`
    <h4>☁ SAO Cloud Account</h4>
    <p><b>${currentUser.email||'Signed in'}</b></p>
    <div class="cloud-scope-note">Automatically synced: Tasks, Study Planner, Wellness & Sadhana, Travel/Seminar, reflections and app settings. Files/PDF blobs in “Files & Notes” remain device-local in this final version.</div>
    <div class="actionrow">
      <button id="testCloudBtn" class="ghost">Test Cloud</button>
      <button id="forceCloudSync">Sync Now</button>
      <button id="cloudLogout" class="ghost">Sign Out</button>
    </div>`:
    `<h4>Cloud account</h4><p>Not signed in.</p>`;
  document.body.appendChild(accountPopover);
  document.getElementById('testCloudBtn')?.addEventListener('click',async()=>{await testCloudConnection();closePopover()});
  document.getElementById('forceCloudSync')?.addEventListener('click',()=>{uploadNow('manual-sync');closePopover()});
  document.getElementById('cloudLogout')?.addEventListener('click',async()=>{closePopover();await signOut(auth)});
});

onAuthStateChanged(auth,async user=>{
  if(user){
    setLoginMessage('Signed in. Loading synchronized workspace…','ok');
    authGate?.classList.add('hidden');
    await initializeUserWorkspace(user);
  }else{
    currentUser=null;
    if(unsubscribe){unsubscribe();unsubscribe=null}
    authGate?.classList.remove('hidden');
    setCloudStatus('offline','Cloud sign-in required');
    setLoginMessage('Sign in to start automatic laptop ↔ mobile synchronization.');
  }
});
