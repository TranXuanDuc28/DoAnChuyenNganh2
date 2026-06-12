const PoseExercise = require('../models/PoseExercise');

exports.getAllExercises = async (req, res) => {
    try {
        const exercises = await PoseExercise.getAllExercises();
        res.json({ success: true, exercises });
    } catch (error) {
        console.error('Get all exercises error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getExerciseById = async (req, res) => {
    try {
        const { id } = req.params;
        const exercise = await PoseExercise.findByPk(id);

        if (!exercise) {
            return res.status(404).json({ success: false, message: 'Exercise not found' });
        }

        res.json({ success: true, exercise });
    } catch (error) {
        console.error('Get exercise error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createExercise = async (req, res) => {
    try {
        const {
            exercise_id,
            name,
            description,
            icon,
            color,
            gradient_start,
            gradient_end,
            mode,
            is_active,
            display_order
        } = req.body;

        if (!exercise_id || !name || !mode) {
            return res.status(400).json({
                success: false,
                message: 'exercise_id, name, and mode are required'
            });
        }

        const existing = await PoseExercise.findOne({ where: { exercise_id } });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Exercise with this ID already exists'
            });
        }

        const exercise = await PoseExercise.create({
            exercise_id,
            name,
            description,
            icon,
            color,
            gradient_start,
            gradient_end,
            mode,
            is_active: is_active !== undefined ? is_active : true,
            display_order: display_order || 0
        });

        res.status(201).json({ success: true, exercise });
    } catch (error) {
        console.error('Create exercise error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            exercise_id,
            name,
            description,
            icon,
            color,
            gradient_start,
            gradient_end,
            mode,
            is_active,
            display_order
        } = req.body;

        const exercise = await PoseExercise.findByPk(id);

        if (!exercise) {
            return res.status(404).json({ success: false, message: 'Exercise not found' });
        }

        if (exercise_id && exercise_id !== exercise.exercise_id) {
            const existing = await PoseExercise.findOne({ where: { exercise_id } });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'Exercise with this ID already exists'
                });
            }
        }

        await exercise.update({
            exercise_id: exercise_id || exercise.exercise_id,
            name: name || exercise.name,
            description: description !== undefined ? description : exercise.description,
            icon: icon !== undefined ? icon : exercise.icon,
            color: color !== undefined ? color : exercise.color,
            gradient_start: gradient_start !== undefined ? gradient_start : exercise.gradient_start,
            gradient_end: gradient_end !== undefined ? gradient_end : exercise.gradient_end,
            mode: mode || exercise.mode,
            is_active: is_active !== undefined ? is_active : exercise.is_active,
            display_order: display_order !== undefined ? display_order : exercise.display_order
        });

        res.json({ success: true, exercise });
    } catch (error) {
        console.error('Update exercise error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const exercise = await PoseExercise.findByPk(id);

        if (!exercise) {
            return res.status(404).json({ success: false, message: 'Exercise not found' });
        }

        await exercise.destroy();
        res.json({ success: true, message: 'Exercise deleted successfully' });
    } catch (error) {
        console.error('Delete exercise error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.reorderExercises = async (req, res) => {
    try {
        const { exercises } = req.body;

        if (!Array.isArray(exercises)) {
            return res.status(400).json({
                success: false,
                message: 'exercises must be an array'
            });
        }

        await Promise.all(
            exercises.map(({ id, display_order }) =>
                PoseExercise.update({ display_order }, { where: { id } })
            )
        );

        res.json({ success: true, message: 'Exercise order updated successfully' });
    } catch (error) {
        console.error('Reorder exercises error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
