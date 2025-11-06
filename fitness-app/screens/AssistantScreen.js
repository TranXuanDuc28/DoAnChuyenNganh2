import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import api, { aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SuggestionCard from '../components/SuggestionCard'; // We will create this component next
import CustomButton from '../components/CustomButton';
import { colors } from '../theme/colors';

const AssistantScreen = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/ai/daily-summary');
      setSuggestions(response.data);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      // Handle error gracefully in the UI
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSuggestions();
  };

  const [planLoading, setPlanLoading] = React.useState(false);
  const [planMessage, setPlanMessage] = React.useState(null);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Hello, {user?.firstName || 'User'}!</Text>
      <Text style={styles.subtitle}>Here are your personalized suggestions for today:</Text>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={suggestions}
        renderItem={({ item }) => item ? <SuggestionCard suggestion={item} /> : null}
        keyExtractor={(item, index) => {
          // item.id may be undefined when coming from some backends; fall back safely
          const key = item?.id ?? item?._id ?? item?.generatedAt ?? index;
          try {
            return typeof key === 'string' ? key : String(key);
          } catch (e) {
            return String(index);
          }
        }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No suggestions for today. Check back tomorrow!</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
      />
      <View style={styles.buttonContainer}>
        <CustomButton
          title={planLoading ? 'Generating...' : 'Generate New Workout Plan'}
          onPress={async () => {
            setPlanLoading(true);
            setPlanMessage(null);
            try {
              const response = await aiAPI.generateWorkoutPlan({ duration: 4, frequency: 3 });
              setPlanMessage('Workout plan created. Check Plans screen.');
              // Optionally navigate to statistics or plans screen if you have one
              // navigation.navigate('Statistics');
            } catch (error) {
              console.error('Failed to create workout plan:', error);
              setPlanMessage('Failed to generate plan. Try again later.');
            } finally {
              setPlanLoading(false);
            }
          }}
        />
        {planMessage && <Text style={styles.planMessage}>{planMessage}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for the button
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 4,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  planMessage: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
  }
});

export default AssistantScreen;
