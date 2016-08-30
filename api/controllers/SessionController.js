/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var bcrypt = require('bcryptjs');

module.exports = {
	getSession: function(req,res){
        req.session.authenticated = true;
        res.ok(req.session);
    },

    setSession: function(req, res, next) {

		// Check for email and password in params sent via the form, if none
		// redirect the browser back to the sign-in form.
		if (!req.param('email') || !req.param('password')) {
			// return next({err: ["Password doesn't match password confirmation."]});

			var usernamePasswordRequiredError = [{
				name: 'usernamePasswordRequired',
				message: 'You must enter both a username and password.'
			}]

			// Remember that err is the object being passed down (a.k.a. flash.err), whose value is another object with
			// the key of usernamePasswordRequiredError
			req.session.flash = {
				err: usernamePasswordRequiredError
			}

			res.send(404, 'Please input your username and password.');
			return;
		}

		// Try to find the user by there email address. 
		// findOneByEmail() is a dynamic finder in that it searches the model by a particular attribute.
		// User.findOneByEmail(req.param('email')).done(function(err, user) {
		User.findOneByEmail(req.param('email'), function foundUser(err, user) {
			if (err) return next(err);

			// If no user is found...
			if (!user) {
				var noAccountError = [{
					name: 'noAccount',
					message: 'The email address ' + req.param('email') + ' not found.'
				}]
				req.session.flash = {
					err: noAccountError
				}
                res.send(404, 'No user found.');
				return;
			}

			// Compare password from the form params to the encrypted password of the user found.
			bcrypt.compare(req.param('password'), user.password, function(err, valid) {
				if (err) return next(err);

				// If the password from the form doesn't match the password from the database...
				if (!valid) {
					var usernamePasswordMismatchError = [{
						name: 'usernamePasswordMismatch',
						message: 'Invalid username and password combination.'
					}]
					req.session.flash = {
						err: usernamePasswordMismatchError
					}
                    res.send(404, 'Invalid password.');
					return;
				}

				// Log user in
				req.session.authenticated = true;
				req.session.User = user;
				user.online = true;

				var io = sails.io;
				io.sockets.emit('updateUser', {
					id: user.id,
					online: true
				});

				// User.publishUpdate(user.id, {
				// 	online: true					
				// });

				user.save(function(err, user) {
					if(req.session.User.admin) {
						res.send(200, 'Admin powaaaa!');
						return;
					}
					res.send(200, 'Logged in!');
				});
			});
		});
	},

	destroySession: function(req, res, next) {
		User.findOne(req.session.User.id)
		.exec(function(err, user){
			user.online = false;

			var io = sails.io;
			io.sockets.emit('updateUser', {
				id: user.id,
				online: false
			});

			// User.publishUpdate(user.id, {
			// 	online: false					
			// });


			user.save(function(err, user) {
				// User.publishUpdate(req.session.User.id, {
				// 	id: req.session.User.id,
				// 	online:	false
				// });
				
				// Wipe out the session (log out)
				req.session.destroy();

				// Redirect the browser to the sign-in screen
				res.redirect('/');
				// res.send(200, 'User signed out.');
			});
		});
	}
};

