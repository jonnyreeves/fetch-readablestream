#!/usr/bin/env bash
set -e
set -x

function killChunkedResponseServer {
  echo "Killing ChunkedResponse Server..."
  kill ${SERVER_PID} &> /dev/null
}

echo "Starting ChunkedResponse Server..."
node ./test/server/index.js &
SERVER_PID=$!

# Check the ChunkedResponse server started up ok.
sleep 0.5
ps ${SERVER_PID} &> /dev/null

# Kill the ChunkedREsponse server when this script exists.
trap killChunkedResponseServer EXIT

./node_modules/.bin/karma start $@
