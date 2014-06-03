'use strict';

var tasks = global.nss.db.collection('tasks');
var Mongo = require('mongodb');
var _ = require('lodash');

class Task
{
  constructor(obj, userId)
  {
    this.title = obj.title;
    this.due = new Date(obj.due);
    this.color = obj.color;
    this.userId = Mongo.ObjectID(userId);
    this.isComplete = false;
  }

  save(fn)
  {
    if(this._id)
    {
      tasks.save(this, ()=>fn(this));
    }
    else
    {
      tasks.save(this, (e, newTask)=>fn(newTask));
    }
  }

  destroy(fn)
  {
    tasks.remove({_id: this._id}, fn);
  }

  toggleComplete()
  {
    this.isComplete = !this.isComplete;
  }

  static create(userId, obj, fn){
    var task = new Task(obj, userId);
    task.save(task=>fn(task));
  }

  static findByTaskId(taskId, fn)
  {
    if(String(taskId).length === 24)
    {
      taskId = Mongo.ObjectID(taskId);
      tasks.findOne({_id: taskId}, (e, task)=>
      {
        if(task)
        {
          task = _.create(Task.prototype, task);
          fn(task);
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
  static findByUserId(userId, fn)
  {
    if(String(userId).length === 24)
    {
      userId = Mongo.ObjectID(userId);
      tasks.find({userId: userId}).toArray((e, taskArray)=>fn(taskArray));
    }
  }
}

module.exports = Task;