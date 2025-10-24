import Course from '../model/Courses.js';
export const createCourse = async (req, res) => {
    try {
        const { courseId, courseName, courseContents, category, difficulty, duration } = req.body;
        const existingCourse = await Course.findOne({ courseId });
        if (existingCourse) {
            return res.status(409).json({ message: 'Course ID already exists' });
        }

        const course = new Course({
            courseId,
            courseName,
            educator: req.user.id,
            courseContents,
            category,
            difficulty,
            duration
        });

        const savedCourse = await course.save();
        res.status(201).json({ 
            message: 'Course created successfully', 
            course: savedCourse 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to create course', 
            error: error.message 
        });
    }
};
export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('educator', 'name email');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
    }
};

export const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('educator', 'name email');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch course', error: error.message });
    }
};

export const getCoursesByEducator = async (req, res) => {
    try {
        const courses = await Course.find({ educator: req.user.id }).populate('educator', 'name email');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
    }
};

export const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.educator.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only update your own courses' });
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('educator', 'name email');

        res.json({ message: 'Course updated successfully', course: updatedCourse });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update course', error: error.message });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (course.educator.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete your own courses' });
        }

        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete course', error: error.message });
    }
};

export const enrollInCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (!course.isPublished) {
            return res.status(403).json({ message: 'Course is not available for enrollment' });
        }
        const isEnrolled = course.enrolledStudents.some(
            studentId => studentId.toString() === req.user.id
        );
        
        if (isEnrolled) {
            return res.status(409).json({ message: 'You are already enrolled in this course' });
        }

        course.enrolledStudents.push(req.user.id);
        await course.save();

        res.json({ 
            message: 'Successfully enrolled in course',
            course: {
                id: course._id,
                courseName: course.courseName,
                educator: course.educator
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to enroll in course', 
            error: error.message 
        });
    }
};

export const getMyEnrolledCourses = async (req, res) => {
    try {
        const courses = await Course.find({ 
            enrolledStudents: req.user.id 
        }).populate('educator', 'name email');
        
        res.json(courses);
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch enrolled courses', 
            error: error.message 
        });
    }
};
