import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

// Skeleton connections (bones)
const POSE_CONNECTIONS = [
  // Torso
  { from: 'left_shoulder', to: 'right_shoulder', color: '#4ECDC4' },
  { from: 'left_shoulder', to: 'left_hip', color: '#4ECDC4' },
  { from: 'right_shoulder', to: 'right_hip', color: '#4ECDC4' },
  { from: 'left_hip', to: 'right_hip', color: '#4ECDC4' },
  
  // Left arm
  { from: 'left_shoulder', to: 'left_elbow', color: '#4ECDC4' },
  { from: 'left_elbow', to: 'left_wrist', color: '#4ECDC4' },
  
  // Right arm
  { from: 'right_shoulder', to: 'right_elbow', color: '#4ECDC4' },
  { from: 'right_elbow', to: 'right_wrist', color: '#4ECDC4' },
  
  // Left leg
  { from: 'left_hip', to: 'left_knee', color: '#4ECDC4' },
  { from: 'left_knee', to: 'left_ankle', color: '#4ECDC4' },
  
  // Right leg
  { from: 'right_hip', to: 'right_knee', color: '#4ECDC4' },
  { from: 'right_knee', to: 'right_ankle', color: '#4ECDC4' },
  
  // Head
  { from: 'left_ear', to: 'left_eye', color: '#4ECDC4' },
  { from: 'right_ear', to: 'right_eye', color: '#4ECDC4' },
  { from: 'left_eye', to: 'nose', color: '#4ECDC4' },
  { from: 'right_eye', to: 'nose', color: '#4ECDC4' },
  { from: 'left_ear', to: 'left_shoulder', color: '#4ECDC4' },
  { from: 'right_ear', to: 'right_shoulder', color: '#4ECDC4' },
];

const KEYPOINT_RADIUS = 6;
const SKELETON_WIDTH = 3;
const CONFIDENCE_THRESHOLD = 0.3;

const PoseOverlay = React.memo(({
  pose,
  containerWidth = screenWidth,
  containerHeight = 360,
  flipHorizontal = false,
}) => {
  if (!pose || !pose.keypoints || pose.keypoints.length === 0) {
    return null;
  }

  const keypoints = pose.keypoints;
  const imageWidth = pose.imageWidth || 640;
  const imageHeight = pose.imageHeight || 480;
  
  // Memoize calculations for better performance
  const { keypointMap, validConnections, validKeypoints } = useMemo(() => {
    // Calculate scale factors for displaying on screen
    const scaleX = containerWidth / imageWidth;
    const scaleY = containerHeight / imageHeight;
    
    // Create keypoint map for easy lookup
    const kpMap = {};
    keypoints.forEach(kp => {
      const scaledX = kp.x * scaleX;
      const scaledY = kp.y * scaleY;
      kpMap[kp.name] = {
        x: flipHorizontal ? containerWidth - scaledX : scaledX,
        y: scaledY,
        score: kp.score || 0,
        isCorrect: kp.isCorrect !== false, // Default to true if not specified
      };
    });

    // Filter connections where both keypoints exist and have good confidence
    const validConns = POSE_CONNECTIONS.filter(conn => {
      const from = kpMap[conn.from];
      const to = kpMap[conn.to];
      return from && to && 
             from.score > CONFIDENCE_THRESHOLD && 
             to.score > CONFIDENCE_THRESHOLD;
    });

    // Filter keypoints with good confidence
    const validKps = keypoints.filter(kp => 
      (kp.score || 0) > CONFIDENCE_THRESHOLD
    );
    
    return { keypointMap: kpMap, validConnections: validConns, validKeypoints: validKps };
  }, [keypoints, imageWidth, imageHeight, containerWidth, containerHeight, flipHorizontal]);

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={containerWidth} height={containerHeight} style={styles.svg}>
        <G>
          {/* Draw skeleton lines first (behind keypoints) */}
          {validConnections.map((conn, index) => {
            const from = keypointMap[conn.from];
            const to = keypointMap[conn.to];
            
            return (
              <Line
                key={`line-${index}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={conn.color}
                strokeWidth={SKELETON_WIDTH}
                strokeLinecap="round"
                opacity={0.8}
              />
            );
          })}
          
          {/* Draw keypoints on top */}
          {validKeypoints.map((kp, index) => {
            const point = keypointMap[kp.name];
            if (!point) return null;
            
            // Color based on correctness
            const fillColor = point.isCorrect ? '#51CF66' : '#FF6B6B';
            const strokeColor = point.isCorrect ? '#2F9E44' : '#C92A2A';
            
            return (
              <Circle
                key={`point-${index}`}
                cx={point.x}
                cy={point.y}
                r={KEYPOINT_RADIUS}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={2}
                opacity={0.9}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default PoseOverlay;