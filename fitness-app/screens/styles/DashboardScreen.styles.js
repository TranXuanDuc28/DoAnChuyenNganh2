import { StyleSheet, Dimensions, Platform } from 'react-native';
import colors from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
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
    height: 240, // Increased height to accommodate padding
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    ...(isWeb && {
      borderRadius: 24,
      marginHorizontal: 16,
      marginTop: 16,
      overflow: 'hidden',
      height: 200, // Keep original height for web
    }),
  },
  headerImage: {
    resizeMode: 'cover',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  greeting: {
    fontSize: 16,
    paddingHorizontal: 24,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 28,
    paddingHorizontal: 24,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  section: {
    marginTop: 24,
    marginHorizontal: 20,
    ...(isWeb && {
      marginHorizontal: 24,
      marginTop: 32,
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    paddingBottom: 10,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
    ...(isWeb && {
      fontSize: 24,
    }),
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    borderRadius: 20,
    padding: 16,
    width: '48%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 4, // handled by gap in modern RN/Web but fallback
    ...(isWeb && {
      width: 'calc(50% - 8px)',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 24px ${colors.primary}20`,
      },
    }),
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 8,
    fontWeight: '600',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 12,
  },
  statUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textTertiary,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  healthMetrics: {
    flexDirection: 'row',
    gap: 12,
  },
  healthCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  healthLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  healthValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 4,
  },
  healthSubtext: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center', // Center chart
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  recommendationsContainer: {
    gap: 16,
    paddingBottom: 40,
  },
  recommendationCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  recommendationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

