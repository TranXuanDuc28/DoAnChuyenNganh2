-- Create pose_exercises table for managing AI pose recognition exercises
CREATE TABLE IF NOT EXISTS `pose_exercises` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exercise_id` varchar(100) NOT NULL COMMENT 'Unique identifier (e.g., Tree_Pose, push-ups)',
  `name` varchar(255) NOT NULL COMMENT 'Display name',
  `description` text DEFAULT NULL COMMENT 'Exercise description',
  `icon` varchar(50) DEFAULT NULL COMMENT 'Emoji or icon identifier',
  `color` varchar(20) DEFAULT NULL COMMENT 'Primary color hex code',
  `gradient_start` varchar(20) DEFAULT NULL COMMENT 'Gradient start color',
  `gradient_end` varchar(20) DEFAULT NULL COMMENT 'Gradient end color',
  `mode` enum('system','image','video') NOT NULL DEFAULT 'image' COMMENT 'Exercise type: system (start feature), image (yoga poses), video (dynamic exercises)',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Whether exercise is visible in app',
  `display_order` int(11) NOT NULL DEFAULT 0 COMMENT 'Sort order for display',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `exercise_id` (`exercise_id`),
  KEY `idx_active_order` (`is_active`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert existing exercises from the mobile app
INSERT INTO `pose_exercises` (`exercise_id`, `name`, `description`, `icon`, `color`, `gradient_start`, `gradient_end`, `mode`, `is_active`, `display_order`) VALUES
-- System feature
('start-pose', 'Bắt đầu nhận diện', 'Khởi động camera và bắt đầu phân tích tư thế', '🚀', '#17a2b8', '#17a2b8', '#28a745', 'system', 1, 0),

-- Yoga poses (image mode)
('Tree_Pose', 'Tree Pose', 'Tư thế cái cây - cải thiện thăng bằng và sức mạnh chân', '🌳', '#007bff', '#ffc107', '#ff9800', 'image', 1, 1),
('Half_Moon_Pose', 'Half Moon Pose', 'Tư thế bán nguyệt - tăng sức mạnh chân và cải thiện thăng bằng', '🌙', '#007bff', '#ffc107', '#ff9800', 'image', 1, 2),
('Butterfly_Pose', 'Butterfly Pose', 'Tư thế con bướm - mở hông và kéo giãn đùi trong', '🦋', '#007bff', '#ffc107', '#ff9800', 'image', 1, 3),
('Downward_Facing_Dog', 'Downward Facing Dog', 'Tư thế chó úp mặt - kéo giãn và tăng sức mạnh toàn thân', '🐶', '#007bff', '#ffc107', '#ff9800', 'image', 1, 4),
('Dancer_Pose', 'Dancer Pose', 'Tư thế vũ công - tăng sự dẻo dai và tập trung', '💃', '#007bff', '#ffc107', '#ff9800', 'image', 1, 5),
('Triangle_Pose', 'Triangle Pose', 'Tư thế tam giác - kéo giãn hai bên thân và mạnh chân', '🔺', '#007bff', '#ffc107', '#ff9800', 'image', 1, 6),
('Goddess_Pose', 'Goddess Pose', 'Tư thế nữ thần - tăng sức mạnh thân dưới', '👑', '#007bff', '#ffc107', '#ff9800', 'image', 1, 7),
('Warrior_Pose', 'Warrior Pose', 'Tư thế chiến binh - tăng sức mạnh và độ bền', '⚔️', '#007bff', '#ffc107', '#ff9800', 'image', 1, 8),

-- Dynamic exercises (video mode)
('push-ups', 'Push Ups', 'Chống đẩy', '🏋️', '#007bff', '#343a40', '#007bff', 'video', 1, 9),
('squats', 'Squats', 'Ngồi xổm', '🦵', '#007bff', '#343a40', '#007bff', 'video', 1, 10),
('plank', 'Plank', 'Tư thế Tấm ván', '🤸', '#28a745', '#ffc107', '#ff9800', 'video', 1, 11),
('jumping-jack', 'Jumping Jack', 'Nhảy dây', '🤸', '#007bff', '#343a40', '#007bff', 'video', 1, 12);
