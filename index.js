const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, NODE_PORT, SESSION_SECRET, REDIS_URL, REDIS_PORT } = require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const redis = require('redis');
const cors = require('cors');

let RedisStore = require('connect-redis')(session);
let redisClient = redis.createClient({
    legacyMode: true,
    socket: {
        host: REDIS_URL,
        port: REDIS_PORT
    }
});

redisClient.connect().catch(console.error);

const postRouter = require("./routes/postRoutes")
const userRouter = require("./routes/userRoutes")
const app = express()

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

// this function is certainly not best practice to retry connection, but it is an option
const connectWithRetry = () => {
    // this is where our express application connects to MongoDB
    mongoose
        .connect(mongoURL)
        .then(() => console.log('Successfully connected to DB'))
        .catch((e) => {
            console.log(e)
            setTimeout(connectWithRetry, 5000);
        });
}

connectWithRetry();

app.enable("trust proxy");
app.use(cors({})); // this is default
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    cookie: {
        secure: false,
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        maxAge: 30_000
    }
}));

// middleware, this make sures the body gets attached to the request object
app.use(express.json());

app.get('/api/v1', (req, res) => {
    res.send('<h2>Hi there, it\'s really syncing... We are on prod!</h2>');
    console.log('yeah it ran');
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);

// if PORT is not set, we default to 3000
const port = NODE_PORT || 3000;

app.listen(port, () => console.log(`Listening on port: ${port}`));
