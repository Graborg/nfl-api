const fs = require('fs')
const nconf = require('nconf').env({
    separator: '__',
    lowerCase: true
})

nconf.file({
    file: 'config.json',
    dir: '../',
    search: true
})

nconf.defaults({
    sportRadar: {
        api_key: ''
    },
    env: 'DEVELOP',
    'port': 7331
})

if (fs.existsSync('/run/secrets/sportRadarApiKey')) {
    nconf.set('sportRadar:api_key', fs.readFileSync('/run/secrets/sportRadarApiKey', 'utf8'))
}
module.exports = nconf
