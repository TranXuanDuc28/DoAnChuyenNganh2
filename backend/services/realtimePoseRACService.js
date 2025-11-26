const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

/**
 * Service để gọi Python script realtime_frame_inference.py
 * Xử lý frame đơn lẻ từ realtime camera và trả về kết quả pose evaluation
 */
class RealtimePoseRACService {
  constructor() {
    // Đường dẫn đến Python script
    this.pythonScriptPath = path.join(
      __dirname,
      '../../PoseRAC/realtime_frame_inference.py'
    );
    this.modelPath = path.join(
      __dirname,
      '../../PoseRAC/best_weights_PoseRAC.pth'
    );
    this.csvPath = path.join(
      __dirname,
      '../../PoseRAC/all_action.csv'
    );
    
    // Map exercise names từ app sang format của PoseRAC
    this.exerciseMap = {
      'squat': 'squat',
      'squats': 'squat',
      'push-up': 'push_up',
      'push-ups': 'push_up',
      'pull-up': 'pull_up',
      'pull-ups': 'pull_up',
      'front-raise': 'front_raise',
      'bench-pressing': 'bench_pressing',
      'jumping-jack': 'jump_jack',
      'jump-jack': 'jump_jack',
      'situp': 'situp',
      'sit-ups': 'situp',
      'pommelhorse': 'pommelhorse',
    };
  }

