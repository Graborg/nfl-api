const axios = require('axios')

async function validateToken (req, res, next) {
  const token = req.headers.authorization
  let emailFromToken
  delete req.username
  try {
    const result = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`)
    emailFromToken = result.data.email
  } catch (e) {
    throw new Error(`Couldnt verify token ${token}, ${e}`)
  }
  req.username = emailFromToken
  next()
}

module.exports = { validateToken }
