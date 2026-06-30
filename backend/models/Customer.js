import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['call', 'email', 'meeting', 'note'],
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      unique: true,
      required: true,
    },
    companyName: {
      type: String,
      required: [true, 'Please provide company name'],
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    revenue: {
      type: Number,
      default: 0,
      min: [0, 'Revenue cannot be negative'],
    },
    assignedExecutive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    accountStatus: {
      type: String,
      enum: ['Active', 'Inactive', 'Churned', 'Onboarding'],
      default: 'Onboarding',
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    interactions: [interactionSchema],
    contractStartDate: {
      type: Date,
    },
    contractEndDate: {
      type: Date,
    },
    metadata: {
      type: Map,
      of: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate customerId
customerSchema.pre('save', async function (next) {
  if (!this.customerId) {
    const count = await mongoose.model('Customer').countDocuments();
    this.customerId = `LC-${String(count + 1001).padStart(4, '0')}`;
  }
  next();
});

// Index for faster queries
customerSchema.index({ customerId: 1 });
customerSchema.index({ companyName: 'text' });
customerSchema.index({ accountStatus: 1 });
customerSchema.index({ assignedExecutive: 1 });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
