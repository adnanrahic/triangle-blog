/**
 * BlogController
 *
 * @description :: Server-side logic for managing blogs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    initBlog: function(req,res){        
        if(req.isSocket){
            // connecting to the socket
            var socket = req.socket;
            var io = sails.io;
            console.log("User subscribed to " + req.socket.id);
            io.sockets.emit('connected', {message: 'Connected!'});

            Blog.watch(req);
            Blog.findOne(req.param('id'))
            .exec(function(err, blog) {
                if(err) return next(err);
                io.sockets.emit('getBlogById', blog);
            });
        } else {
            Blog.findOne(req.param('id'))
            .exec(function(err, blog) {
                if(err) return next(err);
                User.findOne(blog.postedBy)
                .exec(function(err, user) {
                    return res.view('blog-details',{
                        image: blog.image,
                        content: blog.content,
                        postedBy: user,
                        id: blog.id
                    });
                });
            });
        }
    },

	getBlogById: function(req,res,next) {
        Blog.findOne(req.param('id'))
        .exec(function(err, blog) {
            if(err) return next(err);
            res.send(200, blog);
        });
    },
    getBlogs: function(req,res,next) {
        Blog.find()
        .exec(function(err, blogs) {
            if(err) return next(err);
            res.send(200, blogs);
        });
    },
    postBlog: function(req,res,next) {
        Blog.create(req.params.all())
        .exec(function(err, blog) {
            if(err) return next(err);
            res.send(200, blog);
        });
    }
};

