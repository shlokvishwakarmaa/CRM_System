import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide ticket title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide ticket description'],
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Please associate a customer'],
    },
    customerName: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Waiting on Customer', 'Resolved', 'Closed'],
      default: 'Open',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    category: {
      type: String,
      required: [true, 'Please provide ticket category'],
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
    resolution: {
      type: String,
      trim: true,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attachments: [
      {
        filename: String,
        url: String,
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tags: [String],
    sla: {
      responseTime: Number, // in hours
      resolutionTime: Number, // in hours
      breached: {
        type: Boolean,
        default: false,
      },
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

// Auto-set resolvedAt when status changes to Resolved or Closed
ticketSchema.pre('save', function (next) {
  if (this.isModified('status') && (this.status === 'Resolved' || this.status === 'Closed')) {
    if (!this.resolvedAt) {
      this.resolvedAt = new Date();
    }
  }
  next();
});

// Index for faster queries
ticketSchema.index({ status: 1 });
ticketSchema.index({ priority: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ customerId: 1 });
ticketSchema.index({ category: 1 });

// Virtual for resolution time
ticketSchema.virtual('resolutionTime').get(function () {
  if (this.resolvedAt) {
    return Math.floor((this.resolvedAt - this.createdAt) / (1000 * 60 * 60)); // in hours
  }
  return null;
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
