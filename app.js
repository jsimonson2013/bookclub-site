'use strict'

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

app.use('/icons', express.static('icons'))
app.use('/scripts', express.static('scripts'))
app.use('/styles', express.static('styles'))
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

const htmlEscape = input => {
  let escapedString = input
  for (let i = input.length - 1; i >0; i--) {
    switch(input.charAt(i)){
      case ":":
        escapedString = `${input.slice(0, i)}\\${escapedString.slice(i)}`
        break
      case "+":
        escapedString = `${input.slice(0, i)} ${escapedString.slice(i + 1)}`
        break
    }
  }
  return escapedString
}

app.post('/comments', (req, res) => {
  let bodyStr = ''

  req.on("data", chunk => {
    bodyStr += chunk.toString()
  })

  req.on("end", () => {
    let bodyArr = bodyStr.split('=')

    let uid = bodyArr[4]
    connection.query(`select * from users where user_id=${uid};`, (err, rows, fields) => {
      if (err) throw err

      if (!rows.length) return

      insertComment(`${rows[0].firstname} ${rows[0].lastname}`, bodyArr)
    })
  })

  const insertComment = (author, bodyArr) => {
    let body = htmlEscape(bodyArr[1].split('&')[0])
    let pid = bodyArr[2].split('&')[0]
    let date = htmlEscape(decodeURIComponent(bodyArr[3].split('&')[0]))
    
    connection.query(`insert into posts (content, parent_id, create_date, author) values ('${body}','${pid}', '${date}', '${author}');`, (err, result) => {
      if (err) throw err

      res.sendFile('html/feed-template.html', {root: __dirname})
    })
  }
})

app.post('/submission', (req, res) => {
  let bodyStr = ''

  req.on("data", chunk => {
    bodyStr += chunk.toString()
  })

  req.on("end", () => {
    let bodyArr = bodyStr.split('=')

    let uid = bodyArr[3]
    connection.query(`select * from users where user_id=${uid};`, (err, rows, fields) => {
      if (err) throw err

      if (!rows.length) return

      insertPost(`${rows[0].firstname} ${rows[0].lastname}`, bodyArr)
    })
  })

  const insertPost = (author, bodyArr) => {
    let body = htmlEscape(bodyArr[1].split('&')[0])
    let date = htmlEscape(decodeURIComponent(bodyArr[2].split('&')[0]))
    
    connection.query(`insert into posts (content, create_date, author) values ('${body}', '${date}', '${author}');`, (err, result) => {
      if (err) throw err

      res.sendFile('html/feed-template.html', {root: __dirname})
    })
  }
})

app.post('/vote', (req, res) => {
  let bodyStr = ''
  let voteStr = ''

  req.on("data", chunk => {
    bodyStr += chunk.toString()
  })

  req.on("end", () => {
    let bodyArr = bodyStr.split('=')
    
    connection.query(`select * from posts where post_id=${bodyArr[1].split('&')[0]};`, (err, rows, fields) => {
      if (err) throw err

      if(!rows.length) return

      if (rows[0].votes) voteStr = `${rows[0].votes}, ${bodyArr[2]}`

      else voteStr = bodyArr[2].toString()

      updateVotes()
      
      res.sendFile('html/feed-template.html', {root: __dirname})
    })

    let updateVotes = () => {
      connection.query(`update posts set votes='${voteStr}' where post_id=${bodyArr[1].split('&')[0]};`, (err, result) => {
        if (err) throw err
      })
    }
  })
})
