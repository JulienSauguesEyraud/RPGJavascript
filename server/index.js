import { createServer } from 'http'
import { Server } from 'socket.io'

import {
  handleAction,
  handleCreate, handleJoin,
  handleLeave, handleReset,

} from './SocketHandlers.js'

const httpServer = createServer()
const io = new Server(httpServer, { cors: { origin: '*' } })

io.on('connection', (socket) => {
  socket.on('create', (className) => handleCreate(socket, className))
  socket.on('join', ({ code, className }) => handleJoin(io, socket, code, className))
  socket.on('action', (action) => handleAction(io, socket, action))
  socket.on('reset', () => handleReset(io,socket))
  socket.on('leave', () => handleLeave(io, socket));
  socket.on('disconnect', () => handleLeave(io, socket));
})

httpServer.listen(3001, () => console.log('Game server on :3001'))