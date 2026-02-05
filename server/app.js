// loads env vars
require('dotenv').config();

const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const db = require('./db.js')

app.use(cors());
app.use(express.json());

//setting up oAuth content
const oAuth2Client = new OAuth2Client(
  process.env.CLIENT_ID, 
  process.env.CLIENT_SECRET, 
  process.env.REDIRECT_URI
);

//functions
//call before routes that need auth
const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract "Bearer <token>"

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.userId = decoded.userId; 
    next();
  });
};

//params: refreshToken
//respos: complete token respo from google
const generateAccessToken = async (refreshToken) => {
  oAuth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  try {
    const tokenInfo = await oAuth2Client.getAccessToken();
    
    return {accessToken: tokenInfo.token, expiryDate: tokenInfo.res.data.expiry_date};
  } catch (error) {
    console.error("some error: ", error.message);
    throw new Error("Failed to get access token.");
  }
}

//
//routes
//

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
    const googleId = payload.sub;                 // unique google id
    const email = payload.email;                  // email
    const name = payload.name;                    // name
    const refreshToken = tokens['refresh_token']; // refresh token
    
    // 2.5 create jwt sesh token
    const sessionToken = jwt.sign({ userId: googleId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // 3. respond with jwt token, access token, expiration date
    res.status(200).json({ 
      sessionToken,
      access_token: tokens.access_token,
      expires_in: tokens.expiry_date 
    });

    // 4. save information into db
    db.saveUserProfile(googleId, email, name, refreshToken);

  } catch (error) {
    console.error('Error exchanging code:', error);
    res.status(500).json({ error: 'Failed to exchange code' });
  }
});

//params: user id 
//respos: Json : {parent : {}, children: {[]...}}
app.post('/api/get-family-data', authenticate, async (req, res) => {
  try {
    const parentId = req.userId;

    const parentData = db.getUserProfile(parentId);
    const childrenData = db.getChildrenProfiles(parentId);

    const parentToken = await generateAccessToken(parentData.refreshToken);
    const parentJson = {
      id: parentData.id,
      name: parentData.name,
      email: parentData.email,
      accessToken: parentToken.accessToken,
      expiryDate: parentToken.expiryDate
    };

    const childrenJson = await Promise.all(
      childrenData.map( 
        async (child) => 
          {
          const childToken = await generateAccessToken(child.refreshToken);
          return {
            id: child.id,
            name: child.name,
            email: child.email,
            accessToken: childToken.accessToken,
            expiryDate: childToken.expiryDate
          };
        }
      )
    );

    res.json({
      parent: parentJson,
      children: childrenJson
    });
  } catch (error) {
    console.error("oopsie, error: ", error);
    res.status(500).json({ error: 'Failed to get family data' });
  }
});



/////////
//DEBUG//
/////////

//params: none
//repsos: table of userids and refresh tokens
app.get('/getData', (req, res) => {
  const tableName = req.query.table; 
  res.send(db.getAllData(tableName));
});

//gets family tokens given parent id
app.get('/token', async (req, res) => {
  try {
    const parentId = req.query.id;

    const parentData = db.getUserProfile(parentId);
    const childrenData = db.getChildrenProfiles(parentId);

    const parentToken = await generateAccessToken(parentData.refreshToken);
    const parentJson = {
      id: parentData.id,
      name: parentData.name,
      email: parentData.email,
      accessToken: parentToken.accessToken,
      expiryDate: parentToken.expiryDate
    };

    const childrenJson = await Promise.all(
      childrenData.map( 
        async (child) => 
          {
          const childToken = await generateAccessToken(child.refreshToken);
          return {
            id: child.id,
            name: child.name,
            email: child.email,
            accessToken: childToken.accessToken,
            expiryDate: childToken.expiryDate
          };
        }
      )
    );

    res.json({
      parent: parentJson,
      children: childrenJson
    });
  } catch (error) {
    console.error("oopsie, error: ", error);
    res.status(500).json({ error: 'Failed to get family data' });
  }
});

//params: none
//repsos: table of userids and refresh tokens
app.get('/linkChild', (req, res) => {
  try{
    const parentId = req.query.pId; 
    const childId = req.query.cId;



    res.json();a

  } catch (error) {
    res.status(500).json({ error: 'Failed to get family data' });
  }
  
});


app.listen(3001, () => console.log('Server running on port 3001'));