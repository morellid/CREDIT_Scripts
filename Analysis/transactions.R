# need R >= 3.1
# need igraph, rjson
library(igraph)
txs <- rjson::fromJSON(file="CREDIT_Scripts/Analysis/bitcoin-transactions-2012-01-02.json")

# vertices and edges
vs <- c()
es <- data.frame(from=c(), to=c())

dev.null <- sapply(txs, function(tx){
  if (length(tx$addrIn)>0)
  {
    for (a in tx$addrIn)
    {
      if (!(a %in% vs))
      {
        vs <<- c(a, vs)
      }
    }
  }
  if (length(tx$addrOut)>0)
  {
    for (a in tx$addrOut)
    {
      if (!(a %in% vs))
      {
        vs <<- c(a, vs)
      }
    }
  }
})

dev.null <- sapply(txs, function(tx){
  if (length(tx$addrIn)>0 && length(tx$addrOut)>0)
  {
    for (addrin in tx$addrIn)
    {
      for (addrout in tx$addrOut)
      {
        es <<- rbind(c(match(addrin, vs),match(addrout, vs)), es)
      }
    }
  }
})

g <- graph(as.vector(t(es)))
