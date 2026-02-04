// loads env vars
require('dotenv').config();

const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

//include db.js 
const db = require('./db.js')

const oAuth2Client = new OAuth2Client(
  process.env.CLIENT_ID, 
  process.env.CLIENT_SECRET, 
  process.env.REDIRECT_URI
);

//params: Token response from google
//respos: access token, expiry_date   
app.post('/api/google-exchange', async (req, res) => {
  
  //1. get code
  const { code } = req.body; //has: code, scope, authuser, prompt
  
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.CLIENT_ID,
    });

    // 1. get payload
    const payload = ticket.getPayload();
      
    // 2. get information from payload
    const googleId = payload.sub;    // unique google id
    const email = payload.email;     // email
    const name = payload.name;       // name

    console.log(`User: ${name}, Email: ${email}`);
    
    res.status(200).json({ 
      access_token: tokens.access_token,
      expires_in: tokens.expiry_date 
    });

    db.saveInformation(tokens['id_token'], tokens['refresh_token']);

  } catch (error) {
    console.error('Error exchanging code:', error);
    res.status(500).json({ error: 'Failed to exchange code' });
  }
});

//params: none
//repsos: table of userids and refresh tokens
app.get('/getData', (req, res) => {
  res.send(db.displayAllData());
});

//params: none
//respos: list of all new access tokens
app.get('/getNewAccessTokens', async (req, res) => {
  accessTokenList = await refreshAllAccessTokens();
  res.status(200).json(accessTokenList);
  console.log(accessTokenList);
});



//params: none
//respos: list of access tokens
async function refreshAllAccessTokens(){
  refreshTokenList = db.getAllRefreshTokens();
  accessTokenList = [];
  for(const refreshToken of refreshTokenList) {
    try {
      accessTokenList.push(await generateAccessTokenFromRefresh(refreshToken));
    }
    catch (error) {
      console.error("BRO ERROR AS FUCK:", error.message);
    }
  }

  return accessTokenList;
}

//params: refreshToken
//respos: complete token respo from google
async function generateAccessTokenFromRefresh(refreshToken) {
  oAuth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  try {
    const tokenInfo = await oAuth2Client.getAccessToken();
    return tokenInfo.token;
  } catch (error) {
    console.error("some error: ", error.message);
    throw new Error("Failed to get access token.");
  }
}

app.listen(3001, () => console.log('Server running on port 3001'));