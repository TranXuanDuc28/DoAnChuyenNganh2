import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons as Icon } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BarcodeScanner = ({ visible, onClose, onBarcodeScanned }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const isScanning = useRef(false);

  useEffect(() => {
    if (visible) {
      setScanned(false);
      setLoading(false);
      isScanning.current = false;
    }
  }, [visible]);

  const handleBarCodeScanned = async ({ type, data }) => {
    // Synchronous lock to prevent multiple rapid scans
    if (isScanning.current || scanned || loading) return;
    
    isScanning.current = true;
    setScanned(true);
    setLoading(true);

    try {
      console.log('Barcode scanned:', type, data);
      
      // Fetch food data from OpenFoodFacts API
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON:', text.substring(0, 50));
        throw new Error('Invalid response from server');
      }

      if (result.status === 1 && result.product) {
        const product = result.product;
        
        // Extract nutrition data
        const foodData = {
          barcode: data,
          name: product.product_name || 'Unknown Product',
          brand: product.brands || '',
          calories: Math.round(product.nutriments?.['energy-kcal_100g'] || 0),
          protein: Math.round(product.nutriments?.proteins_100g || 0),
          carbs: Math.round(product.nutriments?.carbohydrates_100g || 0),
          fat: Math.round(product.nutriments?.fat_100g || 0),
          fiber: Math.round(product.nutriments?.fiber_100g || 0),
          sugar: Math.round(product.nutriments?.sugars_100g || 0),
          sodium: Math.round(product.nutriments?.sodium_100g || 0),
          servingSize: product.serving_size || '100g',
          imageUrl: product.image_url || product.image_front_url || null,
          ingredients: product.ingredients_text || '',
        };

        console.log('Food data found:', foodData.name);
        onBarcodeScanned(foodData);
        onClose();
      } else {
        Alert.alert(
          'Product Not Found',
          'This barcode is not in our database. Try another product or add food manually.',
          [{ text: 'OK', onPress: () => {
            setScanned(false);
            setLoading(false);
            isScanning.current = false;
          }}]
        );
      }
    } catch (error) {
      // Ignore 429 if the first scan already succeeded (cleanup)
      if (error.message.includes('429')) {
        console.log('Rate limit ignored for redundant scan');
        return;
      }

      console.error('Error fetching food data:', error.message);
      Alert.alert(
        'Scan Error',
        'Failed to fetch food information. Please try again or check your connection.',
        [{ text: 'OK', onPress: () => {
          setScanned(false);
          setLoading(false);
          isScanning.current = false;
        }}]
      );
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.permissionContainer}>
          <Icon name="camera-outline" size={64} color="#ccc" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan barcodes
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan Barcode</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Scanning Frame */}
          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              {/* Corner markers */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* Scanning line animation */}
              {!scanned && !loading && (
                <View style={styles.scanLine} />
              )}
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.instructionText}>Loading food information...</Text>
              </>
            ) : scanned ? (
              <Text style={styles.instructionText}>Processing barcode...</Text>
            ) : (
              <>
                <Icon name="barcode-outline" size={48} color="#fff" />
                <Text style={styles.instructionText}>
                  Position the barcode within the frame
                </Text>
                <Text style={styles.instructionSubtext}>
                  The barcode will be scanned automatically
                </Text>
              </>
            )}
          </View>

          {/* Rescan button */}
          {scanned && !loading && (
            <TouchableOpacity
              style={styles.rescanButton}
              onPress={() => setScanned(false)}
            >
              <Icon name="refresh" size={20} color="#fff" />
              <Text style={styles.rescanButtonText}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </CameraView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: SCREEN_WIDTH * 0.7,
    height: 200,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00ff00',
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  instructionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
  instructionSubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 8,
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  rescanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default BarcodeScanner;





