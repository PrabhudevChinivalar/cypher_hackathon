import mongoose from 'mongoose';

const coursesSchema = new mongoose.Schema({
    courseId: { 
        type: String, 
        required: true, 
        unique: true,
    },
    courseName: { 
        type: String, 
        required: true, 
    },
    educator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseContents: [{
        name: { type: String, required: true },
        description: { type: String },
        image: { type: String, default: null }
    }],
    category: { 
        type: String, 
    },
    difficulty: { 
        type: String, 
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    duration: { 
        type: Number,
        default: 0
    },
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    rating: { 
        type: Number, 
        min: 0, 
        max: 5, 
        default: 0 
    },
}, { timestamps: true });

export default mongoose.model('Course', coursesSchema);