var fs = require("fs");

var dbFileName = "bitcoin_stats.json";

//console.log(web3.eth.gasPrice)
first = "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f";
//process.exit(1);
var db = {
    "miners":["N.A."],
    "days":{},
    "firstBlock": first,
    "lastBlock": first
};

if (fs.existsSync(dbFileName)) {
    console.log("db file exists, loading it");
    db = require("./" + dbFileName);
    console.log("first block is " + db.firstBlock + ", last block is " + db.lastBlock);
    first = db.lastBlock;
}

saveDB = function()
{
	fs.writeFileSync("./" + dbFileName, JSON.stringify(db, null, 2) ,"utf-8");
}


var miners = db.miners;
var days = db.days;

var Client = require('node-rest-client').Client;
var client = new Client();

client.registerMethod("getBlock", "http://127.0.0.1:3001/insight-api/block/${block}", "GET");

createOptionsForBlock = function(block)
{
	return {path: { "block": block}}
}

var options = createOptionsForBlock('000000000000000004fc7cd7507419c346e9a6c126a0fff5d460180189bad126')
//console.log(options);

var currentBlock = {};
var processedBlocks = 0;

var startTime = new Date();

var keepGoing = true;

handleBlock = function(block)
{
    var nextBlock = block.nextblockhash;
    var pool = block.poolInfo;
    var h = block.height;
    var miner = "N.A.";
    if (pool != null && pool.poolName != null)
    {
	//console.log("we have a new miner");
	//console.log(pool);
	miner = pool.poolName;
    }
    var when = new Date(block.time * 1000);

    if (miners.indexOf(miner) < 0) {
	console.log("new miner, adding it to the list " + miner);
	miners.push(miner);
    }
    //console.log("finding miner");
    var minerId = miners.indexOf(miner);
    //console.log("calculating time");
    var startDay = new Date(when.getFullYear(), when.getMonth(), when.getDate());
    var startDayNumber = Math.floor(startDay.getTime()/(24*60*60*1000));
	    
    if (days[startDayNumber] == undefined){
	//console.log("adding day " + startDay);
	days[startDayNumber]={
	    "day": startDayNumber,
	    "dayString" : startDay.toDateString(),
	    miners: {}
	};
    }

    daydata = days[startDayNumber];
    if (daydata.miners[minerId] == undefined) {
	//console.log("adding miner to this day");
	daydata.miners[minerId] = 0;
    }
    daydata.miners[minerId] = daydata.miners[minerId]+1;
    db.lastBlock = block.hash;
    if (h % 1000 == 0) {
		// var elapsed = new Date() - startTime;
		// var averageTime = elapsed/(processedBlocks-first);
		// var missing = lastBlockInChain - i;
		// var ETA = new Date( new Date().getTime() + averageTime * missing);
		// console.log("block " + h + " of " + lastBlockInChain + " ETA " + ETA + ", using " + process.memoryUsage().rss + " rss, "  + process.memoryUsage().heapUsed + " Bytes of " + process.memoryUsage().heapTotal);
		console.log("block " + h);
    }

    if (nextBlock != null)
    {
	// stop every 1000 blocks
	if (processedBlocks < 100000)
	{
	    processedBlocks++;
	    var args = createOptionsForBlock(nextBlock);
	    client.methods.getBlock(args, function (data, response) { handleBlock(data); } );			
	} else 
	{
	    console.log("early stop");
	    // reached the limit for this run of the script
	    // save and exit
	    saveDB();
	    keepGoing = false;
	    process.exit(0);
	}
    } else 
    {
	console.log("next block is null, exiting");
	// no more next block, we got the the end of the blockchain!
	saveDB();
	keepGoing = false;
	process.exit(1);
    }
}

// start the first
var args = createOptionsForBlock(first);
client.methods.getBlock(args, function (data, response) { handleBlock(data); } );
