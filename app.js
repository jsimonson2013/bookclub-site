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

const login = require('./src/login')
const user = require('./src/user')
const post = require('./src/post')

app.use(bp.json())
app.use(cp())
app.use(cors())

app.listen(3000, () => {
	console.log('App listening on port 3000!')
})

/**
 * Bypasses login call. This is called if the client has a cookie with the 
 * user id stored.
 *
 * @param req.query.user user_id for users table query
 *
 * @return res.json.url feed page url for browser redirect
 * @return res.json.uid user_id from users table to store login as cookie
 * @return res.json.gid default_group_id from users table to stroe group default as cookie
 * @return res.json.gname name from groups table to store in group default cookie
 */
app.get('/bypass', (req, res) => {
	login.bypass(connection, req, res)
})

/**
 * Changes the users default group.
 *
 * @param req.query.gid id of new default group
 * @param req.query.uid id of user to change default group
 *
 * @return res.status 200 on success
 */
app.get('/change-group', (req, res) => {
	user.changeDefault(connection, req, res)
})

/**
 * Gets comments for a post using the post as the parent to search among other
 * posts that could be comments.
 *
 * @param req.query.parent_id post parent id to query comments for
 *
 * @return res.json[] comment objects including content, author, and date
 */
app.get('/comments', (req, res) => {
	post.getComments(connection, req, res)
})

/**
 * Post a new comment - a special type of post.
 *
 * @param req.body json object including user_id, content, timestamp, group_id 
 *
 * @return res.status 200 on success, 404 on failure
 */
app.post('/comments', (req, res) => {
	post.newComment(connection, req, res)
})

/**
 * Creates a new group.
 *
 * @param req.query.name new group name to add
 * @param req.query.uid user who is creating group
 *
 * @return res.json.gid new id of group
 * @return res.json.gname name of group, equal to req.query.name
 */
app.get('/create-group', (req, res) => {
	user.createGroup(connection, req, res)
})

/**
 * Create a new profile.
 *
 * @param req.query.code code to match with invite
 *
 * @return res.redirect create profile page for redirect
 * @return res.status 404 on failure
 */
app.get('/create-profile', (req, res) => {
	user.createProfile(connection, req, res)
})

/**
 * Deletes post only if requested by author.
 */
app.post('/delete-post', (req, res) => {
	post.deletePost(connection, req, res)
})

/**
 * Get the default group of a user.
 *
 * @param req.query.uid id of user to query
 *
 * @return res.json.gid id of default group
 */
app.get('/default-group', (req, res) => {
	user.defaultGroup(connection, req, res)
})

/**
 * Get the feed content for a group given a start date.
 *
 * @param req.query.group_id group to get posts for
 * @param req.query.start_date date from which to start post query
 *
 * @return res.json[] post objects including content, post_id, link, author and date
 */
app.get('/feed', (req, res) => {
	connection.query(`select content, cast(AES_DECRYPT(unique_post_id, '${process.argv[5]}') as char(256)) u, link, author, date from posts where uniq_group=AES_ENCRYPT('${req.query.group_id}', '${process.argv[5]}') and parent_post is NULL and DATE(date) < DATE('${req.query.start_date}') order by DATE(date) desc limit 10;`, (err, rows, fields) => {
		if (err) throw err

		if(rows.length < 1) return

		res.json(rows)
	})
})

/**
 * Get groups a user is a member of.
 *
 * @param req.query.user_id id of user to get groups for
 *
 * @return res.json[] group objects including name and id 
 */
app.get('/groups', (req, res) => {
	user.getGroups(connection, req, res)
})

/**
 * Increment a user's score.
 *
 * @param req.query.uid id of user whose score to increment
 *
 * @return res.status 200 on success
 */
app.get('/increment-score', (req, res) => {
	user.incrementScore(connection, req, res)
})

/**
 * Invite a new user. Adds entries to the users table, invitees table, and memberships table. Sends an invite email.
 *
 * @param req.query.email email of user to invite
 * @param req.query.uid inviting user's id
 * @param req.query.gid group user is invited to
 *
 * @return res.status 200 on success
 */
app.get('/invite', (req, res) => {
	user.invite(connection, req, res)
})

/**
 * Remove user from group by deleting membership.
 *
 * @param req.query.uid id of user to remove from membership
 * @param req.query.gid id ofgroup to remove user membership
 *
 * @return res.status 200 on success
 */
app.get('/leave-group', (req, res) => {
	user.leaveGroup(connection, req, res)
})

