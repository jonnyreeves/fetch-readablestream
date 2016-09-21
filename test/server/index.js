'use strict';

const http = require('http');
const url = require('url');
const cookieParser = require('cookie');

// Which port should HTTP traffic be served over?
const httpPort = process.env.HTTP_PORT || 2001;

// How frequently should chunks be written to the response?  Note that we have no
// control over when chunks are actually emitted to the client so it's best to keep
// this value high and pray to the gods of TCP.
const CHUNK_INTERVAL_MS = process.env.CHUNK_INTERVAL_MS || 250;

let _lastRequestClosedByClient = false;

function readBody(req) {
  return new Promise(function (resolve) {
    const body = [];
    req.on('data', function (chunk) {
      body.push(chunk);
    }).on('end', function () {
      resolve(Buffer.concat(body).toString('utf8'));
    });
  });
}

function echoHandler(req, res) {
  readBody(req)
      .then(function (body) {
        res.setHeader('x-powered-by', 'nodejs');
        res.end(JSON.stringify({
          headers: req.headers,
          method: req.method,
          cookies: cookieParser.parse(req.headers.cookie || ''),
          body: body
        }));
      });
}

function serveChunksHandler(req, res) {
  _lastRequestClosedByClient = false;
  req.on('close', function () {
    _lastRequestClosedByClient = true;
  });

  readBody(req)
      .then(function (body) {
        try {
          const chunks = JSON.parse(body);

          res.setHeader('Transfer-Encoding', 'chunked');
          res.setHeader('Content-Type', 'text/html; charset=UTF-8');

          for (let i = 0; i < chunks.length; i++) {
            setTimeout(function (idx) {
              res.write(chunks[idx] + "\n");
              if (idx === chunks.length - 1) {
                res.end();
              }
            }, i * CHUNK_INTERVAL_MS, i);
          }
        } catch (e) {
          res.writeHead(400);
          res.end("Invalid JSON payload: " + e.message);
        }
      });
}

function lastRequestClosedHandler(req, res) {
  res.end(JSON.stringify({ value: _lastRequestClosedByClient }));
}

function failureHandler(req, res) {
  res.writeHead(500);
  res.end("Intentional server error");
}

function handleSrv(req, res) {
  const url = req.parsedUrl;
  switch (url.query.method) {
  case "echo":
    return echoHandler(req, res);
  case "500":
    return failureHandler(req, res);
  case "send-chunks":
    return serveChunksHandler(req, res);
  case "last-request-closed":
    return lastRequestClosedHandler(req, res);
  default:
    res.writeHead(400);
    res.end("Unsupported method: ?method=" + url.query.method);
  }
}

function handler(req, res) {
  req.parsedUrl = url.parse(req.url, true);
  if (req.parsedUrl.pathname === '/srv') {
    return handleSrv(req, res);
  }
  res.writeHead(404);
  res.end("Not found, try /srv");
}

console.log("Serving on http://localhost:" + httpPort);
http.createServer(handler).listen(httpPort);