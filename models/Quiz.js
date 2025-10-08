const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Вопрос обязателен'],
    trim: true,
    maxlength: [500, 'Вопрос не должен превышать 500 символов']
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length >= 2 && v.length <= 5;
      },
      message: 'Должно быть от 2 до 5 вариантов ответа'
    }
  },
  correctAnswer: {
    type: String,
    required: [true, 'Правильный ответ обязателен'],
    validate: {
      validator: function(v) {
        return this.options.includes(v);
      },
      message: 'Правильный ответ должен быть среди вариантов'
    }
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    required: [true, 'Связь со страной обязательна']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Индексы для быстрого поиска
quizSchema.index({ country: 1, difficulty: 1 });

// Middleware перед сохранением
quizSchema.pre('save', function(next) {
  // Удаляем пробелы в вариантах ответа
  this.options = this.options.map(opt => opt.trim());
  this.correctAnswer = this.correctAnswer.trim();
  next();
});

// Статистика по сложности
quizSchema.statics.getDifficultyStats = async function() {
  return this.aggregate([
    { $group: { _id: '$difficulty', count: { $sum: 1 } } }
  ]);
};

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;