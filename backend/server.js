const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const config = require('./src/config/config');

// Routes
const authRoutes = require('./src/routes/auth.routes');

const app = express();

// Connexion à MongoDB
mongoose.connect(config.MONGODB_URI)
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Middlewares
app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Une erreur est survenue',
    error: config.NODE_ENV === 'development' ? err.message : 'Erreur interne du serveur'
  });
});

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
