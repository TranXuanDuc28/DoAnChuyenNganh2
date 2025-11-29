import { StyleSheet, Dimensions, Platform } from 'react-native';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
    ...(isWeb && {
      maxWidth: 1200,
      marginHorizontal: 'auto',
      width: '100%',
    }),
  },
  backgroundImage: {

    resizeMode: 'cover',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,

    paddingTop: 20,
    paddingBottom: 30,
    ...(isWeb && {
      paddingHorizontal: 40,
      paddingTop: 60,
      paddingBottom: 40,
      maxWidth: 800,
      marginHorizontal: 'auto',
    }),
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  stepSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  stepDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.black,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 5,
    fontStyle: 'italic',
  },
  pickerContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  picker: {
    height: 50,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  goalCard: {
    width: (width - 60) / 2,
    backgroundColor: colors.cardDark,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  goalCardSelected: {
    backgroundColor: colors.cardDarkLight,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  goalTextSelected: {
    color: colors.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  previousButton: {
    backgroundColor: colors.cardDark,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...(isWeb && {
      paddingVertical: 16,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  previousButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    flex: 2,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    ...(isWeb && {
      paddingVertical: 16,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  nextButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  completeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  completeButtonText: {
    color: colors.textOnPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  completeButtonDisabled: {
    backgroundColor: colors.borderDark,
    opacity: 0.6,
  },
});




