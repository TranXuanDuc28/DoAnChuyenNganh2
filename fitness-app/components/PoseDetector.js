class PoseAnalyzer {
  constructor(exerciseName) {
    this.exerciseName = exerciseName;
    this.repState = {
      lastPhase: null,
      consecutiveFrames: 0,
      repCount: 0,
      jumpingJackState: 'waiting_for_closed',
      lastStablePhase: null,
      phaseStartTime: null,
      lastRepTime: Date.now(),
    };
  }

  reset() {
    this.repState = {
      lastPhase: null,
      consecutiveFrames: 0,
      repCount: 0,
      jumpingJackState: 'waiting_for_closed',
      lastStablePhase: null,
      phaseStartTime: null,
      lastRepTime: Date.now(),
    };
  }

  analyzePose(pose) {
    if (!pose || !pose.keypoints) {
      return { isCorrect: false, score: 0, repDetected: false };
    }

    const keypoints = this.keypointsToObject(pose.keypoints);
    const angles = this.calculateAngles(keypoints);
    const { isCorrect, score } = this.evaluatePose(keypoints, angles);
    const repDetected = this.updateRepCount(keypoints, angles, isCorrect);

    return { isCorrect, score, angles, repDetected };
  }

  keypointsToObject(keypoints) {
    const obj = {};
    keypoints.forEach(kp => {
      obj[kp.name] = kp;
    });
    return obj;
  }

  calculateAngles(keypoints) {
    const angles = {};

    // Left knee angle
    if (keypoints.left_hip && keypoints.left_knee && keypoints.left_ankle) {
      angles.leftKnee = this.calculateAngle(
        keypoints.left_hip,
        keypoints.left_knee,
        keypoints.left_ankle
      );
    }

    // Right knee angle
    if (keypoints.right_hip && keypoints.right_knee && keypoints.right_ankle) {
      angles.rightKnee = this.calculateAngle(
        keypoints.right_hip,
        keypoints.right_knee,
        keypoints.right_ankle
      );
    }

    // Average knee angle
    if (angles.leftKnee && angles.rightKnee) {
      angles.avgKnee = (angles.leftKnee + angles.rightKnee) / 2;
    }

    // Left elbow angle
    if (keypoints.left_shoulder && keypoints.left_elbow && keypoints.left_wrist) {
      angles.leftElbow = this.calculateAngle(
        keypoints.left_shoulder,
        keypoints.left_elbow,
        keypoints.left_wrist
      );
    }

    // Right elbow angle
    if (keypoints.right_shoulder && keypoints.right_elbow && keypoints.right_wrist) {
      angles.rightElbow = this.calculateAngle(
        keypoints.right_shoulder,
        keypoints.right_elbow,
        keypoints.right_wrist
      );
    }

    // Left hip angle
    if (keypoints.left_shoulder && keypoints.left_hip && keypoints.left_knee) {
      angles.leftHip = this.calculateAngle(
        keypoints.left_shoulder,
        keypoints.left_hip,
        keypoints.left_knee
      );
    }

    // Right hip angle
    if (keypoints.right_shoulder && keypoints.right_hip && keypoints.right_knee) {
      angles.rightHip = this.calculateAngle(
        keypoints.right_shoulder,
        keypoints.right_hip,
        keypoints.right_knee
      );
    }

    // Arms spread (for jumping jacks)
    if (keypoints.left_shoulder && keypoints.left_wrist && keypoints.right_shoulder && keypoints.right_wrist) {
      const leftArmAngle = Math.atan2(
        keypoints.left_wrist.y - keypoints.left_shoulder.y,
        keypoints.left_wrist.x - keypoints.left_shoulder.x
      ) * 180 / Math.PI;
      
      const rightArmAngle = Math.atan2(
        keypoints.right_wrist.y - keypoints.right_shoulder.y,
        keypoints.right_wrist.x - keypoints.right_shoulder.x
      ) * 180 / Math.PI;
      
      angles.armSpread = Math.abs(leftArmAngle - rightArmAngle);
    }

    return angles;
  }

  calculateAngle(pointA, pointB, pointC) {
    const radians = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
                    Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
    let angle = Math.abs(radians * 180 / Math.PI);
    
    if (angle > 180) {
      angle = 360 - angle;
    }
    
    return angle;
  }

  evaluatePose(keypoints, angles) {
    switch (this.exerciseName) {
      case 'squat':
      case 'squats':
        return this.evaluateSquat(keypoints, angles);
      case 'push-up':
      case 'push-ups':
        return this.evaluatePushUp(keypoints, angles);
      case 'jumping-jack':
        return this.evaluateJumpingJack(keypoints, angles);
      case 'plank':
        return this.evaluatePlank(keypoints, angles);
      default:
        return { isCorrect: false, score: 0 };
    }
  }

  evaluateSquat(keypoints, angles) {
    let score = 0;
    let checks = 0;

    // Check knee angle (should be < 110 for proper squat)
    if (angles.avgKnee) {
      checks++;
      if (angles.avgKnee < 110) {
        score += 0.4;
      }
    }

    // Check hip angle (should be between 70-120)
    if (angles.leftHip && angles.rightHip) {
      const avgHip = (angles.leftHip + angles.rightHip) / 2;
      checks++;
      if (avgHip >= 70 && avgHip <= 120) {
        score += 0.3;
      }
    }

    // Check back straightness (hips should be aligned with shoulders)
    if (keypoints.left_shoulder && keypoints.right_shoulder && 
        keypoints.left_hip && keypoints.right_hip) {
      const shoulderMidY = (keypoints.left_shoulder.y + keypoints.right_shoulder.y) / 2;
      const hipMidY = (keypoints.left_hip.y + keypoints.right_hip.y) / 2;
      const shoulderMidX = (keypoints.left_shoulder.x + keypoints.right_shoulder.x) / 2;
      const hipMidX = (keypoints.left_hip.x + keypoints.right_hip.x) / 2;
      
      const backAngle = Math.abs(Math.atan2(hipMidY - shoulderMidY, hipMidX - shoulderMidX) * 180 / Math.PI);
      checks++;
      if (backAngle > 70 && backAngle < 110) {
        score += 0.3;
      }
    }

    const finalScore = checks > 0 ? score : 0;
    return { isCorrect: finalScore > 0.6, score: finalScore };
  }

  evaluatePushUp(keypoints, angles) {
    let score = 0;
    let checks = 0;

    // Check elbow angle (should be < 90 for down position)
    if (angles.leftElbow && angles.rightElbow) {
      const avgElbow = (angles.leftElbow + angles.rightElbow) / 2;
      checks++;
      if (avgElbow < 110) {
        score += 0.4;
      }
    }

    // Check body straightness (shoulders, hips, ankles aligned)
    if (keypoints.left_shoulder && keypoints.left_hip && keypoints.left_ankle) {
      const bodyAngle = this.calculateAngle(
        keypoints.left_shoulder,
        keypoints.left_hip,
        keypoints.left_ankle
      );
      checks++;
      if (bodyAngle > 160) {
        score += 0.6;
      }
    }

    const finalScore = checks > 0 ? score : 0;
    return { isCorrect: finalScore > 0.6, score: finalScore };
  }

  evaluateJumpingJack(keypoints, angles) {
    let score = 0;
    let checks = 0;

    // Check arm spread
    if (angles.armSpread) {
      checks++;
      if (angles.armSpread > 120) {
        score += 0.5;
      }
    }

    // Check leg spread
    if (keypoints.left_ankle && keypoints.right_ankle) {
      const legSpread = Math.abs(keypoints.left_ankle.x - keypoints.right_ankle.x);
      const shoulderWidth = Math.abs(keypoints.left_shoulder.x - keypoints.right_shoulder.x);
      
      checks++;
      if (legSpread > shoulderWidth * 1.5) {
        score += 0.5;
      }
    }

    const finalScore = checks > 0 ? score : 0;
    return { isCorrect: finalScore > 0.5, score: finalScore };
  }

  evaluatePlank(keypoints, angles) {
    let score = 0;
    let checks = 0;

    // Check body straightness
    if (keypoints.left_shoulder && keypoints.left_hip && keypoints.left_ankle) {
      const bodyAngle = this.calculateAngle(
        keypoints.left_shoulder,
        keypoints.left_hip,
        keypoints.left_ankle
      );
      checks++;
      if (bodyAngle > 165) {
        score += 0.7;
      }
    }

    // Check elbow position (should be directly under shoulders)
    if (keypoints.left_shoulder && keypoints.left_elbow) {
      const elbowOffset = Math.abs(keypoints.left_shoulder.x - keypoints.left_elbow.x);
      checks++;
      if (elbowOffset < 50) { // pixels
        score += 0.3;
      }
    }

    const finalScore = checks > 0 ? score : 0;
    return { isCorrect: finalScore > 0.6, score: finalScore };
  }

  updateRepCount(keypoints, angles, isCorrect) {
    let newPhase = null;
    let repDetected = false;

    switch (this.exerciseName) {
      case 'squat':
      case 'squats':
        repDetected = this.countSquatReps(angles);
        break;
      case 'push-up':
      case 'push-ups':
        repDetected = this.countPushUpReps(angles, isCorrect);
        break;
      case 'jumping-jack':
        repDetected = this.countJumpingJackReps(keypoints, angles);
        break;
      case 'plank':
        // Plank doesn't count reps
        break;
    }

    return repDetected;
  }

  countSquatReps(angles) {
    if (!angles.avgKnee) return false;

    let newPhase = null;
    if (angles.avgKnee < 100) {
      newPhase = 'down';
    } else if (angles.avgKnee > 130) {
      newPhase = 'up';
    } else {
      newPhase = this.repState.lastPhase || 'middle';
    }

    // Count rep when transitioning from down to up
    if (newPhase === 'up' && this.repState.lastPhase === 'down') {
      this.repState.lastPhase = newPhase;
      return true;
    }

    this.repState.lastPhase = newPhase;
    return false;
  }

  countPushUpReps(angles, isCorrect) {
    if (!angles.leftElbow || !angles.rightElbow) return false;

    const avgElbow = (angles.leftElbow + angles.rightElbow) / 2;
    let newPhase = null;

    if (avgElbow < 90) {
      newPhase = 'down';
    } else if (avgElbow > 150) {
      newPhase = 'up';
    } else {
      newPhase = this.repState.lastPhase || 'middle';
    }

    // Count rep when transitioning from down to up
    if (newPhase === 'up' && this.repState.lastPhase === 'down') {
      this.repState.lastPhase = newPhase;
      return true;
    }

    this.repState.lastPhase = newPhase;
    return false;
  }

  countJumpingJackReps(keypoints, angles) {
    if (!keypoints.left_ankle || !keypoints.right_ankle) return false;

    const legSpread = Math.abs(keypoints.left_ankle.x - keypoints.right_ankle.x);
    const shoulderWidth = keypoints.left_shoulder && keypoints.right_shoulder
      ? Math.abs(keypoints.left_shoulder.x - keypoints.right_shoulder.x)
      : 100;

    const now = Date.now();
    const MIN_PHASE_HOLD_MS = 150;
    const REP_COOLDOWN_MS = 600;
    const timeSinceLastRep = now - this.repState.lastRepTime;

    let currentPhase = 'middle';
    if (legSpread > shoulderWidth * 1.5 && angles.armSpread > 120) {
      currentPhase = 'spread';
    } else if (legSpread < shoulderWidth * 0.8) {
      currentPhase = 'closed';
    }

    // Track stable phase
    let stablePhase = currentPhase;
    if (currentPhase === 'middle') {
      stablePhase = this.repState.lastStablePhase;
    } else {
      this.repState.lastStablePhase = currentPhase;
    }

    if (stablePhase && stablePhase !== 'middle') {
      const phaseChanged = this.repState.lastPhase !== stablePhase;
      const timeInCurrentPhase = this.repState.phaseStartTime 
        ? now - this.repState.phaseStartTime 
        : 0;

      if (phaseChanged) {
        this.repState.phaseStartTime = now;
      }

      if (timeInCurrentPhase >= MIN_PHASE_HOLD_MS || !phaseChanged) {
        switch (this.repState.jumpingJackState) {
          case 'waiting_for_closed':
            if (stablePhase === 'closed') {
              this.repState.jumpingJackState = 'closed';
              this.repState.lastPhase = stablePhase;
            }
            break;

          case 'closed':
            if (stablePhase === 'spread') {
              this.repState.jumpingJackState = 'spread';
              this.repState.lastPhase = stablePhase;
            }
            break;

          case 'spread':
            if (stablePhase === 'closed') {
              if (timeSinceLastRep >= REP_COOLDOWN_MS) {
                this.repState.lastRepTime = now;
                this.repState.jumpingJackState = 'waiting_for_closed';
                this.repState.lastPhase = stablePhase;
                return true;
              }
              this.repState.jumpingJackState = 'waiting_for_closed';
              this.repState.lastPhase = stablePhase;
            }
            break;
        }
      }
    }

    if (stablePhase && stablePhase !== 'middle') {
      this.repState.lastPhase = stablePhase;
    }

    return false;
  }
}

export default PoseAnalyzer