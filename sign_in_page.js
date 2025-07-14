
document.addEventListener("DOMContentLoaded",()=>{



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

     function signUp(email, password, fullname) {
        auth
          .createUserWithEmailAndPassword(email, password)
          .then((userCredential) => {
            const user = userCredential.user;
             
            db.ref(`users/${user.uid}`)
              .set({
                username: user.uid,
                name: fullname,
                email: email,
              })
              .then(() => {
                alert("Signup successful!");

              })
              .catch((error) => {
                alert("Sry we faced an error.");
              });

            });
        }
    
let signupform = document.querySelector(".signupform");
signupform.addEventListener("submit", (event) => {
      event.preventDefault();

      let email = document.querySelector("#email").value;
      console.log(email);
      let fullname = document.querySelector("#name").value;
      let password = document.querySelector("#password").value;
     
      signUp(email, password, fullname);
    });
});