const fs = require('fs')
const nconf = require('nconf')

nconf.file({
  file: 'config.json',
  dir: '../',
  search: true
})
nconf.argv()
  .env()

nconf.defaults({
  rethinkdb: {
    host: 'localhost'
  },
  sportRadar: {
    api_key: ''
  },
  env: 'DEVELOP',
  'port': 7331,
  frontendDomain: 'http://localhost:3333'
})

if (fs.existsSync('/run/secrets/sportRadarApiKey')) {
  nconf.set('sportRadar:api_key', fs.readFileSync('/run/secrets/sportRadarApiKey', 'utf8'))
}
module.exports = nconf
