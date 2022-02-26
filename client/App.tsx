import * as React from "react";
import Instructions from "./Instructions";
import { User } from "@firebase/auth-types";
import * as products from "../products.json";

import { Step1 } from "./Step1";
import { Orders } from "./Orders";
import { Cancel } from "./Cancel";
import { Header } from "./Header";
import Footer from "./Footer";

export interface IOrder {
  key: string;
  redirectURL: string;
}
interface IProps {
  firebase: any;
  user: User;
}

enum Routes {
  HOME,
  STEP1,
  STEP2,
  STEP3,
  SUCCESS,
  CANCEL,
}
export function App({ firebase, user }: IProps) {
  const [route, setRoute] = React.useState(Routes.STEP1);
  const [ravencoinAddress, setRavencoinAddress] = React.useState(null);

  const [orders, setOrders] = React.useState(null);

  React.useEffect(() => {
    const ref = firebase.database().ref("/orders/" + user.uid);
    const listener = ref.on("value", (snapshot) => {
      setOrders(snapshot.val());
    });
    const cleanup = () => {
      ref.off("value", listener);
    };

    return cleanup;
  }, []);

  //Hack to get browser to scroll down to #my-order-history
  React.useEffect(() => {
    if (window.location.href.indexOf("#my-order-history") > -1) {
      //      document.getElementById("my-order-history").focus();
      setTimeout(() => {
        window.location.href = window.location.href;
      }, 1000);
    }
  }, []);

  if (window.location.href.indexOf("cancel=true&token=") > -1) {
    return <Cancel firebase={firebase} orders={orders} user={user}></Cancel>;
  }
  /*
  //Does any order have state "created"?
  ordersArray.map(function (order) {
    if (order.payment && order.payment.state === "created") {
      // window.location = order.redirectURL;
    }
  });
*/
  return (
    <div>
      {/* INSTRUCTIONS */}
      <Header product={products[0]} />
      <Instructions product={products[0]} />

      {route === Routes.STEP1 && (
        <Step1
          firebase={firebase}
          user={user}
          ravencoinAddress={ravencoinAddress}
          setRavencoinAddress={setRavencoinAddress}
        />
      )}

      {route === Routes.STEP2 && <Step2 />}

      {/* LIST OF ORDERS */}
      <div id="my-order-history"></div>
      <Orders orders={orders} />
      <Footer />
    </div>
  );
}

function Step2(props) {
  return <div>Step 2</div>;
}
