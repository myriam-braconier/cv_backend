import express from "express";
import { promises as fs } from "node:fs";
import path from "path";
import { fileURLToPath } from 'url';
import Synthetiser from "../models/Synthetiser.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

// Fonction pour importer des données depuis des fichiers JSON dans le dossier data
router.post("/import", async (req, res) => {
	try {
		const files = ["korgSynth.json", "rolandSynth.json", "kawaiSynth.json"]; // Liste des fichiers à importer

		// Lire et traiter chaque fichier JSON
		for (const file of files) {
			const filePath = path.join(__dirname, "../data", file); // Chemin complet vers le fichier

			// Lire le contenu du fichier JSON
			const data = await fs.readFile(filePath, "utf8");
			const jsonData = JSON.parse(data); // Analyser le contenu JSON

			// Insérer les données dans la base de données
			await Synthetiser.bulkCreate(jsonData);
		}

		res.status(201).json({ message: "Data imported successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to import data" });
	}
});

export default router;
