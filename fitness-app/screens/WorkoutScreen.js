import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { workoutAPI } from '../services/api';
import { styles } from './styles/WorkoutScreen.styles';

const getCurrentDayNumber = (startDate, duration) => {
  if (!startDate) return null;
  const today = new Date();
  const start = new Date(startDate);
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  const diffTime = today - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const dayNumber = diffDays + 1;
  const totalDays = duration * 7;
  if (dayNumber < 1 || dayNumber > totalDays) return null;
  return dayNumber;
};

const WorkoutScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('plans');
  const [searchQuery, setSearchQuery] = useState('');
  const [exerciseCategories, setExerciseCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState(null);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('week');

  const [workoutAtGym, setWorkoutAtGym] = useState(true);
  const [workoutAtHome, setWorkoutAtHome] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedTab === 'plans') fetchWorkoutPlans();
    else if (selectedTab === 'history') fetchHistory();
  }, [selectedTab]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    setCategoriesError('');
    try {
      const { data } = await workoutAPI.getExerciseCategories();
      const normalized = (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        englishName: item.englishName || item.english_name,
        imageUrl: item.imageUrl || item.image_url,
        backgroundColor: item.backgroundColor || item.background_color || '#f1f5f9',
        exerciseCount: Number(item.exerciseCount ?? 0),
      }));
      setExerciseCategories(normalized);
    } catch (error) {
      console.error('Failed to load exercise categories', error);
      setCategoriesError('Unable to load categories.');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchWorkoutPlans = async () => {
    setPlansLoading(true);
    try {
      const activeResponse = await workoutAPI.getActiveWorkoutPlan();
      if (activeResponse.data.success && activeResponse.data.data) {
        setActiveWorkoutPlan(activeResponse.data.data);
      }
      const allPlansResponse = await workoutAPI.getAllWorkoutPlans();
      if (allPlansResponse.data.success) {
        setWorkoutPlans(allPlansResponse.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setPlansLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await workoutAPI.getWorkoutHistory();
      if (response.data.success) {
        setRecentWorkouts(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleGenerateWorkoutPlan = async () => {
    setGeneratingPlan(true);
    try {
      const preferences = { duration: 4, frequency: 4, goal: 'general_fitness', focusAreas: [], workoutLocation: { atGym: workoutAtGym, atHome: workoutAtHome } };
      const response = await workoutAPI.generateAIWorkoutPlan(preferences);
      if (response.data.success) {
        const plan = response.data.data;
        setActiveWorkoutPlan(plan);
        await fetchWorkoutPlans();
      }
    } catch (error) {
      console.error('Failed to generate plan:', error);
      alert('Failed to create plan. Please try again.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const formatHistoryDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const tabs = [
    { id: 'plans', title: 'PLAN', icon: 'calendar' },
    { id: 'history', title: 'HISTORY', icon: 'time' },
    { id: 'exercises', title: 'WORKOUT', icon: 'fitness' },
  ];

  const groupedHistory = useMemo(() => {
    const groups = {};
    recentWorkouts.forEach(ex => {
      const dateKey = new Date(ex.date).toISOString().split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = {
          id: dateKey,
          date: ex.date,
          name: ex.dayName || ex.planName || 'Daily Workout',
          duration: 0,
          calories: 0,
          exercises: []
        };
      }
      groups[dateKey].duration += parseInt(ex.duration) || 0;
      groups[dateKey].calories += (ex.calories || 0);
      groups[dateKey].exercises.push(ex);
    });
    return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [recentWorkouts]);

  const filteredHistory = useMemo(() => {
    const now = new Date();
    const range = historyFilter === 'week' ? 7 : historyFilter === 'month' ? 30 : 365;
    const cutoff = new Date(now.setDate(now.getDate() - range));
    return groupedHistory.filter(session => new Date(session.date) >= cutoff);
  }, [groupedHistory, historyFilter]);

  const chartData = useMemo(() => {
    const bars = groupedHistory.slice(0, 7).map(s => ({ duration: s.duration, id: s.id })).reverse();
    while(bars.length < 7) bars.unshift({ duration: 0, id: `empty-${bars.length}` });
    const maxDuration = Math.max(...bars.map(b => b.duration), 60);
    const totalVolume = filteredHistory.reduce((sum, s) => sum + s.duration, 0);
    return { bars, maxDuration, totalVolume };
  }, [groupedHistory, filteredHistory]);

  const renderActivePlanCard = () => {
    if (!activeWorkoutPlan) {
      return (
        <View style={styles.emptyState}>
          <Icon name="sparkles-outline" size={80} color="#A8390D" style={{ opacity: 0.1, marginBottom: 20 }} />
          <Text style={styles.emptyStateText}>No active plan yet.{"\n"}Generate your unique AI-driven workout plan!</Text>
          <TouchableOpacity style={styles.generateButton} onPress={handleGenerateWorkoutPlan} disabled={generatingPlan}>
             {generatingPlan ? <ActivityIndicator color="white" /> : (
               <>
                <Icon name="sparkles" size={20} color="white" />
                <Text style={styles.generateButtonText}>Generate AI Plan</Text>
               </>
             )}
          </TouchableOpacity>
        </View>
      );
    }

    const progressPercentage = activeWorkoutPlan.progressPercentage || 0;
    const todayDayNumber = getCurrentDayNumber(activeWorkoutPlan.startDate, activeWorkoutPlan.duration);
    const currentWeek = todayDayNumber ? Math.ceil(todayDayNumber / 7) : 1;
    const totalWeeks = activeWorkoutPlan.duration || 4;
    const todayDay = todayDayNumber && activeWorkoutPlan.days ? activeWorkoutPlan.days.find(d => d.dayNumber === todayDayNumber) : null;

    return (
      <View>
        <LinearGradient colors={['#FF7849', '#A8390D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.activePlanCard}>
          <View style={styles.blob1} /><View style={styles.blob2} />
          <View style={styles.planBadge}><Text style={styles.planBadgeText}>WEEK {currentWeek} OF {totalWeeks}</Text></View>
          <Text style={styles.planTitle}>{activeWorkoutPlan.name}</Text>
          <Text style={styles.planSubtitle}>TARGET: {activeWorkoutPlan.frequency || 4} SESSIONS / WEEK</Text>
          <TouchableOpacity style={styles.startTodayButton} onPress={() => navigation.navigate('WorkoutPlanDetail', { plan: activeWorkoutPlan })}>
            <Text style={styles.startTodayText}>View Details</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitleSmall}>Monthly Progress</Text>
            <Text style={styles.progressStats}>{activeWorkoutPlan.completedDays || 0} / {activeWorkoutPlan.totalDays || 28} completed</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <LinearGradient colors={['#A8390D', '#FF7849']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>

        <View style={styles.todayPlanSection}>
          <Text style={styles.sectionTitle}>Today's Plan</Text>
          {!todayDay ? (
            <View style={styles.todayPlanCard}>
               <Text style={styles.todayPlanTitle}>Rest Day</Text>
               <Text style={styles.todayPlanDesc}>Enjoy your rest today to recover and build strength!</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.todayPlanCard} onPress={() => navigation.navigate('WorkoutPlanDetail', { plan: activeWorkoutPlan, startToday: true })}>
              <View style={styles.todayPlanCore}>
                <View style={styles.todayPlanInfo}>
                  <View style={styles.categoryBadge}><Text style={styles.categoryBadgeText}>{todayDay.focusArea || 'Full Body'}</Text></View>
                  <Text style={styles.todayPlanTitle} numberOfLines={1}>{todayDay.dayName || 'Strength Foundation'}</Text>
                  <Text style={styles.todayPlanDesc} numberOfLines={2}>{todayDay.notes || 'Focus on compound movements and proper form for maximum efficiency.'}</Text>
                </View>
                <View style={styles.playButtonContainer}><Icon name="play" size={20} color="#A8390D" style={{ marginLeft: 4 }} /></View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}><View style={styles.statIconContainer}><Icon name="time" size={24} color="#A8390D" /></View><Text style={styles.statValue}>{todayDay.totalDuration || 60}m</Text><Text style={styles.statLabel}>Time</Text></View>
                <View style={styles.statItem}><View style={styles.statIconContainer}><Icon name="flame" size={22} color="#A8390D" /></View><Text style={styles.statValue}>{todayDay.estimatedCalories || 400}c</Text><Text style={styles.statLabel}>Burn</Text></View>
                <View style={styles.statItem}><View style={styles.statIconContainer}><Icon name="list" size={24} color="#A8390D" /></View><Text style={styles.statValue}>{(todayDay.dayExercises?.length || todayDay.exercises?.length || 0)}</Text><Text style={styles.statLabel}>Total</Text></View>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderHistory = () => {
    if (historyLoading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#A8390D" /></View>;
    return (
      <View style={styles.historyMainContainer}>
        <View style={styles.performanceGallery}>
            <Text style={styles.galleryLabel}>Performance Gallery</Text>
            <Text style={styles.galleryTitle}>Movements <Text style={styles.titleAccent}>&</Text>{"\n"}Milestones.</Text>
            <View style={styles.filterToggle}>
                {['week', 'month', 'year'].map(filter => (
                    <TouchableOpacity key={filter} style={[styles.filterBtn, historyFilter === filter && styles.filterBtnActive]} onPress={() => setHistoryFilter(filter)}>
                        <Text style={[styles.filterBtnText, historyFilter === filter && styles.filterBtnTextActive]}>{filter.charAt(0).toUpperCase() + filter.slice(1)}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.chartCard}><View style={styles.chartInfoOverlay}><Text style={styles.weeklyVolumeLabel}>{historyFilter.charAt(0).toUpperCase() + historyFilter.slice(1)}ly Volume</Text><View style={styles.volumeRow}><Text style={styles.volumeValue}>{chartData.totalVolume}</Text><Text style={styles.volumeUnit}>MIN</Text></View></View><View style={styles.barsRow}>{chartData.bars.map((bar) => { const barHeight = bar.duration === 0 ? 0 : (bar.duration / chartData.maxDuration) * 64; return <View key={bar.id} style={[styles.barTrack, { height: Math.max(barHeight, 4) }, bar.duration > 0 && styles.barActive]} />; })}</View><LinearGradient colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.5)']} style={styles.chartFade} /></View>
        </View>
        <View style={styles.recentSessions}>
            <Text style={styles.sessionListTitle}>Recent Sessions</Text>
            {filteredHistory.length > 0 ? (
                filteredHistory.map((session) => (
                    <TouchableOpacity 
                        key={session.id} 
                        style={styles.sessionCard} 
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('WorkoutHistoryDetail', { session })}
                    >
                        <View style={styles.sessionContent}>
                            <Text style={styles.sessionDate}>{formatHistoryDate(session.date)}</Text>
                            <Text style={styles.sessionTitle} numberOfLines={1}>{session.name}</Text>
                            <View style={styles.sessionStats}>
                                <View style={styles.statBit}><Icon name="time" size={14} color="rgba(104, 28, 0, 0.8)" /><Text style={styles.statBitText}>{session.duration} min</Text></View>
                                <View style={styles.statBit}><Icon name="flame" size={14} color="rgba(104, 28, 0, 0.8)" /><Text style={styles.statBitText}>{Math.round(session.calories)} kcal</Text></View>
                            </View>
                        </View>
                        <View style={styles.playIconCircle}><Icon name="play" size={24} color="#A8390D" style={{ marginLeft: 4 }} /></View>
                    </TouchableOpacity>
                ))
            ) : (
                <View style={styles.emptyState}><Text style={styles.emptyStateText}>No sessions found for this {historyFilter}.</Text></View>
            )}
            {filteredHistory.length > 0 && <View style={styles.endOfHistory}><View style={styles.horizontalLine} /><Text style={styles.endText}>End of History</Text><Text style={styles.endSubtext}>Keep moving to expand your kinetic gallery.</Text></View>}
        </View>
      </View>
    );
  };

  const filteredCategories = useMemo(() => exerciseCategories.filter((cat) => {
    const query = searchQuery.toLowerCase();
    return cat.name?.toLowerCase().includes(query) || cat.englishName?.toLowerCase().includes(query);
  }), [exerciseCategories, searchQuery]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.brandContainer}><View style={styles.logoImage}><Icon name="fitness" size={32} color="#A8390D" /></View><Text style={styles.brandName}>FITLIFE</Text></View>
        </View>
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity key={tab.id} style={[styles.tab, selectedTab === tab.id && styles.activeTab]} onPress={() => setSelectedTab(tab.id)}>
              <Icon name={tab.icon} size={18} color={selectedTab === tab.id ? '#A8390D' : '#5E5E5E'} />
              <Text style={[styles.tabText, selectedTab === tab.id && styles.activeTabText]}>{tab.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {selectedTab === 'plans' && (plansLoading ? <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#A8390D" /></View> : renderActivePlanCard())}
        {selectedTab === 'history' && renderHistory()}
        {selectedTab === 'exercises' && (
          <View>
            <View style={styles.searchContainer}><Icon name="search" size={20} color="#5E5E5E" style={{ marginRight: 12 }} /><TextInput style={styles.searchInput} placeholder="Search exercises..." placeholderTextColor="#94A3B8" value={searchQuery} onChangeText={setSearchQuery} /></View>
            <FlatList data={filteredCategories} keyExtractor={(item) => item.id.toString()} scrollEnabled={false} contentContainerStyle={{ paddingBottom: 60 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.categoryItem, { marginHorizontal: 24 }]} onPress={() => navigation.navigate('CategoryExercises', { category: item })}>
                  <View style={styles.muscleImageWrapper}>{item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.muscleImage} /> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Icon name="body" size={32} color="#A8390D" /></View>}</View>
                  <View style={styles.categoryInfo}><Text style={styles.categoryName}>{item.name}</Text><Text style={styles.categorySubtext}>{item.exerciseCount} exercises</Text></View><Icon name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default WorkoutScreen;
