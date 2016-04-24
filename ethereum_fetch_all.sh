#!/bin/bash
node ethereum_stats.js
until [ $? -gt 0 ]; do
    sleep 5
    node ethereum_stats.js
done
