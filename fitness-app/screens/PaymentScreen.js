import React, { useState } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  TextInput
} from 'react-native';
import { Ionicons as Icon, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles/PaymentScreen.styles';

const PaymentScreen = ({ navigation }) => {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [cardHolder, setCardHolder] = useState('ALEX STEVENS');
  const [cardNumber, setCardNumber] = useState('0000 0000 0000 0000');
  const [expiry, setExpiry] = useState('MM/YY');
  const [cvv, setCvv] = useState('***');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#FF6B00" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="ellipsis-vertical" size={24} color="#FF6B00" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step 01: Order Summary */}
        <View style={styles.stepContainer}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>Step 01</Text>
          </View>
          <Text style={styles.stepTitle}>Order Summary</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryPlanType}>Yearly Plan</Text>
              <Text style={styles.summaryPlanDesc}>Full access to all boutique locations & digital training</Text>
            </View>
            <Text style={styles.summaryPrice}>$249.99</Text>
          </View>
          <View style={styles.billingCycleSection}>
            <Text style={styles.billingCycleLabel}>Billing Cycle</Text>
            <Text style={styles.billingCycleValue}>Annually</Text>
          </View>
        </View>

        {/* Step 02: Payment Method */}
        <View style={styles.stepContainer}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>Step 02</Text>
          </View>
          <Text style={styles.stepTitle}>Payment Method</Text>
        </View>

        <View style={styles.paymentMethodsContainer}>
          {/* Card Method */}
          <TouchableOpacity 
            style={[styles.paymentMethodBtn, selectedMethod === 'card' && styles.paymentMethodBtnActive]}
            onPress={() => setSelectedMethod('card')}
          >
            <Icon 
              name="card-outline" 
              size={28} 
              color={selectedMethod === 'card' ? '#FF6B00' : '#666666'} 
            />
            <Text style={[styles.paymentMethodLabel, selectedMethod === 'card' && styles.paymentMethodLabelActive]}>
              CARD
            </Text>
          </TouchableOpacity>

          {/* Apple Pay Method */}
          <TouchableOpacity 
            style={[styles.paymentMethodBtn, selectedMethod === 'apple' && styles.paymentMethodBtnActive]}
            onPress={() => setSelectedMethod('apple')}
          >
            <Icon 
              name="logo-apple" 
              size={28} 
              color={selectedMethod === 'apple' ? '#FF6B00' : '#666666'} 
            />
            <Text style={[styles.paymentMethodLabel, selectedMethod === 'apple' && styles.paymentMethodLabelActive]}>
              APPLE
            </Text>
          </TouchableOpacity>

          {/* Google Pay Method */}
          <TouchableOpacity 
            style={[styles.paymentMethodBtn, selectedMethod === 'google' && styles.paymentMethodBtnActive]}
            onPress={() => setSelectedMethod('google')}
          >
            <Icon 
              name="logo-google" 
              size={28} 
              color={selectedMethod === 'google' ? '#FF6B00' : '#666666'} 
            />
            <Text style={[styles.paymentMethodLabel, selectedMethod === 'google' && styles.paymentMethodLabelActive]}>
              GOOGLE
            </Text>
          </TouchableOpacity>
        </View>

        {/* Step 03: Card Details */}
        <View style={styles.stepContainer}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>Step 03</Text>
          </View>
          <Text style={styles.stepTitle}>Card Details</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Card Holder Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputField}
              value={cardHolder}
              onChangeText={setCardHolder}
              placeholder="Full Name"
              placeholderTextColor="#A0A0A0"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Card Number</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputField}
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor="#A0A0A0"
              keyboardType="number-pad"
            />
            <Icon name="lock-closed" size={20} color="#A0A0A0" />
          </View>
        </View>

        <View style={styles.rowInputs}>
          <View style={[styles.formGroup, styles.halfInputGroup]}>
            <Text style={styles.inputLabel}>Expiry</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputField}
                value={expiry}
                onChangeText={setExpiry}
                placeholder="MM/YY"
                placeholderTextColor="#A0A0A0"
              />
            </View>
          </View>

          <View style={[styles.formGroup, styles.halfInputGroup]}>
            <Text style={styles.inputLabel}>CVV</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputField}
                value={cvv}
                onChangeText={setCvv}
                placeholder="***"
                placeholderTextColor="#A0A0A0"
                keyboardType="number-pad"
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* Pay Now Button */}
        <TouchableOpacity 
          style={styles.payButtonContainer}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('PaymentProcessingScreen')}
        >
          <LinearGradient
            colors={['#FF6B00', '#FF8533']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.payButtonGradient}
          >
            <Text style={styles.payButtonText}>PAY NOW — $249.99</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Disclaimer */}
        <Text style={styles.disclaimerText}>
          By clicking Pay Now, you agree to our <Text style={styles.disclaimerHighlight}>Terms of Service</Text> and authorize the recurring annual charge until cancellation.
        </Text>

      </ScrollView>

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

export default PaymentScreen;
