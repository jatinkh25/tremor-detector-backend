const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const { spawn } = require('child_process')
const fs = require('fs')
const readline = require('readline')
const path = require('path')

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

const rootDir = path.resolve(__dirname)

io.on('connection', (socket) => {
  // Specify the file path
  // const filePath = '/home/justone/Desktop/tremor-detector/backend/src/test.txt'

  // // Read the file
  // fs.readFile(filePath, 'utf8', (err, data) => {
  //   if (err) {
  //     console.error(err)
  //     return
  //   }

  //   // File contents are available in the 'data' parameter
  //   console.log(data)
  //   socket.emit('get-delta', data)
  // })

  // Specify the file path
  const filePath = `${rootDir}/Data_test.csv`

  // Create a readable stream from the file
  const stream = fs.createReadStream(filePath)

  // Create a readline interface
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  })

  // Read the file line by line
  rl.on('line', (line) => {
    io.emit('get-delta', line)
  })

  // Handle end of file
  rl.on('close', () => {
    console.log('End of file')
  })
})

app.post('/iot', (req, res) => {
  // Convert the data to a string
  const dataString = JSON.stringify(postData)

  // Define the file path and name
  const filePath = 'data.txt'

  // Write the data to the file
  fs.writeFile(filePath, dataString, (err) => {
    if (err) {
      console.error('Error writing file:', err)
      res.status(500).json({ error: 'Failed to write file' })
    } else {
      res.status(200).json({ message: 'Post request successful' })
      console.log('Data written to file')
      const pythonFile = spawn('python3', ['src/notebook.py'])

      pythonFile.stdout.on('data', (classifierOutput) => {
        console.log(`stdout: ${classifierOutput}`)
        io.emit('get-delta', { iotData: req.body, classifierOutput })
      })

      pythonFile.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`)
      })

      pythonFile.on('close', (code) => {
        console.log(`child process exited with code ${code}`)
      })
    }
  })

  res.status(200).json({ message: 'Post request successful' })
})

httpServer.listen(process.env.PORT || 3001, () => {
  console.log('listening on port 3001')
})
