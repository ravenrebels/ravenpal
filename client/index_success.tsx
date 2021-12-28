import * as React from "react";

import ReactDOM from "react-dom";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";

import firebaseConfig from "../firebaseConfig.json";

export type User = firebase.User;
const app = firebase.initializeApp(firebaseConfig);
function Success() {
  const user = useUser();
  //Check if we have redirect_url in URL
  const searchParams = new URLSearchParams(window.location.search);

  //Example URL
  //http://localhost:1234/success.html?return_url=true&paymentId=PAYID-MHDRBNY817693342L823750P&token=EC-78J78014HW877442K&PayerID=GT7DJFQJ2H74W

  console.log("User", user, "search params", searchParams);

  if (!user || !searchParams.get("return_url")) {
    console.log("No user or no redirect");
  }
  if (user && searchParams.get("return_url")) {
    const paymentId = searchParams.get("paymentId");
    const token = searchParams.get("token");
    const PayerID = searchParams.get("PayerID");

    console.info("Will look for payment", paymentId);
    //Get the users orders and locate paymentId
    const ref = firebase.database().ref("/orders/" + user.uid);

    ref.once("value", (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        return;
      }

      const keys = Object.keys(data);
      for (const key of keys) {
        const order = data[key];
        console.log("processing", order);
        if (!order.payment) {
          continue;
        }
        if (order.payment.id === paymentId) {
          console.info("Found payment", paymentId);
          const orderRef = firebase
            .database()
            .ref("/order-intents/" + user.uid + "/" + key);

          const toSend = {
            metadata: {
              paymentId,
              token,
              PayerID,
            },
          };

          const promise = orderRef.update(toSend);
          console.info("will send", toSend);

          promise.then(() => {
            //Redirect the user back after 1 seconds
            setTimeout(() => {
              console.info("Should redirect to start page");
              window.location.href = "index.html";
            }, 1000);
          });
        }
      }
    });
  }
  return <div className="card">
    Success...... 
    </div>;
}

function useUser(): User {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    firebase.auth().onAuthStateChanged(async function (user: User) {
      setUser(user);
      //Update profile at firebase
      const profile = user.providerData[0];
      profile["lastLogin"] = new Date().toISOString();
      const promise = firebase
        .database()
        .ref("/users/" + user.uid)
        .set(profile);
    });
  }, []);
  return user;
}

ReactDOM.render(<Success />, document.getElementById("app"));
