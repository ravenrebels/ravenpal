import * as React from "react";
import validateAddress from "./validateAddress";
import { Step } from "./Step";
export function submitBuyOrder(firebase, user, ravencoinAddress) {
  //Validate ravencoin address

  const userRef = firebase.database().ref("/order-intents/" + user.uid);
  const orderRef = userRef.push();
  orderRef.set({
    ravencoinAddress: ravencoinAddress,
    userTime: new Date().toISOString(),
  });
  return orderRef;
}

export function Step1({
  firebase,
  user,
  ravencoinAddress,
  setRavencoinAddress,
}) {
  enum Status {
    NORMAL,
    VALIDATING,
  }

  const next = () => {
    //Subscribe to changes in Firebase, unregister on getting redirect URL
    const orderIntentRef = submitBuyOrder(firebase, user, ravencoinAddress);
    const str = "orders/" + user.uid + "/" + orderIntentRef.key;

    const orderRef = firebase.database().ref(str);
    console.log("Submit order", str, orderRef);

    const listener = orderRef.on("value", function (snapshot) {
      console.log("Got data for", snapshot);
      const data = snapshot.val();
      if (!data) {
        return;
      }
      console.log(data);
      if (data.redirectURL) {
        orderRef.off("value", listener);
        window.location = data.redirectURL;
      }
    });
  };
  const [status, setStatus] = React.useState(Status.NORMAL);
  return (
    <Step>
      <div className="mb-3">
        <label htmlFor="exampleFormControlInput1" className="form-label">
          Ravencoin address
        </label>
        <input
          className="form-control"
          id="exampleFormControlInput1"
          onChange={(event) => {
            setRavencoinAddress(event.target.value);
          }}
          placeholder="Your Ravencoin address"
          type="text"
          value={ravencoinAddress || ""}
        />

        <button
          className="btn btn-primary mt-4"
          onClick={async () => {
            setStatus(Status.VALIDATING);
            const promise = validateAddress(firebase, ravencoinAddress);

            promise.then((d) => {
              if (d === true) {
                next();
              } else {
                alert("Ravencoin address is not valid");
              }
            });
          }}
        >
          Next
        </button>
      </div>
    </Step>
  );
}
