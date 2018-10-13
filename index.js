const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { registerRoutes } = require('./routes')
const config = require('./config')
const port = config.get('port')
const frontendDomain = config.get('frontendDomain')
const app = express()

app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", frontendDomain)
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE')
    res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept, Set-Cookie")
    res.header("Access-Control-Allow-Credentials", "true")
    next()
})

app.use(bodyParser.json())
app.use(cookieParser())

registerRoutes(app)
app.listen(port, () => {
    console.log('Listening on port', port)
})