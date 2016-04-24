var Web3 = require("web3");
var fs = require("fs");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var dbFileName = "ethereum_stats.json";

//console.log(web3.eth.gasPrice)
first = 1
//process.exit(1);
var db = {
    "miners":[],
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

var miners = db.miners;
var days = db.days;

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
console.log("will now cruch blocks from " + first + " to " + maxBlock);
for(var i=first; i<maxBlock; i++)
{
    if (i > lastBlockInChain) {
	console.log("we have processed all blocks");
	fs.writeFileSync("./" + dbFileName, JSON.stringify(db, null, 2) ,"utf-8")
	console.log("TODO: return completion handle");
	process.exit(1);
    } else 
    {
	var startTime = new Date();
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
	    var elapsed = new Date() - startTime;
	    console.log("block " + i + " in " + elapsed + "ms, using " + process.memoryUsage().rss + " rss, "  + process.memoryUsage().heapUsed + " Bytes of " + process.memoryUsage().heapTotal);
	}
	db.lastBlock=i;
    }
}

console.log(db);

fs.writeFileSync("./" + dbFileName, JSON.stringify(db, null, 2) ,"utf-8")
// TODO return continuation token
process.exit(0);
