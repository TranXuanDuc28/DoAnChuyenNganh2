import React, { useState } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  ImageBackground
} from 'react-native';
import { Ionicons as Icon, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import colors from '../theme/colors';
import { styles } from './styles/SubscriptionPlanScreen.styles';

const SubscriptionPlanScreen = () => {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState('Athlete');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header NavBar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back" size={26} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GO PREMIUM</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="ellipsis-vertical" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Hero Section */}
        <View style={styles.mainHero}>
          <View style={styles.heroHeading}>
            <Text style={styles.titleText}>UNLEASH YOUR</Text>
            <Text style={[styles.titleText, styles.titleHighlight]}>POTENTIAL.</Text>
          </View>
          <Text style={styles.subtitleText}>
            Choose the path that fits your discipline.{'\n'}Professional tools for the dedicated athlete.
          </Text>
        </View>

        {/* Plan Selection Grid */}
        <View style={styles.planSelectionGrid}>
          
          {/* Monthly Plan */}
          <TouchableOpacity 
            style={[styles.planCard, selectedPlan === 'Basic' && styles.planCardSelected]}
            onPress={() => setSelectedPlan('Basic')}
            activeOpacity={0.9}
          >
            <View style={styles.planHeaderRow}>
              <View>
                <Text style={styles.planBadgeText}>BASIC ACCESS</Text>
                <Text style={styles.planTitleText}>Monthly</Text>
              </View>
              <View style={styles.planPriceCol}>
                <Text style={styles.planPriceText}>$29.99</Text>
                <Text style={styles.planPeriodText}>PER MONTH</Text>
              </View>
            </View>
            <View style={styles.planFeatureRow}>
              <Icon name="checkmark-circle-outline" size={14} color="#666" />
              <Text style={styles.planFeatureText}>Full equipment access</Text>
            </View>
          </TouchableOpacity>

          {/* Yearly Plan (Best Value) */}
          <TouchableOpacity 
            style={[styles.planCardYearly, selectedPlan === 'Athlete' && styles.planCardYearlySelected]}
            onPress={() => setSelectedPlan('Athlete')}
            activeOpacity={0.9}
          >
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>BEST VALUE</Text>
            </View>
            
            <View style={styles.planHeaderRow}>
              <View>
                <Text style={styles.planBadgeTextOrange}>ATHLETE CHOICE</Text>
                <Text style={styles.planTitleText}>Yearly</Text>
              </View>
              <View style={styles.planPriceCol}>
                <Text style={styles.planPriceTextOrange}>$249.99</Text>
                <Text style={styles.planPeriodText}>SAVE 30% ANNUALLY</Text>
              </View>
            </View>

            <View style={styles.planFeatureList}>
              <View style={styles.planFeatureRow}>
                <MaterialCommunityIcons name="lightning-bolt" size={16} color={colors.primary} />
                <Text style={styles.planFeatureTextDark}>Personal Training Consultations</Text>
              </View>
              <View style={styles.planFeatureRow}>
                <MaterialCommunityIcons name="check-decagram" size={16} color={colors.primary} />
                <Text style={styles.planFeatureTextDark}>Advanced Performance Analytics</Text>
              </View>
              <View style={styles.planFeatureRow}>
                <MaterialCommunityIcons name="silverware-fork-knife" size={16} color={colors.primary} />
                <Text style={styles.planFeatureTextDark}>Custom Nutrition Programming</Text>
              </View>
            </View>

            <View style={styles.yearlyFooterBorder}>
              <Text style={styles.yearlyFooterText}>
                Billed annually as a single payment of{'\n'}$249.99
              </Text>
            </View>
          </TouchableOpacity>

          {/* Lifetime Plan */}
          <TouchableOpacity 
            style={[styles.planCard, selectedPlan === 'Legacy' && styles.planCardSelected]}
            onPress={() => setSelectedPlan('Legacy')}
            activeOpacity={0.9}
          >
            <View style={styles.planHeaderRow}>
              <View>
                <Text style={styles.planBadgeText}>LEGACY STATUS</Text>
                <Text style={styles.planTitleText}>Lifetime</Text>
              </View>
              <View style={styles.planPriceCol}>
                <Text style={styles.planPriceText}>$899.99</Text>
                <Text style={styles.planPeriodText}>ONE TIME PAYMENT</Text>
              </View>
            </View>
            <View style={styles.planFeatureRow}>
              <MaterialCommunityIcons name="infinity" size={16} color="#666" />
              <Text style={styles.planFeatureText}>Never pay for a subscription again</Text>
            </View>
          </TouchableOpacity>

        </View>

        {/* Trust Image Section fading into White */}
        <View style={styles.trustImageSection}>
          <ImageBackground 
            source={require('../image/banner3.jpg')}
            style={styles.trustImage}
            imageStyle={{ resizeMode: 'cover', opacity: 0.5 }}
          >
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.7)', '#FFFFFF']}
              style={styles.trustImageGradient}
              locations={[0, 0.5, 1]}
            />
          </ImageBackground>
        </View>

        {/* Footer Support/Restore Options */}
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.footerMenu}>
            <Icon name="help-circle-outline" size={24} color="#666" />
            <Text style={styles.footerMenuText}>SUPPORT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerMenu}>
            <Icon name="refresh-outline" size={24} color="#666" />
            <Text style={styles.footerMenuText}>RESTORE</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Floating Bottom CTA Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={() => navigation.navigate('PaymentScreen', { plan: selectedPlan })}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonText}>SELECT PLAN</Text>

        </TouchableOpacity>
        <Text style={styles.secureCheckoutText}>SECURE CHECKOUT WITH 256-BIT ENCRYPTION</Text>

      </View>

      

    </SafeAreaView>
  );
};

export default SubscriptionPlanScreen;
