'use strict'

const express = require('express')
const app = express()
const bp = require('body-parser')

const mysql = require('mysql')
const cp = require('cookie-parser')
const cors = require('cors')

const connection = mysql.createConnection({
	host: 'localhost',
	user: process.argv[2],
	password: process.argv[3],
	database: process.argv[4]
})

app.use(bp.json())
app.use(cp())
app.use(cors())

app.listen(3000, () => {
	console.log('App listening on port 3000!')
})

app.get('/bypass', (req, res) => {
	connection.query(`select user_id, default_group_id from users WHERE user_id='${req.query.user}';`, (err, rows, fields) => {
		if (err) throw err

		if(!rows.length) res.send('OK')

		else {
			res.json({
				url: 'https://friendgroup.jacobsimonson.me/html/feed-template.html',
				uid: rows[0].user_id,
				gid: rows[0].default_group_id
			})
		}
	})
})


app.get('/login', (req, res) => {
	connection.query(`select user_id, default_group_id, cast(AES_DECRYPT(pass, '${process.argv[5]}') as char(255)) pass_decrypt from users WHERE username='${req.query.user}';`, (err, rows, fields) => {
		if (err) throw err

		if(!rows.length) res.send('OK')

		else if (rows[0].pass_decrypt == req.query.pass) {
			res.cookie('UID', rows[0].user_id, {maxAge: 900000, domain: 'friendgroup.jacobsimonson.me', path:'/', httpOnly: false})
			res.json({
				url: 'https://friendgroup.jacobsimonson.me/html/feed-template.html',
				uid: rows[0].user_id,
				gid: rows[0].default_group_id
			})
		}

		else res.send('OK')
	})
})

app.get('/score', (req, res) => {
	connection.query(`select score from users where firstname='${req.query.first}' and lastname='${req.query.last}';`, (err, rows, fields) => {
		if (err) throw err

		if(!rows.length) res.json({'score': 0})

		else res.json({'score': rows[0].score})
	})
})

app.get('/increment-score', (req, res) => {
	connection.query(`update users set score=score + 1 where user_id='${req.query.uid}';`, (err, results) => {
		if (err) throw err

		res.sendStatus(200)
	})
})

/**
app.get('/update-score', (req, res) => {
	const author = `${req.query.first} ${req.query.last}`
	let score = 0

	connection.query(`select * from posts where author='${author}';`, (err, rows, fields) => {
		if (err) throw err

		if(!rows.length) {
			score = 0
			res.json({'score': 0})
		}

		else {
			score = rows.length
			res.json({'score': rows.length})
		}

		const firstname = req.query.first
		connection.query(`update users set score=${score} where firstname='${firstname}';`, (err, results) => {
			if (err) throw err
		})
	})
})
*/

app.post('/pass', (req, res) => {
	const userid = req.body.user
	const newpass = req.body.newpass

	connection.query(`update users set pass=AES_ENCRYPT('${newpass}', '$process.argv[5]') where user_id=${userid};`, (err, result) => {
		if (err) throw err

		res.send('OK')
	})
})

app.get('/feed', (req, res) => {
	connection.query(`select * from posts where group_id=${req.query.group_id} order by DATE(create_date) desc;`, (err, rows, fields) => {
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

app.get('/groups', (req, res) => {
	connection.query(`select name from memberships inner join groups on memberships.group_id=groups.group_id where user_id=${req.query.user_id};`, (err, rows, fields) => {
		if (err) throw err

		if (rows.length < 1) {
			res.json({'': ''})
			return
		}

		res.json(rows)
	})
})

app.get('/comments', (req, res) => {
	connection.query(`select * from posts where parent_id='${req.query.parent_id}' order by DATE(create_date) asc;`, (err, rows, fields) =>{
		if (err) throw err

		if(rows.length < 1) {
			res.json({'': ''})
			return
		}

		res.json(rows)
	})
})

const htmlEscape = input => {
	let escapedString = input
	for (let i = input.length - 1; i >0; i--) {
		switch(input.charAt(i)){
			case "'":
				escapedString = input.slice(0, i) + "'" + escapedString.slice(i+1)
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
	connection.query(`select * from users where user_id=${req.body.user_id};`, (err, rows, fields) => {
		if (err) throw err

		if (!rows.length) return

		insertComment(`${rows[0].firstname} ${rows[0].lastname}`, req.body)
	})

	const insertComment = (author, body) => {
		const content = htmlEscape(body.content)
		const pid = body.parent_id
		const date = htmlEscape(decodeURIComponent(body.timestamp))
    
		connection.query(`insert into posts (content, parent_id, create_date, author) values ('${content}','${pid}', '${date}', '${author}');`, (err, result) => {
			if (err) throw err

			res.send('OK')
		})
	}
})

app.post('/submission', (req, res) => {
	connection.query(`select * from users where user_id=${req.body.user_id};`, (err, rows, fields) => {
		if (err) throw err

		if (!rows.length) return

		insertPost(`${rows[0].firstname} ${rows[0].lastname}`, req.body)
	})

	const insertPost = (author, body) => {
		const content = htmlEscape(decodeURIComponent(body.content))
		const link = htmlEscape(decodeURIComponent(body.link))
		const date = htmlEscape(decodeURIComponent(body.timestamp))

		connection.query(`insert into posts (content, create_date, author, link) values ('${content}', '${date}', '${author}', '${link}');`, (err, result) => {
			if (err) throw err

			res.send('OK')
		})
	}
})

app.post('/vote', (req, res) => {
	connection.query(`insert into votes (user_id, post_id) values (${req.body.user_id}, ${req.body.post_id});`, (err, result) => {
		if (err) throw err

		res.send('OK')
	})
})
