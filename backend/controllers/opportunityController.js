import Opportunity from '../models/Opportunity.js';

// @desc    Get all opportunities
// @route   GET /api/opportunities
// @access  Private
export const getOpportunities = async (req, res, next) => {
  try {
    let query = {};

    // Filter for sales executives
    if (req.user.role === 'sales_executive') {
      query.salesExecutive = req.user.id;
    }

    // Filter by pipeline stage
    if (req.query.stage) {
      query.pipelineStage = req.query.stage;
    }

    const opportunities = await Opportunity.find(query)
      .populate('salesExecutive', 'name email role')
      .populate('associatedCustomer', 'companyName customerId')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: opportunities.length,
      data: opportunities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single opportunity
// @route   GET /api/opportunities/:id
// @access  Private
export const getOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('salesExecutive', 'name email phone')
      .populate('associatedCustomer', 'companyName customerId industry')
      .populate('createdBy', 'name email')
      .populate('stageHistory.movedBy', 'name');

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found',
      });
    }

    res.status(200).json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new opportunity
// @route   POST /api/opportunities
// @access  Private
export const createOpportunity = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;

    // Auto-assign to current user if not specified
    if (!req.body.salesExecutive && req.user.role === 'sales_executive') {
      req.body.salesExecutive = req.user.id;
    }

    const opportunity = await Opportunity.create(req.body);

    await opportunity.populate('salesExecutive', 'name email');
    await opportunity.populate('associatedCustomer', 'companyName');

    res.status(201).json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update opportunity
// @route   PUT /api/opportunities/:id
// @access  Private
export const updateOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('salesExecutive', 'name email')
      .populate('associatedCustomer', 'companyName');

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found',
      });
    }

    res.status(200).json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update opportunity stage
// @route   PATCH /api/opportunities/:id/stage
// @access  Private
export const updateOpportunityStage = async (req, res, next) => {
  try {
    const { pipelineStage } = req.body;

    const opportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      { pipelineStage },
      { new: true, runValidators: true }
    )
      .populate('salesExecutive', 'name email')
      .populate('associatedCustomer', 'companyName');

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found',
      });
    }

    res.status(200).json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete opportunity
// @route   DELETE /api/opportunities/:id
// @access  Private (Admin, Sales Manager)
export const deleteOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found',
      });
    }

    await opportunity.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Opportunity deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get opportunity statistics
// @route   GET /api/opportunities/stats
// @access  Private
export const getOpportunityStats = async (req, res, next) => {
  try {
    const pipelineStats = await Opportunity.aggregate([
      {
        $group: {
          _id: '$pipelineStage',
          count: { $sum: 1 },
          totalValue: { $sum: '$expectedRevenue' },
          avgProbability: { $avg: '$probability' },
        },
      },
    ]);

    const totalPipeline = await Opportunity.aggregate([
      {
        $match: {
          pipelineStage: { $nin: ['Closed Won', 'Closed Lost'] },
        },
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$expectedRevenue' },
          weightedValue: {
            $sum: {
              $multiply: ['$expectedRevenue', { $divide: ['$probability', 100] }],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        pipelineStats,
        totalPipeline: totalPipeline[0] || { totalValue: 0, weightedValue: 0 },
      },
    });
  } catch (error) {
    next(error);
  }
};
