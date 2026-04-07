import { StyleSheet, Dimensions } from 'react-native';
import colors from '../../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 120, // Space for footer
  },
  // Banner Image
  imageBanner: {
    width: SCREEN_WIDTH,
    height: 397,
    backgroundColor: '#E4E1E6',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 96,
    // Linear gradient background handled in component via View/Styles if needed
    // or just a solid alpha for now
  },
  // Header Buttons
  headerActions: {
    position: 'absolute',
    top: 48,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFE8E1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  // Main Content
  mainContent: {
    paddingHorizontal: 24,
    marginTop: -48, // Overlap with image gradient
    gap: 32,
  },
  // Title Section
  titleSection: {
    gap: 8,
  },
  categoryLabel: {
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#A8390D',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  foodName: {
    flex: 1,
    fontSize: 32,
    fontFamily: 'Manrope',
    fontWeight: '800',
    color: '#1B1B1E',
    lineHeight: 40,
    marginRight: 16,
  },
  calorieGroup: {
    alignItems: 'flex-end',
  },
  calorieValue: {
    fontSize: 32,
    fontFamily: 'Manrope',
    fontWeight: '800',
    color: '#A8390D',
    lineHeight: 40,
  },
  calorieLabel: {
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#5E5E5E',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  // Macro Progress Cards
  macrosSection: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  macroCard: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0EDF1',
    alignItems: 'center',
  },
  macroHeader: {
    alignItems: 'center',
    marginBottom: 8,
    gap: 2,
  },
  macroLabel: {
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#5E5E5E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  macroValue: {
    fontSize: 18,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#1B1B1E',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F0EDF1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  // Portion Control
  portionSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#5E5E5E',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  portionControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F6F2F7',
    borderRadius: 48,
    padding: 8,
  },
  portionButton: {
    width: 56,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  portionDisplay: {
    alignItems: 'center',
  },
  portionValue: {
    fontSize: 24,
    fontFamily: 'Manrope',
    fontWeight: '900',
    color: '#1B1B1E',
  },
  portionLabel: {
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: '#5E5E5E',
    textTransform: 'uppercase',
  },
  // Nutrition Facts List
  nutritionFactsSection: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0EDF1',
    gap: 24,
  },
  factsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factsTitle: {
    fontSize: 20,
    fontFamily: 'Manrope',
    fontWeight: '700',
    color: '#1B1B1E',
  },
  factsSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#5E5E5E',
  },
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(234, 231, 235, 0.5)',
  },
  factLabel: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#58423B',
  },
  factValue: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#1B1B1E',
  },
  // Badges
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    // Blur effect handled in component
  },
  addButton: {
    height: 64,
    backgroundColor: '#FF7849',
    borderRadius: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#A8390D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 18,
    fontFamily: 'Inter',
    fontWeight: '800',
    color: '#681C00',
  },
});
