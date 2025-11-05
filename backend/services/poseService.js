const PoseLog = require('../models/Pose');
let tf = null;
let poseDetection = null;
let isWasmBackend = false;
let jpeg = null;
let PNG = null;
try {
  tf = require('@tensorflow/tfjs-node');
  poseDetection = require('@tensorflow-models/pose-detection');
} catch (e) {
  // Fallback to pure TFJS with WASM backend (no native build tools required)
  try {
    tf = require('@tensorflow/tfjs');
    require('@tensorflow/tfjs-backend-wasm');
    poseDetection = require('@tensorflow-models/pose-detection');
    jpeg = require('jpeg-js');
    PNG = require('pngjs').PNG;
    isWasmBackend = true;
  } catch (_) {
    // No detector available
  }
}

let detectorInstance = null;
let backendInitPromise = null;

async function ensureBackendReady() {
  if (!tf) return;
  if (backendInitPromise) {
    await backendInitPromise;
    return;
  }
  if (isWasmBackend) {
    backendInitPromise = (async () => {
      await tf.setBackend('wasm');
      await tf.ready();
    })();
  } else {
    backendInitPromise = tf.ready();
  }
  await backendInitPromise;
}

async function getDetector() {
  if (!tf || !poseDetection) {
    throw new Error('Pose detector unavailable on server. Please send keypoints from client or install @tensorflow/tfjs-node');
  }
  if (detectorInstance) return detectorInstance;
  await ensureBackendReady();
  const model = poseDetection.SupportedModels.MoveNet;
  detectorInstance = await poseDetection.createDetector(model, { modelType: 'SinglePose.Lightning' });
  return detectorInstance;
}

// Compute angle between three points B is the vertex: angle ABC
function angleBetween(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = (ab.x * cb.x) + (ab.y * cb.y);
  const magAB = Math.hypot(ab.x, ab.y);
  const magCB = Math.hypot(cb.x, cb.y);
  const cosTheta = Math.max(-1, Math.min(1, dot / (magAB * magCB || 1)));
  return Math.acos(cosTheta) * (180 / Math.PI);
}

const JOINTS = {
  leftHip: 'left_hip',
  leftKnee: 'left_knee',
  leftAnkle: 'left_ankle',
  rightHip: 'right_hip',
  rightKnee: 'right_knee',
  rightAnkle: 'right_ankle',
  leftShoulder: 'left_shoulder',
  rightShoulder: 'right_shoulder'
};

// Simple heuristic templates for a few exercises
const POSE_TEMPLATES = {
  squat: ({ keypointsMap }) => {
    const lKnee = angleBetween(keypointsMap[JOINTS.leftHip], keypointsMap[JOINTS.leftKnee], keypointsMap[JOINTS.leftAnkle]);
    const rKnee = angleBetween(keypointsMap[JOINTS.rightHip], keypointsMap[JOINTS.rightKnee], keypointsMap[JOINTS.rightAnkle]);
    const avgKnee = (lKnee + rKnee) / 2;
    
    // More lenient scoring: wider range for correct posture
    // For squats, correct range is when knees are bent (60-120 degrees is reasonable)
    // Score calculation: closer to 90 degrees = better score
    const score = Math.max(0, Math.min(1, (180 - Math.abs(90 - avgKnee)) / 180));
    
    // More lenient correctness: accept 70-130 degrees as "correct enough" for squats
    // This allows for variations in squat depth and form
    const isCorrect = avgKnee >= 70 && avgKnee <= 130;
    
    return { isCorrect, score, angles: { leftKnee: lKnee, rightKnee: rKnee, avgKnee } };
  },
  squats: ({ keypointsMap }) => {
    // Alias for squat
    return POSE_TEMPLATES.squat({ keypointsMap });
  },
  plank: ({ keypointsMap }) => {
    const lHip = angleBetween(keypointsMap[JOINTS.leftShoulder], keypointsMap[JOINTS.leftHip], keypointsMap[JOINTS.leftKnee]);
    const rHip = angleBetween(keypointsMap[JOINTS.rightShoulder], keypointsMap[JOINTS.rightHip], keypointsMap[JOINTS.rightKnee]);
    const avgHip = (lHip + rHip) / 2;
    const score = Math.max(0, Math.min(1, (180 - Math.abs(180 - avgHip)) / 180));
    const isCorrect = avgHip >= 160;
    return { isCorrect, score, angles: { leftHip: lHip, rightHip: rHip, avgHip } };
  }
};

function toKeypointMap(keypoints) {
  const map = {};
  for (const kp of keypoints) {
    map[kp.name || kp.part || kp.key || kp.id || kp] = { x: kp.x, y: kp.y, score: kp.score };
  }
  return map;
}

function normalizeBase64(b64) {
  const cleaned = (b64 || '').replace(/\s|\r|\n/g, '');
  const padLen = cleaned.length % 4;
  if (padLen === 0) return cleaned;
  return cleaned + '='.repeat(4 - padLen);
}

function stripDataUrlPrefix(data) {
  // data:image/jpeg;base64,.... or data:image/png;base64,...
  const match = /^data:(?<mime>[^;]+);base64,(?<b64>.*)$/i.exec(data || '');
  if (match && match.groups) {
    return { mime: match.groups.mime.toLowerCase(), b64: normalizeBase64(match.groups.b64) };
  }
  return { mime: 'application/octet-stream', b64: normalizeBase64(data) };
}

