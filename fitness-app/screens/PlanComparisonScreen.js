import React from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Dimensions
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import colors from '../theme/colors';
import { styles } from './styles/PlanComparisonScreen.styles';

const { width } = Dimensions.get('window');

const FeatureListItem = ({ text, isPremium = false, isAvailable = true }) => {
  return (
    <View style={styles.featureItemContainer}>
      <View style={[
        styles.featureIconBubble, 
        isAvailable ? (isPremium ? styles.bubblePremium : styles.bubbleStandard) : styles.bubbleDisabled
      ]}>
        {isAvailable ? (
          <Icon name="checkmark" size={14} color={isPremium ? colors.primary : '#000'} />
        ) : (
          <Icon name="lock-closed" size={12} color="#000" />
        )}
      </View>
      <Text style={[
        styles.featureText, 
        !isAvailable && styles.featureTextDisabled
      ]}>
        {text}
      </Text>
    </View>
  );
};

const PlanComparisonScreen = () => {
  const navigation = useNavigation();

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
            <Text style={[styles.titleText, styles.titleHighlight]}>PEAK</Text>
            <Text style={styles.titleText}>POTENTIAL.</Text>
          </View>
          <Text style={styles.subtitleText}>
            Move from casual training to elite{'\n'}
            performance. Compare our plans and{'\n'}
            choose the engine that drives your{'\n'}
            ambition.
          </Text>
        </View>

        {/* Comparison Bento Grid */}
        <View style={styles.comparisonGrid}>
          {/* FREE TIER */}
          <View style={styles.freeColumn}>
            <View style={styles.tierHeader}>
              <Text style={styles.tierLabel}>TIER 01</Text>
              <Text style={styles.tierTitle}>FREE</Text>
              <Text style={styles.tierDescription}>
                Fundamental tools for getting{'\n'}started on your journey.
              </Text>
            </View>

            <View style={styles.featuresList}>
              <FeatureListItem text="Standard Workout Library" isAvailable={true} />
              <FeatureListItem text="Basic Performance Tracking" isAvailable={true} />
              <FeatureListItem text="Community Feed Access" isAvailable={true} />
              <FeatureListItem text="Pro Training Programs" isAvailable={false} />
              <FeatureListItem text="Biometric Data Sync" isAvailable={false} />
            </View>

            <TouchableOpacity style={styles.currentPlanBtn}>
              <Text style={styles.currentPlanText}>CURRENT PLAN</Text>
            </TouchableOpacity>
          </View>

          {/* PREMIUM TIER */}
          <View style={styles.premiumColumn}>
            {/* Background Blob */}
            <View style={styles.premiumBlob} />

            <View style={styles.tierHeader}>
              <View style={styles.premiumLabelRow}>
                <Text style={styles.tierLabelPremium}>TIER 02</Text>
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>RECOMMENDED</Text>
                </View>
              </View>
              <Text style={styles.tierTitle}>PREMIUM</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceText}>$12.99</Text>
                <Text style={styles.monthText}>/ Month</Text>
              </View>
            </View>

            <View style={styles.featuresListPremium}>
              <FeatureListItem text="Unlimited Pro Training Vault" isAvailable={true} isPremium={true} />
              <FeatureListItem text="Advanced Biometric Heart Analytics" isAvailable={true} isPremium={true} />
              <FeatureListItem text="Offline Workout Mode" isAvailable={true} isPremium={true} />
              <FeatureListItem text="Personalized AI Coach Insights" isAvailable={true} isPremium={true} />
              <FeatureListItem text="Early Access to New Features" isAvailable={true} isPremium={true} />
            </View>

            <View style={styles.upgradeSection}>
              <TouchableOpacity 
                style={styles.upgradeBtn}
                onPress={() => navigation.navigate('SubscriptionPlanScreen')}
              >
                <Text style={styles.upgradeBtnText}>UPGRADE NOW</Text>
              </TouchableOpacity>
              <Text style={styles.trialText}>7-Day Free Trial Included</Text>
            </View>
          </View>
        </View>

        {/* Feature Highlight Slider Section */}
        <View style={styles.featureSliderSection}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderTitle}>
              WHY ELITE ATHLETES{'\n'}CHOOSE <Text style={styles.titleHighlight}>PREMIUM</Text>
            </Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.sliderContent}
            snapToInterval={width * 0.82}
            decelerationRate="fast"
          >
            {/* Slider Item 1 */}
            <View style={styles.sliderCard}>
              <ImageBackground 
                source={require('../image/banner1.jpg')} 
                style={styles.sliderImage}
                imageStyle={styles.sliderImageStyles}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
                  style={styles.sliderGradient}
                  locations={[0.4, 0.8, 1]}
                >
                  <Text style={styles.sliderCardTitle}>Hyper-Focused Data</Text>
                  <Text style={styles.sliderCardDesc}>
                    Get deep insights into every rep and set you perform.
                  </Text>
                </LinearGradient>
              </ImageBackground>
            </View>

            {/* Slider Item 2 */}
            <View style={styles.sliderCard}>
              <ImageBackground 
                source={require('../image/banner2.jpg')} 
                style={styles.sliderImage}
                imageStyle={styles.sliderImageStyles}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
                  style={styles.sliderGradient}
                  locations={[0.4, 0.8, 1]}
                >
                  <Text style={styles.sliderCardTitle}>Live Coaching</Text>
                  <Text style={styles.sliderCardDesc}>
                    Sync up with professionals to help you reach your goals.
                  </Text>
                </LinearGradient>
              </ImageBackground>
            </View>
          </ScrollView>
        </View>

        {/* Bottom Contact/Support (Optional based on image snippet) */}
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.footerMenu}>
            <Icon name="help-circle-outline" size={24} color="#666" />
            <Text style={styles.footerMenuText}>SUPPORT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerMenu}>
            <Icon name="refresh-outline" size={24} color={colors.primary} />
            <Text style={[styles.footerMenuText, {color: colors.primary}]}>RESTORE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
};

export default PlanComparisonScreen;
