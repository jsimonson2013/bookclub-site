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

// TODO: insert unique parent id
// TODO: insert unique group id
// TODO: x2
const insertPost = (connection, type, params) => {
	connection.query(`select firstname, lastname from users where unique_user_id=AES_ENCRYPT('${params.uniq_id}', '${process.argv[5]}');`, (err, rows, fields) => {
		if (err) throw err

		if (!rows.length) return false

		const content = htmlEscape(params.content)
		const link = htmlEscape(decodeURIComponent(params.link))

		const gid = params.group_id
		const author = `${rows[0].firstname} ${rows[0].lastname}`

		let queryString = ''
		const random = makeCode(12)

		if (type == 'comment') {
			const pid = params.parent_id
			queryString = `insert into posts (content, parent_id, group_id, date, author, link, unique_post_id) values ('${content}', '${pid}', '${gid}', now(), '${author}', '${link}', AES_ENCRYPT('${random}', '${process.argv[5]}'));`
		}

		else if (type == 'post') {
			queryString = `insert into posts (content, group_id, date, author, link, unique_post_id) values ('${content}', '${gid}', now(), '${author}', '${link}', AES_ENCRYPT('${random}', '${process.argv[5]}'));`
		}

		if (queryString.length < 1) return false

		connection.query(queryString, (err, result) => {
			if (err) throw err
		})
	})
	return true
}

module.exports = {
	// TODO: condition on unique parent id
	getComments: (connection, req, res) => {
		connection.query(`select content, author, date, link from posts where parent_id='${req.query.parent_id}' order by DATE(date) asc;`, (err, rows, fields) =>{
			if (err) throw err

			if(rows.length < 1) {
				res.json({'': ''})
				return
			}

			res.json(rows)
		})
	},
	// TODO: condition on unique parent id
	// TODO: select unique post id
	getNumComments: (connection, req, res) => {
		connection.query(`select post_id from posts where parent_id='${req.query.parent_id}';`, (err, rows, fields) =>{
			if (err) throw err

			if(rows.length < 1) {
				res.json({'': ''})
				return
			}

			res.json(rows)
		})
	},
	// TODO: condition on unique post id
	getVotes: (connection, req, res) => {
		connection.query(`select vote_id from votes where post_id=${req.query.post_id};`, (err, rows, fields) => {
			if (err) throw err

			if(!rows.length) {
				res.json({'': ''})
				return
			}

			res.json(rows)
		})
	},
	// TODO: see insertPost()
	newPost: (connection, req, res) => {
		if (insertPost(connection, 'post', req.body)) res.sendStatus(200)

		else res.sendStatus(404)
	},
	newComment: (connection, req, res) => {
		if (insertPost(connection, 'comment', req.body)) res.sendStatus(200)

		else res.sendStatus(404)
	},
	// TODO: select unique user id
	// TODO: select unique post id
	// TODO: condition on unique post id
	// TODO: condition on unique user id
	// TODO: insert unique user id
	// TODO: insert unique post id
	vote: (connection, req, res) => {
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
	}
}
