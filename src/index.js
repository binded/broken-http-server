import http from 'http'

const promisify = (fn) => (...args) => new Promise((resolve, reject) => {
  fn(...args, (err, result) => {
    if (err) return reject(err)
    resolve(result)
  })
})

export default (port) => new Promise((resolve, reject) => {
  const handleAbort = (msg) => {
    msg.destroy()
  }

  const handleContentLength = ({
    contentLength = Math.floor(Math.random() * 200),
    bodySize = Math.floor(Math.random() * 200),
  } = {}) => (msg, res) => {
    const body = Buffer.alloc(bodySize, 'a')
    // make sure they're different
    const len = contentLength === bodySize ? contentLength + 1 : contentLength
    res.setHeader('Content-Length', len)
    res.end(body)
  }

  const stopWritingBodyHalfway = (msg, res) => {
    res.setHeader('Content-Length', 500)
    const body = Buffer.alloc(250, 'a')
    res.write(body)
  }

  const unknownHandler = (msg, res) => {
    res.statusCode = 404
    res.end()
  }

  const path2handler = {
    '/abort': handleAbort,
    '/content-length': handleContentLength(),
    '/content-length-too-small': handleContentLength({
      contentLength: 100,
      bodySize: 200,
    }),
    '/content-length-too-large': handleContentLength({
      contentLength: 200,
      bodySize: 100,
    }),
    '/stop-writing-body-halfway': stopWritingBodyHalfway,
    '/404': unknownHandler,
  }

  const server = http.createServer((msg, res) => {
    const path = msg.url
    const handler = {}.hasOwnProperty.call(path2handler, path)
      ? path2handler[path]
      : unknownHandler
    handler(msg, res)
  })

  const cb = (err) => {
    if (err) return reject(err)
    const close = promisify(server.close.bind(server))
    const address = server.address()
    const baseURL = `http://localhost:${address.port}`
    resolve({ baseURL, server, close })
  }

  if (Number.isInteger(port)) {
    server.listen(port, cb)
  } else {
    server.listen(cb)
  }
})
