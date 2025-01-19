import db from "../models/index.js";


// Fonction pour obtenir tous les utilisateurs avec leurs posts
export const getAllUsers = async (req, res) => {
    try {
        console.log("Début de la récupération des utilisateurs avec leurs posts");

        const users = await db.User.findAll({
            include: [
                {
                    model: db.Post,
                    as: "posts",
                    required: false, // LEFT JOIN
                    include: [{
                        model: db.User,
                        as: "author",
                        attributes: ['id', 'username']
                    }]
                },
                {
                    model: db.Profile,
                    as: "profile",
                    required: false
                }
            ],
            nest: true, // Pour avoir des objets imbriqués propres
        });

        // Log pour debug
        console.log("Utilisateurs trouvés:", {
            total: users.length,
            sampleUser: users[0] ? {
                id: users[0].id,
                postsCount: users[0].posts?.length,
                hasProfile: !!users[0].profile
            } : null
        });

        const formattedUsers = users.map(user => {
            const plainUser = user.get({ plain: true });
            return {
                ...plainUser,
                posts: plainUser.posts || [], // Assure que posts est toujours un tableau
                profile: plainUser.profile || null // Assure que profile est null si non existant
            };
        });

        console.log("Réponse formatée :", {
            totalUsers: formattedUsers.length,
            usersWithPosts: formattedUsers.filter(u => u.posts.length > 0).length
        });

        return res.status(200).json(formattedUsers);

    } catch (error) {
        console.error("Erreur détaillée:", {
            message: error.message,
            stack: error.stack
        });
        return res.status(500).json({
            error: "Erreur lors de la récupération des utilisateurs",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

// Fonction pour créer un nouvel utilisateur
export const createUser = async (req, res) => {
    try {
        const newUser = await db.User.create(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create user' });
    } 
};

export const getUsersWithPosts = async (req, res) => {
    try {
        console.log("Début de la requête getUsersWithPosts");
        
        const users = await db.User.findAll({
            include: [
                {
                    model: db.Post,
                    as: "posts",
                    required: false
                },
                {
                    model: db.Profile,
                    as: "profile",
                    required: false
                },
                {
                    model: db.Role,  // Ajout de l'inclusion du rôle
                    as: "role",
                    required: false,
                    attributes: ['id', 'name'] // On ne récupère que les champs nécessaires
                }
            ],
            nest: true
        });

        // Log pour debug
        console.log("Premier utilisateur avec rôle:", JSON.stringify(users[0], null, 2));

        // Formatage des données pour s'assurer que role existe toujours
        const formattedUsers = users.map(user => {
            const plainUser = user.get({ plain: true });
            return {
                ...plainUser,
                role: plainUser.role || { name: 'User' }, // Valeur par défaut si pas de rôle
                posts: plainUser.posts || [],
                profile: plainUser.profile || null
            };
        });

        return res.status(200).json(formattedUsers);

    } catch (error) {
        console.error("Erreur détaillée:", {
            message: error.message,
            stack: error.stack
        });
        return res.status(500).json({
            error: "Erreur lors de la récupération des utilisateurs",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};
