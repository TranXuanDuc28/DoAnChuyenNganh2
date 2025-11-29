const { Op } = require('sequelize');
const { Expo } = require('expo-server-sdk');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { WorkoutPlanDayExercise } = require('../models/Workout');

// Create Expo SDK client
const expo = new Expo();

/**
 * Check for inactive users and send workout reminders
 * @returns {Promise<Object>} Results of reminder sending
 */
async function scheduleReminders() {
    try {
        console.log('Running workout reminder check...');

        const inactiveUsers = await findInactiveUsers();
        console.log(`Found ${inactiveUsers.length} inactive users`);

        const results = {
            total: inactiveUsers.length,
            sent: 0,
            failed: 0,
            errors: []
        };

        for (const user of inactiveUsers) {
            try {
                await sendWorkoutReminder(user);
                results.sent++;
            } catch (error) {
                console.error(`Failed to send reminder to user ${user.id}:`, error);
                results.failed++;
                results.errors.push({ userId: user.id, error: error.message });
            }
        }

        console.log(`Reminder check complete: ${results.sent} sent, ${results.failed} failed`);
        return results;
    } catch (error) {
        console.error('Error in scheduleReminders:', error);
        throw error;
    }
}

/**
 * Find users who haven't worked out in a while
 * @returns {Promise<Array>} Array of inactive users with their data
 */
async function findInactiveUsers() {
    try {
        // Get all users with their last workout date
        const users = await User.findAll({
            attributes: ['id', 'firstName', 'lastName', 'pushToken'],
            where: {
                pushToken: { [Op.ne]: null } // Only users with push tokens
            }
        });

        const inactiveUsers = [];

        for (const user of users) {
            // Find last completed exercise
            const lastExercise = await WorkoutPlanDayExercise.findOne({
                where: {
                    isCompleted: true
                },
                include: [{
                    association: 'workoutPlanDay',
                    required: true,
                    include: [{
                        association: 'workoutPlan',
                        required: true,
                        where: { userId: user.id }
                    }]
                }],
                order: [['completedAt', 'DESC']]
            });

            if (!lastExercise || !lastExercise.completedAt) {
                // User has never worked out, skip for now
                continue;
            }

            const daysSinceLastWorkout = Math.floor(
                (new Date() - new Date(lastExercise.completedAt)) / (1000 * 60 * 60 * 24)
            );

            // Send reminder if inactive for 2+ days
            if (daysSinceLastWorkout >= 2) {
                inactiveUsers.push({
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    pushToken: user.pushToken,
                    daysSinceLastWorkout,
                    lastWorkoutDate: lastExercise.completedAt
                });
            }
        }

        return inactiveUsers;
    } catch (error) {
        console.error('Error finding inactive users:', error);
        throw error;
    }
}

/**
 * Send workout reminder to a specific user
 * @param {Object} user - User object with pushToken and days since last workout
 * @returns {Promise<void>}
 */
async function sendWorkoutReminder(user) {
    try {
        const { id, firstName, pushToken, daysSinceLastWorkout } = user;

        // Determine message based on inactivity duration
        let title, body;
        if (daysSinceLastWorkout >= 7) {
            title = "Your fitness goals are waiting! 🎯";
            body = `${firstName}, it's been ${daysSinceLastWorkout} days. Let's get back on track!`;
        } else if (daysSinceLastWorkout >= 5) {
            title = "We miss you! 💪";
            body = `${firstName}, ${daysSinceLastWorkout} days without a workout. Ready to crush it today?`;
        } else {
            title = "Time to workout! 🏋️";
            body = `Hey ${firstName}! Ready for your next workout session?`;
        }

        // Create notification record
        const notification = await Notification.create({
            userId: id,
            type: 'workout_reminder',
            title,
            body,
            data: {
                daysSinceLastWorkout,
                screen: 'Workout'
            },
            sentAt: new Date()
        });

        // Send push notification if user has valid push token
        if (pushToken && Expo.isExpoPushToken(pushToken)) {
            const message = {
                to: pushToken,
                sound: 'default',
                title,
                body,
                data: {
                    type: 'workout_reminder',
                    screen: 'Workout',
                    notificationId: notification.id
                },
                priority: 'high'
            };

            const chunks = expo.chunkPushNotifications([message]);
            const tickets = [];

            for (const chunk of chunks) {
                try {
                    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    tickets.push(...ticketChunk);
                } catch (error) {
                    console.error('Error sending push notification chunk:', error);
                }
            }

            console.log(`Sent reminder to user ${id} (${firstName})`);
        } else {
            console.log(`User ${id} has invalid push token, notification saved to DB only`);
        }
    } catch (error) {
        console.error(`Error sending reminder to user ${user.id}:`, error);
        throw error;
    }
}

/**
 * Manually trigger reminder for a specific user (for testing)
 * @param {number} userId - User ID
 * @returns {Promise<void>}
 */
async function sendManualReminder(userId) {
    const user = await User.findByPk(userId, {
        attributes: ['id', 'firstName', 'lastName', 'pushToken']
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Get last workout
    const lastExercise = await WorkoutPlanDayExercise.findOne({
        where: { isCompleted: true },
        include: [{
            association: 'workoutPlanDay',
            required: true,
            include: [{
                association: 'workoutPlan',
                required: true,
                where: { userId }
            }]
        }],
        order: [['completedAt', 'DESC']]
    });

    const daysSinceLastWorkout = lastExercise
        ? Math.floor((new Date() - new Date(lastExercise.completedAt)) / (1000 * 60 * 60 * 24))
        : 0;

    await sendWorkoutReminder({
        id: user.id,
        firstName: user.firstName,
        pushToken: user.pushToken,
        daysSinceLastWorkout
    });
}

module.exports = {
    scheduleReminders,
    findInactiveUsers,
    sendWorkoutReminder,
    sendManualReminder
};
