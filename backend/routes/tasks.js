const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Task = require('../models/Task');

// @route   GET /api/tasks?startupId=ID
// @desc    Get all checklist tasks for active startup workspace
router.get('/', protect, async (req, res) => {
  const { startupId } = req.query;
  if (!startupId) {
    return res.status(400).json({ success: false, message: 'startupId is required.' });
  }

  try {
    const tasks = await Task.find({ startupId, userId: req.user._id }).sort({ createdAt: 1 });
    return res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    console.error('Error loading checklist tasks:', err);
    return res.status(500).json({ success: false, message: 'Server error loading checklist tasks.' });
  }
});

// @route   POST /api/tasks
// @desc    Create a checklist task
router.post('/', protect, async (req, res) => {
  const { startupId, title, priority } = req.body;

  if (!startupId || !title) {
    return res.status(400).json({ success: false, message: 'startupId and title are required.' });
  }

  try {
    const task = await Task.create({
      userId: req.user._id,
      startupId,
      title,
      priority: priority || 'medium',
      status: 'todo',
    });
    return res.status(201).json({ success: true, task });
  } catch (err) {
    console.error('Error creating task:', err);
    return res.status(500).json({ success: false, message: 'Server error creating task.' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task status or details
router.put('/:id', protect, async (req, res) => {
  const { title, status, priority } = req.body;

  try {
    let task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    task.title = title || task.title;
    task.status = status || task.status;
    task.priority = priority || task.priority;

    await task.save();
    return res.json({ success: true, task });
  } catch (err) {
    console.error('Error updating task:', err);
    return res.status(500).json({ success: false, message: 'Server error updating task.' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Remove task
router.delete('/:id', protect, async (req, res) => {
  try {
    const result = await Task.deleteOne({ _id: req.params.id, userId: req.user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    return res.json({ success: true, message: 'Task removed successfully.' });
  } catch (err) {
    console.error('Error deleting task:', err);
    return res.status(500).json({ success: false, message: 'Server error removing task.' });
  }
});

module.exports = router;
