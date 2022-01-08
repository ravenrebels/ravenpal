export default function validateAddress(
  firebase,
  ravencoinAddress
): Promise<boolean> {
  if (!ravencoinAddress) {
    return Promise.resolve(false);
  }
  const myPromise = new Promise<boolean>((resolve, reject) => {
    //Validate address
    const validation = firebase.database().ref("validateaddress");
    const validationRef = validation.push();
    validationRef.update({
      ravencoinAddress,
    });
    validationRef.on("value", (snapshot) => {
      const d = snapshot.val();
      if (!d) {
        return;
      }
      if (d.isValid === true || d.isValid === false) {
        resolve(d.isValid);
        //OK validation of address is done, remove event listeners and delete result
        validationRef.off();
        validationRef.remove();
      }
    });
  });

  return myPromise;
}
