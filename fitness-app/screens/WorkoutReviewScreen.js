import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { styles } from './styles/WorkoutReviewScreen.styles';

const VIBES = [
  { id: 'poor', emoji: '😩', label: 'Poor' },
  { id: 'okay', emoji: '😐', label: 'Okay' },
  { id: 'good', emoji: '🙂', label: 'Good' },
  { id: 'great', emoji: '🤩', label: 'Great' },
  { id: 'amazing', emoji: '🔥', label: 'Amazing' },
];

const INTENSITIES = ['Too Easy', 'Perfect', 'Too Hard'];

const WorkoutReviewScreen = ({ route, navigation }) => {
  const { sessionData = {}, calories = 350, duration = 45, plan = null } = route.params || {};

  const [selectedVibe, setSelectedVibe] = useState('great');
  const [intensity, setIntensity] = useState('Perfect');
  const [notes, setNotes] = useState('');

  const handleFinish = () => {
    // Save logic here
    if (plan) {
      // If we came from a specific plan, go back to it
      navigation.navigate('WorkoutPlanDetail', { plan });
    } else {
      // Otherwise go to main dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="chevron-back" size={24} color="#A8390D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Complete</Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroLabel}>Post-Workout Review</Text>
            <Text style={styles.heroTitle}>How was your{"\n"}workout?</Text>
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconCircle}>
                <Icon name="fitness" size={28} color="#A8390D" />
              </View>
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryTitle} numberOfLines={2}>
                  {sessionData.dayName || 'Morning HIIT Session'}
                </Text>
                <Text style={styles.summaryText}>
                  {duration} MIN • {calories} KCAL BURNED
                </Text>
              </View>
            </View>
          </View>

          {/* Overall Vibe */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overall Vibe</Text>
            <View style={styles.vibeRow}>
              {VIBES.map((v) => (
                <TouchableOpacity 
                  key={v.id} 
                  style={styles.vibeItem}
                  onPress={() => setSelectedVibe(v.id)}
                >
                  <View style={[
                    styles.emojiContainer, 
                    selectedVibe === v.id && styles.emojiSelected
                  ]}>
                    <Text style={styles.emojiText}>{v.emoji}</Text>
                  </View>
                  <Text style={[
                    styles.vibeLabel,
                    selectedVibe === v.id && styles.vibeLabelSelected
                  ]}>
                    {v.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Intensity Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How intense was it?</Text>
            <View style={styles.intensityOptions}>
              {INTENSITIES.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.intensityPill,
                    intensity === opt && styles.intensityPillSelected
                  ]}
                  onPress={() => setIntensity(opt)}
                >
                  <Text style={[
                    styles.intensityPillText,
                    intensity === opt && styles.intensityPillTextSelected
                  ]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Body Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Body Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Optional note (e.g. how did your body feel?)"
              placeholderTextColor="rgba(98, 98, 98, 0.5)"
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* Consistency Footer Card */}
          <View style={styles.consistencyCard}>
            <Image 
              source={{ uri: 'https://placehold.co/600x400/A8390D/FFFFFF?text=Consistency' }} 
              style={styles.streakImage} 
            />
            <View style={styles.streakInfo}>
              <View style={styles.streakIconBox}>
                 <Icon name="medal" size={80} color="#A8390D" />
              </View>
              <Text style={styles.streakTitle}>Elite{"\n"}consistency.</Text>
              <Text style={styles.streakText}>
                You haven't missed{"\n"}a morning session{"\n"}in 12 days.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleFinish}>
          <Text style={styles.saveButtonText}>Save & Finish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WorkoutReviewScreen;
