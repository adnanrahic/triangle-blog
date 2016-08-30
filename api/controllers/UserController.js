/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	getUsers:function (req, res, next) {
        User.find()
        .exec(function(err, users){
            res.ok(users);
        });
    },

    getUser: function(req, res, next){
        User.findOne(req.param('id'))
        .exec(function(err, user){
            if (err) return next(err);
            res.ok(user); 
        });
    },

    postUser: function(req, res, next){
        User.create(req.params.all())
        .exec(function(err, user){
            if (err) return next(err);

            req.session.authenticated = true;
            req.session.User = user;
            user.online = true;
            user.save(function(err, user) {
                if(err) return next(err);
                res.ok(user);             
            });
        });
    },

    putUser: function(req, res, next){
        User.update(req.param('id'), req.params.all())
        .exec(function(err, user){
            if (err) return next(err);
            res.ok(user); 
        });
    },

    destroyUser: function(req, res, next){
        User.destroy(req.param('id'))
        .exec(function(err, user){
            res.ok("User destroyed.")
        });
    }
};

