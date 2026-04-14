import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../theme/colors';

const isWeb = Platform.OS === 'web';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    ...(isWeb && {
      maxWidth: 1200,
      marginHorizontal: 'auto',
      width: '100%',
    }),
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    ...(isWeb && {
      paddingHorizontal: 40,
      paddingVertical: 60,
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    marginBottom: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: '#595C5E',
    textAlign: 'center',
    lineHeight: 26,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    height: 64,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputIcon: {
    marginLeft: 20,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    padding: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  loginButtonContainer: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#ABADAF',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 18,
    paddingVertical: 18,
    marginBottom: 16,
    ...(isWeb && {
      cursor: 'pointer',
    }),
  },
  socialButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    color: '#595C5E',
    fontSize: 16,
    fontWeight: '500',
  },
  signupLink: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
});




