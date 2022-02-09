const express = require("express");
const axios = require("axios");
const redis = require("redis");

const client = redis.createClient({
  url: process.env.url,
});

const DEFAULT_EXPIRATION = 3600;

const app = express();

app.get("/photos", async (req, res) => {
  const photos = await client.get("photos");
  if (photos != null) {
    return res.json(JSON.parse(photos));
  } else {
    const albumId = req.query.albumId;
    const { data } = await axios.get(
      "https://jsonplaceholder.typicode.com/photos",
      { params: { albumId } }
    );
    await client.SETEX("photos", DEFAULT_EXPIRATION, JSON.stringify(data));
    console.log();
    return res.json(data);
  }
});

(async () => {
  await client.connect();
  client.on("error", (err) => console.log("Redis Client Error", err));
})();

app.listen(5000);
