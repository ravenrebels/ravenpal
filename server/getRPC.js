const axios = require("axios");

function throwSyntaxError() {
  throw new Error(
    "Missing attributes config should contain rpcUsername, rpcPassword and rpcURL"
  );
}
function getRPC(config) {
  if (!config.rpcUsername) {
    throwSyntaxError();
  }
  if (!config.rpcPassword) {
    throwSyntaxError();
  }
  if (!config.rpcURL) {
    throwSyntaxError();
  }

  return async function rpc(method, params) {
    const promise = new Promise((resolutionFunc, rejectionFunc) => {
      const options = {
        auth: {
          username: config.rpcUsername,
          password: config.rpcPassword,
        },
      };
      const data = {
        jsonrpc: "1.0",
        id: "n/a",
        method,
        params,
      };

      try {
        const rpcResponse = axios.post(config.rpcURL, data, options);

        rpcResponse
          .then((re) => {
            const result = re.data.result;
            resolutionFunc(result);
          })
          .catch((e) => {
            console.log("ERROR data", data);
            console.log("Mega error", e);
            if (e.response) {
              //We were able to connect to the wallet but something was wrong with our request
            } else if (e.request) {
              //Could NOT connect to wallet
            }

            const { response } = e;
            const { request, ...errorObject } = response;
            rejectionFunc(errorObject);
          });
      } catch (e) {
        rejectionFunc(e.response);
      }
    });
    return promise;
  };
}

module.exports = getRPC;
