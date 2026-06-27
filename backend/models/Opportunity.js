import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide opportunity name'],
      trim: true,
    },
    expectedRevenue: {
      type: Number,
      required: [true, 'Please provide expected revenue'],
      min: [0, 'Revenue cannot be negative'],
    },
    closingDate: {
      type: Date,
      required: [true, 'Please provide closing date'],
    },
    associatedCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    salesExecutive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please assign a sales executive'],
    },
    pipelineStage: {
      type: String,
      enum: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
      default: 'Prospecting',
    },
    probability: {
      type: Number,
      min: 0,
      max: 100,
      default: 10,
    },
    description: {
      type: String,
      trim: true,
    },
    stageHistory: [
      {
        stage: String,
        probability: Number,
        movedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        movedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    products: [
      {
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    competitorInfo: {
      type: String,
      trim: true,
    },
    lostReason: {
      type: String,
      trim: true,
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

// Auto-update probability based on pipeline stage
opportunitySchema.pre('save', function (next) {
  const probabilityMap = {
    'Prospecting': 10,
    'Qualification': 25,
    'Proposal': 50,
    'Negotiation': 75,
    'Closed Won': 100,
    'Closed Lost': 0,
  };

  if (this.isModified('pipelineStage')) {
    this.probability = probabilityMap[this.pipelineStage] || this.probability;
    
    // Track stage history
    if (!this.isNew) {
      this.stageHistory.push({
        stage: this.pipelineStage,
        probability: this.probability,
        movedBy: this.salesExecutive,
        movedAt: new Date(),
      });
    }
  }

  next();
});

// Index for faster queries
opportunitySchema.index({ pipelineStage: 1 });
opportunitySchema.index({ salesExecutive: 1 });
opportunitySchema.index({ closingDate: 1 });

// Virtual for weighted value
opportunitySchema.virtual('weightedValue').get(function () {
  return (this.expectedRevenue * this.probability) / 100;
});

const Opportunity = mongoose.model('Opportunity', opportunitySchema);

export default Opportunity;
