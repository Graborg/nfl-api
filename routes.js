const dbAdapter = require('./lib/adapters/rethinkdb')
const { validateToken } = require('./validateTokenMiddleware')
const moment = require('moment')
const {
  formatGamesFromUrl,
  dataCollectedToday,
  getDataFromSportsRadar,
  addBetSuccess
} = require('./lib/services/apiUtils')
const { makeBet } = require('./lib/services/bets')
function registerRoutes (app) {
  app.get('/', (req, res) => {
    res.send(':D')
  })

  app.post('/bets', validateToken, makeBet)

  app.get(`/bets`, validateToken, (_req, res) => {
    return dbAdapter.getAllbets()
      .then(addBetSuccess)
      .then(bets => {
        res.json({
          bets
        })
      })
  })

  app.get(`/games`, validateToken, async (_req, res) => {
    if (!isSundayEvening() && await dataCollectedToday()) {
      console.log('getting data locally instead of from sportradar')

      return dbAdapter.getGamesByWeek()
        .then(games => games.reduce(formatGamesFromUrl, {}))
        .then(games => {
          res.json({
            games
          })
        })
    }
    return getDataFromSportsRadar()
      .then(games => {
        res.json({
          games
        })
      })
  })

  app.post('/auth', (req, res, next) => {
    res.cookie('token', req.body.token, { secure: false })
    res.sendStatus(200)
    next()
  })
}

function isSundayEvening () {
  const isSunday = moment().isoWeekday() === 7
  const isEvening = moment().isAfter(moment().hour(17))

  return isSunday && isEvening
}

module.exports = {
  registerRoutes
}
