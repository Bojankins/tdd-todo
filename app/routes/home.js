'use strict';

exports.index = (req, res)=>{
  res.render('home/index', {title: 'Home'});
};

exports.portal = (req, res)=>{
  res.render('home/portal', {title: 'Login or Signup'});
};