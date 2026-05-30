import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ChallengeDetailScreen = ({ route, navigation }) => {
  const { challenge } = route.params || {
    challenge: {
      title: '30-Day Yoga Flow',
      category: 'Yoga Mastery',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop',
      duration: '30 Days',
      participants: '12.4k',
      reward: 'Zen Master',
      intensity: 'Advanced',
      description: 'The 30-Day Yoga Flow is our most popular program, crafted by world-class yogis to take you from foundational poses to advanced inversions. Each day features a 45-minute flow focusing on different anatomical regions and breathing techniques.\n\nWhether you\'re looking to improve your flexibility, build functional strength, or simply find a moment of peace in your busy schedule, this challenge provides the structure and community support to help you succeed.',
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Icon name="arrow-back" size={24} color="#2C2F31" />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>FITLIFE</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Icon name="share-outline" size={24} color="#2C2F31" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image source={{ uri: challenge.image }} style={styles.heroImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>{challenge.category.toUpperCase()}</Text>
            </View>
            <Text style={styles.heroTitle}>{challenge.title}</Text>
            <Text style={styles.heroSub}>{challenge.description.split('\n')[0]}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard icon="calendar-outline" value={challenge.duration} label="DURATION" />
          <StatCard icon="people-outline" value={challenge.participants} label="PARTICIPANTS" />
          <StatCard icon="ribbon-outline" value={challenge.reward} label="BADGE REWARD" />
          <StatCard icon="flash-outline" value={challenge.intensity} label="INTENSITY" />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this Challenge</Text>
          <Text style={styles.sectionDesc}>{challenge.description}</Text>
        </View>

        {/* Achievement Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You'll Achieve</Text>
          <AchievementItem text="Complete 22.5 hours of guided yoga" />
          <AchievementItem text="Master the Sun Salutation B series" />
          <AchievementItem text="Improve spinal mobility by up to 15%" />
          <AchievementItem text="Establish a lasting daily wellness habit" />
        </View>

        {/* Reward Section */}
        <View style={styles.rewardSection}>
          <Text style={styles.sectionTitleCenter}>Challenge Rewards</Text>
          <View style={styles.rewardCard}>
            <View style={styles.badgeCircle}>
              <Icon name="trophy" size={40} color="#BF4A1D" />
            </View>
            <View style={styles.badgeLabelContainer}>
              <Text style={styles.badgeLabel}>RARE BADGE</Text>
            </View>
            <Text style={styles.badgeName}>Zen Master Badge</Text>
            <Text style={styles.badgeInfo}>Awarded for 30 consecutive days of completion.</Text>
            
            <View style={styles.rewardRow}>
              <Text style={styles.rewardLabel}>XP Reward</Text>
              <Text style={styles.rewardValue}>+2,500 XP</Text>
            </View>
            <View style={styles.rewardRow}>
              <Text style={styles.rewardLabel}>Store Credit</Text>
              <Text style={styles.rewardValue}>$10.00</Text>
            </View>
          </View>
        </View>

        {/* Milestones Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Milestones</Text>
          <Text style={styles.sectionSub}>Track your journey day by day.</Text>
          
          <MilestoneItem 
            day="01" 
            title="The Foundation: Breath & Alignment" 
            desc="45 Min • Focus: Hips & Hamstrings" 
            completed 
          />
          
          <View style={styles.milestoneSeparator}>
            <Icon name="chevron-down" size={20} color="#EAECEF" />
          </View>

          <MilestoneItem 
            day="29" 
            title="Igniting the Core" 
            desc="40 Min • Focus: Abs & Back Strength" 
            locked 
          />
          <MilestoneItem 
            day="30" 
            title="Flow & Fluidity" 
            desc="50 Min • Focus: Vinyasa Transitions" 
            locked 
          />

          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>VIEW ALL 30 DAYS</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Join Button */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity style={styles.mainActionBtn}>
          <Text style={styles.mainActionText}>START CHALLENGE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const StatCard = ({ icon, value, label }) => (
  <View style={styles.statCard}>
    <Icon name={icon} size={22} color="#BF4A1D" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const AchievementItem = ({ text }) => (
  <View style={styles.achievementItem}>
    <View style={styles.checkCircle}>
      <Icon name="checkmark" size={16} color="#BF4A1D" />
    </View>
    <Text style={styles.achievementText}>{text}</Text>
  </View>
);

const MilestoneItem = ({ day, title, desc, completed, locked }) => (
  <View style={styles.milestoneItem}>
    <View style={[styles.dayCircle, completed && styles.dayCircleActive, locked && styles.dayCircleLocked]}>
      <Text style={[styles.dayText, completed && styles.dayTextActive, locked && styles.dayTextLocked]}>{day}</Text>
    </View>
    <View style={styles.milestoneContent}>
      <Text style={styles.milestoneTitle}>{title}</Text>
      <Text style={styles.milestoneDesc}>{desc}</Text>
    </View>
    {completed && <Icon name="checkmark-circle" size={24} color="#BF4A1D" />}
    {locked && <Icon name="lock-closed-outline" size={20} color="#A0A3A5" />}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
  },
  headerLogo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FF794A',
    letterSpacing: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    height: 400,
    marginHorizontal: 16,
    borderRadius: 48,
    overflow: 'hidden',
    marginTop: 20,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
  },
  tagContainer: {
    backgroundColor: '#FF794A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
    marginTop: 10,
  },
  statCard: {
    width: (width - 44) / 2,
    backgroundColor: '#F7F8F9',
    borderRadius: 32,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C2F31',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A0A3A5',
    marginTop: 4,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2C2F31',
    marginBottom: 16,
  },
  sectionTitleCenter: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2C2F31',
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionSub: {
    fontSize: 14,
    color: '#A0A3A5',
    marginBottom: 24,
    marginTop: -8,
  },
  sectionDesc: {
    fontSize: 15,
    color: '#595C5E',
    lineHeight: 24,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8F9',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  achievementText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2F31',
    flex: 1,
  },
  rewardSection: {
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  rewardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  badgeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF2ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeLabelContainer: {
    backgroundColor: '#BF4A1D',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  badgeLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  badgeName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C2F31',
    marginBottom: 8,
  },
  badgeInfo: {
    fontSize: 12,
    color: '#A0A3A5',
    textAlign: 'center',
    marginBottom: 24,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  rewardLabel: {
    fontSize: 14,
    color: '#595C5E',
  },
  rewardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#BF4A1D',
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  milestoneSeparator: {
    width: 56,
    alignItems: 'center',
    marginVertical: -4,
    marginBottom: 12,
  },
  dayCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F7F8F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dayCircleActive: {
    backgroundColor: '#BF4A1D',
  },
  dayCircleLocked: {
    backgroundColor: '#EAECEF',
  },
  dayText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2C2F31',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  dayTextLocked: {
    color: '#A0A3A5',
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C2F31',
    marginBottom: 4,
  },
  milestoneDesc: {
    fontSize: 12,
    color: '#A0A3A5',
  },
  viewAllBtn: {
    alignItems: 'center',
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#BF4A1D',
    letterSpacing: 1,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  mainActionBtn: {
    backgroundColor: '#FF794A',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF794A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  mainActionText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});

export default ChallengeDetailScreen;
