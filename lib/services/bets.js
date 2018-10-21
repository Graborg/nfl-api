const dbAdapter = require('../adapters/rethinkdb')
const moment = require('moment-timezone')
module.exports = {
  async makeBet (req, res) {
    let { body: { gameId, teamName, outcome }, username } = req
    return dbAdapter.getGame(gameId)
      .then(isBeforeBetDeadline)
      .then(({ id: gameId, gameWeek }) => dbAdapter.updateBet(username, gameId, teamName, outcome, gameWeek))
      .then(() => res.sendStatus(200))
  }

}

function isBeforeBetDeadline (game) {
  const gameDeadline = moment.tz(game.scheduled, 'Europe/Stockholm').subtract(1, 'hour')
  if (moment().isAfter(gameDeadline)) {
    throw Error('The deadline for this bet has closed')
  }
  return game
}
