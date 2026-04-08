const express = require('express');
const os = require('os');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/tasksdb';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const taskSchema = new mongoose.Schema({
  id: Number,
  name: String,
  status: String
});

const Task = mongoose.model('Task', taskSchema);

app.get('/', (req, res) => {
  res.json({
    app: 'CISC 886 Lab 8',
    mode: process.env.MODE || 'docker',
    node: process.version,
    host: os.hostname(),
  });
});

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({}, { _id: 0, __v: 0 }).sort({ id: 1 }).lean();

    const grouped = tasks.reduce((acc, task) => {
      const key = task.status;
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    }, {});

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks', details: err.message });
  }
});

mongoose.connection.once('open', () => {
  app.listen(PORT, () => {
    console.log('--------------------------------------------------');
    console.log('  CISC 886 Lab 8 — App started');
    console.log(`  Port:  ${PORT}`);
    console.log(`  Mode:  ${process.env.MODE || 'docker'}`);
    console.log(`  Node:  ${process.version}`);
    console.log(`  Host:  ${os.hostname()}`);
    console.log('--------------------------------------------------');
  });
});