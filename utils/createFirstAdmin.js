// scripts/createFirstAdmin.js
import db from "../models/index.js";
import bcrypt from "bcrypt";

const createFirstAdmin = async () => {
	try {
		await db.sequelize.authenticate();
		console.log("Connexion à la base de données établie");

		  // Vérifier si le rôle admin existe et récupérer le role admin existant
          const adminRole = await db.role.findOne({
            where: { name: "admin" }
        });
        if (!adminRole) {
            throw new Error("Le rôle admin n'existe pas dans la base de données");
        }
	

 // Vérifier si l'admin existe déjà
 const existingAdmin = await db.user.findOne({
    where: { email: "online@indexof.fr" }
});

if (existingAdmin) {
    console.log("L'administrateur existe déjà");
    return existingAdmin;
}

		// Création de l'utilisateur admin
		const hashedPassword = await bcrypt.hash("012345678", 10);
		const admin = await db.user.create({
			username: "mymy",
			email: "online@indexof.fr",
			password: hashedPassword,
			isActive: true,

            roleId: adminRole.id,// assignation directe du roleId
            first_name: "Admin",
            last_name: "System",
            has_instrument: false,
            age: 0
		});


 // Alternative si l'association directe ne fonctionne pas
 await db.user.update(
    { roleId: adminRole.id },
    { where: { id: admin.id } }
);


		console.log("Administrateur créé avec succès");
		return admin;
	} catch (error) {
        if (error.name === 'SequelizeValidationError') {
            console.error('Erreurs de validation:', error.errors.map(e => e.message));
        }
        throw error;
    }
};

// Exécution du script
(async () => {
	try {
		const admin = await createFirstAdmin();
		console.log("Création réussie:", admin.username);
	} catch (error) {
		console.error("Échec de la création:", error.message);
	} finally {
		await db.sequelize.close();
		process.exit(0);
	}
})();

export { createFirstAdmin };
