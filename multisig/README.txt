# to use the script in node start a node instance from the repo root folder and send the folling commands:
var fs = require('fs');
eval(fs.readFileSync('./multisig/find_multisig.js')+'');
resetResults();
fetchAllContracts();

to stop the script send this command:
keepSearching= false