import { StyleSheet, Dimensions } from 'react-native';
import colors from '../../theme/colors';

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
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  headerButton: {
    padding: 5,
  },
  headerTitle: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1,
    fontFamily: 'Space Grotesk',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 150, // Space for the floating CTA
  },
  
  // Hero Section
  mainHero: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    alignItems: 'flex-start',
    gap: 16,
  },
  heroHeading: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  titleText: {
    color: '#000000',
    fontSize: 36,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    lineHeight: 40,
    textTransform: 'uppercase',
  },
  titleHighlight: {
    color: colors.primary,
  },
  subtitleText: {
    color: '#666666',
    fontSize: 16,
    fontFamily: 'Lexend',
    lineHeight: 24,
    marginTop: 8,
  },

  // Plan Selection Grid
  planSelectionGrid: {
    paddingHorizontal: 24,
    gap: 16,
    width: '100%',
  },
  
  // Standard Plan Card (Monthly & Lifetime)
  planCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(209, 209, 209, 0.5)',
    padding: 24,
    width: '100%',
    gap: 16,
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.03)',
  },

  // Yearly Plan (Best Value)
  planCardYearly: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(209, 209, 209, 0.5)',
    padding: 24,
    width: '100%',
    gap: 20,
    position: 'relative',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 8,
    overflow: 'hidden',
    paddingTop: 36,
  },
  planCardYearlySelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 0, 0.03)',
    shadowColor: 'rgba(255, 107, 0, 0.1)',
  },
  bestValueBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 12,
  },
  bestValueText: {
    color: '#FFFFFF',
    fontFamily: 'Lexend',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  // Plan Headers
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  planBadgeText: {
    color: '#666666',
    fontFamily: 'Lexend',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  planBadgeTextOrange: {
    color: colors.primary,
    fontFamily: 'Lexend',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  planTitleText: {
    color: '#000000',
    fontFamily: 'Space Grotesk',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  planPriceCol: {
    alignItems: 'flex-end',
  },
  planPriceText: {
    color: '#000000',
    fontFamily: 'Space Grotesk',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
  },
  planPriceTextOrange: {
    color: colors.primary,
    fontFamily: 'Space Grotesk',
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 40,
  },
  planPeriodText: {
    color: '#666666',
    fontFamily: 'Lexend',
    fontSize: 10,
    fontWeight: '400',
    marginTop: 4,
  },

  // Plan Features
  planFeatureList: {
    gap: 12,
  },
  planFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planFeatureText: {
    color: '#666666',
    fontFamily: 'Lexend',
    fontSize: 14,
    fontWeight: '400',
  },
  planFeatureTextDark: {
    color: '#000000',
    fontFamily: 'Lexend',
    fontSize: 14,
    fontWeight: '500',
  },

  yearlyFooterBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(209, 209, 209, 0.3)',
    paddingTop: 16,
    marginTop: 4,
  },
  yearlyFooterText: {
    color: '#666666',
    fontFamily: 'Lexend',
    fontSize: 10,
    lineHeight: 15,
  },

  // Trust Image Section
  trustImageSection: {
    height: 200,
    marginTop: 32,
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  trustImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
  },
  trustImageGradient: {
    flex: 1,
  },

  // Footer Options
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 32,
    paddingBottom: 20,
  },
  footerMenu: {
    alignItems: 'center',
    gap: 8,
  },
  footerMenuText: {
    fontFamily: 'Space Grotesk',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#666666',
  },

  // Floating Bottom Section
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32, // safe area offset could be applied here
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(209, 209, 209, 0.2)',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  secureCheckoutText: {
    color: '#666666',
    fontFamily: 'Lexend',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 16,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 9999,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Space Grotesk',
    fontSize: 16,
    fontWeight: '700',
  }
});
