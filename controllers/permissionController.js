import db from "../models/index.js";


export const findAll = async (req, res) => {
    try {
        // Paramètres de pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        // Paramètres de tri
        const sortField = req.query.sortField || 'name';
        const sortOrder = req.query.sortOrder || 'ASC';

        // Configuration de la requête
        const queryOptions = {
            include: [{
                model: Role,
                as: 'role',
                through: { attributes: [] },
                attributes: ['id', 'name'],
            }],
            attributes: ['id', 'name', 'description'],
            order: [[sortField, sortOrder]],
            limit,
            offset,
        };

        // Récupération des permissions avec compte total
        const { count, rows: permissions } = await db.Permission.findAndCountAll(queryOptions);

        // Calcul des métadonnées de pagination
        const totalPages = Math.ceil(count / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        if (!permissions || permissions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aucune permission trouvée'
            });
        }

        // Réponse formatée
        return res.status(200).json({
            success: true,
            count,
            data: permissions,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: count,
                itemsPerPage: limit,
                hasNext,
                hasPrev
            }
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des permissions:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des permissions',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};