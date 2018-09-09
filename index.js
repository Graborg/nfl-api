const express = require('express')
const bodyParser = require('body-parser')
const { registerRoutes } = require('./routes')
const port  = require('./config').get('port')

const app = express()
const cors = require('cors')
app.use(cors())

app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

app.use(bodyParser.json())

registerRoutes(app)
app.listen(port, () => {
    console.log('Listening on port', port)
})