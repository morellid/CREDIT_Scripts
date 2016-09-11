var fs = require("fs");

// year-month-day
var day = "2012-01-01";

if (process.argv.length <= 2) {
    console.log("Usage: " + __filename + " day [limit]");
    console.log("day must be in the form year-month-day, example: 2012-01-20");
    console.log("limit is optional, is the maximum number of transaction to process, default is no limit");
    process.exit(-1);
}
 
day = process.argv[2];

var dbFileName = "bitcoin-transactions-"+day+".json";

// http://127.0.0.1:3001/insight-api/blocks?limit=3&blockDate=2016-04-22
// 0000000000000000010b64b22d6676a93a638b079a402972fd41bc44eef90175

limit = -1;
count=0;

db=[];

saveDB = function()
{
    console.log("processed " + count + " transactions");
    console.log("writing the db to file " + dbFileName);
    console.log("db has " + db.length + " items");
    fs.writeFileSync("./Analysis/" + dbFileName, JSON.stringify(db, null, 2) ,"utf-8");
}



var Client = require('node-rest-client').Client;
var client = new Client();

createOptionsForGetTx = function(tx)
{
    return {path: {"tx":tx}};
}
client.registerMethod("getTransaction", "http://127.0.0.1:3001/insight-api/tx/${tx}", "GET");
// returns:
// {"vin":[{"addr":"ADDR","value":1.0}],"vout":[{"value":1.0,"scriptPubKey":{"addresses":["ADDR"]}}],"valueOut":1.0,"valueIn":1.0}

createOptionsForGetBlocks = function(day)
{
    return {parameters: {"blockDate": day}};
}
client.registerMethod("getBlocks", "http://127.0.0.1:3001/insight-api/blocks", "GET");
// returns:
// {"blocks":[{...,"hash":"HASH1"},{...,"hash":"HASH2"}], "length": 100, "pagination":{"prev":"2016-04-21", "next":"2016-04-23"}}

createOptionsForGetBlock = function(block)
{
    return {path: {"block": block}};
}
client.registerMethod("getBlock", "http://127.0.0.1:3001/insight-api/block/${block}", "GET");
//returns:
// {..., tx:["TXID1","TXID2",...]}

var blocks = [];
var blockIndex = 0;
var txs = [];
var txIndex = 0;

var startTime = new Date();

var keepGoing = true;

handleTx = function(data)
{
    if(Buffer.isBuffer(data)){                                                                                      
        data = JSON.parse(data);                                                                                    
    }
    //console.log(data.txid);
    if (data.IsCoinBase == undefined || data.isCoinBase == false)
    {
	var tx = {addrIn:[],amountsIn:[],addrOut:[],amountsOut:[],valueOut:1.0};
	for (var i=0;i<data.vin.length;i++)
	{
	    if (data.vin[i].addr == undefined)
	    {
		// if we are here then this is a brand new bitcoin
	    } else 
	    {
		// if this is a new address, add a new item in the list of known in addresses
		// and in the list for input values
		if (tx.addrIn.indexOf(data.vin[i].addr)<0)
		{
		    tx.addrIn.push(data.vin[i].addr);
		    tx.amountsIn.push(0.0);
		}
		tx.amountsIn[tx.addrIn.indexOf(data.vin[i].addr)] += data.vin[i].value;
	    }
	}
	for (var i=0;i<data.vout.length;i++)
	{
	    var adds = data.vout[i].scriptPubKey.addresses;
	    if (adds == undefined)
	    {
		console.log("no out addresses for tx " + data.txid);
	    } else 
	    {
		for (var j=0;j<adds.length;j++)
		{
		    tx.addrOut.push(adds[j]);
		    tx.amountsOut.push(data.vout[i].value);
		}
	    }
	}
	tx.valueOut = data.valueOut;
	// add the transaction summary in the output db
	db.push(tx);
	//console.log(tx);
    }



    // recursive calls:
    //process.exit();
    //return 0.0;

    count++;
    if (count>limit && limit >= 0)
    {
	saveDB();
	process.exit();
	return;
    }

    txIndex++;

    // if this is not the last transaction, go to the next one
    if (txIndex < txs.length)
    {
	var args = createOptionsForGetTx(txs[txIndex]);
	//console.log("fetching tx " + txs[txIndex]);
	client.methods.getTransaction(args, function (data,response) { handleTx(data); });
    } else 
    {
	blockIndex++;

	// if this is the last transaction:
	if (blockIndex<blocks.length)
	{
	    // if this is not the last block, go to the next one
	    console.log("fetching block " + blocks[blockIndex] + " (" + blockIndex + " of " + blocks.length + ")" );
	    var args = createOptionsForGetBlock(blocks[blockIndex]);
	    client.methods.getBlock(args, function (data, response) { handleBlock(data);});
	} else 
	{
	    // if this is the last block, we are done
	    // write the file and exit
	    saveDB();
	    process.exit(1);
	}
    }
}

handleBlock = function(data)
{
    if(Buffer.isBuffer(data)){                                                                                    
        data = JSON.parse(data);                                                                                   
    }
    //console.log("found " + data["tx"].length + " transactions");
    //console.log("fetching transaction " + data.tx[1]);
    txIndex=0;
    txs=data.tx;
    var args = createOptionsForGetTx(txs[txIndex]);
    client.methods.getTransaction(args, function (data,response) { handleTx(data); });
}

handleBlocks = function(data)
{
    if(Buffer.isBuffer(data)){
	//data = data.toString('utf8');
	data = JSON.parse(data);
    }
    var bs = data["blocks"];
    console.log("found " + bs.length + " blocks");
    for(var i=0; i<bs.length; i++)
    {
	var b = bs[i];
	blocks.push(b.hash);
    }
    blockIndex=0;
    var  h = blocks[blockIndex];
    console.log("fetching block with hash "+h);
    var args = createOptionsForGetBlock(h);
    client.methods.getBlock(args, function (data, response) { handleBlock(data);});
}

var args = createOptionsForGetBlocks(day)
client.methods.getBlocks(args, function (data, response) { handleBlocks(data); } );
