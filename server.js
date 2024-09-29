const express = require('express');
const mongoose = require('mongoose');
const fs = require("fs");
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();

// Use CORS middleware
app.use(cors()); // Add this line

app.use(express.json());

fs.readdirSync("./routes").map((r) =>
    app.use("", require("./routes/" + r))
);

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.listen(process.env.PORT || 8080);
