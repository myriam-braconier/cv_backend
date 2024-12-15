const express = require('express');
const app = express();
const port = 3000;

// Middleware pour analyser le corps des requêtes JSON
app.use(express.json());

// Importer les routes des synthétiseurs
const synthesizerRoutes = require('./routes/synthesizers');
app.use('/synthesizers', synthesizerRoutes);

const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

const roleRoutes = require('./routes/roles');
app.use('/roles', roleRoutes);

const profileRoutes = require('./routes/profiles');
app.use('/profiles', profileRoutes);

const postRoutes = require('./routes/posts');
app.use('/posts', postRoutes);

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
