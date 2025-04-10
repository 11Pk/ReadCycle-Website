document.addEventListener("DOMContentLoaded", () => {
    const firebaseConfig = {
      apiKey: "AIzaSyAgW8vHftszFHV6vmt1tAd4jS131mbw5KY",
      authDomain: "user-70c1a.firebaseapp.com",
      databaseURL: "https://user-70c1a-default-rtdb.firebaseio.com",
      projectId: "user-70c1a",
      storageBucket: "user-70c1a.firebasestorage.app",
      messagingSenderId: "88960509724",
      appId: "1:88960509724:web:94a4b4cf142a49c51f3cd9",
      measurementId: "G-SN9LTDRPBP",
    };
  
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database(); 
    const auth = firebase.auth();

    function signUp(email, password, fullname) {
        auth
          .createUserWithEmailAndPassword(email, password)
          .then((userCredential) => {
            const user = userCredential.user;
    
            db.ref("users")
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
            console.log("User:", user);
            signupform.reset();
          })
          .catch((error) => {
            alert(error.message);
          });
      }


    let giveform = document.querySelector(".giveform");
    console.log(giveform)
  giveform.addEventListener("submit",async function (event) {
    event.preventDefault();
    
    const user = auth.currentUser;
    console.log(user)
    if (!user) {
      alert("Please fill the sign-in form.");
      return;
    }

    async function getCoordinates(address) {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await response.json();
        if (data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
          };
        } else {
          throw new Error("No coordinates found for this address.");
        }
      }
    let book = giveform.querySelector(".input-group.book");
    let bookname = book.value;
    let address=giveform.querySelector(".input-group.location")
    db.ref("donate")
      .push({
        name: bookname,
        username: user.uid,
        location:address,
        lat:await getCoordinates(address.value).lat,
        long:await getCoordinates(address.value).long

      })
      .then(() => {
        alert("We'll get back to you once we find a suitable recipent.");
        giveform.reset();
      })

      .catch((error) => {
        alert("Sorry we coudn't load your request at the moment.");
      });
  })
})