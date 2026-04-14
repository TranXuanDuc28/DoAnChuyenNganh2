import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const CustomBottomNavBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 16 }]}>
      <View style={styles.content}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Icon Mapping
          const getIcon = (name, focused) => {
            const color = focused ? '#FFFFFF' : '#767575';
            const size = 22;

            switch (name) {
              case 'Dashboard':
                return <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />;
              case 'Workout':
                return <MaterialCommunityIcons name="dumbbell" size={size} color={color} />;
              case 'Community':
                return <Ionicons name={focused ? "people" : "people-outline"} size={size} color={color} />;
              case 'Nutrition':
                return <MaterialCommunityIcons name="silverware-fork-knife" size={size} color={color} />;
              case 'Profile':
                return <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />;
              case 'Assistant':
                return <MaterialCommunityIcons name="robot" size={size} color={color} />;
              case 'Health':
                return <Ionicons name={focused ? "heart" : "heart-outline"} size={size} color={color} />;
              default:
                return <Ionicons name="apps" size={size} color={color} />;
            }
          };

          // Filter out screens if needed, or handle all
          // The UIDL specifically shows: Home, Workouts, Community, Nutrition, Profile
          const allowedTabs = ['Dashboard', 'Workout', 'Community', 'Nutrition', 'Profile'];
          if (!allowedTabs.includes(route.name)) return null;

          if (isFocused) {
            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabButton}
              >
                <LinearGradient
                  colors={['#FF9139', '#FF7A2F']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeGradient}
                >
                  {getIcon(route.name, true)}
                  <Text style={styles.activeLabel}>{label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
            >
              <View style={styles.inactiveTab}>
                {getIcon(route.name, false)}
                <Text style={styles.inactiveLabel}>{label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: -10,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(224, 224, 224, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeGradient: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  activeLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  inactiveTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  inactiveLabel: {
    color: '#767575',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
    textTransform: 'capitalize',
  },
});

export default CustomBottomNavBar;