  /**
   * Kiểm tra các file cần thiết có tồn tại không
   */
  async validateFiles() {
    const files = [
      { path: this.pythonScriptPath, name: 'Python script' },
      { path: this.modelPath, name: 'Model weights' },
      { path: this.csvPath, name: 'Actions CSV' }
    ];

    const missing = [];
    for (const file of files) {
      try {
        await fs.access(file.path);
      } catch (error) {
        missing.push(file.name);
        console.error(`[RealtimePoseRAC] Missing ${file.name}: ${file.path}`);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Missing required files: ${missing.join(', ')}`);
    }
  }

  /**
   * Xử lý một frame đơn lẻ và trả về kết quả
   * @param {string} imageBase64 - Base64 encoded image (có thể có data URL prefix)
   * @param {string} exerciseName - Exercise name từ app
   * @param {object} options - Các tùy chọn: enter_threshold, exit_threshold
   * @returns {Promise<object>} Kết quả: { success, landmarks, action_scores, best_action, best_score, phase, error }
   */
  async processFrame(imageBase64, exerciseName, options = {}) {
    // Validate files
    try {
      await this.validateFiles();
    } catch (error) {
      console.error(`[RealtimePoseRAC] File validation failed: ${error.message}`);
      throw error;
    }


    // Map exercise name
    const poseRACExerciseName = this.exerciseMap[exerciseName] || 'squat';
    console.log(`[RealtimePoseRAC] Processing frame for exercise: ${exerciseName} -> ${poseRACExerciseName}`);

    // Remove data URL prefix if present
    let cleanBase64 = imageBase64;
    if (imageBase64.includes(',')) {
      cleanBase64 = imageBase64.split(',')[1];
    }

    // Validate base64 length
    if (!cleanBase64 || cleanBase64.length < 100) {
      throw new Error('Invalid or too short base64 image data');
    }

    // Write base64 to a temp file
    const os = require('os');
    const tempDir = os.tmpdir();
    const tempFileName = `pose_frame_${Date.now()}_${Math.random().toString(36).slice(2)}.b64`;
    const tempFilePath = path.join(tempDir, tempFileName);
    await fs.writeFile(tempFilePath, cleanBase64, 'utf8');

    // Prepare arguments for Python script: pass temp file path instead of base64
    const args = [
      this.pythonScriptPath,
      tempFilePath,
      poseRACExerciseName,
      this.modelPath,
      this.csvPath
    ];

    // Tìm Python executable
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    
    console.log(`[RealtimePoseRAC] Starting Python process: ${pythonCmd} ${this.pythonScriptPath} [base64...] ${poseRACExerciseName}`);
    
    return new Promise((resolve, reject) => {
      // Set UTF-8 encoding for Python
      const env = {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
        PYTHONUTF8: '1'
      };
      
      const pythonProcess = spawn(pythonCmd, args, {
        cwd: path.dirname(this.pythonScriptPath),
        stdio: ['ignore', 'pipe', 'pipe'],
        env: env
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString('utf8');
        stdout += output;
        // Log progress if available
        if (output.includes('Processing') || output.includes('Detecting') || output.includes('Error')) {
          console.log(`[RealtimePoseRAC] ${output.trim()}`);
        }
      });

      pythonProcess.stderr.on('data', (data) => {
        const error = data.toString('utf8');
        stderr += error;
        // Log errors immediately
        if (error.trim().length > 0) {
          console.error(`[RealtimePoseRAC] stderr: ${error.trim()}`);
        }
      });

      let timeoutId;
      let resolved = false;

      pythonProcess.on('close', async (code) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutId);

        // Clean up temp file
        try {
          await fs.unlink(tempFilePath);
        } catch (err) {
          console.warn(`[RealtimePoseRAC] Failed to delete temp file: ${tempFilePath}`);
        }

        if (code !== 0) {
          console.error(`[RealtimePoseRAC] Python script exited with code ${code}`);
          console.error(`[RealtimePoseRAC] stderr: ${stderr || '(empty)'}`);
          console.error(`[RealtimePoseRAC] stdout: ${stdout || '(empty)'}`);
          
          // Provide more helpful error messages
          let errorMsg = `Python script failed with code ${code}`;
          if (stderr) {
            errorMsg += `: ${stderr}`;
          } else if (stdout) {
            errorMsg += `. Output: ${stdout}`;
          } else {
            errorMsg += '. No output received. Check if Python script exists and is executable.';
          }
          
          reject(new Error(errorMsg));
          return;
        }

        // Check if we have any output
        if (!stdout || stdout.trim().length === 0) {
          console.error(`[RealtimePoseRAC] Python script completed but produced no output`);
          console.error(`[RealtimePoseRAC] stderr: ${stderr || '(empty)'}`);
          reject(new Error('Python script completed but produced no output. Check script logs.'));
          return;
        }

        try {
          // Parse JSON output
          const result = JSON.parse(stdout.trim());
          console.log(`[RealtimePoseRAC] Successfully processed frame: ${JSON.stringify(result).substring(0, 100)}...`);
          resolve(result);
        } catch (error) {
          console.error(`[RealtimePoseRAC] Failed to parse JSON output: ${error.message}`);
          console.error(`[RealtimePoseRAC] Raw stdout (first 500 chars): ${stdout.substring(0, 500)}`);
          console.error(`[RealtimePoseRAC] stderr: ${stderr || '(empty)'}`);
          reject(new Error(`Failed to parse Python output as JSON: ${error.message}. Raw output: ${stdout.substring(0, 200)}`));
        }
      });

      pythonProcess.on('error', (error) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutId);
        
        console.error(`[RealtimePoseRAC] Failed to start Python process: ${error.message}`);
        console.error(`[RealtimePoseRAC] Python command: ${pythonCmd}`);
        console.error(`[RealtimePoseRAC] Script path: ${this.pythonScriptPath}`);
        
        const errorMsg = `Failed to start Python process: ${error.message}. ` +
          `Make sure Python is installed and accessible. ` +
          `Tried command: ${pythonCmd}. ` +
          `Script path: ${this.pythonScriptPath}`;
        reject(new Error(errorMsg));
      });

      // Increased timeout to 30 seconds for complex pose detection
      timeoutId = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        
        console.error(`[RealtimePoseRAC] Python script timeout after 30 seconds`);
        console.error(`[RealtimePoseRAC] Partial stdout: ${stdout.substring(0, 500)}`);
        console.error(`[RealtimePoseRAC] Partial stderr: ${stderr.substring(0, 500)}`);
        
        pythonProcess.kill('SIGTERM');
        
        // Force kill after 2 more seconds if still running
        setTimeout(() => {
          if (!pythonProcess.killed) {
            pythonProcess.kill('SIGKILL');
          }
        }, 2000);
        
        reject(new Error('Python script timeout after 30 seconds. The script may be taking too long or hanging. Check Python script performance.'));
      }, 30000); // Increased from 10 to 30 seconds
    });
  }
}

module.exports = new RealtimePoseRACService();

