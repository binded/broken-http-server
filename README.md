# broken-http-server

[![Build Status](https://travis-ci.org/blockai/broken-http-server.svg?branch=master)](https://travis-ci.org/blockai/broken-http-server)

A broken HTTP server for testing.

## Install

```bash
npm install --save broken-http-server
```

Requires Node v6+

## Usage

```bash
broken-http-server [port]
```

As a library:

```javascript
import startServer from 'broken-http-server'
startServer()
  .then(({ baseURL, close }) => {
    console.log(`server listening at ${baseURL}`)
    console.log('closing server...')
    return close()
  }).then(() => {
    console.log('server closed')
  })
```

See [./test](./test) directory for more usage examples.

## Routes

**GET /abort**

Closes the socket immediately before replying

**GET /content-length-too-small**

Sends `content-length` header which is smaller than the actual body

**GET /content-length-too-large**

Sends `content-length` header which is larger than the actual body

**GET /stop-writing-body-halfway**

Writes about half the body but stops half way without closing the
socket.