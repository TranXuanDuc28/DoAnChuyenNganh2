import { StyleSheet, Dimensions } from 'react-native';
import colors from '../../theme/colors';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F2F7',
  },
  // Header section
  headerContainer: {
    paddingTop: 18,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#F6F2F7',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#1B1B1E',
    lineHeight: 36,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 56,
    // Add border to match "outline" in HTML
    borderWidth: 1,
    borderColor: 'rgba(223, 192, 182, 0.1)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#58423B', // Match Placeholder color
  },
  barcodeIcon: {
    paddingLeft: 12,
  },
  // Tabs section
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    backgroundColor: '#F6F2F7',
    gap: 32,
  },
  tabItem: {
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: '#A8390D',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#A8390D',
  },
  // Main Content
  scrollContent: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingTop: 32,
  },
  // Quick Add Section
  quickAddSection: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Manrope',
    fontWeight: '700',
    color: '#1B1B1E',
  },
  viewAllText: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: '#A8390D',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  quickAddScroll: {
    // Allows items to fall off frame as per "overflow: hidden" in CSS
    overflow: 'visible',
  },
  quickAddItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 12,
    gap: 8,
    // HTML Shadows
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(223, 192, 182, 0.1)',
  },
  quickAddName: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#1B1B1E',
    lineHeight: 20,
  },
  quickAddIcon: {
    width: 12,
    height: 12,
    backgroundColor: '#A8390D',
    borderRadius: 2,
  },
  // Food List
  foodList: {
    paddingHorizontal: 24,
    gap: 16,
    paddingBottom: 120, // Enough space for floating footer
  },
  foodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    // HTML Shadows
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(223, 192, 182, 0.1)',
  },
  selectedCard: {
    backgroundColor: 'rgba(255, 219, 208, 0.30)',
    borderColor: 'transparent',
  },
  foodInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  foodImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E4E1E6',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  foodTextDetails: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontFamily: 'Manrope',
    fontWeight: '700',
    color: '#1B1B1E',
    lineHeight: 24,
  },
  foodMeta: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#58423B',
    lineHeight: 20,
  },
  foodMacros: {
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: 'rgba(88, 66, 59, 0.60)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    lineHeight: 15,
    paddingTop: 4,
  },
  selectedMacros: {
    color: '#A8390D',
  },
  addIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAE7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedAddButton: {
    backgroundColor: '#A8390D',
    // HTML Shadows for active button
    shadowColor: '#A8390D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  // Floating Footer
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 24,
    // Gradient simulated with background and alpha
    backgroundColor: 'rgba(251, 248, 252, 0.95)',
  },
  footerButton: {
    backgroundColor: '#FF7849',
    borderRadius: 24,
    height: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    // Floating style shadows
    shadowColor: '#FF7849',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  footerButtonText: {
    fontSize: 16,
    fontFamily: 'Manrope',
    fontWeight: '700',
    color: '#681C00',
    lineHeight: 24,
  },
  footerDot: {
    fontSize: 16,
    fontFamily: 'Manrope',
    fontWeight: '700',
    color: '#681C00',
    opacity: 0.4,
  },
  footerKcal: {
    fontSize: 16,
    fontFamily: 'Manrope',
    fontWeight: '700',
    color: '#681C00',
    lineHeight: 24,
  },

});
