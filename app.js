import express from "express";
const app = express();
const port = 4000;

// Importer les routes 
import synthetiserRoutes from "./routes/synthetisers.js";
import userRoutes from "./routes/users.js";
import roleRoutes from "./routes/roles.js";
import profileRoutes from "./routes/profiles.js";
import postRoutes from "./routes/posts.js";
// Middleware pour analyser le corps des requêtes JSON
app.use(express.json());



app.use("/synthetisers", synthetiserRoutes);
app.use("/users", userRoutes);
app.use("/roles", roleRoutes);
app.use("/profiles", profileRoutes);
app.use("/posts", postRoutes);

// Démarrer le serveur
app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
