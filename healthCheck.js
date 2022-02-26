const intent = `Let's scan the project and make sure that
all settings are correct or at least set`;

function checkFile(file) {
  try {
    require(file);
    console.info("Success: you have the file", file);
  } catch (e) {
    console.error("Error: You should have a file called", file);
  }
}

checkFile("./firebaseConfig.json");
checkFile("./products.json");
checkFile("./server/ravenConfig.json");
checkFile("./server/firebaseServiceAccount.json");
checkFile("./server/paypalsettings.json");
