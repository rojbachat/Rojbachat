// -------- FIREBASE CONFIG --------
const firebaseConfig = {
  apiKey: "AIzaSyC98Lxjn6jn-V9NqjcOGluL04EAX4kzpmY",
  authDomain: "rojbachat-7e5a8.firebaseapp.com",
  projectId: "rojbachat-7e5a8",
  storageBucket: "rojbachat-7e5a8.firebasestorage.app",
  messagingSenderId: "790739371754",
  appId: "1:790739371754:web:9b0bd71f2579d664747993"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// ---------- AUTH ----------
function signup(){
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  if(!email || !pass) return alert("Enter email & password");

  auth.createUserWithEmailAndPassword(email, pass)
      .then(()=>{ alert("Signup successful"); })
      .catch(err=>alert(err.message));
}

function login(){
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  if(!email || !pass) return alert("Enter email & password");

  auth.signInWithEmailAndPassword(email, pass)
      .then(()=>{ window.location='index.html'; })
      .catch(err=>alert(err.message));
}

auth.onAuthStateChanged(user=>{
  if(!user && !window.location.href.includes("login.html")){
    window.location='login.html';
  }
});

// ---------- WALLET ----------
let wallet = 0;
auth.onAuthStateChanged(user=>{
  if(user){
    db.collection("wallet").doc(user.uid).get().then(doc=>{
      wallet = doc.exists ? doc.data().balance : 0;
      updateWalletUI();
    });

    db.collection("savings").doc(user.uid).get().then(doc=>{
      savings = doc.exists ? doc.data().entries : [];
      loadHistory();
      loadChart();
    });
  }
});

function updateWalletUI(){
  if(document.getElementById("walletBal"))
    document.getElementById("walletBal").innerText = wallet;
}

// Withdraw
function withdraw(){
  const amt = Number(document.getElementById("withdrawInput").value);
  if(amt <=0 || amt>wallet) return alert("Invalid amount");
  wallet -= amt;
  const user = auth.currentUser;
  db.collection("wallet").doc(user.uid).set({balance:wallet});
  updateWalletUI();
  alert("Withdraw request done!");
}

// ---------- DAILY SAVING ----------
let savings = [];

function addSaving(){
  const amt = Number(document.getElementById("saveInput").value);
  if(amt<=0) return alert("Enter valid amount");

  const entry = {amount:amt,date:new Date().toLocaleDateString()};
  savings.push(entry);
  const user = auth.currentUser;
  db.collection("savings").doc(user.uid).set({entries:savings});
  loadHistory();
  loadChart();
  alert("Saved!");
}

// ---------- HISTORY ----------
function loadHistory(){
  if(!document.getElementById("historyList")) return;
  let html="";
  savings.forEach(s=>{
    html+=`<li>₹${s.amount} — ${s.date}</li>`;
  });
  document.getElementById("historyList").innerHTML=html;
}

// ---------- MONTHLY CHART ----------
function loadChart(){
  if(!document.getElementById("chartCanvas")) return;

  const monthly={};
  savings.forEach(s=>{
    const month = new Date(s.date).getMonth()+1;
    monthly[month] = (monthly[month] || 0)+s.amount;
  });

  new Chart(document.getElementById("chartCanvas"),{
    type:'bar',
    data:{
      labels:Object.keys(monthly),
      datasets:[{
        label:"Monthly Savings (₹)",
        data:Object.values(monthly),
        backgroundColor:"#4B7BE5"
      }]
    },
    options:{responsive:true}
  });
}
