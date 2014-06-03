'use strict';

exports.complete = (req, res)=>{
  res.render('home/index', {title: 'Node.js: Home'});
};
