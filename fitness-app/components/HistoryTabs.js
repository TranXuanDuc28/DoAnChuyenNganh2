import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Image,
    Modal,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { poseAPI, videoAnalysisAPI } from '../services/api';
import colors from '../theme/colors';
import VideoPlayer from './VideoPlayer';

const HistoryTabs = ({ user, exerciseMode = 'video', exerciseName }) => {
    // Set initial tab based on exerciseMode
    const [activeTab, setActiveTab] = useState(exerciseMode === 'image' ? 'images' : 'videos');
    const [imageHistory, setImageHistory] = useState([]);
    const [videoHistory, setVideoHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [videoUri, setVideoUri] = useState(null);
    const [isVideoMode, setIsVideoMode] = useState(false);

    useEffect(() => {
        if (activeTab === 'images') {
            fetchImageHistory();
        } else {
            fetchVideoHistory();
        }
    }, [activeTab, exerciseName]);

    const fetchImageHistory = async () => {
        try {
            setIsLoading(true);
            const params = {
                user_id: user?.id,
                limit: 50,
                type: 'image',
            };

            // Add exerciseName filter if provided
            // if (exerciseName) {
            //     params.exerciseName = exerciseName;
            // }

            const resp = await poseAPI.history(params);
            setImageHistory(resp.data.items || []);
        } catch (error) {
            console.error('Failed to fetch image history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchVideoHistory = async () => {
        try {
            setIsLoading(true);
            const params = {
                user_id: user?.id,
                limit: 50,
                type: 'video',
            };

            // Add exerciseName filter if provided
            if (exerciseName) {
                params.exerciseName = exerciseName;
            }

            const resp = await poseAPI.history(params);
            setVideoHistory(resp.data.items || []);
        } catch (error) {
            console.error('Failed to fetch video history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        try {
            await poseAPI.deleteImage(imageId, user?.id);
            setImageModalVisible(false);
            setSelectedImage(null);
            // Refresh history
            fetchImageHistory();
        } catch (error) {
            console.error('Failed to delete image:', error);
            Alert.alert('Lỗi', 'Không thể xóa ảnh. Vui lòng thử lại.');
        }
    };

    const handleDeleteVideo = async (videoId) => {
        try {
            await videoAnalysisAPI.deleteVideo(videoId);
            // Refresh history
            fetchVideoHistory();
        } catch (error) {
            console.error('Failed to delete video:', error);
            Alert.alert('Lỗi', 'Không thể xóa video. Vui lòng thử lại.');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    const renderImageItem = ({ item }) => (
        <TouchableOpacity
            style={styles.historyCard}
            onPress={() => {
                setSelectedImage(item);
                setImageModalVisible(true);
            }}
            onLongPress={() => {
                Alert.alert(
                    'Xóa ảnh',
                    'Bạn có chắc muốn xóa ảnh này?',
                    [
                        { text: 'Hủy', style: 'cancel' },
                        {
                            text: 'Xóa',
                            style: 'destructive',
                            onPress: () => handleDeleteImage(item.id)
                        }
                    ]
                );
            }}
        >
            <View style={styles.cardHeader}>
                {item.resultImageUrl && (
                    <Image
                        source={{ uri: item.resultImageUrl }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                    />
                )}
                <View style={styles.cardInfo}>
                    <Text style={styles.exerciseName}>{item.exerciseName || 'N/A'}</Text>
                    <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                    {item.detectedPose && (
                        <Text style={styles.detectedPose}>Phát hiện: {item.detectedPose}</Text>
                    )}
                </View>
                <View style={styles.statusBadge}>
                    <Icon
                        name={item.isCorrect ? 'checkmark-circle' : 'close-circle'}
                        size={28}
                        color={item.isCorrect ? '#4CAF50' : '#F44336'}
                    />
                </View>
            </View>
            <View style={styles.cardStats}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Điểm</Text>
                    <Text style={styles.statValue}>{Math.round(item.score || 0)}/100</Text>
                </View>
                {item.confidence && (
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Độ tin cậy</Text>
                        <Text style={styles.statValue}>{Math.round(item.confidence * 100)}%</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderVideoItem = ({ item }) => (
        <TouchableOpacity
            style={styles.historyCard}
                        onPress={async () => {
                if (item.status === 'completed') {
                    try {
                        const url = await videoAnalysisAPI.getVideoUrl(item.id);
                        setVideoUri(url);
                        setIsVideoMode(true);
                        setSelectedVideo(item);
                    } catch (error) {
                        console.error('Failed to get video URL:', error);
                        Alert.alert('Lỗi', 'Không thể tải video. Vui lòng thử lại.');
                    }
                } else {
                    Alert.alert('Thông báo', 'Video đang được xử lý. Vui lòng thử lại sau.');
                }
            }}
            onLongPress={() => {
                Alert.alert(
                    'Xóa video',
                    'Bạn có chắc muốn xóa video này?',
                    [
                        { text: 'Hủy', style: 'cancel' },
                        {
                            text: 'Xóa',
                            style: 'destructive',
                            onPress: () => handleDeleteVideo(item.id)
                        }
                    ]
                );
            }}

        >
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Icon name="videocam" size={24} color={colors.primary} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.exerciseName}>{item.exerciseName || 'N/A'}</Text>
                    <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                </View>
                <View style={styles.statusBadge}>
                    <Icon
                        name={item.status === 'completed' ? 'checkmark-circle' : 'time'}
                        size={28}
                        color={item.status === 'completed' ? '#4CAF50' : '#FF9800'}
                    />
                </View>
            </View>
            <View style={styles.cardStats}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Số lần</Text>
                    <Text style={styles.statValue}>{item.repCount || 0}</Text>
                </View>
                {item.duration && (
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Thời lượng</Text>
                        <Text style={styles.statValue}>{item.duration}s</Text>
                    </View>
                )}
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Trạng thái</Text>
                    <Text style={[styles.statValue, { fontSize: 12 }]}>
                        {item.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon
                name={activeTab === 'images' ? 'images-outline' : 'videocam-outline'}
                size={64}
                color="#ccc"
            />
            <Text style={styles.emptyText}>
                {activeTab === 'images'
                    ? 'Chưa có lịch sử nhận diện ảnh'
                    : 'Chưa có lịch sử phân tích video'}
            </Text>
        </View>
    );

    const currentHistory = activeTab === 'images' ? imageHistory : videoHistory;
    const onRefresh = activeTab === 'images' ? fetchImageHistory : fetchVideoHistory;

    return (
        <View style={styles.container}>
            {/* Tab Bar */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'images' && styles.activeTab]}
                    onPress={() => setActiveTab('images')}
                >
                    <Icon
                        name="images"
                        size={24}
                        color={activeTab === 'images' ? colors.primary : '#666'}
                    />
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'images' && styles.activeTabText,
                        ]}
                    >
                        Hình ảnh
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
                    onPress={() => setActiveTab('videos')}
                >
                    <Icon
                        name="videocam"
                        size={24}
                        color={activeTab === 'videos' ? colors.primary : '#666'}
                    />
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'videos' && styles.activeTabText,
                        ]}
                    >
                        Video
                    </Text>
                </TouchableOpacity>
            </View>

            {/* History List */}
            {isLoading && currentHistory.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : currentHistory.length === 0 ? (
                renderEmptyState()
            ) : (
                <FlatList
                    data={currentHistory}
                    keyExtractor={(item) => `${activeTab}-${item.id}`}
                    renderItem={activeTab === 'images' ? renderImageItem : renderVideoItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                        />
                    }
                />
            )}

            {/* Image Detail Modal */}
            <Modal
                visible={imageModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setImageModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chi tiết đánh giá</Text>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity onPress={() => setImageModalVisible(false)}>
                                    <Icon name="close" size={28} color="#333" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {selectedImage && (
                            <ScrollView style={styles.modalBody}>
                                {/* Exercise Info */}
                                <View style={styles.infoSection}>
                                    <Text style={styles.infoLabel}>Bài tập</Text>
                                    <Text style={styles.infoValue}>{selectedImage.exerciseName}</Text>
                                </View>

                                {selectedImage.detectedPose && (
                                    <View style={styles.infoSection}>
                                        <Text style={styles.infoLabel}>Phát hiện tự động</Text>
                                        <Text style={styles.infoValue}>{selectedImage.detectedPose}</Text>
                                    </View>
                                )}

                                <View style={styles.infoSection}>
                                    <Text style={styles.infoLabel}>Điểm số</Text>
                                    <Text style={[styles.infoValue, { color: selectedImage.isCorrect ? '#4CAF50' : '#F44336' }]}>
                                        {Math.round(selectedImage.score || 0)}/100 {selectedImage.isCorrect ? '✅' : '❌'}
                                    </Text>
                                </View>

                                {selectedImage.confidence && (
                                    <View style={styles.infoSection}>
                                        <Text style={styles.infoLabel}>Độ tin cậy</Text>
                                        <Text style={styles.infoValue}>{Math.round(selectedImage.confidence * 100)}%</Text>
                                    </View>
                                )}

                                <View style={styles.infoSection}>
                                    <Text style={styles.infoLabel}>Thời gian</Text>
                                    <Text style={styles.infoValue}>{formatDate(selectedImage.createdAt)}</Text>
                                </View>

                                {/* Feedback */}
                                {selectedImage.feedback && selectedImage.feedback.length > 0 && (
                                    <View style={styles.feedbackSection}>
                                        <Text style={styles.sectionTitle}>Góp ý cải thiện</Text>
                                        {selectedImage.feedback.map((item, index) => (
                                            <Text key={index} style={styles.feedbackItem}>• {item}</Text>
                                        ))}
                                    </View>
                                )}

                                {/* Images */}
                                <View style={styles.imagesSection}>
                                    <Text style={styles.sectionTitle}>Hình ảnh đánh giá</Text>

                                    {selectedImage.resultImageUrl && (
                                        <View style={styles.imageContainer}>
                                            <Text style={styles.imageLabel}>Kết quả phân tích</Text>
                                            <Image
                                                source={{ uri: selectedImage.resultImageUrl }}
                                                style={styles.modalImage}
                                                resizeMode="contain"
                                            />
                                        </View>
                                    )}

                                    {selectedImage.referenceImageUrl && (
                                        <View style={styles.imageContainer}>
                                            <Text style={styles.imageLabel}>Tư thế tham chiếu</Text>
                                            <Image
                                                source={{ uri: selectedImage.referenceImageUrl }}
                                                style={styles.modalImage}
                                                resizeMode="contain"
                                            />
                                        </View>
                                    )}

                                    {selectedImage.comparisonImageUrl && (
                                        <View style={styles.imageContainer}>
                                            <Text style={styles.imageLabel}>So sánh</Text>
                                            <Image
                                                source={{ uri: selectedImage.comparisonImageUrl }}
                                                style={styles.modalImage}
                                                resizeMode="contain"
                                            />
                                        </View>
                                    )}
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
            {isVideoMode && videoUri && (
                <Modal
                    visible={true}
                    transparent={false}
                    animationType="slide"
                    onRequestClose={() => {
                        setIsVideoMode(false);
                        setVideoUri(null);
                        setSelectedVideo(null);
                    }}
                >
                    <VideoPlayer
                        videoUri={videoUri}
                        exerciseName={selectedVideo?.exerciseName || exerciseName}
                        user_id={user?.id}
                        onRepCountUpdate={() => { }}
                        onClose={() => {
                            setIsVideoMode(false);
                            setVideoUri(null);
                            setSelectedVideo(null);
                        }}
                        initialRepCount={selectedVideo?.repCount || 0}
                    />
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: colors.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
    listContent: {
        padding: 16,
    },
    historyCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    date: {
        fontSize: 13,
        color: '#666',
    },
    statusBadge: {
        marginLeft: 8,
    },
    cardStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    detectedPose: {
        fontSize: 11,
        color: '#666',
        marginTop: 2,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxHeight: '85%',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    modalBody: {
        padding: 16,
    },
    infoSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginTop: 16,
        marginBottom: 12,
    },
    feedbackSection: {
        marginTop: 8,
    },
    feedbackItem: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 20,
    },
    imagesSection: {
        marginTop: 8,
        marginBottom: 16,
    },
    imageContainer: {
        marginBottom: 16,
    },
    imageLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    modalImage: {
        width: '100%',
        height: 250,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
});

export default HistoryTabs;
