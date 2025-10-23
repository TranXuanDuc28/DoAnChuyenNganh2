import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';

const SocialScreen = () => {
  const [selectedTab, setSelectedTab] = useState('feed');

  const feedPosts = [
    {
      id: 1,
      user: {
        name: 'Sarah Johnson',
        avatar: 'person-circle',
        verified: true,
      },
      content: 'Just completed a 5K run! Feeling amazing and energized 💪',
      type: 'workout',
      stats: { likes: 24, comments: 8, shares: 3 },
      timeAgo: '2 hours ago',
      image: null,
    },
    {
      id: 2,
      user: {
        name: 'Mike Chen',
        avatar: 'person-circle',
        verified: false,
      },
      content: 'New personal best in deadlift today! 225 lbs 🏋️‍♂️',
      type: 'achievement',
      stats: { likes: 45, comments: 12, shares: 6 },
      timeAgo: '4 hours ago',
      image: null,
    },
    {
      id: 3,
      user: {
        name: 'Emma Wilson',
        avatar: 'person-circle',
        verified: true,
      },
      content: 'Healthy meal prep for the week is complete! 🥗',
      type: 'nutrition',
      stats: { likes: 18, comments: 5, shares: 2 },
      timeAgo: '6 hours ago',
      image: null,
    },
  ];

  const challenges = [
    {
      id: 1,
      title: '30-Day Fitness Challenge',
      description: 'Complete 30 minutes of exercise every day',
      participants: 1247,
      daysLeft: 15,
      progress: 65,
      image: 'fitness',
      color: '#FF6B6B',
    },
    {
      id: 2,
      title: '10K Steps Daily',
      description: 'Walk 10,000 steps every day this month',
      participants: 892,
      daysLeft: 8,
      progress: 80,
      image: 'walk',
      color: '#4ECDC4',
    },
    {
      id: 3,
      title: 'Hydration Hero',
      description: 'Drink 8 glasses of water daily',
      participants: 567,
      daysLeft: 22,
      progress: 45,
      image: 'water',
      color: '#2196F3',
    },
  ];

  const leaderboard = [
    { id: 1, name: 'Alex Thompson', points: 2847, rank: 1, avatar: 'person-circle' },
    { id: 2, name: 'Sarah Johnson', points: 2634, rank: 2, avatar: 'person-circle' },
    { id: 3, name: 'Mike Chen', points: 2456, rank: 3, avatar: 'person-circle' },
    { id: 4, name: 'Emma Wilson', points: 2234, rank: 4, avatar: 'person-circle' },
    { id: 5, name: 'You', points: 2156, rank: 5, avatar: 'person-circle', isCurrentUser: true },
  ];

  const tabs = [
    { id: 'feed', title: 'Feed', icon: 'home' },
    { id: 'challenges', title: 'Challenges', icon: 'trophy' },
    { id: 'leaderboard', title: 'Leaderboard', icon: 'podium' },
  ];

  const renderFeedPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Icon name={item.user.avatar} size={40} color="#007AFF" />
          <View style={styles.userDetails}>
            <View style={styles.userNameContainer}>
              <Text style={styles.userName}>{item.user.name}</Text>
              {item.user.verified && (
                <Icon name="checkmark-circle" size={16} color="#007AFF" />
              )}
            </View>
            <Text style={styles.postTime}>{item.timeAgo}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Icon name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="heart-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{item.stats.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{item.stats.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="share-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{item.stats.shares}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderChallenge = ({ item }) => (
    <TouchableOpacity style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <View style={[styles.challengeIcon, { backgroundColor: item.color }]}>
          <Icon name={item.image} size={24} color="#fff" />
        </View>
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>{item.title}</Text>
          <Text style={styles.challengeDescription}>{item.description}</Text>
        </View>
      </View>

      <View style={styles.challengeStats}>
        <View style={styles.challengeStat}>
          <Text style={styles.challengeStatValue}>{item.participants}</Text>
          <Text style={styles.challengeStatLabel}>Participants</Text>
        </View>
        <View style={styles.challengeStat}>
          <Text style={styles.challengeStatValue}>{item.daysLeft}</Text>
          <Text style={styles.challengeStatLabel}>Days Left</Text>
        </View>
        <View style={styles.challengeStat}>
          <Text style={styles.challengeStatValue}>{item.progress}%</Text>
          <Text style={styles.challengeStatLabel}>Progress</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${item.progress}%`,
              backgroundColor: item.color,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );

  const renderLeaderboardItem = ({ item }) => (
    <View style={[styles.leaderboardItem, item.isCurrentUser && styles.currentUserItem]}>
      <View style={styles.rankContainer}>
        <View style={[styles.rankBadge, { backgroundColor: getRankColor(item.rank) }]}>
          <Text style={styles.rankText}>{item.rank}</Text>
        </View>
      </View>
      <Icon name={item.avatar} size={40} color="#007AFF" />
      <View style={styles.leaderboardInfo}>
        <Text style={[styles.leaderboardName, item.isCurrentUser && styles.currentUserName]}>
          {item.name}
        </Text>
        <Text style={styles.leaderboardPoints}>{item.points.toLocaleString()} points</Text>
      </View>
    </View>
  );

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return '#666';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Social</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="search" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, selectedTab === tab.id && styles.activeTab]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={selectedTab === tab.id ? '#007AFF' : '#666'}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {selectedTab === 'feed' && (
          <View>
            <TouchableOpacity style={styles.createPostButton}>
              <Icon name="create" size={20} color="#007AFF" />
              <Text style={styles.createPostText}>Share your progress</Text>
            </TouchableOpacity>
            <FlatList
              data={feedPosts}
              renderItem={renderFeedPost}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        {selectedTab === 'challenges' && (
          <View>
            <Text style={styles.sectionTitle}>Active Challenges</Text>
            <FlatList
              data={challenges}
              renderItem={renderChallenge}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        {selectedTab === 'leaderboard' && (
          <View>
            <Text style={styles.sectionTitle}>Weekly Leaderboard</Text>
            <View style={styles.leaderboardContainer}>
              <FlatList
                data={leaderboard}
                renderItem={renderLeaderboardItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#f0f8ff',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 16,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  createPostText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  postTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  challengeStat: {
    alignItems: 'center',
  },
  challengeStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  challengeStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  leaderboardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currentUserItem: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    marginHorizontal: -8,
    paddingHorizontal: 8,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  leaderboardInfo: {
    flex: 1,
    marginLeft: 16,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  currentUserName: {
    color: '#007AFF',
  },
  leaderboardPoints: {
    fontSize: 14,
    color: '#666',
  },
});

export default SocialScreen;
