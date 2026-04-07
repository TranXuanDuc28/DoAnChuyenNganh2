import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

const fitlifeColors = {
  brandOrange: '#A8390D',
  accentOrange: '#FF7849',
  softBackground: '#F6F2F7',
  accentPeach: '#FFDBD0',
  onyx: '#1B1B1E',
  grayText: '#5E5E5E',
  white: '#FFFFFF',
  borderLight: '#EAE7EB',
  darkBurgundy: '#681C00',
  brownText: '#8C7169',
  peachDeep: '#FFE8E1',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: fitlifeColors.white,
  },
  scrollContent: {
    paddingBottom: 60,
  },

  // --- HEADER / BACK BUTTON ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: fitlifeColors.white,
    paddingTop: Platform.OS === 'ios' ? 10 : 10,
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: fitlifeColors.softBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: fitlifeColors.onyx,
    fontFamily: 'Manrope',
  },

  // --- MAIN CONTENT WRAPPER ---
  mainWrapper: {
    alignSelf: 'stretch',
    paddingTop: 16,
    paddingHorizontal: 24,
  },

  // --- PREMIUM SUMMARY CARD ---
  summaryCard: {
    alignSelf: 'stretch',
    padding: 32,
    position: 'relative',
    backgroundColor: fitlifeColors.peachDeep,
    overflow: 'hidden',
    borderRadius: 32,
    shadowColor: fitlifeColors.brandOrange,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    zIndex: 10,
  },
  sessionInfo: {
    flexDirection: 'column',
    gap: 4,
  },
  sessionTag: {
    fontSize: 10,
    fontWeight: '700',
    color: fitlifeColors.brandOrange,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'Inter',
  },
  sessionName: {
    fontSize: 30,
    fontWeight: '800',
    color: fitlifeColors.darkBurgundy,
    lineHeight: 36,
    fontFamily: 'Manrope',
    width: 180,
  },
  eliteBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eliteText: {
    fontSize: 10,
    fontWeight: '700',
    color: fitlifeColors.brandOrange,
    fontFamily: 'Inter',
  },

  // --- STATS GRID ---
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  statBlock: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 30,
    fontWeight: '800',
    color: fitlifeColors.brandOrange,
    lineHeight: 36,
    fontFamily: 'Manrope',
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: fitlifeColors.brownText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Inter',
  },

  // --- DECORATIVE BLOBS ---
  blurBlob: {
    width: 192,
    height: 192,
    position: 'absolute',
    right: -48,
    top: -48,
    backgroundColor: 'rgba(255, 120, 73, 0.15)',
    borderRadius: 99,
  },

  // --- EXERCISE BREAKDOWN SECTION ---
  breakdownSection: {
    marginTop: 40,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  breakdownTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: fitlifeColors.onyx,
    fontFamily: 'Manrope',
  },
  exerciseCount: {
    fontSize: 14,
    fontWeight: '700',
    color: fitlifeColors.brandOrange,
    fontFamily: 'Inter',
  },

  // --- EXERCISE CARDS ---
  exerciseList: {
    flexDirection: 'column',
    gap: 16,
  },
  exerciseCard: {
    alignSelf: 'stretch',
    padding: 24,
    backgroundColor: '#FBF8FC',
    borderRadius: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(168, 57, 13, 0.05)',
  },
  exerciseMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: fitlifeColors.accentPeach,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleInactive: {
    backgroundColor: '#F1F5F9',
  },
  exerciseInfo: {
    flexDirection: 'column',
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '800',
    color: fitlifeColors.onyx,
    fontFamily: 'Manrope',
    marginBottom: 4,
  },
  exerciseSets: {
    fontSize: 13,
    fontWeight: '600',
    color: fitlifeColors.brownText,
    fontFamily: 'Inter',
    opacity: 0.8,
  },
  chevron: {
    opacity: 0.4,
    marginLeft: 12,
  },
});
