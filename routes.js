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

  app.get(`/bets`, validateToken, (req, res) => {
    return dbAdapter.getUserBets(req.username)
      .then(addBetSuccess)
      .then(bets => {
        res.json({
          bets
        })
      })
  })

  app.get(`/games`, validateToken, async(req, res) => {
    if (await dataCollectedToday() || config.get('env') === 'DEVELOPMENT') {
      console.log('getting data locally instead of from sportradar');

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
    res.cookie('token', req.body.token, {secure: false})
    res.sendStatus(200)
    next()
  })
}


module.exports = {
  registerRoutes
}
