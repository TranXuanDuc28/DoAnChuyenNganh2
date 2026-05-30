import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F97316',
    letterSpacing: 1,
  },
  menuButton: {
    padding: 5,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  progressContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRing: {
    position: 'absolute',
  },
  progressTextContainer: {
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  progressValue: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1E293B',
    marginVertical: 4,
  },
  progressUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  progressGoal: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0EA5E9',
  },
  quickAddSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  quickAddCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  quickAddIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickAddValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  quickAddLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  logSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  viewTrendsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A8390D',
  },
  logEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  entryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  entryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  entrySubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  entryTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  tipCard: {
    marginHorizontal: 20,
    backgroundColor: '#F97316',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  tipContent: {
    flex: 1,
    zIndex: 1,
  },
  tipTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  tipDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  tipWaterDrop: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.5,
  },
});
