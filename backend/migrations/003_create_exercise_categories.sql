USE fitness_app;

CREATE TABLE IF NOT EXISTS exercise_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    english_name VARCHAR(255),
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(512),
    image_key VARCHAR(255),
    icon VARCHAR(100),
    background_color VARCHAR(32),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE exercises
    ADD COLUMN IF NOT EXISTS exercise_category_id INT NULL AFTER category,
    ADD CONSTRAINT fk_exercises_exercise_category
        FOREIGN KEY (exercise_category_id)
        REFERENCES exercise_categories(id)
        ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_exercises_exercise_category
    ON exercises (exercise_category_id);

