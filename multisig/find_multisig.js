//var bl_hex = "0xb98cff23d33069f2e9dd895a7ece46737095e57d93b47dbd3b777094eacdeef7"

var Web3 = require("web3");
var fs = require("fs");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

/* 
the DAO attack was known at June 17th 7:30, soft fork update released at the same time
unix time: 1466148600
1 week before soft fork: 1465543800
1 week after soft fork: 1466753400



/*
var contr_code = web3.eth.getCode("0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe");
var signature = web3.sha3("removeOwner(address)").substring(2, 8+2);
contr_code.includes(signature);
analyseContract("0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe")
analyseContract("0x3025cB17FF79E731E8786af0bf08Ac611F530B2a")
analyseContract("0xbF35fAA9C265bAf50C9CFF8c389C363B05753275")

*/

// signatures that indicate a multisig wallet, used in AND
// this set of signatures matches with 
// https://etherscan.io/address/0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae#code
var signatures = ["removeOwner(address)", "isOwner(address)", "m_numOwners()", "addOwner(address)", "kill(address)", "changeRequirement(uint256)"];

var bl_hash = "0x35f59c4c569b9973450e8d738f9e8027139c235169114690951dc2e8a159894d";
var blocksDone = 0;
var maxBlocksDone = 1000000000;
var keepSearching = true;

var softForkTimestamp = 1466148600;

var days = [];

var minimumTimestamp = softForkTimestamp-7*24*60*60;
var maximumTimestamp = softForkTimestamp+7*24*60*60;

for (var i = 0; i < 14; i++) {
    days.push({
        day: minimumTimestamp+i*60*60*24,
        'matching_contracts': [],
        'contracts':[]        
    });
};

var whichDay = function(d) {
    return Math.floor((d - minimumTimestamp)/(60*60*24));
}

var analyseContract = function(contract_addr)
{
    var contr_code = web3.eth.getCode(contract_addr);
    // signatures checked in AND
    for (var i = signatures.length - 1; i >= 0; i--) {
        var signature = web3.sha3(signatures[i]).substring(2, 8+2);
        if (!contr_code.includes(signature))
            return false;
    };
    return true;
}

var printResult = function()
{
    console.log("analysed " + blocksDone + " blocks");
    console.log("processed " + days.length + " days");
    var totMatch = 0;
    var tot = 0;
    for (var i = 0; i < days.length; i++) {
        totMatch+=days[i].matching_contracts.length;
        tot+=days[i].contracts.length;
    };
    console.log("found " + tot + " contracts");
    console.log("found " + totMatch + " matching contracts");
    //console.log(matching_contracts);
}

var resetResults = function()
{
    bl_hash = "latest";
    blocksDone = 0;
    maxBlocksDone = 10000;
    keepSearching = true;
}

var analyseBlock = function()
{

    blocksDone++;
    //console.log("level " + blocksDone + " processing block " + bl_hash);  
    web3.eth.getBlock(bl_hash, function(error, bl)
    {
        if (error)
        {
            console.log(error);
        } else 
        {
            if (!keepSearching)
            {
                console.log("cancelling");
                return;
            }
            if (bl == null)
            {
                console.log("found null block");
                printResult();
                return;
            }

            //var bl = web3.eth.getBlock(bl_hash);
            var txs = bl.transactions;
            if (txs == null)
            {
                console.log("found genesis block");
                printResult();
                return;
            }
            if (bl.timestamp < minimumTimestamp)
            {
                console.log("reached minimumTimestamp");
                printResult();
                return;                
            }
            if (bl.timestamp < maximumTimestamp)
            {
                day = days[whichDay(bl.timestamp)];
                for(var i=0; i<txs.length; i++){
                    //console.log(txs[i]);
                    var tx = web3.eth.getTransactionReceipt(txs[i]);
                    var contr = tx.contractAddress;
                    if (contr)
                    {
                        console.log("found contract at " + contr);  
                        if (analyseContract(contr))
                        {
                            console.log("found an instance at " + contr);                   
                            day.matching_contracts.push(contr); 
                        }
                        day.contracts.push(contr);  
                    }
                }
            }
            if (blocksDone < maxBlocksDone)
            {
                if (bl.parentHash != null)
                {
                    bl_hash = bl.parentHash;
                    analyseBlock();
                } else 
                {
                    console.log("found a null parent");
                    keepSearching = false;
                }
            } else 
            {
                console.log("reached maximum number of blocks");
                keepSearching = false;
            }
        }
    })

}

var fetchAllContracts = function()
{
    resetResults();
    analyseBlock();
}

var fetch1000blocks = function()
{
    //resetResults();
    blocksDone = 0;
    maxBlocksDone = 1000;
    keepSearching = true;
    analyseBlock();
}

var fs = require("fs")
var datafile = './multisig_data_overtime.json';
var saveStatus = function()
{
    // things to save:
    // bl_hash
    // matching_contracts;
    // contracts;
    var obj = {
    };
    obj["last_hash"] = bl_hash;
    obj["days"] = days;
    fs.writeFile(datafile, JSON.stringify(obj) , 'utf-8');
    console.log("wrote " + datafile);
    console.log("last hash is " + bl_hash);
    console.log("with  " + days.length + " days");
}

var loadStatus = function()
{
    var obj = JSON.parse(fs.readFileSync(datafile, 'utf8'));
    bl_hash = obj["last_hash"];
    days = obj["days"];
    contracts = obj["contracts"];
    console.log("read " + datafile);
    console.log("last hash is " + bl_hash);
    console.log("with  " + days.length + " days");
}
// var contract_code = web3.eth.getCode("0xc57ed4893c79189f6bcfd181cf42d842fdb3e5a8");
// var sign = web3.sha3("greeter()").substring(2, 8+2);

// keepSearching = false;
// printResult();
// saveStatus();
// keepSearching = true;
// analyseBlock();

