import React from "react";
import ReactDOM from "react-dom";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import firebaseConfig from "../firebaseConfig.json";

import Anonymous from "./Anonymous";
import { App } from "./App";
import useUser from "./useUser";

firebase.initializeApp(firebaseConfig);

const logOut = () => {
  if (confirm("Do you want to log out?")) {
    firebase.auth().signOut();
  }
};

function Cosmos() {
  const user = useUser(firebase);
  if (user) {
    return <App firebase={firebase} user={user} logOut={logOut} />;
  } else {
    return <Anonymous firebase={firebase} />;
  }
}
ReactDOM.render(<Cosmos />, document.getElementById("app"));
