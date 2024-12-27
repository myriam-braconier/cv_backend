import db from "../models/index.js";
const { AuctionPrice } = db;



export const getLatestAuctionBySynthId = async (req, res) => {
 try {
  const synthetiserId = parseInt(req.params.id, 10); // Conversion en nombre

  if (!synthetiserId || isNaN(synthetiserId)) {
    return res.status(400).json({ 
      message: "ID du synthétiseur invalide" 
    });
  }

   const latestAuction = await AuctionPrice.findOne({
     where: { 
       synthetiserId: synthetiserId,
       status: 'active'
     },
     order: [
       ['proposal_price', 'DESC'],
       ['createdAt', 'DESC']
     ],
   });

   if (!latestAuction) {
     return res.status(404).json({ 
       message: "Aucune enchère trouvée pour ce synthétiseur" 
     });
   }

   res.json(latestAuction);

 } catch (error) {
   console.error('Erreur lors de la récupération de l\'enchère:', error);
   res.status(500).json({ 
     message: "Erreur serveur lors de la récupération de l'enchère" 
   });
 }
};

// controllers/auctionController.js
export const createAuction = async (req, res) => {
  try {
    const { proposal_price, userId, synthetiserId, status } = req.body;

    // Validation des données
    if (!proposal_price || !userId || !synthetiserId) {
      return res.status(400).json({ 
        message: "Prix, userId et synthetiserId sont requis" 
      });
    }

    // Création de l'enchère avec le modèle AuctionPrice
    const newAuction = await db.AuctionPrice.create({
      proposal_price: Number(proposal_price),
      userId: Number(userId),
      synthetiserId: Number(synthetiserId),
      status: status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Vérification que l'enchère a bien été créée
    if (!newAuction) {
      throw new Error("Erreur lors de la création de l'enchère");
    }

    // Retourner la nouvelle enchère créée
    res.status(201).json(newAuction);
  } catch (error) {
    console.error('Erreur création enchère:', error);
    res.status(400).json({ 
      message: "Erreur lors de la création de l'enchère",
      details: error.message 
    });
  }
};




export default { createAuction, getLatestAuctionBySynthId };

  



