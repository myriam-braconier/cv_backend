import Synthetiser from "../models/Synthetiser.js";
import { importJsonData } from "../utils/importService.js"; // Import de la fonction d'importation

// Fonction pour importer des données JSON dans la base de données
export const importData = async (req, res) => {
    try {
        const result = await importJsonData(); // Appeler la fonction d'importation
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fonction pour obtenir tous les synthétiseurs
export const getAllSynthetisers = async (req, res) => {
    try {
        const synths = await Synthetiser.findAll();
        res.json(synths);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve synthetisers" });
    }
};

// Fonction pour créer un nouveau synthétiseur
export const createSynthetiser = async (req, res) => {
    try {
        const newSynth = await Synthetiser.create(req.body);
        res.status(201).json(newSynth);
    } catch (error) {
        res.status(400).json({ error: "Failed to create synthetiser" });
    }
};


// Exporter les fonctions avec un export par défaut
export default { importData, getAllSynthetisers, createSynthetiser };