const dbAdapter = require('./lib/adapters/rethinkdb')
const { validateToken } = require('./validateTokenMiddleware')
const config = require('./config')
const {
  formatGamesFromUrl,
  dataCollectedToday,
  getDataFromSportsRadar,
  addBetSuccess
} = require('./lib/services/apiUtils')

function registerRoutes (app) {
  app.get('/', (req, res) => {
    res.send(':D')
  })

  app.post('/bets', validateToken, async (req, res) => {
    let {
      body: {
        gameId,
        teamName,
        outcome
      },
      username
    } = req
    const {
      week
    } = await dbAdapter.getGame(gameId)
    // TODO: Check if past deadline

    return dbAdapter.updateBet(username, gameId, teamName, outcome, week)
      .then(() => res.sendStatus(200))
  })

  app.get(`/bets`, (req, res) => {
    return dbAdapter.getUserBets(req.username)
      .then(addBetSuccess)
      .then(bets => {
        res.json({
          bets
        })
      })
  })

  app.get(`/games`, async (req, res) => {
    if (await dataCollectedToday() || config.get('env') === 'DEVELOPMENT') {
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
}

module.exports = {
  registerRoutes
}
