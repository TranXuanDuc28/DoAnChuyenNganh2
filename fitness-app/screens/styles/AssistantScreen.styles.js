import { StyleSheet, Platform } from 'react-native';
import colors from '../../theme/colors';

const isWeb = Platform.OS === 'web';

const localColors = {
  background: '#ffffff',
  card: '#f5f5f4', // the cool gray for bot text bubble
  border: '#E5E9EB', // input border
  text: '#2c2f31', // dark gray text
  textSecondary: '#a8a29e', // timestamp text
  primary: '#ff794a', // orange
  primaryDark: '#a43609', // the dark red "RECOVERY PROTOCOL"
  white: '#ffffff',
  black: '#000000',
  inputBg: '#e5e9eb',
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
  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10,
    ...(isWeb && {
      paddingHorizontal: 24,
      paddingVertical: 20,
    }),
  },
  backButton: {
    marginRight: 16,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: localColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: localColors.primary,
    overflow: 'hidden',
    marginRight: 12,
  },
  headerAvatar: {
    width: '100%',
    height: '100%',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ea580c', // Darker orange from figma
    letterSpacing: -0.5,
  },
  statusText: {
    fontSize: 10,
    color: localColors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  // --- Chat List ---
  messagesList: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  botMessageRow: {
    justifyContent: 'flex-start',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  botAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: localColors.primary,
    marginRight: 12,
    marginTop: 4,
    overflow: 'hidden',
    backgroundColor: localColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botAvatar: {
    width: '100%',
    height: '100%',
  },
  userAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(171, 173, 175, 0.2)',
    marginLeft: 12,
    marginTop: 4,
    overflow: 'hidden',
    backgroundColor: localColors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    width: '100%',
    height: '100%',
  },
  bubbleWrapper: {
    maxWidth: '75%',
  },
  messageBubble: {
    padding: 24,
    ...(isWeb && {
      maxWidth: '60%',
    }),
  },
  botBubble: {
    backgroundColor: localColors.card,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 48,
    borderBottomRightRadius: 48,
    borderBottomLeftRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(171, 173, 175, 0.1)',
  },
  userBubble: {
    backgroundColor: localColors.primary,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 48,
    borderBottomLeftRadius: 48,
    paddingVertical: 20,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 26,
  },
  botText: {
    color: localColors.text,
  },
  userText: {
    color: localColors.white,
    fontWeight: '500',
  },
  timestampContainer: {
    marginTop: 8,
  },
  botTimestamp: {
    fontSize: 10,
    color: localColors.textSecondary,
    fontWeight: '700',
    marginLeft: 4,
  },
  userTimestamp: {
    fontSize: 10,
    color: localColors.textSecondary,
    fontWeight: '700',
    marginRight: 4,
    textAlign: 'right',
  },

  // --- Dynamic Action Pills inside Bot Message ---
  actionPillsContainer: {
    marginTop: 16,
    gap: 12,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: localColors.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionPillIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: localColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginRight: 10,
  },
  actionPillIcon: {
    fontSize: 16,
  },
  actionPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: localColors.text,
  },

  // --- Recovery Protocol Custom Card ---
  protocolContainer: {
    marginTop: 8,
  },
  protocolTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: localColors.primaryDark,
    marginBottom: 24,
    textTransform: 'uppercase',
  },
  protocolItem: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  protocolIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 121, 74, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  protocolItemContent: {
    flex: 1,
  },
  protocolItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: localColors.text,
    marginBottom: 4,
  },
  protocolItemDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: '#595c5e',
  },
  protocolQuote: {
    marginTop: 8,
    paddingLeft: 16,
    borderLeftWidth: 4,
    borderLeftColor: localColors.primaryDark,
  },
  protocolQuoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
    fontWeight: '500',
    color: '#595c5e',
  },

  // --- Footer Input Area ---
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(171, 173, 175, 0.1)',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: localColors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: localColors.inputBg,
    borderRadius: 999,
    paddingLeft: 24,
    paddingRight: 4,
    height: 48,
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    height: '60%',
    fontSize: 14,
    fontWeight: '500',
    color: localColors.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: localColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
});
