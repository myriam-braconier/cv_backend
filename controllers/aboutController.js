import db from '../models/index.js';

// Récupérer tous les abouts
export const getAllAbouts = async (req, res) => {
    try {
        const abouts = await db.About.findAll({
            order: [['updatedAt', 'DESC']] // Trie par date de mise à jour décroissante
        });
        
        if (!abouts || abouts.length === 0) {
            return res.status(404).json({
                message: "Aucune information 'about' trouvée"
            });
        }

        res.status(200).json({
            status: 'success',
            data: abouts
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des abouts:', error);
        res.status(500).json({
            message: "Erreur lors de la récupération des informations 'about'",
            error: error.message
        });
    }
};

// Récupérer un about spécifique
export const getAbout = async (req, res) => {
    try {
        const { id } = req.params;
        
        const about = await db.About.findByPk(id);
        
        if (!about) {
            return res.status(404).json({
                message: `Aucune information 'about' trouvée avec l'id: ${id}`
            });
        }

        res.status(200).json({
            status: 'success',
            data: about
        });
    } catch (error) {
        console.error(`Erreur lors de la récupération de l'about ${req.params.id}:`, error);
        res.status(500).json({
            message: "Erreur lors de la récupération de l'information 'about'",
            error: error.message
        });
    }
};