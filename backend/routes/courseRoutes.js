import express from 'express';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  getCoursesByEducator,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getMyEnrolledCourses
} from '../controllers/courseController.js';
import { authenticate } from '../middleware/auth.js';
import { isEducator, isCourseOwner } from '../middleware/courses.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getAllCourses);
router.get('/:id', getCourseById);

router.get('/educator/my-courses', authenticate, isEducator, getCoursesByEducator);

router.post('/', authenticate, isEducator, upload, createCourse);

router.put('/:id', authenticate, isCourseOwner, upload, updateCourse);

router.delete('/:id', authenticate, isCourseOwner, deleteCourse);

router.get('/student/my-courses', authenticate, getMyEnrolledCourses);
router.post('/:id/enroll', authenticate, enrollInCourse);

export default router;
