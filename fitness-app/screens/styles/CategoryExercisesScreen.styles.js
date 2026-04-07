import { StyleSheet, Platform, Dimensions } from 'react-native';
import colors from '../../theme/colors';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate 50
  },
  // --- Header ---
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 60 : 50,
    paddingBottom: 24,
    backgroundColor: '#F8FAFC',
  },
  backIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    color: '#FF794A',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginLeft: 8,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  // --- FlatList Content ---
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 120, // Space for FAB
  },

  // --- Hero Banner ---
  heroCard: {
    backgroundColor: '#111827', // Deep slate 900
    borderRadius: 36,
    padding: 24,
    paddingVertical: 32,
    minHeight: 200,
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 24,
  },
  heroBackgroundText: {
    position: 'absolute',
    top: 10,
    left: 10,
    fontSize: 120,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.04)',
    letterSpacing: 10,
    zIndex: 0,
  },
  heroContent: {
    zIndex: 1,
  },
  categoryBadge: {
    backgroundColor: '#FF794A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  heroDesc: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 20,
    width: '90%',
  },
  heroLinkContainer: {
    backgroundColor: 'rgba(200, 50, 20, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8, // Square-ish look according to original screenshot
    alignSelf: 'flex-start',
  },
  heroLinkText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    opacity: 0.8,
  },

  // --- Filters ---
  filtersContainer: {
    marginBottom: 32,
  },
  filterPill: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#E2E8F0', // Slate 200
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: '#FF794A', // Orange
    shadowColor: '#FF794A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  filterText: {
    color: '#475569', // Slate 600
    fontSize: 14,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // --- Exercise Card ---
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
  },
  exerciseCardImageContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  difficultyBadgeImage: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  difficultyBadgeTextImage: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exerciseInfo: {
    padding: 24,
  },
  exerciseName: {
    fontSize: 19,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 16,
    letterSpacing: -0.5,
    textTransform: 'uppercase', // Follows design
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 6,
  },

  // --- FAB ---
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF794A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF794A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },

  // --- Loading / Empty ---
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  errorContainer: {
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    marginTop: 16,
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '500',
  },
});
