const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const aiService = require('../services/aiService');
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
  Analytics,
} = require('../models');

// Helper to check and deduct credits
const deductCredit = async (user, actionName, res) => {
  if (user.role === 'admin' || user.subscription === 'pro' || user.subscription === 'enterprise') {
    // Admin & Pro get unlimited operations, but we log usage
    return true;
  }

  if (user.aiCredits <= 0) {
    res.status(403).json({
      success: false,
      message: 'Insufficient AI credits. Please upgrade your plan or request credits from the Admin Panel.',
    });
    return false;
  }

  user.aiCredits -= 1;
  await user.save();
  return true;
};

// @route   POST /api/ai/validate
// @desc    Perform idea validation
router.post('/validate', protect, async (req, res) => {
  const { startupId } = req.body;

  try {
    const startup = await Startup.findOne({ _id: startupId, userId: req.user._id });
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup workspace not found.' });
    }

    const permitted = await deductCredit(req.user, 'IDEA_VALIDATE', res);
    if (!permitted) return;

    const data = await aiService.validateIdea(
      startup.name,
      startup.description,
      startup.industry,
      startup.targetAudience
    );

    // Upsert the Idea document
    const result = await Idea.findOneAndUpdate(
      { startupId: startup._id },
      {
        userId: req.user._id,
        score: data.score,
        marketOpportunity: data.marketOpportunity,
        swot: data.swot,
        risks: data.risks,
        suggestions: data.suggestions,
      },
      { new: true, upsert: true }
    );

    await Analytics.create({
      userId: req.user._id,
      action: 'IDEA_VALIDATE',
      details: `Validated startup idea: ${startup.name}`,
      creditsUsed: 1,
    });

    return res.json({ success: true, idea: result, userCredits: req.user.aiCredits });
  } catch (err) {
    console.error('Idea Validation Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to validate startup idea.' });
  }
});

// @route   POST /api/ai/research
// @desc    Generate market research
router.post('/research', protect, async (req, res) => {
  const { startupId } = req.body;

  try {
    const startup = await Startup.findOne({ _id: startupId, userId: req.user._id });
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup workspace not found.' });
    }

    const permitted = await deductCredit(req.user, 'MARKET_RESEARCH', res);
    if (!permitted) return;

    const data = await aiService.generateMarketResearch(
      startup.name,
      startup.description,
      startup.industry,
      startup.targetAudience
    );

    const result = await Research.findOneAndUpdate(
      { startupId: startup._id },
      {
        userId: req.user._id,
        tam: data.tam,
        sam: data.sam,
        som: data.som,
        explanation: data.explanation,
        trends: data.trends,
        painPoints: data.painPoints,
        growthOpportunities: data.growthOpportunities,
      },
      { new: true, upsert: true }
    );

    await Analytics.create({
      userId: req.user._id,
      action: 'MARKET_RESEARCH',
      details: `Generated market research for: ${startup.name}`,
      creditsUsed: 1,
    });

    return res.json({ success: true, research: result, userCredits: req.user.aiCredits });
  } catch (err) {
    console.error('Market Research Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate market research.' });
  }
});

// @route   POST /api/ai/competitors
// @desc    Generate competitor intelligence
router.post('/competitors', protect, async (req, res) => {
  const { startupId } = req.body;

  try {
    const startup = await Startup.findOne({ _id: startupId, userId: req.user._id });
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup workspace not found.' });
    }

    const permitted = await deductCredit(req.user, 'COMPETITOR_INTELLIGENCE', res);
    if (!permitted) return;

    const data = await aiService.generateCompetitors(
      startup.name,
      startup.description,
      startup.industry,
      startup.targetAudience
    );

    const result = await Competitor.findOneAndUpdate(
      { startupId: startup._id },
      {
        userId: req.user._id,
        competitors: data.competitors,
      },
      { new: true, upsert: true }
    );

    await Analytics.create({
      userId: req.user._id,
      action: 'COMPETITORS_GEN',
      details: `Generated competitors list for: ${startup.name}`,
      creditsUsed: 1,
    });

    return res.json({ success: true, competitor: result, userCredits: req.user.aiCredits });
  } catch (err) {
    console.error('Competitor Intelligence Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate competitors list.' });
  }
});

