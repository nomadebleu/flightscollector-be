require("../models/connection");
var express = require("express");
var router = express.Router();
const Plane = require("../models/planes");
const User = require("../models/users");

//POST pour enregistrer un plane
router.post("/", async (req, res) => {
  try {
    const {
      type,
      picture,
      compagnie,
      immatriculation,
      age,
      description,
      isFavorite,
    } = req.body;

    const newPlane = new Plane({
      type,
      picture,
      compagnie,
      immatriculation,
      age,
      description,
      isFavorite,
    });

    const response = await newPlane.save();
    res.json({ result: "New plane in db" });
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de l'ajout du Plane dans la db" });
  }
});

//Route get pour récupérer tout les planes  OKAY
router.get("/allPlanes/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Recherche de l'utilisateur dans la base de données
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Récupération de tous les avions associés à l'utilisateur
    const planes = await Promise.all(user.planes.map(planeId => Plane.findById(planeId)));

    // Réponse avec les avions trouvés dans le corps de la réponse
    res.json(planes)
  } catch (error) {
    // En cas d'erreur, réponse d'erreur avec le code d'erreur approprié
    console.error("Erreur lors de la récupération des avions :", error);
    res.status(500).json({ error: "Erreur lors de la récupération des avions" });
  }
});


//GET /aircrafts Récuperer les favoris de Planes & les types d'aircrafts OKAY

router.get("/aircrafts/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Récupérer l'utilisateur spécifié avec la référence aux avions
    const userWithAircrafts = await User.findById(userId).populate('planes');

    if (!userWithAircrafts) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Extraire les avions associés à l'utilisateur
    const aircrafts = userWithAircrafts.planes.length;
    const aircraftsFav = userWithAircrafts.planes.filter(plane => plane.isFavorite);
    // Récupérer le nombre d'avions favoris
    const favorisCount = aircraftsFav.length;
    res.json({
      result: true,
      aircrafts: aircrafts,
      aircraftsFav : favorisCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la récupération des avions associés à l'utilisateur" });
  }
});


//Ajoute un avion en favoris:
router.post("/addFavoris/:userId", async (req, res) => {
  const { userId } = req.params;
  const { favorisAvionsIds } = req.body;

  try {
    // Trouver l'utilisateur
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Ajouter les avions favoris à l'utilisateur
    user.isFavorite = favorisAvionsIds;
    await user.save();

    res
      .status(200)
      .json({ message: "Avions favoris ajoutés à l'utilisateur avec succès" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        message: "Erreur lors de l'ajout des avions favoris à l'utilisateur",
      });
  }
});

//Pour récupérer un vol avec le numéro d'Immatriculation' OK
router.get('/:immatriculation', async (req, res) => {
  try {
    const immatriculation = req.params.immatriculation;
    const plane = await Plane
      .findOne({ immatriculation })

    if (!plane) {
      return res.status(404).json({ error: 'Aucun plane trouvé avec cette immatriculation' });
    }
    res.json({ result: true, data: plane });
  } catch (error) {
    console.error('Erreur lors de la récupération du plane:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du plane.' });
  }
});
module.exports = router;
