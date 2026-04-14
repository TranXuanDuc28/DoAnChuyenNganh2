import { StyleSheet, Dimensions, Platform } from 'react-native';
import colors from '../../theme/colors';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  main: {
    gap: 40,
  },

  // Floating Header
  headerOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Hero Section
  heroSection: {
    width: '100%',
    height: 520,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
  },
  playButtonContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -40,
    marginTop: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 121, 74, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroSubTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF794A',
    letterSpacing: 2,
  },

  // Pro Tip (Editorial Rust Color)
  proTipContainer: {
    backgroundColor: '#A33609',
    marginHorizontal: 24,
    borderRadius: 32,
    padding: 32,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#A33609',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  lightBulbIcon: {
    marginBottom: 16,
  },
  proTipLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  proTipText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
    fontWeight: '400',
  },

  // Execution
  executionContainer: {
    paddingHorizontal: 24,
    gap: 24,
  },
  executionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  tagBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 40,
    gap: 24,
  },
  stepNumberText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FF794A',
    width: 60,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  stepDesc: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
  },

  // Common Mistakes
  mistakesSection: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  mistakesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  mistakesTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    textTransform: 'uppercase',
  },
  mistakeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    marginBottom: 16,
    padding: 16,
  },
  mistakeImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#E2E8F0',
  },
  mistakeLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EF4444',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  mistakeDesc: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },

  // Footer Button
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 24,
    right: 24,
  },
  startBtn: {
    backgroundColor: '#FF794A',
    height: 64,
    borderRadius: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#FF794A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

