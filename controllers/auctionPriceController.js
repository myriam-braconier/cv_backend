import db from "../models/index.js";

export const createAuctionViaSynth = async (req, res) => {
  try {
    const { price, synthetiserId } = req.body;

    // Validation des données d'entrée
    if (!price || !synthetiserId) {
      return res.status(400).json({ 
        message: 'Le prix et l\'ID du synthétiseur sont requis' 
      });
    }

    // Validation du prix
    if (price <= 0) {
      return res.status(400).json({ 
        message: 'Le prix doit être supérieur à 0' 
      });
    }

    // Recherche du synthétiseur
    const synth = await db.Synthetiser.findByPk(synthetiserId);
    if (!synth) {
      return res.status(404).json({ 
        message: `Aucun synthétiseur trouvé avec l'ID: ${synthetiserId}` 
      });
    }

    // Création de l'enchère
    const newAuction = await synth.createAuctionPrice({
      proposal_price: price
    });

    // Retour de la réponse
    return res.status(201).json({
      message: 'Enchère créée avec succès',
      data: newAuction
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'enchère:', error);
    return res.status(500).json({ 
      message: 'Erreur serveur lors de la création de l\'enchère',
      error: error.message 
    });
  }
};


  



