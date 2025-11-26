import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

// Keypoint connections for drawing skeleton
const KEYPOINT_CONNECTIONS = [
  // Head to shoulders
  ['nose', 'left_eye'],
  ['nose', 'right_eye'],
  ['left_eye', 'left_ear'],
  ['right_eye', 'right_ear'],
  // Upper body
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  // Torso
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  // Lower body
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
];

// Standard keypoint positions for correct posture (normalized 0-1)
const STANDARD_POSITIONS = {
  squat: {
    // Ideal squat position - knees at ~90 degrees
    left_hip: { x: 0.3, y: 0.4 },
    left_knee: { x: 0.3, y: 0.55 },
    left_ankle: { x: 0.3, y: 0.75 },
    right_hip: { x: 0.7, y: 0.4 },
    right_knee: { x: 0.7, y: 0.55 },
    right_ankle: { x: 0.7, y: 0.75 },
    left_shoulder: { x: 0.3, y: 0.2 },
    right_shoulder: { x: 0.7, y: 0.2 },
    nose: { x: 0.5, y: 0.15 },
  },
  squats: {
    // Alias for squat
    left_hip: { x: 0.3, y: 0.4 },
    left_knee: { x: 0.3, y: 0.55 },
    left_ankle: { x: 0.3, y: 0.75 },
    right_hip: { x: 0.7, y: 0.4 },
    right_knee: { x: 0.7, y: 0.55 },
    right_ankle: { x: 0.7, y: 0.75 },
    left_shoulder: { x: 0.3, y: 0.2 },
    right_shoulder: { x: 0.7, y: 0.2 },
    nose: { x: 0.5, y: 0.15 },
  },
  plank: {
    // Ideal plank position - straight line
    left_hip: { x: 0.4, y: 0.5 },
    left_knee: { x: 0.4, y: 0.6 },
    left_ankle: { x: 0.4, y: 0.7 },
    right_hip: { x: 0.6, y: 0.5 },
    right_knee: { x: 0.6, y: 0.6 },
    right_ankle: { x: 0.6, y: 0.7 },
    left_shoulder: { x: 0.4, y: 0.4 },
    right_shoulder: { x: 0.6, y: 0.4 },
    nose: { x: 0.5, y: 0.35 },
  },
  'plank-to-downward-dog': {
    // Plank to downward dog transition - starting in plank position
    left_hip: { x: 0.4, y: 0.5 },
    left_knee: { x: 0.4, y: 0.6 },
    left_ankle: { x: 0.4, y: 0.7 },
    right_hip: { x: 0.6, y: 0.5 },
    right_knee: { x: 0.6, y: 0.6 },
    right_ankle: { x: 0.6, y: 0.7 },
    left_shoulder: { x: 0.4, y: 0.4 },
    right_shoulder: { x: 0.6, y: 0.4 },
    nose: { x: 0.5, y: 0.35 },
  },
  'push-ups': {
    // Push-up position - similar to plank but with arms supporting
    left_hip: { x: 0.4, y: 0.55 },
    left_knee: { x: 0.4, y: 0.65 },
    left_ankle: { x: 0.4, y: 0.75 },
    right_hip: { x: 0.6, y: 0.55 },
    right_knee: { x: 0.6, y: 0.65 },
    right_ankle: { x: 0.6, y: 0.75 },
    left_shoulder: { x: 0.4, y: 0.45 },
    left_elbow: { x: 0.4, y: 0.5 },
    left_wrist: { x: 0.4, y: 0.55 },
    right_shoulder: { x: 0.6, y: 0.45 },
    right_elbow: { x: 0.6, y: 0.5 },
    right_wrist: { x: 0.6, y: 0.55 },
    nose: { x: 0.5, y: 0.4 },
  },
  'jumping-jack': {
    // Jumping jack position - arms and legs spread wide
    left_hip: { x: 0.25, y: 0.5 },
    left_knee: { x: 0.25, y: 0.65 },
    left_ankle: { x: 0.25, y: 0.8 },
    right_hip: { x: 0.75, y: 0.5 },
    right_knee: { x: 0.75, y: 0.65 },
    right_ankle: { x: 0.75, y: 0.8 },
    left_shoulder: { x: 0.25, y: 0.3 },
    left_elbow: { x: 0.25, y: 0.35 },
    left_wrist: { x: 0.25, y: 0.4 },
    right_shoulder: { x: 0.75, y: 0.3 },
    right_elbow: { x: 0.75, y: 0.35 },
    right_wrist: { x: 0.75, y: 0.4 },
    nose: { x: 0.5, y: 0.25 },
  },
};

