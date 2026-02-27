import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { Redis } from "@upstash/redis"
import { generateProgressCard } from "./progressGenerator.js";
dotenv.config({ path: "../.env" });

const app = express();
const port = 3001;

const redis = new Redis({
	url: process.env.REDIS_REST_URL,
	token: process.env.REDIS_TOKEN
});


const progressCache = new Map();
const MAX_CACHE_SIZE = 5;

function cacheSet(key, value) {
  // If already at limit, delete the oldest entry (first inserted)
  if (progressCache.size >= MAX_CACHE_SIZE && !progressCache.has(key)) {
    const oldestKey = progressCache.keys().next().value;
    progressCache.delete(oldestKey);
  }
  progressCache.set(key, value);
}


app.use(express.json());

app.post("/api/token", async (req, res) => {
    const response = await fetch(`https://discord.com/api/oauth2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.VITE_DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: "authorization_code",
            code: req.body.code,
        }),
    });

    const data = await response.json();
    
    const { access_token } = data;
    res.send({ access_token });
});

app.post("/api/progress", async (req, res) => {
	console.log(req.body);
	const { user, day, guesses, channelId } = req.body;


    // generateProgressCard();

	const cacheKey = `${channelId}:${user.id}:${day}`;
	cacheSet(cacheKey, guesses);
	await redis.set(cacheKey, JSON.stringify(guesses), { ex: 86400 });

	res.json({ success: true });
});

app.get('/api/progress/:userId/:day/:channelId', async (req, res) => {
	const { userId, day, channelId } = req.params;
	const cacheKey = `${channelId}:${userId}:${day}`;

	if (progressCache.has(cacheKey)) {
		console.log(`Cache hit for ${cacheKey}`);
		return res.json({ guesses: progressCache.get(cacheKey) });
	}

	console.log(`Cache miss for ${cacheKey}, fetching from Redis`);
	const data = await redis.get(cacheKey);
	if (data) cacheSet(cacheKey, data);
	res.json({ guesses: data ?? [] });
});

app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});