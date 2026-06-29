const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Player = require("../models/Player");

async function get40LRecord(username) {
    const res = await fetch(
        `https://ch.tetr.io/api/users/${username}/records/40l/top`
    );

    const json = await res.json();

    if (!json.success) {
        throw new Error("TETR.IO API error");
    }

    if (json.data.record && json.data.record.results) {
        let results = json.data.record.results.stats.finaltime;
        return results;
    } else if (json.data.entries && json.data.entries.length > 0) {
        let results = json.data.entries[0].results.stats.finaltime;
        return results;
    } else {
        throw new Error("Unexpected API response structure");
    }
}

async function getLeagueRecord(username) {
    const res = await fetch(
        `https://ch.tetr.io/api/users/${username}/summaries/league`
    );

    const json = await res.json();

    if (!json.success) {
        throw new Error("TETR.IO API error");
    }
    return json.data.rank;
}

async function getRating(username) {
    const res = await fetch(
        `https://ch.tetr.io/api/users/${username}/summaries/league`
    );

    const json = await res.json();

    if (!json.success) {
        throw new Error("TETR.IO API error");
    }
    return json.data.tr;
}

async function getUser(username) {
  const response = await fetch(`https://ch.tetr.io/api/users/${username}`);
  const data = await response.json();
  
  console.log('TETR.IO response status:', response.status);
  console.log('TETR.IO response body:', JSON.stringify(data));

  if (!data.success) throw new Error(`TETR.IO API error: ${JSON.stringify(data)}`);
  return data.data;
}

router.post("/", async (req, res) => {
    try {
        const pname = req.body.username.toLowerCase();
        const user = await getUser(pname);
        const id = user._id;
        const revision = user.avatar_revision;
        const line40 = await get40LRecord(pname);
        const league = await getLeagueRecord(pname);
        const rating = await getRating(pname);
        const new_player = new Player ({
            _id: id,
            av: revision,
            username: pname,
            sprint_40: Math.round((line40 / 1000) * 100) / 100,
            rank: league,
            tr: rating,
        });

        await new_player.save();
        const players = await Player.find({});
        const vars = {
            url: `https://tetr.io/user-content/avatars/${id}.jpg?rv=${revision}`,
            uname: pname,
            sprint: Math.round((line40 / 1000) * 100) / 100,
            rank: league.toUpperCase(),
            tr: rating
        }

        console.log("url: ", vars.url)
        res.render("addplayer", vars);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error adding player");
    }
  });

module.exports = router;