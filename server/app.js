// importing 
require('dotenv').config();

const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const db = require('./db.js')

//setup
app.use(cors());
app.use(express.json());

//setting up oAuth content
const oAuth2Client = new OAuth2Client(
  process.env.CLIENT_ID, 
  process.env.CLIENT_SECRET, 
  process.env.REDIRECT_URI
);

//should store [userId : string , {accessToken : string, expiryDate : integer}]
const accessTokenCache = new Map();

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

//params: refreshToken
//res: if exists, gets non-expired token, otherwise generates new token.
const getAccessToken = async (userId, refreshToken) => {
  try {
    const cachedToken = accessTokenCache.get(userId);

    //if exists AND still valid 1 min into thte future
    if(cachedToken && cachedToken.expiryDate  > (Date.now() + 60000)){
      console.log("Using RAM cache for:", userId);
      return cachedToken;
    }

    //generate new, update cache, return
    newAccessToken = await generateAccessToken(refreshToken)
    console.log("user: ", userId, "\n new token: ",newAccessToken);
    accessTokenCache.set(
      userId, newAccessToken
    );
    return newAccessToken;
  } catch (error) {
    console.error(" getAccessToken error: ", error.message);
    throw new Error("Failed to get access token.");
  }
}


//params: userId
//res: creates and returns a JWT token  + expiration date
const getJWTToken = async (userId) => {
  try {
    const sessionToken = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { exp } = jwt.verify(sessionToken, process.env.JWT_SECRET);

    return {sessionToken, expiryDate : exp};
  } catch (error) {
    console.error("getJWTToken error: ", error.message);
    throw new Error("Failed to get access token.");
  }
}



//
//routes
//

//req: {code}
//res: {jwt session token, acc token, expires in}
app.post('/api/google-exchange', async (req, res) => {
  console.log('/api/google-exchange called');

  //1. get code
  const { code, codeVerifier, redirectUri } = req.body; //has: code, scope, authuser, prompt
  
  try {
    const { tokens } = await oAuth2Client.getToken({
      code: code,
      codeVerifier : codeVerifier,
      redirect_uri: redirectUri
  });
    
    
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

    const sessionTokenObj = await getJWTToken(googleId);

    console.log(sessionTokenObj);

    // 3. respond with jwt token, access token, expiration date
    res.status(200).json(
      sessionTokenObj
    );

    // 4. save information into db
    db.saveUserProfile(googleId, email, name, refreshToken);

  } catch (error) {
    console.error('Error exchanging code:', error);
    res.status(500).json({ error: 'Failed to exchange code' });
  }
});

//req: {jwt code} => {userId}
//res: {parent: parentJson, children: [...childrenJson]}
app.post('/api/get-family-data', authenticate, async (req, res) => {
  try {
    console.log('/api/get-family-data called');
    const parentId = req.userId;

    const parentData = db.getUserProfile(parentId);
    const childrenData = db.getChildrenProfiles(parentId);
    
    res.json({
      parent: parentData,
      children: childrenData
    });
  } catch (error) {
    console.error("oopsie, error: ", error);
    res.status(500).json({ error: 'Failed to get family data' });
  }
});

//req: {jwt code} => {userId}
//res: {parent: parentJson, children: [...childrenJson]}
app.post('/api/get-family-access-token', authenticate, async (req, res) => {
  try {
    console.log('/api/get-family-access-token called');
    const parentId = req.userId;

    const parentData = db.getUserRefreshToken(parentId);
    const childrenData = db.getChildrenRefreshToken(parentId);
    
    const parentAccessToken = await getAccessToken(parentId, parentData.refreshToken);
    const parentJson = {
      id: parentData.id,
      accessToken: parentAccessToken.accessToken,
      expiryDate: parentAccessToken.expiryDate
    }

    const childrenJson = await Promise.all(
      childrenData.map(async (child) => {
        const tokenObj = await getAccessToken(parentId, child.refreshToken);
        
        return {
          id: child.id,
          accessToken: tokenObj.accessToken,
          expiryDate: tokenObj.expiryDate
        };
      })
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

//I NEED TO WORK ON THIS, TODO:
//1. include getting google code + PKCE for more authentication
//req: {jwt code, childId} => {userId, childId}
//res: 200
app.post('/api/link', authenticate, (req, res) => {
  try{
    const parentId = req.userId;
    const childId = req.childId;
    if(!parentId || !childId) return res.status(400).json({ error: 'cid/pid is cooked' });

    db.linkParentChildren(parentId,[childId]);
    res.json(db.getChildren(parentId));
    res.status(200);
  } catch (error) {
    res.status(500).json({ error: 'errorerm' });
  }
  
});

//req: {jwt code, childId} => {userId, chlidId}
//res: 200
app.post('/api/delink', authenticate, (req, res) => {
  try{
    const parentId = req.userId;
    const childId = req.childId;
    if(!parentId || !childId) return res.status(400).json({ error: 'cid/pid is cooked' });

    db.delinkParentChildren(parentId,[childId]);

    res.json(db.getChildren(parentId));
    res.status(200);
  } catch (error) {
    res.status(500).json({ error: 'error erm' });
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
    console.log("get-family-data called");
    const parentId = req.query.id;

    const parentData = db.getUserProfile(parentId);
    const childrenData = db.getChildrenProfiles(parentId);
    
    res.json({
      parent: parentData,
      children: childrenData
    });
  } catch (error) {
    console.error("oopsie, error: ", error);
    res.status(500).json({ error: 'Failed to get family data' });
  }
});

//gets family tokens given parent id
app.get('/tokenreal', async (req, res) => {
  try {
    console.log("get-family-access-tokens called");
    const parentId = req.query.id;

    const parentData = db.getUserRefreshToken(parentId);
    const childrenData = db.getChildrenRefreshToken(parentId);
    
    const parentAccessToken = await getAccessToken(parentId, parentData.refreshToken);
    const parentJson = {
      id: parentData.id,
      accessToken: parentAccessToken.accessToken,
      expiryDate: parentAccessToken.expiryDate
    }

    const childrenJson = await Promise.all(
      childrenData.map(async (child) => {
        const tokenObj = await getAccessToken(parentId, child.refreshToken);
        
        return {
          id: child.id,
          accessToken: tokenObj.accessToken,
          expiryDate: tokenObj.expiryDate
        };
      })
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
app.get('/link', (req, res) => {
  try{
    const parentId = req.query.pId; 
    const childId = req.query.cId;
    if(!parentId || !childId) return res.status(400).json({ error: 'cid/pid is cooked' });

    db.linkParentChildren(parentId,[childId]);
    res.json(db.getAllData('userChildren'));

  } catch (error) {
    res.status(500).json({ error: 'errorerm' });
  }
  
});
//params: none
//repsos: table of userids and refresh tokens

app.get('/delink', (req, res) => {
  try{
    const parentId = req.query.pId; 
    const childId = req.query.cId;
    if(!parentId || !childId) return res.status(400).json({ error: 'cid/pid is cooked' });

    db.delinkParentChildren(parentId,[childId]);

    res.json(db.getAllData('userChildren'));

  } catch (error) {
    res.status(500).json({ error: 'error erm' });
  }
  
});


app.listen(3001, () => console.log('Server running on port 3001'));