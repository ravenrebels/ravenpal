import React from "react";
import * as products from "../products.json";
import Footer from "./Footer";
import { Header } from "./Header";
import Instructions from "./Instructions";
/*
  <img
        className="mt-4 mb-4 product-image"
        src={product.imageURL}
        width="200"
      />
      */
const product = products[0];

export default function Anonymous({ firebase }) {
  return (
    <div>
      <Header product={product} />
      <Instructions product={product} />

      <div>
        <h2 className="h5">What you need</h2>
        <p>
          <ul className="instructions__list">
            <li>A Paypal account or credit card</li>
            <li>
              An asset aware Ravencoin wallet (address).
              <br />
              <a href="https://mangofarmassets.com/" target="-blank">
                Mango Farms
              </a>{" "}
              web wallet is a great way to get started
            </li>
          </ul>
        </p>
      </div>
      <button
        className="btn btn-primary"
        onClick={() => {
          firebase.auth().signInAnonymously();
        }}
      >
        Get started
      </button>
      <Footer />
    </div>
  );
}
