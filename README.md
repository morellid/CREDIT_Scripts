= CREDIT script repo

This repo contains the scripts used to analyse the Bitcoin and the Ethereum blockchains.

== Bitcoin

TODO

to connect to the blockchain explorer run this command on your laptop:
ssh YOURUSER@credit.northeurope.cloudapp.azure.com -L 8889:localhost:3001 -N &
(obviously changing YOURUSER to your actual user)
then point your browser to
http://localhost:8889/insight

== Ethereum

geth needs to be running wiht the --rpc option

install nvm (see the web)

install v4
``nvm install v4''

use v4
``nvm use v4''

install web3 using npm
``npm install web3''

start the script
node ethereum_stats.js

it will produce a large json with all the miners, and how many blocks each one mined, day by day.


 