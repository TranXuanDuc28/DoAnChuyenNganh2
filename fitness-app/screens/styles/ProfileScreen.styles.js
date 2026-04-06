import { StyleSheet, Platform } from 'react-native';
import colors from '../../theme/colors';

const isWeb = Platform.OS === 'web';

const localColors = {
  background: '#ffffff', // The image has a clean white background
  card: '#ffffff',
  cardDark: '#1c1917', // dark stone color for nutrition card
  border: '#f0f0f0',
  text: '#111827', // darker text for headings
  textSecondary: '#6b7280', // gray
  primary: '#ff794a', // Orange from the HTML KINETIC
  primaryLight: '#ffc3be',
  danger: '#fee2e2', // light red for logout background
  dangerText: '#ef4444',
  dangerBorder: '#fca5a5',
  white: '#ffffff',
  chipActive: '#ff794a',
  chipActiveText: '#ffffff',
  chipInactive: '#e5e7eb', // gray-200
  chipInactiveText: '#374151',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: localColors.background,
    ...(isWeb && {
      maxWidth: 1200,
      marginHorizontal: 'auto',
      width: '100%',
    }),
  },
  scrollContent: {
    paddingBottom: 10, // Space for bottom nav and bounce
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 60 : 50,
    paddingBottom: 10,
    backgroundColor: localColors.background,
  },
  headerLogoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: localColors.primary,
    fontStyle: 'italic',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  headerIconBtn: {
    padding: 8,
  },

  // Profile Header section
  profileHeader: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  profileAvatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBorder: {
    padding: 4,
    borderRadius: 75,
    backgroundColor: localColors.primaryLight,
    marginBottom: 16,
    position: 'relative',
  },
  profileAvatarInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: localColors.white,
    overflow: 'hidden',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: localColors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: localColors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '900',
    color: localColors.text,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  profileEmail: {
    fontSize: 15,
    color: localColors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 20,
  },
  editProfileBtnFull: {
    backgroundColor: localColors.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '85%',
    shadowColor: localColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  editProfileTextFull: {
    color: localColors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Edit fields inside Profile Header
  nameInputRow: {
    flexDirection: 'row',
    gap: 12,
    width: '85%',
    marginBottom: 20,
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: localColors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: localColors.background,
    fontSize: 16,
    fontWeight: '600',
    color: localColors.text,
  },

  // Bento layout
  bentoContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  card: {
    backgroundColor: localColors.card,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.02,
    shadowRadius: 40,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardFlexRatio: {
    flex: 1,
  },
  cardDark: {
    backgroundColor: localColors.cardDark,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  cardOrange: {
    backgroundColor: localColors.primary,
    borderRadius: 24,
    padding: 24,
    shadowColor: localColors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 6,
    justifyContent: 'space-between',
  },

  // Card Headers
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: localColors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  cardHeaderTitleWhite: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  cardHeaderTitleDark: {
    fontSize: 11,
    fontWeight: '900',
    color: '#9ca3af',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // Specific Cards - Personal Info
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: localColors.border,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '900',
    color: localColors.text,
  },
  infoInput: {
    borderWidth: 1,
    borderColor: localColors.border,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 16,
    fontWeight: '700',
    color: localColors.text,
    backgroundColor: '#fafafa',
    textAlign: 'right',
    minWidth: 80,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: localColors.border,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  actionBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: localColors.text,
  },

  // Fitness Level
  fitnessLevelText: {
    fontSize: 28,
    fontWeight: '900',
    color: localColors.white,
    textTransform: 'uppercase',
    fontStyle: 'italic',
    letterSpacing: -1,
    marginBottom: 4,
  },
  fitnessLevelSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffe4e6', // lighter text for contrast
  },
  levelSelector: {
    flexDirection: 'column',
    gap: 8,
  },
  levelOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  levelOptionSelected: {
    backgroundColor: localColors.white,
  },
  levelOptionText: {
    color: localColors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  levelOptionTextSelected: {
    color: localColors.primary,
  },

  // Fitness Goals
  goalsHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  goalsHeaderRight: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalsHeaderRightText: {
    fontSize: 10,
    fontWeight: '800',
    color: localColors.text,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: localColors.chipInactive,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  chipSelected: {
    backgroundColor: localColors.primaryLight, // using primary-container color conceptually
    shadowColor: localColors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  chipSelectedActive: {
    backgroundColor: localColors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '800',
    color: localColors.chipInactiveText,
  },
  chipTextSelected: {
    color: '#9f1239', // darker red/orange text
  },
  chipTextSelectedActive: {
    color: localColors.white,
  },

  // Nutrition Card
  nutritionDecor: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,121,74,0.15)', // blur applied conceptually
  },
  nutritionGrid: {
    flexDirection: 'column',
    gap: 24,
  },
  nutritionGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
  },
  nutritionCol: {
    flex: 1,
  },
  nutritionLabelDark: {
    fontSize: 10,
    fontWeight: '900',
    color: localColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  focusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  focusIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#292524', // stone-800
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: localColors.white,
    marginBottom: 2,
  },
  focusSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  restrictionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  restrictionChip: {
    borderWidth: 1,
    borderColor: '#44403c', // stone-700
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#292524',
  },
  restrictionText: {
    fontSize: 11,
    fontWeight: '600',
    color: localColors.white,
  },
  darkInput: {
    backgroundColor: '#292524',
    color: localColors.white,
    borderWidth: 1,
    borderColor: '#44403c',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    marginBottom: 10,
  },

  // Actions
  logoutBtnContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 40,
  },
  logoutBtn: {
    backgroundColor: localColors.danger,
    paddingVertical: 18,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: localColors.dangerBorder,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '900',
    color: localColors.dangerText,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Save / Cancel controls at bottom or top
  saveCancelContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: localColors.primary,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  saveText: {
    color: localColors.white,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: localColors.card,
    borderWidth: 1,
    borderColor: localColors.border,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  cancelText: {
    color: localColors.textSecondary,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Premium Banner
  premiumBanner: {
    backgroundColor: localColors.primary,
    borderRadius: 24,
    padding: 24,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  premiumBannerTextContainer: {
    flex: 1,
    zIndex: 1,
  },
  premiumTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  premiumTitle: {
    color: localColors.white,
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  premiumSub: {
    color: localColors.white,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
    lineHeight: 18,
  },
  premiumDecor: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    opacity: 0.2,
  },

  // Modal classes
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: localColors.card,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: localColors.text,
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  modalLabel: {
    fontSize: 12,
    color: localColors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  currentValue: {
    fontSize: 15,
    color: localColors.text,
    marginBottom: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: localColors.border,
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: localColors.text,
    borderWidth: 1,
    borderColor: localColors.border,
    marginBottom: 8,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#fafafa',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: localColors.border,
  },
  modalCancelText: {
    color: localColors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: localColors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalSaveText: {
    color: localColors.white,
    fontSize: 15,
    fontWeight: '800',
  },

  // --- Edit Profile Layout Styles ---
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 60 : 50,
    paddingBottom: 20,
    backgroundColor: localColors.background,
  },
  editHeaderCancel: {
    fontSize: 12,
    fontWeight: '800',
    color: localColors.textSecondary,
    textTransform: 'uppercase',
  },
  editHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: localColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  editHeaderSaveBtn: {
    backgroundColor: localColors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editHeaderSaveText: {
    color: localColors.white,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  editProfileInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  editAvatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  editAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: localColors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: localColors.white,
  },
  editName: {
    fontSize: 32,
    fontWeight: '900',
    color: localColors.text,
  },
  editMemberSince: {
    fontSize: 10,
    fontWeight: '900',
    color: localColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 8,
  },
  editFormContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  editSmallInputGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editInputGroup: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: localColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginLeft: 16,
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#f1f3f5',
    borderRadius: 99,
    paddingHorizontal: 24,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '600',
    color: localColors.text,
  },
  editSectionContainer: {
    marginBottom: 32,
  },
  editSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginLeft: 16,
  },
  editSectionLine: {
    width: 24,
    height: 3,
    backgroundColor: localColors.primary,
    marginRight: 8,
  },
  editSectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: localColors.text,
  },
  editCardGray: {
    backgroundColor: '#f1f3f5',
    borderRadius: 32,
    padding: 24,
  },
  editRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  editGrayLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#868e96',
  },
  editValueText: {
    fontSize: 14,
    fontWeight: '900',
    color: localColors.text,
  },
  editToggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editTogglePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
  },
  editTogglePillActive: {
    backgroundColor: localColors.primary,
  },
  editToggleText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#868e96',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  editToggleTextActive: {
    color: localColors.white,
  },
  editCircleSquaresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  editCircleBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: localColors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editCircleLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#868e96',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  editCircleValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  editCircleNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: localColors.text,
  },
  editCircleUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: '#868e96',
    marginLeft: 4,
  },
  editActivityCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  editActivityCard: {
    flex: 1,
    backgroundColor: '#f1f3f5',
    borderRadius: 24,
    padding: 20,
  },
  editActivityCardOrange: {
    flex: 1,
    backgroundColor: localColors.primary,
    borderRadius: 24,
    padding: 20,
  },
  editActivityIcon: {
    marginBottom: 24,
  },
  editActivityLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#868e96',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  editActivityLabelWhite: {
    color: '#ffe4e6',
  },
  editActivityValue: {
    fontSize: 15,
    fontWeight: '900',
    color: localColors.text,
  },
  editActivityValueWhite: {
    color: localColors.white,
  },
  editTagPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  editNutritionPill: {
    backgroundColor: '#f1f3f5',
    paddingHorizontal: 26,
    paddingVertical: 20,
    borderRadius: 99,
  },
  editNutritionPillActive: {
    backgroundColor: localColors.primary,
  },
  editNutritionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: localColors.text,
  },
  editNutritionPillTextActive: {
    color: localColors.white,
  },
  editDeactivateBtn: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#fca5a5',
    marginTop: 24,
    //marginBottom: 40,
    backgroundColor: localColors.white,
  },
  editDeactivateText: {
    color: localColors.dangerText,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  editMealsInput: {
    backgroundColor: '#f1f3f5',
    borderRadius: 99,
    paddingHorizontal: 20,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '900',
    color: localColors.text,
    width: 80,
    textAlign: 'center',
  },
});
