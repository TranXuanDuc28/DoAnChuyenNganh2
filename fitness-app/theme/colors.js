// Theme colors - Dark & Orange (Professional Fitness Theme)
// Primary color: #FF6B35 (Vibrant Orange)
// Background: Dark theme for modern fitness app

export const colors = {
  // Primary colors - Orange theme
  primary: '#FF6B35',         // Vibrant orange - main brand color
  primaryDark: '#E55A2B',     // Darker orange for pressed states
  primaryLight: '#FFA726',    // Lighter orange for hover states
  
  // Background colors - Dark theme
  background: '#121212',       // Main background - Material Design dark
  backgroundDark: '#0A0A0A',   // Darker background for depth
  backgroundLight: '#1E1E1E',  // Slightly lighter for contrast
  
  // Card colors - Dark surfaces
  card: '#1E1E1E',            // Main card background
  cardDark: '#181818',        // Darker cards
  cardLight: '#252525',       // Lighter cards
  cardDarkLight: '#2A2A2A',   // Active tab background
  
  // Text colors - Light text on dark background
  text: '#FFFFFF',            // Primary text - white
  textSecondary: '#E0E0E0',   // Secondary text - light gray
  textTertiary: '#B0B0B0',    // Tertiary text
  textLight: '#999999',       // Light text for subtle content
  textWhite: '#FFFFFF',       // Pure white
  textOnPrimary: '#1A1A1A',   // Dark text on orange background
  
  // Border colors
  border: '#2A2A2A',          // Standard border
  borderLight: '#3A3A3A',     // Lighter border for cards
  borderDark: '#1A1A1A',      // Darker border
  
  // Status colors
  success: '#4CAF50',         // Green for success
  warning: '#FFC107',         // Yellow for warnings
  danger: '#F44336',          // Red for errors
  info: '#2196F3',            // Blue for information
  
  // Icon colors
  iconDefault: '#B0B0B0',     // Default icon color
  iconActive: '#FF6B35',      // Active icon - orange
  iconSuccess: '#4CAF50',     // Success icon - green
  iconWarning: '#FFC107',     // Warning icon - yellow
  iconDanger: '#F44336',      // Danger icon - red
  
  // Special colors
  overlay: 'rgba(0, 0, 0, 0.85)',      // Dark overlay for images
  overlayLight: 'rgba(0, 0, 0, 0.65)',  // Lighter overlay
  white: '#FFFFFF',
  black: '#000000',
  
  // Gradient arrays for LinearGradient
  gradients: {
    primary: ['#FF6B35', '#E55A2B', '#1A1A1A'],  // Orange to dark
    orangeDark: ['#FF6B35', '#1A1A1A'],          // Orange to black
    darkOrange: ['#1A1A1A', '#FF6B35'],          // Black to orange
    card: ['#252525', '#1E1E1E'],                // Card gradient
    overlay: ['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.65)'], // Image overlay
  },
};

export default colors;
