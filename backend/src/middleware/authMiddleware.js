const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'supersecret_jwt_key_change_in_production', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.user = user;
        next();
    });
}

function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions.' });
        }
        next();
    };
}

module.exports = {
    authenticateToken,
    authorizeRoles,
};