// @route   POST /api/ai/business-model
// @desc    Generate business model canvas
router.post('/business-model', protect, async (req, res) => {
  const { startupId } = req.body;

  try {
    const startup = await Startup.findOne({ _id: startupId, userId: req.user._id });
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup workspace not found.' });
    }

    const permitted = await deductCredit(req.user, 'BUSINESS_MODEL', res);
    if (!permitted) return;

    const data = await aiService.generateBusinessModel(
      startup.name,
      startup.description,
      startup.industry,
      startup.targetAudience
    );

    const result = await BusinessModel.findOneAndUpdate(
      { startupId: startup._id },
      {
        userId: req.user._id,
        keyPartners: data.keyPartners,
        keyActivities: data.keyActivities,
        keyResources: data.keyResources,
        valuePropositions: data.valuePropositions,
        customerRelationships: data.customerRelationships,
        channels: data.channels,
        customerSegments: data.customerSegments,
        costStructure: data.costStructure,
        revenueStreams: data.revenueStreams,
      },
      { new: true, upsert: true }
    );

    await Analytics.create({
      userId: req.user._id,
      action: 'BUSINESS_MODEL_GEN',
      details: `Generated business canvas for: ${startup.name}`,
      creditsUsed: 1,
    });

    return res.json({ success: true, businessModel: result, userCredits: req.user.aiCredits });
  } catch (err) {
    console.error('Business Model Canvas Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate business model canvas.' });
  }
});

// @route   POST /api/ai/business-model/update
// @desc    Manually update business model canvas boxes (Custom edit)
router.post('/business-model/update', protect, async (req, res) => {
  const { startupId, canvasData } = req.body;

  try {
    const result = await BusinessModel.findOneAndUpdate(
      { startupId, userId: req.user._id },
      { ...canvasData },
      { new: true, upsert: true }
    );
    return res.json({ success: true, businessModel: result });
  } catch (err) {
    console.error('Update Canvas Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to save business model updates.' });
  }
});

// @route   POST /api/ai/mvp-plan
// @desc    Generate MVP plan and Kanban sprint board tasks
router.post('/mvp-plan', protect, async (req, res) => {
  const { startupId } = req.body;

  try {
    const startup = await Startup.findOne({ _id: startupId, userId: req.user._id });
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup workspace not found.' });
    }

    const permitted = await deductCredit(req.user, 'MVP_PLAN', res);
    if (!permitted) return;

    const data = await aiService.generateMVPPlan(
      startup.name,
      startup.description,
      startup.industry,
      startup.targetAudience
    );

    const result = await MVPPlan.findOneAndUpdate(
      { startupId: startup._id },
      {
        userId: req.user._id,
        features: data.features,
        milestones: data.milestones,
        sprintPlan: data.sprintPlan,
      },
      { new: true, upsert: true }
    );

    await Analytics.create({
      userId: req.user._id,
      action: 'MVP_PLAN_GEN',
      details: `Generated MVP plan for: ${startup.name}`,
      creditsUsed: 1,
    });

    return res.json({ success: true, mvpPlan: result, userCredits: req.user.aiCredits });
  } catch (err) {
    console.error('MVP Planner Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate MVP plan.' });
  }
});

// @route   POST /api/ai/mvp-plan/sprint/update
// @desc    Update sprint plan tasks columns (for Kanban updates)
router.post('/mvp-plan/sprint/update', protect, async (req, res) => {
  const { startupId, sprintPlan } = req.body;

  try {
    const result = await MVPPlan.findOneAndUpdate(
      { startupId, userId: req.user._id },
      { sprintPlan },
      { new: true }
    );
    return res.json({ success: true, mvpPlan: result });
  } catch (err) {
    console.error('Update Sprint Task Column Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to save sprint board status.' });
  }
});

// @route   POST /api/ai/pitch-deck
// @desc    Generate Pitch Deck
router.post('/pitch-deck', protect, async (req, res) => {
  const { startupId } = req.body;

  try {
    const startup = await Startup.findOne({ _id: startupId, userId: req.user._id });
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup workspace not found.' });
    }

    const permitted = await deductCredit(req.user, 'PITCH_DECK', res);
    if (!permitted) return;

    const data = await aiService.generatePitchDeck(
      startup.name,
      startup.description,
      startup.industry,
      startup.targetAudience
    );

    const result = await PitchDeck.findOneAndUpdate(
      { startupId: startup._id },
      {
        userId: req.user._id,
        slides: data.slides,
      },
      { new: true, upsert: true }
    );

    await Analytics.create({
      userId: req.user._id,
      action: 'PITCH_DECK_GEN',
      details: `Generated Pitch Deck for: ${startup.name}`,
      creditsUsed: 1,
    });

    return res.json({ success: true, pitchDeck: result, userCredits: req.user.aiCredits });
  } catch (err) {
    console.error('Pitch Deck Generator Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate Pitch Deck.' });
  }
});

