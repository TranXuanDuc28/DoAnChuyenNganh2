import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

const colors = {
  primary: '#FF7849',      // Main orange
  brandOrange: '#A8390D',  // Deep orange
  success: '#10B981',
  background: '#F6F2F7',
  white: '#FFFFFF',
  inputBg: '#EEF1F3',
  textMain: '#2C2F31',
  textSecondary: '#595C5E',
  textLight: '#ABADAF',
  border: 'rgba(0, 0, 0, 0.05)',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingBottom: 120, // Space for input bar
  },
  // --- Custom Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 16,
    backgroundColor: colors.white,
    zIndex: 10,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FF7849', // FITLIFE orange
    letterSpacing: 1,
  },
  optionsBtn: {
    padding: 8,
  },

  // --- Hero Section ---
  heroContainer: {
    marginHorizontal: 16,
    height: 420,
    borderRadius: 48,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: { elevation: 10 },
    }),
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  spotlightBadge: {
    position: 'absolute',
    top: 24,
    left: 24,
    backgroundColor: '#FF794A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  spotlightText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },

  // --- User Profile ---
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FF794A',
    padding: 2,
    backgroundColor: colors.white,
  },
  userAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  userMeta: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textMain,
  },
  userTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  followBtn: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  followBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
  },

  // --- Content ---
  contentContainer: {
    paddingHorizontal: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textMain,
    lineHeight: 34,
  },
  accentTitle: {
    color: '#FF794A',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    marginTop: 16,
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 24,
    gap: 12,
  },
  hashtag: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF794A',
  },

  // --- Interaction Stats ---
  interactionSection: {
    marginTop: 32,
    marginHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 32,
    padding: 24,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  statText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
    marginLeft: 8,
  },
  saveBtn: {
    marginLeft: 'auto',
  },
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  miniAvatars: {
    flexDirection: 'row',
    marginRight: 12,
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F9FAFB',
    marginLeft: -8,
    backgroundColor: '#EEE',
  },
  socialProofText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  boldText: {
    fontWeight: '700',
    color: colors.textMain,
  },

  // --- Comments Section ---
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 16,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textMain,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF794A',
  },
  commentCard: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEE',
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentUserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
  },
  commentTime: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 8,
  },
  commentText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },

  // --- Input Bar ---
  inputWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 56,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textMain,
  },
  postBtnText: {
    color: '#FF794A',
    fontWeight: '800',
    fontSize: 15,
    marginLeft: 12,
  },
});

export default styles;
