import mongoose from 'mongoose';

const studentProgressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedLessons: [{
    lessonId: {
      type: String,
      required: true
    },
    lessonTitle: String,
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: {
      type: Number,
      default: 0 // in minutes
    }
  }],
  quizResults: [{
    quizId: String,
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    totalQuestions: Number,
    correctAnswers: Number,
    completedAt: {
      type: Date,
      default: Date.now
    },
    feedback: String
  }],
  videoProgress: [{
    videoId: String,
    videoTitle: String,
    watchTime: {
      type: Number,
      default: 0 // in seconds
    },
    totalDuration: Number,
    lastWatchedAt: {
      type: Date,
      default: Date.now
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  }],
  lastActivity: {
    type: Date,
    default: Date.now
  },
  courseCompleted: {
    type: Boolean,
    default: false
  },
  completionDate: Date,
  totalTimeSpent: {
    type: Number,
    default: 0 // in minutes
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
studentProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// Method to calculate overall progress
studentProgressSchema.methods.calculateProgress = function() {
  const totalLessons = this.completedLessons.length;
  const totalVideos = this.videoProgress.length;
  const completedVideos = this.videoProgress.filter(v => v.isCompleted).length;
  
  // Calculate progress based on lessons and videos
  let progress = 0;
  if (totalLessons > 0 || totalVideos > 0) {
    const lessonProgress = totalLessons > 0 ? (totalLessons / Math.max(totalLessons, totalVideos)) * 50 : 0;
    const videoProgress = totalVideos > 0 ? (completedVideos / totalVideos) * 50 : 0;
    progress = Math.round(lessonProgress + videoProgress);
  }
  
  // Cap at 100%
  this.progress = Math.min(progress, 100);
  return this.progress;
};

// Method to update last activity
studentProgressSchema.methods.updateLastActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Method to add quiz result
studentProgressSchema.methods.addQuizResult = function(quizData) {
  this.quizResults.push({
    quizId: quizData.quizId || Date.now().toString(),
    score: quizData.score,
    totalQuestions: quizData.totalQuestions,
    correctAnswers: quizData.correctAnswers,
    feedback: quizData.feedback
  });
  
  // Update progress based on quiz performance
  const quizProgress = Math.min(quizData.score, 20); // Max 20% from quizzes
  this.progress = Math.max(this.progress, quizProgress);
  
  return this.save();
};

// Method to update video progress
studentProgressSchema.methods.updateVideoProgress = function(videoData) {
  const existingVideo = this.videoProgress.find(v => v.videoId === videoData.videoId);
  
  if (existingVideo) {
    existingVideo.watchTime = videoData.watchTime;
    existingVideo.lastWatchedAt = new Date();
    existingVideo.isCompleted = videoData.watchTime >= (videoData.totalDuration * 0.8); // 80% watched = completed
  } else {
    this.videoProgress.push({
      videoId: videoData.videoId,
      videoTitle: videoData.videoTitle,
      watchTime: videoData.watchTime,
      totalDuration: videoData.totalDuration,
      isCompleted: videoData.watchTime >= (videoData.totalDuration * 0.8)
    });
  }
  
  this.calculateProgress();
  return this.save();
};

// Method to mark lesson as completed
studentProgressSchema.methods.completeLesson = function(lessonData) {
  const existingLesson = this.completedLessons.find(l => l.lessonId === lessonData.lessonId);
  
  if (!existingLesson) {
    this.completedLessons.push({
      lessonId: lessonData.lessonId,
      lessonTitle: lessonData.lessonTitle,
      timeSpent: lessonData.timeSpent || 0
    });
    
    this.calculateProgress();
  }
  
  return this.save();
};

// Static method to get or create progress for student and course
studentProgressSchema.statics.getOrCreateProgress = async function(studentId, courseId) {
  let progress = await this.findOne({ studentId, courseId });
  
  if (!progress) {
    progress = new this({
      studentId,
      courseId
    });
    await progress.save();
  }
  
  return progress;
};

const StudentProgress = mongoose.model('StudentProgress', studentProgressSchema);

export default StudentProgress;
