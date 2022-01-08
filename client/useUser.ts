import React from "react";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
export type User = firebase.User;

export default function useUser(firebase): User {
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
