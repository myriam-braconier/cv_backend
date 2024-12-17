import { importJsonData } from "../utils/importService.js";

async function runImport() {
  try {
    console.log("Démarrage de l'importation...");
    const result = await importJsonData();
    console.log("Résultat de l'importation:", result);
  } catch (error) {
    console.error("Erreur lors de l'importation:", error);
  } finally {
    process.exit();
  }
}

runImport();