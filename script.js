const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')
const player = document.querySelector("audio")
const name = prompt('What is your name?')
appendMessage('You joined')
socket.emit('new-user', name)

function audioTimeUpdateHandler(evt){
  socket.emit('send-audio-time-2svr',
      {
        time: evt.target.currentTime,
        paused: evt.target.paused
      }
  )
}

function pausedUpdateHandler(evt){
  socket.emit('send-pausestate-2svr', evt.target.paused)
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
  appendMessage(`${name} connected`)
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})

messageForm.addEventListener('submit', e => {
  e.preventDefault()
  const message = messageInput.value
  appendMessage(`You: ${message}`)
  socket.emit('send-chat-message', message)
  messageInput.value = ''
})

function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}
