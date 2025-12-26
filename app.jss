// ---------- FIREBASE CONFIG ----------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_MSG_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// -------------- AUTH -----------------
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
auth.onAuthStateChanged(user=>{
  if(user){
    db.collection("savings").doc(user.uid).get().then(doc=>{
      savings = doc.exists ? doc.data().entries : [];
      loadHistory();
      loadChart();
    });
  }
});

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
