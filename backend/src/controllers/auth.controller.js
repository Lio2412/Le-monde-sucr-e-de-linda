const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  service: config.EMAIL_SERVICE,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS
  }
});

const authController = {
  // Inscription
  register: async (req, res) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ message: 'Cet email ou nom d\'utilisateur existe déjà' });
      }

      // Créer un nouvel utilisateur
      const user = new User({
        username,
        email,
        password,
        firstName,
        lastName
      });

      await user.save();

      // Générer le token
      const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
        expiresIn: '1d'
      });

      res.status(201).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de l\'inscription', error: error.message });
    }
  },

  // Connexion
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Vérifier si l'utilisateur existe
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      // Vérifier le mot de passe
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      // Générer le token
      const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
        expiresIn: '1d'
      });

      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
    }
  },

  // Réinitialisation du mot de passe - Demande
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: 'Aucun compte associé à cet email' });
      }

      // Générer un token de réinitialisation
      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 heure

      await user.save();

      // Envoyer l'email
      const resetUrl = `${config.CLIENT_URL}/reset-password/${resetToken}`;
      const mailOptions = {
        to: user.email,
        from: config.EMAIL_USER,
        subject: 'Réinitialisation de votre mot de passe - Le Monde Sucré de Linda',
        text: `Vous recevez cet email car vous avez demandé la réinitialisation du mot de passe de votre compte.\n\n
          Veuillez cliquer sur le lien suivant ou le coller dans votre navigateur pour terminer le processus :\n\n
          ${resetUrl}\n\n
          Si vous n'avez pas demandé cela, veuillez ignorer cet email et votre mot de passe restera inchangé.\n`
      };

      await transporter.sendMail(mailOptions);
      res.json({ message: 'Un email de réinitialisation a été envoyé' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la demande de réinitialisation', error: error.message });
    }
  },

  // Réinitialisation du mot de passe - Reset
  resetPassword: async (req, res) => {
    try {
      const { token, password } = req.body;
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Le token de réinitialisation est invalide ou a expiré' });
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      res.json({ message: 'Votre mot de passe a été modifié avec succès' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe', error: error.message });
    }
  },

  // Vérifier le token JWT
  verifyToken: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Token non fourni' });
      }

      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      res.json({ user });
    } catch (error) {
      res.status(401).json({ message: 'Token invalide' });
    }
  }
};

module.exports = authController; 