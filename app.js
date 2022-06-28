const express = require('express');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const session = require('express-session');
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');

const http = require('http');
const { connectDB } = require('./config/database');
const { chatting } = require('./controllers/chatroom');

dotenv.config({ path: './config/config.env' });

const app = express();
connectDB();
app.use(flash());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('./public'));
app.use(fileUpload());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

const server = http.createServer(app);
const io = new Server(server);

//*Routes
app.use('', require('./routes/main').router);

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

//* Start chatting -- user connected
chatting(io);
