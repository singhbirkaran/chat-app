const users = []

//adduser , removeuser, getuser, getusersinroom

const addUser = ({ id, username, room }) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username || !room) {
        return {
            error: 'Username and Room are required!'
        }
    }

    //check for existing user
    const existinguser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if (existinguser) {
        return {
            error: 'Sorry, Username is already in use!'
        }
    }

    //store user
    const user = {id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if (index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => {
        return user.id === id
    })
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => {
        return user.room === room
    })
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom, 
}