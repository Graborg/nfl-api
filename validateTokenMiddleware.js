const axios = require('axios')
const dbAdapter = require('./lib/adapters/rethinkdb')
async function validateTokenCookie (req, res, next) {
  const token = req.cookies.token
  delete req.username
  let username

  try {
    username = await validateToken(token)
  } catch (e) {
    console.error(`Couldnt verify token ${token}, ${e}`)
    return res.sendStatus(401)
  }
  try {
    validateUser(username)
    req.username = username
    next()
  } catch (e) {
    res.status(401).json(`Error for user ${username}, ${e}`)
  }
}
async function validateToken (token) {
  const result = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`)
  let username = result.data.email
  if (username === 'intemicke@gmail.com') {
    username = 'coolniclas@gmail.com'
  } else if (username === 'mikael.graborg@iteam.com') {
    username = 'carlfredrikhenning.stenberg@gmail.com'
  }
  return username
}

async function validateUser (username) {
  const users = await dbAdapter.getUsers()
  const user = users.find(user => user.username === username)
  const isValidUser = !!user
  if (!isValidUser) {
    throw Error(`The user is not one of the allowed players on this site`)
  }
  return user.id
}

module.exports = {
  validateToken,
  validateTokenCookie,
  validateUser
}