async function detectKeypointsFromImageBase64(imageBase64) {
  if (!tf || !poseDetection) {
    throw new Error('Pose detector unavailable on server. Please send keypoints from client or install @tensorflow/tfjs-node');
  }
  await ensureBackendReady();
  const detector = await getDetector();
  const { mime, b64 } = stripDataUrlPrefix(imageBase64);
  const buffer = Buffer.from(b64, 'base64');

  // Use tfjs-node when available; otherwise decode with jpeg-js and feed a tensor
  if (tf.node && typeof tf.node.decodeImage === 'function') {
    const decoded = tf.node.decodeImage(buffer, 3);
    try {
      const shape = decoded.shape;
      console.log(`[PoseService] Running pose estimation on ${shape[1]}x${shape[0]} image (tfjs-node)...`);
      const poses = await detector.estimatePoses(decoded, { flipHorizontal: false });
      console.log(`[PoseService] Found ${poses.length} pose(s)`);
      const pose = poses[0];
      if (!pose || !pose.keypoints) {
        console.log('[PoseService] No valid pose or keypoints found');
        return null;
      }
      const keypoints = pose.keypoints.map(k => ({ name: k.name || k.part, x: k.x, y: k.y, score: k.score }));
      // Filter out low confidence keypoints
      const validKeypoints = keypoints.filter(k => k.score > 0.3);
      console.log(`[PoseService] Returning ${validKeypoints.length} keypoints with score > 0.3 (total: ${keypoints.length})`);
      return validKeypoints.length > 5 ? validKeypoints : null; // Need at least 6 keypoints for pose evaluation
    } finally {
      decoded.dispose();
    }
  }

  // Decode PNG or JPEG to RGB tensor if tfjs-node is not available
  let width, height, rgb;
  if (mime.includes('png')) {
    if (!PNG) {
      throw new Error('PNG decoding not available. Install pngjs or use JPEG image.');
    }
    const png = PNG.sync.read(buffer);
    width = png.width;
    height = png.height;
    const rgba = png.data; // RGBA
    rgb = new Uint8Array(width * height * 3);
    for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
      rgb[j] = rgba[i];
      rgb[j + 1] = rgba[i + 1];
      rgb[j + 2] = rgba[i + 2];
    }
  } else {
    if (!jpeg) {
      throw new Error('JPEG decoding not available. Install jpeg-js or use PNG.');
    }
    const decoded = jpeg.decode(buffer, { useTArray: true });
    width = decoded.width;
    height = decoded.height;
    const rgba = decoded.data;
    rgb = new Uint8Array(width * height * 3);
    for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
      rgb[j] = rgba[i];
      rgb[j + 1] = rgba[i + 1];
      rgb[j + 2] = rgba[i + 2];
    }
  }

  await ensureBackendReady();
  const input = tf.tidy(() => tf.tensor3d(rgb, [height, width, 3], 'int32'));
  try {
    console.log(`[PoseService] Running pose estimation on ${width}x${height} image...`);
    const poses = await detector.estimatePoses(input, { flipHorizontal: false });
    console.log(`[PoseService] Found ${poses.length} pose(s)`);
    const pose = poses[0];
    if (!pose || !pose.keypoints) {
      console.log('[PoseService] No valid pose or keypoints found');
      return null;
    }
    const keypoints = pose.keypoints.map(k => ({ name: k.name || k.part, x: k.x, y: k.y, score: k.score }));
    // Filter out low confidence keypoints
    const validKeypoints = keypoints.filter(k => k.score > 0.3);
    console.log(`[PoseService] Returning ${validKeypoints.length} keypoints with score > 0.3 (total: ${keypoints.length})`);
    return validKeypoints.length > 5 ? validKeypoints : null; // Need at least 6 keypoints for pose evaluation
  } finally {
    input.dispose();
  }
}

async function evaluatePose({ userId, exerciseName = 'squat', keypoints, imageBase64 }) {
  let usedKeypoints = keypoints;
  if (!usedKeypoints && imageBase64) {
    console.log('[PoseService] Starting keypoint detection from imageBase64...');
    try {
      usedKeypoints = await detectKeypointsFromImageBase64(imageBase64);
      console.log("[PoseService] Detected keypoints from image:", usedKeypoints ? `${usedKeypoints.length} keypoints` : 'null');
      if (usedKeypoints && usedKeypoints.length > 0) {
        console.log("[PoseService] Sample keypoints:", usedKeypoints.slice(0, 3));
      }
    } catch (detectError) {
      console.error("[PoseService] Error detecting keypoints:", detectError.message);
      throw detectError;
    }
  }
  if (!usedKeypoints || usedKeypoints.length === 0) {
    console.error('[PoseService] No keypoints detected - usedKeypoints:', usedKeypoints);
    throw new Error('No keypoints detected - ensure person is fully visible in frame with good lighting');
  }

  const keypointsMap = toKeypointMap(usedKeypoints);
  const template = POSE_TEMPLATES[exerciseName] || POSE_TEMPLATES.squat;
  const { isCorrect, score, angles } = template({ keypointsMap });

  const log = await PoseLog.create({
    userId: userId || null,
    exerciseName,
    isCorrect,
    score,
    repCount: null,
    angles,
    keypoints: usedKeypoints,
    rawImageStored: false
  });

  return { isCorrect, score, angles, logId: log.id, keypoints: usedKeypoints };
}

async function getHistory(userId, limit = 50) {
  const where = userId ? { userId } : {};
  const items = await PoseLog.findAll({ where, order: [['createdAt', 'DESC']], limit });
  return items;
}

module.exports = {
  evaluatePose,
  getHistory
};


