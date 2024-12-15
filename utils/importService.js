import { promises as fs } from 'node:fs';// Utiliser les promesses pour la lecture des fichiers
import path from "path";
import Synthetiser from "../models/Synthetiser.js"; // Assurez-vous que le chemin est correct

// Fonction pour importer des données depuis des fichiers JSON dans la base de données
const importJsonData = async () => {
	const files = ["korgSynth.json", "rolandSynth.json", "kawaiSynth.json"];

	try {
		for (const file of files) {
			const filePath = path.join(__dirname, "../data", file); // Chemin complet vers le fichier

			// Lire le contenu du fichier JSON
			const data = await fs.readFile(filePath, "utf8");
			const jsonData = JSON.parse(data); // Analyser le contenu JSON

			// Insérer les données dans la base de données
			await Synthetiser.bulkCreate(jsonData);
		}
		return { message: "Data imported successfully" };
	} catch (error) {
		console.error(error);
		throw new Error("Failed to import data");
	}
};

export { importJsonData };
