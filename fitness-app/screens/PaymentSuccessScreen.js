import React from 'react';
import { 
  Text, 
  View, 
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ImageBackground
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons as Icon, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles/PaymentSuccessScreen.styles';

const PaymentSuccessScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('SubscriptionPlanScreen')}>
          <Icon name="arrow-back" size={24} color="#FF6B00" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CHECKOUT</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="ellipsis-vertical" size={24} color="#FF6B00" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <View style={styles.successIconOuterRing} />
          <View style={styles.successIconBg}>
            <Icon name="checkmark-sharp" size={48} color="#FFFFFF" />
          </View>
        </View>

        {/* Titles */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>PAYMENT</Text>
          <Text style={styles.titleText}>SUCCESSFULL</Text>
        </View>

        {/* Plan Details Card */}
        <View style={styles.planCard}>
          <View style={styles.planDetailsHeader}>
            <View>
              <Text style={styles.planDetailsLabel}>PLAN DETAILS</Text>
              <Text style={styles.planNameText}>ELITE PERFORMANCE MONTHLY</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>$89.00</Text>
              <Text style={styles.paidStatus}>PAID</Text>
            </View>
          </View>

          <View style={styles.billingDatesContainer}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>START DATE</Text>
              <Text style={styles.dateValue}>October 24, 2023</Text>
            </View>
            <View style={[styles.dateItem, {alignItems: 'flex-end'}]}>
              <Text style={styles.dateLabel}>NEXT BILLING</Text>
              <Text style={styles.dateValue}>November 24, 2023</Text>
            </View>
          </View>
        </View>

        {/* Membership Includes */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>YOUR MEMBERSHIP INCLUDES</Text>
          
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="dumbbell" size={20} color="#FF6B00" style={styles.featureIcon} />
            <Text style={styles.featureText}>FULL GYM ACCESS</Text>
          </View>

          <View style={styles.featureItem}>
            <Icon name="person-outline" size={20} color="#FF6B00" style={styles.featureIcon} />
            <Text style={styles.featureText}>PERSONAL COACH</Text>
          </View>

          <View style={styles.featureItem}>
            <Icon name="nutrition-outline" size={20} color="#FF6B00" style={styles.featureIcon} />
            <Text style={styles.featureText}>MEAL PLANNING</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.getStartedButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('GoPremiumScreen')} // Or Dashboard/Home if we have one
          >
            <LinearGradient
              colors={['#FF6B00', '#FF8533']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.getStartedGradient}
            >
              <Text style={styles.getStartedText}>GET STARTED</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.viewReceiptButton} activeOpacity={0.7}>
            <Text style={styles.viewReceiptText}>VIEW RECEIPT</Text>
          </TouchableOpacity>
        </View>

        {/* Journey Banner */}
        <View style={styles.journeyBannerContainer}>
          <ImageBackground
            source={require('../image/treadmills.jpg')} // reusing the generic image as we don't have the b&w bodybuilder
            style={styles.journeyBannerImage}
            imageStyle={{ resizeMode: 'cover', opacity: 0.6, backgroundColor: '#000' }} // added some contrast to match
          >
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', '#FFFFFF']}
              style={styles.journeyBannerOverlay}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
            >
              <Text style={styles.journeyBannerText}>YOUR JOURNEY</Text>
              <Text style={styles.journeyBannerText}>BEGINS NOW.</Text>
            </LinearGradient>
          </ImageBackground>
        </View>

      </ScrollView>

      {/* Mock Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('GoPremiumScreen')}>
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

export default PaymentSuccessScreen;
