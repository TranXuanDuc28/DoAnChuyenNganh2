import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const fitlifeColors = {
  brandOrange: '#A8390D',
  accentOrange: '#FF7849',
  softBackground: '#F6F2F7',
  accentPeach: '#FFE8E1',
  onyx: '#1B1B1E',
  grayText: '#5E5E5E',
  white: '#FFFFFF',
  borderLight: 'rgba(223, 192, 182, 0.20)',
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  success: '#16A34A',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: fitlifeColors.white,
    ...(isWeb && {
      maxWidth: 600,
      marginHorizontal: 'auto',
      width: '100%',
    }),
  },
  // Header
  header: {
    height: 100,
    backgroundColor: fitlifeColors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    borderBottomRightRadius: 37,
    borderBottomLeftRadius: 37,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 100,
  },
  backButton: {
    width: 32,
    height: 32,
    backgroundColor: fitlifeColors.brandOrange,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: fitlifeColors.brandOrange,
    fontFamily: Platform.OS === 'ios' ? 'Manrope' : 'sans-serif-medium',
  },
  
  // Calendar Section
  calendarContainer: {
    height: 140,
    backgroundColor: fitlifeColors.white,
    paddingTop: 10,
  },
  calendarList: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  dayCapsule: {
    width: 64,
    height: 82,
    backgroundColor: fitlifeColors.softBackground,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dayCapsuleSelected: {
    backgroundColor: fitlifeColors.accentOrange,
    shadowColor: fitlifeColors.accentOrange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  dayCapsuleCompleted: {
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  dayName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A1A1AA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dayNameSelected: {
    color: '#681C00',
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: fitlifeColors.onyx,
  },
  dateNumberSelected: {
    color: fitlifeColors.white,
  },
  todayIndicator: {
    width: 4,
    height: 4,
    backgroundColor: fitlifeColors.white,
    borderRadius: 2,
    marginTop: 4,
  },

  // Main Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  // Day Info Card
  dayHeaderCard: {
    backgroundColor: fitlifeColors.softBackground,
    borderRadius: 32,
    padding: 32,
    marginTop: 10,
    marginBottom: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(168, 57, 13, 0.10)',
    borderRadius: 9999,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: fitlifeColors.brandOrange,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dayTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: fitlifeColors.onyx,
    lineHeight: 32,
    marginBottom: 8,
  },
  dayDescription: {
    fontSize: 14,
    color: fitlifeColors.grayText,
    lineHeight: 20,
    marginBottom: 24,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  playButton: {
    width: 33.45,
    height: 48,
    backgroundColor: fitlifeColors.white,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Day Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(223, 192, 182, 0.10)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconBox: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: fitlifeColors.onyx,
    lineHeight: 20,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: fitlifeColors.grayText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Exercise List Sections
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: fitlifeColors.brandOrange,
    marginBottom: 16,
    marginLeft: 4,
  },
  
  // Exercise Item Card
  exerciseItem: {
    flexDirection: 'row',
    backgroundColor: fitlifeColors.accentPeach,
    borderRadius: 32,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 120, 73, 0.10)',
  },
  exerciseItemCompleted: {
    opacity: 0.6,
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 16,
  },
  exerciseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  exerciseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(168, 57, 13, 0.10)',
    borderRadius: 9999,
  },
  exerciseBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: fitlifeColors.brandOrange,
    textTransform: 'uppercase',
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '800',
    color: fitlifeColors.brandOrange,
    lineHeight: 28,
    marginBottom: 8,
  },
  exerciseStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  exerciseStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exerciseStatText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3F3F46',
    textTransform: 'uppercase',
  },
  exerciseImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#E4E4E7',
  },

  // Footer area
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 32,
    paddingTop: 16,
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 20,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(102, 161, 85, 0.8)',
    height: 54,
    borderRadius: 21,
    gap: 12,
  },
  completeButtonText: {
    color: fitlifeColors.white,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 36,
  },

  // Loading / Empty
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    color: fitlifeColors.grayText,
  },
  
  // Rest day
  restDayCard: {
    backgroundColor: fitlifeColors.softBackground,
    borderRadius: 32,
    padding: 40,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: fitlifeColors.borderLight,
    marginTop: 20,
  },
  restDayTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: fitlifeColors.brandOrange,
    marginTop: 16,
    marginBottom: 8,
  },
  restDayText: {
    fontSize: 16,
    color: fitlifeColors.grayText,
    textAlign: 'center',
    lineHeight: 24,
  },
});
