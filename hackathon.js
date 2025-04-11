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

    let main=document.querySelector(".main")
    main.addEventListener("click",()=>{
        location.href="#mainpage"
    })


let signin=document.querySelector(".sign-in")
signin.addEventListener("click",()=>{
    let signinpage=document.querySelector(".mainbox")
    signinpage.setAttribute("style","display:block")

    
    document.querySelector(".buttons").setAttribute("style","visibility:hidden")
    document.querySelector(".homepageimagess").setAttribute("style","visibility:hidden")

    let signupform = signinpage.querySelector(".signinform");
    let signout=document.querySelector("sign-out")
    signout.addEventListener("click",()=>{
        firebase.auth().signOut()
  .then(() => {
    console.log("User signed out successfully.");
    
  })
  .catch((error) => {
    console.error("Error signing out:", error.message);
  });
    })
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
            signinpage.setAttribute("style","display:none")
            document.querySelector(".buttons").setAttribute("style","visibility:visible")
    document.querySelector(".homepageimagess").setAttribute("style","visibility:visible")
          })
          .catch((error) => {
            alert(error.message);
          });
      }


    signupform.addEventListener("submit", (event) => {
      event.preventDefault();
      let email = document.querySelector(".signup2").value;
      let fullname = document.querySelector(".signup").value;
      let password = document.querySelector(".signup1").value;
     
      signUp(email, password, fullname);
    });
  

})

const RADAR_PUBLISHABLE_KEY="prj_test_sk_4bf766367ba045738f24548671a09262d718dcb9"
    
    async function getCoordinates(address) {
        
        
      
        const response = await fetch(`https://api.radar.io/v1/geocode/forward?query=${encodeURIComponent(address)}`, {
            method: 'GET',
            headers: {
              'Authorization': RADAR_PUBLISHABLE_KEY,
            }
          });
        const data = await response.json();
        const output = document.getElementById('output')
      
        if (response.ok && data.addresses.length > 0)  {
          const location = data.addresses[0]
          return {
            lat: location.latitude,
            lon: location.longitude,
          };
        } else {
          throw new Error(`No coordinates found for this address. Status: ${data.status}`);
        }
      }
    


    let giveform = document.querySelector(".giveform");
     giveform.addEventListener("submit",async function (event) {
    event.preventDefault();
    
    const user = auth.currentUser;
    console.log(user)
    if (!user) {
      alert("Please fill the sign-in form.");

      return;
    }

    let book = giveform.querySelector("input.book");
    let bookname = book.value;
    let address=giveform.querySelector("input.location")
    let a=await getCoordinates(address.value)
    db.ref("donate")
      .push({
        name: bookname,
        username: user.uid,
        location:address.value,
         lat:a.lat,
         long:a.lon

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

  takeform.addEventListener("submit", async function (event) {
    event.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) {
      alert("Please fill the sign-in form.");
      return;
    }
    let book = takeform.querySelector("input.book");
    let bookname = book.value;
    let address=takeform.querySelector("input.location")
    let a= await getCoordinates(address.value)
    db.ref("take")
      .push({
        name: bookname,
        username: user.uid,
        location:address.value,
        lat:a.lat,
        long:a.lon
      })
      .then(() => {
        alert("We'll get back to you once we find a suitable donor.");
        takeform.reset();
      })

      .catch((error) => {
        alert("Sorry we coudn't load your request at the moment.");
      });
  });


  let resultsgive = [];
  let resultstake = [];
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
    let resultsgive = [];
  let resultstake = [];
    const takedata = snapshot.val();
    if (!takedata || !takedata.name) return;
    giveref.once("value").then((snapshot) => {
      const givedata = snapshot.val();
      if (!givedata) return;
      for (let key in givedata) {
        if (givedata[key].name === takedata.name) {
        // console.log(givedata[key])
        // console.log(takedata)
          resultsgive.push(givedata[key]);
          resultstake.push(takedata);
        }
      }
      console.log(resultsgive)
     console.log(resultstake)
      if(resultsgive.length>1)
      {
      let min_dist=calculateDistance(resultsgive[0].lat,resultsgive[0].long,resultstake[0].long,resultstake[0].lat)
      let min_index=0
      for (let i=1;i<resultsgive.length;i++)
      {
        if(calculateDistance(resultsgive[i].lat,resultsgive[i].long,resultstake[i].lat,resultstake[i].long)<min_dist)
        {
          min_dist=calculateDistance(resultsgive[i].lat,resultsgive[i].long,resultstake[i].lat,resultstake[i].long)
          min_index=i
        }
      }
    }
      
    });
  });
  giveref.on("child_added", (snapshot) => {
    let resultsgive = [];
   let resultstake = [];
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
        // console.log(resultsgive)
        // console.log(resultstake)
        if(resultsgive.length>1)
          {
          let min_dist=calculateDistance(resultsgive[0].lat,resultsgive[0].long,resultstake[0].lat,resultstake[0].long)
          let min_index=0
          for (let i=1;i<resultsgive.length;i++)
          {
            if(calculateDistance(resultsgive[i].lat,resultsgive[i].long,resultstake[i].lat,resultstake[i].long)<min_dist)
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
<<<<<<< Updated upstream
// let button = document.querySelector("#offer");

// button.onclick = function () {
//   let take = document.getElementById("take");

//   take.innerHTML = ""; // Clear old content

//   let newDiv = document.createElement("div");
//   newDiv.innerHTML = "<p>This</p>";
//   newDiv.style.border = "2px solid black";
//   newDiv.style.marginTop = "10px";

//   take.appendChild(newDiv); // Insert new content inside #take
// };

// let button1 = document.querySelector("#receive");

// button1.onclick = function () {
//   let take = document.getElementById("give");

//   take.innerHTML = ""; // Clear old content

//   let newDiv1 = document.createElement("div");
//   newDiv1.innerHTML = "<p>This</p>";
//   newDiv1.style.border = "2px solid black";
//   newDiv1.style.marginTop = "10px";

//   take.appendChild(newDiv1); // Insert new content inside #take
// };
// document.querySelector('.close-btn').onclick = function () {
//   document.getElementById('signinModal').style.display = 'none';
// };
=======



let button = document.querySelector("#offer");  

button.onclick = function() {
  let take = document.getElementById("take");  

  take.innerHTML = "";

  // Create the new content
  let newDiv = document.createElement("div");
  newDiv.innerHTML = "<p>This</p>";
  newDiv.style.border = "2px solid black";
  newDiv.style.marginTop = "10px";

  take.style.visibility = "visible";

  take.appendChild(newDiv);
};



let button1 = document.querySelector("#receive");  // Select the button with the ID "offer"

button1.onclick = function() {
  var div = document.getElementById("give");  // Select the div with the ID "take"
  div.style.visibility = "hidden";
  let newDiv1 = document.createElement("div");
};

>>>>>>> Stashed changes
