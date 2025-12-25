const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { sequelize } = require('../config/database');
function formatDateLocal(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
// GET /api/dashboard/stats - Get today's dashboard statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('[Dashboard] Fetching stats for user:', userId);

        // Get today's completed workout plan days
        const workoutResults = await sequelize.query(`
      SELECT 
        COALESCE(SUM(wpd.total_duration), 0) as activeMinutes,
        COALESCE(SUM(wpd.estimated_calories), 0) as totalCalories,
        COUNT(*) as sessionCount
      FROM workout_plan_days wpd
      INNER JOIN workout_plans wp ON wpd.workout_plan_id = wp.id
      WHERE wp.user_id = :userId 
      AND DATE(wpd.completed_at) = CURDATE()
      AND wpd.is_completed = 1
    `, {
            replacements: { userId },
            type: sequelize.QueryTypes.SELECT
        });

        const workoutResult = workoutResults[0] || { activeMinutes: 0, totalCalories: 0, sessionCount: 0 };
        console.log('[Dashboard] Stats result:', workoutResult);

        // Use actual calories from database or estimate from duration
        const calories = workoutResult.totalCalories > 0
            ? Math.round(workoutResult.totalCalories)
            : Math.round((workoutResult.activeMinutes || 0) * 5);

        // Mock steps data (would come from fitness tracker integration)
        const steps = Math.floor(Math.random() * 3000) + 7000; // 7000-10000

        // Get today's water intake
        const waterResult = await sequelize.query(`
          SELECT COALESCE(SUM(amount), 0) as totalWater
          FROM water_intakes
          WHERE user_id = :userId
          AND DATE(date) = CURDATE()
        `, {
            replacements: { userId },
            type: sequelize.QueryTypes.SELECT
        });

        const currentWater = waterResult[0]?.totalWater || 0;

        res.json({
            success: true,
            stats: {
                steps: steps,
                calories: calories,
                activeMinutes: Math.round(workoutResult.activeMinutes || 0),
                water: parseInt(currentWater), // Real water data
                sleep: 0, // Default value - would come from health tracking
                heartRate: 0 // Default value - would come from health tracking
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/dashboard/weekly-progress - Get weekly progress data
router.get('/weekly-progress', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('[Dashboard] Fetching weekly progress for user:', userId);

        // Get last 7 days of completed workout plan days (including today)
        const weeklyWorkouts = await sequelize.query(`
      SELECT 
        DATE(wpd.completed_at) as date,
        COALESCE(SUM(wpd.total_duration), 0) as totalMinutes,
        COALESCE(SUM(wpd.estimated_calories), 0) as totalCalories,
        COUNT(*) as sessionCount
      FROM workout_plan_days wpd
      INNER JOIN workout_plans wp ON wpd.workout_plan_id = wp.id
      WHERE wp.user_id = :userId 
      AND DATE(wpd.completed_at) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      AND DATE(wpd.completed_at) <= CURDATE()
      AND wpd.is_completed = 1
      GROUP BY DATE(wpd.completed_at)
      ORDER BY date ASC
    `, {
            replacements: { userId },
            type: sequelize.QueryTypes.SELECT
        });

        console.log('[Dashboard] Weekly workouts query result:', weeklyWorkouts);

        // Create array for last 7 days (including today)
        const last7Days = [];
        const minutesMap = {};
        const caloriesMap = {};

        // Use JavaScript Date object for current date (server timezone)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        console.log('[Dashboard] Today date:', formatDateLocal(today));

        // Generate last 7 days including today (i=6 is 6 days ago, i=0 is today)
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = formatDateLocal(d);

            last7Days.push(dateStr);
            minutesMap[dateStr] = 0;
            caloriesMap[dateStr] = 0;
        }

        console.log('[Dashboard] Date range:', last7Days);

        // Fill in actual data
        if (weeklyWorkouts && Array.isArray(weeklyWorkouts) && weeklyWorkouts.length > 0) {
            weeklyWorkouts.forEach(row => {
                const rowDate = new Date(row.date);
                const dateStr = formatDateLocal(rowDate);

                console.log('[Dashboard] Processing row:', {
                    rawDate: row.date,
                    parsedDate: dateStr,
                    minutes: row.totalMinutes,
                    calories: row.totalCalories
                });

                if (minutesMap.hasOwnProperty(dateStr)) {
                    minutesMap[dateStr] = Math.round(parseFloat(row.totalMinutes) || 0);
                    caloriesMap[dateStr] = Math.round(parseFloat(row.totalCalories) || 0);
                }
            });
        }

        const activeMinutes = last7Days.map(date => minutesMap[date]);

        // Use actual calories or estimate from active minutes
        const calories = last7Days.map(date => {
            const actualCalories = caloriesMap[date];
            return actualCalories > 0 ? actualCalories : Math.round(minutesMap[date] * 5);
        });

        const steps = activeMinutes.map(min => {
            const baseSteps = 5000;
            const activitySteps = min * 100; // 100 steps per minute
            return Math.min(baseSteps + activitySteps, 15000);
        });

        const response = {
            success: true,
            weeklyData: {
                steps,
                calories,
                dates: last7Days
            }
        };

        console.log('[Dashboard] Sending weekly response:', JSON.stringify(response));
        res.json(response);
    } catch (error) {
        console.error('[Dashboard] Get weekly progress error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/dashboard/recommendations - Get AI recommendations
router.get('/recommendations', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('[Dashboard] Fetching recommendations for user:', userId);

        // Get AI suggestions from database
        const suggestions = await sequelize.query(`
      SELECT 
        id,
        type,
        title,
        description,
        priority,
        created_at
      FROM ai_suggestions
      WHERE user_id = :userId 
      AND is_read = 0
      ORDER BY 
        CASE priority 
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END,
        created_at DESC
      LIMIT 5
    `, {
            replacements: { userId },
            type: sequelize.QueryTypes.SELECT
        });

        console.log('[Dashboard] AI suggestions result:', suggestions);

        // Map to frontend format with icons and colors
        let recommendations = [];

        if (suggestions && Array.isArray(suggestions)) {
            recommendations = suggestions.map(s => {
                let icon = 'fitness';
                let color = '#FF6B35';

                switch (s.type) {
                    case 'workout':
                        icon = 'fitness';
                        color = '#FF6B35'; // primary
                        break;
                    case 'nutrition':
                        icon = 'restaurant';
                        color = '#28a745'; // success
                        break;
                    case 'rest':
                        icon = 'bed';
                        color = '#ffc107'; // warning
                        break;
                    case 'mindfulness':
                        icon = 'heart';
                        color = '#17a2b8'; // info
                        break;
                    default:
                        icon = 'bulb';
                        color = '#6c757d';
                }

                return {
                    id: s.id,
                    type: s.type,
                    title: s.title,
                    description: s.description,
                    icon,
                    color
                };
            });
        }

        // If no suggestions, provide default ones
        if (recommendations.length === 0) {
            return res.json({
                success: true,
                recommendations: [
                    {
                        id: 1,
                        type: 'workout',
                        title: 'Bắt đầu hành trình fitness',
                        description: 'Hoàn thành buổi tập đầu tiên để nhận gợi ý cá nhân hóa.',
                        icon: 'fitness',
                        color: '#FF6B35'
                    },
                    {
                        id: 2,
                        type: 'nutrition',
                        title: 'Theo dõi bữa ăn',
                        description: 'Ghi lại bữa ăn để nhận insights dinh dưỡng từ AI.',
                        icon: 'restaurant',
                        color: '#28a745'
                    },
                    {
                        id: 3,
                        type: 'rest',
                        title: 'Theo dõi giấc ngủ',
                        description: 'Ghi nhận giấc ngủ để cải thiện hiệu suất tập luyện.',
                        icon: 'bed',
                        color: '#ffc107'
                    }
                ]
            });
        }

        res.json({
            success: true,
            recommendations
        });
    } catch (error) {
        console.error('[Dashboard] Get recommendations error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
