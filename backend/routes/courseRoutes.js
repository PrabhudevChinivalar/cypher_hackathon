import express from 'express';
import { createCourse, getAllCourses, getCourseById, getCoursesByEducator, updateCourse, deleteCourse, enrollInCourse, getMyEnrolledCourses } from '../controllers/courseController.js';
import { authenticate } from '../middleware/auth.js';
import { isEducator, isCourseOwner } from '../middleware/courses.js';

const router = express.Router();

router.get('/', getAllCourses);
router.get('/:id', getCourseById);

router.post('/', authenticate, isEducator, createCourse);

router.get('/educator/my-courses', authenticate, isEducator, getCoursesByEducator);
router.put('/:id', authenticate, isCourseOwner, updateCourse);
router.delete('/:id', authenticate, isCourseOwner, deleteCourse);

router.post('/:id/enroll', authenticate, enrollInCourse);
router.get('/student/my-courses', authenticate, getMyEnrolledCourses);

export default router;