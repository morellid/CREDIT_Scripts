library(rjson)

####### bitcoin ######

bitcoin.stats <- rjson::fromJSON(file="../bitcoin_stats.json")

db <- bitcoin.stats
#db$days[[1]]$dayString
d0 <- as.POSIXlt("2009-01-03")
d0.index <- db$days[[1]]$day
is.first.day.of.year <- function(d) {
  d$yday == 0  
}
is.first.day.of.month <- function(d) {
  d$mday == 1  
}
one.day <- 3600*24

to.day <- function(i){as.POSIXlt(d0+one.day*i)}

years.indexes <- which(sapply(db$days, function(d){ is.first.day.of.year(to.day(d$day-d0.index)) }))
months.indexes <- which(sapply(db$days, function(d){ is.first.day.of.month(to.day(d$day-d0.index)) }))

#to.day(db$days[[length(db$days)]]$day-d0.index)
#db$days[[length(db$days)]]$dayString

#to.day(db$days[[1]]$day-d0.index)
#db$days[[1]]$dayString

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

write.table(all.miners.data, file="bitcoin.miners.data.csv", row.names = F, col.names = db$miners, sep=",")

miners.cols <- sapply(1:length(db$miners), function(i){rgb(runif(1,0,1), runif(1,0,1), runif(1,0,1))})
plot(all.miners.data[,1], type="l", main = "Bitcoin daily mined blocks (only mining pools)", xlab = "days", ylab = "blocks",
     col=miners.cols[1], log="y")
dev.null <- sapply(2:ncol(all.miners.data), function(i){
  points(all.miners.data[,i], type="l", col=miners.cols[i])
})
dev.null <- sapply(years.indexes, function(y){ abline(v=y, lty=1)  })
dev.null <- sapply(months.indexes, function(m){ abline(v=m, lty=2)  })
#legend("topleft", db$miners, col=miners.cols, horiz = T,lty=1)
#legend("topleft", db$miners, col=miners.cols,lty=1)


norm.factor <- log2(ncol(all.miners.data) + max(all.miners.data[,1]))
daily.cross.entropy <- sapply(1:nrow(all.miners.data), function(row){
  daily.sum <- sum(all.miners.data[row,])
  tmp.entropy <- sapply(2:ncol(all.miners.data), function(col) {
    p <- all.miners.data[row,col]/daily.sum
    if (p==0)
      0.0
    else
      - p * log2(p)
  })
  # col 1 is special (N.A.)
  how.many.na =  all.miners.data[row,1]/daily.sum
  prob.each.na = 1.0/daily.sum * log2(1.0/daily.sum)
  first = how.many.na * prob.each.na
  if (first < 0)
    first <- 0
  sum(tmp.entropy) + first
}) / norm.factor

plot(daily.cross.entropy, main = "Bitcoin daily cross entropy", xlab="days", ylab = "cross entropy", type="l")
dev.null <- sapply(years.indexes, function(y){ abline(v=y, lty=1)  })
dev.null <- sapply(months.indexes, function(m){ abline(v=m, lty=2)  })



###### ethereum ########

ethereum.stats <- rjson::fromJSON(file="../ethereum_stats.json")

db <- ethereum.stats
#length(db$miners)
db$days[[1]]$dayString
d0 <- as.POSIXlt("2015-07-30")
d0.index <- db$days[[1]]$day
is.first.day.of.year <- function(d) {
  d$yday == 0  
}
is.first.day.of.month <- function(d) {
  d$mday == 1  
}
one.day <- 3600*24

to.day <- function(i){as.POSIXlt(d0+one.day*i)}

years.indexes <- which(sapply(db$days, function(d){ is.first.day.of.year(to.day(d$day-d0.index)) }))
months.indexes <- which(sapply(db$days, function(d){ is.first.day.of.month(to.day(d$day-d0.index)) }))

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

write.table(all.miners.data, file="ethereum.miners.data.csv", row.names = F, col.names = db$miners, sep=",")


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


norm.factor <- log2(ncol(all.miners.data) + max(all.miners.data[,1]))
daily.cross.entropy <- sapply(1:nrow(all.miners.data), function(row){
  daily.sum <- sum(all.miners.data[row,])
  tmp.entropy <- sapply(2:ncol(all.miners.data), function(col) {
    p <- all.miners.data[row,col]/daily.sum
    if (p==0)
      0.0
    else
      - p * log2(p)
  })
  sum(tmp.entropy)
}) / norm.factor

save(daily.cross.entropy, file="ethereum.daily.cross.entropy.Rdata")

plot(daily.cross.entropy, main = "Ethereum daily cross entropy", xlab="days", ylab = "cross entropy", type="l")
