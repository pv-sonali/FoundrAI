const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { User, Startup, Analytics, Subscription } = require('../models');

// Restrict all routes in this file to ADMIN role
router.use(protect, authorize('admin'));

// @route   GET /api/admin/users
// @desc    Retrieve all platform users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return res.json({ success: true, count: users.length, users });
  } catch (err) {
    console.error('Admin users load error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch user list.' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user configuration (credits, subscription plan, role)
router.put('/users/:id', async (req, res) => {
  const { aiCredits, subscription, role } = req.body;

  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (aiCredits !== undefined) user.aiCredits = aiCredits;
    if (subscription !== undefined) user.subscription = subscription;
    if (role !== undefined) user.role = role;

    await user.save();

    // Log admin intervention
    await Analytics.create({
      userId: req.user._id,
      action: 'ADMIN_USER_MOD',
      details: `Modified user ${user.email}: credits=${aiCredits}, plan=${subscription}, role=${role}`,
    });

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        aiCredits: user.aiCredits,
      },
    });
  } catch (err) {
    console.error('Admin update user error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update user configuration.' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get aggregated SaaS metrics and audit logs
router.get('/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalStartups = await Startup.countDocuments({});

    // Count subscriptions
    const freePlanCount = await User.countDocuments({ subscription: 'free' });
    const proPlanCount = await User.countDocuments({ subscription: 'pro' });
    const enterprisePlanCount = await User.countDocuments({ subscription: 'enterprise' });

    // Sum of credits spent
    const totalCreditsSpentResult = await Analytics.aggregate([
      { $group: { _id: null, total: { $sum: '$creditsUsed' } } },
    ]);
    const totalCreditsSpent = totalCreditsSpentResult[0] ? totalCreditsSpentResult[0].total : 0;

    // Load recent activity logs (Audit Logs)
    const auditLogs = await Analytics.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(30);

    // Mock revenue metrics (e.g. Pro users * $29 + Enterprise users * $149)
    const monthlyRecurringRevenue = (proPlanCount * 29) + (enterprisePlanCount * 149);

    // Daily active usages log (simple mock for chart)
    const usageTimeline = [
      { day: 'Mon', credits: 12 },
      { day: 'Tue', credits: 19 },
      { day: 'Wed', credits: 15 },
      { day: 'Thu', credits: Math.floor(Math.random() * 20) + 15 },
      { day: 'Fri', credits: Math.floor(Math.random() * 20) + 20 },
      { day: 'Sat', credits: Math.floor(Math.random() * 10) + 5 },
      { day: 'Sun', credits: Math.floor(Math.random() * 10) + 8 },
    ];

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalStartups,
        totalCreditsSpent,
        monthlyRecurringRevenue,
        plans: {
          free: freePlanCount,
          pro: proPlanCount,
          enterprise: enterprisePlanCount,
        },
        usageTimeline,
      },
      auditLogs,
    });
  } catch (err) {
    console.error('Admin load metrics error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch platform metrics.' });
  }
});

module.exports = router;
