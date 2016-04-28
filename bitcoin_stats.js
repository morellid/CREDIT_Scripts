var fs = require("fs");

var dbFileName = "bitcoin_stats.json";

//console.log(web3.eth.gasPrice)
first = "0000000000000000000000000000000000000000000000000000000000000000";
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

client.registerMethod("getBlock", "http://127.0.0.1:8889/insight-api/block/${block}", "GET");

createOptionsForBlock = function(block)
{
	return {path: { "block": block}}
}

var options = createOptionsForBlock('000000000000000004fc7cd7507419c346e9a6c126a0fff5d460180189bad126')
console.log(options);

var currentBlock = {};
var processedBlocks = 0;

var startTime = new Date();

handleBlock = function(block)
{
	var nextBlock = block.nextblockhash;
	var pool = block.poolInfo;
	var h = block.height;
	var miner = "N.A.";
	if (pool != null)
	{
		var miner = pool.poolName;
	}
	var when = new Date(block.time * 1000);



    if (miners.indexOf(miner) < 0) {
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
    if (h % 10 == 0) {
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
		if (processedBlocks < 10)
		{
			var options = createOptionsForBlock(nextBlock);
			client.methods.jsonMethod(args, function (data, response) { handleBLock(data); } );			
		} else 
		{
			saveDB();
		}
	}
}

// start the first
client.methods.jsonMethod(args, function (data, response) { currentBlock = data; } );

/*



//process.on( 'SIGINT', function() {
//    console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
//    // some other closing procedures go here
//    console.log("writing file to disk before shutting down...");
//    fs.writeFileSync("./ethereum_Stats.json", JSON.stringify(db, null, 2) ,"utf-8")
//    process.exit( );
//})
var lastBlockInChain = web3.eth.blockNumber;
var maxBlock = first + 1023;
// if you want to skip every other block (to analyse faster, only looking at a portion of the blocks) use a value larger than 1
// e.g. skip=2 will look only at odd blocks
// DO NOT SET skip=0 or this script will never end, crashing the machine (it will use all the memory)
var skip = 1;
console.log("will now crunch blocks from " + first + " to " + maxBlock);
var startTime = new Date();
for(var i=first; i<maxBlock; i++)
{
    if (i > lastBlockInChain) {
	console.log("we have processed all blocks");
	fs.writeFileSync("./" + dbFileName, JSON.stringify(db, null, 2) ,"utf-8");
	process.exit(1);
    } else 
    {

	//console.log("getting bock");
	var b = web3.eth.getBlock(i * skip);
	if (b == null) {
	    console.log("block " + i + " is null!");
	} else {
	    var miner = b.miner;
	    if (miners.indexOf(miner) < 0) {
		miners.push(miner);
	    }
	    //console.log("finding miner");
	    var minerId = miners.indexOf(miner);
	    //console.log("calculating time");
	    var d = new Date(b.timestamp * 1000);
	    var startDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
	    var startDayNumber = Math.floor(startDay.getTime()/(24*60*60*1000));
	    //console.log("miner " + b.miner + " mined " + startDay + " " + startDayNumber);
	    //    if (i % 10 == 0) {
	    //        console.log("day " + startDayNumber + ", processed " + i + " blocks, found " + miners.length + " miners");
	    //    }
	    
	    if (days[startDayNumber] == undefined){
		//console.log("adding day " + startDay);
		days[startDayNumber]={
		    "day": startDayNumber,
		    "dayString" : startDay.toDateString(),
		    miners: {}
		};
	    }
	    //console.log("getting day data");
	    daydata = days[startDayNumber];
	    if (daydata.miners[minerId] == undefined) {
		//console.log("adding miner to this day");
		daydata.miners[minerId] = 0;
	    }
	    //console.log("incrementing mined blocks of this miner");
	    daydata.miners[minerId] = daydata.miners[minerId]+1;
	    if (i % 10 == 0) {
		var elapsed = new Date() - startTime;
		var averageTime = elapsed/(i-first);
		var missing = lastBlockInChain - i;
		var ETA = new Date( new Date().getTime() + averageTime * missing);
		console.log("block " + i + " of " + lastBlockInChain + " ETA " + ETA + ", using " + process.memoryUsage().rss + " rss, "  + process.memoryUsage().heapUsed + " Bytes of " + process.memoryUsage().heapTotal);
	    }

	}
	db.lastBlock=i;
    }
}

//console.log(db);
console.log("finished batch, total miners: " + miners.length);
//console.log(days);

fs.writeFileSync("./" + dbFileName, JSON.stringify(db, null, 2) ,"utf-8")
// TODO return continuation token
process.exit(0);
*/