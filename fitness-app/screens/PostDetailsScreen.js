import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import styles from './styles/PostDetailsScreen.styles';

const PostDetailsScreen = ({ navigation, route }) => {
  // Use passed post data or generic mock data
  const post = route.params?.post || {
    id: '1',
    user: 'Elena Rodriguez',
    time: '7 hours ago',
    content: 'Finally hit my 100kg deadlift milestone! Consistency is the only secret. No shortcuts, just hard work and the right fuel. 🔥',
    image: 'https://images.unsplash.com/photo-1541534741688-6078c65b5a33?auto=format&fit=crop&q=80',
    likes: '1.2k',
    comments: '84',
    avatar: 'https://i.pravatar.cc/150?u=elena',
    title: 'Redefining Morning Kinetic Flow.',
  };

  const [commentText, setCommentText] = useState('');
  const [isFollowed, setIsFollowed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const mockComments = [
    {
      id: 'c1',
      user: 'sarah_peak',
      time: '2h ago',
      text: 'That mobility flow looks intense! Definitely adding this to my warm-up tomorrow. 🔥',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
    },
    {
      id: 'c2',
      user: 'dave_kinetic',
      time: '4h ago',
      text: 'The lighting in that gym is everything! Great work Elena.',
      avatar: 'https://i.pravatar.cc/150?u=dave',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#2C2F31" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FITLIFE</Text>
        <TouchableOpacity style={styles.optionsBtn}>
          <Icon name="ellipsis-vertical" size={24} color="#2C2F31" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroContainer}>
            <Image 
              source={typeof post.image === 'string' ? { uri: post.image } : post.image} 
              style={styles.heroImage} 
            />
            <View style={styles.spotlightBadge}>
              <Text style={styles.spotlightText}>Community Spotlight</Text>
            </View>
          </View>

          {/* User Profile Info */}
          <View style={styles.userSection}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: post.avatar }} style={styles.userAvatar} />
            </View>
            <View style={styles.userMeta}>
              <Text style={styles.userName}>{post.user}</Text>
              <Text style={styles.userTitle}>Certified Yoga & Mobility Coach</Text>
            </View>
            <TouchableOpacity 
              style={[styles.followBtn, isFollowed && { backgroundColor: '#FF794A' }]}
              onPress={() => setIsFollowed(!isFollowed)}
            >
              <Text style={[styles.followBtnText, isFollowed && { color: '#FFF' }]}>
                {isFollowed ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.mainTitle}>
              Redefining Morning {'\n'}
              <Text style={styles.accentTitle}>Kinetic Flow.</Text>
            </Text>
            <Text style={styles.bodyText}>
              Consistency isn't about perfection; it's about showing up when you'd rather stay in bed. 
              Today's session focused on hip mobility and explosive transitions.{'\n\n'}
              The secret to a 5 AM start? Prepare your gear the night before and don't negotiate with your alarm clock. 
              Movement is a privilege, let's treat it that way.
            </Text>

            <View style={styles.hashtagContainer}>
              {['#KineticPulse', '#MorningRoutine', '#MovementIsMedicine', '#PerformanceLifestyle', '#AthleteMindset'].map((tag, idx) => (
                <Text key={idx} style={styles.hashtag}>{tag}</Text>
              ))}
            </View>
          </View>

          {/* Interaction Section */}
          <View style={styles.interactionSection}>
            <View style={styles.statsBar}>
              <TouchableOpacity style={styles.statItem} onPress={() => setIsLiked(!isLiked)}>
                <Icon 
                  name={isLiked ? "heart" : "heart-outline"} 
                  size={28} 
                  color={isLiked ? "#EF4444" : "#2C2F31"} 
                />
                <Text style={styles.statText}>1,284</Text>
              </TouchableOpacity>
              <View style={styles.statItem}>
                <Icon name="chatbubble-outline" size={26} color="#2C2F31" />
                <Text style={styles.statText}>42</Text>
              </View>
              <TouchableOpacity style={styles.saveBtn}>
                <Icon name="bookmark-outline" size={26} color="#2C2F31" />
              </TouchableOpacity>
            </View>

            <View style={styles.socialProof}>
              <View style={styles.miniAvatars}>
                <View style={styles.miniAvatar} />
                <View style={[styles.miniAvatar, { marginLeft: -12 }]} />
                <View style={[styles.miniAvatar, { marginLeft: -12 }]} />
              </View>
              <Text style={styles.socialProofText}>
                Liked by <Text style={styles.boldText}>marcus_fit</Text> and <Text style={styles.boldText}>1,283 others</Text>
              </Text>
            </View>
          </View>

          {/* Comments Feed */}
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>Comments</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          {mockComments.map(comment => (
            <View key={comment.id} style={styles.commentCard}>
              <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
              <View style={styles.commentContent}>
                <View style={styles.commentUserHeader}>
                  <Text style={styles.commentUser}>{comment.user}</Text>
                  <Text style={styles.commentTime}>{comment.time}</Text>
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Floating Input Bar */}
        <View style={styles.inputWrapper}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Add a comment..."
                placeholderTextColor="#ABADAF"
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity>
                <Text style={styles.postBtnText}>Post</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default PostDetailsScreen;
