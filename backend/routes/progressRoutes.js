import express from 'express';
import mongoose from 'mongoose';
import StudentProgress from '../model/StudentProgress.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get student progress for all enrolled courses
router.get('/my-progress', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const progressData = await StudentProgress.find({ studentId })
      .populate('courseId', 'courseName category difficulty duration educator')
      .sort({ lastActivity: -1 });
    
    res.json({
      success: true,
      progress: progressData
    });
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress data',
      error: error.message
    });
  }
});

// Get progress for a specific course
router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;
    
    const progress = await StudentProgress.getOrCreateProgress(studentId, courseId);
    
    res.json({
      success: true,
      progress: progress
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course progress',
      error: error.message
    });
  }
});

// Update quiz progress
router.post('/quiz-result', authenticate, async (req, res) => {
  try {
    const { courseId, quizData } = req.body;
    const studentId = req.user.id;
    
    if (!courseId || !quizData) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and quiz data are required'
      });
    }
    
    const progress = await StudentProgress.getOrCreateProgress(studentId, courseId);
    await progress.addQuizResult(quizData);
    await progress.updateLastActivity();
    
    res.json({
      success: true,
      progress: progress.progress,
      message: 'Quiz result saved successfully'
    });
  } catch (error) {
    console.error('Error saving quiz result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save quiz result',
      error: error.message
    });
  }
});

// Update video progress
router.post('/video-progress', authenticate, async (req, res) => {
  try {
    const { courseId, videoData } = req.body;
    const studentId = req.user.id;
    
    if (!courseId || !videoData) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and video data are required'
      });
    }
    
    const progress = await StudentProgress.getOrCreateProgress(studentId, courseId);
    await progress.updateVideoProgress(videoData);
    await progress.updateLastActivity();
    
    res.json({
      success: true,
      progress: progress.progress,
      message: 'Video progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating video progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update video progress',
      error: error.message
    });
  }
});

// Mark lesson as completed
router.post('/complete-lesson', authenticate, async (req, res) => {
  try {
    const { courseId, lessonData } = req.body;
    const studentId = req.user.id;
    
    if (!courseId || !lessonData) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and lesson data are required'
      });
    }
    
    const progress = await StudentProgress.getOrCreateProgress(studentId, courseId);
    await progress.completeLesson(lessonData);
    await progress.updateLastActivity();
    
    res.json({
      success: true,
      progress: progress.progress,
      message: 'Lesson marked as completed'
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete lesson',
      error: error.message
    });
  }
});

// Update overall course progress
router.put('/update-progress', authenticate, async (req, res) => {
  try {
    const { courseId, progressPercentage } = req.body;
    const studentId = req.user.id;
    
    if (!courseId || progressPercentage === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and progress percentage are required'
      });
    }
    
    const progress = await StudentProgress.getOrCreateProgress(studentId, courseId);
    progress.progress = Math.min(Math.max(progressPercentage, 0), 100);
    
    // Mark course as completed if progress is 100%
    if (progress.progress === 100 && !progress.courseCompleted) {
      progress.courseCompleted = true;
      progress.completionDate = new Date();
    }
    
    await progress.updateLastActivity();
    
    res.json({
      success: true,
      progress: progress.progress,
      courseCompleted: progress.courseCompleted,
      message: 'Progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message
    });
  }
});

// Get progress statistics
router.get('/statistics', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const stats = await StudentProgress.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          completedCourses: { $sum: { $cond: ['$courseCompleted', 1, 0] } },
          averageProgress: { $avg: '$progress' },
          totalTimeSpent: { $sum: '$totalTimeSpent' },
          totalQuizzes: { $sum: { $size: '$quizResults' } },
          averageQuizScore: {
            $avg: {
              $avg: '$quizResults.score'
            }
          }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalCourses: 0,
      completedCourses: 0,
      averageProgress: 0,
      totalTimeSpent: 0,
      totalQuizzes: 0,
      averageQuizScore: 0
    };
    
    res.json({
      success: true,
      statistics: result
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

export default router;
