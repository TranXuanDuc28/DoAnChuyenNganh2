const { google } = require('googleapis');
const { Exercise, ExerciseCategory } = require('../models/Workout');

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.auth = null;
  }

  /**
   * Initialize Google Sheets API with service account or API key
   * For simplicity, we'll use API key authentication
   */
  async initialize(apiKey) {
    try {
      this.auth = apiKey;
      this.sheets = google.sheets({ version: 'v4', auth: apiKey });
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Sheets API:', error);
      throw new Error('Failed to initialize Google Sheets API');
    }
  }

  /**
   * Initialize with service account credentials (more secure)
   */
  async initializeWithServiceAccount(credentials) {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });

      this.auth = await auth.getClient();
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      return true;
    } catch (error) {
      console.error('Failed to initialize with service account:', error);
      throw new Error('Failed to initialize with service account');
    }
  }

  /**
   * Read data from Google Sheet
   * @param {string} spreadsheetId - The ID of the spreadsheet
   * @param {string} range - The A1 notation range (e.g., 'Sheet1!A1:Z100')
   */
  async readSheet(spreadsheetId, range = 'Sheet1') {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      return response.data.values || [];
    } catch (error) {
      console.error('Error reading sheet:', error);
      throw new Error(`Failed to read sheet: ${error.message}`);
    }
  }

  /**
   * Parse exercise data from sheet rows
   * Expected columns:
   * Name | Description | Category | Difficulty | CategoryNames | MuscleGroups | Equipment | Sets | Reps | Duration | RestTime | CaloriesPerMinute | Instructions | Tips
   */
  parseExerciseData(rows) {
    if (!rows || rows.length < 2) {
      throw new Error('Sheet must have at least a header row and one data row');
    }

    const headers = rows[0].map(h => h.trim().toLowerCase());
    const exercises = [];

    // Map column names to indices
    const columnMap = {
      name: headers.indexOf('name'),
      description: headers.indexOf('description'),
      category: headers.indexOf('category'),
      difficulty: headers.indexOf('difficulty'),
      categoryNames: headers.indexOf('categorynames') >= 0 ? headers.indexOf('categorynames') : headers.indexOf('muscle groups'),
      muscleGroups: headers.indexOf('musclegroups') >= 0 ? headers.indexOf('musclegroups') : -1,
      equipment: headers.indexOf('equipment'),
      sets: headers.indexOf('sets'),
      reps: headers.indexOf('reps'),
      duration: headers.indexOf('duration'),
      restTime: headers.indexOf('resttime') >= 0 ? headers.indexOf('resttime') : headers.indexOf('rest time'),
      caloriesPerMinute: headers.indexOf('caloriesperminute') >= 0 ? headers.indexOf('caloriesperminute') : headers.indexOf('calories'),
      instructions: headers.indexOf('instructions'),
      tips: headers.indexOf('tips'),
      imageUrl: headers.indexOf('imageurl') >= 0 ? headers.indexOf('imageurl') : headers.indexOf('image'),
      videoUrl: headers.indexOf('videourl') >= 0 ? headers.indexOf('videourl') : headers.indexOf('video'),
    };

    // Process data rows (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      // Skip empty rows
      if (!row || row.length === 0 || !row[columnMap.name]) {
        continue;
      }

      const exercise = {
        name: row[columnMap.name]?.trim() || '',
        description: row[columnMap.description]?.trim() || '',
        category: row[columnMap.category]?.trim().toLowerCase() || 'strength',
        difficulty: row[columnMap.difficulty]?.trim().toLowerCase() || 'beginner',
        categoryNames: this.parseArrayField(row[columnMap.categoryNames]),
        muscleGroups: columnMap.muscleGroups >= 0 ? this.parseArrayField(row[columnMap.muscleGroups]) : [],
        equipment: this.parseArrayField(row[columnMap.equipment]),
        sets: parseInt(row[columnMap.sets]) || 3,
        reps: parseInt(row[columnMap.reps]) || 10,
        duration: parseInt(row[columnMap.duration]) || 0,
        restTime: parseInt(row[columnMap.restTime]) || 60,
        caloriesPerMinute: parseFloat(row[columnMap.caloriesPerMinute]) || 5,
        instructions: this.parseArrayField(row[columnMap.instructions]),
        tips: this.parseArrayField(row[columnMap.tips]),
        imageUrl: row[columnMap.imageUrl]?.trim() || '',
        videoUrl: row[columnMap.videoUrl]?.trim() || '',
      };

      // Validate required fields
      if (!exercise.name) {
        console.warn(`Row ${i + 1}: Skipping exercise without name`);
        continue;
      }

      exercises.push(exercise);
    }

    return exercises;
  }

  /**
   * Parse array fields (comma-separated or newline-separated)
   */
  parseArrayField(value) {
    if (!value) return [];
    
    // Try splitting by newline first, then by comma
    let items = value.includes('\n') 
      ? value.split('\n') 
      : value.split(',');
    
    return items
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  /**
   * Import exercises from Google Sheet to database
   */
  async importExercises(spreadsheetId, range = 'Sheet1', options = {}) {
    try {
      // Read sheet data
      const rows = await this.readSheet(spreadsheetId, range);
      
      if (!rows || rows.length < 2) {
        throw new Error('Sheet is empty or has no data rows');
      }

      // Parse exercises
      const exercisesData = this.parseExerciseData(rows);
      
      if (exercisesData.length === 0) {
        throw new Error('No valid exercises found in sheet');
      }

      // Get all exercise categories for mapping
      const categories = await ExerciseCategory.findAll();
      const categoryMap = new Map();
      categories.forEach(cat => {
        categoryMap.set(cat.name.toLowerCase(), cat.id);
        if (cat.english_name) {
          categoryMap.set(cat.english_name.toLowerCase(), cat.id);
        }
      });

      const results = {
        total: exercisesData.length,
        created: 0,
        updated: 0,
        failed: 0,
        errors: []
      };

      // Import each exercise
      for (const exerciseData of exercisesData) {
        try {
          // Map category names to IDs
          const categoryIds = [];
          if (exerciseData.categoryNames && exerciseData.categoryNames.length > 0) {
            exerciseData.categoryNames.forEach(name => {
              const catId = categoryMap.get(name.toLowerCase());
              if (catId && !categoryIds.includes(catId)) {
                categoryIds.push(catId);
              }
            });
          }

          // Check if exercise already exists
          const existingExercise = await Exercise.findOne({
            where: { name: exerciseData.name }
          });

          if (existingExercise && options.updateExisting) {
            // Update existing exercise
            await existingExercise.update({
              description: exerciseData.description,
              category: exerciseData.category,
              difficulty: exerciseData.difficulty,
              equipment: exerciseData.equipment,
              muscleGroups: exerciseData.muscleGroups,
              sets: exerciseData.sets,
              reps: exerciseData.reps,
              duration: exerciseData.duration,
              restTime: exerciseData.restTime,
              caloriesPerMinute: exerciseData.caloriesPerMinute,
              instructions: exerciseData.instructions,
              tips: exerciseData.tips,
              imageUrl: exerciseData.imageUrl || existingExercise.imageUrl,
              videoUrl: exerciseData.videoUrl || existingExercise.videoUrl,
            });

            // Update categories
            if (categoryIds.length > 0) {
              await existingExercise.setCategories(categoryIds);
            }

            results.updated++;
          } else if (!existingExercise) {
            // Create new exercise
            const newExercise = await Exercise.create({
              name: exerciseData.name,
              description: exerciseData.description,
              category: exerciseData.category,
              difficulty: exerciseData.difficulty,
              equipment: exerciseData.equipment,
              muscleGroups: exerciseData.muscleGroups,
              sets: exerciseData.sets,
              reps: exerciseData.reps,
              duration: exerciseData.duration,
              restTime: exerciseData.restTime,
              caloriesPerMinute: exerciseData.caloriesPerMinute,
              instructions: exerciseData.instructions,
              tips: exerciseData.tips,
              imageUrl: exerciseData.imageUrl,
              videoUrl: exerciseData.videoUrl,
            });

            // Set categories (for many-to-many relationship)
            if (categoryIds.length > 0) {
              await newExercise.setCategories(categoryIds);
            }

            results.created++;
          } else {
            // Skip if exists and updateExisting is false
            results.failed++;
            results.errors.push({
              name: exerciseData.name,
              error: 'Exercise already exists (use updateExisting option to update)'
            });
          }
        } catch (error) {
          console.error(`Error importing exercise "${exerciseData.name}":`, error);
          results.failed++;
          results.errors.push({
            name: exerciseData.name,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error importing exercises:', error);
      throw error;
    }
  }

  /**
   * Extract spreadsheet ID from Google Sheets URL
   */
  static extractSpreadsheetId(url) {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
  }

  /**
   * Validate spreadsheet format
   */
  async validateSpreadsheet(spreadsheetId, range = 'Sheet1') {
    try {
      const rows = await this.readSheet(spreadsheetId, range);
      
      if (!rows || rows.length < 2) {
        return {
          valid: false,
          error: 'Sheet is empty or has no data rows'
        };
      }

      const headers = rows[0].map(h => h.trim().toLowerCase());
      const requiredHeaders = ['name'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

      if (missingHeaders.length > 0) {
        return {
          valid: false,
          error: `Missing required columns: ${missingHeaders.join(', ')}`
        };
      }

      return {
        valid: true,
        rowCount: rows.length - 1,
        headers: rows[0]
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
}

module.exports = new GoogleSheetsService();

