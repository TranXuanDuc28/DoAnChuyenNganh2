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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 224, 224, 0.3)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 16,
    color: '#FF6B00',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  moreButton: {
    padding: 8,
    marginRight: -8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 140, // Space for nav bar
  },
  // Step Sections Generic
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepBadge: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  stepBadgeText: {
    color: '#FF6B00',
    fontFamily: 'Lexend-Bold',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  stepTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 24,
    color: '#121212',
    fontWeight: 'bold',
  },
  // Order Summary Card
  summaryCard: {
    backgroundColor: '#F4F4F4',
    borderRadius: 16,
    padding: 24,
    marginBottom: 48,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  summaryPlanType: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    color: '#121212',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryPlanDesc: {
    fontFamily: 'Lexend-Regular',
    fontSize: 12,
    color: '#666666',
    maxWidth: '80%',
    lineHeight: 18,
  },
  summaryPrice: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 20,
    color: '#FF6B00',
    fontWeight: 'bold',
  },
  billingCycleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(224, 224, 224, 0.5)',
  },
  billingCycleLabel: {
    fontFamily: 'Lexend-Bold',
    fontSize: 10,
    color: '#666666',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  billingCycleValue: {
    fontFamily: 'Lexend-Bold',
    fontSize: 12,
    color: '#121212',
    fontWeight: 'bold',
  },
  // Payment Method Options
  paymentMethodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 48,
  },
  paymentMethodBtn: {
    width: (width - 48 - 24) / 3, // 3 columns, minus padding & gap
    backgroundColor: '#F4F4F4',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  paymentMethodBtnActive: {
    backgroundColor: 'rgba(255, 107, 0, 0.05)',
    borderColor: '#FF6B00',
  },
  paymentMethodLabel: {
    fontFamily: 'Lexend-Medium',
    fontSize: 10,
    color: '#666666',
    textTransform: 'uppercase',
    marginTop: 8,
  },
  paymentMethodLabelActive: {
    color: '#FF6B00',
    fontWeight: 'bold',
  },
  // Form Inputs
  formGroup: {
    marginBottom: 24,
    position: 'relative',
  },
  inputLabel: {
    position: 'absolute',
    top: -8,
    left: 4,
    fontFamily: 'Lexend-Bold',
    fontSize: 10,
    color: '#666666',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    zIndex: 1,
  },
  inputContainer: {
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  inputField: {
    flex: 1,
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 16,
    color: '#121212',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputGroup: {
    width: '47%',
  },
  // Bottom Action
  payButtonContainer: {
    marginTop: 32,
    marginBottom: 16,
    borderRadius: 9999,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  payButtonGradient: {
    borderRadius: 9999,
    paddingVertical: 18,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimerText: {
    fontFamily: 'Lexend-Regular',
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  disclaimerHighlight: {
    color: '#FF6B00',
    fontWeight: 'bold',
  },
  // Mock Bottom Nav Bar
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 24, // Safe area for iPhone
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(224, 224, 224, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemLabel: {
    fontFamily: 'Lexend-Medium',
    fontSize: 10,
    color: '#767575',
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
    marginTop: -20, // Pop up effect
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  navItemActiveLabel: {
    fontFamily: 'Lexend-Medium',
    fontSize: 10,
    color: '#FF6B00',
    marginTop: 4,
  }
});
