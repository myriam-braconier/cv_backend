import express from "express";
import { User } from "../models/User.js";
import { Role } from "../models/Role.js";

const router = express.Router();

router.post("/create-admin", async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.create({ username, password });
		const adminRole = await Role.findOne({ where: { name: "admin" } });

		await user.addRole(adminRole);
		res.status(201).json({ message: "Admin created successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to create admin" });
	}
});

router.post("/assign-admin-role", async (req, res) => {
	try {
		const { userId } = req.body;

		// Trouver l'utilisateur
		const user = await User.findByPk(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Trouver le rôle admin
		const adminRole = await Role.findOne({ where: { name: "admin" } });
		if (!adminRole) {
			return res.status(404).json({ error: "Admin role not found" });
		}

		// Vérifier si l'utilisateur a déjà le rôle admin
		const hasAdminRole = await user.hasRole(adminRole);
		if (hasAdminRole) {
			return res.status(400).json({ message: "User already has admin role" });
		}

		// Ajouter le rôle admin à l'utilisateur
		await user.addRole(adminRole);

		res.status(200).json({ message: "Admin role assigned successfully" });
	} catch (error) {
		console.error("Error assigning admin role:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
