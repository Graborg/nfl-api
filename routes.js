const dbAdapter = require('./lib/adapters/rethinkdb')
const { validateToken, validateUser, validateTokenCookie } = require('./validateTokenMiddleware')
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

  app.post('/bets', validateTokenCookie, makeBet)

  app.get(`/bets`, validateTokenCookie, (_req, res) => {
    return dbAdapter.getAllbets()
      .then(addBetSuccess)
      .then(bets => {
        res.json({
          bets
        })
      })
  })

  app.get(`/games`, validateTokenCookie, async (_req, res) => {
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

  app.post('/auth', async (req, res, next) => {
    res.cookie('token', req.body.token, { secure: false })
    let username, userId
    try {
      username = await validateToken(req.body.token)
      userId = await validateUser(username)
      res.send({ userId })
      next()
    } catch (e) {
      res.status(401).json(`Error for user ${username}, ${e}`)
    }
  })
}

function isSundayEvening () {
  const isSunday = moment().isoWeekday() === 7
  const isEvening = moment.tz('Europe/Stockholm').hour() > 17

  return isSunday && isEvening
}

module.exports = {
  registerRoutes
}
