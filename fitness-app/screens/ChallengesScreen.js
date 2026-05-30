import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ChallengesScreen = ({ navigation }) => {
  const challenges = [
    {
      id: '1',
      title: 'Summer Shred',
      category: 'Full Body • 8 Weeks',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop',
      level: 'Expert',
      progress: 65,
      isFeatured: true,
      duration: '60 Days',
      participants: '25.8k',
      reward: 'Shred Master',
      intensity: 'Expert',
      description: 'Get ready for the ultimate summer transformation. This high-intensity program combines strength, cardio, and mobility to sculpt your physique in 8 weeks.',
    },
    {
      id: '2',
      title: '10K Step Day',
      category: 'Cardio • Daily',
      image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1000&auto=format&fit=crop',
      icon: 'walk-outline',
      duration: '1 Day',
      participants: '45.2k',
      reward: 'Walker Badge',
      intensity: 'Beginner',
      description: 'A simple but effective challenge to get you moving. Reach 10,000 steps in a single day and kickstart your cardio health.',
    },
    {
      id: '3',
      title: '30-Day Yoga Flow',
      category: 'Yoga • 30 Days',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop',
      icon: 'leaf-outline',
      duration: '30 Days',
      participants: '12.4k',
      reward: 'Zen Master',
      intensity: 'Advanced',
      description: 'Master the art of mindfulness and flexibility through a daily guided flow designed to align your mind, body, and spirit.',
    },
    {
      id: '4',
      title: 'Core Crusher',
      category: 'Abs • 2 Weeks',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000&auto=format&fit=crop',
      icon: 'fitness-outline',
      duration: '14 Days',
      participants: '18.9k',
      reward: 'Iron Core',
      intensity: 'Intermediate',
      description: 'Build a rock-solid core with this targeted 14-day intensive program focusing on stability, power, and definition.',
    },
  ];

  const featured = challenges.find(c => c.isFeatured);
  const others = challenges.filter(c => !c.isFeatured);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FF794A" />
        </TouchableOpacity>
        <Text style={styles.logoText}>FITLIFE</Text>
        <TouchableOpacity>
          <Icon name="notifications-outline" size={24} color="#FF794A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>CHALLENGES</Text>
          <Text style={styles.subTitle}>
            Push your boundaries. Join global movements and track your progress against the best.
          </Text>
        </View>

        {/* Featured Joined Challenge - Summer Shred */}
        <TouchableOpacity 
          style={styles.featuredCardContainer}
          onPress={() => navigation.navigate('ChallengeDetail', { challenge: featured })}
        >
          <View style={styles.inProgressBadge}>
            <Text style={styles.inProgressText}>IN PROGRESS</Text>
          </View>
          
          <View style={styles.featuredCard}>
            <Image 
              source={{ uri: featured.image }} 
              style={styles.featuredImage}
            />
            <View style={styles.cardContent}>
              <View style={styles.levelRow}>
                <Icon name="flash" size={14} color="#A43609" />
                <Text style={styles.levelText}>Level: {featured.level}</Text>
              </View>
              
              <Text style={styles.challengeName}>{featured.title.toUpperCase()}</Text>
              <Text style={styles.challengeDesc}>
                {featured.description}
              </Text>
              
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Current Progress</Text>
                <Text style={styles.progressPercent}>{featured.progress}%</Text>
              </View>
              
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${featured.progress}%` }]} />
              </View>
              
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.continueButton}
                  onPress={() => navigation.navigate('ChallengeDetail', { challenge: featured })}
                >
                  <Text style={styles.continueButtonText}>CONTINUE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareButton}>
                  <Icon name="share-social-outline" size={20} color="#2C2F31" />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.leaderboardButton}
                onPress={() => navigation.navigate('Leaderboard')}
              >
                <Text style={styles.leaderboardButtonText}>🏆 VIEW LEADERBOARD</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        {/* Secondary Challenges List */}
        <View style={styles.secondaryList}>
          {others.map((item) => (
            <ChallengeItem 
              key={item.id} 
              {...item} 
              onPress={() => navigation.navigate('ChallengeDetail', { challenge: item })}
            />
          ))}
        </View>

        {/* Global Stats Footer */}
        <View style={styles.globalStats}>
          <Text style={styles.globalTitle}>GLOBAL KINETIC PULSE</Text>
          <Text style={styles.globalSubTitle}>
            You're part of a community of 12,403 athletes pushing limits today. Don't stop now.
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>2.4M</Text>
              <Text style={styles.statLabel}>CALORIES BURNED</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>158K</Text>
              <Text style={styles.statLabel}>WORKOUTS DONE</Text>
            </View>
          </View>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const ChallengeItem = ({ title, category, image, icon, onPress }) => (
  <TouchableOpacity style={styles.itemCard} onPress={onPress}>
    <Image source={{ uri: image }} style={styles.itemImage} />
    <View style={styles.itemContentArea}>
      <View style={styles.itemHeader}>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={styles.itemCategory}>{category}</Text>
        </View>
        <View style={styles.itemIconContainer}>
          <Icon name={icon} size={20} color="#FF794A" />
        </View>
      </View>
      <View style={styles.joinNowButton}>
        <Text style={styles.joinNowText}>JOIN NOW</Text>
      </View>
    </View>
  </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF794A',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  titleSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C2F31',
    fontFamily: 'Inter',
  },
  subTitle: {
    fontSize: 16,
    color: '#595C5E',
    marginTop: 8,
    lineHeight: 24,
    fontFamily: 'Inter',
  },
  featuredCardContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  inProgressBadge: {
    position: 'absolute',
    top: -15,
    left: -10,
    backgroundColor: '#FF794A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  inProgressText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(223, 227, 230, 0.4)',
  },
  featuredImage: {
    width: '100%',
    height: 220,
  },
  cardContent: {
    padding: 32,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelText: {
    color: '#A43609',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  challengeName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C2F31',
    marginBottom: 12,
  },
  challengeDesc: {
    fontSize: 16,
    color: '#595C5E',
    lineHeight: 24,
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2C2F31',
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: '900',
    color: '#A43609',
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#DFE3E6',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF794A',
    borderRadius: 999,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#FF794A',
    height: 54,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  continueButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  shareButton: {
    width: 54,
    height: 54,
    backgroundColor: '#EEF1F3',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardButton: {
    backgroundColor: '#A43609',
    height: 54,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  leaderboardButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryList: {
    gap: 24,
    marginBottom: 40,
  },
  itemCard: {
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#F0F2F4',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  itemImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  itemContentArea: {
    padding: 20,
    backgroundColor: '#F0F2F4',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemIconContainer: {
    paddingTop: 4,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2C2F31',
    letterSpacing: 0.5,
  },
  itemCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#595C5E',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  joinNowButton: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  joinNowText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C2F31',
  },
  globalStats: {
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  globalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2C2F31',
    textAlign: 'center',
    marginBottom: 16,
  },
  globalSubTitle: {
    fontSize: 14,
    color: '#595C5E',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FF794A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#595C5E',
    letterSpacing: 0.5,
  },
});

export default ChallengesScreen;
