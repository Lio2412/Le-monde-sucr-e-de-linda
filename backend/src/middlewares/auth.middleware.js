const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

const authMiddleware = {
  // Vérifier si l'utilisateur est authentifié
  protect: async (req, res, next) => {
    try {
      // Vérifier si le token est présent
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
      }

      // Vérifier et décoder le token
      const decoded = jwt.verify(token, config.JWT_SECRET);
      
      // Vérifier si l'utilisateur existe toujours
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé.' });
      }

      // Ajouter l'utilisateur à la requête
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token invalide ou expiré.' });
    }
  },

  // Vérifier si l'utilisateur est admin
  admin: (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Accès refusé. Droits d\'administrateur requis.' });
    }
  },

  // Vérifier si l'utilisateur est éditeur ou admin
  editor: (req, res, next) => {
    if (req.user && (req.user.role === 'editor' || req.user.role === 'admin')) {
      next();
    } else {
      res.status(403).json({ message: 'Accès refusé. Droits d\'éditeur requis.' });
    }
  }
};

module.exports = authMiddleware; 