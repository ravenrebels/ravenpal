import { userInfo } from "os";
import * as React from "react";
import * as ReactDOM from "react-dom";
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
          postBuyOrder(firebase, user);
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
  const ref = firebase.database().ref("/orders/" + user.uid);
 const promise =  ref.push().set({
    givemesome: true,
    userTime: new Date().toISOString()
  });

  console.log("BUY", promise);
}
