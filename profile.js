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
    const giveref = db.ref("donate");
    const takeref = db.ref("take");
    const user = firebase.auth().currentUser;
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    const useref=db.ref(`users/${user.uid}`)
    const snapshot= await useref.once("value")
    const userefdata=snapshot.val()
    document.querySelector("#email").value = user.email;
    document.querySelector("#name").value = userefdata.name;
    document.querySelector("#uid").value = user.uid;

   for(key in userefdata)
   {
    if(userefdata[key].exchange && userefdata[key].bookname && userefdata[key].location)
    {const new_ul=document.createElement("ul");
  new_ul.innerHTML=
  `<h1><b>${userefdata[key].exchange}</b></h1>
  <li>${userefdata[key].bookname}</li>
  <li>${userefdata[key].location}</li>`
  document.querySelector(".Activities").appendChild(new_ul);}
  }} else {
    console.log("Please log in to see your profile.");
  }
  
  
});


});