/**
 * Set login state for user's client.
 *
 * @param req.query.user user_id for users table query
 * @param process.argv[5] key for table encryption
 *
 * @return res.json.url feed page url for browser redirect
 * @return res.json.uid user_id from users table to store login as cookie
 * @return res.json.gid default_group_id from users table to stroe group default as cookie
 * @return res.json.gname name from groups table to store in group default cookie
 */
app.get('/login', (req, res) => {
	login.login(connection, req, res)
})

/**
 * Gets the users notifications settings.
 *
 * @param req.query.uid for users unique id
 *
 * @returns res.json.notifications_on true if notifications on, else false
 */
app.get('/notifications', (req, res) => {
	user.getNotifications(connection, req, res)
})

/**
 * Get number of comments for a post.
 *
 * @param req.query.parent_id parent id of post to query comments for
 *
 * @return res.json[] ids of comments
 */
app.get('/num-comments', (req, res) => {
	post.getNumComments(connection, req, res)
})

/**
 * Get all members in group.
 *
 * @param req.query.gid group id of group to select users from
 *
 * @return res.json[] names of members in group
 */
app.get('/members', (req, res) => {
	connection.query(`select firstname, lastname from memberships inner join users on memberships.uniq_user=users.unique_user_id where uniq_group=AES_ENCRYPT('${req.query.gid}', '${process.argv[5]}');`, (err, rows, fields) => {
		if (err) throw err

		if (rows.length < 1) res.sendStatus(404)

		else res.json(rows)
	})
})

/**
 * Update users password to new password. Sends email notifying password change.
 *
 * @param req.body.email email of user to change password
 * @param req.body.newpass new password for user
 * @param process.argv[5] key for password encryption
 *
 * @return res.status 200 on success.
 */
app.post('/pass', (req, res) => {
	user.updatePass(connection, req, res)
})

/**
 * Get posts by a user.
 */
app.get('/posts-by-user', (req, res) => {
	user.getPosts(connection, req, res)
})

/**
 * Get user's profile information.
 *
 * @param req.query.user_id user id of profile to query
 *
 * @return res.json[] object of user including all fields
 */
app.get('/profile', (req, res) => {
	user.getProfile(connection, req, res)
})

/**
 * Reset user's password to random password and send them and email with it.
 *
 * @param req.query.email email of user to reset password
 * @param process.argv[5] key for password encryption
 *
 * @return res.status 200 on success
 */
app.get('/reset-pass', (req, res) => {
	user.resetPass(connection, req, res)
})

/**
 * Sets the user's notification settings.
 *
 * @param req.query.uid user's unique id
 * @param req.query.set is boolean used to set notifications
 *
 * @returns res.status 200 on success
 */
app.get('/set-notifications', (req, res) => {
	user.setNotifications(connection, req, res)
})

/**
 * Get user's score.
 *
 * @param req.query.first first name of user whose score to get
 * @param req.query.last last name of user whose score to get
 *
 * @return res.json.score score of user
 */
app.get('/score', (req, res) => {
	user.getScore(connection, req, res)
})

/**
 * Signup an invited user.
 *
 * @param req.query.first first name for user to insert into users
 * @param req.query.last last name for user to insert into users
 * @param req.query.pass password to be encrypted and added to user
 * @param req.query.code code to match with invitees code
 * @param process.argv[5] key for password encryption
 *
 * @return res.json.url feed page url for browser redirect
 * @return res.json.uid user_id from users table to store login as cookie
 * @return res.json.gid default_group_id from users table to stroe group default as cookie
 * @return res.json.gname name from groups table to store in group default cookie
 */
app.get('/signup', (req, res) => {
	login.signup(connection, req, res)
})

/**
 * Post new post to group for user.
 *
 * @param req.body json object including user_id, content, timestamp, group_id 
 *
 * @return res.status 200 on success, 404 on failure
 */
app.post('/submission', (req, res) => {
	post.newPost(connection, req, res)
})

/**
 * Post new vote on post for user.
 *
 * @param req.body.user_id voter user's id
 * @param req.body.post_id id of post to vote on
 *
 * @return res.status 200 on success
 */
app.post('/vote', (req, res) => {
	post.vote(connection, req, res)
})

/**
 * Get votes for post.
 *
 * @param req.query.post_id id of post to get votes for
 *
 * @return res.json[] ids for votes
 */
app.get('/votes', (req, res) => {
	post.getVotes(connection, req, res)
})

/**
 * Get votes for posts by user.
 *
 * @param req.query.post_id post to get votes for
 * @param req.query.user_id user to get votes for
 *
 * @return res.json[] ids for votes
 */
app.get('/votes-by-user', (req, res) => {
	user.getVotes(connection, req, res)
})
