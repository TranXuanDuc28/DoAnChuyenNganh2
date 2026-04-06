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
    paddingBottom: 120, // extra padding for floating bottom section
  },
  
  // Hero Section
  heroSection: {
    width: '100%',
    height: 500,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImageStyle: {
    resizeMode: 'cover',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },
  heroContent: {
    alignItems: 'flex-start',
    gap: 8,
  },
  labelContainer: {
    backgroundColor: 'rgba(255, 115, 21, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  labelText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    fontFamily: 'Space Grotesk',
  },
  titleLine1: {
    color: '#000000',
    fontSize: 52,
    fontFamily: 'Space Grotesk',
    fontWeight: '900',
    lineHeight: 52,
  },
  titleLine2: {
    color: '#000000',
    fontSize: 52,
    fontFamily: 'Space Grotesk',
    fontWeight: '900',
    lineHeight: 52,
  },
  titleHighlight: {
    color: colors.primary,
  },
  heroSubtitle: {
    color: '#555555',
    fontSize: 15,
    fontFamily: 'Lexend',
    lineHeight: 24,
    marginTop: 12,
  },

  // Features List
  featuresList: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  
  // Feature Card
  cardContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  cardContainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
  },
  cardHeader: {
    alignItems: 'flex-start',
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardTitle: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Space Grotesk',
    marginTop: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  cardDescription: {
    color: '#666666',
    fontSize: 14,
    fontFamily: 'Lexend',
    lineHeight: 22,
  },
  
  // Row Format Additions
  rowContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowTextContent: {
    flex: 1,
    paddingRight: 16,
  },
  rowTitle: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Space Grotesk',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  rowDescription: {
    color: '#666666',
    fontSize: 12,
    fontFamily: 'Lexend',
    lineHeight: 18,
  },

  // Floating Bottom Section
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 18,
    borderRadius: 9999,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Space Grotesk',
    letterSpacing: 0.5,
  },
  secureCheckoutText: {
    color: '#999999',
    fontSize: 11,
    fontFamily: 'Lexend',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '600',
  }
});

