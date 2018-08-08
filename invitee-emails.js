'use strict'

const mysql = require('mysql')
const sendmail = require('sendmail')()

const connection = mysql.createConnection({
	host: 'localhost',
	user: process.argv[2],
	password: process.argv[3],
	database: process.argv[4]
})

const sendEmail = (recipient, subject, body) => {
	sendmail({
		from: 'webmaster@jacobsimonson.me',
		to: recipient,
		subject: subject,
		html: `Hello,<br><br>${body}<br><br>Have a nice day!<br><br><a href="https://friendgroup.jacobsimonson.me">Link to FriendGroup.</a>`,
	}, (err, reply) => {if (err) console.log(err)})
}

const getInvitees = () => {
	connection.query(`select email, code, expiration from invitees;`, (err, rows, fields) => {
		if (err) throw err

		const now = new Date(Date.now())

		const later = new Date(Date.now())
		later.setDate(later.getDate() + 2);

		for (let row of rows) {
			if (new Date(later.toISOString()) > new Date(row.expiration)) {
				sendEmail(row.email, 'Your FriendGroup Invite is Expiring Soon!', `
					<p>Your invite will expire on ${row.expiration.toString().substring(0, 15)}!</p>
					<p>You can complete your account activation and group joining by following this link<br><br><a href="https://fgapi.jacobsimonson.me/create-profile/?code=${row.code}">friendgroup.jacobsimonson.me<a><br><br>And entering the following code in the Code field:<br><b>${row.code}</b></p>
				`)
			}

			if (new Date(now.toISOString()) > new Date(row.expiration)) {
				connection.query(`delete from invitees where email="${row.email}";`, (err, results) => {
					if (err) throw err
				})

				connection.query(`select user_id from users where email="${row.email}";`, (err, rows, fields) => {
					if (err) throw err

					connection.query(`delete from memberships where user_id=${rows[0].user_id};`, (err, results) => {
						if (err) throw err

						connection.query(`delete from users where user_id=${rows[0].user_id};`, err, results) => {
							if (err) throw err
						})
					})
				})
			}
		}
	})

	setTimeout(() => {process.exit()}, 10000)
}

getInvitees()
