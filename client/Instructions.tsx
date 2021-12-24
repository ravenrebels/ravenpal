import * as React from "react";

//Fetch price from Binance every 60 seconds
function useHowManyRVN(dollarAmountGet) {
  const [howMany, setHowMany] = React.useState(0);
  React.useEffect(() => {
    async function work() {
      const URL = "https://api1.binance.com/api/v3/ticker/price?symbol=RVNUSDT";
      fetch(URL)
        .then((response) => response.json())
        .then((data) => {
          const h = Math.round(dollarAmountGet / data.price);
          setHowMany(h);
        });
    }

    work();
    const interval = setInterval(work, 60 * 1000);

    const cleanUp = () => {
      clearInterval(interval);
    };
    return cleanUp;
  }, []);

  return howMany;
}

export function Instructions({ dollarAmountPay, dollarAmountGet }) {
  const howMany = useHowManyRVN(dollarAmountGet);
  return (
    <div>
      <h1>Buy some RVN</h1>
      <p>
        Buy approximately {howMany} RVN for <em>${dollarAmountPay}</em> so you
        can start doing stuff on Ravencoin blockchain.
      </p>
      <p>No more, no less.</p>

    
    </div>
  );
}
