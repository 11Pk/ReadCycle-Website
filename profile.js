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
    const activitiesRef = db.ref(`activities/${user.uid}`);
    const activitiesSnapshot = await activitiesRef.once("value");
    const snapshot= await useref.once("value")
    const userefdata=snapshot.val()
    document.querySelector("#email").value = user.email;
    document.querySelector("#name").value = userefdata.name;
    document.querySelector("#uid").value = user.uid;

   for(key in activitiesSnapshot.val())
   {
    if(activitiesSnapshot.val()[key].exchange && activitiesSnapshot.val()[key].bookname && activitiesSnapshot.val()[key].location)
    {const new_ul=document.createElement("ul");
  new_ul.innerHTML=
  `<h1><b>${activitiesSnapshot.val()[key].exchange}</b></h1>
  <li>bookname: ${activitiesSnapshot.val()[key].bookname}</li>
  <li>location: ${activitiesSnapshot.val()[key].location}</li>
  <li>status: ${activitiesSnapshot.val()[key].status}</li>`
  // console.log(activitiesSnapshot.val()[key])
  document.querySelector(".Activities").appendChild(new_ul);
  if(activitiesSnapshot.val()[key].status==="matched")
  {
    const matchedDetails = document.createElement("div");
    matchedDetails.innerHTML = `
      <h2>Matched Details</h2>
      <p><strong>Matched With:</strong> ${activitiesSnapshot.val()[key].matchedWith}</p>
      <p><strong>Location:</strong> ${activitiesSnapshot.val()[key].matchedLocation}</p>
      <p><strong>Email:</strong> ${activitiesSnapshot.val()[key].matchedemail}</p>
    `;
    document.querySelector(".Activities").appendChild(matchedDetails);
  }
}
  }} else {
    console.log("Please log in to see your profile.");
  }
  
  
});


});