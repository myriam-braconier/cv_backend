import app from '../app.js';

// Vercel handler
export default function handler(req, res) {
    return app(req, res);
}

