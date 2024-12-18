// scripts/createFirstAdmin.js
import db from "../models/index.js";
import bcrypt from "bcrypt";

const createFirstAdmin = async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Connexion à la base de données établie');

        // Création du rôle admin s'il n'existe pas
        const [adminRole] = await db.role.findOrCreate({
            where: { name: "admin" },
            defaults: {
                description: "Administrateur du système"
            }
        });

        // Création de l'utilisateur admin
        const hashedPassword = await bcrypt.hash("012345678", 10);
        const admin = await db.user.create({
            username: "mymy",
            email: "online@indexof.fr",
            password: hashedPassword,
            isActive: true
        });

        // Association du rôle admin
        await admin.addRole(adminRole);

        console.log('Administrateur créé avec succès');
        return admin;

    } catch (error) {
        console.error('Erreur:', error.message);
        throw error;
    }
};

// Exécution du script
(async () => {
    try {
        const admin = await createFirstAdmin();
        console.log('Création réussie:', admin.username);
    } catch (error) {
        console.error('Échec de la création:', error.message);
    } finally {
        await db.sequelize.close();
        process.exit(0);
    }
})();

export { createFirstAdmin };
