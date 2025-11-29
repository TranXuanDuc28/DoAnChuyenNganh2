require('dotenv').config();
const { sequelize } = require('../config/database');
const User = require('../models/User');
const { ExerciseCategory, Workout } = require('../models/Workout');

async function checkAdminDb() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');

        // 1. Check Users
        console.log('\n--- Checking Users ---');
        const { count: userCount, rows: users } = await User.findAndCountAll({
            limit: 5,
            attributes: ['id', 'email', 'role', 'firstName']
        });
        console.log(`Total Users Found: ${userCount}`);
        if (users.length > 0) {
            console.log('Sample Users:');
            users.forEach(u => console.log(` - [${u.id}] ${u.email} (${u.role})`));
        } else {
            console.log('No users found.');
        }

        // 2. Check Exercise Categories
        console.log('\n--- Checking Exercise Categories ---');
        const categories = await ExerciseCategory.findAll({
            limit: 5,
            attributes: ['id', 'name', 'slug']
        });
        console.log(`Categories Found (limit 5): ${categories.length}`);
        categories.forEach(c => console.log(` - [${c.id}] ${c.name} (${c.slug})`));

        // 3. Check Workouts
        console.log('\n--- Checking Workouts ---');
        const workoutCount = await Workout.count();
        console.log(`Total Workouts Found: ${workoutCount}`);

        console.log('\n✅ Verification SUCCESS: Admin route logic should work.');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Verification FAILED:', error);
        process.exit(1);
    }
}

checkAdminDb();
