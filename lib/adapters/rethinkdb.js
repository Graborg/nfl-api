'use strict'
const config = require('../../config')

const r = require('rethinkdbdash')({
  servers: [{ host: config.get('rethinkdb:host'), port: 28015 }]
})
var crypto = require('crypto')

function insertGames (games) {
  return r.db('nfl').table('games').insert(games, { conflict: 'update' })
    .then(() => games)
}

function getGamesByWeek () {
  return r.db('nfl').table('games').group('gameWeek')
}

function getUserBets (username) {
  return r.db('nfl').table('bets').filter({ username })
}

function getAllbets () {
  return r.db('nfl').table('bets')
}

function setCollectedDate (date) {
  return r.db('nfl').table('timestamps')
    .get('gamesDataCollected')
    .replace({
      id: 'gamesDataCollected',
      date
    })
}

function getCollectedDate () {
  return r.db('nfl').table('timestamps')
    .get('gamesDataCollected')
    .then(res => {
      if (!res) return

      return res.date
    })
}
function updateBet (username, gameId, teamName, outcome, week) {
  return r.db('nfl')
    .table('bets')
    .insert({
      teamName,
      outcome,
      id: getBetId(username, gameId),
      gameId,
      date: new Date(),
      username,
      playWeek: week
    }, { conflict: 'update' })
}
function addAuthTokenToUser (username, token) {
  return r.db('nfl')
    .table('users')
    .filter({ username })
    .update({ token })
}

function getUserFromAuth () {
  return Promise.resolve('intemicke@gmail.com')
}

function getBetId (username, gameId) {
  return crypto.createHash('md5').update(username + gameId).digest('hex')
}

function getGame (id) {
  return r.db('nfl').table('games').get(id)
}
function getUsers () {
  return r.db('nfl').table('users')
}
module.exports = {
  insertGames,
  getUserBets,
  getAllbets,
  updateBet,
  getGamesByWeek,
  setCollectedDate,
  getCollectedDate,
  addAuthTokenToUser,
  getUserFromAuth,
  getGame,
  getUsers
}
