import Lead from '../models/Lead.js';

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
export const getLeads = async (req, res, next) => {
  try {
    let query = {};

    // Filter by assigned user for sales executives
    if (req.user.role === 'sales_executive') {
      query.assignedTo = req.user.id;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by source
    if (req.query.source) {
      query.source = req.query.source;
    }

    // Search
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { company: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email role')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
export const getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email role phone')
      .populate('createdBy', 'name email');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Check ownership for sales executives
    if (req.user.role === 'sales_executive' && lead.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this lead',
      });
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private (Admin, Sales Manager, Sales Executive)
export const createLead = async (req, res, next) => {
  try {
    // Add user who created the lead
    req.body.createdBy = req.user.id;

    // If no assignedTo specified and user is sales exec, assign to themselves
    if (!req.body.assignedTo && req.user.role === 'sales_executive') {
      req.body.assignedTo = req.user.id;
    }

    const lead = await Lead.create(req.body);

    res.status(201).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
export const updateLead = async (req, res, next) => {
  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Check ownership for sales executives
    if (req.user.role === 'sales_executive' && lead.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lead',
      });
    }

    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead status
// @route   PATCH /api/leads/:id/status
// @access  Private
export const updateLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private (Admin, Sales Manager)
export const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    await lead.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get lead statistics
// @route   GET /api/leads/stats
// @access  Private
export const getLeadStats = async (req, res, next) => {
  try {
    const stats = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$estimatedValue' },
        },
      },
    ]);

    const sourceStats = await Lead.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusStats: stats,
        sourceStats: sourceStats,
      },
    });
  } catch (error) {
    next(error);
  }
};
