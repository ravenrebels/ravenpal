import React from "react";

import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";

export default function Anonymous({ firebase }) {
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

  return (
    <div>
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
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
    </div>
  );
}
