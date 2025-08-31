import db from "../models/index.js";

// Permissions utilisateur
export const getUserPermissions = async (req, res) => {
    try {
        if (!req.user) {
            console.log("req.user est undefined");
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }
        if (!req.user.id) {
            console.log("req.user.id est undefined", req.user);
            return res.status(401).json({ message: "ID utilisateur manquant" });
        }

        const userId = req.user.id;
        console.log("Récupération des permissions pour l'utilisateur:", userId);

        const user = await db.User.findByPk(userId, {
            include: [{
                model: db.Role,
                as: "role",
                include: [{
                    model: db.Permission,
                    as: "permissions",
                    through: db.RolePermission
                }]
            }],
        });

        if (!user) {
            console.log("Utilisateur non trouvé");
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Defensive check pour role et permissions
        const permissions = user.role?.permissions?.map(p => ({
            id: p.id,
            name: p.name
        })) || [];

        console.log("Permissions trouvées:", permissions.map(p => p.name));
        return res.json({ permissions });

    } catch (error) {
        console.error("Erreur lors de la récupération des permissions:", error);
        return res.status(500).json({
            message: "Erreur lors de la récupération des permissions",
            error: error.message,
        });
    }
};

// Tous les utilisateurs avec posts
export const getAllUsers = async (req, res) => {
    try {
        console.log("Début de la récupération des utilisateurs avec leurs posts");

        const users = await db.User.findAll({
            include: [
                {
                    model: db.Post,
                    as: "posts",
                    required: false,
                    include: [{ model: db.User, as: "author", attributes: ["id", "username"] }],
                },
                { model: db.Profile, as: "profile", required: false },
            ],
            nest: true,
        });

        console.log("Utilisateurs trouvés:", {
            total: users.length,
            sampleUser: users[0] ? { id: users[0].id, postsCount: users[0].posts?.length, hasProfile: !!users[0].profile } : null,
        });

        const formattedUsers = users.map(user => {
            const plainUser = user.get({ plain: true });
            return {
                ...plainUser,
                posts: plainUser.posts || [],
                profile: plainUser.profile || null,
            };
        });

        console.log("Réponse formatée :", {
            totalUsers: formattedUsers.length,
            usersWithPosts: formattedUsers.filter(u => u.posts.length > 0).length,
        });

        return res.status(200).json(formattedUsers);
    } catch (error) {
        console.error("Erreur détaillée:", {
            message: error.message,
            stack: error.stack,
        });
        return res.status(500).json({
            error: "Erreur lors de la récupération des utilisateurs",
            details: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

// Création nouvel utilisateur
export const createUser = async (req, res) => {
    try {
        const newUser = await db.User.create(req.body);
        return res.status(201).json(newUser);
    } catch (error) {
        console.error("Erreur création utilisateur:", error);
        return res.status(400).json({ error: "Failed to create user" });
    }
};

// Utilisateurs avec posts, profil et rôle
export const getUsersWithPosts = async (req, res) => {
    try {
        console.log("Début de la requête getUsersWithPosts");

        const users = await db.User.findAll({
            include: [
                { model: db.Post, as: "posts", required: false },
                { model: db.Profile, as: "profile", required: false },
                { model: db.Role, as: "role", required: false, attributes: ["id", "name"] },
            ],
            nest: true,
        });

        if (users.length > 0) {
            console.log("Premier utilisateur avec rôle:", JSON.stringify(users[0], null, 2));
        }

        const formattedUsers = users.map(user => {
            const plainUser = user.get({ plain: true });
            return {
                ...plainUser,
                role: plainUser.role || { name: "User" }, // Valeur par défaut
                posts: plainUser.posts || [],
                profile: plainUser.profile || null,
            };
        });

        return res.status(200).json(formattedUsers);
    } catch (error) {
        console.error("Erreur détaillée:", {
            message: error.message,
            stack: error.stack,
        });
        return res.status(500).json({
            error: "Erreur lors de la récupération des utilisateurs",
            details: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
