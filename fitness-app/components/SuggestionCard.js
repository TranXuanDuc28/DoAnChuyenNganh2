import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Assuming you use this library

const ICONS = {
  workout: 'dumbbell',
  nutrition: 'silverware-fork-knife',
  rest: 'bed',
  mindfulness: 'meditation',
  general: 'lightbulb-on-outline',
};

const COLORS = {
  workout: '#ff6b6b',
  nutrition: '#4ecdc4',
  rest: '#45b7d1',
  mindfulness: '#9b59b6',
  general: '#f1c40f',
};

const SuggestionCard = ({ suggestion = {} }) => {
  const type = suggestion.type || 'general';
  const iconName = ICONS[type] || 'help-circle';
  const cardColor = COLORS[type] || '#ccc';
  const title = suggestion.title || 'Suggestion';
  const description = suggestion.description || '';
  const priority = suggestion.priority || 'normal';

  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: cardColor }]} activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <Icon name={iconName} size={30} color={cardColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <View style={styles.priorityIndicatorContainer}>
        {priority === 'high' && <View style={styles.highPriorityIndicator} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c1c1e',
  },
  description: {
    fontSize: 14,
    color: '#6c6c6e',
    marginTop: 4,
  },
  priorityIndicatorContainer: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highPriorityIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e74c3c',
  }
});

export default SuggestionCard;
