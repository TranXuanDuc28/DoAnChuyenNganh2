import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { workoutAPI, authAPI, bodyMetricsAPI } from '../services/api';
import colors from '../theme/colors';
import { styles } from './styles/HealthScreen.styles';

const HealthScreen = () => {
  const { user, updateUser } = useAuth();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [todayData, setTodayData] = useState(null);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      setLoading(true);
      const response = await workoutAPI.getTodayCalories();
      if (response.data.success) {
        setTodayData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load today data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getBMIStatus = (bmi) => {
    if (bmi < 18.5) return { status: 'Thiếu cân', color: colors.info };
    if (bmi < 25) return { status: 'Bình thường', color: colors.success };
    if (bmi < 30) return { status: 'Thừa cân', color: colors.warning };
    return { status: 'Béo phì', color: colors.danger };
  };

  const getWHRStatus = (whr, gender) => {
    if (!whr) return { status: 'Chưa có dữ liệu', color: colors.textSecondary };

    // WHR thresholds differ by gender
    if (gender === 'male') {
      if (whr < 0.90) return { status: 'Tốt', color: colors.success };
      if (whr < 0.95) return { status: 'Trung bình', color: colors.warning };
      return { status: 'Cao', color: colors.danger };
    } else {
      if (whr < 0.80) return { status: 'Tốt', color: colors.success };
      if (whr < 0.85) return { status: 'Trung bình', color: colors.warning };
      return { status: 'Cao', color: colors.danger };
    }
  };

  const healthMetrics = todayData ? {

    weight: {
      value: todayData.bodyMetrics?.weight || 0,
      unit: 'kg',
      target: todayData.bodyMetrics?.targetWeight || todayData.bodyMetrics?.weight,
      status: 'progress',
      label: 'Cân nặng'
    },
    bmi: {
      value: todayData.bodyMetrics?.bmi || 0,
      unit: '',

      status: 'normal',
      label: 'BMI',
      customStatus: getBMIStatus(todayData.bodyMetrics?.bmi, todayData.bodyMetrics?.gender)
    },
    height: {
      value: todayData.bodyMetrics?.height || 0,
      unit: 'cm',
      status: 'normal',
      label: 'Chiều cao'
    },
    waist: {
      value: todayData.bodyMetrics?.waistCircumference || 0,
      unit: 'cm',
      status: 'normal',
      label: 'Vòng eo'
    },
    hip: {
      value: todayData.bodyMetrics?.hipCircumference || 0,
      unit: 'cm',
      status: 'normal',
      label: 'Vòng mông'
    },
    whr: {
      value: todayData.bodyMetrics?.whr || 0,
      unit: '',
      status: 'normal',
      label: 'WHR',
      customStatus: getWHRStatus(todayData.bodyMetrics?.whr, todayData.bodyMetrics?.gender)
    },
  } : {};

  const recentRecords = [
    {
      id: 1,
      type: 'exercise',
      title: 'Bài tập hoàn thành',
      value: `${todayData?.completedExercisesCount || 0} bài`,
      time: 'Hôm nay',
      icon: 'fitness',
      color: colors.primary,
    },
    {
      id: 2,
      type: 'calories',
      title: 'Calo đốt cháy',
      value: `${todayData?.caloriesBurned || 0} cal`,
      time: 'Hôm nay',
      icon: 'flame',
      color: colors.iconDanger,
    },
  ];

  const tabs = [
    { id: 'overview', title: 'Tổng quan', icon: 'stats-chart' },
    { id: 'update', title: 'Cập nhật', icon: 'create' },
    { id: 'insights', title: 'Thông tin', icon: 'bulb' },
  ];

  const [bodyMetricsForm, setBodyMetricsForm] = useState({
    weight: '',
    height: '',
    waistCircumference: '',
    hipCircumference: '',
    bodyFatPercentage: '',
  });

  const [updating, setUpdating] = useState(false);
  const [metricsHistory, setMetricsHistory] = useState([]);

  useEffect(() => {
    if (selectedTab === 'update') {
      loadMetricsHistory();
    }
  }, [selectedTab]);

  const loadMetricsHistory = async () => {
    try {
      const response = await bodyMetricsAPI.getHistory(10);
      setMetricsHistory(response.data);
    } catch (error) {
      console.error('Failed to load metrics history:', error);
    }
  };

  const handleUpdateMetrics = async () => {
    try {
      setUpdating(true);

      // Prepare data - only send fields that have values
      const updateData = {};
      if (bodyMetricsForm.weight) updateData.weight = parseFloat(bodyMetricsForm.weight);
      if (bodyMetricsForm.height) updateData.height = parseFloat(bodyMetricsForm.height);
      if (bodyMetricsForm.waistCircumference) updateData.waistCircumference = parseFloat(bodyMetricsForm.waistCircumference);
      if (bodyMetricsForm.hipCircumference) updateData.hipCircumference = parseFloat(bodyMetricsForm.hipCircumference);
      if (bodyMetricsForm.bodyFatPercentage) updateData.bodyFatPercentage = parseFloat(bodyMetricsForm.bodyFatPercentage);

      if (Object.keys(updateData).length === 0) {
        Alert.alert('Thông báo', 'Vui lòng nhập ít nhất một chỉ số để cập nhật');
        return;
      }

      // Use bodyMetricsAPI to update user AND create history record
      const response = await bodyMetricsAPI.addBodyMetrics(updateData);

      if (response.data) {
        Alert.alert('Thành công', 'Đã cập nhật chỉ số cơ thể');

        // Reset form
        setBodyMetricsForm({
          weight: '',
          height: '',
          waistCircumference: '',
          hipCircumference: '',
          bodyFatPercentage: '',
        });

        // Reload user data from server to get updated BMI, WHR, etc.
        try {
          const userResponse = await authAPI.getCurrentUser();
          if (userResponse.data) {
            updateUser(userResponse.data);
          }
        } catch (error) {
          console.error('Failed to reload user data:', error);
        }

        // Reload all health data
        await loadTodayData();
        await loadMetricsHistory();
      }
    } catch (error) {
      console.error('Failed to update metrics:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật chỉ số');
    } finally {
      setUpdating(false);
    }
  };

  const renderHealthMetric = (key, metric, index) => {
    // Skip metrics with no value
    if (!metric.value || metric.value === 0) {
      return null;
    }

    const percentage = Math.min((metric.value / metric.target) * 100, 100);
    const getStatusColor = (status) => {
      switch (status) {
        case 'good': return colors.primary;
        case 'normal': return colors.iconSuccess;
        case 'low': return colors.iconSuccess;
        case 'progress': return colors.iconWarning;
        default: return colors.textSecondary;
      }
    };

    // Use custom status color if available (for WHR)
    const statusColor = metric.customStatus
      ? metric.customStatus.color
      : getStatusColor(metric.status);

    return (
      <View key={key} style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <Text style={styles.metricTitle}>{metric.label}</Text>
          <Text style={styles.metricValue}>
            {metric.value} {metric.unit}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: statusColor,
              },
            ]}
          />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {metric.customStatus && (
            <Text style={[styles.metricTarget, { color: metric.customStatus.color, fontWeight: '600' }]}>
              {metric.customStatus.status}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderRecentRecord = ({ item }) => (
    <TouchableOpacity style={styles.recordCard}>
      <View style={[styles.recordIcon, { backgroundColor: item.color }]}>
        <Icon name={item.icon} size={24} color="#fff" />
      </View>
      <View style={styles.recordInfo}>
        <Text style={styles.recordTitle}>{item.title}</Text>
        <Text style={styles.recordValue}>{item.value}</Text>
      </View>
      <View style={styles.recordTime}>
        <Text style={styles.recordTimeText}>{item.time}</Text>
        <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyDate}>
        <Text style={styles.historyDateText}>
          {new Date(item.recordedAt).toLocaleDateString('vi-VN')}
        </Text>
        <Text style={styles.historyTimeText}>
          {new Date(item.recordedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <View style={styles.historyValues}>
        <View style={styles.historyValueItem}>
          <Text style={styles.historyLabel}>Cân nặng</Text>
          <Text style={styles.historyValue}>{item.weight} kg</Text>
        </View>
        {item.waistCircumference && (
          <View style={styles.historyValueItem}>
            <Text style={styles.historyLabel}>Vòng eo</Text>
            <Text style={styles.historyValue}>{item.waistCircumference} cm</Text>
          </View>
        )}
        {item.hipCircumference && (
          <View style={styles.historyValueItem}>
            <Text style={styles.historyLabel}>Vòng mông</Text>
            <Text style={styles.historyValue}>{item.hipCircumference} cm</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sức khỏe</Text>
        <TouchableOpacity style={styles.headerButton} onPress={loadTodayData}>
          <Icon name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
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
              color={selectedTab === tab.id ? colors.textOnPrimary : colors.textSecondary}
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
        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 12, color: colors.textSecondary }}>Đang tải...</Text>
          </View>
        ) : selectedTab === 'overview' && (
          <View>
            {/* Calories Summary Card */}
            {todayData && (
              <View style={[styles.caloCard, { marginBottom: 16, backgroundColor: colors.card }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Icon name="flame" size={32} color={colors.primary} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={[styles.metricTitle, { fontSize: 18 }]}>Calo hôm nay</Text>
                    <Text style={[styles.metricValue, { fontSize: 28, color: colors.primary }]}>
                      {todayData.caloriesBurned} / {todayData.targetCalories} cal
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${todayData.percentage}%`,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.metricTarget, { marginTop: 8 }]}>
                  {todayData.completedExercisesCount} bài tập đã hoàn thành
                </Text>
              </View>
            )}

            {/* Health Metrics Grid */}
            <View style={styles.metricsGrid}>
              {Object.entries(healthMetrics).map(([key, metric], index) =>
                renderHealthMetric(key, metric, index)
              )}
            </View>

            {/* Recent Records */}
            <View style={styles.recordsSection}>
              <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
              <FlatList
                data={recentRecords}
                renderItem={renderRecentRecord}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            </View>
          </View>
        )}

        {selectedTab === 'update' && (
          <View style={styles.trackContainer}>
            <Text style={styles.sectionTitle}>Cập nhật chỉ số cơ thể</Text>
            <Text style={[styles.metricTarget, { marginBottom: 20 }]}>
              Nhập các chỉ số mới của bạn để cập nhật hồ sơ sức khỏe
            </Text>

            {/* Weight Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                <Icon name="fitness" size={20} color={colors.primary} />
                <Text style={styles.inputLabel}>Cân nặng (kg)</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder={todayData?.bodyMetrics?.weight ? `Hiện tại: ${todayData.bodyMetrics.weight} kg` : "Nhập cân nặng"}
                value={bodyMetricsForm.weight}
                onChangeText={(text) => setBodyMetricsForm({ ...bodyMetricsForm, weight: text })}
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Height Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                <Icon name="resize-outline" size={20} color={colors.info} />
                <Text style={styles.inputLabel}>Chiều cao (cm)</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder={todayData?.bodyMetrics?.height ? `Hiện tại: ${todayData.bodyMetrics.height} cm` : "Nhập chiều cao"}
                value={bodyMetricsForm.height}
                onChangeText={(text) => setBodyMetricsForm({ ...bodyMetricsForm, height: text })}
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Waist Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                <Icon name="resize" size={20} color={colors.warning} />
                <Text style={styles.inputLabel}>Vòng eo (cm)</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder={todayData?.bodyMetrics?.waistCircumference ? `Hiện tại: ${todayData.bodyMetrics.waistCircumference} cm` : "Nhập vòng eo"}
                value={bodyMetricsForm.waistCircumference}
                onChangeText={(text) => setBodyMetricsForm({ ...bodyMetricsForm, waistCircumference: text })}
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Hip Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                <Icon name="resize" size={20} color={colors.success} />
                <Text style={styles.inputLabel}>Vòng mông (cm)</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder={todayData?.bodyMetrics?.hipCircumference ? `Hiện tại: ${todayData.bodyMetrics.hipCircumference} cm` : "Nhập vòng mông"}
                value={bodyMetricsForm.hipCircumference}
                onChangeText={(text) => setBodyMetricsForm({ ...bodyMetricsForm, hipCircumference: text })}
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Body Fat Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                <Icon name="analytics" size={20} color={colors.info} />
                <Text style={styles.inputLabel}>Tỷ lệ mỡ cơ thể (%)</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nhập tỷ lệ mỡ (nếu có)"
                value={bodyMetricsForm.bodyFatPercentage}
                onChangeText={(text) => setBodyMetricsForm({ ...bodyMetricsForm, bodyFatPercentage: text })}
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Update Button */}
            <TouchableOpacity
              style={[styles.trackButton, { backgroundColor: colors.primary, marginTop: 20 }]}
              onPress={handleUpdateMetrics}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="checkmark-circle" size={22} color="#fff" />
                  <Text style={[styles.trackButtonText, { color: '#fff', marginLeft: 8 }]}>
                    Cập nhật chỉ số
                  </Text>
                </>
              )}
            </TouchableOpacity>



            {/* History Section */}
            <View style={{ marginTop: 30 }}>
              <Text style={styles.sectionTitle}>Lịch sử cập nhật</Text>
              {metricsHistory.length > 0 ? (
                <FlatList
                  data={metricsHistory}
                  renderItem={renderHistoryItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={[styles.metricTarget, { textAlign: 'center', marginTop: 10 }]}>
                  Chưa có lịch sử cập nhật
                </Text>
              )}
            </View>
          </View>
        )}

        {selectedTab === 'insights' && (
          <View style={styles.insightsContainer}>
            <View style={styles.insightCard}>
              <Icon name="bulb" size={32} color={colors.warning} />
              <Text style={styles.insightTitle}>Mẹo sức khỏe</Text>
              <Text style={styles.insightDescription}>
                Duy trì việc theo dõi các chỉ số cơ thể thường xuyên giúp bạn nắm bắt được tiến độ và điều chỉnh kế hoạch tập luyện phù hợp.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HealthScreen;
