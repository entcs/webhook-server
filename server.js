const express = require("express");
const axios = require('axios');
const cors = require('cors');

const { OAuth2Client } = require('google-auth-library');
const oauth2Client = new OAuth2Client()

// Create an Express app and listen for incoming requests on port 3000
const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;

// static files
app.use(express.static('files'))

// Enable CORS for all routes
app.use(cors());

// 1. Call the Google SDK from the frontend using whatever frontend
//2. Extract the code or access token and send to your backend for verification.
//3. Use your backend Google api to verify the code or token.
//4. If verified, sign them in the backend and then send a response to frontend

app.post('/auth', async (req, res) => {
    try {
        // get the code from frontend
        const code = req.headers.authorization;
        console.log('Authorization Code:', code);

        // Exchange the authorization code for an access token
        const response = await axios.post(
            'https://oauth2.googleapis.com/token',
            {
                code,
                client_id: '587301-d27f8hofgi6i0.apps.googleusercontent.com',
                client_secret: 'GOCSPX-u02eNWutQVi',
                redirect_uri: 'postmessage',
                grant_type: 'authorization_code'
            }
        );
        const accessToken = response.data.access_token;
        console.log('Access Token:', accessToken);

        // Fetch user details using the access token
        const userResponse = await axios.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        const userDetails = userResponse.data;
        console.log('User Details:', userDetails);

        // Process user details and perform necessary actions

        res.status(200).json({ message: 'Authentication successful' });
    } catch (error) {
        console.error('Error saving code:', error);
        res.status(500).json({ message: 'Failed to save code' });
    }
});

// Use middleware to parse incoming requests with JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

// Handle GET requests to the root URL
router.get("/", (req, res) => {
  res.send("Welcome to the Webhook Server!");
});

// Handle POST requests to specific URLs i.e. webhook endpoints
router.post("/webhook-1", (req, res) => {
  console.log(req.body);
  res.send("Webhook 1 successfully received.");
});

router.post("/webhook-2", (req, res) => {
  console.log(req.body);
  res.send("Webhook 2 successfully received.");
});

// Mount the router middleware
app.use(router);

// Start the server and listen for incoming connections
app.listen(port, () => {
  console.log(`Server running at https://localhost:${port}/`);
});
