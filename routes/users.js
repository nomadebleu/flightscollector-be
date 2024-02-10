var express = require('express');
var router = express.Router();
const User = require('../models/users'); 
const bcrypt = require('bcrypt'); // Pour le hachage des mots de passe
const Badge = require('../models/badges')
const Flight = require('../models/flights')

/* GET home page. */
router.get('/', function(req, res) {
  res.json({result:true});
});

//Route GET pour récupérer toute les infos de l'utilisateur : 
router.get('/userInfos/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Utilisez la méthode findOne de Mongoose pour trouver l'utilisateur par ID
    const user = await User.findById(userId)
      .populate('badges') //.Populate()-permet de charger les documents référencés dans un champ de référence MongoDB.
      .populate('flights')
      .populate('planes');

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Répondez avec les informations de l'utilisateur récupérées
    res.json({ user });
  } catch (error) {
    // En cas d'erreur, renvoyez une réponse d'erreur avec le code d'erreur approprié
    console.error('Erreur lors de la récupération des informations de l\'utilisateur :', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des informations de l\'utilisateur' });
  }
});



//PUT /password :Changer le password
router.put('/password', async (req, res) => {
  try {
    // Récupérer les données du corps de la requête
    const { mail, newPassword } = req.body;

    // Recherchez l'utilisateur dans la base de données
    const data = await User.findOne({ mail });

    // Vérifiez si l'utilisateur existe
    if (!data) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Hachez le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Mettez à jour le mot de passe de l'utilisateur dans la base de données
    data.password = hashedNewPassword;
    await data.save();

    // Renvoyez une réponse de succès
    res.json({ result:true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    res.status(500).json({ error: "Erreur lors de la mise à jour du mot de passe" });
  }
});


//POST /ajouter un badge à la BADGES de user

router.post('/addBadges', async (req, res) => {
  try {
    // Récupérer les données du corps de la requête
    const { userId, badgeId } = req.body;

    // Rechercher l'utilisateur dans la base de données
    const user = await User.findById(userId);

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Rechercher le badge dans la base de données
    const badge = await Badge.findById(badgeId);

    // Vérifier si le badge existe
    if (!badge) {
      return res.status(404).json({ message: "Badge non trouvé" });
    }

    // Ajouter l'ID du badge à la collection de badges de l'utilisateur
    user.badges.push(badgeId);

    // Sauvegarder les modifications dans la base de données
    await user.save();

    // Renvoyer une réponse de succès
    res.json({ message: "Badge ajouté avec succès à l'utilisateur" });
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    res.status(500).json({ error: "Erreur lors de l'ajout du badge à l'utilisateur" });
  }
});




//Route Put pour mettre à jour le nombre de point de l'utilisateur : 
router.put('/pointsTotal/:userId', async (req, res) => {
  try {
    // Récupérer l'ID de l'utilisateur à partir de la requête
    const { userId } = req.params;

    // Récupérer les nouveaux points à partir du corps de la requête
    const { newTotalPoints } = req.body;

    // Rechercher l'utilisateur dans la base de données
    const user = await User.findById(userId);

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Mettre à jour le nombre total de points de l'utilisateur
    user.pointsTotal = newTotalPoints;
    await user.save();

    // Renvoyer une réponse de succès
    res.json({ message: "Nombre de points de l'utilisateur mis à jour avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la mise à jour du nombre total de points de l'utilisateur" });
  }
});




module.exports = router;
