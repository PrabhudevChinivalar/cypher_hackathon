export const isEducator = (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({ 
				message: 'Authentication required',
				error: 'No user found in request'
			});
		}

		if (req.user.role !== 'educator') {
			return res.status(403).json({ 
				message: 'Only educators can upload courses',
				error: 'Insufficient permissions',
				requiredRole: 'educator',
				currentRole: req.user.role,
				userId: req.user.id
			});
		}

		console.log(`Educator ${req.user.id} is uploading a course`);
		next();
	} catch (error) {
		return res.status(500).json({ 
			message: 'Error checking educator permissions',
			error: error.message 
		});
	}
};

export const isCourseOwner = async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({ 
				message: 'Authentication required' 
			});
		}

		if (req.user.role !== 'educator') {
			return res.status(403).json({ 
				message: 'Only educators can manage courses' 
			});
		}
		const courseId = req.params.id;
		if (!courseId) {
			return res.status(400).json({ 
				message: 'Course ID is required' 
			});
		}
		const Course = (await import('../model/Courses.js')).default;
		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({ 
				message: 'Course not found' 
			});
		}
		if (course.educator.toString() !== req.user.id) {
			return res.status(403).json({ 
				message: 'You can only manage your own courses',
				error: 'Course ownership mismatch',
				courseId: courseId,
				courseOwner: course.educator.toString(),
				currentUser: req.user.id
			});
		}
		req.course = course;
		next();
	} catch (error) {
		return res.status(500).json({ 
			message: 'Error checking course ownership',
			error: error.message 
		});
	}
};
