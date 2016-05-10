library(rjson)

####### bitcoin ######

bitcoin.stats <- rjson::fromJSON(file="../bitcoin_stats.json")

db <- bitcoin.stats

analyse.miner <- function(i){
  miner.data <- c()
  for (d in db$days) {
    d.miners.db <- d[[3]]
    d.miners.ids <- names(d.miners.db)
    d.miners.blocks <- sapply(d.miners.ids, function(n){d.miners.db[n]})
    blocks <- 0 
    if (length(which(d.miners.ids == i)) == 1)
    {
      blocks <- d.miners.blocks[[which(d.miners.ids == i)]]
    }
    miner.data <- c(miner.data, blocks)
  }
  miner.data
}
#plot(analyse.miner(0))
all.miners.data <- sapply(0:(length(db$miners)-1),analyse.miner)
miners.cols <- sapply(1:length(db$miners), function(i){rgb(runif(1,0,1), runif(1,0,1), runif(1,0,1))})
plot(all.miners.data[,1], type="l", main = "Bitcoin daily mined blocks (only mining pools)", xlab = "days", ylab = "blocks",
     col=miners.cols[1])
sapply(2:ncol(all.miners.data), function(i){
  points(all.miners.data[,i], type="l", col=miners.cols[i])
})
#legend("topleft", db$miners, col=miners.cols, horiz = T,lty=1)
legend("topleft", db$miners, col=miners.cols,lty=1)


###### ethereum ########

ethereum.stats <- rjson::fromJSON(file="../ethereum_stats.json")

db <- ethereum.stats

analyse.miner <- function(i){
  miner.data <- c()
  for (d in db$days) {
    #d <- db$days[[50]]
    #i=1
    d.miners.db <- d[[3]]
    d.miners.ids <- names(d.miners.db)
    d.miners.blocks <- sapply(d.miners.ids, function(n){d.miners.db[n]})
    blocks <- 0 
    if (length(which(d.miners.ids == i)) == 1)
    {
      blocks <- d.miners.blocks[[which(d.miners.ids == i)]]
    }
    miner.data <- c(miner.data, blocks)
  }
  miner.data
}
#plot(analyse.miner(0))
#all.miners.data <- sapply(0:2,analyse.miner)
all.miners.data <- sapply(0:(length(db$miners)-1),analyse.miner)
#dim(all.miners.data)
#length(db$miners)
# keep only the 20 most active miners
miner.blocks.total <- sapply(1:ncol(all.miners.data), function(col){sum(all.miners.data[,col])})
threshold = sort(miner.blocks.total)[length(miner.blocks.total)-20]
frequent.miners = which(miner.blocks.total >= threshold)
generic.miner <- sapply(1:nrow(all.miners.data), function(row){sum(all.miners.data[row,-frequent.miners])})

miners.cols <- sapply(1:length(frequent.miners), function(i){rgb(runif(1,0,1), runif(1,0,1), runif(1,0,1))})
plot(generic.miner, type="l", main = "Ethereum daily mined blocks (only 20 most active miners)", xlab = "days", ylab = "blocks",
     col="black", ylim = c(0,max(generic.miner, all.miners.data)))
sapply(1:length(frequent.miners), function(i){
  points(all.miners.data[,frequent.miners[i]], type="l", col=miners.cols[i])
})

last.day <- db$days[[length(db$days)-1]]
table(sapply(1:length(last.day$miners), function(i){last.day$miners[[i]]}))
