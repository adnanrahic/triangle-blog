/**
 * ForumController
 *
 * @description :: Server-side logic for managing forums
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {

    initForum:function(req,res){        
        if(req.isSocket){
            // connecting to the socket
            var socket = req.socket;
            var io = sails.io;
            console.log("User subscribed to " + req.socket.id);
            io.sockets.emit('connected', {message: 'Connected!'});


            Forum.watch(req);
            Forum.find()
            .exec(function(err, forum){
                if(err) console.log(err);
                io.sockets.emit('getForum', forum);
            });
        }
    },

    postToForum:function(req,res){
        Forum.create(req.params.all())
        .exec(function(err, obj){
            Forum.publishCreate({
                id: obj.id, 
                message: obj.message,
                user: obj.user
            });            
        });
    },

    putForumEntry:function(req,res){
        Forum.update(req.param('id'), req.params.all())
        .exec(function(err, obj){

            res.send(200, obj);

            // Forum.publishCreate({
            //     id: obj.id, 
            //     message: obj.message,
            //     user: obj.user
            // });            
        });
    }
};

