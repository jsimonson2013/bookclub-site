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
	connection.query(`select email, expiration from invitees;`, (err, rows, fields) => {
		if (err) throw err

		console.log(rows)
	})

	setTimeout(() => {process.exit()}, 10000)
}

getInvitees()
