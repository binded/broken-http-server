#!/usr/bin/env node
/* eslint-disable no-console */
import yargs from 'yargs'
import start from '../'

const argv = yargs
  .usage('$0 [port]')
  .help()
  .argv

start(argv._[0])
  .then(({ baseURL }) => {
    console.log(baseURL)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
