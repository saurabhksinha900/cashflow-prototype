const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      unique: true,
      trim: true,
    },
    accountName: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
      maxlength: [100, 'Account name cannot exceed 100 characters'],
    },
    accountType: {
      type: String,
      enum: ['Checking', 'Savings', 'Business', 'Treasury'],
      required: [true, 'Account type is required'],
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD'],
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
    availableBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Account owner is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    openedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

accountSchema.index({ accountNumber: 1 });
accountSchema.index({ company: 1 });
accountSchema.index({ owner: 1 });

module.exports = mongoose.model('Account', accountSchema);
