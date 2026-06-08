const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  Startup,
  Idea,
  Research,
  Competitor,
  BusinessModel,
  MVPPlan,
  PitchDeck,
  Funding,
  Risk,
  Chat,
  Task,
  Analytics,
} = require('../models');

// @route   GET /api/startups
// @desc    Get all startups for active user
router.get('/', protect, async (req, res) => {
  try {
    const startups = await Startup.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, count: startups.length, startups });
  } catch (err) {
    console.error('Error fetching startups:', err);
    return res.status(500).json({ success: false, message: 'Server error loading startups.' });
  }
});

// @route   GET /api/startups/:id
// @desc    Get single startup detailed modules
router.get('/:id', protect, async (req, res) => {
  try {
    const startup = await Startup.findOne({ _id: req.id || req.params.id, userId: req.user._id });
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found.' });
    }

    // Fetch matching module assets (if they exist)
    const idea = await Idea.findOne({ startupId: startup._id });
    const research = await Research.findOne({ startupId: startup._id });
    const competitor = await Competitor.findOne({ startupId: startup._id });
    const businessModel = await BusinessModel.findOne({ startupId: startup._id });
    const mvpPlan = await MVPPlan.findOne({ startupId: startup._id });
    const pitchDeck = await PitchDeck.findOne({ startupId: startup._id });
    const funding = await Funding.findOne({ startupId: startup._id });
    const risk = await Risk.findOne({ startupId: startup._id });
    const tasks = await Task.find({ startupId: startup._id });

    return res.json({
      success: true,
      startup,
      modules: {
        idea,
        research,
        competitor,
        businessModel,
        mvpPlan,
        pitchDeck,
        funding,
        risk,
        tasks,
      },
    });
  } catch (err) {
    console.error('Error loading startup profile:', err);
    return res.status(500).json({ success: false, message: 'Server error loading startup details.' });
  }
});

// @route   POST /api/startups
// @desc    Create a new startup workspace
router.post('/', protect, async (req, res) => {
  const { name, description, industry, targetAudience } = req.body;

  if (!name || !description || !industry || !targetAudience) {
    return res.status(400).json({ success: false, message: 'Please provide all details (name, description, industry, targetAudience).' });
  }

  try {
    const startup = await Startup.create({
      userId: req.user._id,
      name,
      description,
      industry,
      targetAudience,
    });

    await Analytics.create({
      userId: req.user._id,
      action: 'STARTUP_CREATE',
      details: `Created startup: ${name} (${industry})`,
    });

    // Seed basic template tasks for the startup workspace checklist
    const defaultTasks = [
      { userId: req.user._id, startupId: startup._id, title: 'Perform AI Idea Validation to analyze SWOT', priority: 'high', status: 'todo' },
      { userId: req.user._id, startupId: startup._id, title: 'Run Market Research to estimate TAM/SAM/SOM', priority: 'medium', status: 'todo' },
      { userId: req.user._id, startupId: startup._id, title: 'Analyze key Competitors in the comparison grid', priority: 'medium', status: 'todo' },
      { userId: req.user._id, startupId: startup._id, title: 'Generate Business Model Canvas structure', priority: 'medium', status: 'todo' },
      { userId: req.user._id, startupId: startup._id, title: 'Draft MVP Roadmap and sprint milestones', priority: 'high', status: 'todo' },
      { userId: req.user._id, startupId: startup._id, title: 'Create Pitch Deck slides outline', priority: 'high', status: 'todo' },
    ];
    await Task.insertMany(defaultTasks);

    return res.status(201).json({ success: true, startup });
  } catch (err) {
    console.error('Error creating startup:', err);
    return res.status(500).json({ success: false, message: 'Server error creating startup workspace.' });
  }
});

// @route   PUT /api/startups/:id
// @desc    Update startup profile
router.put('/:id', protect, async (req, res) => {
  const { name, description, industry, targetAudience } = req.body;

  try {
    let startup = await Startup.findOne({ _id: req.params.id, userId: req.user._id });
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found.' });
    }

    startup.name = name || startup.name;
    startup.description = description || startup.description;
    startup.industry = industry || startup.industry;
    startup.targetAudience = targetAudience || startup.targetAudience;

    await startup.save();
    return res.json({ success: true, startup });
  } catch (err) {
    console.error('Error updating startup:', err);
    return res.status(500).json({ success: false, message: 'Server error updating startup details.' });
  }
});

// @route   DELETE /api/startups/:id
// @desc    Delete startup and wipe associated assets
router.delete('/:id', protect, async (req, res) => {
  try {
    const startup = await Startup.findOne({ _id: req.params.id, userId: req.user._id });
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found.' });
    }

    // Wipe startup record
    await Startup.deleteOne({ _id: startup._id });

    // Wipe linked module entries
    await Idea.deleteMany({ startupId: startup._id });
    await Research.deleteMany({ startupId: startup._id });
    await Competitor.deleteMany({ startupId: startup._id });
    await BusinessModel.deleteMany({ startupId: startup._id });
    await MVPPlan.deleteMany({ startupId: startup._id });
    await PitchDeck.deleteMany({ startupId: startup._id });
    await Funding.deleteMany({ startupId: startup._id });
    await Risk.deleteMany({ startupId: startup._id });
    await Task.deleteMany({ startupId: startup._id });
    await Chat.deleteMany({ startupId: startup._id });

    await Analytics.create({
      userId: req.user._id,
      action: 'STARTUP_DELETE',
      details: `Deleted startup: ${startup.name}`,
    });

    return res.json({ success: true, message: 'Startup workspace and all associated modules deleted successfully.' });
  } catch (err) {
    console.error('Error deleting startup:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting workspace.' });
  }
});

module.exports = router;
