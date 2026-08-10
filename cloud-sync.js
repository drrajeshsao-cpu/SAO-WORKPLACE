import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut,
  sendPasswordResetEmail, setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, onSnapshot,
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
  const ref=cloudRef(user.uid);

  let snap;
  try{ snap=await getDoc(ref); }
  catch(e){
    console.warn('Initial cloud read failed; listener will retry',e);
  }

  const local=safeLocalSnapshot();
  if(snap?.exists()){
    const remote=snap.data();
    applyingRemote=true;
    try{
      window.app?.applyCloudSnapshot?.(remote);
      lastCloudVersion=remote?._cloud?.clientUpdatedAt||0;
    }finally{
      applyingRemote=false;
    }
  }else if(local){
    // First authenticated laptop: seed cloud with existing local data.
    await uploadNow('first-device-migration');
  }

  if(unsubscribe)unsubscribe();
  unsubscribe=onSnapshot(ref,{includeMetadataChanges:true},snapshot=>{
    if(!snapshot.exists())return;
    const remote=snapshot.data();
    const pending=snapshot.metadata.hasPendingWrites;
    if(pending){
      setCloudStatus(navigator.onLine?'syncing':'offline',navigator.onLine?'Syncing…':'● Offline • queued');
      return;
    }

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
    setCloudStatus(navigator.onLine?'error':'offline',navigator.onLine?'⚠ Sync error':'● Offline');
  });
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
      <button id="forceCloudSync">Sync Now</button>
      <button id="cloudLogout" class="ghost">Sign Out</button>
    </div>`:
    `<h4>Cloud account</h4><p>Not signed in.</p>`;
  document.body.appendChild(accountPopover);
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
