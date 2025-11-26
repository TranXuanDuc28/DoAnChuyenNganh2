-- Migration: Create workout_plan_day_exercises table
-- This table links workout plan days with actual exercises from the exercises table

CREATE TABLE IF NOT EXISTS workout_plan_day_exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workout_plan_day_id INT NOT NULL,
    exercise_id INT NOT NULL,
    order_index INT NOT NULL COMMENT 'Order of exercise in the day',
    sets INT DEFAULT 3,
    reps VARCHAR(50) COMMENT 'e.g., "10-12", "15", "AMRAP"',
    duration INT COMMENT 'Duration in seconds for time-based exercises',
    rest_seconds INT DEFAULT 60 COMMENT 'Rest time between sets in seconds',
    weight VARCHAR(50) COMMENT 'Weight to use, e.g., "bodyweight", "10kg", "moderate"',
    notes TEXT COMMENT 'Additional notes for this exercise',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints with short names (max 64 chars)
    CONSTRAINT wpde_uniq UNIQUE (workout_plan_day_id, exercise_id),
    CONSTRAINT wpde_day_fk FOREIGN KEY (workout_plan_day_id) 
      REFERENCES workout_plan_days(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT wpde_ex_fk FOREIGN KEY (exercise_id) 
      REFERENCES exercises(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes
    INDEX wpde_order (workout_plan_day_id, order_index),
    INDEX wpde_ex_idx (exercise_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

