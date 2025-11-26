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
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: colors.card,
    ...(isWeb && {
      cursor: 'pointer',
    }),
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
  bmiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.1)', // primary with opacity
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  bmiLabel: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 8,
    fontWeight: '600',
  },
  bmiValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginHorizontal: 24,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    gap: 12,
  },
  statCardContainer: {
    width: '48%',
    marginBottom: 4, // handled by gap
    ...(isWeb && {
      width: 'calc(50% - 8px)',
    }),
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        transform: 'translateY(-2px)',
        borderColor: colors.primary,
      },
    }),
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  quickActionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    marginHorizontal: 20,
    borderRadius: 24,
    paddingVertical: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...(isWeb && {
      marginHorizontal: 24,
    }),
  },
  quickActionButton: {
    alignItems: 'center',
    opacity: 0.9,
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'opacity 0.2s ease',
      ':hover': {
        opacity: 1,
      },
    }),
  },
  quickActionText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: '500',
  },
  menuSection: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...(isWeb && {
      marginHorizontal: 24,
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      ':hover': {
        backgroundColor: colors.cardDarkLight,
      },
    }),
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: colors.white,
    marginLeft: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 23, 68, 0.1)', // danger with opacity
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 23, 68, 0.3)',
    ...(isWeb && {
      marginHorizontal: 24,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: 'rgba(255, 23, 68, 0.2)',
      },
    }),
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.danger,
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
});

