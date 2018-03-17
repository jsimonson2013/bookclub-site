const express = require('express')
const app = express()

const mysql = require('mysql')
const cp = require('cookie-parser')

const connection = mysql.createConnection({
  host: 'localhost',
  user: process.argv[2],
  password: process.argv[3],
  database: process.argv[4]
})

app.use(cp())

app.use('/scripts', express.static('scripts'))
app.use('/html', express.static('html'))

app.listen(3000, () => {
  console.log('App listening on port 3000!')
})

app.get('/', (req, res) => {
  res.sendFile('html/login-template.html', {root: __dirname})
})

app.get('/login', (req, res) => {
  connection.query(`select * from users WHERE username='${req.query.user}';`, (err, rows, fields) => {
    if (err) throw err

    if(!rows.length) res.sendFile('html/login-template.html', {root: __dirname})
    
    else if (rows[0].password == req.query.pass) {
      res.cookie('UID', rows[0].user_id, {maxAge: 900000, httpOnly: false})
      res.sendFile('html/feed-template.html', {root: __dirname})
    }

    else res.sendFile('html/login-template.html', {root: __dirname})
  })
})

app.get('/feed', (req, res) => {
  connection.query("select * from posts;", (err, rows, fields) => {
    if (err) throw err

    if(rows.length < 1) return

    res.json(rows)
  })
})

app.get('/profile', (req, res) => {
  connection.query(`select * from users where user_id='${req.query.user_id}';`, (err, rows, fields) => {
    if (err) throw err

    if(rows.length < 1) return

    res.json(rows)
  })
})

app.get('/comments', (req, res) => {
  connection.query(`select * from posts where parent_id='${req.query.parent_id}';`, (err, rows, fields) =>{
    if (err) throw err

    if(rows.length < 1) return

    res.json(rows)
  })
})

app.post('/comments', (req, res) => {
  var bodyStr = ''

  req.on("data", chunk => {
    bodyStr += chunk.toString()
  })

  req.on("end", () => {
    bodyArr = bodyStr.split('=')
    
    connection.query(`insert into posts (content, parent_id) values ('${bodyArr[1].split('&')[0]}','${bodyArr[2]}');`, (err, result) => {
      if (err) throw err
    })

    res.sendFile('html/feed-template.html', {root: __dirname})
  })
})

app.post('/vote', (req, res) => {
  var bodyStr = ''
  var voteStr = ''

  req.on("data", chunk => {
    bodyStr += chunk.toString()
  })

  req.on("end", () => {
    var bodyArr = bodyStr.split('=')
    
    connection.query(`select * from posts where post_id=${bodyArr[1].split('&')[0]};`, (err, rows, fields) => {
      if (err) throw err

      if(!rows.length) return

      if (rows[0].votes) voteStr = `${rows[0].votes}, ${bodyArr[2]}`

      else voteStr = bodyArr[2].toString()

      updateVotes()
      
      res.sendFile('html/feed-template.html', {root: __dirname})
    })

    var updateVotes = () => {
      connection.query(`update posts set votes='${voteStr}' where post_id=${bodyArr[1].split('&')[0]};`, (err, result) => {
        if (err) throw err
      })
    }
  })
})

app.post('/submission', (req, res) => {
  var bodyStr = ''

  req.on("data", chunk => {
    bodyStr += chunk.toString()
  })

  req.on("end", () => {
    bodyArr = bodyStr.split('=')

    connection.query(`insert into posts (content) values ('${bodyArr[1]}');`, (err, result) => {
      if (err) throw err
    })

    res.sendFile('html/feed-template.html', {root: __dirname})
  })
})