// Color mappings
const COLORS = {
  detected: {
    point: '#FF6B6B', // Red for detected keypoints
    line: '#FF9999',
    correct: '#51CF66', // Green if keypoint matches well
    incorrect: '#FF6B6B',
  },
  standard: {
    point: '#4ECDC4', // Teal for standard keypoints
    line: '#95E1D3',
  },
};

const PoseVisualization = ({ 
  imageWidth, 
  imageHeight, 
  originalWidth,
  originalHeight,
  detectedKeypoints = [], 
  exerciseName = 'squat',
  showStandard = true,
  showDetected = true 
}) => {
  if (!imageWidth || !imageHeight) return null;

  // Get standard keypoints for this exercise
  // Normalize exercise name to handle variations
  const normalizedExerciseName = exerciseName?.toLowerCase().replace(/\s+/g, '-') || 'squat';
  const standardKeypoints = STANDARD_POSITIONS[normalizedExerciseName] || STANDARD_POSITIONS.squat;
  
  // Calculate scale factors if original dimensions are provided
  // This handles cases where image is displayed with resizeMode="contain"
  // We need to maintain aspect ratio and find the actual scale
  let scaleX = 1;
  let scaleY = 1;
  let offsetX = 0;
  let offsetY = 0;
  
  if (originalWidth && originalHeight && originalWidth > 0 && originalHeight > 0) {
    const imageAspect = originalWidth / originalHeight;
    const containerAspect = imageWidth / imageHeight;
    
    if (imageAspect > containerAspect) {
      // Image is wider - fit to width
      scaleX = scaleY = imageWidth / originalWidth;
      offsetY = (imageHeight - originalHeight * scaleY) / 2;
    } else {
      // Image is taller - fit to height
      scaleX = scaleY = imageHeight / originalHeight;
      offsetX = (imageWidth - originalWidth * scaleX) / 2;
    }
  }
  
  // Helper to convert standard (normalized) keypoints to display coordinates
  const standardToDisplay = (normX, normY) => {
    if (originalWidth && originalHeight && originalWidth > 0 && originalHeight > 0) {
      // Convert normalized to original image coords, then scale
      const origX = normX * originalWidth;
      const origY = normY * originalHeight;
      return { x: origX * scaleX + offsetX, y: origY * scaleY + offsetY };
    }
    // Fallback: just use normalized coordinates directly on container
    return { x: normX * imageWidth, y: normY * imageHeight };
  };

  // Convert keypoints to map for easier access and scale them
  // Keypoints from backend are in absolute pixel coordinates of the original/captured image
  // We need to scale them to match the display container size
  const detectedMap = {};
  detectedKeypoints.forEach(kp => {
    const name = kp.name || kp.part || kp.key;
    if (name && kp.x != null && kp.y != null) {
      let x, y;
      
      if (originalWidth && originalHeight && originalWidth > 0 && originalHeight > 0) {
        // Scale from original image coordinates to display coordinates
        x = kp.x * scaleX + offsetX;
        y = kp.y * scaleY + offsetY;
      } else {
        // Fallback: assume keypoints are already in display coordinates or normalized
        // If keypoints seem to be in a reasonable range for the display size, use directly
        if (kp.x <= imageWidth && kp.y <= imageHeight) {
          x = kp.x;
          y = kp.y;
        } else {
          // Assume normalized 0-1, scale to display
          x = kp.x * imageWidth;
          y = kp.y * imageHeight;
        }
      }
      
      detectedMap[name] = { 
        x, 
        y, 
        score: kp.score,
        originalX: kp.x,
        originalY: kp.y
      };
    }
  });

  // Calculate distance between detected and standard keypoint (normalized)
  const getKeypointDistance = (name) => {
    const detected = detectedMap[name];
    const standard = standardKeypoints[name];
    if (!detected || !standard) return null;
    
    // Convert standard to display coordinates for comparison
    const standardDisplay = standardToDisplay(standard.x, standard.y);
    
    // Compare in display coordinates, normalized by container size
    const dx = (detected.x - standardDisplay.x) / imageWidth;
    const dy = (detected.y - standardDisplay.y) / imageHeight;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Check if keypoint is close enough to standard (threshold = 10% of image size)
  const isKeypointCorrect = (name) => {
    const distance = getKeypointDistance(name);
    return distance !== null && distance < 0.15; // 15% threshold
  };

  // Render keypoint connections
  const renderConnections = (keypoints, isStandard = false) => {
    const color = isStandard ? COLORS.standard.line : COLORS.detected.line;
    const connections = [];

    KEYPOINT_CONNECTIONS.forEach(([start, end]) => {
      const startKp = keypoints[start];
      const endKp = keypoints[end];
      
      if (startKp && endKp) {
        let x1, y1, x2, y2;
        if (isStandard) {
          const startPos = standardToDisplay(startKp.x, startKp.y);
          const endPos = standardToDisplay(endKp.x, endKp.y);
          x1 = startPos.x; y1 = startPos.y;
          x2 = endPos.x; y2 = endPos.y;
        } else {
          x1 = startKp.x; y1 = startKp.y;
          x2 = endKp.x; y2 = endKp.y;
        }

        connections.push(
          <Line
            key={`${start}-${end}-${isStandard ? 'std' : 'det'}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={isStandard ? 2 : 2.5}
            strokeDasharray={isStandard ? '5,5' : undefined}
            opacity={isStandard ? 0.6 : 0.8}
          />
        );
      }
    });

    return connections;
  };

  // Render keypoints
  const renderKeypoints = (keypoints, isStandard = false) => {
    return Object.entries(keypoints).map(([name, kp]) => {
      let x, y;
      if (isStandard) {
        const pos = standardToDisplay(kp.x, kp.y);
        x = pos.x; y = pos.y;
      } else {
        x = kp.x; y = kp.y;
      }
      const radius = isStandard ? 6 : 7;
      
      // For detected keypoints, check if they match standard
      let pointColor = isStandard ? COLORS.standard.point : COLORS.detected.point;
      if (!isStandard && showStandard) {
        pointColor = isKeypointCorrect(name) ? COLORS.detected.correct : COLORS.detected.incorrect;
      }

      return (
        <Circle
          key={`${name}-${isStandard ? 'std' : 'det'}`}
          cx={x}
          cy={y}
          r={radius}
          fill={pointColor}
          stroke="#fff"
          strokeWidth={2}
          opacity={isStandard ? 0.7 : 0.9}
        />
      );
    });
  };

  return (
    <View style={[styles.container, { width: imageWidth, height: imageHeight }]}>
      <Svg width={imageWidth} height={imageHeight} style={styles.svg}>
        {/* Render standard skeleton first (behind) */}
        {showStandard && renderConnections(standardKeypoints, true)}
        
        {/* Render detected skeleton */}
        {showDetected && renderConnections(detectedMap, false)}
        
        {/* Render standard keypoints */}
        {showStandard && renderKeypoints(standardKeypoints, true)}
        
        {/* Render detected keypoints (on top) */}
        {showDetected && renderKeypoints(detectedMap, false)}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default PoseVisualization;
