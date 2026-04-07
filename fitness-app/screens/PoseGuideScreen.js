import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons as Icon, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './styles/PoseGuideScreen.styles';

const { width } = Dimensions.get('window');

// Fallback assets if backend doesn't provide them
const FALLBACK_POSE_HERO = { uri: 'file:///C:/Users/MSI/.gemini/antigravity/brain/7647c6b0-d41e-4c7a-b9d1-e8b86eacb17e/pose_guide_hero_squat_1775411634728.png' };
const MISTAKE_HEELS = { uri: 'file:///C:/Users/MSI/.gemini/antigravity/brain/7647c6b0-d41e-4c7a-b9d1-e8b86eacb17e/heels_lifting_mistake_1775412354912.png' };
const MISTAKE_BACK = { uri: 'file:///C:/Users/MSI/.gemini/antigravity/brain/7647c6b0-d41e-4c7a-b9d1-e8b86eacb17e/rounded_back_mistake_1775412374629.png' };
const MISTAKE_KNEE = { uri: 'file:///C:/Users/MSI/.gemini/antigravity/brain/7647c6b0-d41e-4c7a-b9d1-e8b86eacb17e/knee_valgus_mistake_1775412389080.png' };

const PoseGuideScreen = ({ route, navigation }) => {
  const { exercise } = route.params || { exercise: { name: 'EXERCISE' } };
  const muscleGroupsStr = Array.isArray(exercise.muscleGroups) 
    ? exercise.muscleGroups.join(' & ').toUpperCase() 
    : 'PRIMARY MUSCLE GROUPS';

  const renderFloatingHeader = () => (
    <View style={styles.headerOverlay}>
      <TouchableOpacity 
        style={styles.iconCircle}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#1A1A1A" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconCircle}>
        <Icon name="share-outline" size={24} color="#1A1A1A" />
      </TouchableOpacity>
    </View>
  );

  const renderHero = () => (
    <View style={styles.heroSection}>
      <Image 
        source={exercise.imageUrl ? { uri: exercise.imageUrl } : FALLBACK_POSE_HERO} 
        style={styles.heroImage} 
      />
      
      {/* Play Button Overlay */}
      <TouchableOpacity 
        style={styles.playButtonContainer}
        onPress={() => navigation.navigate('VideoPlayer', { exercise })}
      >
        <Icon name="play" size={32} color="#FFFFFF" style={{ marginLeft: 4 }} />
      </TouchableOpacity>

      {/* Text Overlay */}
      <View style={styles.heroOverlay}>
        <Text style={styles.heroTitle}>{exercise.name?.toUpperCase() || 'EXERCISE'}</Text>
        <Text style={styles.heroSubTitle}>PRIMARY: {muscleGroupsStr}</Text>
      </View>
    </View>
  );

  const renderProTip = () => {
    const tip = Array.isArray(exercise.tips) && exercise.tips.length > 0 
      ? exercise.tips[0] 
      : 'Maintain controlled movement and focus on the mind-muscle connection for maximum results.';
    
    return (
      <View style={styles.proTipContainer}>
        <MaterialCommunityIcons name="lightbulb-on-outline" size={32} color="#FFFFFF" style={styles.lightBulbIcon} />
        <Text style={styles.proTipLabel}>PRO TIP: OPTIMIZE FORM</Text>
        <Text style={styles.proTipText}>{tip}</Text>
      </View>
    );
  };

  const renderExecution = () => {
    const instructions = Array.isArray(exercise.instructions) && exercise.instructions.length > 0
      ? exercise.instructions
      : [
          'Stand with feet shoulder-width apart.',
          'Lower your body while keeping your back straight.',
          'Return to the starting position with control.'
        ];

    return (
      <View style={styles.executionContainer}>
        <Text style={styles.executionTitle}>Execution</Text>
        
        <View style={styles.tagRow}>
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>CORE FOCUS</Text>
          </View>
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>
              {(exercise.difficulty || 'Intermediate').toUpperCase()}
            </Text>
          </View>
        </View>

        {instructions.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <Text style={styles.stepNumberText}>{(index + 1).toString().padStart(2, '0')}</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>STEP {index + 1}</Text>
              <Text style={styles.stepDesc}>{step}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderMistakes = () => {
    const mistakes = Array.isArray(exercise.commonMistakes) && exercise.commonMistakes.length > 0
      ? exercise.commonMistakes
      : [
          { label: 'HEELS LIFTING', desc: 'Shifting weight to your toes puts extreme stress on knee joints.', image: MISTAKE_HEELS },
          { label: 'ROUNDED BACK', desc: 'Losing spinal neutrality is the #1 cause of injury. Keep core tight.', image: MISTAKE_BACK },
          { label: 'KNEE VALGUS', desc: 'When knees cave inward, it signals weak abductors.', image: MISTAKE_KNEE }
        ];

    return (
      <View style={styles.mistakesSection}>
        <View style={styles.mistakesHeader}>
          <Icon name="close-circle" size={24} color="#EF4444" />
          <Text style={styles.mistakesTitle}>Common Mistakes</Text>
        </View>

        {mistakes.map((mistake, index) => (
          <View key={index} style={styles.mistakeCard}>
            <Image 
              source={typeof mistake.image === 'string' ? { uri: mistake.image } : mistake.image} 
              style={styles.mistakeImage} 
            />
            <Text style={styles.mistakeLabel}>{mistake.label?.toUpperCase()}</Text>
            <Text style={styles.mistakeDesc}>{mistake.desc}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {renderFloatingHeader()}
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        <View style={styles.main}>
          {renderHero()}
          {renderProTip()}
          {renderExecution()}
          {renderMistakes()}
        </View>
      </ScrollView>

      {/* Persistent Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.startBtn}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Pose', { exercise })}
        >
          <MaterialCommunityIcons name="timer-outline" size={24} color="#FFFFFF" />
          <Text style={styles.startBtnText}>START PRACTICE SET</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PoseGuideScreen;

