const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const oAuth2Client = new OAuth2Client(
  process.env.CLIENT_ID, 
  process.env.CLIENT_SECRET, 
  process.env.REDIRECT_URI
);

app.post('/api/google-exchange', async (req, res) => {
  const { code } = req.body;

  try {
    // Exchange the auth code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    console.log("Tokens Received:", tokens);
    
    // tokens will contain: access_token, refresh_token, expiry_date, etc.

    // TODO: Store tokens.refresh_token in your database associated with the user
    res.status(200).json({ 
      access_token: tokens.access_token,
      expires_in: tokens.expiry_date 
    });
  } catch (error) {
    console.error('Error exchanging code:', error);
    res.status(500).json({ error: 'Failed to exchange code' });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));