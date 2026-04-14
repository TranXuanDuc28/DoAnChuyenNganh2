import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F9', // Light gray background from UIDL
  },
  // --- Header ---
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 60 : 50,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  brandText: {
    color: '#FF6B35',
    fontSize: 20,
    fontWeight: '900',
    marginLeft: 8,
    letterSpacing: 1,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150,
  },

  // --- Hero Section ---
  heroSection: {
    width: '100%',
    height: 460,
    backgroundColor: '#000',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 24,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  strengthTag: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginRight: 12,
  },
  strengthTagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  workoutTitle: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: '900',
    textTransform: 'uppercase',
    lineHeight: 44,
    letterSpacing: -1,
  },

  // --- Objective Card ---
  objectiveContainer: {
    marginTop: 30, // Pull up over hero
    paddingHorizontal: 24,
  },
  objectiveCard: {
    backgroundColor: '#FFF',
    borderRadius: 40,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF6B35',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 1,
  },
  objectiveBody: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
    fontWeight: '500',
  },
  highlightText: {
    color: '#111827',
    fontWeight: '700',
  },

  // --- Intensity & Focus Area ---
  intensitySection: {
    padding: 24,
  },
  intensityCard: {
    backgroundColor: '#E5E7EB',
    borderRadius: 30,
    padding: 24,
  },
  intensityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  intensityLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    width: 80,
  },
  intensityBarContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  intensityBar: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  intensityBarActive: {
    backgroundColor: '#FF6B35',
  },
  focusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  focusTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  focusTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111827',
    textTransform: 'uppercase',
  },

  // --- Equipment ---
  equipmentSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  equipmentHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    textTransform: 'uppercase',
  },
  itemCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#923512',
    marginLeft: 8,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  equipmentItem: {
    width: (width - 60) / 2,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  equipmentIcon: {
    marginBottom: 12,
  },
  equipmentName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  // --- The Program ---
  programSection: {
    paddingHorizontal: 24,
  },
  exerciseCard: {
    backgroundColor: '#FFF',
    borderRadius: 32,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseThumb: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: '#000',
  },
  exerciseInfo: {
    flex: 1,
    paddingHorizontal: 16,
  },
  exerciseTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    textTransform: 'uppercase',
    flex: 1,
  },
  exerciseNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF6B35',
    opacity: 0.8,
  },
  exerciseStats: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
  },
  exerciseTip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseTipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#923512',
    textTransform: 'uppercase',
    marginLeft: 4,
  },

  // --- Footer ---
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  startBtn: {
    backgroundColor: '#FF6B35',
    height: 70,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  startBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginRight: 10,
  },
});
