import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

const colors = {
  primary: '#FF7849',      // Main orange
  brandOrange: '#A8390D',  // Deep orange for text/accents
  brandBrown: '#58423B',
  success: '#10B981',
  background: '#F6F2F7',   // Soft background from UIDL
  white: '#FFFFFF',
  inputBg: '#EEF1F3',      // Search bar bg from UIDL
  textMain: '#2C2F31',     // Dark text
  textSecondary: '#595C5E', // Gray text
  textLight: '#ABADAF',
  border: 'rgba(0, 0, 0, 0.05)',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // --- Quick Post Bar ---
  quickPostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: colors.white,
    borderRadius: 48,
    // Premium shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  userAvatarSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DFE3E6',
    overflow: 'hidden',
  },
  quickPostInput: {
    flex: 1,
    height: 48,
    backgroundColor: colors.inputBg,
    borderRadius: 24,
    marginHorizontal: 16,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  quickPostText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  imageIconBtn: {
    padding: 10,
  },

  // --- Challenges Section ---
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  trendingTag: {
    color: '#FF794A',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textMain,
  },
  viewAllBtn: {
    paddingBottom: 4,
  },
  viewAllText: {
    color: colors.brandOrange,
    fontSize: 14,
    fontWeight: '700',
  },
  challengesScroll: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  challengeCard: {
    width: 280,
    height: 360,
    borderRadius: 48,
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  challengeImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  challengeGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 24,
  },
  challengeBadge: {
    backgroundColor: 'rgba(255, 121, 74, 0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  challengeBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  challengeTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  challengeStats: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginBottom: 20,
  },
  joinBtn: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  joinBtnText: {
    color: colors.textMain,
    fontSize: 14,
    fontWeight: '700',
  },

  // --- Community Feed ---
  feedContainer: {
    marginTop: 40,
    paddingHorizontal: 16,
  },
  feedHeaderTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textMain,
    marginBottom: 24,
    marginLeft: 8,
  },
  postCard: {
    backgroundColor: colors.white,
    borderRadius: 32,
    marginBottom: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  postAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEE',
  },
  postUserMeta: {
    flex: 1,
    marginLeft: 12,
  },
  postUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
  },
  postTime: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 24,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  interactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  interactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  interactionText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  shareBtn: {
    marginLeft: 'auto',
  },
});

export default styles;
