'use strict'

const express = require('express')
const app = express()
const bp = require('body-parser')
const sendmail = require('sendmail')()

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
	connection.query(`select user_id, default_group_id, groups.name from users inner join groups on groups.group_id=users.default_group_id WHERE user_id='${req.query.user}';`, (err, rows, fields) => {
		if (err) throw err

		if(!rows.length) res.send('OK')

		else {
			res.json({
				url: 'https://friendgroup.jacobsimonson.me/html/feed-template.html',
				uid: rows[0].user_id,
				gid: rows[0].default_group_id,
				gname: rows[0].name
			})
		}
	})
})

app.get('/login', (req, res) => {
	connection.query(`select user_id, default_group_id, groups.name, cast(AES_DECRYPT(pass, '${process.argv[5]}') as char(255)) pass_decrypt from users inner join groups on groups.group_id=users.default_group_id WHERE username='${req.query.user}';`, (err, rows, fields) => {
		if (err) throw err

		if(!rows.length) res.send('OK')

		else if (rows[0].pass_decrypt == req.query.pass) {
			res.cookie('UID', rows[0].user_id, {maxAge: 900000, domain: 'friendgroup.jacobsimonson.me', path:'/', httpOnly: false})
			res.json({
				url: 'https://friendgroup.jacobsimonson.me/html/feed-template.html',
				uid: rows[0].user_id,
				gid: rows[0].default_group_id,
				gname: rows[0].name
			})
		}

		else res.send('OK')
	})
})

