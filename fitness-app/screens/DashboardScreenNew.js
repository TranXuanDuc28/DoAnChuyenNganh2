import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const DashboardScreenNew = () => {
  const navigation = useNavigation();

  const notifications = [
    {
      id: '1',
      type: 'challenge',
      title: 'Challenge Update: You ranked #5 in HIIT Blast!',
      time: '2 hours ago',
      unread: true,
      icon: 'trophy-outline',
      iconBg: '#FF794A',
      iconColor: '#FFF',
    },
    {
      id: '2',
      type: 'coach',
      title: 'Coach Dave: Form looking tighter on those sprints.',
      time: '4 hours ago',
      unread: false,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop',
    },
    {
      id: '3',
      type: 'system',
      title: 'System: New workout plan ready for Monday.',
      time: 'Yesterday, 6:30 PM',
      unread: true,
      icon: 'calendar-outline',
      iconBg: '#F2F4F5',
      iconColor: '#2C2F31',
    },
    {
      id: '4',
      type: 'social',
      title: 'Friend Sarah: Liked your recent post.',
      time: 'Yesterday, 10:15 AM',
      unread: false,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
      socialIcon: 'heart',
    },
  ];

  const renderNotification = (item) => (
    <TouchableOpacity key={item.id} activeOpacity={0.8} style={styles.notificationCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.iconWrapper, { backgroundColor: item.iconBg }]}>
              <Icon name={item.icon} size={24} color={item.iconColor} />
            </View>
          )}
          {item.unread && <View style={styles.unreadDot} />}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <View style={styles.timeContainer}>
            {item.socialIcon && (
              <Icon name={item.socialIcon} size={14} color="#A43609" style={{ marginRight: 6 }} />
            )}
            <Text style={styles.notificationTime}>{item.time}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#FF794A" />
        </TouchableOpacity>
        <Text style={styles.headerBrand}>FITLIFE</Text>
        <TouchableOpacity style={styles.notificationIcon}>
          <Icon name="notifications" size={22} color="#FF794A" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Editorial Header */}
        <View style={styles.editorialHeader}>
          <Text style={styles.mainTitle}>Activity</Text>
          <Text style={styles.subtitle}>Stay updated with your kinetic journey.</Text>
        </View>

        {/* Section: Today */}
        <View style={styles.sectionHeader}>
          <View style={styles.todayBadge}>
            <Text style={styles.badgeText}>TODAY</Text>
          </View>
          <View style={styles.divider} />
        </View>

        {notifications.filter(n => !n.time.includes('Yesterday')).map(renderNotification)}

        {/* Section: Yesterday */}
        <View style={styles.sectionHeader}>
          <View style={styles.yesterdayBadge}>
            <Text style={styles.yesterdayBadgeText}>YESTERDAY</Text>
          </View>
          <View style={styles.divider} />
        </View>

        {notifications.filter(n => n.time.includes('Yesterday')).map(renderNotification)}

        {/* CTA Card */}
        <TouchableOpacity activeOpacity={0.9} style={styles.ctaCardContainer}>
          <LinearGradient
            colors={['#A43609', '#CD4B16']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaCard}
          >
            <View style={styles.ctaContent}>
              <Text style={styles.ctaTitle}>CRUSH YOUR{'\n'}MONDAY.</Text>
              <View style={styles.ctaButton}>
                <Text style={styles.ctaButtonText}>View Schedule</Text>
              </View>
            </View>
            <View style={styles.ctaDecoration}>
              <Text style={styles.ctaDecorationText}>GO</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Simplified Mobile Nav Placeholder (Matching Design) */}
      <View style={styles.bottomNav}>
        <View style={styles.navInner}>
          <TouchableOpacity style={styles.navItemActive}>
            <Icon name="home" size={20} color="#FFF" />
            <Text style={styles.navTextActive}>HOME</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
             <Icon name="barbell-outline" size={22} color="#8D94A0" />
             <Text style={styles.navText}>WORKOUTS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
             <Icon name="people-outline" size={22} color="#8D94A0" />
             <Text style={styles.navText}>COMMUNITY</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
             <Icon name="restaurant-outline" size={22} color="#8D94A0" />
             <Text style={styles.navText}>NUTRITION</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
             <Icon name="person-outline" size={22} color="#8D94A0" />
             <Text style={styles.navText}>PROFILE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  headerBrand: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF794A',
    letterSpacing: -0.5,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 140,
  },
  editorialHeader: {
    marginBottom: 48,
  },
  mainTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#2C2F31',
    lineHeight: 48,
    letterSpacing: -2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#595C5E',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  todayBadge: {
    backgroundColor: 'rgba(255, 121, 74, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 16,
  },
  yesterdayBadge: {
    backgroundColor: 'rgba(217, 221, 224, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 16,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#A43609',
    textTransform: 'uppercase',
  },
  yesterdayBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#595C5E',
    textTransform: 'uppercase',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E9EB',
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF794A',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2F31',
    lineHeight: 22,
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: 14,
    color: '#595C5E',
    opacity: 0.7,
    fontWeight: '500',
  },
  ctaCardContainer: {
    marginTop: 24,
    borderRadius: 48,
    overflow: 'hidden',
  },
  ctaCard: {
    padding: 32,
    paddingTop: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 220,
    position: 'relative',
  },
  ctaContent: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  ctaTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 38,
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  ctaButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  ctaDecoration: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    opacity: 0.1,
  },
  ctaDecorationText: {
    fontSize: 120,
    fontWeight: '900',
    color: '#FFF',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    height: 84,
    backgroundColor: '#FFFFFF',
    borderRadius: 42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  navInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  navItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF794A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
  },
  navTextActive: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  navText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#8D94A0',
    marginTop: 4,
  }
});

export default DashboardScreenNew;
