import { promises as fs } from 'node:fs';
import path from "path";
import { fileURLToPath } from 'url';
import db from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const importJsonData = async () => {
  const files = ["korgSynth.json", "rolandSynth.json", "kawaiSynth.json"];
 
  try {
    console.log('🚀 Début de l\'importation des données');
    let totalImported = 0;

    for (const file of files) {
      const filePath = path.join(__dirname, "../data", file);
      console.log(`📂 Traitement du fichier: ${file}`);
      console.log(`📍 Chemin complet: ${filePath}`);
      
      try {
        await fs.access(filePath);
        console.log(`✅ Fichier trouvé: ${file}`);
      } catch (error) {
        console.error(`❌ Fichier non trouvé: ${file}`);
        continue;
      }

      const data = await fs.readFile(filePath, "utf8");
      console.log(`📄 Données lues depuis ${file}`);
      
      let jsonData = JSON.parse(data);
      console.log(`📊 Nombre d'entrées dans ${file}: ${jsonData.length}`);

      if (!Array.isArray(jsonData)) {
        jsonData = [jsonData];
      }

      try {
        const created = await db.Synthetiser.bulkCreate(jsonData, {
          validate: true
        });
        console.log(`✨ ${created.length} synthétiseurs importés depuis ${file}`);
        totalImported += created.length;
      } catch (error) {
        console.error(`❌ Erreur lors de l'import de ${file}:`, error.message);
      }
    }

    const finalCount = await db.Synthetiser.count();
    console.log(`\n📝 Bilan de l'importation:`);
    console.log(`- Total importé: ${totalImported}`);
    console.log(`- Total en base: ${finalCount}`);

    return {
      success: true,
      totalImported,
      finalCount
    };

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    throw error;
  }
};

// Si le fichier est exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("🎯 Exécution directe du script d'importation");
  importJsonData()
    .then(() => {
      console.log("✅ Importation terminée");
      process.exit(0);
    })
    .catch(error => {
      console.error("❌ Échec de l'importation:", error);
      process.exit(1);
    });
}