import React from "react";
import ReactDOM from "react-dom";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";

import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { App } from "./App";

import firebaseConfig from "../firebaseConfig.json";

export type User = firebase.User;
const app = firebase.initializeApp(firebaseConfig);

const logOut = () => {
  if (confirm("Do you want to log out?")) {
    firebase.auth().signOut();
  }
};

function Cosmos() {
  const user = useUser();

  const uiConfig = {
    signInFlow: "popup",
    callbacks: {
      uiShown: function () {},
    },
    signInOptions: [
      // List of OAuth providers supported.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    ],
  };
  if (user) {
    return <App firebase={firebase} user={user} logOut={logOut} />;
  } else {
    return (
      <div className="card">
        <h1>By some Ravencoin using Paypal</h1>
        <h2>What you need</h2>
        <ul className="instructions__list">
          <li>A Google account</li>
          <li>
            A Ravencoin address, that is you need a Ravencoin wallet.
            <br />
            <a href="https://mangofarmassets.com/" target="-blank">
              Mango Farms
            </a>{" "}
            offers a web wallet, great way to get started
          </li>
          <li>A Paypal account or credit card</li>
        </ul>
        <StyledFirebaseAuth
          uiConfig={uiConfig}
          firebaseAuth={firebase.auth()}
        />
      </div>
    );
  }
}
function useUser(): User {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    firebase.auth().onAuthStateChanged(function (user: User) {
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

ReactDOM.render(<Cosmos />, document.getElementById("app"));
