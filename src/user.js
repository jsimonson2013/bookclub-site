const sendmail = require('sendmail')()

const makeCode = (length) => {
  let text = ""
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length))

  return text
}

const sendEmail = (recipient, subject, body) => {
	sendmail({
		from: 'webmaster@jacobsimonson.me',
		to: recipient,
		subject: subject,
		html: `Hello,<br><br>${body}<br><br>Have a nice day!<br><br><a href="https://friendgroup.jacobsimonson.me">Link to FriendGroup.</a>`,
	}, (err, reply) => {if (err) console.log(err)})
}

module.exports = {
	changeDefault: (connection, req, res) => {
		connection.query(`update users set default_group=AES_ENCRYPT('${req.query.group}', '${process.argv[5]}') where unique_user_id=AES_ENCRYPT('${req.query.uid}', '${process.argv[5]}');`, (err, results) => {
			if (err) throw err

			res.sendStatus(200)
		})
	},
	createGroup: (connection, req, res) => {
		const random = makeCode(12)

		connection.query(`insert into fgroups (name, unique_group_id) values ('${req.query.name}', AES_ENCRYPT('${random}', '${process.argv[5]}'));`, (err, results) => {
			if (err) throw err

			connection.query(`insert into memberships (uniq_group, uniq_user) values (AES_ENCRYPT('${random}', '${process.argv[5]}'), AES_ENCRYPT('${req.query.user}', '${process.argv[5]}'));`, (e, r) => {
				if (e) throw e

				res.json({
					'group': random,
					'gname': req.query.name 
				})
			})
		})	
	},
	createProfile: (connection, req, res) => {
		const code = req.query.code

		connection.query(`select email from invitees where code='${code}'`, (err, rows, fields) => {
			if (rows.length > 0) res.redirect('https://friendgroup.jacobsimonson.me/html/create-profile.html')

			else res.sendStatus(404)
		})
	},
	defaultGroup: (connection, req, res) => {
		connection.query(`select cast(AES_DECRYPT(default_group, '${process.argv[5]}') as char(256)) g from users where unique_user_id=AES_ENCRYPT('${req.query.uid}', '${process.argv[5]}');`, (err, rows, fields) => {
			if (err) throw err

			res.json({
				'group': rows[0].g,
			})
		})
	},
	getGroups: (connection, req, res) => {
		connection.query(`select name, cast(AES_DECRYPT(unique_group_id, '${process.argv[5]}') as char(256)) g from memberships inner join users on memberships.uniq_user=users.unique_user_id inner join fgroups on memberships.uniq_group=fgroups.unique_group_id where unique_user_id=AES_ENCRYPT('${req.query.user_id}', '${process.argv[5]}');`, (err, rows, fields) => {
			if (err) throw err

			if (rows.length < 1) {
				res.json({'': ''})
				return
			}

			res.json(rows)
		})
	},
	getNotifications: (connection, req, res) => {
		connection.query(`select notifications_on from users where unique_user_id=AES_ENCRYPT('${req.query.uid}', '${process.argv[5]}');`, (err, rows, fields) => {
			if (err) throw err

			if (rows.length < 1) res.sendStatus(408)

			res.json(rows)
		})
	},
	// TODO: don't select star
	getProfile: (connection, req, res) => {
		connection.query(`select * from users where unique_user_id=AES_ENCRYPT('${req.query.user_id}', '${process.argv[5]}');`, (err, rows, fields) => {
			if (err) throw err

			if(rows.length < 1) return

			res.json(rows)
		})
	},
	getScore: (connection, req, res) => {
		connection.query(`select score from users where firstname='${req.query.first}' and lastname='${req.query.last}';`, (err, rows, fields) => {
			if (err) throw err

			if(!rows.length) res.json({'score': 0})

			else res.json({'score': rows[0].score})
		})
	},
	getVotes: (connection, req, res) => {
		connection.query(`select vote_id from votes where post in (select post from votes where post=AES_ENCRYPT('${req.query.post_id}', '${process.argv[5]}') and user=AES_ENCRYPT('${req.query.user_id}', '${process.argv[5]}'));`, (err, rows, fields) => {
			if (err) throw err

			if(!rows.length) {
				res.json({'': ''})
				return
			}

			res.json(rows)
		})
	},
	incrementScore: (connection, req, res) => {
		connection.query(`update users set score=score + 1 where unique_user_id=AES_ENCRYPT('${req.query.uid}', '${process.argv[5]}');`, (err, results) => {
			if (err) throw err

			res.sendStatus(200)
		})
	},
	invite: (connection, req, res) => {
		const email = req.query.email
		const userid = req.query.uid
		const uniqgroup = req.query.g

		connection.query(`select cast(AES_DECRYPT(unique_user_id, '${process.argv[5]}') as char(256)) u from users where email='${email}';`, (err, rows, fields) => {
			if (err) throw err

			const joinCode = makeCode(10)

			if (!rows[0]) {
				connection.query(`insert into invitees (email, inviter, uniq_group, code, expiration) values ('${email}', AES_ENCRYPT('${userid}', '${process.argv[5]}'), AES_ENCRYPT('${uniqgroup}', '${process.argv[5]}'), '${joinCode}', now() + interval 1 week);`, (err, results) => {
					if (err) throw err

					let random_user_id = makeCode(12)

					connection.query(`insert into users (email, default_group, unique_user_id) values ('${email}', AES_ENCRYPT('${uniqgroup}', '${process.argv[5]}'), AES_ENCRYPT('${random_user_id}', '${process.argv[5]}'));`, (e, r) => {
						if (e) throw e
	
						const extra = `You can complete your account activation and group joining by following this link<br><br><a href="https://fgapi.jacobsimonson.me/create-profile/?code=${joinCode}">friendgroup.jacobsimonson.me<a><br><br>And entering the following code in the Code field:<br><b>${joinCode}</b>`

						handleSendEmail(extra)
					})
				})
			}

			else {
				connection.query(`select cast(AES_DECRYPT(uniq_group, '${process.argv[5]}') as char(256)) g from memberships where uniq_user=AES_ENCRYPT('${rows[0].u}', '${process.argv[5]}');`, (er, rs, fls) => {
					if (er) throw er

					if (!rs[0]) res.sendStatus(404)

					else {
						for (let r of rs) {
							if (r.g == uniqgroup) {
								res.sendStatus(404)
								return
							}
						}

						connection.query(`insert into memberships (uniq_user, uniq_group) values (AES_ENCRYPT('${rows[0].u}', '${process.argv[5]}'), AES_ENCRYPT('${uniqgroup}', '${process.argv[5]}'))`, (e, results) => {
							if (e) throw e

							const extra = `You have been automatically added to the group and can manage memberships from your profile.`

							handleSendEmail(extra)
						})
					}
				})
			}
		
			const handleSendEmail = bodyExtra => {
				let groupname = ''
				let invitername = ''

				connection.query(`select name from fgroups where unique_group_id=AES_ENCRYPT('${uniqgroup}', '${process.argv[5]}');`, (error, rows, fields) => {
					if (error) throw error

					groupname = rows[0].name
					connection.query(`select firstname, lastname from users where unique_user_id=AES_ENCRYPT('${userid}', '${process.argv[5]}');`, (error, rows, fields) => {
						if (error) throw error

						invitername = `${rows[0].firstname} ${rows[0].lastname}`
						const body = `You have been invited by ${invitername} to join the group ${groupname} on FriendGroup!<br><br>${bodyExtra}`

						sendEmail(email, 'You\'re Invited to FriendGroup!', body)
						res.sendStatus(200)
					})

				})
			}
		})
	},
	leaveGroup: (connection, req, res) => {
		connection.query(`delete from memberships where uniq_user=AES_ENCRYPT('${req.query.uid}', '${process.argv[5]}') and uniq_group=AES_ENCRYPT('${req.query.gid}', '${process.argv[5]}');`, (err, results) => {
			if (err) throw err

			res.sendStatus(200)
		})
	},
	resetPass: (connection, req, res) => {
		const email = req.query.email
		const randpass = makeCode(10)

		connection.query(`update users set pass=AES_ENCRYPT('${randpass}', '${process.argv[5]}') where email='${email}';`, (err, results) => {
			if (err) throw err

			if (results.affectedRows < 1) res.sendStatus(404)

			else {
				const body = `Your password has been reset to:<br><b>${randpass}</b><br>You should probably change that to something you will remember.`

				sendEmail(email, 'Your Password was Reset', body)

				res.sendStatus(200)
			}
		})
	},
	setNotifications: (connection, req, res) => {
		let bool = 0
		if (req.query.set == 'true') bool = 1

		connection.query(`update users set notifications_on='${bool}' where unique_user_id=AES_ENCRYPT('${req.query.uid}', '${process.argv[5]}');`, (err, rows, fields) => {
			if (err) throw err

			res.sendStatus(200)
		})
	},
	updatePass: (connection, req, res) => {
		const userid = req.body.user
		const newpass = req.body.newpass

		connection.query(`update users set pass=AES_ENCRYPT('${newpass}', '${process.argv[5]}') where unique_user_id=AES_ENCRYPT('${userid}', '${process.argv[5]}');`, (err, result) => {
			if (err) throw err

			connection.query(`select email from users where unique_user_id=AES_ENCRYPT('${userid}', '${process.argv[5]}');`, (err, rows, fields) => {
				const body = 'Just sending this email to let you know that you\'ve changed your password!'

				sendEmail(rows[0].email, 'Confirmation of Password Change', body)

				res.sendStatus(200)
			})
		})
	}
}
