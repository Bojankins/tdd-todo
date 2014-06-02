'use strict';

var bcrypt = require('bcrypt');
var users = global.nss.db.collection('users');

class User
{
  constructor(obj)
  {
    this.email = obj.email;
    this.password = bcrypt.hashSync(obj.password, 10);
  }

  save(fn)
  {
    if(this._id)
    {
      saveUser(this);
    }
    else
    {
      User.findByEmail(this.email, user=>
      {
        if(user)
        {
          fn(null);
        }
        else
        {
          saveUser(this);
        }
      });
    }

    function saveUser(user)
    {
      users.save(user, (e, user)=>fn(user));
    }
  }

  static findByEmail(email, fn)
  {
    users.findOne({email: email}, (e, user)=>fn(user));
  }

  static register(obj, fn)
  {
    var user = new User(obj);
    user.save((u)=>fn(u));
  }
}

module.exports = User;