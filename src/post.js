const qh = require('./query-helper')

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

const insertPost = (connection, type, params) => {
	connection.query(`select firstname, lastname from users where unique_user_id=${qh.encrypt(params.uniq_id)};`, (err, rows, fields) => {
		if (err) throw err

		if (!rows.length) return false

		const content = htmlEscape(params.content)
		const link = htmlEscape(decodeURIComponent(params.link))

		const author = `${rows[0].firstname} ${rows[0].lastname}`
		const group = params.group

		let queryString = ''
		const random = makeCode(12)

		if (type == 'comment') {
			const pid = params.parent_id
			queryString = `insert into posts (content, parent_post, date, author, link, uniq_group, unique_post_id) values ('${content}', ${qh.encrypt(pid)}, now(), '${author}', '${link}', ${qh.encrypt(group)}, ${qh.encrypt(random)});`
		}

		else if (type == 'post') {
			queryString = `insert into posts (content, date, author, link, uniq_group, unique_post_id) values ('${content}', now(), '${author}', '${link}', ${qh.encrypt(group)}, ${qh.encrypt(random)});`
		}

		if (queryString.length < 1) return false

		connection.query(queryString, (err, result) => {
			if (err) throw err
		})
	})
	return true
}

module.exports = {
	deletePost: (connection, req, res) => {
		connection.query(`select author from posts where unique_post_id=${qh.encrypt(req.body.post_id)};`, (err, rows, fields) => {
			if (rows.length < 1){
				res.sendStatus(404)
				return
			}

			names = rows[0].author.split(" ")
			connection.query(`select ${qh.decrypt('unique_user_id', 'u')} from users where firstname='${names[0]}' and lastname='${names[1]}';`, (err, rows, fields) => {
				if (rows.length < 1){
					res.sendStatus(404)
					return
				}

				connection.query(`delete from posts where unique_post_id=${qh.encrypt(req.body.post_id)} or parent_post=${qh.encrypt(req.body.post_id)};`, (err, results) => {
					if (err) throw err

					res.sendStatus(200)
				})
			})
		})
	},
	getComments: (connection, req, res) => {
		connection.query(`select content, author, date, link from posts where parent_post=${qh.encrypt(req.query.parent_id)} order by DATE(date) asc;`, (err, rows, fields) =>{
			if (err) throw err

			if(rows.length < 1) {
				res.json({'': ''})
				return
			}

			res.json(rows)
		})
	},
	getNumComments: (connection, req, res) => {
		connection.query(`select ${qh.decrypt('unique_post_id', 'u')} from posts where parent_post=${qh.encrypt(req.query.parent_id)};`, (err, rows, fields) =>{
			if (err) throw err

			if(rows.length < 1) {
				res.json({'': ''})
				return
			}

			res.json(rows)
		})
	},
	getVotes: (connection, req, res) => {
		connection.query(`select vote_id from votes where post=${qh.encrypt(req.query.post_id)};`, (err, rows, fields) => {
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
	vote: (connection, req, res) => {
		connection.query(`select ${qh.decrypt('user', 'u')}, ${qh.decrypt('post', 'p')} from votes where user=${qh.encrypt(req.body.user_id)} and post=${qh.encrypt(req.body.post_id)};`, (err, rows, fields) => {
			if (err) throw err

			if (!rows.length) {
				connection.query(`insert into votes (user, post) values (${qh.encrypt(req.body.user_id)}, ${qh.encrypt(req.body.post_id)});`, (err, result) => {
					if (err) throw err

					res.sendStatus(200)
				})
			}

			else res.sendStatus(200)
		})
	}
}
