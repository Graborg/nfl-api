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

module.exports = nconf
