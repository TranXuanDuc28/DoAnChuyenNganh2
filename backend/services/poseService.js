const PoseLog = require('../models/Pose');
const ImageEvaluation = require('../models/ImageEvaluation');
const fs = require('fs');
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
  if (!a || !b || !c || a.x === undefined || a.y === undefined ||
    b.x === undefined || b.y === undefined ||
    c.x === undefined || c.y === undefined) {
    return null; // Return null if any point is missing
  }
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = (ab.x * cb.x) + (ab.y * cb.y);
  const magAB = Math.hypot(ab.x, ab.y);
  const magCB = Math.hypot(cb.x, cb.y);
  if (magAB === 0 || magCB === 0) return null; // Avoid division by zero
  const cosTheta = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
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
  rightShoulder: 'right_shoulder',
  leftElbow: 'left_elbow',
  rightElbow: 'right_elbow',
  leftWrist: 'left_wrist',
  rightWrist: 'right_wrist',
};

// Simple heuristic templates for a few exercises
const POSE_TEMPLATES = {
  squat: ({ keypointsMap }) => {
    const lKnee = angleBetween(keypointsMap[JOINTS.leftHip], keypointsMap[JOINTS.leftKnee], keypointsMap[JOINTS.leftAnkle]);
    const rKnee = angleBetween(keypointsMap[JOINTS.rightHip], keypointsMap[JOINTS.rightKnee], keypointsMap[JOINTS.rightAnkle]);

    // Handle null angles
    if (lKnee === null && rKnee === null) {
      return { isCorrect: false, score: 0, angles: { leftKnee: null, rightKnee: null, avgKnee: null }, phase: 'middle' };
    }


    const validAngles = [];
    if (lKnee !== null) validAngles.push(lKnee);
    if (rKnee !== null) validAngles.push(rKnee);
    const avgKnee = validAngles.reduce((sum, a) => sum + a, 0) / validAngles.length;
    //  console.log("Knee Angles:", {
    //   left: lKnee,
    //   right: rKnee,
    //   avg: avgKnee
    // });
    // More lenient scoring: wider range for correct posture
    // For squats, correct range is when knees are bent (60-120 degrees is reasonable)
    // Score calculation: closer to 90 degrees = better score
    const score = Math.max(0, Math.min(1, (180 - Math.abs(90 - avgKnee)) / 180));

    // More lenient correctness: accept 70-130 degrees as "correct enough" for squats
    // This allows for variations in squat depth and form
    // Accept ~80% accuracy: score >= 0.8 OR angle in reasonable range

    // Determine phase: 'up' when knees are straighter (> 140), 'down' when bent (< 100)
    let phase = 'middle';
    if (avgKnee >= 150) {
      phase = 'up'; // Standing position
    } else if (avgKnee <= 120) {
      phase = 'down'; // Squatting position
    } else {
      phase = 'middle';
    }

    // More lenient: accept if score >= 0.8 (80% accuracy) OR angle in reasonable range
    const isCorrect = score >= 0.6;

    const feedback = [];
    if (!isCorrect) {
      if (phase === 'down' && avgKnee > 120) {
        feedback.push("Hạ sâu thêm!");
      } else if (phase === 'up' && avgKnee < 150) {
        feedback.push("Đứng thẳng lên!");
      }
      if (lKnee !== null && rKnee !== null && Math.abs(lKnee - rKnee) > 20) {
        feedback.push("Cân bằng gối!");
      }
      if (feedback.length === 0) {
        feedback.push("Sai tư thế!");
      }
    } else {
      feedback.push("Tốt!");
    }

    return { isCorrect, score, angles: { leftKnee: lKnee, rightKnee: rKnee, avgKnee }, phase, feedback };
  },
  squats: ({ keypointsMap }) => {
    // Alias for squat
    return POSE_TEMPLATES.squat({ keypointsMap });
  },
  'push_up': ({ keypointsMap }) => {
    return POSE_TEMPLATES['push-up']({ keypointsMap });
  },
  'jumping_jack': ({ keypointsMap }) => {
    return POSE_TEMPLATES['jumping-jack']({ keypointsMap });
  },
  // Placeholders for other exercises to prevent crashes
  'pull_up': ({ keypointsMap }) => POSE_TEMPLATES['squat']({ keypointsMap }),
  'front_raise': ({ keypointsMap }) => POSE_TEMPLATES['squat']({ keypointsMap }),
  'bench_pressing': ({ keypointsMap }) => POSE_TEMPLATES['squat']({ keypointsMap }),
  'situp': ({ keypointsMap }) => POSE_TEMPLATES['squat']({ keypointsMap }),
  'pommelhorse': ({ keypointsMap }) => POSE_TEMPLATES['squat']({ keypointsMap }),
  plank: ({ keypointsMap }) => {
    const lHip = angleBetween(keypointsMap[JOINTS.leftShoulder], keypointsMap[JOINTS.leftHip], keypointsMap[JOINTS.leftKnee]);
    const rHip = angleBetween(keypointsMap[JOINTS.rightShoulder], keypointsMap[JOINTS.rightHip], keypointsMap[JOINTS.rightKnee]);

    // Handle null angles
    if (lHip === null && rHip === null) {
      return { isCorrect: false, score: 0, angles: { leftHip: null, rightHip: null, avgHip: null }, phase: 'middle' };
    }

    const validAngles = [];
    if (lHip !== null) validAngles.push(lHip);
    if (rHip !== null) validAngles.push(rHip);
    const avgHip = validAngles.reduce((sum, a) => sum + a, 0) / validAngles.length;

    const score = Math.max(0, Math.min(1, (180 - Math.abs(180 - avgHip)) / 180));
    // More lenient: accept if score >= 0.8 (80% accuracy) OR angle >= 150 (was 160)
    const isCorrect = score >= 0.8 || avgHip >= 150;
    return { isCorrect, score, angles: { leftHip: lHip, rightHip: rHip, avgHip }, phase: 'middle' };
  },
  'push-up': ({ keypointsMap }) => {
    // For push-ups, check elbow angles (shoulder-elbow-wrist)
    // Both arms should be checked, use available ones
    const leftElbow = angleBetween(
      keypointsMap[JOINTS.leftShoulder],
      keypointsMap[JOINTS.leftElbow],
      keypointsMap[JOINTS.leftWrist]
    );
    const rightElbow = angleBetween(
      keypointsMap[JOINTS.rightShoulder],
      keypointsMap[JOINTS.rightElbow],
      keypointsMap[JOINTS.rightWrist]
    );

    // Determine which angles are valid
    const validAngles = [];
    if (leftElbow !== null) validAngles.push(leftElbow);
    if (rightElbow !== null) validAngles.push(rightElbow);

    if (validAngles.length === 0) {
      // No valid angles, return neutral/default values
      return {
        isCorrect: false,
        score: 0,
        angles: { leftElbow: null, rightElbow: null, avgElbow: null },
        phase: 'middle'
      };
    }

    const avgElbow = validAngles.reduce((sum, a) => sum + a, 0) / validAngles.length;
    console.log("Keypoint", {
      leftElbow,
      rightElbow,
      avgElbow
    });

    // Determine phase: 'up' when arms are extended (>= 145 degrees), 'down' when bent (<= 115 degrees)
    // Use hysteresis: 'middle' for transition states (115 < angle < 145)
    // Lower thresholds to better detect transitions and avoid edge cases around 150 degrees
    let phase = 'middle';
    if (avgElbow >= 145) {
      phase = 'up'; // Arms extended
    } else if (avgElbow <= 115) {
      phase = 'down'; // Arms bent
    }
    // else: phase remains 'middle' for angles between 115-145

    // Phase-specific scoring and correctness evaluation
    let score, isCorrect;

    if (phase === 'up') {
      // Phase 'up': arms should be extended (closer to 180 degrees is better)
      // Ideal angle: 180 degrees (fully extended)
      // Acceptable range: >= 140 degrees (allowing some flexibility)
      const idealAngle = 180;
      const minAcceptableAngle = 140;

      // Score: normalized based on how close to ideal (180 degrees)
      // Score = 1.0 when angle = 180, decreases as angle decreases
      score = Math.max(0, Math.min(1, (avgElbow - minAcceptableAngle) / (idealAngle - minAcceptableAngle)));

      // isCorrect: true if angle >= 140 degrees (arms reasonably extended)
      isCorrect = avgElbow >= minAcceptableAngle;

    } else if (phase === 'down') {
      // Phase 'down': arms should be bent (closer to 90 degrees is ideal for proper depth)
      // Ideal angle: ~90 degrees (good depth without going too low)
      // Acceptable range: 50-115 degrees (bent enough but not too extreme)
      const idealAngle = 90;
      const minAcceptableAngle = 50;
      const maxAcceptableAngle = 115;

      // Score: normalized based on how close to ideal (90 degrees)
      // Score = 1.0 when angle = 90, decreases as angle moves away from 90
      if (avgElbow <= idealAngle) {
        // Angle <= 90: score based on how close to 90 (from minAcceptableAngle)
        score = Math.max(0, Math.min(1, (avgElbow - minAcceptableAngle) / (idealAngle - minAcceptableAngle)));
      } else {
        // Angle > 90: score decreases as angle increases toward maxAcceptableAngle
        score = Math.max(0, Math.min(1, 1 - (avgElbow - idealAngle) / (maxAcceptableAngle - idealAngle)));
      }

      // isCorrect: true if angle is in acceptable range (50-115 degrees)
      isCorrect = avgElbow >= minAcceptableAngle && avgElbow <= maxAcceptableAngle;

    } else {
      // Phase 'middle': transition state, more lenient evaluation
      // Acceptable range: 100-140 degrees (reasonable transition angles)
      const minAcceptableAngle = 100;
      const maxAcceptableAngle = 140;

      // Score: normalized based on how close to middle of acceptable range (120 degrees)
      const idealAngle = 120;
      if (avgElbow <= idealAngle) {
        score = Math.max(0, Math.min(1, (avgElbow - minAcceptableAngle) / (idealAngle - minAcceptableAngle)));
      } else {
        score = Math.max(0, Math.min(1, 1 - (avgElbow - idealAngle) / (maxAcceptableAngle - idealAngle)));
      }

      // isCorrect: true if angle is in reasonable transition range
      isCorrect = avgElbow >= minAcceptableAngle && avgElbow <= maxAcceptableAngle;
    }

    const feedback = [];
    if (!isCorrect) {
      if (phase === 'down' && avgElbow > 115) {
        feedback.push("Hạ người thấp hơn!");
      } else if (phase === 'up' && avgElbow < 145) {
        feedback.push("Thẳng tay lên!");
      }
      if (leftElbow !== null && rightElbow !== null && Math.abs(leftElbow - rightElbow) > 20) {
        feedback.push("Cân bằng hai tay!");
      }
      if (feedback.length === 0) {
        feedback.push("Thẳng lưng lên!");
      }
    } else {
      feedback.push("Chuẩn!");
    }

    return {
      isCorrect,
      score,
      angles: { leftElbow, rightElbow, avgElbow },
      phase,
      feedback
    };
  },
  'push-ups': ({ keypointsMap }) => {
    // Alias for push-up
    return POSE_TEMPLATES['push-up']({ keypointsMap });
  },
  'jumping-jack': ({ keypointsMap }) => {
    // For jumping jacks, detect phase based on arm and leg spread
    // Calculate distances between wrists and ankles to determine if spread or closed
    const leftWrist = keypointsMap[JOINTS.leftWrist];
    const rightWrist = keypointsMap[JOINTS.rightWrist];
    const leftAnkle = keypointsMap[JOINTS.leftAnkle];
    const rightAnkle = keypointsMap[JOINTS.rightAnkle];
    const leftShoulder = keypointsMap[JOINTS.leftShoulder];
    const rightShoulder = keypointsMap[JOINTS.rightShoulder];

    // Helper function to calculate horizontal distance between two points (only x-axis)
    // For jumping jacks, we only care about horizontal spread, not vertical position
    const horizontalDistance = (p1, p2) => {
      if (!p1 || !p2 || p1.x === undefined || p2.x === undefined) {
        return null;
      }
      return Math.abs(p2.x - p1.x);
    };

    // Helper function to calculate Euclidean distance (for shoulder width reference)
    const distance = (p1, p2) => {
      if (!p1 || !p2 || p1.x === undefined || p1.y === undefined ||
        p2.x === undefined || p2.y === undefined) {
        return null;
      }
      return Math.hypot(p2.x - p1.x, p2.y - p1.y);
    };

    // Calculate wrist spread (horizontal distance between wrists - only x-axis)
    const wristDistance = horizontalDistance(leftWrist, rightWrist);
    // Calculate ankle spread (horizontal distance between ankles - only x-axis)
    const ankleDistance = horizontalDistance(leftAnkle, rightAnkle);
    // Calculate shoulder width as reference (use horizontal distance for consistency)
    const shoulderWidth = horizontalDistance(leftShoulder, rightShoulder);

    // If we don't have enough keypoints, return default
    if (wristDistance === null && ankleDistance === null) {
      return {
        isCorrect: false,
        score: 0,
        angles: { wristDistance: null, ankleDistance: null, shoulderWidth: null },
        phase: 'middle'
      };
    }

    // Normalize distances relative to shoulder width (if available)
    // This makes detection more robust to camera distance
    let normalizedWristDistance = wristDistance;
    let normalizedAnkleDistance = ankleDistance;

    if (shoulderWidth !== null && shoulderWidth > 0) {
      normalizedWristDistance = wristDistance !== null ? wristDistance / shoulderWidth : null;
      normalizedAnkleDistance = ankleDistance !== null ? ankleDistance / shoulderWidth : null;
    }

    // Determine phase: 'spread' when arms/legs are wide, 'closed' when together
    // Use thresholds based on normalized distances relative to shoulder width
    // spread: >= 1.5x shoulder width (clearly spread)
    // closed: <= 1.2x shoulder width (clearly closed/together)
    // middle: between 1.2x and 1.5x (transition)
    let phase = 'middle';
    const spreadThreshold = shoulderWidth !== null ? 1.5 : 0.35; // Clearly spread position
    const closedThreshold = shoulderWidth !== null ? 1.2 : 0.25; // Clearly closed position (increased from 1.1)

    if (normalizedWristDistance !== null && normalizedAnkleDistance !== null) {
      const avgSpread = (normalizedWristDistance + normalizedAnkleDistance) / 2;
      if (avgSpread >= spreadThreshold) {
        phase = 'spread'; // Arms and legs spread wide
      } else if (avgSpread <= closedThreshold) {
        phase = 'closed'; // Arms and legs together
      } else {
        phase = 'middle'; // Transition state
      }
    } else if (normalizedWristDistance !== null) {
      if (normalizedWristDistance >= spreadThreshold) {
        phase = 'spread';
      } else if (normalizedWristDistance <= closedThreshold) {
        phase = 'closed';
      } else {
        phase = 'middle';
      }
    } else if (normalizedAnkleDistance !== null) {
      if (normalizedAnkleDistance >= spreadThreshold) {
        phase = 'spread';
      } else if (normalizedAnkleDistance <= closedThreshold) {
        phase = 'closed';
      } else {
        phase = 'middle';
      }
    }

    // Calculate average normalized spread for evaluation
    let avgNormalizedSpread = null;
    if (normalizedWristDistance !== null && normalizedAnkleDistance !== null) {
      avgNormalizedSpread = (normalizedWristDistance + normalizedAnkleDistance) / 2;
    } else if (normalizedWristDistance !== null) {
      avgNormalizedSpread = normalizedWristDistance;
    } else if (normalizedAnkleDistance !== null) {
      avgNormalizedSpread = normalizedAnkleDistance;
    }

    // Phase-specific scoring and correctness evaluation
    let score, isCorrect;
    const maxSpread = shoulderWidth !== null ? 2.0 : 0.5; // Maximum expected spread

    if (avgNormalizedSpread === null) {
      // No valid spread data
      score = 0;
      isCorrect = false;
    } else if (phase === 'spread') {
      // Phase 'spread': arms and legs should be wide open
      // Ideal spread: >= 1.5x shoulder width (normalized)
      // Acceptable range: >= 1.2x shoulder width (reasonably spread)
      const idealSpread = shoulderWidth !== null ? 1.8 : 0.45;
      const minAcceptableSpread = shoulderWidth !== null ? 1.2 : 0.3;

      // Score: normalized based on how close to ideal spread
      // Score = 1.0 when spread >= ideal, decreases as spread decreases
      score = Math.max(0, Math.min(1, (avgNormalizedSpread - minAcceptableSpread) / (idealSpread - minAcceptableSpread)));

      // isCorrect: true if spread >= minAcceptableSpread (arms/legs reasonably spread)
      isCorrect = avgNormalizedSpread >= minAcceptableSpread;

    } else if (phase === 'closed') {
      // Phase 'closed': arms and legs should be together
      // Ideal spread: <= 1.0x shoulder width (normalized)
      // Acceptable range: <= 1.2x shoulder width (reasonably closed)
      const idealSpread = shoulderWidth !== null ? 0.9 : 0.2;
      const maxAcceptableSpread = shoulderWidth !== null ? 1.2 : 0.3;

      // Score: normalized based on how close to ideal (closed position)
      // Score = 1.0 when spread <= ideal, decreases as spread increases
      if (avgNormalizedSpread <= idealSpread) {
        // Already at or below ideal, score = 1.0
        score = 1.0;
      } else {
        // Score decreases as spread increases toward maxAcceptableSpread
        score = Math.max(0, Math.min(1, 1 - (avgNormalizedSpread - idealSpread) / (maxAcceptableSpread - idealSpread)));
      }

      // isCorrect: true if spread <= maxAcceptableSpread (arms/legs reasonably closed)
      isCorrect = avgNormalizedSpread <= maxAcceptableSpread;

    } else {
      // Phase 'middle': transition state, more lenient evaluation
      // Acceptable range: 1.0 - 1.3x shoulder width (reasonable transition)
      const minAcceptableSpread = shoulderWidth !== null ? 1.0 : 0.25;
      const maxAcceptableSpread = shoulderWidth !== null ? 1.3 : 0.35;
      const idealSpread = shoulderWidth !== null ? 1.15 : 0.3; // Middle of transition range

      // Score: normalized based on how close to middle of transition range
      if (avgNormalizedSpread <= idealSpread) {
        score = Math.max(0, Math.min(1, (avgNormalizedSpread - minAcceptableSpread) / (idealSpread - minAcceptableSpread)));
      } else {
        score = Math.max(0, Math.min(1, 1 - (avgNormalizedSpread - idealSpread) / (maxAcceptableSpread - idealSpread)));
      }

      // isCorrect: true if spread is in reasonable transition range
      isCorrect = avgNormalizedSpread >= minAcceptableSpread && avgNormalizedSpread <= maxAcceptableSpread;
    }

    const feedback = [];
    if (!isCorrect) {
      if (phase === 'spread' && normalizedWristDistance < 1.2) {
        feedback.push("Dang rộng ra!");
      } else if (phase === 'closed' && normalizedWristDistance > 1.2) {
        feedback.push("Khép tay chân!");
      }
      if (feedback.length === 0) {
        feedback.push("Bật đều tay chân!");
      }
    } else {
      feedback.push("Tốt!");
    }

    return {
      isCorrect,
      score,
      angles: {
        wristDistance: wristDistance,
        ankleDistance: ankleDistance,
        shoulderWidth: shoulderWidth,
        normalizedWristDistance: normalizedWristDistance,
        normalizedAnkleDistance: normalizedAnkleDistance
      },
      phase,
      feedback
    };
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
    const errorMsg = 'Pose detector unavailable on server. Please send keypoints from client or install @tensorflow/tfjs-node. ' +
      'To install: npm install @tensorflow/tfjs-node (Note: requires native build tools on Windows). ' +
      'Alternatively, use Python-based pose detection service.';
    console.error('[PoseService]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    await ensureBackendReady();
  } catch (error) {
    console.error('[PoseService] Failed to initialize TensorFlow backend:', error.message);
    throw new Error(`TensorFlow backend initialization failed: ${error.message}. Please send keypoints from client instead.`);
  }

  let detector;
  try {
    detector = await getDetector();
  } catch (error) {
    console.error('[PoseService] Failed to get detector:', error.message);
    throw new Error(`Failed to initialize pose detector: ${error.message}. Please send keypoints from client instead.`);
  }

  const { mime, b64 } = stripDataUrlPrefix(imageBase64);
  const buffer = Buffer.from(b64, 'base64');

  // Debugging: log incoming mime and buffer length to help diagnose decoding issues
  //console.debug(`[PoseService] Incoming image mime=${mime} base64Len=${(b64||'').length} bufferLen=${buffer.length}`);

  // Save incoming image for inspection if decoding fails or pose detection returns nothing
  // const debugDir = './tmp_debug_images';
  // if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
  // const debugTimestamp = Date.now();
  // const savedImagePath = `${debugDir}/incoming_${debugTimestamp}_${mime.includes('jpeg') ? 'jpg' : 'png'}`;
  // try {
  //   fs.writeFileSync(savedImagePath, buffer);
  //   console.log(`[PoseService] Saved incoming image to ${savedImagePath} for inspection`);
  // } catch (saveErr) {
  //   console.warn('[PoseService] Failed to save incoming image:', saveErr.message);
  // }

  // Use tfjs-node when available; otherwise decode with jpeg-js and feed a tensor
  if (tf.node && typeof tf.node.decodeImage === 'function') {
    const decoded = tf.node.decodeImage(buffer, 3);
    try {
      const shape = decoded.shape;
      //console.log(`[PoseService] Running pose estimation on ${shape[1]}x${shape[0]} image (tfjs-node)...`);
      const poses = await detector.estimatePoses(decoded, { flipHorizontal: false });
      //console.log(`[PoseService] Found ${poses.length} pose(s)`);
      const pose = poses[0];
      if (!pose || !pose.keypoints) {
        //console.log('[PoseService] No valid pose or keypoints found');
        return null;
      }
      const keypoints = pose.keypoints.map(k => ({ name: k.name || k.part, x: k.x, y: k.y, score: k.score }));
      // Filter out low confidence keypoints
      const validKeypoints = keypoints.filter(k => k.score > 0.3);
      console.log(`[PoseService] tfjs-node: found ${validKeypoints.length} valid keypoints (total: ${keypoints.length})`);
      if (validKeypoints.length <= 5) {
        console.warn(`[PoseService] Not enough keypoints (${validKeypoints.length} <= 5).`);
      }
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
    let decoded;
    try {
      decoded = jpeg.decode(buffer, { useTArray: true });
    } catch (jpgErr) {
      // Save the raw buffer to disk for inspection (helpful to debug corrupted/truncated uploads)
      // try {
      //   const debugDir = './tmp_debug_images';
      //   if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
      //   const debugPath = `${debugDir}/failed_decode_${Date.now()}.bin`;
      //   fs.writeFileSync(debugPath, buffer);
      //   console.error(`[PoseService] JPEG decode failed - raw buffer saved to ${debugPath}`);
      // } catch (saveErr) {
      //   console.error('[PoseService] Failed to write debug buffer to disk:', saveErr.message || saveErr);
      // }
      // Re-throw with more context for client logs
      const err = new Error(`SOI not found or invalid JPEG data. Original error: ${jpgErr.message}`);
      err.original = jpgErr;
      throw err;
    }

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
    //console.log(`[PoseService] Running pose estimation on ${width}x${height} image...`);
    const poses = await detector.estimatePoses(input, { flipHorizontal: false });
    //console.log(`[PoseService] Found ${poses.length} pose(s)`);
    const pose = poses[0];
    if (!pose || !pose.keypoints) {
      //console.log('[PoseService] No valid pose or keypoints found');
      return null;
    }
    const keypoints = pose.keypoints.map(k => ({ name: k.name || k.part, x: k.x, y: k.y, score: k.score }));
    // Filter out low confidence keypoints
    const validKeypoints = keypoints.filter(k => k.score > 0.3);
    //console.log(`[PoseService] WASM backend: found ${validKeypoints.length} valid keypoints (total: ${keypoints.length})`);
    if (validKeypoints.length <= 5) {
      console.warn(`[PoseService] Not enough keypoints (${validKeypoints.length} <= 5).`);
    }
    return validKeypoints.length > 5 ? validKeypoints : null; // Need at least 6 keypoints for pose evaluation
  } finally {
    input.dispose();
  }
}

const repCounter = require('./repCounter');

async function evaluatePose({ user_id, exerciseName = 'squat', imageBase64, sessionKey = null, keypoints = null }) {
  let usedKeypoints = keypoints;
  if (!usedKeypoints && imageBase64) {
    // console.log('[PoseService] Starting keypoint detection from imageBase64...');
    try {
      usedKeypoints = await detectKeypointsFromImageBase64(imageBase64);
      //console.log(`[PoseService] Detected keypoints from image: ${usedKeypoints ? `${usedKeypoints.length} keypoints` : 'null'}`);
      if (usedKeypoints && usedKeypoints.length > 0) {
        //console.log(`[PoseService] Sample keypoints: ${JSON.stringify(usedKeypoints.slice(0, 3))}`);
      }
    } catch (detectError) {
      console.error(`[PoseService] Error detecting keypoints: ${detectError.message}`);
      // Provide more helpful error message
      if (detectError.message.includes('unavailable') || detectError.message.includes('initialization failed')) {
        throw new Error(
          'Server-side pose detection is not available. ' +
          'Please send keypoints from the client instead, or install TensorFlow.js: ' +
          'npm install @tensorflow/tfjs-node. ' +
          'Original error: ' + detectError.message
        );
      }
      throw detectError;
    }
  }
  if (!usedKeypoints || usedKeypoints.length === 0) {
    console.error('[PoseService] No keypoints detected - usedKeypoints:', usedKeypoints);
    throw new Error('No keypoints detected - ensure person is fully visible in frame with good lighting, or send keypoints from client');
  }
  // console.log("Duc", usedKeypoints)

  const keypointsMap = toKeypointMap(usedKeypoints);
  let template = POSE_TEMPLATES[exerciseName];

  // Fallback to squat if template not found to prevent crash
  if (typeof template !== 'function') {
    console.warn(`[PoseService] Template not found for exercise: ${exerciseName}, using squat as default`);
    template = POSE_TEMPLATES.squat;
  }

  const templateResult = template({ keypointsMap });
  const { isCorrect, score, angles, phase, feedback } = templateResult;
  console.log(`[PoseService] Evaluate: ${exerciseName} | Correct: ${isCorrect} | Score: ${score.toFixed(2)} | Phase: ${phase} | Angles: ${JSON.stringify(angles)}`);

  // Update rep count in server-side state machine if a sessionKey is provided
  let repCount = null;
  try {
    if (sessionKey) {
      repCount = repCounter.processFrame(sessionKey, exerciseName, { phase, isCorrect, score, angles });
    }
  } catch (e) {
    console.warn('[PoseService] repCounter failed:', e.message);
  }

  const log = await PoseLog.create({
    user_id: user_id || null,
    exerciseName,
    isCorrect,
    score,
    repCount: repCount,
    angles,
    keypoints: usedKeypoints,
    rawImageStored: false
  });
  return { isCorrect, score, keypoints: usedKeypoints, angles, phase: phase || 'middle', repCount, feedback: feedback || [] };
}

async function getHistory(user_id, limit = 50) {
  const where = user_id ? { user_id } : {};
  const items = await PoseLog.findAll({ where, order: [['createdAt', 'DESC']], limit });
  return items;
}

/**
 * Lưu kết quả đánh giá ảnh vào database
 */
async function saveImageEvaluation(data) {
  const {
    userId,
    exerciseName,
    score,
    isCorrect,
    feedback,
    keypoints,
    angles,
    detectedPose,
    confidence,
    processingTime,
    inputImagePath,
    resultImagePath,
    referenceImagePath,
    comparisonImagePath,
    metadata
  } = data;

  const evaluation = await ImageEvaluation.create({
    userId,
    exerciseName,
    score,
    isCorrect,
    feedback: feedback || [],
    keypoints,
    angles,
    detectedPose,
    confidence,
    processingTime,
    inputImagePath,
    resultImagePath,
    referenceImagePath,
    comparisonImagePath,
    status: 'completed',
    metadata: metadata || {}
  });

  return evaluation;
}

/**
 * Lấy lịch sử đánh giá ảnh
 */
async function getImageHistory(userId, exerciseName, limit = 50) {
  const where = {};
  if (userId) where.userId = userId;
  if (exerciseName) where.exerciseName = exerciseName;

  const evaluations = await ImageEvaluation.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    attributes: [
      'id', 'userId', 'exerciseName', 'score', 'isCorrect',
      'feedback', 'detectedPose', 'confidence', 'createdAt',
      'inputImagePath', 'resultImagePath', 'referenceImagePath', 'comparisonImagePath'
    ]
  });

  return evaluations;
}

/**
 * Xóa đánh giá ảnh
 */
async function deleteImageEvaluation(id, userId) {
  const where = { id };
  if (userId) where.userId = userId;

  const deleted = await ImageEvaluation.destroy({ where });
  return deleted > 0;
}

module.exports = {
  evaluatePose,
  getHistory,
  saveImageEvaluation,
  getImageHistory,
  deleteImageEvaluation
};


