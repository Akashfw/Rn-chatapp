const express= require("express");
const socketio= require("socket.io");
const http= require("http");
const { Socket } = require("dgram");
require('dotenv').config();
const app= express();
const server = http.createServer(app);
const io= socketio(server);
const cors = require("cors");
app.use(express.json());
const {connection} = require("./config/db");
const {userRoute} = require("./routes/user_route");
const {authenticate}= require("./middleware/authentication")

const {userJoin,getRoomUsers,getCurrentUser,userLeave}= require("./utils/users");
const {formateMessage}= require("./utils/messages")




app.use(cors());


app.get("/",(req,res)=>{
    res.send("home page")
});

app.use(userRoute);
app.use(authenticate);

const boatName= "Masai Server"
io.on("connection", (Socket)=>{
    console.log("one client joined");

    Socket.on("joinRoom",({username,room})=>{
         const user= userJoin(Socket.id,username,room)
         Socket.join(user.room);
         Socket.emit("message",formateMessage(boatName,"Welcome to Masai Server"));
         Socket.broadcast.to(user.room).emit("message",formateMessage(boatName,`${user.username} has joined the chat`));

         io.to(user.room).emit("roomUsers",{
            room:user.room,
            users:getRoomUsers(user.room)
         })
    })
    
    Socket.on("chatMessage",(msg)=>{
                
        const user = getCurrentUser(Socket.id);

        io.to(user.room).emit("message",formateMessage(user.username,msg));
    })

    Socket.on("disconnect",()=>{
        console.log("one user left");
 
        const user= userLeave(Socket.id)
        io.to(user.room).emit("message",formateMessage(boatName,`${user.username} has left the chat`));

        io.to(user.room).emit("roomUsers",{
            room:user.room,
            users:getRoomUsers(user.room)
         })
    })
});

const PORT= 8080
server.listen(PORT,()=>{console.log(`server is running on ${PORT} port`)})

app.listen(process.env.port,async()=>{
    try {
        await connection;
        console.log("connected to DB");
    } catch (err) {
        console.log("unable to connect to DB");
        console.log(err)
    }
    console.log("server running on port 8000");
});