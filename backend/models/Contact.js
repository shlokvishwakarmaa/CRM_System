import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide contact name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    leadSource: {
      type: String,
      trim: true,
    },
    tags: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
contactSchema.index({ name: 'text', company: 'text', email: 'text' });
contactSchema.index({ email: 1 });

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
