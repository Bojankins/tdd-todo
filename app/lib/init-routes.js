'use strict';

var traceur = require('traceur');
var dbg = traceur.require(__dirname + '/route-debugger.js');
var initialized = false;

module.exports = (req, res, next)=>{
  if(!initialized){
    initialized = true;
    load(req.app, next);
  }else{
    next();
  }
};

function load(app, fn){
  var home = traceur.require(__dirname + '/../routes/home.js');
  var users = traceur.require(__dirname + '/../routes/users.js');
  var tasks = traceur.require(__dirname + '/../routes/tasks.js');

  app.all('*', users.lookup);

  app.get('/', dbg, home.index);
  app.get('/portal', dbg, home.portal);

  app.post('/signup', dbg, users.signup);
  app.get('/login', dbg, users.login);

  app.get('/tasks', dbg, tasks.index);
  app.put('/tasks/:taskId/complete', dbg, tasks.complete);

  console.log('Routes Loaded');
  fn();
}
