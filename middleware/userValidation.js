import { body } from "express-validator";

export const validateUser = [
	// username validation
	body("username")
		.notEmpty()
		.withMessage("Le nom d'utilisateur est requis.")
		.isLength({ min: 3 })
		.withMessage("Le nom d'utilisateur doit contenir au moins 3 caractères.")
		.trim()
		.escape(),

	// Email validation
	body("email")
		.notEmpty()
		.withMessage("L'email est requis.")
		.isEmail()
		.withMessage("L'email doit être valide.")
		.normalizeEmail(),

	// Password validation
	body("password")
		.notEmpty()
		.withMessage("Le mot de passe est requis.")
		.isLength({ min: 6 })
		.withMessage("Le mot de passe doit contenir au moins 6 caractères."),
];

/**
 * Chaînes de validation pour les formulaires utilisateur.
 * @example
 * import { validateUser } from '../middleware/validators.js';
 * router.post('/register', validateUser, registerController);
 */
