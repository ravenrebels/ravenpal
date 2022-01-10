import React from "react";

export default function Anonymous({ firebase }) {
  return (
    <div>
        {/* PAYPAL LOGO */}
        <img className="paypal-logo" src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_74x46.jpg"/>
    
      <h1 className="h2 mt-4 mb-5">
        By some Ravencoin digital assets using Paypal
      </h1>
      <h2 className="h5">What you need</h2>
      <ul className="instructions__list">
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
      <button
        className="btn btn-primary"
        onClick={() => {
          firebase.auth().signInAnonymously();
        }}
      >
        Get started
      </button>
    </div>
  );
}
