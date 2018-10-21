const axios = require('axios')
const moment = require('moment')
const config = require('../../config')
const dbAdapter = require('../adapters/rethinkdb')
function formatGamesFromUrl (formattedGames, gameGroup, weekNo) {
  formattedGames[gameGroup.group] = gameGroup.reduction.map(game => ({
    id: game.id,
    status: game.status,
    playDate: game.scheduled,
    homeTeam: game.home.name,
    awayTeam: game.away.name,
    deadlineDate: game.scheduled,
    outcome: getOutcome(game)
  }))
    .sort(gameSort)
  return formattedGames
}

function gameSort (a, b) {
  let scoring = 0
  if (b.outcome !== null) {
    scoring += 2
  }
  if (a.outcome !== null) {
    scoring -= 2
  }
  if (moment(b.playDate).isBefore(moment(a.playDate))) {
    scoring += 1
  } else {
    scoring -= 1
  }

  return scoring
}
function getOutcome (game) {
  let outcome = game.scoring
  if (outcome) {
    let diff = outcome.home_points - outcome.away_points
    if (diff > 0) {
      return 'home'
    } else if (diff < 0) {
      return 'away'
    } else {
      return 'tie'
    }
  }
  return null
}

function dataCollectedToday () {
  const today = moment().format('YYYY-MM-DD')
  return dbAdapter.getCollectedDate()
    .then(date => today === date)
}

function updateCollectedTimestamp () {
  console.log('Got data, updating timestamp')
  const today = moment().format('YYYY-MM-DD')
  return dbAdapter.setCollectedDate(today)
}

async function getDataFromSportsRadar () {
  console.log('GETTN DATA!')
  try {
    await axios.get(`https://api.sportradar.us/nfl-ot2/games/2018/reg/schedule.json?api_key=${config.get('sportRadar:api_key')}`)
      .then(res => res.data.weeks)
      .then(weeks => weeks.forEach(week => {
        const games = week.games.map(game =>
          Object.assign(game, {
            week: moment(game.scheduled).isoWeek(),
            gameWeek: week.sequence,
            scheduled: moment(game.scheduled).tz('Europe/Stockholm').format()
          })
        )
        return dbAdapter.insertGames(games)
      }))
      .then(updateCollectedTimestamp)
  } catch (e) {
    console.error('Couldnt get data from sportsRadar', e)
  }
  return dbAdapter.getGamesByWeek
    .then(games => games.reduce(formatGamesFromUrl, {}))
}

function addBetSuccess (bets) {
  return Promise.all(bets.map(async bet => Object.assign({}, bet, {
    successful: await dbAdapter.getGame(bet.gameId)
      .then(game => getOutcome(game) === bet.outcome)
      .catch(e => console.error(`Could not get game with ID ${bet.gameId} from DB, to compare with bet`))
  })))
}
module.exports = {
  formatGamesFromUrl,
  getOutcome,
  dataCollectedToday,
  getDataFromSportsRadar,
  addBetSuccess
}
