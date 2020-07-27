import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
  googleId: {
    type: String,
    default: ""
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  mascot: {
    type: Number,
    default: 0
  },
  accessTokenVersion: {
    type: Number,
    default: 0
  },
  refreshTokenVersion: {
    type: Number,
    default: 0
  },
  googleLogin: {
    type: Boolean,
    default: false
  },
  allowEmailNotifications: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: new Date()
  },
  updatedAt: {
    type: Date,
    default: new Date()
  },
  lastVisited: {
    type: Date,
    default: new Date()
  },
  sentOneMonthDeleteReminder: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("User", userSchema);
