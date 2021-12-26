import * as React from "react";
import { Instructions } from "./Instructions";
import { User } from "@firebase/auth-types";

interface IProps {
  firebase: any;
  logOut: any;
  user: User;
}
export function App({ firebase, logOut, user }: IProps) {
  const dollarAmountPay = 60;
  const dollarAmountGet = 57;

  React.useEffect(() => {
    //Check if we have redirect_url in URL
    const searchParams = new URLSearchParams(window.location.search);

    //Example URL
    //http://localhost:1234/index.html?return_url=true&paymentId=PAYID-MHDRBNY817693342L823750P&token=EC-78J78014HW877442K&PayerID=GT7DJFQJ2H74W

    if (searchParams.get("return_url")) {
      alert("Aha return");

      const paymentId = searchParams.get("paymentId");
      const token = searchParams.get("token");
      const PayerID = searchParams.get("PayerID");

      //Get the users orders and locate paymentId
      const ref = firebase.database().ref("/orders/" + user.uid);

      ref.once("value", (snapshot) => {
        const data = snapshot.val();
        const keys = Object.keys(data);
        for (const key of keys) {
          const order = data[key];

          if (order.payment.id === paymentId) {
            const orderRef = firebase
              .database()
              .ref("/orders/" + user.uid + "/" + key);

            const toSend = {
              metadata: {
                paymentId,
                token,
                PayerID,
              },
            };

            orderRef.update(toSend);
          }
        }
      });
    } else {
    }
  }, []);
  return (
    <div className="card">
      <img src={user.photoURL} className="profile-image"></img>
      <Instructions
        dollarAmountPay={dollarAmountPay}
        dollarAmountGet={dollarAmountGet}
      />
      <button
        className="button-27"
        onClick={() => {
          alert("Buy");
          const firebaseOrderRef = postBuyOrder(firebase, user);

          //Subscribe to changes in Firebase, unregister on getting redirect URL
          const listener = firebaseOrderRef.on("value", function (snapshot) {
            const data = snapshot.val();

            if (data.redirectURL) {
              //Unregister listener
              firebaseOrderRef.off("value", listener);
              window.location = data.redirectURL;
            }
          });
        }}
      >
        Buy Ravencoin with Paypal
      </button>
      <button className="button-27 sign-out-button" onClick={logOut}>
        Sign out
      </button>
    </div>
  );
}

function postBuyOrder(firebase, user) {
  const userRef = firebase.database().ref("/orders/" + user.uid);
  const orderRef = userRef.push();
  const promise = orderRef.set({
    givemesome: true,
    userTime: new Date().toISOString(),
  });
  return orderRef;
}
