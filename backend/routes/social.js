const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get social feed
router.get('/feed', auth, async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    
    // For now, return mock feed data
    // In a real app, this would fetch posts from friends and community
    const feedPosts = [
      {
        id: 1,
        user: {
          name: 'Sarah Johnson',
          avatar: 'person-circle',
          verified: true,
        },
        content: 'Just completed a 5K run! Feeling amazing and energized 💪',
        type: 'workout',
        stats: { likes: 24, comments: 8, shares: 3 },
        timeAgo: '2 hours ago',
        image: null,
      },
      {
        id: 2,
        user: {
          name: 'Mike Chen',
          avatar: 'person-circle',
          verified: false,
        },
        content: 'New personal best in deadlift today! 225 lbs 🏋️‍♂️',
        type: 'achievement',
        stats: { likes: 45, comments: 12, shares: 6 },
        timeAgo: '4 hours ago',
        image: null,
      },
      {
        id: 3,
        user: {
          name: 'Emma Wilson',
          avatar: 'person-circle',
          verified: true,
        },
        content: 'Healthy meal prep for the week is complete! 🥗',
        type: 'nutrition',
        stats: { likes: 18, comments: 5, shares: 2 },
        timeAgo: '6 hours ago',
        image: null,
      },
    ];

    res.json({
      posts: feedPosts,
      hasMore: false,
      nextPage: null
    });
  } catch (error) {
    console.error('Get social feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post
router.post('/posts', auth, async (req, res) => {
  try {
    const postData = {
      ...req.body,
      user: req.user._id,
      createdAt: new Date()
    };

    // For now, just return success
    // In a real app, this would save to a posts collection
    res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: Date.now(),
        ...postData
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like post
router.post('/posts/:postId/like', auth, async (req, res) => {
  try {
    // For now, just return success
    // In a real app, this would update the post's like count
    res.json({
      message: 'Post liked successfully',
      liked: true
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Comment on post
router.post('/posts/:postId/comments', auth, async (req, res) => {
  try {
    const { comment } = req.body;
    
    if (!comment) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    // For now, just return success
    // In a real app, this would save the comment
    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        id: Date.now(),
        text: comment,
        user: {
          name: req.user.profile.firstName + ' ' + req.user.profile.lastName,
          avatar: 'person-circle'
        },
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Comment on post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get challenges
router.get('/challenges', auth, async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    
    // Mock challenges data
    const challenges = [
      {
        id: 1,
        title: '30-Day Fitness Challenge',
        description: 'Complete 30 minutes of exercise every day',
        participants: 1247,
        daysLeft: 15,
        progress: 65,
        image: 'fitness',
        color: '#FF6B6B',
        category: 'fitness',
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      {
        id: 2,
        title: '10K Steps Daily',
        description: 'Walk 10,000 steps every day this month',
        participants: 892,
        daysLeft: 8,
        progress: 80,
        image: 'walk',
        color: '#4ECDC4',
        category: 'cardio',
        startDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      },
      {
        id: 3,
        title: 'Hydration Hero',
        description: 'Drink 8 glasses of water daily',
        participants: 567,
        daysLeft: 22,
        progress: 45,
        image: 'water',
        color: '#2196F3',
        category: 'health',
        startDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
      },
    ];

    res.json({
      challenges,
      hasMore: false,
      nextPage: null
    });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join challenge
router.post('/challenges/:challengeId/join', auth, async (req, res) => {
  try {
    // For now, just return success
    // In a real app, this would add the user to the challenge
    res.json({
      message: 'Challenge joined successfully',
      joined: true
    });
  } catch (error) {
    console.error('Join challenge error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard
router.get('/leaderboard/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    const { period = 'weekly' } = req.query;
    
    // Mock leaderboard data
    const leaderboard = [
      { id: 1, name: 'Alex Thompson', points: 2847, rank: 1, avatar: 'person-circle' },
      { id: 2, name: 'Sarah Johnson', points: 2634, rank: 2, avatar: 'person-circle' },
      { id: 3, name: 'Mike Chen', points: 2456, rank: 3, avatar: 'person-circle' },
      { id: 4, name: 'Emma Wilson', points: 2234, rank: 4, avatar: 'person-circle' },
      { id: 5, name: req.user.profile.firstName + ' ' + req.user.profile.lastName, points: 2156, rank: 5, avatar: 'person-circle', isCurrentUser: true },
    ];

    res.json({
      type,
      period,
      leaderboard,
      totalParticipants: 1247
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share achievement
router.post('/achievements', auth, async (req, res) => {
  try {
    const { type, description, value, unit } = req.body;
    
    if (!type || !description) {
      return res.status(400).json({ message: 'Achievement type and description are required' });
    }

    // Add achievement to user's profile
    const user = await User.findById(req.user._id);
    user.social.achievements.push({
      type,
      description,
      value,
      unit,
      earnedAt: new Date()
    });
    await user.save();

    res.status(201).json({
      message: 'Achievement shared successfully',
      achievement: {
        type,
        description,
        value,
        unit,
        earnedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Share achievement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
