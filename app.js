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

// ----------------------- GOOGLE LOGIN -----------------------
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then(() => {
      window.location = "index.html";
    })
    .catch(err => {
      alert(err.message);
    });
}

// ----------------------- EMAIL LOGIN ------------------------
function login(){
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, pass)
    .then(()=> window.location = "index.html")
    .catch(err=> alert(err.message));
}

// ----------------------- SIGNUP -----------------------------
function signup(){
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, pass)
    .then(()=> alert("Signup successful!"))
    .catch(err=> alert(err.message));
}

// Auto redirect
auth.onAuthStateChanged(user=>{
  if(!user && !location.href.includes("login.html")){
    location.href = "login.html";
  }
});
