import React from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  ImageBackground
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import colors from '../theme/colors';
import { styles } from './styles/GoPremiumScreen.styles';

const PremiumFeatureCard = ({ iconName, iconType, title, description, hasCheck, rowFormat, iconColor = colors.primary }) => {
  const IconComponent = iconType === 'MaterialCommunityIcons' ? MaterialCommunityIcons : iconType === 'FontAwesome5' ? FontAwesome5 : Ionicons;
  
  return (
    <View style={[styles.cardContainer, rowFormat && styles.cardContainerRow]}>
      <View style={styles.cardHeader}>
        <IconComponent name={iconName} size={24} color={iconColor} style={styles.cardIcon} />
        {!rowFormat && <Text style={styles.cardTitle}>{title}</Text>}
      </View>
      
      {rowFormat ? (
        <View style={styles.rowContent}>
          <View style={styles.rowTextContent}>
            <Text style={styles.rowTitle}>{title}</Text>
            <Text style={styles.rowDescription}>{description}</Text>
          </View>
          {hasCheck && <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />}
        </View>
      ) : (
        <Text style={styles.cardDescription}>{description}</Text>
      )}
    </View>
  );
};

const GoPremiumScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header NavBar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="close" size={26} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GO PREMIUM</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <ImageBackground 
            source={require('../image/banner1.jpg')} 
            style={styles.heroImage}
            imageStyle={styles.heroImageStyle}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', '#FFFFFF']}
              style={styles.heroGradient}
              locations={[0.4, 0.8, 1]}
            >
              <View style={styles.heroContent}>
                <View style={styles.labelContainer}>
                  <Text style={styles.labelText}>UNLIMITED ACCESS</Text>
                </View>
                <Text style={styles.titleLine1}>EVOLVE</Text>
                <Text style={styles.titleLine2}>
                  <Text style={styles.titleHighlight}>BEYOND</Text>{'\n'}
                  <Text style={styles.titleLine1}>LIMITS</Text>
                </Text>
                
                <Text style={styles.heroSubtitle}>
                  Unlock the full kinetic potential of your performance with elite training tools designed for the modern athlete.
                </Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Features List */}
        <View style={styles.featuresList}>
          <PremiumFeatureCard 
            iconName="flash" 
            iconType="Ionicons"
            title="EXCLUSIVE WORKOUTS"
            description="Access over 500+ specialized routines tailored for high-intensity performance and recovery."
          />
          <PremiumFeatureCard 
            iconName="face-agent" 
            iconType="MaterialCommunityIcons"
            title="PERSONAL TRAINER ACCESS"
            description="Direct 1-on-1 messaging with elite coaches to refine your form and optimize your schedule."
          />
          <PremiumFeatureCard 
            iconName="chart-line" 
            iconType="MaterialCommunityIcons"
            title="ADVANCED METRICS"
            description="Deep-dive biometric tracking and recovery insights powered by precision data analysis."
          />
          <PremiumFeatureCard 
            iconName="devices" 
            iconType="MaterialCommunityIcons"
            title="MULTI-DEVICE SYNC"
            description="Seamlessly switch between watch and phone"
            hasCheck={true}
            rowFormat={true}
          />
          <PremiumFeatureCard 
            iconName="cancel" 
            iconType="MaterialCommunityIcons"
            title="AD-FREE FOCUS"
            description="Zero distractions during your sessions"
            hasCheck={true}
            rowFormat={true}
          />
        </View>
      </ScrollView>

      {/* Floating Bottom Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={() => navigation.navigate('PlanComparisonScreen')}
        >
          <Text style={styles.ctaButtonText}>START FREE TRIAL</Text>
        </TouchableOpacity>
        <Text style={styles.secureCheckoutText}>CANCEL ANYTIME, SECURE CHECKOUT</Text>
      </View>
    </SafeAreaView>
  );
};

export default GoPremiumScreen;

