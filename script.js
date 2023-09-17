const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')
const player = document.querySelector("audio")
const name = prompt('What is your name?')
appendMessage('You joined')
socket.emit('new-user', name)

function audioTimeUpdateHandler(evt){
  console.log(evt)
  console.log(`broadcasting ${evt.target.currentTime}`)
  socket.emit('send-audio-time-2svr',
      {
        time: evt.target.currentTime,
        paused: evt.target.paused
      }
  )
}

player.addEventListener("timeupdate", audioTimeUpdateHandler)
// player.addEventListener("pause", audioTimeUpdateHandler)
// player.addEventListener("play", audioTimeUpdateHandler)
socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('broadcast-audio-time', data =>{
  if (data.name != name){
    player.removeEventListener('timeupdate', audioTimeUpdateHandler)
    player.currentTime = data.message.time
    if (data.message.paused != player.paused){
      if (data.message.paused){
        player.pause()
      }
      if (!data.message.paused){
        player.play()
      }
    }
    console.log(`setting my time to ${data.message.time}`)
    setTimeout(()=>{player.addEventListener("timeupdate", audioTimeUpdateHandler)}, 100)
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
