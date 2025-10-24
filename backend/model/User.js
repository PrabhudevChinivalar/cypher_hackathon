import mongoose from 'mongoose';

const allowedRoles = ['educator', 'student', 'hr', 'admin'];

const userSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true },
    courses: {type: Array, default: []},
    // opportunities:
    // profile_detail: 
	email: { type: String, required: true, unique: true, lowercase: true, trim: true },
	password: { type: String, required: true, minlength: 6 },
	role: { type: String, enum: allowedRoles, required: true, default: 'student' }
}, { timestamps: true });

export default mongoose.model('User', userSchema); 