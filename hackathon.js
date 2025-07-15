document.addEventListener("DOMContentLoaded", () => {

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
    let main=document.querySelector(".main")
    main.addEventListener("click",()=>{
        location.href="#mainpage"
    })


//use RADAR API to locate coordinates of the entered location
let signin=document.querySelector(".sign-in");
signin.addEventListener("click",(event)=>{
  window.location.href="sign_in_page.html";
})
const RADAR_PUBLISHABLE_KEY="prj_test_pk_11004e5b8043662303c210d484931a33a9eed83e"
    
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
    

//if user enters data of the book he wants to donate.
    let giveform = document.querySelector(".giveform");
     giveform.addEventListener("submit",async function (event) {
    event.preventDefault();
    
    const user = auth.currentUser;
    console.log(user)
    if (!user) {
      alert("Please sign-in to exchange books.");

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

       db.ref(`users/${user.uid}`)
      .push({
        exchange:"give",
        bookname: bookname,
        location: address.value,
        lat: a.lat,
        long: a.lon

      })
      .then(()=>{
        alert("Please check your profile dashboard for further details.")
      })
      .catch((error)=>{
         alert("Sorry we coudn't load your request at the moment.");
      })
      
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

       db.ref(`users/${user.uid}`)
      .push({
        exchange:"take",
        bookname: bookname,
        location: address.value,
        lat: a.lat,
        long: a.lon

      })
      .then(()=>{
        alert("Please check your profile dashboard for further details.")
      })
      .catch((error)=>{
         alert("Sorry we coudn't load your request at the moment.");
      })
      
  });


  let resultsgive = [];
  let resultstake = [];
  

//function to calculate distance between matched donors and receivers
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

  async function getUserName(uid) {
    const snapshot = await db.ref(`users/${user.uid}`).once("value");
    const userData = snapshot.val();
    return userData ? userData : "Unknown";
}
function displayMatch(donor, receiver) {
  document.querySelector(".t").setAttribute("style","display:none;")
  document.getElementById("donor-name").textContent = donor.name || "Unknown";
  document.getElementById("donor-address").textContent = donor.location || "Unknown";
  document.getElementById("receiver-name").textContent = receiver.name || "Unknown";
  document.getElementById("receiver-address").textContent = receiver.location || "Unknown";
}
  takeref.on("child_added", async (snapshot) => {
    let resultsgive = [];
  let resultstake = [];
    const takedata = snapshot.val();
    if (!takedata || !takedata.name) return;

      const givedataSnapshot = await giveref.once("value");
const givedata = givedataSnapshot.val();
      if (!givedata) return;
      for (let key in givedata) {
        if (givedata[key].name === takedata.name) {
        
        const donorDetails = await getUserName(givedata[key].username);
        if(donorDetails!="Unknown")
        {
        const donorName=donorDetails.name;
        const donorEmail=donorDetails.email;
                resultsgive.push({
                    ...givedata[key],
                    name: donorName,
                    uid: givedata[key].username,
                    email: donorEmail
                });
              }
                const receiverDetails = await getUserName(takedata.username);
                if(receiverDetails!="Unknown")
               { resultstake.push({
                    ...takedata,
                    name: receiverDetails.name,
                    uid: takedata.username,
                    email: receiverDetails.email
                })
              }
        
      }
    }
      
      if(resultsgive.length>0)
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
      const matchedDonor = resultsgive[min_index];
            const matchedReceiver = resultstake[0];
            displayMatch(matchedDonor, matchedReceiver);
            db.ref(`notifications/${matchedDonor.uid}`).push({
                message: `Your book "${takedata.name}" has been matched with ${matchedReceiver.name} at ${matchedReceiver.location}.`,
                type: 'donation_match',
                timestamp: Date.now()
            });
            db.ref(`notifications/${matchedReceiver.uid}`).push({
                message: `You have been matched with ${matchedDonor.name} for "${takedata.name}" at ${matchedDonor.location}.`,
                type: 'donation_match',
                timestamp: Date.now()
            });
            giveref.child(matchedDonor.uid).remove();
            takeref.child(matchedReceiver.uid).remove();
    }
      
    });
  

  giveref.on("child_added", async (snapshot) => {
    let resultsgive = [];
   let resultstake = [];
    const givedata = snapshot.val();
    if (!givedata || !givedata.name) return;
    const takedataSnapshot= await takeref.once("value");
    
      const takedata = takedataSnapshot.val();
      if (!takedata) return;
      for (let key in takedata) {
        if (takedata[key].name === givedata.name) {
          resultsgive.push(givedata);
          resultstake.push(takedata[key]);
        }
        const donorDetails = await getUserName(givedata[key].username);
        if(donorDetails!="Unknown")
        {
                resultsgive.push({
                    ...givedata[key],
                    name: donorDetails.name,
                    uid: givedata[key].username,
                    email: donorDetails.email
                })}
                const receiverDetails = await getUserName(takedata.username);
                if(receiverDetails!="Unknown")
                {
                resultstake.push({
                    ...takedata,
                    name: receiverDetails.name,
                    uid: takedata.username,
                    email: receiverDetails.email
                })}
        
        if(resultsgive.length>0)
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
          const matchedDonor = resultsgive[0];
            const matchedReceiver = resultstake[min_index];
            displayMatch(matchedDonor, matchedReceiver);
            db.ref(`notifications/${matchedDonor.uid}`).push({
                message: `Your book "${givedata.name}" has been matched with ${matchedReceiver.name} at ${matchedReceiver.location}.`,
                type: 'donation_match',
                timestamp: Date.now()
            });
            db.ref(`notifications/${matchedReceiver.uid}`).push({
                message: `You have been matched with ${matchedDonor.name} for "${givedata.name}" at ${matchedDonor.location}.`,
                type: 'donation_match',
                timestamp: Date.now()
            });

        }
      }

    }
  );
  
  


function listenForMessages(uid) {
    firebase.database().ref(`notifications/${uid}`).on("child_added", (snapshot) => {
      const data = snapshot.val();
      // console.log("New message:", data.message);
      alert(data.message);})
    }
  // Listen for authentication state changes
  // and call listenForMessages when the user is signed in

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      listenForMessages(user.uid);
    }
  });
});
