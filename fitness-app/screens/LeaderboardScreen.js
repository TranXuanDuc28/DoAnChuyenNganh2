import React, { useState } from 'react';
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
  TextInput,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const LeaderboardScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Global');

  const renderLeaderboard = () => (
    <View style={styles.tabContent}>
      {/* Podium Section */}
      <View style={styles.podiumContainer}>
        {/* Second Place */}
        <View style={styles.podiumItem}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200' }} 
              style={styles.avatar} 
            />
            <View style={[styles.rankBadge, styles.normalBadge]}>
              <Text style={styles.rankText}>2</Text>
            </View>
          </View>
          <Text style={styles.podiumName}>Sarah J.</Text>
          <Text style={styles.podiumPts}>14,290 PTS</Text>
        </View>

        {/* First Place */}
        <View style={[styles.podiumItem, styles.winnerItem]}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200' }} 
              style={[styles.avatar, styles.winnerAvatar]} 
            />
            <View style={[styles.rankBadge, styles.winnerBadge]}>
              <Text style={styles.rankText}>1</Text>
            </View>
            <View style={styles.crownContainer}>
              <Icon name="star" size={14} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.podiumName}>Marcus V.</Text>
          <Text style={styles.podiumPts}>15,840 PTS</Text>
        </View>

        {/* Third Place */}
        <View style={styles.podiumItem}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200' }} 
              style={styles.avatar} 
            />
            <View style={[styles.rankBadge, styles.normalBadge]}>
              <Text style={styles.rankText}>3</Text>
            </View>
          </View>
          <Text style={styles.podiumName}>David K.</Text>
          <Text style={styles.podiumPts}>13,100 PTS</Text>
        </View>
      </View>

      {/* Leaderboard List */}
      <View style={styles.listContainer}>
        {LEADERBOARD_DATA.map((item, index) => (
          <View key={index} style={[styles.listItem, item.isUser && styles.userListItem]}>
            <Text style={[styles.listRank, item.isUser && styles.userText]}>{item.rank}</Text>
            <Image source={{ uri: item.image }} style={styles.listAvatar} />
            <View style={styles.listInfo}>
              <Text style={[styles.listName, item.isUser && styles.userText]}>{item.name}</Text>
              <Text style={[styles.listXp, item.isUser && styles.userSubText]}>{item.xp}</Text>
            </View>
            <Text style={[styles.listPts, item.isUser && styles.userText]}>{item.pts}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderFriends = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity style={styles.addFriendBtn}>
        <Icon name="person-add" size={20} color="#000" />
        <Text style={styles.addFriendText}>Add Friend</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color="#595C5E" />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search friends by name or handle..."
          placeholderTextColor="#6B7280"
        />
      </View>

      {FRIENDS_DATA.map((friend) => (
        <View key={friend.id} style={styles.friendCard}>
          <View style={styles.friendHeader}>
            <View style={styles.friendAvatarContainer}>
              <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
              {friend.status === 'Online Now' && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.friendMeta}>
              <Text style={styles.memberType}>{friend.type.toUpperCase()} MEMBER</Text>
              <Text style={styles.streakText}>{friend.streak} Streak</Text>
            </View>
          </View>
          
          <View style={styles.friendInfo}>
            <Text style={styles.friendName}>{friend.name}</Text>
            <Text style={styles.friendHandle}>{friend.handle}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusIndicator, friend.status !== 'Online Now' && styles.statusAway]} />
              <Text style={[styles.statusText, friend.status !== 'Online Now' && styles.statusTextAway]}>
                {friend.status}
              </Text>
            </View>
          </View>

          <View style={styles.friendActions}>
            <TouchableOpacity style={styles.chatBtn}>
              <Icon name="chatbubble-outline" size={18} color="#2C2F31" />
              <Text style={styles.chatBtnText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.challengeBtn}>
              <Icon name="flash" size={18} color="#FFEFEB" />
              <Text style={styles.challengeBtnText}>Challenge</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Discover Section */}
      <View style={styles.discoverCard}>
        <Text style={styles.discoverTitle}>DISCOVER YOUR SQUAD</Text>
        <Text style={styles.discoverSub}>Based on your morning cardio habits, you might vibe with these athletes.</Text>
        <View style={styles.squadAvatars}>
          {['https://i.pravatar.cc/100?u=1', 'https://i.pravatar.cc/100?u=2', 'https://i.pravatar.cc/100?u=3'].map((url, i) => (
            <Image key={i} source={{ uri: url }} style={[styles.squadImg, { marginLeft: i === 0 ? 0 : -15 }]} />
          ))}
          <View style={styles.squadMore}>
            <Text style={styles.squadMoreText}>+24</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.exploreBtn}>
          <Text style={styles.exploreBtnText}>EXPLORE SUGGESTIONS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Icon name="arrow-back" size={24} color="#FF794A" />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>FITLIFE</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Icon name="notifications-outline" size={24} color="#FF794A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>LEADERBOARD</Text>
        </View>

        {/* Tabs and Share */}
        <View style={styles.actionRow}>
          <View style={styles.tabSwitcherWrapper}>
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'Global' && styles.activeTab]}
                onPress={() => setActiveTab('Global')}
              >
                <Text style={[styles.tabText, activeTab === 'Global' && styles.activeTabText]}>Global</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'Friends' && styles.activeTab]}
                onPress={() => setActiveTab('Friends')}
              >
                <Text style={[styles.tabText, activeTab === 'Friends' && styles.activeTabText]}>Friends</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.shareBtnWrapper}>
            <TouchableOpacity style={styles.shareButton}>
              <Icon name="share-social-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {activeTab === 'Global' ? renderLeaderboard() : renderFriends()}
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const LEADERBOARD_DATA = [
  { rank: 4, name: 'Elena Rodriguez', xp: '12.5K WEEKLY XP', pts: '12,450', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200' },
  { rank: 5, name: 'Alex Sterling (You)', xp: '11.9K WEEKLY XP', pts: '11,890', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200', isUser: true },
  { rank: 6, name: 'Jordan Smith', xp: '10.2K WEEKLY XP', pts: '10,180', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200' },
  { rank: 7, name: 'Maya Patel', xp: '9.8K WEEKLY XP', pts: '9,820', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200' },
];

const FRIENDS_DATA = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    handle: '@sarah_kinetic',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    type: 'Pro',
    streak: '128',
    status: 'Online Now'
  },
  {
    id: '2',
    name: 'Marcus Thorne',
    handle: '@m_thorne',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    type: 'Casual',
    streak: '42',
    status: 'Away - 2h ago'
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    handle: '@elena_fit',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    type: 'Elite',
    streak: '312',
    status: 'Online Now'
  },
  {
    id: '4',
    name: 'David Chen',
    handle: '@dchen_88',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    type: 'Core',
    streak: '15',
    status: 'Online Now'
  }
];

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
  headerLogo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF794A',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  titleContainer: {
    height: 80,
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: '#2C2F31',
    letterSpacing: -1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 16,
  },
  tabSwitcherWrapper: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 32,
    padding: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  activeTab: {
    backgroundColor: '#FF794A',
    shadowColor: '#FF794A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
    fontFamily: 'Inter',
  },
  activeTabText: {
    color: '#2C1000',
  },
  shareBtnWrapper: {
    width: 56,
    height: 56,
  },
  sharePlaceholder: {
    width: 56,
    height: 56,
  },
  shareButton: {
    width: 56,
    height: 56,
    backgroundColor: '#A43609',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A43609',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  tabContent: {
    flex: 1,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 48,
  },
  podiumItem: {
    alignItems: 'center',
    width: width * 0.25,
  },
  winnerItem: {
    width: width * 0.35,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#D9DDE0',
  },
  winnerAvatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderColor: '#FF794A',
  },
  rankBadge: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  normalBadge: {
    backgroundColor: '#D9DDE0',
  },
  winnerBadge: {
    backgroundColor: '#FF794A',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rankText: {
    color: '#2C2F31',
    fontSize: 14,
    fontWeight: '800',
  },
  crownContainer: {
    position: 'absolute',
    top: -15,
    alignSelf: 'center',
    backgroundColor: '#FF794A',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C2F31',
    marginTop: 8,
  },
  podiumPts: {
    fontSize: 12,
    fontWeight: '900',
    color: '#A43609',
    marginTop: 4,
  },
  listContainer: {
    gap: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    padding: 16,
    borderRadius: 40,
  },
  userListItem: {
    backgroundColor: '#FF794A',
    shadowColor: '#FF794A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  listRank: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C2F31',
    width: 30,
  },
  listAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C2F31',
  },
  listXp: {
    fontSize: 12,
    fontWeight: '600',
    color: '#595C5E',
    marginTop: 2,
  },
  listPts: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2C2F31',
  },
  userText: {
    color: '#FFFFFF',
  },
  userSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // Friends View Styles
  addFriendBtn: {
    flexDirection: 'row',
    backgroundColor: '#FF794A',
    padding: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  addFriendText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    padding: 12,
    borderRadius: 999,
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2C2F31',
    padding: 0,
  },
  friendCard: {
    backgroundColor: '#F2F2F2',
    borderRadius: 32,
    padding: 24,
    marginBottom: 16,
  },
  friendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  friendAvatarContainer: {
    position: 'relative',
  },
  friendAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: 'rgba(255, 121, 74, 0.2)',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#F2F2F2',
  },
  friendMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  memberType: {
    fontSize: 11,
    fontWeight: '900',
    color: '#A43609',
  },
  streakText: {
    fontSize: 13,
    color: '#595C5E',
  },
  friendInfo: {
    marginBottom: 20,
  },
  friendName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2F31',
  },
  friendHandle: {
    fontSize: 16,
    color: '#595C5E',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  statusAway: {
    backgroundColor: '#A8A29E',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  statusTextAway: {
    color: '#A8A29E',
  },
  friendActions: {
    flexDirection: 'row',
    gap: 12,
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#D9DDE0',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  chatBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C2F31',
  },
  challengeBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#A43609',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  challengeBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFEFEB',
  },
  discoverCard: {
    backgroundColor: '#FF794A',
    borderRadius: 32,
    padding: 24,
    marginTop: 16,
  },
  discoverTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2C2F31',
    marginBottom: 12,
  },
  discoverSub: {
    fontSize: 16,
    color: '#2C2F31',
    lineHeight: 22,
    marginBottom: 20,
  },
  squadAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  squadImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FF794A',
  },
  squadMore: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -15,
    borderWidth: 2,
    borderColor: '#FF794A',
  },
  squadMoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF794A',
  },
  exploreBtn: {
    backgroundColor: '#2C1000',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  exploreBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default LeaderboardScreen;
