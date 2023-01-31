
const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)


const publicDirectoryPath = path.join(__dirname, '../public')

const port = process.env.PORT || 3000

app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {

    socket.on('join', ({ username, room }, callback) => {
        const {error, user } = addUser({id: socket.id, username, room })

        if(error){
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome!'))
        //others can view but client itself can't
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${username} has joined!`))
        io.to(user.room).emit('roomdata',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        if (user){
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed.')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback() }
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomdata', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (loc_data, callback) => {
        const user = getUser(socket.id)
        if (user){
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${loc_data.latitude},${loc_data.longitude}`)
        )
        
        callback()}
    })


})

server.listen(port, () => {
    console.log('server is up on port '+port)
})



