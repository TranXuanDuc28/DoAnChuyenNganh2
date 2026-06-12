const express = require('express');
const { auth } = require('../middleware/auth');
const { createUploadMiddleware } = require('../utils/cloudinary');
const { 
  validate, 
  createCommentSchema, 
  shareAchievementSchema 
} = require('../middleware/validator');
const socialController = require('../controllers/socialController');
const router = express.Router();

const upload = createUploadMiddleware({ maxSize: 10 * 1024 * 1024 });

// Get social feed
router.get('/feed', auth, socialController.getFeed);

// Create post
router.post('/posts', auth, upload.single('image'), socialController.createPost);

// Like post
router.post('/posts/:postId/like', auth, socialController.likePost);

// Comment on post
router.post('/posts/:postId/comments', auth, validate(createCommentSchema), socialController.commentPost);

// Get challenges
router.get('/challenges', auth, socialController.getChallenges);

// Join challenge
router.post('/challenges/:challengeId/join', auth, socialController.joinChallenge);

// Get leaderboard
router.get('/leaderboard/:type', auth, socialController.getLeaderboard);

// Share achievement
router.post('/achievements', auth, validate(shareAchievementSchema), socialController.shareAchievement);

module.exports = router;
