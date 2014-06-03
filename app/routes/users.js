'use strict';

var traceur = require('traceur');
var User = traceur.require(__dirname + '/../models/user.js');

exports.signup = (req, res)=>{
  User.register(req.body, user=>
  {
    if(user)
    {
      req.session.userId = String(user._id);
      res.redirect(`/login?email=${req.body.email}&password=${req.body.password}`);
    }
    else
    {
      res.redirect('/portal');
    }
  });
};

exports.login = (req, res)=>{
  User.login(req.query, user=>
  {
    if(user)
    {
      req.session.userId = String(user._id);
      res.redirect('/');
    }
    else
    {
      res.redirect('/portal');
    }
  });
};

exports.lookup = (req, res, next)=>
{
  User.findByUserId(req.session.userId, user=>
  {
    res.locals.user = user;
    next();
  });
};