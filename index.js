const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { registerRoutes } = require('./routes')
const port  = require('./config').get('port')

const app = express()

app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://flaps-no-ip.info")
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