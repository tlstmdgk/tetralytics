const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const portNumber = process.env.PORT || 4000 

/*
require("dotenv").config({
   path: path.resolve(__dirname, "./localenv/.env"),
});
*/
const Player = require("./models/Player");

/* express stuff */
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname)));
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));


const addplayer = require("./routes/addplayer.js");
app.use("/add-player", addplayer);
/*
if (process.argv.length !== 3) {
    console.log("Usage app.js 5001");
    process.exit(1);
  }
    
const portNumber = process.argv[2];
*/
app.listen(portNumber, () => {
    console.log(`Stats server running on http://localhost:${portNumber}`);
});


/* Initial connection to mongoose */
async function main() {
    try {
        await mongoose.connect(process.env.MONGO_CONNECTION_STRING)
    } catch (e) {
      console.error(e);
    }
}

main().catch(console.error);

/* Home Page */
app.get("/", async (req, res) => {
    const players = await Player.find({ sprint_40: { $ne: null } })
    .sort({ sprint_40: 1 })            
    .lean();
    res.render("index", { players });
  });
  

app.post("/clear", async (req, res)=> {
    try {
        await Player.deleteMany({});
        console.log("Cleared all players.")
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error clearing players");
    }
});

/*
console.log("Type stop to shutdown the server: ");
process.stdin.setEncoding("utf8");
process.stdin.on('readable', () => {
	const dataInput = process.stdin.read();
	if (dataInput !== null) {
        const command = dataInput.trim();
		if (command === "stop") {
			process.stdout.write("Shutting down the server\n"); 
            process.exit(0);  
        } 
        else {
			process.stdout.write(`Invalid command: ${command}`);
		}
        process.stdout.write("Type stop to shutdown the server: ");
		process.stdin.resume();
    }
    
});
*/
