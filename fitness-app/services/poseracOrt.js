// // Minimal ONNX Runtime inference service for PoseRAC
// // NOTE: onnxruntime-react-native is a native module and may not be available
// // in an Expo Go client. We lazy-load the module at runtime and surface
// // friendly errors if the native runtime is not installed. This prevents
// // crashes when the JS bundle loads on environments without the native lib.

// let onnx = null;
// let session = null;
// let inputName = 'input';
// let outputName = 'logits';

// export async function initPoseRACSession(modelAssetPath = 'poserac.onnx') {
// 	if (session) return session;

// 	// Lazy-require the native onnx runtime so the module import doesn't crash
// 	// on platforms where the native package isn't present (e.g. Expo Go).
// 	if (!onnx) {
// 		try {
// 			// Use require so bundlers don't fail static analysis in environments
// 			// missing the native module.
// 			// eslint-disable-next-line global-require
// 			onnx = require('onnxruntime-react-native');
// 		} catch (err) {
// 			console.warn('[poseracOrt] onnxruntime-react-native not available:', err?.message || err);
// 			throw new Error('onnxruntime-react-native native module is not installed. Use a custom dev client or a native build that includes the library.');
// 		}
// 	}

// 	// Create an inference session
// 	session = await onnx.InferenceSession.create(modelAssetPath, {
// 		executionProviders: ['cpu'], // Mobile CPU
// 	});

// 	// Try to infer real I/O names if available
// 	const meta = session.inputNames && session.outputNames ? { inputs: session.inputNames, outputs: session.outputNames } : null;
// 	if (meta && meta.inputs && meta.inputs.length > 0) inputName = meta.inputs[0];
// 	if (meta && meta.outputs && meta.outputs.length > 0) outputName = meta.outputs[0];
// 	return session;
// }

// // inputVector: Float32Array length=99, already normalized
// export async function runPoseRAC(inputVector) {
// 	if (!onnx || !session) {
// 		throw new Error('PoseRAC session not initialized. Call initPoseRACSession() first (and ensure native onnx runtime is installed).');
// 	}
// 	if (!inputVector || inputVector.length !== 99) {
// 		throw new Error('Invalid input: expected Float32Array length 99 (33 keypoints x 3).');
// 	}

// 	// Create tensor and run
// 	const tensor = new onnx.Tensor('float32', inputVector, [1, 99]);
// 	const feeds = {};
// 	feeds[inputName] = tensor;
// 	const results = await session.run(feeds);
// 	const logits = results[outputName].data; // Float32Array [1, num_classes]

// 	// Apply sigmoid per-class (match Python inference)
// 	const probs = new Float32Array(logits.length);
// 	for (let i = 0; i < logits.length; i += 1) {
// 		const x = logits[i];
// 		probs[i] = 1 / (1 + Math.exp(-x));
// 	}
// 	return probs;
// }


