const { WorkoutPlan, WorkoutPlanDay, WorkoutPlanDayExercise } = require('../models/Workout');
const User = require('../models/User');
const { sequelize } = require('../config/database');

async function clearData() {
  try {
    console.log('🧹 Đang làm sạch dữ liệu Workout Plans...');
    
    // Disable foreign key checks to delete faster
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Delete all records from related tables
    const deletedExercises = await WorkoutPlanDayExercise.destroy({ where: {}, truncate: true });
    const deletedDays = await WorkoutPlanDay.destroy({ where: {}, truncate: true });
    const deletedPlans = await WorkoutPlan.destroy({ where: {}, truncate: true });
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ Đã xóa sạch toàn bộ lịch tập cũ!');
    console.log('🚀 Bây giờ bạn có thể mở App và tạo lại Lịch tập mới từ AI.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi làm sạch dữ liệu:', error);
    process.exit(1);
  }
}

clearData();
