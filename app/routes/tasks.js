'use strict';

var traceur = require('traceur');
var Task = traceur.require(__dirname + '/../models/task.js');

exports.index = (req, res)=>{
  var userId = res.locals.user._id;
  Task.findByUserId(userId, tasks=>
  {
    res.render('tasks/index', {tasks: tasks, title: 'Tasks'});
  });
};

exports.complete = (req, res)=>{
  res.render('home/index', {title: 'Node.js: Home'});
};