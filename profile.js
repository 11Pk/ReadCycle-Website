document.addEventListener("DOMContentLoaded", function () {
  const firebaseConfig = {
  apiKey: "AIzaSyCTU8Zm0_S1eoi9FBDQwDisJRj5Gt0-3Mk",
  authDomain: "user-70c1a.firebaseapp.com",
  databaseURL: "https://user-70c1a-default-rtdb.firebaseio.com",
  projectId: "user-70c1a",
  storageBucket: "user-70c1a.firebasestorage.app",
  messagingSenderId: "88960509724",
  appId: "1:88960509724:web:308a0f970c01b0831f3cd9",
  measurementId: "G-F3GH7DDRWV"
};
  

    firebase.initializeApp(firebaseConfig);
    const db = firebase.database(); 
    const auth = firebase.auth();
    
    const user = firebase.auth().currentUser;
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    document.querySelector("#email").value = user.email;
    document.querySelector("#name").value = user.displayName;
    document.querySelector("#uid").value = user.uid;
  } else {
    console.log("Please log in to see your profile.");
  }
});

});