import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/User.js';

const signToken = (user) => {
	return jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res) => {
	try {
		const { name, email, password, role } = req.body;
		if (!name || !email || !password || !role) {
			return res.status(400).json({ message: 'name, email, password, role are required' });
		}
		const allowedRoles = ['educator', 'student', 'hr', 'admin'];
		if (!allowedRoles.includes(role)) {
			return res.status(400).json({ message: 'Invalid role' });
		}
		const existing = await User.findOne({ email: email.toLowerCase() });
		if (existing) return res.status(409).json({ message: 'Email already registered' });
		const salt = await bcrypt.genSalt(10);
		const hashed = await bcrypt.hash(password, salt);
		const user = await User.create({ name, email: email.toLowerCase(), password: hashed, role });
		const token = signToken(user);
		return res.status(201).json({
			message: 'User registered',
			token,
			user: { id: user._id, name: user.name, email: user.email, role: user.role }
		});
	} catch (error) {
		return res.status(500).json({ message: 'Registration failed', error: error.message });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ message: 'email and password are required' });
		const user = await User.findOne({ email: email.toLowerCase() });
		if (!user) return res.status(401).json({ message: 'Invalid credentials' });
		const match = await bcrypt.compare(password, user.password);
		if (!match) return res.status(401).json({ message: 'Invalid credentials' });
		const token = signToken(user);
		return res.status(200).json({
			message: 'Login successful',
			token,
			user: { id: user._id, name: user.name, email: user.email, role: user.role }
		});
	} catch (error) {
		return res.status(500).json({ message: 'Login failed', error: error.message });
	}
};

export const me = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');
		if (!user) return res.status(404).json({ message: 'User not found' });
		return res.json(user);
	} catch (error) {
		return res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
	}
}; 