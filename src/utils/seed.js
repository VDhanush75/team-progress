require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Team = require('../models/Team');
const Project = require('../models/Project');
const Task = require('../models/Task');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/team_progress';

async function run(){
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB for seeding');

  // clear
  await User.deleteMany({});
  await Team.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});

  // create users
  const adminPass = await bcrypt.hash('adminpass',10);
  const managerPass = await bcrypt.hash('managerpass',10);
  const memberPass = await bcrypt.hash('memberpass',10);

  const admin = await User.create({ name:'Admin User', email:'admin@example.com', password:adminPass, role:'admin' });
  const manager = await User.create({ name:'Manager User', email:'manager@example.com', password:managerPass, role:'manager' });
  const member = await User.create({ name:'Member User', email:'member@example.com', password:memberPass, role:'member' });

  const team = await Team.create({ name:'Team Alpha', description:'Alpha team', manager:manager._id, members:[manager._id, member._id] });

  // attach team to users
  manager.teams.push(team._id); await manager.save();
  member.teams.push(team._id); await member.save();

  const project = await Project.create({ team: team._id, name:'Project A', description:'First project', createdBy: manager._id });
  const task1 = await Task.create({ project: project._id, title:'Setup repo', description:'Initialize repo and readme', assignee: member._id, status: 'todo' });
  const task2 = await Task.create({ project: project._id, title:'Create API', description:'Build basic auth API', assignee: manager._id, status: 'inprogress' });

  console.log('Seeding complete. Created admin/manager/member and sample team/project/tasks.');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
