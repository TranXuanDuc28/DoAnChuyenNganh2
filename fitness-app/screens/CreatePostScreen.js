import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const CreatePostScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [postContent, setPostContent] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerLogo}>FITLIFE</Text>
        <TouchableOpacity style={styles.postBtn}>
          <Text style={styles.postBtnText}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Context */}
        <View style={styles.userContext}>
          <View style={styles.avatarContainer}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#DFE3E6', alignItems: 'center', justifyContent: 'center' }]}>
                <Icon name="person" size={32} color="#94A3B8" />
              </View>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Alex Rivera'}</Text>
            <View style={styles.communityBadge}>
              <Icon name="globe-outline" size={12} color="#595C5E" />
              <Text style={styles.communityText}>Community</Text>
            </View>
          </View>
        </View>

        {/* Post Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="What's your kinetic energy today?"
            placeholderTextColor="#D0D5D8"
            multiline
            value={postContent}
            onChangeText={setPostContent}
            textAlign="center"
          />
        </View>

        {/* Media Placeholder */}
        <TouchableOpacity style={styles.mediaCard}>
          <View style={styles.addMediaCircle}>
            <Icon name="camera" size={28} color="#000" />
            <View style={styles.plusBadge}>
              <Icon name="add" size={12} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.addMediaTitle}>Add Media</Text>
          <Text style={styles.addMediaSub}>Photos or high-res video</Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionBtn}>
            <Icon name="pricetag-outline" size={20} color="#A43609" />
            <Text style={styles.actionBtnText}>Workout Stats</Text>
          </TouchableOpacity>
          
          <View style={styles.rowActions}>
            <TouchableOpacity style={[styles.actionBtn, { flex: 1 }]}>
              <Icon name="people-outline" size={20} color="#A43609" />
              <Text style={styles.actionBtnText}>Mention Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { marginLeft: 12 }]}>
              <Icon name="location-outline" size={20} color="#A43609" />
              <Text style={styles.actionBtnText}>Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Quick Attachment Bar */}
      <View style={styles.attachmentBar}>
        <TouchableOpacity style={styles.attachmentIcon}>
          <Icon name="image-outline" size={20} color="#595C5E" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.attachmentIcon}>
          <Icon name="videocam-outline" size={22} color="#595C5E" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.attachmentIcon}>
          <Icon name="happy-outline" size={22} color="#595C5E" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.attachmentIcon}>
          <Icon name="at-outline" size={22} color="#595C5E" />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.attachmentIcon}>
          <Icon name="ellipsis-horizontal" size={20} color="#595C5E" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(249, 115, 22, 0.05)',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  headerLogo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EA580C',
    letterSpacing: 1,
  },
  postBtn: {
    backgroundColor: '#FF794A',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  postBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  userContext: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 36,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: 'rgba(255, 121, 74, 0.1)',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2F31',
    marginBottom: 4,
  },
  communityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF1F3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  communityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#595C5E',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 36,
    minHeight: 130,
    justifyContent: 'center',
  },
  input: {
    fontSize: 30,
    fontWeight: '700',
    color: '#2C2F31',
    lineHeight: 36,
  },
  mediaCard: {
    backgroundColor: '#EEF1F3',
    width: '100%',
    aspectRatio: 1,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
  },
  addMediaCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF794A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  plusBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    backgroundColor: '#000',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF794A',
  },
  addMediaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2F31',
    marginBottom: 4,
  },
  addMediaSub: {
    fontSize: 14,
    color: '#595C5E',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 100,
  },
  rowActions: {
    flexDirection: 'row',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(171, 173, 175, 0.1)',
    alignSelf: 'flex-start',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C2F31',
    marginLeft: 8,
  },
  attachmentBar: {
    flexDirection: 'row',
    backgroundColor: '#EEF1F3',
    paddingHorizontal: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#DFE3E0',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});

export default CreatePostScreen;
