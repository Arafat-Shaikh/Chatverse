require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const User = require("./model/users");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const cors = require("cors");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const Message = require("./model/message");
const { returnUser } = require("./service");
const path = require("path");
var opts = {};
opts.jwtFromRequest = function (req, res) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  return token;
};
opts.secretOrKey = process.env.SECRET_KEY;

const server = require("http").createServer(app);

app.use(express.static(path.resolve(__dirname, "build")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
// https://chat-verse-plum.vercel.app
app.use(
  session({
    secret: process.env.SESSION_KEY, // a secret used to sign the session ID cookie
    resave: false, // forces the session to be saved back to the store
    saveUninitialized: false, // forces a session that is "uninitialized" to be saved to the store
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  process.nextTick(function () {
    console.log("serialize");
    console.log(user);
    return done(null, returnUser(user));
  });
});

passport.deserializeUser(function (user, done) {
  process.nextTick(function () {
    console.log("deserialize");
    console.log(user);
    return done(null, returnUser(user));
  });
});

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          return done(null, false, { message: "Invalid User" });
        } else {
          user.status = "online";
        }
        crypto.pbkdf2(
          password, // this entered password will be hashed.
          user.salt,
          310000,
          32,
          "sha256",
          async function (err, hashedPassword) {
            // it will compare the stored password and provided password.
            if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
              done(null, false, { message: "Invalid User" });
            } else {
              const token = jwt.sign(
                { name: user.name, email: user.email },
                process.env.SECRET_KEY
              );
              done(null, { email: user.email, name: user.name, token });
            }
          }
        );
      } catch (err) {
        console.log(err);
        done(err);
      }
    }
  )
);

passport.use(
  //authenticate route for using this strategy as jwt.
  new JwtStrategy(opts, async function (jwt_payload, done) {
    console.log("jwt payload here");
    console.log(jwt_payload); // it will hold user information which you will provide.
    try {
      const user = await User.findOne({ email: jwt_payload.email });
      console.log(user);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
        // or you could create a new account
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

app.post("/signup", async (req, res) => {
  try {
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(
      req.body.password,
      salt,
      310000,
      32,
      "sha256",
      async function (err, hashedPassword) {
        const user = new User({ ...req.body, password: hashedPassword, salt });
        const doc = await user.save();
        console.log(doc);
        const token = jwt.sign(
          { name: doc.name, email: doc.email },
          process.env.SECRET_KEY
        );

        if (err) {
          console.log(err);
        } else {
          req.login(doc, (err) => {
            if (err) {
              console.log(err);
              res.status(401).json(err);
            } else {
              delete doc.password;
              delete doc.salt;
              res
                .cookie("jwt", token, {
                  expires: new Date(Date.now() + 360000),
                  httpOnly: true,
                })
                .status(201)
                .json(returnUser(doc));
            }
          });
        }
      }
    );
  } catch (err) {
    let msg;
    if (err.code === 11000) {
      msg = "User already exist";
    } else {
      msg = err;
    }
    res.status(401).json(err);
  }
});

app.post("/login", passport.authenticate("local"), async (req, res) => {
  console.log("i got here");
  console.log(req.user);
  try {
    if (req.user) {
      const user = await User.findOne({ email: req.user.email });
      delete user.password;
      delete user.salt;
      res
        .cookie("jwt", req.user.token, {
          expires: new Date(Date.now() + 3600000),
          httpOnly: true,
        })
        .status(201)
        .json(returnUser(user));
    } else {
      console.log(req);
      console.log("hello");
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    console.log(users);
    console.log(req.user);
    res.status(201).json(users);
  } catch (err) {
    console.log(err);
    res.status(401).json(err);
  }
});

app.get("/check", passport.authenticate("jwt"), async (req, res) => {
  console.log("hello");
  console.log(req.user);
  if (req.user) {
    res.status(201).json(returnUser(req.user));
  } else {
    res.status(401);
  }
});

app.get("/logout", (req, res) => {
  res
    .cookie("jwt", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .sendStatus(200);
});

function auth() {
  return passport.authenticate("jwt");
}

async function getRoomMessages(room) {
  let roomMessages = await Message.aggregate([
    { $match: { roomId: room } },
    { $group: { _id: "$date", messagesByDate: { $push: "$$ROOT" } } },
  ]);
  let sortedRoomMessage = roomMessages.sort((a, b) => {
    let date1 = a._id.split("/");
    let date2 = b._id.split("/");
    date1 = date1[2] + date1[0] + date1[1];
    date2 = date2[2] + date2[0] + date2[1];
    return date1 < date2 ? -1 : 1;
  });
  console.log(sortedRoomMessage);
  return sortedRoomMessage;
}

io.on("connection", (socket) => {
  socket.on("new-user", async () => {
    const users = await User.find();
    console.log(users);
    io.emit("new-user", users);
  });

  socket.on("join-room", async (currentRoom, room) => {
    socket.leave(currentRoom);
    socket.join(room);
    const messages = await getRoomMessages(room);
    socket.emit("room-messages", messages);
  });

  socket.on("create-message", async (message, from, roomId, date, time) => {
    const newMessage = new Message({ message, from, roomId, date, time });
    await newMessage.save();
    let messages = await getRoomMessages(roomId);
    io.to(roomId).emit("room-messages", messages);
    socket.broadcast.emit("notifications", roomId);
  });
});

app.use("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, process.env.DIR_PUBLIC, "index.html"));
});

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("database connected");
}

server.listen(process.env.PORT, () => {
  console.log("server started");
});
