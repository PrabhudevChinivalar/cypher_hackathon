import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
	try {
		const authHeader = req.headers.authorization || '';
		const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
		if (!token) return res.status(401).json({ message: 'Unauthorized' });
		
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		
		req.user = { id: payload.id, role: payload.role };
		
		return next();
	} catch (error) {
		return res.status(401).json({ message: 'Invalid or expired token' });
	}
};

export const authorize = (...allowedRoles) => {
	return (req, res, next) => {
		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
		if (!allowedRoles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		return next();
	};
}; 