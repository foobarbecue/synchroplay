const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const playerUrlForm = document.querySelector('#player-url-form')
const messageInput = document.getElementById('message-input')
const playerUrlInput = document.querySelector('#mp3-url-input')
const player = document.querySelector("audio")
const name = Math.floor(Math.random() * Date.now()).toString(36);
appendMessage(`Welcome to this syncplay room! I'm going to call you ${name}.`)
socket.emit('new-user', name)

function audioTimeUpdateHandler(evt){
  socket.emit('send-audio-time',
      {
        time: evt.target.currentTime,
        paused: evt.target.paused
      }
  )
}

function pausedUpdateHandler(evt){
  socket.emit('send-pausestate', evt.target.paused)
}

player.addEventListener("timeupdate", audioTimeUpdateHandler)
player.addEventListener("pause", pausedUpdateHandler)
player.addEventListener("play", pausedUpdateHandler)
socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('broadcast-pause-state', data =>{

  if (data.name != name){
    if (data.message && !player.paused) {
      console.log('pausing')
      player.removeEventListener("pause", pausedUpdateHandler)
      player.pause()
      player.addEventListener("pause", pausedUpdateHandler)
    }
    if (!data.message && player.paused) {
      console.log('playing')
      player.removeEventListener("play", pausedUpdateHandler)
      player.play()
      player.addEventListener("play", pausedUpdateHandler)
    }
  }
})

socket.on('broadcast-audio-time', data =>{
  if (data.name != name && (Math.abs(player.currentTime - data.message.time) > 1)){
      player.removeEventListener('timeupdate', audioTimeUpdateHandler)
      player.currentTime = data.message.time
      console.log(`setting my time to ${data.message.time}`)
      player.addEventListener("timeupdate", audioTimeUpdateHandler)
  }
})

socket.on('user-connected', name => {
  appendMessage(`User ${name} connected`)
  socket.emit('send-player-url', playerUrlInput.value)
  socket.emit('send-pausestate', player.paused)
  socket.emit('send-audio-time',       {
    time: player.currentTime,
    paused: player.paused
  })
})

socket.on('user-disconnected', name => {
  appendMessage(`User ${name} disconnected`)
})

socket.on('broadcast-player-url', (url)=>{setPlayerUrl(url.message)})

messageForm.addEventListener('submit', evt => {
  evt.preventDefault()
  const message = messageInput.value
  appendMessage(`You: ${message}`)
  socket.emit('send-chat-message', message)
  messageInput.value = ''
})

playerUrlForm.addEventListener('submit', evt => {
  evt.preventDefault()
  socket.emit('send-player-url', playerUrlInput.value)
  setPlayerUrl(playerUrlInput.value)
})

function setPlayerUrl(url) {
  player.src = url
}

function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}