// @route   POST /api/ai/funding
// @desc    Generate funding recommendations
router.post('/funding', protect, async (req, res) => {
  const { startupId } = req.body;

  try {
    const startup = await Startup.findOne({ _id: startupId, userId: req.user._id });
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup workspace not found.' });
    }

    const permitted = await deductCredit(req.user, 'FUNDING_FINDER', res);
    if (!permitted) return;

    const data = await aiService.generateFundingHub(
      startup.name,
      startup.description,
      startup.industry,
      startup.targetAudience
    );

    const result = await Funding.findOneAndUpdate(
      { startupId: startup._id },
      {
        userId: req.user._id,
        grants: data.grants,
        incubators: data.incubators,
        angelInvestors: data.angelInvestors,
        vcs: data.vcs,
      },
      { new: true, upsert: true }
    );

    await Analytics.create({
      userId: req.user._id,
      action: 'FUNDING_GEN',
      details: `Generated funding options for: ${startup.name}`,
      creditsUsed: 1,
    });

    return res.json({ success: true, funding: result, userCredits: req.user.aiCredits });
  } catch (err) {
    console.error('Funding Hub Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to search funding opportunities.' });
  }
});

// @route   POST /api/ai/risk-analysis
// @desc    Generate Risk assessment scorecard
router.post('/risk-analysis', protect, async (req, res) => {
  const { startupId } = req.body;

  try {
    const startup = await Startup.findOne({ _id: startupId, userId: req.user._id });
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup workspace not found.' });
    }

    const permitted = await deductCredit(req.user, 'RISK_ANALYSIS', res);
    if (!permitted) return;

    const data = await aiService.generateRiskAnalysis(
      startup.name,
      startup.description,
      startup.industry,
      startup.targetAudience
    );

    const result = await Risk.findOneAndUpdate(
      { startupId: startup._id },
      {
        userId: req.user._id,
        technical: data.technical,
        market: data.market,
        financial: data.financial,
        legal: data.legal,
      },
      { new: true, upsert: true }
    );

    await Analytics.create({
      userId: req.user._id,
      action: 'RISK_ANALYSIS_GEN',
      details: `Generated risk assessment for: ${startup.name}`,
      creditsUsed: 1,
    });

    return res.json({ success: true, risk: result, userCredits: req.user.aiCredits });
  } catch (err) {
    console.error('Risk Analysis Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate risk analysis.' });
  }
});

// @route   GET /api/ai/chats
// @desc    Get user chat mentor titles
router.get('/chats', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, chats });
  } catch (err) {
    console.error('Error fetching chats:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch saved chats.' });
  }
});

// @route   GET /api/ai/chats/:id
// @desc    Get specific chat messages
router.get('/chats/:id', protect, async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat session not found.' });
    return res.json({ success: true, chat });
  } catch (err) {
    console.error('Error fetching chat session:', err);
    return res.status(500).json({ success: false, message: 'Failed to load chat conversation.' });
  }
});

// @route   POST /api/ai/chat
// @desc    Send message to AI Startup Mentor and fetch response
router.post('/chat', protect, async (req, res) => {
  const { startupId, chatId, message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Please provide a message.' });
  }

  try {
    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    }

    let startup = null;
    if (startupId) {
      startup = await Startup.findOne({ _id: startupId, userId: req.user._id });
    }

    if (!chat) {
      chat = await Chat.create({
        userId: req.user._id,
        startupId: startup ? startup._id : null,
        title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
        messages: [],
      });
    }

    // Check credits for chat
    const permitted = await deductCredit(req.user, 'CHAT_MENTOR', res);
    if (!permitted) return;

    // Append user message
    chat.messages.push({ role: 'user', content: message, timestamp: new Date() });

    // Call Mentor Service
    const aiResponse = await aiService.generateMentorResponse(
      chat.messages,
      message,
      startup
    );

    // Append AI response
    chat.messages.push({ role: 'assistant', content: aiResponse, timestamp: new Date() });
    await chat.save();

    await Analytics.create({
      userId: req.user._id,
      action: 'CHAT_MENTOR',
      details: `Chat mentor message session: ${chat.title}`,
      creditsUsed: 1,
    });

    return res.json({ success: true, chat, userCredits: req.user.aiCredits });
  } catch (err) {
    console.error('AI Mentor Chat error:', err);
    return res.status(500).json({ success: false, message: 'AI Mentor failed to respond.' });
  }
});

module.exports = router;
