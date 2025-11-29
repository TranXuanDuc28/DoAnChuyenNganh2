import { StyleSheet, Platform } from 'react-native';
import colors from '../../theme/colors';

const isWeb = Platform.OS === 'web';

export const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: colors.background,
    ...(isWeb && {
      maxWidth: 1200,
      marginHorizontal: 'auto',
      width: '100%',
    }),
  },
  header: {
    backgroundColor: colors.card,
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 60 : 40,
    paddingBottom: 30,
    paddingTop: 80,
    paddingHorizontal: 20,
    marginBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    ...(isWeb && {
      borderRadius: 24,
      marginHorizontal: 16,
      marginTop: 16,
      paddingVertical: 40,
    }),
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
  },

  // Edit Mode Styles
  nameInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  nameInput: {
    flex: 1,
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerActions: {
    marginTop: 16,
    width: '100%',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
  },
  editButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Section Styles
  section: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 16,
  },

  // Info Row/Column Styles
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoColumn: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  infoInput: {
    backgroundColor: colors.cardDark,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 100,
  },
  bioInput: {
    backgroundColor: colors.cardDark,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  bioText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Gender Selector
  genderSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  genderOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.cardDark,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genderOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderOptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  genderOptionTextSelected: {
    color: colors.white,
  },

  // Level Selector
  levelSelector: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  levelOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.cardDark,
    borderWidth: 1,
    borderColor: colors.border,
  },
  levelOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  levelOptionText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  levelOptionTextSelected: {
    color: colors.white,
  },

  // Chip Selector (for goals, preferences, allergies)
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardDark,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: colors.white,
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 23, 68, 0.1)',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 23, 68, 0.3)',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.danger,
    marginLeft: 8,
  },

  // Edit Image Button
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: colors.card,
  },

  // Change Buttons (Email/Password)
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 12,
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  changeButtonText: {
    flex: 1,
    fontSize: 15,
    color: colors.white,
    fontWeight: '500',
    marginLeft: 12,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
    fontWeight: '500',
  },
  currentValue: {
    fontSize: 15,
    color: colors.white,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.cardDark,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalInput: {
    backgroundColor: colors.cardDark,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: colors.cardDark,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSaveText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },

  // Version
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
});
