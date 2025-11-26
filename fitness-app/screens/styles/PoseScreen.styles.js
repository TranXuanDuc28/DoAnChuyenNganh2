import { StyleSheet, Dimensions, Platform } from 'react-native';
import colors from '../../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

// Responsive camera height
const getCameraHeight = () => {
  if (isWeb) {
    return Math.min(SCREEN_HEIGHT * 0.5, 500); // Max 500px on web
  }
  return Math.min(SCREEN_HEIGHT * 0.45, 400); // Smaller on mobile
};

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
    ...(isWeb && {
      maxWidth: 1200,
      marginHorizontal: 'auto',
      width: '100%',
    }),
  },
  cameraWrap: { 
    height: getCameraHeight(), 
    backgroundColor: colors.black, 
    position: 'relative',
    ...(isWeb && {
      borderRadius: 16,
      overflow: 'hidden',
      marginHorizontal: 16,
      marginTop: 16,
    }),
  },
  camera: { flex: 1 },
  switchRow: { 
    position: 'absolute', 
    right: 12, 
    bottom: 12, 
    zIndex: 10,
    ...(isWeb && {
      right: 16,
      bottom: 16,
    }),
  },
  statusOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 2,
    zIndex: 10,
    ...(isWeb && {
      top: 16,
      left: 16,
      right: 16,
      maxWidth: 400,
    }),
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
    flex: 1,
  },
  statusScore: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    opacity: 0.9,
  },
  statusIconPulse: {
    opacity: 0.8,
  },
  switchBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    backgroundColor: colors.card, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: colors.border,
    ...(isWeb && {
      cursor: 'pointer',
      paddingHorizontal: 16,
      paddingVertical: 10,
    }),
  },
  switchText: { 
    color: colors.text, 
    fontWeight: '600', 
    marginLeft: 6,
    ...(isWeb && {
      fontSize: 15,
    }),
  },
  actions: { 
    padding: 16, 
    backgroundColor: colors.card, 
    borderTopWidth: 1, 
    borderTopColor: colors.border,
    ...(isWeb && {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 24,
      paddingVertical: 20,
      borderRadius: 16,
      marginHorizontal: 16,
      marginTop: 16,
      borderTopWidth: 0,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    }),
  },
  captureBtn: { 
    flexDirection: 'row', 
    gap: 8, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: colors.primary, 
    paddingVertical: 14, 
    borderRadius: 12, 
    shadowColor: colors.black, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3,
    marginTop: 10,
    ...(isWeb && {
      flex: 1,
      cursor: 'pointer',
      paddingVertical: 16,
      marginTop: 0,
    }),
  },
  firstBtn: {
    marginTop: 0,
  },
  realTimeBtn: { 
    backgroundColor: colors.iconWarning,
    ...(isWeb && {
      flex: 1,
    }),
  },
  stopBtn: { 
    backgroundColor: colors.iconDanger,
    ...(isWeb && {
      flex: 1,
    }),
  },
  secondaryBtn: {
    backgroundColor: colors.iconSuccess,
  },
  tertiaryBtn: {
    backgroundColor: colors.textSecondary,
  },
  buttonRow: {
    ...(isWeb && {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    }),
  },
  captureText: { 
    color: colors.textOnPrimary, 
    fontSize: 15, 
    fontWeight: '600', 
    marginLeft: 8,
    ...(isWeb && {
      fontSize: 16,
    }),
  },
  realTimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.iconWarning,
    ...(isWeb && {
      paddingVertical: 12,
      paddingHorizontal: 20,
      marginTop: 16,
      borderRadius: 12,
      borderWidth: 2,
    }),
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.iconWarning,
    marginRight: 8,
  },
  realTimeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  repCounterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...(isWeb && {
      borderRadius: 16,
      marginHorizontal: 16,
      marginTop: 16,
      borderTopWidth: 0,
      paddingVertical: 30,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    }),
  },
  repCounterCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 8,
    ...(isWeb && {
      width: 120,
      height: 120,
      borderRadius: 60,
      shadowOpacity: 0.2,
      shadowRadius: 8,
    }),
  },
  repCounterNumber: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
    ...(isWeb && {
      fontSize: 52,
    }),
  },
  repCounterLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
    ...(isWeb && {
      fontSize: 18,
    }),
  },
  resultWrap: { 
    padding: 16,
    ...(isWeb && {
      paddingHorizontal: 24,
      paddingVertical: 20,
    }),
  },
  imageContainer: { 
    position: 'relative', 
    marginBottom: 12,
    ...(isWeb && {
      marginBottom: 16,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    }),
  },
  preview: { 
    width: '100%', 
    height: 220, 
    borderRadius: 16,
    ...(isWeb && {
      height: 300,
      objectFit: 'contain',
    }),
  },
  zoomHint: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    ...(isWeb && {
      cursor: 'pointer',
      width: 40,
      height: 40,
      bottom: 12,
      right: 12,
    }),
  },
  resultBox: { 
    backgroundColor: colors.card, 
    borderRadius: 16, 
    padding: 16, 
    shadowColor: colors.black, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3, 
    marginBottom: 12,
    ...(isWeb && {
      padding: 20,
      marginBottom: 16,
      shadowOpacity: 0.15,
      shadowRadius: 8,
    }),
  },
  resultTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginBottom: 8, 
    color: colors.text,
    ...(isWeb && {
      fontSize: 18,
      marginBottom: 12,
    }),
  },
  resultLine: { 
    fontSize: 14, 
    color: colors.text, 
    marginBottom: 4,
    ...(isWeb && {
      fontSize: 15,
      marginBottom: 6,
    }),
  },
  anglesContainer: { 
    marginTop: 8, 
    paddingTop: 8, 
    borderTopWidth: 1, 
    borderTopColor: colors.border,
    ...(isWeb && {
      marginTop: 12,
      paddingTop: 12,
    }),
  },
  anglesTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: colors.textSecondary, 
    marginBottom: 4,
    ...(isWeb && {
      fontSize: 15,
      marginBottom: 8,
    }),
  },
  legendBox: { 
    backgroundColor: colors.card, 
    borderRadius: 16, 
    padding: 16, 
    shadowColor: colors.black, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3,
    ...(isWeb && {
      padding: 20,
      shadowOpacity: 0.15,
      shadowRadius: 8,
    }),
  },
  legendTitle: { 
    fontSize: 14, 
    fontWeight: '700', 
    marginBottom: 8, 
    color: colors.text,
    ...(isWeb && {
      fontSize: 16,
      marginBottom: 12,
    }),
  },
  legendItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 6,
    ...(isWeb && {
      marginBottom: 8,
    }),
  },
  legendDot: { 
    width: 16, 
    height: 16, 
    borderRadius: 8, 
    marginRight: 8,
    ...(isWeb && {
      width: 18,
      height: 18,
      borderRadius: 9,
      marginRight: 10,
    }),
  },
  legendText: { 
    fontSize: 13, 
    color: colors.textSecondary,
    ...(isWeb && {
      fontSize: 14,
    }),
  },
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 24,
    ...(isWeb && {
      padding: 40,
    }),
  },
  permissionText: { 
    fontSize: 16, 
    color: colors.text, 
    marginBottom: 12,
    ...(isWeb && {
      fontSize: 18,
      marginBottom: 16,
      textAlign: 'center',
      maxWidth: 500,
    }),
  },
  primaryBtn: { 
    backgroundColor: colors.primary, 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderRadius: 16, 
    shadowColor: colors.black, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 4, 
    elevation: 3,
    ...(isWeb && {
      cursor: 'pointer',
      paddingHorizontal: 32,
      paddingVertical: 14,
      shadowOpacity: 0.2,
      shadowRadius: 8,
    }),
  },
  primaryBtnText: { 
    color: colors.textWhite, 
    fontWeight: '700',
    ...(isWeb && {
      fontSize: 16,
    }),
  },
  zoomContainer: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.95)', 
    justifyContent: 'center', 
    alignItems: 'center',
    ...(isWeb && {
      backgroundColor: 'rgba(0, 0, 0, 0.98)',
    }),
  },
  zoomCloseBtn: { 
    position: 'absolute', 
    top: 50, 
    right: 20, 
    zIndex: 1000, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    borderRadius: 20, 
    padding: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...(isWeb && {
      cursor: 'pointer',
      top: 30,
      right: 30,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'rgba(255, 107, 53, 0.9)',
    }),
  },
  zoomImageWrapper: { 
    width: SCREEN_WIDTH, 
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...(isWeb && {
      maxWidth: 1200,
      maxHeight: '90vh',
    }),
  },
  zoomImage: { 
    width: SCREEN_WIDTH, 
    height: SCREEN_HEIGHT,
    ...(isWeb && {
      maxWidth: 1200,
      maxHeight: '90vh',
      objectFit: 'contain',
    }),
  },
  zoomVisualizationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    ...(isWeb && {
      maxWidth: 1200,
      maxHeight: '90vh',
    }),
  }
});




