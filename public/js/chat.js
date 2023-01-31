const socket = io()

//elements
const $messageform = document.querySelector('#message-form')
const $messageforminput = $messageform.querySelector('input')
const $messageformbutton = $messageform.querySelector('button')
const $sendlocationbutton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-url').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild
    // $newMessage.scrollIntoView({behavior: "smooth", block:"end", inline:"nearest"})

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    
    //Height of the new message
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //container Height
    const containerHeight = $messages.scrollHeight

    //How far i have scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    //if i havent scrolled down
    if(containerHeight - newMessageHeight <= scrollOffset+1){

        //scroll down
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (msg) => {
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (generateLocationMessage) => {
    console.log(generateLocationMessage)
    const html = Mustache.render(locationTemplate, {
        username: generateLocationMessage.username,
        locationURL: generateLocationMessage.url,
        createdAt: moment(generateLocationMessage.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

})

socket.on('roomdata', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        users,
        room
    })
    $sidebar.innerHTML = html
})

$messageform.addEventListener('submit', (e) => {
    e.preventDefault()

    //disable form
    $messageformbutton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {

        //re-enalbe form
        $messageformbutton.removeAttribute('disabled')

        $messageforminput.value = ''
        $messageforminput.focus()

        if(error){
        return console.log(error)}
        console.log('Message Delivered!')
    })
})

$sendlocationbutton.addEventListener('click', () => {

    if (!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }

    $sendlocationbutton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {latitude: position.coords.latitude, longitude: position.coords.longitude}, () => {
            console.log('Location Shared!')
            $sendlocationbutton.removeAttribute('disabled')
        })
    })

})

socket.emit('join', {username, room}, (error) => {
    if (error){
        alert(error)
        location.href = '/'
    }
})