/*------------------------------- Starter Code -------------------------------*/

const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const User = require("./models/user");
const Hoot = require("./models/hoot");
const bcrypt = require("bcrypt");

const connect = async () => {
    // Connect to MongoDB using the MONGODB_URI specified in our .env file.
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Call the runQueries function, which will eventually hold functions to work
    // with data in our db.
    await runQueries();

    // Disconnect our app from MongoDB after our queries run.
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");

    // Close our app, bringing us back to the command line.
    process.exit();
};

const createUsers = async () => {
    const saltRounds = 10;
    const users = await User.create([
        { username: "sss", hashPassword: bcrypt.hashSync("sss", saltRounds) },
        { username: "kkk", hashPassword: bcrypt.hashSync("kkk", saltRounds) },
    ]);
    console.log(users);
};

const createHoots = async () => {
    await Hoot.deleteMany({});
    const author = "67ac117d8319363f21d29af3";
    const someoneElse = "";
    const hoots = await Hoot.create([
        { title: "sss", text: "sss", category: "News", author },
        { title: "kkk", text: "kkk", category: "News", author },
        { title: "qqq", text: "qqq", category: "Sports", someoneElse },
    ]);
    console.log(hoots);
};

const runQueries = async () => {
    console.log("Queries running.");
    // The functions calls to run queries in our db will go here as we write them.
    await createHoots();
};

connect();
/*------------------------------ Query Functions -----------------------------*/
