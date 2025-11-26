const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

/**
 * Service để gọi Python script video_inference_streaming.py
 * Xử lý video và trả về kết quả với số lần lặp lại động tác
 */
class PoseRACService {
  constructor() {
    // Đường dẫn đến Python script (từ backend/services folder)
    // Cần lên 3 cấp để đến root, rồi vào Pose_counting
    this.pythonScriptPath = path.join(
      __dirname,
      '../../PoseRAC/video_inference_streaming.py'
    );
    this.modelPath = path.join(
      __dirname,
      '../../PoseRAC/best_weights_PoseRAC.pth'
    );
    this.csvPath = path.join(
      __dirname,
      '../../PoseRAC/all_action.csv'
    );
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
        console.log(`[PoseRAC] Found ${file.name}: ${file.path}`);
      } catch (error) {
        missing.push(file.name);
        console.error(`[PoseRAC] Missing ${file.name}: ${file.path}`);
      }
    }

    if (missing.length > 0) {
      const resolvedPaths = files
        .filter(f => missing.includes(f.name))
        .map(f => `  - ${f.name}: ${f.path}`)
        .join('\n');
      throw new Error(`Missing required files: ${missing.join(', ')}\nResolved paths:\n${resolvedPaths}`);
    }
  }

  /**
   * Gọi Python script để xử lý video
   * @param {string} videoPath - Đường dẫn đến video input
   * @param {string} outputPath - Đường dẫn để lưu video output (optional)
   * @param {object} options - Các tùy chọn: enter_threshold, exit_threshold, momentum, useCPU
   * @returns {Promise<object>} Kết quả: { action_type, repetition_count, output_video }
   */
  async processVideo(videoPath, outputPath = null, options = {}) {
    // Validate files
    await this.validateFiles();

    // Validate input video exists
    try {
      await fs.access(videoPath);
    } catch (error) {
      throw new Error(`Video file not found: ${videoPath}`);
    }

    // Convert to absolute paths
    const absoluteVideoPath = path.isAbsolute(videoPath) 
      ? videoPath 
      : path.resolve(videoPath);
    
    // Tạo output path nếu chưa có
    if (!outputPath) {
      const inputDir = path.dirname(absoluteVideoPath);
      const inputName = path.basename(absoluteVideoPath, path.extname(absoluteVideoPath));
      outputPath = path.join(inputDir, `${inputName}_output.mp4`);
    }
    
    const absoluteOutputPath = path.isAbsolute(outputPath)
      ? outputPath
      : path.resolve(outputPath);

    // Đảm bảo thư mục output tồn tại
    const outputDir = path.dirname(absoluteOutputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Chuẩn bị arguments cho Python script (dùng absolute paths)
    const args = [
      this.pythonScriptPath,
      '--video', absoluteVideoPath,
      '--output', absoluteOutputPath,
      '--model', this.modelPath,
      '--enter_threshold', (options.enter_threshold || 0.78).toString(),
      '--exit_threshold', (options.exit_threshold || 0.4).toString(),
      '--momentum', (options.momentum || 0.4).toString()
    ];

    if (options.useCPU) {
      args.push('--cpu');
    }

    // Tìm Python executable
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    
    return new Promise((resolve, reject) => {
      console.log(`[PoseRAC] Starting Python script: ${pythonCmd} ${args.join(' ')}`);
      
      // Set UTF-8 encoding for Python to handle emoji characters on Windows
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
        // Log progress
        if (output.includes('Processing') || output.includes('Rendering') || output.includes('Extracted')) {
          console.log(`[PoseRAC] ${output.trim()}`);
        }
      });

      pythonProcess.stderr.on('data', (data) => {
        const error = data.toString('utf8');
        stderr += error;
        // Log warnings/errors
        if (error.includes('Warning') || error.includes('Error')) {
          console.error(`[PoseRAC] ${error.trim()}`);
        }
      });

      pythonProcess.on('close', async (code) => {
        if (code !== 0) {
          console.error(`[PoseRAC] Python script exited with code ${code}`);
          console.error(`[PoseRAC] stderr: ${stderr || '(empty)'}`);
          console.error(`[PoseRAC] stdout: ${stdout || '(empty)'}`);
          
          // Provide more helpful error messages
          let errorMsg = `Python script failed with code ${code}`;
          if (stderr) {
            errorMsg += `: ${stderr}`;
          } else if (stdout) {
            errorMsg += `. Output: ${stdout.substring(0, 500)}`;
          } else {
            errorMsg += '. No output received. Check if Python script exists and is executable.';
          }
          
          reject(new Error(errorMsg));
          return;
        }

        // Parse output để lấy kết quả
        // Python script in kết quả ra stdout với format:
        // Action: {action_name}
        // Repetitions: {count}
        // Output: {output_path}
        
        try {
          // Kiểm tra file output có tồn tại không
          await fs.access(absoluteOutputPath);
          console.log(`[PoseRAC] Output video found: ${absoluteOutputPath}`);

          // Parse kết quả từ stdout
          const actionMatch = stdout.match(/Action:\s*(\w+)/i);
          const repMatch = stdout.match(/Repetitions:\s*(\d+)/i);
          
          const action_type = actionMatch ? actionMatch[1] : 'unknown';
          const repetition_count = repMatch ? parseInt(repMatch[1], 10) : 0;

          console.log(`[PoseRAC] Parsed result: action=${action_type}, reps=${repetition_count}`);

          // Map action names từ Python sang format chuẩn
          const actionMap = {
            'front_raise': 'front_raise',
            'pull_up': 'pull_up',
            'squat': 'squat',
            'bench_pressing': 'bench_pressing',
            'jump_jack': 'jump_jack',
            'situp': 'situp',
            'push_up': 'push_up',
            'pommelhorse': 'pommelhorse'
          };

          const mappedAction = actionMap[action_type] || action_type;

          resolve({
            action_type: mappedAction,
            repetition_count,
            output_video: absoluteOutputPath,
            success: true
          });
        } catch (error) {
          console.error(`[PoseRAC] Error accessing output or parsing result: ${error.message}`);
          console.error(`[PoseRAC] Expected output path: ${absoluteOutputPath}`);
          console.error(`[PoseRAC] stdout: ${stdout.substring(0, 1000)}`);
          reject(new Error(`Output video not found or parsing failed: ${error.message}. Check Python script output.`));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error(`[PoseRAC] Failed to start Python process: ${error.message}`);
        console.error(`[PoseRAC] Python command: ${pythonCmd}`);
        console.error(`[PoseRAC] Script path: ${this.pythonScriptPath}`);
        reject(new Error(
          `Failed to start Python process: ${error.message}. ` +
          `Make sure Python is installed and accessible. ` +
          `Tried command: ${pythonCmd}. ` +
          `Script path: ${this.pythonScriptPath}`
        ));
      });
    });
  }

  /**
   * Xóa file video tạm thời sau khi xử lý xong
   */
  async cleanupTempFile(filePath) {
    try {
      await fs.unlink(filePath);
      console.log(`[PoseRAC] Cleaned up temp file: ${filePath}`);
    } catch (error) {
      console.warn(`[PoseRAC] Failed to cleanup temp file ${filePath}: ${error.message}`);
    }
  }
}

module.exports = new PoseRACService();

