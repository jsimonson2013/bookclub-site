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

const getTopPosts = () => {
	const queries = []

	connection.query(`select cast(AES_DECRYPT(unique_group_id, '${process.argv[5]}') as char(256)) g, name from fgroups;`, (err, rows, fields) => {
		if (err) throw err

		for (let row of rows) {
			queries.push(new Promise((resolve, reject) => {
				connection.query(`select content, author from posts where uniq_group = AES_ENCRYPT('${row.g}', '${process.argv[5]}') and parent_post is NULL order by DATE(date) desc limit 3;`, (err, r, fields) => {
					if (err) throw err

					const posts = []
					for (let post of r) posts.push({'content': post.content, 'author': post.author, 'gid': row.g, 'gname': row.name})

					resolve(posts)
				})
			}))
		}
		groupPostsByUsers(queries)
	})
}

const groupPostsByUsers = promises => {
	const queries = []

	Promise.all(promises).then(groups => {
		for (let post of groups) {
			if (!post[0]) continue

			queries.push(new Promise((resolve, reject) => {
				connection.query(`select email from users where default_group=AES_ENCRYPT('${post[0].gid}', '${process.argv[5]}') and pass is not NULL and notifications_on IS TRUE;`, (err, rows, fields) => {
					if (err) throw err

					const emails = []
					for (let email of rows) emails.push({'email': email.email, 'posts': post})

					resolve(emails)
				})
			}))
		}
		sendEmails(queries)
	})
}

const sendEmails = promises => {
	Promise.all(promises).then(groups => {
		for (let emails of groups) {
			for (let email of emails) {
				let body = `<p>Here is a list of the top posts in ${email.posts[0].gname}:</p><ul>`
				for (let post of email.posts) {
					body = body + '<li>'+post.author+' wrote "'+post.content+'"</li>'
				}
				sendEmail(email.email, 'FriendGroup Top Posts this Week!', body + '</ul><p>To check these out follow the link at the bottom of this email.<br>To unsubscribe from these weekly emails, visit your profile and change your email settings.</p>')
			}
		}
	})
	setTimeout(() => {process.exit()}, 10000)
}

getTopPosts()
