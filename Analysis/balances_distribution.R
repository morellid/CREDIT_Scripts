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

