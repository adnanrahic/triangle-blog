/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
     
     
     
module.exports = {

  attributes: {
    username: {
      type: 'string',
      required:true
    },

    email: {
      type: 'string',
      email:true,
      required:true,
      unique:true
    },

    password: {
      type: 'string'
    },

    online: {
      type: 'boolean',
      defaultsTo: false
    },

    admin: {
      type: 'boolean',
      defaultsTo: false
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.password;
      return obj;
    }

  },


  beforeCreate: function(values, next) {
    require('bcryptjs').hash(values.password, 8, function(err, hash) {
      values.password = hash;
      next();
    });
  }
};

