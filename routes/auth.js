import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/User.js"; // Assurez-vous que ce chemin est correct

import sequelize from "../utils/sequelize.js"; // Assurez-vous que ce chemin est correct
const User = UserModel(sequelize);

const router = express.Router();

// Route pour l'inscription (création d'un nouvel utilisateur)
router.post("/register", async (req, res) => {
//    console.log("Full request body:", req.body);
//     console.log("Content-Type:", req.get('Content-Type'));

    // if (!req.body || typeof req.body !== 'object') {
    //     return res.status(400).json({ error: 'Invalid request body' });
    //   }

	const userName = req.body.userName;
	const password = req.body.password;
	// console.log("Received data:", { userName, password });

    if (!userName || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

	try {
		// Hacher le mot de passe
		const hashedPassword = await bcrypt.hash(password, 9);

		// Créer un nouvel utilisateur
		const newUser = await User.create({
			userName,
			password: hashedPassword,
		});
		res
			.status(201)
			.json({ message: "User created successfully", userId: newUser.id });
	} catch (error) {
		// console.error("Hashing error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Route pour la connexion (authentification)
router.post("/login", async (req, res) => {
	const { username, password } = req.body;

	try {
		// Trouver l'utilisateur par son nom d'utilisateur
		const user = await User.findOne({ where: { username } });

		if (!user) {
			return res.status(401).json({ error: "Invalid username or password" });
		}

		// Vérifier le mot de passe
		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return res.status(401).json({ error: "Invalid username or password" });
		}

		// Générer un token JWT
		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});

		res.json({ token });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to log in" });
	}
});

export default router;
