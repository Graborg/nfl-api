const axios = require('axios')

async function validateToken (req, res, next) {
  console.log('CHECKIN');
  
  const token = req.headers.authorization
  let emailFromToken
  delete req.username
  try {
    const result = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`)
    emailFromToken = result.data.email
  } catch (e) {
    console.error(`Couldnt verify token ${token}, ${e}`)
    return res.send(401)
  }
  req.username = emailFromToken
  next()
}

module.exports = { validateToken }
