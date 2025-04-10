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

  let takeform = document.querySelector(".takeform");

  takeform.addEventListener("submit", function (event) {
    event.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) {
      alert("Please fill the sign-in form.");
      return;
    }
    let book = takeform.querySelector(".input-group.book");
    let bookname = book.value;
    let address=takeform.querySelector(".input-group.location")
    db.ref("take")
      .push({
        name: bookname,
        username: user.uid,
        location:address,
        lat:getCoordinates().lat,
        long:getCoordinates().long
      })
      .then(() => {
        alert("We'll get back to you once we find a suitable donor.");
        takeform.reset();
      })

      .catch((error) => {
        alert("Sorry we coudn't load your request at the moment.");
      });
  });
  const resultsgive = [];
  const resultstake = [];
  const giveref = db.ref("donate");
  const takeref = db.ref("take");


  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  }
  takeref.on("child_added", (snapshot) => {
    const takedata = snapshot.val();
    if (!takedata || !takedata.name) return;
    giveref.once("value").then((snapshot) => {
      const givedata = snapshot.val();
      if (!givedata) return;
      for (let key in givedata) {
        if (givedata[key].name === takedata.name) {
          resultsgive.push(givedata[key]);
          resultstake.push(takedata);
        }
      }
      if(resultsgive.length>1)
      {
      let min_dist=calculateDistance(resultsgive[0].lat,resultsgive[0].long,resultstake[0].long,resultstake[0].lat)
      let min_index=0
      for (let i=1;i<resultsgive.length;i++)
      {
        if(calculateDistance(resultsgive[i].lat,resultsgive[i].long,resultstake[i].long,resultstake[i].lat)<min_dist)
        {
          min_dist=calculateDistance(resultsgive[i].lat,resultsgive[i].long,resultstake[i].long,resultstake[i].lat)
          min_index=i
        }
      }
    }
      
    });
  });
  giveref.on("child_added", (snapshot) => {
    const givedata = snapshot.val();
    if (!givedata || !givedata.name) return;
    takeref.once("value").then((snapshot) => {
      const takedata = snapshot.val();
      if (!takedata) return;
      for (let key in takedata) {
        if (takedata[key].name === givedata.name) {
          resultsgive.push(givedata);
          resultstake.push(takedata[key]);
        }
        if(resultsgive.length>1)
          {
          let min_dist=calculateDistance(resultsgive[0].lat,resultsgive[0].long,resultstake[0].long,resultstake[0].lat)
          let min_index=0
          for (let i=1;i<resultsgive.length;i++)
          {
            if(calculateDistance(resultsgive[i].lat,resultsgive[i].long,resultstake[i].long,resultstake[i].lat)<min_dist)
            {
              min_dist=calculateDistance(resultsgive[i].lat,resultsgive[i].long,resultstake[i].long,resultstake[i].lat)
              min_index=i
            }
          }
        }
      }
      
    });
  });
})