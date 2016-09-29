import test from 'blue-tape'
import axios from 'axios'
import Timeout from 'stream-timeout'
import startServer from '../src'

let baseURL
let close
let client

test('setup', async () => {
  const result = await startServer()
  baseURL = result.baseURL
  close = result.close
  client = axios.create({ baseURL })
})

test('/abort', async (t) => {
  try {
    await client.get('/abort')
    t.fail('should have thrown')
  } catch (err) {
    t.equal(err.message, 'socket hang up')
  }
})

test('/content-length-too-small', async (t) => {
  try {
    await client.get('/content-length-too-small')
    t.fail('should have thrown')
  } catch (err) {
    t.equal(err.message, 'Parse Error')
  }
})

test('/content-length-too-large', async (t) => {
  // this does not throw
  const { data, headers } = await client.get('/content-length-too-large')
  t.equal(headers['content-length'], '200')
  t.equal(data.length, 100)
})

test('/stop-writing-body-halfway', async (t) => {
  // this does not throw
  try {
    const response = await client.get('/stop-writing-body-halfway', {
      timeout: 100,
      responseType: 'stream',
    })
    const { data } = response
    await new Promise((resolve, reject) => {
      const bufs = []
      data
        .pipe(new Timeout(200))
        .on('timeout', () => {
          data.req.abort()
          const err = new Error('timeout')
          err.data = Buffer.concat(bufs)
          reject(err)
        })
      data.on('data', (buf) => {
        bufs.push(buf)
      })
    })
    t.fail('should have thrown')
  } catch (err) {
    t.equal(err.data.length, 250)
    t.equal(err.message, 'timeout')
  }
})

test('close server', async () => {
  await close()
})
