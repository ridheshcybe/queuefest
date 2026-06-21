const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',(req,res)=>{
    res.redirect('/patient')

})

app.get('/reception',(req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'reception.html'));
    
})
app.get('/patient',(req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'patient.html'));
})
let state = {
  queue: [],
  currentToken: null,     // { token, name, startTime }
  avgTime: 10,
  nextToken: 1,
  history: []             // minutes
};

function broadcastState() {
  io.emit('update', state);
}

function updateAverage() {
  if (state.history.length === 0) return;
  const sum = state.history.reduce((a, b) => a + b, 0);
  state.avgTime = sum / state.history.length;
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('update', state);

  // Add patient
  socket.on('add-patient', (data) => {
    const { name } = data;
    if (!name || name.trim() === '') {
      socket.emit('error', { message: 'Name is required' });
      return;
    }
    const token = state.nextToken++;
    state.queue.push({ token, name: name.trim() });
    broadcastState();
  });

  // Call next – start consultation
  socket.on('call-next', () => {
    if (state.queue.length === 0) {
      socket.emit('error', { message: 'Queue is empty' });
      return;
    }
    // Move first patient to current, record start time
    const patient = state.queue.shift();
    state.currentToken = {
      ...patient,
      startTime: Date.now()
    };
    broadcastState();
  });

  // Complete consultation – auto‑detect duration
  socket.on('complete-consultation', () => {
    if (!state.currentToken) {
      socket.emit('error', { message: 'No patient is being seen' });
      return;
    }
    const duration = (Date.now() - state.currentToken.startTime) / 60000; // minutes
    state.history.push(duration);
    updateAverage();
    state.currentToken = null;
    broadcastState();
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3218;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));