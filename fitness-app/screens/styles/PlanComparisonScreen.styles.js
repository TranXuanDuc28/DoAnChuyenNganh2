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
    paddingBottom: 40,
  },
  
  // Hero Section
  mainHero: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 48,
    alignItems: 'flex-start',
    gap: 24,
  },
  heroHeading: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  titleText: {
    color: '#000000',
    fontSize: 48,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    lineHeight: 52,
    textTransform: 'uppercase',
  },
  titleHighlight: {
    color: colors.primary,
  },
  subtitleText: {
    color: '#555555',
    fontSize: 18,
    fontFamily: 'Lexend',
    lineHeight: 29.25,
    marginTop: 24,
  },

  // Comparison Grid
  comparisonGrid: {
    paddingHorizontal: 24,
    gap: 40,
    width: '100%',
  },
  
  // FREE TIER
  freeColumn: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(209, 209, 209, 0.4)',
    padding: 32,
    width: '100%',
  },
  tierHeader: {
    marginBottom: 40,
  },
  tierLabel: {
    color: '#555555',
    fontFamily: 'Space Grotesk',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  tierTitle: {
    color: '#000000',
    fontFamily: 'Space Grotesk',
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 48,
  },
  tierDescription: {
    color: '#555555',
    fontFamily: 'Lexend',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    marginTop: 8,
  },

  // Features List
  featuresList: {
    gap: 24,
  },
  featuresListPremium: {
    gap: 24,
  },
  featureItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIconBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleStandard: {
    backgroundColor: '#EEEEEE',
  },
  bubblePremium: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
  },
  bubbleDisabled: {
    backgroundColor: '#EEEEEE',
    opacity: 0.4,
  },
  featureText: {
    color: '#000000',
    fontFamily: 'Lexend',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    flexShrink: 1,
  },
  featureTextDisabled: {
    textDecorationLine: 'line-through',
    opacity: 0.4,
  },

  currentPlanBtn: {
    marginTop: 48,
    paddingVertical: 20,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(118, 117, 117, 0.4)',
    alignItems: 'center',
  },
  currentPlanText: {
    color: '#000000',
    fontFamily: 'Space Grotesk',
    fontSize: 14,
    fontWeight: '700',
  },

  // PREMIUM TIER
  premiumColumn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 0, 0.2)',
    padding: 32,
    width: '100%',
    shadowColor: 'rgba(255, 107, 0, 0.1)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 5,
    overflow: 'hidden',
  },
  premiumBlob: {
    position: 'absolute',
    top: -38,
    left: 180,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    zIndex: 0,
  },
  premiumLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierLabelPremium: {
    color: colors.primary,
    fontFamily: 'Space Grotesk',
    fontSize: 14,
    fontWeight: '700',
  },
  recommendedBadge: {
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  recommendedText: {
    color: '#FFFFFF',
    fontFamily: 'Space Grotesk',
    fontSize: 10,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  priceText: {
    color: '#000000',
    fontFamily: 'Space Grotesk',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
  },
  monthText: {
    color: '#555555',
    fontFamily: 'Lexend',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 6,
  },

  upgradeSection: {
    marginTop: 48,
    alignItems: 'center',
    gap: 16,
  },
  upgradeBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    borderRadius: 9999,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Space Grotesk',
    fontSize: 16,
    fontWeight: '700',
  },
  trialText: {
    color: '#555555',
    fontFamily: 'Lexend',
    fontSize: 10,
    fontWeight: '400',
  },

  // Slider Section
  featureSliderSection: {
    marginTop: 60,
  },
  sliderHeader: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sliderTitle: {
    color: '#000000',
    fontFamily: 'Space Grotesk',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
  },
  sliderContent: {
    paddingLeft: 24,
    paddingRight: 8, // extra padding for last item
  },
  sliderCard: {
    width: 300,
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginRight: 16,
  },
  sliderImage: {
    width: '100%',
    height: '100%',
  },
  sliderImageStyles: {
    resizeMode: 'cover',
  },
  sliderGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },
  sliderCardTitle: {
    color: '#FFFFFF',
    fontFamily: 'Space Grotesk',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  sliderCardDesc: {
    color: '#DDDDDD',
    fontFamily: 'Lexend',
    fontSize: 14,
    lineHeight: 20,
  },

  // Footer Options
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 60,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 30,
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
  }
});
