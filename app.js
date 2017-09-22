const express = require('express')
const app = express()

const user = "user"
const pass = "pass"

app.get('/', (req, res) => {
  if (req.query.user === user && req.query.pass) {
    res.sendFile('html/bookclub.html', {root: __dirname})
  }
  else {
    res.sendFile('html/login.html', {root: __dirname})
  }
})

app.listen(3000, () => {
  console.log('App listening on port 3000!')
})

app.post('/', (req, res) => {
  res.send('Got a POST request!')
})

app.put('/user', (req, res) => {
  res.send('Got a PUT request at /user!')
})

app.delete('/user', (req, res) => {
  res.send('Got a DELET request at /user!')
})

