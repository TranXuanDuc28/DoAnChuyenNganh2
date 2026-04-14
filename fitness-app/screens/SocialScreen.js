import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import styles from './styles/SocialScreen.styles';

const { width } = Dimensions.get('window');

const CHALLENGES = [
  {
    id: '1',
    title: 'Morning HIIT Blast',
    participants: '4.2k Active Participants',
    badge: '14 DAYS LEFT',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    title: 'Mindful Yoga',
    participants: '1.8k Active Participants',
    badge: 'NEW',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80',
  },
];

const FEED_POSTS = [
  {
    id: '1',
    user: 'Elena Rodriguez',
    time: '7 hours ago',
    content: 'Finally hit my 100kg deadlift milestone! Consistency is the only secret. No shortcuts, just hard work and the right fuel. 🔥 #LegDay #StrengthTraining #PRDay',
    image: require('../assets/images/post1.png'),
    likes: '1.2k',
    comments: '84',
    avatar: 'https://i.pravatar.cc/150?u=elena',
  },
  {
    id: '2',
    user: 'Elena Rodriguez',
    time: '3 hours ago',
    content: 'Post-workout power bowl. Smoked salmon, quinoa, avocado, and all the greens. Fueling the recovery properly today. 🥗🥑 #Fueling #HealthyEating #FitFood',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80',
    likes: '856',
    comments: '42',
    avatar: 'https://i.pravatar.cc/150?u=elena',
  },
];

const SocialScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState({});

  const toggleLike = (id) => {
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderQuickPost = () => (
    <View style={styles.quickPostContainer}>
      <View style={styles.userAvatarSmall}>
        {user?.profileImage ? (
          <Image source={{ uri: user.profileImage }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <View style={{ width: '100%', height: '100%', backgroundColor: '#DFE3E6', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="person" size={24} color="#94A3B8" />
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.quickPostInput} activeOpacity={0.8}>
        <Text style={styles.quickPostText}>What's on your mind?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.imageIconBtn}>
        <Icon name="image-outline" size={24} color="#FF794A" />
      </TouchableOpacity>
    </View>
  );

  const renderChallengeCard = ({ item }) => (
    <TouchableOpacity style={styles.challengeCard} activeOpacity={0.9}>
      <Image source={{ uri: item.image }} style={styles.challengeImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.challengeGradient}
      >
        <View style={styles.challengeBadge}>
          <Text style={styles.challengeBadgeText}>{item.badge}</Text>
        </View>
        <Text style={styles.challengeTitle}>{item.title}</Text>
        <Text style={styles.challengeStats}>{item.participants}</Text>
        <TouchableOpacity style={styles.joinBtn}>
          <Text style={styles.joinBtnText}>Join Challenge</Text>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderPost = (post) => (
    <TouchableOpacity
      key={post.id}
      style={styles.postCard}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('PostDetails', { post })}
    >
      <View style={styles.postHeader}>
        <Image source={{ uri: post.avatar }} style={styles.postAvatar} />
        <View style={styles.postUserMeta}>
          <Text style={styles.postUserName}>{post.user}</Text>
          <Text style={styles.postTime}>{post.time}</Text>
        </View>
        <TouchableOpacity>
          <Icon name="ellipsis-horizontal" size={20} color="#ABADAF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      {post.image && (
        <Image 
          source={typeof post.image === 'string' ? { uri: post.image } : post.image} 
          style={styles.postImage} 
        />
      )}

      <View style={styles.interactionBar}>
        <TouchableOpacity style={styles.interactionItem} onPress={(e) => {
          e.stopPropagation();
          toggleLike(post.id);
        }}>
          <Icon
            name={likes[post.id] ? "heart" : "heart-outline"}
            size={22}
            color={likes[post.id] ? "#EF4444" : "#595C5E"}
          />
          <Text style={styles.interactionText}>{post.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactionItem}
          onPress={() => navigation.navigate('PostDetails', { post: { ...post, autoFocusComment: true } })}
        >
          <Icon name="chatbubble-outline" size={20} color="#595C5E" />
          <Text style={styles.interactionText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareBtn}>
          <Icon name="share-social-outline" size={22} color="#595C5E" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderQuickPost()}

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.trendingTag}>Trending Now</Text>
            <Text style={styles.sectionTitle}>Challenges</Text>
          </View>
          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={CHALLENGES}
          renderItem={renderChallengeCard}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.challengesScroll}
          snapToInterval={280 + 16}
          decelerationRate="fast"
        />

        <View style={styles.feedContainer}>
          <Text style={styles.feedHeaderTitle}>Community Feed</Text>
          {FEED_POSTS.map(post => renderPost(post))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SocialScreen;