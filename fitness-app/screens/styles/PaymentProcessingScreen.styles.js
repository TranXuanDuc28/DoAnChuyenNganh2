import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 224, 224, 0.3)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B00',
    textTransform: 'uppercase',
  },
  moreButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  
  // Loading Circle Section
  loadingContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingCircleBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 107, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#F5F5F5',
  },
  loadingCircleProgress: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#FF6B00',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '-45deg' }],
  },
  
  // Text Section
  titleText: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  subtitleText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#767575',
    marginBottom: 48,
  },

  // Info Card Section
  infoCard: {
    width: '100%',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  infoRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 224, 224, 0.5)',
    marginBottom: 20,
  },
  infoLabelTop: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    color: '#767575',
    letterSpacing: 1.5,
  },
  infoValueTop: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  infoRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  infoLabelBottom: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    color: '#767575',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  infoPrice: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -1,
  },
  secureBadge: {
    alignItems: 'flex-end',
  },
  secureText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    color: '#FF6B00',
    letterSpacing: 1,
    marginBottom: 4,
  },

  // Security Badge Button
  securityButton: {
    width: '100%',
    backgroundColor: '#E85D04',
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  securityButtonText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginLeft: 8,
  },

  // Mock Bottom Navigation Bar
  bottomNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navItem: {
    alignItems: 'center',
  },
  navItemLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#767575',
    marginTop: 4,
    fontWeight: '500',
  },
  navItemActive: {
    alignItems: 'center',
    marginTop: -20,
  },
  navItemActiveCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  navItemActiveLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#FF6B00',
    fontWeight: '600',
  },
});
