import React, { useEffect, useRef } from 'react';
import { 
  Text, 
  View, 
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Animated,
  Easing
} from 'react-native';
import { Ionicons as Icon, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles/PaymentProcessingScreen.styles';

const PaymentProcessingScreen = () => {
  const navigation = useNavigation();
  const spinValue = useRef(new Animated.Value(0)).current;

  // Setup spinning animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Simulate payment processing time (3 seconds) then navigate to Success Screen
    const timer = setTimeout(() => {
      navigation.replace('PaymentSuccessScreen');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FF6B00" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CHECKOUT</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="ellipsis-vertical" size={24} color="#FF6B00" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        
        {/* Loading Spinner */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCircleBg}>
            <Icon name="cash-outline" size={48} color="#FF6B00" />
          </View>
          <Animated.View style={[styles.loadingCircleProgress, { transform: [{ rotate: spin }] }]} />
        </View>

        {/* Processing Text */}
        <Text style={styles.titleText}>Processing Payment...</Text>
        <Text style={styles.subtitleText}>Please do not close the app</Text>

        {/* Transaction Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRowTop}>
            <Text style={styles.infoLabelTop}>TRANSACTION ID</Text>
            <Text style={styles.infoValueTop}>#TRX-99281-KM</Text>
          </View>
          
          <View style={styles.infoRowBottom}>
            <View>
              <Text style={styles.infoLabelBottom}>TOTAL AMOUNT</Text>
              <Text style={styles.infoPrice}>$120.00</Text>
            </View>
            <View style={styles.secureBadge}>
              <Text style={styles.secureText}>SECURE ENCRYPTION</Text>
              <MaterialCommunityIcons name="shield-check" size={16} color="#FF6B00" />
            </View>
          </View>
        </View>

        {/* Security Badge Button */}
        <TouchableOpacity style={styles.securityButton} activeOpacity={1}>
          <Icon name="lock-closed" size={16} color="#FFFFFF" />
          <Text style={styles.securityButtonText}>BANK-GRADE SECURITY ENABLED</Text>
        </TouchableOpacity>

      </View>

      {/* Mock Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home-outline" size={24} color="#767575" />
          <Text style={styles.navItemLabel}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="dumbbell" size={24} color="#767575" />
          <Text style={styles.navItemLabel}>Workouts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Icon name="people-outline" size={24} color="#767575" />
          <Text style={styles.navItemLabel}>Community</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Icon name="restaurant-outline" size={24} color="#767575" />
          <Text style={styles.navItemLabel}>Nutrition</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItemActive} onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}>
          <View style={styles.navItemActiveCircle}>
            <Icon name="person" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.navItemActiveLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

export default PaymentProcessingScreen;
