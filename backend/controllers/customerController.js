import Customer from '../models/Customer.js';

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
export const getCustomers = async (req, res, next) => {
  try {
    let query = {};

    // Filter for sales executives
    if (req.user.role === 'sales_executive') {
      query.assignedExecutive = req.user.id;
    }

    // Filter by status
    if (req.query.status) {
      query.accountStatus = req.query.status;
    }

    // Search
    if (req.query.search) {
      query.$or = [
        { companyName: { $regex: req.query.search, $options: 'i' } },
        { customerId: { $regex: req.query.search, $options: 'i' } },
        { industry: { $regex: req.query.search, $options: 'i' } },
        { location: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(query)
      .populate('assignedExecutive', 'name email role')
      .populate('interactions.by', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
export const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedExecutive', 'name email phone')
      .populate('interactions.by', 'name email')
      .populate('createdBy', 'name email');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
export const createCustomer = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;

    // Auto-assign to current user if sales exec and not specified
    if (!req.body.assignedExecutive && req.user.role === 'sales_executive') {
      req.body.assignedExecutive = req.user.id;
    }

    const customer = await Customer.create(req.body);

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('assignedExecutive', 'name email');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer status
// @route   PATCH /api/customers/:id/status
// @access  Private
export const updateCustomerStatus = async (req, res, next) => {
  try {
    const { accountStatus } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { accountStatus },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add interaction to customer
// @route   POST /api/customers/:id/interactions
// @access  Private
export const addInteraction = async (req, res, next) => {
  try {
    const { type, description } = req.body;

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    customer.interactions.push({
      type,
      description,
      by: req.user.id,
      date: new Date(),
    });

    await customer.save();

    await customer.populate('interactions.by', 'name email');

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin, Sales Manager)
export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    await customer.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer statistics
// @route   GET /api/customers/stats
// @access  Private
export const getCustomerStats = async (req, res, next) => {
  try {
    const stats = await Customer.aggregate([
      {
        $group: {
          _id: '$accountStatus',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$revenue' },
        },
      },
    ]);

    const industryStats = await Customer.aggregate([
      {
        $group: {
          _id: '$industry',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$revenue' },
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusStats: stats,
        industryStats: industryStats,
      },
    });
  } catch (error) {
    next(error);
  }
};
