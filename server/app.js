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
const oAuth2ClientWeb = new OAuth2Client(
  process.env.CLIENT_ID, 
  process.env.CLIENT_SECRET, 
  process.env.REDIRECT_URI
);

const oAuth2ClientMobile = new OAuth2Client(
  process.env.CLIENT_ID, 
  process.env.CLIENT_SECRET, 
  ""
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
  oAuth2ClientWeb.setCredentials({
    refresh_token: refreshToken,
  });
  try {
    const tokenInfo = await oAuth2ClientWeb.getAccessToken();
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

    //if exists AND still valid 1 min into the future
    if(cachedToken && cachedToken.expiryDate  > (Date.now() + 60000)){
      console.log("Using RAM cache for (UserId):", userId);
      console.log("Access Token:", cachedToken);
      return cachedToken;
    }

    //generate new, update cache, return
    newAccessToken = await generateAccessToken(refreshToken)
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
  if(!code) return res.status(400).json({ error: 'No code provided' });

  try {
    // 1. Build the payload dynamically based on what the client sent
    let tokens;

    if (redirectUri) { // for web logins
      const response = await oAuth2ClientWeb.getToken({
        code: code,
        codeVerifier: codeVerifier,
        redirect_uri: redirectUri 
      });
      tokens = response.tokens;
    } else { // for mobile
      const response = await oAuth2ClientMobile.getToken({ code: code });
      tokens = response.tokens;
    }
      
    
    const ticket = await oAuth2ClientWeb.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.CLIENT_ID,
    });

    // 1. get payload
    const payload = ticket.getPayload();
      
    // 2. get information from payload
    const { 
      sub: googleId,  // .sub and renames it to googleId
      email,          // .email
      name,           // .name
      picture         // .picture
    } = payload;
    const refreshToken = tokens['refresh_token']; // refresh token

    const sessionTokenObj = await getJWTToken(googleId);

    console.log(sessionTokenObj);

    // 3. respond with jwt token, access token, expiration date
    res.status(200).json(
      sessionTokenObj
    );

    // 4. save information into db
    db.saveUserProfile(googleId, email, name, picture, refreshToken);

  } catch (error) {
    console.error('Error exchanging code:', error);
    res.status(500).json({ error: 'Failed to exchange code' });
  }
});

//req: {jwt code} => {userId}
//res: {parent: parentJson, children: [...childrenJson]}
app.post('/api/get-family-profiles', authenticate, async (req, res) => {
  try {
    console.log('/api/get-family-profiles called');
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
app.post('/api/get-family-access-tokens', authenticate, async (req, res) => {
  try {
    console.log('/api/get-family-access-tokens called');
    const parentId = req.userId;

    const parentData = db.getUserRefreshToken(parentId);
    const childrenData = db.getChildrenRefreshToken(parentId);
    
    //get parent access token
    const parentAccessToken = await getAccessToken(parentId, parentData.refreshToken);
    const parentJson = {
      id: parentData.id,
      accessToken: parentAccessToken.accessToken,
      expiryDate: parentAccessToken.expiryDate
    }

    //get children access tokens
    const childrenJson = await Promise.all(
      childrenData.map(async (child) => {
        const tokenObj = await getAccessToken(child.id, child.refreshToken);
        
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

// ===========================================================
// INVITATION FUNCTIONS 
// ===========================================================

// Send an Invitation
// The user calling this (Host) is offering their calendar to the Invitee
app.post('/api/invite/add', authenticate, async (req, res) => {
  try {
    const hostId = req.userId; // The person sending the invite (the "Child-to-be")
    const { inviteeEmail } = req.body;

    const inviteeId = db.getIdByEmail(inviteeEmail);

    if (!inviteeId) return res.status(400).json({ error: 'USER_NOT_FOUND' });

    db.addInvitation(hostId, inviteeId);
    res.status(200).json({ message: 'Invitation sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// Accept an Invitation
// The Invitee accepts, making the Host their "Child" in the system
app.post('/api/invite/accept', authenticate, async (req, res) => {
  try {
    const inviteeId = req.userId; // The person accepting (the "Parent")
    const { hostEmail } = req.body;

    const hostId = db.getIdByEmail(hostEmail);
    if (!hostId) return res.status(400).json({ error: "Host no longer exists"});

    // Link them in the userChildren table
    db.linkParentChildren(inviteeId, [hostId]);

    // Remove the invitation
    db.removeInvitation(hostId, inviteeId);

    res.status(200).json({ message: 'Invitation accepted and linked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Remove/Decline an Invitation
// Either party can cancel a pending invitation
app.post('/api/invite/remove', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { otherEmail } = req.body;

    const otherId = db.getIdByEmail(otherEmail);
    if (!otherId) return res.status(400).json({ error: "Person longer exists"});

    // We try removing in both directions since we don't know who is who
    // Usually, you'd specify who is the host in the request.
    db.removeInvitation(otherId, userId); // User is invitee
    db.removeInvitation(userId, otherId); // User is host

    res.status(200).json({ message: 'Invitation removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove invitation' });
  }
});

// Get Invitations for the current user (as an Invitee)
app.get('/api/invite/my-invites', authenticate, async (req, res) => {
  try {
    const invites = db.getInvitationsByInvitee(req.userId);
    
    // Map IDs back to Emails for the UI
    const invitesWithEmails = invites.map(invite => {
      const hostProfile = db.getUserProfile(invite.hostId);
      return {
        email: hostProfile.email,
        name: hostProfile.name,
        picture: hostProfile.picture
      };
    });

    res.json(invitesWithEmails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// Get Invitations sent by the current user (as a Host)
app.get('/api/invite/sent-invites', authenticate, async (req, res) => {
  try {
    const invites = db.getInvitationsByHost(req.userId);

    // Map IDs back to Emails for the UI
    const invitesWithEmails = invites.map(invite => {
      const inviteeProfile = db.getUserProfile(invite.inviteeId);
      return {
        email: inviteeProfile.email,
        name: inviteeProfile.name,
        picture: inviteeProfile.picture
      };
    });

    res.json(invitesWithEmails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sent invitations' });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));