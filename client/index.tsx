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

function Cosmos() {
  const user = useUser(firebase);
  if (user) {
    return <App firebase={firebase} user={user} />;
  } else {
    return <Anonymous firebase={firebase} />;
  }
}
ReactDOM.render(<Cosmos />, document.getElementById("app"));