app.get('/signup', (req, res) => {
	const first = req.query.first
	const last = req.query.last
	const email = req.query.email
	const user = req.query.user
	const pass = req.query.pass

	connection.query(`insert into users (firstname, lastname, email, username, pass) values ('${first}', '${last}', '${email}', '${user}', AES_ENCRYPT('${pass}', '${process.argv[5]}'));`, (err, results) => {
		if (err) throw err

	//TODO: get group info

		res.json({
			url: 'https://friendgroup.jacobsimonson.me/html/feed-template.html'
			//uid: rows[0].user_id,
			//gid: rows[0].default_group_id,
			//gname: rows[0].name
		})
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

app.get('/reset-pass', (req, res) => {
	const email = req.query.email

	let randpass = ''
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

	for (let i = 0; i < 5; i++) randpass += possible.charAt(Math.floor(Math.random() * possible.length))

	connection.query(`update users set pass=AES_ENCRYPT('${randpass}', '${process.argv[5]}') where email='${email}';`, (err, results) => {
		if (err) throw err

		if (results.changedRows < 1) res.sendStatus(404)

		else {
			sendmail({
				from: 'webmaster@jacobsimonson.me',
				to: email,
				subject: 'Your Password was Reset',
				html: `Hello,<br><br>Your password has been reset to:<br><b>${randpass}</b><br>You should probably change that to something you will remember.<br><br>Have a great day!`,
			}, (err, reply) => {
				if (err) console.log(err)
			})

			res.sendStatus(200)
		}
	})
})

const makeCode = () => {
  let text = ""
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (let i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length))

  return text
}

app.get('/invite', (req, res) => {
	const email = req.query.email
	const userid = req.query.uid
	const groupid = req.query.gid

	connection.query(`select user_id from users where email='${email}';`, (err, rows, fields) => {
		if (err) throw err

		const joinCode = makeCode()

		if (rows.length < 1) {
			connection.query(`insert into invitees (email, invite_id, group_id, code) values ('${email}', '${userid}', '${groupid}', '${joinCode}');`, (err, results) => {
				if (err) throw err

				sendEmail(`You can complete your account activation and group joining by following this link<br><br><a href="https://fgapi.jacobsimonson.me/create-profile/?code=${joinCode}">friendgroup.jacobsimonson.me<a>`)
			})
		}

		else {
			connection.query(`select group_id from memberships where user_id=${rows[0].user_id};`, (er, rs, fls) => {
				if (er) throw er

				if (rs.length < 1) return

				for (let r of rs) {
					if (r.group_id == groupid) {
						res.sendStatus(400)
						return
					}
				}

				connection.query(`insert into memberships (user_id, group_id) values (${userid}, ${groupid})`, (e, results) => {
					if (e) throw e

					sendEmail(`You have been automatically added to the group and can manage memberships from your profile.`)
				})
			})
		}
		
		const sendEmail = bodyExtra => {
			let groupname = ''
			let invitername = ''

			connection.query(`select name from groups where group_id=${groupid};`, (error, rows, fields) => {
				if (error) throw error

				groupname = rows[0].name

				connection.query(`select firstname, lastname from users where user_id=${userid};`, (error, rows, fields) => {
					if (error) throw error

					invitername = `${rows[0].firstname} ${rows[0].lastname}`

					sendmail({
						from: 'webmaster@jacobsimonson.me',
						to: email,
						subject: 'You\'re Invited to FriendGroup!',
						html: `Hello,<br><br>You have been invited by ${invitername} to join the group ${groupname} on FriendGroup!<br><br>${bodyExtra}<br><br>Have a nice day!`,
					}, (err, reply) => {
						if (err) console.log(err)
					})

					res.sendStatus(200)
				})

			})
		}
	})
})

app.get('/create-profile', (req, res) => {
	const code = req.query.code

	connection.query(`select group_id from invitees where code='${code}'`, (err, rows, fields) => {
		if (rows.length > 0) {
			res.cookie('GID', rows[0].group_id, {maxAge: 900000, domain: 'friendgroup.jacobsimonson.me', path:'/', httpOnly: false})

			res.redirect('https://friendgroup.jacobsimonson.me/html/create-profile.html')
		}

		else res.sendStatus(404)
	})
})

app.post('/pass', (req, res) => {
	const userid = req.body.user
	const newpass = req.body.newpass

	connection.query(`update users set pass=AES_ENCRYPT('${newpass}', '${process.argv[5]}') where user_id=${userid};`, (err, result) => {
		if (err) throw err

		connection.query(`select email from users where user_id='${userid}';`, (err, rows, fields) => {
			sendmail({
				from: 'webmaster@jacobsimonson.me',
				to: rows[0].email,
				subject: 'Confirmation of Password Change',
				html: 'Hello,<br><br>Just sending this email to let you know that you\'ve changed your password!<br><br>Have a great day!',
			}, (err, reply) => {
				if (err) console.log(err)
			})

			res.sendStatus(200)
		})
	})
})

app.get('/feed', (req, res) => {
	connection.query(`select content, post_id, link, author, date from posts where group_id=${req.query.group_id} and parent_id is NULL and DATE(date) < DATE('${req.query.start_date}') order by DATE(date) desc limit 10;`, (err, rows, fields) => {
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
	connection.query(`select name, groups.group_id from memberships inner join groups on memberships.group_id=groups.group_id where user_id=${req.query.user_id};`, (err, rows, fields) => {
		if (err) throw err

		if (rows.length < 1) {
			res.json({'': ''})
			return
		}

		res.json(rows)
	})
})

app.get('/num-comments', (req, res) => {
	connection.query(`select post_id from posts where parent_id='${req.query.parent_id}';`, (err, rows, fields) =>{
		if (err) throw err

		if(rows.length < 1) {
			res.json({'': ''})
			return
		}

		res.json(rows)
	})
})

app.get('/comments', (req, res) => {
	connection.query(`select content, author, date from posts where parent_id='${req.query.parent_id}' order by DATE(date) asc;`, (err, rows, fields) =>{
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
			case "%":
				escapedString = `${input.slice(0, i)}%25${escapedString.slice(i + 1)}`
				break
		}
	}
	return escapedString
}

const insertPost = (type, params) => {
	connection.query(`select firstname, lastname from users where user_id=${params.user_id};`, (err, rows, fields) => {
		if (err) throw err

		if (!rows.length) return false

		const content = htmlEscape(params.content)
		const date = htmlEscape(decodeURIComponent(params.timestamp))

		const gid = params.group_id
		const author = `${rows[0].firstname} ${rows[0].lastname}`

		let queryString = ''

		if (type == 'comment') {
			const pid = params.parent_id
			queryString = `insert into posts (content, parent_id, group_id, date, author) values ('${content}', '${pid}', '${gid}', '${date}', '${author}');`
		}

		else if (type == 'post') {
			const link = htmlEscape(decodeURIComponent(params.link))
			queryString = `insert into posts (content, group_id, date, author, link) values ('${content}', '${gid}', '${date}', '${author}', '${link}');`
		}

		if (queryString.length < 1) return false

		connection.query(queryString, (err, result) => {
			if (err) throw err

			return true
		})
	})
}

app.post('/comments', (req, res) => {
	if (insertPost('comment', req.body)) res.sendStatus(200)

	else res.sendStatus(404)
})

app.post('/submission', (req, res) => {
	if (insertPost('post', req.body)) res.sendStatus(200)

	else res.sendStatus(404)
})

app.get('/votes', (req, res) => {
	connection.query(`select vote_id from votes where post_id=${req.query.post_id};`, (err, rows, fields) => {
		if (err) throw err

		if(!rows.length) {
			res.json({'': ''})
			return
		}

		res.json(rows)
	})
})

app.get('/votes-by-user', (req, res) => {
	connection.query(`select vote_id from votes where post_id in (select post_id from votes where post_id=${req.query.post_id} and user_id=${req.query.user_id});`, (err, rows, fields) => {
		if (err) throw err

		if(!rows.length) {
			res.json({'': ''})
			return
		}

		res.json(rows)
	})
})

app.post('/vote', (req, res) => {
	connection.query(`select user_id, post_id from votes where user_id=${req.body.user_id} and post_id=${req.body.post_id};`, (err, rows, fields) => {
		if (err) throw err

		if (!rows.length) {
			connection.query(`insert into votes (user_id, post_id) values (${req.body.user_id}, ${req.body.post_id});`, (err, result) => {
				if (err) throw err

				res.sendStatus(200)
			})
		}

		else res.sendStatus(200)
	})
})
