const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.sendFile('html/bookclub.html', {root: __dirname})
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

