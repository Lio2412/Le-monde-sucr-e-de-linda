const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  mainImage: {
    type: String,
    required: true
  },
  gallery: [{
    type: String
  }],
  category: {
    type: String,
    required: true,
    enum: ['Gâteaux', 'Macarons', 'Entremets', 'Viennoiseries', 'Autres']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Facile', 'Moyen', 'Difficile']
  },
  preparationTime: {
    type: Number,
    required: true
  },
  cookingTime: {
    type: Number,
    required: true
  },
  servings: {
    type: Number,
    required: true
  },
  ingredients: [{
    name: String,
    quantity: Number,
    unit: String
  }],
  steps: [{
    order: Number,
    description: String,
    image: String
  }],
  tags: [{
    type: String
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  published: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Middleware pour générer le slug avant la sauvegarde
recipeSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Recipe', recipeSchema); 