import db from "../models/index.js";


// Fonction pour obtenir tous les roles
export const getAllRoles = async (req, res) => {
    try {
        console.log("Modèles disponibles:", Object.keys(db));
        const roles = await db.Role.findAll();
        console.log("Rôles trouvés:", roles);
        res.json(roles);
    } catch (error) {
        console.error("Erreur complète:", error);
        res.status(500).json({ message: error.message });
    }
};

// Fonction pour créer un nouveau role
export const createRole = async (req, res) => {
    try {
        const newRole = await db.Role.create(req.body);
        res.status(201).json(newRole);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create role' });
    }  finally {
        // Libère explicitement la connexion
        await sequelize.connectionManager.releaseConnection(connection);
    }
};

// Exporter les fonctions avec un export par défaut 
export default { getAllRoles, createRole};