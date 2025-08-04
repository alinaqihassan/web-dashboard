require('dotenv').config({ quiet: true });
const express = require('express');
const router = express.Router();
const { addTaskToNotion, fetchTasksFromNotion, updateStatusInNotion, deleteTaskInNotion } = require('../utils/notion');
const { Client } = require('@notionhq/client');

const getEnv = key => process.env[key] || '';

const dbId = getEnv("NOTION_TODO_DB_ID");
const token = getEnv("NOTION_TOKEN")

const notion = new Client({ auth: token });

router.post('/add', async (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).json({ error: 'Task is required' });

  try {
    const response = await addTaskToNotion(notion, dbId, task);
    res.json({ success: true, id: response.id });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to add task to Notion' });
  }
});

router.get('/list', async (req, res) => {
  try {
    const tasks = await fetchTasksFromNotion(notion, dbId)
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch tasks from Notion' });
  }
});

router.post('/update', async (req, res) => {
  const { id, done } = req.body;
  if (!id || typeof done !== 'boolean') {
    return res.status(400).json({ error: 'Task id and completion status required' });
  }
  try {
    const response = await updateStatusInNotion(notion, id, done)
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update task status in Notion' });
  }
});

router.post('/delete', async (req, res) => {
  const { id } = req.body;
  if (!id ) {
    return res.status(400).json({ error: 'Task id required' });
  }
  try {
    const response = await deleteTaskInNotion(notion, id)
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete task in Notion' });
  }
});

module.exports = router;