import React from "react";
import * as products from "../products.json";

const product = products[0];
export default function Anonymous({ firebase }) {
  return (
    <div>
      <h1 className=" mt-4 mb-5">Project Ravenpal</h1>

      <p className="lead">
        Buy this token for ${product.price} and you help the community to beta
        test selling Ravencoin digital assets via Paypal
      </p>
      <img
        className="mt-4 mb-4 product-image"
        src={product.imageURL}
        width="200"
      />
      <div>
        <small>
          <strong>What you need</strong>
          <ul className="instructions__list">
            <li>
              An asset aware Ravencon wallet (address).
              <br />
              <a href="https://mangofarmassets.com/" target="-blank">
                Mango Farms
              </a>{" "}
              offers a web wallet, great way to get started
            </li>
            <li>A Paypal account or credit card</li>
          </ul>
        </small>
      </div>
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
