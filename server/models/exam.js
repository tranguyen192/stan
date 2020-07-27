import mongoose from "mongoose";
const Schema = mongoose.Schema;
const examSchema = new Schema({
  subject: {
    type: String,
    required: true
  },
  examDate: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date,
    default: new Date(),
    required: true
  },
  totalNumberDays: {
    type: Number,
    required: true
  },
  lastPage: {
    type: Number,
    required: true
  },
  numberPages: {
    type: Number,
    required: true
  },
  timePerPage: {
    type: Number,
    required: true
  },
  timesRepeat: {
    type: Number,
    default: 1,
    required: true
  },
  startPage: {
    type: Number,
    default: 1,
    required: true
  },
  currentPage: {
    type: Number,
    default: 1,
    required: true
  },
  notes: {
    type: String
  },
  studyMaterialLinks: {
    type: [String],
    default: []
  },
  color: {
    type: String,
    required: true
  },
  textColor: {
    type: String,
    default: "#000000"
  },
  completed: {
    type: Boolean,
    default: false
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: new Date()
  },
  updatedAt: {
    type: Date,
    default: new Date()
  }
});

module.exports = mongoose.model("Exam", examSchema);
