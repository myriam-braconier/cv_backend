import app from '../app';

// Vercel handler
export default function handler(req, res) {
    return app(req, res);
}

