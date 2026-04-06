import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: 100, // Space for bottom nav
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF6B00',
    letterSpacing: 2,
    fontFamily: 'Roboto', // Assuming
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  moreButton: {
    padding: 8,
    marginRight: -8,
  },

  // Success Icon
  successIconContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  successIconBg: {
    width: 80,
    height: 80,
    marginTop: 25,
    borderRadius: 40,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successIconOuterRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
  },

  // Titles
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 50,
  },
  titleText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -1,
    lineHeight: 36,
  },

  // Plan Details Card
  planCard: {
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  planDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  planDetailsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  planNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    width: 160,
    lineHeight: 24,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF6B00',
  },
  paidStatus: {
    fontSize: 10,
    fontWeight: '800',
    color: '#374151',
    letterSpacing: 1,
    marginTop: 4,
  },
  billingDatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  // Membership Includes
  featuresContainer: {
    marginHorizontal: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 20,
  },
  featureItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  featureIcon: {
    marginBottom: 4,
  },
  featureText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.5,
  },

  // Actions
  actionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  getStartedButton: {
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  viewReceiptButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  viewReceiptText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Journey Banner
  journeyBannerContainer: {
    marginHorizontal: 24,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 40,
  },
  journeyBannerImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  journeyBannerOverlay: {
    padding: 20,
  },
  journeyBannerText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    lineHeight: 22,
  },

  // Mock Bottom Nav Bar (From previous screens)
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 4,
  },
  navItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemActiveCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: -20, // Elevate above the bar slightly
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  navItemActiveLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF6B00',
    marginTop: 4,
  },
});
