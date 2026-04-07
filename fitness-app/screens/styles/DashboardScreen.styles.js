import { StyleSheet, Dimensions, Platform } from 'react-native';
import colors from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F9',
    ...(isWeb && {
      maxWidth: 600,
      marginHorizontal: 'auto',
      width: '100%',
    }),
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 60 : 60,
    paddingHorizontal: 24,
    paddingBottom: 60, // Extra padding for bottom navigation
  },
  // --- Top Header ---
  topHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  topLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  brandText: {
    color: '#FF794A',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  notificationIconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  // --- Welcome Section ---
  headerContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  statusSubtitle: {
    color: '#FF794A',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  welcomeTitle: {
    color: '#2C2F31',
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 46,
    width: '80%', // Leave space for the robot button
  },
  robotButtonContainer: {
    position: 'absolute',
    top: 5,
    right: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF794A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF794A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },

  // --- Top Stats (Streak & Workouts) ---
  topStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 16,
  },
  topStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  topStatIconContainer: {
    marginBottom: 16,
  },
  topStatTitle: {
    color: '#717578',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  topStatValue: {
    color: '#2C2F31',
    fontSize: 32,
    fontWeight: '900',
  },

  // --- Your Pulse Gradient Card ---
  pulseCardContainer: {
    marginTop: 32,
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#A43609',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  pulseCardInner: {
    padding: 32,
  },
  pulseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pulseTitle: {
    color: '#FFEFEB',
    fontSize: 26,
    fontWeight: '900',
  },
  pulseSubtitle: {
    color: 'rgba(255, 239, 235, 0.7)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  pulseIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    justifyContent: 'space-between',
  },
  pulseRingsContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pulseStatsCol: {
    flex: 1,
    marginLeft: 32,
  },
  pulseStatBlock: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  pulseStatBlockNoBorder: {
    paddingVertical: 10,
    borderBottomWidth: 0,
  },
  pulseStatLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  pulseStatValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pulseStatValue: {
    color: '#FFEFEB',
    fontSize: 22,
    fontWeight: '900',
  },
  pulseStatUnit: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },

  // --- Section Headers ---
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 48,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#2C2F31',
    fontSize: 24,
    fontWeight: '900',
  },
  viewAllText: {
    color: '#FF794A',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    borderBottomWidth: 2,
    borderBottomColor: '#FF794A',
    paddingBottom: 2,
    letterSpacing: 0.5,
  },
  biometricsAddCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF794A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF794A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  // --- Daily Challenge Image Card ---
  challengeCard: {
    height: 280,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  challengeImageCover: {
    width: '100%',
    height: '100%',
  },
  challengeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
    padding: 24,
  },
  liveBadge: {
    backgroundColor: '#FF794A',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  challengeTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 36,
    marginBottom: 12,
  },
  challengeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  challengeMetaText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },

  // --- Recommendation Section ---
  recommendationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'flex-end',
    padding: 24,
  },
  recommendationBadge: {
    backgroundColor: '#FF794A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  recommendationBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recommendationTitle: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 42,
    marginBottom: 12,
    letterSpacing: -1,
  },
  recommendationSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    fontWeight: '500',
  },

  // --- Biometrics Section ---
  biometricsGridRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  bioCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  bioCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  bioIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bioBadgeLiveText: {
    color: '#D92D20',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  bioLabel: {
    color: '#8E9295',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  bioValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bioValueNum: {
    color: '#2C2F31',
    fontSize: 32,
    fontWeight: '900',
  },
  bioValueUnit: {
    color: '#8E9295',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F0F2F5',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#FF794A',
    borderRadius: 3,
  },

  // Hydration Card (Full Width)
  bioFullCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  bioHydrationInfo: {
    flex: 1,
    marginLeft: 16,
  },
  bioHydrationAddPill: {
    backgroundColor: '#E2E6EC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bioHydrationAddText: {
    color: '#2C2F31',
    fontSize: 12,
    fontWeight: '800',
  },
});
