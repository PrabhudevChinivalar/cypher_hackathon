import { Router } from 'express';
import { register, login, me } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/register',register);
router.post('/login', login);
router.get('/me', authenticate, me);

router.get('/admin-only', authenticate, authorize('admin'), (req, res) => {
	res.json({ message: 'Welcome admin' });
});
router.get('/educator-only', authenticate, authorize('educator'), (req, res) => {
	res.json({ message: 'Welcome educator' });
});
router.get('/hr-only', authenticate, authorize('hr'), (req, res) => {
	res.json({ message: 'Welcome HR' });
});
router.get('/student-only', authenticate, authorize('student'), (req, res) => {
	res.json({ message: 'Welcome student' });
});

export default router; 