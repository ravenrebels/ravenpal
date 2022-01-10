import React from "react";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
export type User = firebase.User;

export default function useUser(firebase): User {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    firebase.auth().onAuthStateChanged((user: User) => {
      setUser(user);

      if (user && user.providerData) {
        //Update profile at firebase
        const profile = user.providerData[0];
        profile["lastLogin"] = new Date().toISOString();
        const promise = firebase
          .database()
          .ref("/users/" + user.uid)
          .set(profile);
      }
    });
  }, []);
  return user;
}
