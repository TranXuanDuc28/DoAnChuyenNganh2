// /**
//  * useCameraFrameProcessor.js - Hook tùy chỉnh cho vision-camera
//  * 
//  * Cung cấp frame processor từ vision-camera
//  * Tương thích với Expo Dev Client
//  */

// import { useCallback, useRef, useEffect } from 'react';
// import { useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
// import { runOnJS } from 'react-native-reanimated';
// import FrameProcessor from './FrameProcessor';

// /**
//  * Hook để setup camera frame processor
//  * 
//  * @param {Object} options
//  *   - onFrame: callback(frame) - được gọi mỗi frame
//  *   - enabled: boolean - bật/tắt processor
//  *   - interval: number - ms giữa mỗi frame xử lý (default: 200)
//  * @returns {Object}
//  *   - device: Camera device
//  *   - frameProcessor: Hàm processor
//  */
// export const useCameraFrameProcessor = ({
//   onFrame,
//   enabled = true,
//   interval = 200,
// } = {}) => {
//   const devices = useCameraDevice('back');
//   const lastProcessTimeRef = useRef(0);
//   const frameCountRef = useRef(0);

//   const processFrameJS = useCallback(
//     async (frame) => {
//       try {
//         if (!enabled || !onFrame) return;

//         const now = Date.now();
//         if (now - lastProcessTimeRef.current < interval) {
//           return;
//         }

//         lastProcessTimeRef.current = now;
//         frameCountRef.current++;

//         // Xử lý frame
//         const base64 = await FrameProcessor.processFrame(frame, {
//           validateSize: true,
//           maxSize: 2000000, // 2MB max
//         });

//         // Gọi callback
//         onFrame({
//           base64,
//           width: frame.image?.width,
//           height: frame.image?.height,
//           timestamp: now,
//           frameNumber: frameCountRef.current,
//         });
//       } catch (error) {
//         console.error('[useCameraFrameProcessor] Frame processing error:', error);
//       }
//     },
//     [onFrame, enabled, interval]
//   );

//   // Frame processor từ vision-camera
//   const frameProcessor = useFrameProcessor((frame) => {
//     'worklet'; // Reanimated worklet
    
//     if (!enabled) return;

//     // Chạy xử lý trên JS thread
//     runOnJS(processFrameJS)(frame);
//   }, [enabled, processFrameJS]);

//   return {
//     device: devices,
//     frameProcessor,
//   };
// };

// export default useCameraFrameProcessor;
