/* global describe, it, before, beforeEach */
/* jshint expr: true */

'use strict';

process.env.DBNAME = 'todo-test';

var expect = require('chai').expect;
var Mongo = require('mongodb');
var app = require('../../app/app');
var request = require('supertest');
var traceur = require('traceur');

var User;
var Task;

describe('User', function(){
  before(function(done){
    request(app)
    .get('/')
    .end(function(){
      User = traceur.require(__dirname + '/../../app/models/user.js');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.collection('users').drop(function()
    {
      User.register({email: 'sue@aol.com', password:'1234'}, function(user)
      {
        done();
      });
    });
  });
  
  describe('.register', function(){
    it('should successfully register a user', function(done)
    {
      global.nss.db.collection('users').drop();
      
      var obj = {email: 'bob@aol.com', password:'1234'};
      User.register(obj, function(u)
      {
        expect(u).to.be.ok;
        expect(u).to.be.an.instanceof(User);
        expect(u._id).to.be.an.instanceof(Mongo.ObjectID);
        expect(u.password).to.have.length.of(60);
        done();
      });
    });

    it('should NOT successfully register a user', function(done)
    {
      var obj = {email: 'sue@aol.com', password:'1234'};
      User.register(obj, function(u)
      {
        expect(u).to.be.null;
        done();
      });
    });
  });
  
  describe('.login', function(){
    it('should successfully login a user', function(done)
    {
      var obj = {email: 'sue@aol.com', password:'1234'};
      User.login(obj, function(u)
      {
        expect(u).to.be.ok;
        done();
      });
    });

    it('should fail to login a user with an incorrect password', function(done)
    {
      var obj = {email: 'sue@aol.com', password:'bad password'};
      User.login(obj, function(u)
      {
        expect(u).to.be.null;
        done();
      });
    });
  });
  
  describe('.findByUserId', function(){  
    var tim = {};  

    beforeEach(function(done)
    {
      User.register({email: 'tim@aol.com', password:'1234'}, function(user)
      {
        tim = user;
        done();
      });
    });

    it('should successfully find a user', function(done)
    {
      User.findByUserId(tim._id, function(u)
      {
        expect(u).to.be.instanceof(User);
        expect(u.email).to.be.equal(tim.email);
        done();
      });
    });

    it('should NOT successfully find a user', function(done)
    {
      User.findByUserId('123456789012123456789012', function(u)
      {
        expect(u).to.be.null;
        done();
      });
    });
  });
});



describe('Task', function()
{
  var userId;
  var taskId;

  before(function(done){
    request(app)
    .get('/')
    .end(function(){
      global.nss.db.collection('tasks').drop(function()
      {
        Task = traceur.require(__dirname + '/../../app/models/task.js');
        done();
      });
    });
  });

  beforeEach(function(done){
    global.nss.db.collection('users').drop(function()
    {
      User.register({email: 'sue@aol.com', password:'1234'}, function(user)
      {
        userId = user._id;
        var taskParams = {
          title: 'Before each task',
          due: '06/02/2014',
          color: 'blue'
        };
        Task.create(userId, taskParams, function(task)
        {
          taskId = task._id;
          done();
        });
      });
    });
  });

  describe('.create', function()
  {
    it('should create a new task', function(done)
    {
      var taskParams = {
        title: 'Task test',
        due: '06/02/2014',
        color: 'red'
      };
      Task.create(userId, taskParams, function(task)
      {
        expect(task).to.be.ok;
        expect(task).to.be.instanceof(Task);
        expect(task._id).to.be.instanceof(Mongo.ObjectID);
        expect(task.title).to.be.equal(taskParams.title);
        expect(task.due).to.deep.equal(new Date(taskParams.due));
        expect(task.color).to.be.equal(taskParams.color);
        expect(task.isComplete).to.be.false;
        expect(task.userId).to.deep.equal(userId);
        done();
      });
    });

    it('should create 2 tasks for Sue and 1 task for someone else', function(done)
    {
      var taskParams1 = {
        title: 'Sue\'s first task',
        due: '06/02/2014',
        color: 'green'
      };

      Task.create(userId, taskParams1, function(task1)
      {
        var taskParams2 = {
          title: 'Sue\'s 2nd task',
          due: '06/02/2014',
          color: 'yellow'
        };

        Task.create(userId, taskParams2, function(task2)
        {
          User.register({email: 'tim@aol.com', password: '1234'}, function(user)
          {
            var taskParams3 = {
              title: 'Tim\'s task',
              due: '06/02/2014',
              color: 'orange'
            };

            Task.create(user._id, taskParams3, function(task3)
            {
              var tasks = [task1, task2, task3];
              tasks.forEach(function(task, i)
              {
                expect(task).to.be.ok.and.instanceof(Task);
                if(i === 2)
                {
                  expect(task.userId).to.deep.equal(user._id);
                }
                else
                {
                  expect(task.userId).to.deep.equal(userId);
                }
              });

              done();
            });
          });
        });
      });
    });

    it('should find all tasks with a given user ID', function(done)
    {
      var taskParams = {
        title: 'Sue\'s task',
        due: '06/02/2014',
        color: 'purple'
      };

      Task.create(userId, taskParams, function(task1)
      {
        Task.findByUserId(userId, function(tasks)
        {
          expect(tasks.length).to.be.equal(2);
          tasks.forEach(function(task)
          {
            expect(task.userId).to.deep.equal(userId);
          });
          done();
        });
      });
    });
  });

  describe('.findByTaskId', function()
  {
    it('should find a task by its id', function(done)
    {
      Task.findByTaskId(taskId, function(task)
      {
        expect(task).to.be.ok;
        expect(task).to.be.instanceof(Task);
        expect(task._id).to.be.instanceof(Mongo.ObjectID);
        done();
      });
    });

    it('should fail to find a task by its id', function(done)
    {
      Task.findByTaskId('bad id', function(task)
      {
        expect(task).to.be.null;
        done();
      });
    });
  });

  describe('#destroy', function()
  {
    it('should delete a task from the db', function(done)
    {
      Task.findByUserId(userId, function(tasks)
      {
        var originalTaskCount = tasks.length;
        Task.findByTaskId(taskId, function(task)
        {
          expect(task).to.be.instanceof(Task);
          task.destroy(function()
          {
            Task.findByTaskId(taskId, function(task)
            {
              expect(task).to.be.null;
              Task.findByUserId(userId, function(tasks)
              {
                expect(originalTaskCount - tasks.length).to.be.equal(1);
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('.toggleComplete', function()
  {
    it('should set a task status to complete', function(done)
    {
      Task.findByTaskId(taskId, function(task)
      {
        var isComplete = task.isComplete;
        task.toggleComplete();
        task.save(function(task)
        {
          expect(task.isComplete).to.equal(!isComplete);
          done();
        });
      });
    });
  });
});