var Web3 = require("web3");
var fs = require("fs");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
//console.log(web3.eth.gasPrice)
var db = {
    "miners":[],
    "days":{}
};
var miners = db.miners;
var days = db.days;
var maxBlock = web3.eth.blockNumber;
for(var i=1; i<1000; i++)
{
    var b = web3.eth.getBlock(i);
    var miner = b.miner;
    if (miners.indexOf(miner) < 0) {
	miners.push(miner);
    }
    var minerId = miners.indexOf(miner);
    var d = new Date(b.timestamp * 1000);
    var startDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var startDayNumber = Math.floor(startDay.getTime()/(24*60*60*1000));
    //console.log("miner " + b.miner + " mined " + startDay + " " + startDayNumber);

    if (i % 100 == 0) {
        console.log("day " + startDayNumber + ", processed " + i + " blocks, found " + miners.length + " miners");
    }

    if (days[startDayNumber] == undefined){

	//console.log(startDay);
	days[startDayNumber]={
	    "day": startDayNumber,
	    "dayString" : startDay.toDateString(),
	    miners: {}
	};
    }
    daydata = days[startDayNumber];
    if (daydata.miners[minerId] == undefined) {
	daydata.miners[minerId] = 0;
    }
    daydata.miners[minerId] = daydata.miners[minerId]+1;
}
console.log(db);

fs.writeFileSync("./ethereum_Stats.json", JSON.stringify(db, null, 2) ,"utf-8")
