import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide lead name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide lead email'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Please provide company name'],
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: ['Website', 'Google Ads', 'LinkedIn', 'Facebook', 'Referral', 'Cold Call', 'Email Campaign', 'Trade Show', 'Partner', 'Other'],
      default: 'Website',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Meeting Scheduled', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'],
      default: 'New',
    },
    estimatedValue: {
      type: Number,
      default: 0,
      min: [0, 'Estimated value cannot be negative'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      trim: true,
    },
    statusHistory: [
      {
        status: String,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ company: 'text', name: 'text' });

// Update status history before save
leadSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedBy: this.assignedTo,
      changedAt: new Date(),
    });
  }
  next();
});

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;
