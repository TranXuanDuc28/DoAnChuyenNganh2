import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  main: {
    paddingTop: 60, // Adjusted for header visibility
    paddingHorizontal: 24,
    gap: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF794A',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  saveButton: {
    backgroundColor: '#FFF7ED',
    padding: 10,
    borderRadius: 999,
  },
  // Hero Section
  heroSection: {
    alignSelf: 'stretch',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F3F4F3',
    height: 380,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.1)', // Subtle gradient overlay
  },
  categoryBadge: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  mealTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
  },
  // Nutrition Info
  nutritionRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  caloriesCard: {
    flex: 1,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#191C1C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  caloriesValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#191C1C',
  },
  caloriesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#584235',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  macroCol: {
    flex: 1,
    gap: 12,
  },
  macroCard: {
    backgroundColor: '#F3F4F3',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#584235',
    textTransform: 'uppercase',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#994700',
  },
  // Carbohydrates Detail Card
  carbDetailCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  carbIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#FF7A00',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carbInfo: {
    flex: 1,
    gap: 8,
  },
  carbLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#584235',
    textTransform: 'uppercase',
  },
  carbValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#191C1C',
  },
  carbProgressBar: {
    height: 6,
    backgroundColor: 'rgba(153, 71, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  carbProgressFill: {
    height: '100%',
    backgroundColor: '#FF7A00',
    width: '70%',
  },
  // Ingredients
  sectionContainer: {
    gap: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#191C1C',
  },
  itemCountBadge: {
    backgroundColor: '#FBD4C3', // rgba(255, 122, 0, 0.1)
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  itemCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#994700',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F3',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  ingredientIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#FFFFFF',
  },
  ingredientName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#191C1C',
  },
  ingredientWeight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#584235',
  },
  // Preparation
  preparationStep: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  stepNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FBD4C3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#994700',
  },
  stepContent: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#191C1C',
  },
  stepDescription: {
    fontSize: 13,
    color: '#584235',
    lineHeight: 20,
    opacity: 0.8,
  },
  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  addLogButton: {
    backgroundColor: '#FF7A00',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addLogButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  }
});
