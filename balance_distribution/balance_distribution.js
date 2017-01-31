//var bl_hex = "0xb98cff23d33069f2e9dd895a7ece46737095e57d93b47dbd3b777094eacdeef7"

var Web3 = require("web3");
var fs = require("fs");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var bl_hash = "latest";
var blocksDone = 0;
var maxBlocksDone = 10000000;
var keepSearching = true;

var addresses = {};


var printResult = function()
{
    console.log("analysed " + blocksDone + " blocks");
    console.log("found " + addresses.length + " addresses");
    //console.log(matching_contracts);
}

var resetResults = function()
{
    bl_hash = "latest";
    blocksDone = 0;
    maxBlocksDone = 10000;
    keepSearching = true;
    addresses = {};
}

var addAddress = function(address)
{
    if (!(address) in addresses)
    {
        var balance = web3.eth.getBalance(address);
        address[address] = balance;
    }
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
            for(var i=0; i<txs.length; i++){
                //console.log(txs[i]);
                var tx = web3.eth.getTransactionReceipt(txs[i]);
                addAddress(tx.from);
                if (tx.to != null)
                    addAddress(tx.to);
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

var fetchAllAddresses = function()
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
var datafile = './balances_data.json';
var saveStatus = function()
{
    // things to save:
    // bl_hash
    // matching_contracts;
    // contracts;
    var obj = {
    };
    obj["last_hash"] = bl_hash;
    obj["addresses"] = addresses;
    fs.writeFile(datafile, JSON.stringify(obj) , 'utf-8');
    console.log("wrote " + datafile);
    console.log("last hash is " + bl_hash);
    console.log("with  " + addresses.length + " addresses");
}

var loadStatus = function()
{
    var obj = JSON.parse(fs.readFileSync(datafile, 'utf8'));
    bl_hash = obj["last_hash"];
    addresses = obj["addresses"];
    console.log("read " + datafile);
    console.log("last hash is " + bl_hash);
    console.log("with  " + addresses.length + " addresses");
}
// var contract_code = web3.eth.getCode("0xc57ed4893c79189f6bcfd181cf42d842fdb3e5a8");
// var sign = web3.sha3("greeter()").substring(2, 8+2);

// keepSearching = false;
// printResult();
// saveStatus();
// keepSearching = true;
// analyseBlock();

