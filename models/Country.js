const mongoose = require('mongoose');
const { Schema } = mongoose;

const countrySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Название страны обязательно'],
    unique: true,
    trim: true
  },
  capital: {
    type: String,
    required: [true, 'Столица обязательна'],
    trim: true
  },
  continent: {
    type: String,
    required: [true, 'Континент обязателен'],
    enum: ['Африка', 'Антарктида', 'Азия', 'Европа', 'Северная Америка', 'Южная Америка', 'Австралия и Океания'],
    index: true
  },
  currency: {
    type: String,
    required: true,
    trim: true
  },
  language: {
    type: String,
    required: true,
    trim: true
  },
  president: {
    type: String,
    trim: true
  },
  governmentForm: {
    type: String,
    enum: ['Республика', 'Монархия', 'Федерация', 'Другое'],
    required: true
  },
  gdp: {
    type: Number,
    min: 0
  },
  population: {
    type: Number,
    min: 0,
    required: true
  },
  flagImage: {
    type: String,
    default: ''
  },
  photos: [{
    type: String
  }],
  customFields: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  }],
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Country', countrySchema);