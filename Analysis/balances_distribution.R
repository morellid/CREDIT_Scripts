library(rjson)
balances.data <- fromJSON(file="balances_data.json")
balances <- sapply(balances.data$addresses, function(i){as.numeric(i)})
balances.quantiles <- quantile(balances/1e18, (1:100)/100)

gimme.perc <- function(from, to) {
  length(which((balances/1.0e18)<to & (balances/1.0e18)>=from))/length(balances)
}
froms <- c(0.0, 1.0e-17, 0.01, 0.1, 1.0, 10.0, 100.0, 1000.0, 1.0e6)
tos <- c(1.0e-17, 0.01, 0.1, 1.0, 10.0, 100.0, 1000.0, 1.0e6, 1.0e8)

percs <- sapply(1:length(froms), function(row) {gimme.perc(froms[row], tos[row])})

library(xtable)

print(xtable(data.frame(from=froms, to=tos, percentage=percs)), include.rownames = F)

length(balances)

max(balances/1.0e18)

multisig.data <- fromJSON(file="multisig_data.json")

balance.addresses <- names(balances.data$addresses)
balance.is.multisig <- sapply(balance.addresses, function(i) {i %in% multisig.data$matching_contracts})
summary(balance.is.multisig)
length(multisig.data$matching_contracts)
length(multisig.data$contracts)


multisig.hist.data <- fromJSON(file="multisig_data_overtime.json")
tot <- sapply(multisig.hist.data$days, function(d){length(d$contracts)})
matching <- sapply(multisig.hist.data$days, function(d){length(d$matching_contracts)})

plot(1:length(multisig.hist.data$days)-7, tot, 
       type = "l", col="black", main = "number of contracts", 
       xlab = "days from soft fork",
       ylab = "number of contracts")
abline(v=0)

plot(1:length(multisig.hist.data$days)-7, matching, 
     type = "l", col="black", main = "number of multisig", 
     xlab = "days from soft fork",
     ylab = "number of multisig wallets")
abline(v=0)

ratio <- matching/tot
plot(ratio, type = "l", main = "ratio of multisig vs contracts")
abline(v=7)

