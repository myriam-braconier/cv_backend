import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Charge d'abord le .env principal
dotenv.config();

// Puis charge les configurations spécifiques selon l'environnement
dotenv.config({ 
    path: join(__dirname, '..', `.env.${process.env.NODE_ENV}`),
    override: true
});

// Vous pouvez ajouter des validations ou des configurations supplémentaires ici

export default process.env;