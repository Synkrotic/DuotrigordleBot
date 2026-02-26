import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { Redis } from "@upstash/redis"
dotenv.config({ path: "../.env" });

const app = express();
const port = 3001;

const redis = new Redis({
	url: process.env.REDIS_REST_URL,
	token: process.env.REDIS_TOKEN
});

// Allow express to parse JSON bodies
app.use(express.json());

app.post("/api/token", async (req, res) => {
	console.log("authing")
	
	// Exchange the code for an access_token
	const response = await fetch(`https://discord.com/api/oauth2/token`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			client_id: process.env.VITE_DISCORD_CLIENT_ID,
			client_secret: process.env.DISCORD_CLIENT_SECRET,
			grant_type: "authorization_code",
			code: req.body.code,
		}),
	});

	// Retrieve the access_token from the response
	const { access_token } = await response.json();

	// Return the access_token to our client as { access_token: "..."}
	res.send({access_token});
});

app.post("/api/progress", async (req, res) => {
	console.log("sending progress")

	const { userId, day, guesses } = req.body
	await redis.set(`${userId}:${day}`, JSON.stringify(guesses), { ex: 86400 })
	res.json({ success: true })
});


app.get('/api/progress/:userId/:day', async (req, res) => {
	const { userId, day } = req.params
	const data = await redis.get(`${userId}:${day}`)
	res.json({ guesses: data ? JSON.parse(data) : [] })
})

app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});
