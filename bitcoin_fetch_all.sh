#!/bin/bash
node bitcoin_stats.js
until [ $? -gt 0 ]; do
    sleep 5
    node bitcoin_stats.js
done
