import { importJsonData } from "../utils/importService.js";
import db from "../models/index.js";

// Fonction pour importer des données JSON dans la base de données
export const importData = async (req, res) => {
   try {
       const result = await importJsonData();
       res.status(201).json(result);
   } catch (error) {
       console.error('Import error:', error);
       res.status(500).json({ error: error.message });
   }
};

// Fonction pour obtenir tous les synthétiseurs
export const getAllSynthetisers = async (req, res) => {
    try {
        // Obtenir tous les synthétiseurs avec leurs posts
        const synths = await db.synthetiser.findAll({
            include: [{
                model: db.post,
                as: 'posts'
            }],
            raw: false,
            nest: true
        });

        // Assurons-nous que les données sont bien structurées
        const formattedSynths = synths.map(synth => {
            const plainSynth = synth.get({ plain: true });
            return {
                ...plainSynth,
                posts: plainSynth.posts || [],
                postCount: plainSynth.posts ? plainSynth.posts.length : 0
            };
        });

        console.log('Synthétiseurs avec nombre de posts:', formattedSynths);
        
        res.json({
            data: formattedSynths,
            roles: ['user'],
            message: "Synthétiseurs récupérés avec succès"
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            error: "Failed to retrieve synthetisers",
            details: error.message 
        });
    }
};

// Fonction pour créer un nouveau synthétiseur
export const createSynthetiser = async (req, res) => {
   try {
       const newSynth = await db.synthetiser.create(req.body);
       res.status(201).json(newSynth);
   } catch (error) {
       console.error('Create error:', error);
       res.status(400).json({ 
           error: "Failed to create synthetiser",
           details: error.message 
       });
   }
};

// Fonction pour mettre à jour les informations principales d'un synthétiseur
export const updateMainSynthetiserInfo = async (req, res) => {
    const { id } = req.params;

    try {
        const existingSynth = await db.synthetiser.findByPk(id);
        
        if (!existingSynth) {
            return res.status(404).json({
                error: "Synthétiseur non trouvé",
                details: `Aucun synthétiseur trouvé avec l'ID ${id}`
            });
        }

        // Extraction uniquement des champs autorisés
        const {
            marque,
            modele,
            specifications,
            image_url
        } = req.body;

        // Création de l'objet de mise à jour
        const updateData = {};
        if (marque !== undefined) updateData.marque = marque;
        if (modele !== undefined) updateData.modele = modele;
        if (specifications !== undefined) updateData.specifications = specifications;
        if (image_url !== undefined) updateData.image_url = image_url;

        // Mise à jour du synthétiseur
        await existingSynth.update(updateData);

        // Récupération du synthétiseur mis à jour
        const updatedSynth = await db.synthetiser.findByPk(id);

        res.json({
            data: updatedSynth,
            message: "Informations principales du synthétiseur mises à jour avec succès"
        });

    } catch (error) {
        console.error('Update error:', error);
        res.status(400).json({
            error: "Échec de la mise à jour du synthétiseur",
            details: error.message
        });
    }
};


// Fonction pour obtenir un synthétiseur spécifique
export const getSynthetiser = async (req, res) => {
    const { id } = req.params;

    try {
        const synthetiser = await db.synthetiser.findByPk(id, {
            include: [{
                model: db.post,
                as: 'posts'
            }]
        });

        if (!synthetiser) {
            return res.status(404).json({
                error: "Synthétiseur non trouvé",
                details: `Aucun synthétiseur trouvé avec l'ID ${id}`
            });
        }

        res.json({
            data: synthetiser,
            message: "Synthétiseur récupéré avec succès"
        });

    } catch (error) {
        console.error('Get synthetiser error:', error);
        res.status(500).json({
            error: "Échec de la récupération du synthétiseur",
            details: error.message
        });
    }
};


// Fonction pour ajouter un post à un synthétiseur
export const addPost = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    try {
        // Vérifier si le synthétiseur existe
        const synthetiser = await db.synthetiser.findByPk(id);
        
        if (!synthetiser) {
            return res.status(404).json({
                error: "Synthétiseur non trouvé",
                details: `Aucun synthétiseur trouvé avec l'ID ${id}`
            });
        }

        // Vérifier si le contenu est fourni
        if (!content) {
            return res.status(400).json({
                error: "Contenu manquant",
                details: "Le contenu du post est requis"
            });
        }

        // Créer le post
        const newPost = await db.post.create({
            content,
            synthetiserId: id
        });

        res.status(201).json({
            data: newPost,
            message: "Post ajouté avec succès"
        });

    } catch (error) {
        console.error('Add post error:', error);
        res.status(400).json({
            error: "Échec de l'ajout du post",
            details: error.message
        });
    }
};





