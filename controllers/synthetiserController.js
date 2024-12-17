import { importJsonData } from "../utils/importService.js";
import db from "../models/index.js";
const { Synthetiser } = db;  // Ajout de cette ligne pour extraire le modèle

// Fonction pour importer des données JSON dans la base de données
export const importData = async (req, res) => {
   try {
       const result = await importJsonData();
       res.status(201).json(result);
   } catch (error) {
       console.error('Import error:', error);
       res.status(500).json({ error: error.message });
   }
};

// Fonction pour obtenir tous les synthétiseurs
export const getAllSynthetisers = async (req, res) => {
    try {
        const synths = await db.Synthetiser.findAll();
        // Ajouter les roles à la réponse
        res.json({
            data: synths,
            roles: ['user'], // ou récupérez les vrais rôles de l'utilisateur
            message: "Synthétiseurs récupérés avec succès"
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            error: "Failed to retrieve synthetisers",
            details: error.message 
        });
    }
 };

// Fonction pour créer un nouveau synthétiseur
export const createSynthetiser = async (req, res) => {
   try {
       const newSynth = await db.Synthetiser.create(req.body);
       res.status(201).json(newSynth);
   } catch (error) {
       console.error('Create error:', error);
       res.status(400).json({ 
           error: "Failed to create synthetiser",
           details: error.message 
       });
   }
};