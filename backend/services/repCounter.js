// Simple server-side rep counting state machine
const repStates = new Map();

function makeInitialState() {
  return {
    lastPhase: null,
    lastCorrectState: false,
    consecutiveCorrectFrames: 0,
    jumpingJackState: 'waiting_for_closed',
    phaseStartTime: null,
    lastStablePhase: null,
    lastRepTime: 0,
    repCount: 0
  };
}

function resetSession(sessionKey) {
  if (!sessionKey) return;
  repStates.set(sessionKey, makeInitialState());
}

function deleteSession(sessionKey) {
  if (!sessionKey) return;
  repStates.delete(sessionKey);
}

// Process a single template result (from POSE_TEMPLATES)
// templateResult should contain: { phase, isCorrect, score, angles }
function processFrame(sessionKey, exerciseName, templateResult) {
  if (!sessionKey) return null;
  let state = repStates.get(sessionKey);
  if (!state) {
    state = makeInitialState();
    repStates.set(sessionKey, state);
  }

  const now = Date.now();
  const phase = templateResult?.phase || 'middle';
  const isCorrect = !!templateResult?.isCorrect;

  // Normalize exercise name
  const ex = (exerciseName || '').toLowerCase();

  // Handle jumping-jack state machine
  if (ex.includes('jump') || ex.includes('jumping-jack')) {
    const MIN_HOLD = 200;
    let stablePhase = phase === 'middle' ? state.lastStablePhase : phase;
    if (phase !== 'middle') state.lastStablePhase = phase;

    const phaseChanged = state.lastPhase !== stablePhase;
    const timeInPhase = now - (state.phaseStartTime || now);
    if (phaseChanged) state.phaseStartTime = now;

    if (stablePhase && stablePhase !== 'middle' && (timeInPhase >= MIN_HOLD || !phaseChanged)) {
      switch (state.jumpingJackState) {
        case 'waiting_for_closed':
          if (stablePhase === 'closed') state.jumpingJackState = 'closed';
          break;
        case 'closed':
          if (stablePhase === 'spread') state.jumpingJackState = 'spread';
          break;
        case 'spread':
          if (stablePhase === 'closed') {
            if (now - state.lastRepTime >= 600) {
              state.repCount += 1;
              state.lastRepTime = now;
            }
            state.jumpingJackState = 'waiting_for_closed';
          }
          break;
      }
    }

    state.lastPhase = stablePhase;
    state.lastCorrectState = isCorrect;
    return state.repCount;
  }

  // For squats/push-ups and generic up/down exercises
  if (ex.includes('squat') || ex.includes('push') || ex.includes('situp') || ex.includes('sit-up')) {
    const newPhase = phase;
    
    // Ignore 'middle' for state transitions to avoid intermediate frame pollution
    let stablePhase = newPhase === 'middle' ? state.lastStablePhase : newPhase;
    if (newPhase !== 'middle') state.lastStablePhase = newPhase;

    // Count when transition down -> up occurs in stable phases
    if (stablePhase === 'up' && state.lastPhase === 'down') {
      if (now - state.lastRepTime >= 600) {
        state.repCount += 1;
        state.lastRepTime = now;
      }
    }

    // Track consecutive correct frames for holds
    if (isCorrect) {
      state.consecutiveCorrectFrames += 1;
    } else {
      state.consecutiveCorrectFrames = 0;
    }

    if (newPhase !== 'middle' && stablePhase) {
      state.lastPhase = stablePhase;
    }
    state.lastCorrectState = isCorrect;
    return state.repCount;
  }

  // Default handling for other exercises: increment when correct toggles true after a gap
  if (!state.lastCorrectState && isCorrect) {
    if (now - state.lastRepTime >= 1000) {
      state.repCount += 1;
      state.lastRepTime = now;
    }
  }
  state.lastCorrectState = isCorrect;
  return state.repCount;
}

module.exports = { processFrame, resetSession, deleteSession };
