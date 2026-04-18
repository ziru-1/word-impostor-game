import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { setupSocketHandler } from './socketHandler'

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
})

const port = 3001

setupSocketHandler(io)

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
