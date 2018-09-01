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

const makeCode = (length) => {
  let text = ""
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length))

  return text
}

// TODO: remove non-unique ids
const insertPost = (connection, type, params) => {
	connection.query(`select firstname, lastname from users where unique_user_id=AES_ENCRYPT('${params.uniq_id}', '${process.argv[5]}');`, (err, rows, fields) => {
		if (err) throw err

		if (!rows.length) return false

		const content = htmlEscape(params.content)
		const link = htmlEscape(decodeURIComponent(params.link))

		const gid = params.group_id
		const author = `${rows[0].firstname} ${rows[0].lastname}`

		const group = params.group

		let queryString = ''
		const random = makeCode(12)

		if (type == 'comment') {
			const pid = params.parent_id
			queryString = `insert into posts (content, parent_post, group_id, date, author, link, uniq_group, unique_post_id) values ('${content}', AES_ENCRYPT('${pid}', '${process.argv[5]}'), '${gid}', now(), '${author}', '${link}', AES_ENCRYPT('${group}', '${process.argv[5]}'), AES_ENCRYPT('${random}', '${process.argv[5]}'));`
		}

		else if (type == 'post') {
			queryString = `insert into posts (content, group_id, date, author, link, uniq_group, unique_post_id) values ('${content}', '${gid}', now(), '${author}', '${link}', AES_ENCRYPT('${group}', '${process.argv[5]}'), AES_ENCRYPT('${random}', '${process.argv[5]}'));`
		}

		if (queryString.length < 1) return false

		connection.query(queryString, (err, result) => {
			if (err) throw err
		})
	})
	return true
}

module.exports = {
	getComments: (connection, req, res) => {
		connection.query(`select content, author, date, link from posts where parent_post=AES_ENCRYPT('${req.query.parent_id}', '${process.argv[5]}') order by DATE(date) asc;`, (err, rows, fields) =>{
			if (err) throw err

			if(rows.length < 1) {
				res.json({'': ''})
				return
			}

			res.json(rows)
		})
	},
	// TODO: remove non-unique ids
	getNumComments: (connection, req, res) => {
		connection.query(`select post_id, cast(AES_DECRYPT('unique_post_id', '${process.argv[5]}') as char(256)) u from posts where parent_post=AES_ENCRYPT('${req.query.parent_id}', '${process.argv[5]}');`, (err, rows, fields) =>{
			if (err) throw err

			if(rows.length < 1) {
				res.json({'': ''})
				return
			}

			res.json(rows)
		})
	},
	getVotes: (connection, req, res) => {
		connection.query(`select vote_id from votes where post=AES_ENCRYPT('${req.query.post_id}', '${process.argv[5]}');`, (err, rows, fields) => {
			if (err) throw err

			if(!rows.length) {
				res.json({'': ''})
				return
			}

			res.json(rows)
		})
	},
	newPost: (connection, req, res) => {
		if (insertPost(connection, 'post', req.body)) res.sendStatus(200)

		else res.sendStatus(404)
	},
	newComment: (connection, req, res) => {
		if (insertPost(connection, 'comment', req.body)) res.sendStatus(200)

		else res.sendStatus(404)
	},
	// TODO: remove non-unique ids
	vote: (connection, req, res) => {
		connection.query(`select user_id, post_id, cast(AES_DECRYPT('user', '${process.argv[5]}') as char (256)) u, cast(AES_DECRYPT('post', '${process.argv[5]}') as char (256)) p from votes where user=AES_ENCRYPT('${req.body.user_id}', '${process.argv[5]}') and post=AES_ENCRYPT('${req.body.post_id}', '${process.argv[5]}');`, (err, rows, fields) => {
			if (err) throw err

			if (!rows.length) {
				connection.query(`insert into votes (user, post) values (AES_ENCRYPT('${req.body.user_id}', '${process.argv[5]}'), AES_ENCRYPT('${req.body.post_id}', '${process.argv[5]}'));`, (err, result) => {
					if (err) throw err

					res.sendStatus(200)
				})
			}

			else res.sendStatus(200)
		})
	}
}
