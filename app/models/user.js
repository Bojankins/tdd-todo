'use strict';

var bcrypt = require('bcrypt');
var users = global.nss.db.collection('users');
var Mongo = require('mongodb');
var _ = require('lodash');

class User
{
  constructor(obj)
  {
    this.email = obj.email;
    this.password = bcrypt.hashSync(obj.password, 10);
  }

  save(fn)
  {
    users.save(this, (e, user)=>fn(user));
  }

  static findByEmail(email, fn)
  {
    users.findOne({email: email}, (e, user)=>fn(user));
  }

  static findByUserId(userId, fn)
  {
    if(String(userId).length === 24)
    {
      userId = Mongo.ObjectID(userId);
      users.findOne({_id: userId}, (e, user)=>
      {
        if(user)
        {
          user = _.create(User.prototype, user);
          fn(user);
        }
        else
        {
          fn(null);
        }
      });
    }
    else
    {
      fn(null);
    }
  }

  static register(obj, fn)
  {
    User.findByEmail(obj.email, user=>
    {
      if(user)
      {
        fn(null);
      }
      else
      {
        var newUser = new User(obj);
        newUser.save(u=>fn(u));
      }
    });
  }

  static login (obj, fn){
    console.log(bcrypt.hashSync(obj.password, 10));
    User.findByEmail(obj.email, user=>{
      if(user){
        var isMatch = bcrypt.compareSync(obj.password, user.password);
        if(isMatch){
          fn(user);
        }
        else{
          fn(null);
        }
      }
      else{
        fn(null);
      }
    });

  }
}


module.exports = User;