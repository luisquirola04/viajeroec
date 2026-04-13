import React, { useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, 
    Dimensions, Linking, Platform, StatusBar, Modal, ActionSheetIOS, Alert,
    ActivityIndicator 
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// --- 1. ELIMINADO react-native-maps Y AGREGADO WebView ---
import { WebView } from 'react-native-webview'; 
import { obtenerLugar } from '../../services/ApiServices'; 

const { width, height } = Dimensions.get('window');

const ImagenConCarga = ({ uri, onPress, style }) => {
    const [cargando, setCargando] = useState(true);

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={style}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                {cargando && (
                    <ActivityIndicator 
                        style={StyleSheet.absoluteFill} 
                        size="large" 
                        color="#005bea" 
                    />
                )}
                <Image 
                    source={{ uri: uri }} 
                    style={[style, { position: 'absolute', zIndex: cargando ? -1 : 1 }]} 
                    resizeMode="cover" 
                    onLoadStart={() => setCargando(true)}
                    onLoadEnd={() => setCargando(false)}
                />
            </View>
        </TouchableOpacity>
    );
};

export default function LugarDetalleScreen() {
  const [lugar, setLugar] = useState<any>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState('');
  
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const cargarDetalle = async () => {
      if (params.externalLugar) {
        try {
          const respuesta = await obtenerLugar(params.externalLugar);
          if (respuesta && respuesta.data && Array.isArray(respuesta.data)) {
              if (respuesta.data.length > 0) {
                  setLugar(respuesta.data[0]);
              }
          } 
        } catch (error) {
           console.error("Error cargando lugar:", error);
        }
      }
    };
    cargarDetalle();
  }, [params.externalLugar]);

  const onScroll = (event: any) => {
    const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
    if (slide !== activeSlide) {
      setActiveSlide(slide);
    }
  };

  const comoLlegar = () => {
    if (!lugar || !lugar.latitud || !lugar.longitud) return;

    const lat = lugar.latitud;
    const lng = lugar.longitud;
    const label = encodeURIComponent(lugar.nombre);

    if (Platform.OS === 'android') {
        const url = `geo:${lat},${lng}?q=${lat},${lng}(${label})`;
        Linking.openURL(url);
    } else {
        ActionSheetIOS.showActionSheetWithOptions(
            {
                options: ['Cancelar', 'Apple Maps', 'Google Maps', 'Waze'],
                cancelButtonIndex: 0,
            },
            (buttonIndex) => {
                if (buttonIndex === 1) {
                    Linking.openURL(`maps:0,0?q=${label}@${lat},${lng}`);
                } else if (buttonIndex === 2) {
                    const urlApp = `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`;
                    const urlWeb = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                    Linking.canOpenURL(urlApp).then(supported => {
                        if (supported) Linking.openURL(urlApp);
                        else Linking.openURL(urlWeb);
                    });
                } else if (buttonIndex === 3) {
                    const urlWaze = `waze://?ll=${lat},${lng}&navigate=yes`;
                    Linking.canOpenURL(urlWaze).then(supported => {
                        if (supported) Linking.openURL(urlWaze);
                        else Alert.alert("Waze no instalado", "No se encontró la aplicación Waze.");
                    });
                }
            }
        );
    }
  };

  const abrirImagenFull = (url: string) => {
      setImagenSeleccionada(url);
      setModalVisible(true);
  };

  if (!lugar) return (
    <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#005bea" /></View>
  );

  // --- 2. CALCULAMOS LOS LÍMITES (BBOX) PARA EL MAPA DE OSM ---
  const lat = parseFloat(lugar.latitud);
  const lng = parseFloat(lugar.longitud);
 const zoomFactor = 0.0002; 

  const osmUrl = lugar.latitud && lugar.longitud 
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - zoomFactor},${lat - zoomFactor},${lng + zoomFactor},${lat + zoomFactor}&layer=mapnik&marker=${lat},${lng}`
    : null;

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <StatusBar barStyle="light-content" backgroundColor="#005bea" />
      <Stack.Screen options={{ headerShown: false }} /> 
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerImageContainer}>
             <TouchableOpacity 
                onPress={() => router.back()} 
                style={styles.backButton}
            >
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <ScrollView 
                horizontal 
                pagingEnabled 
                showsHorizontalScrollIndicator={false} 
                style={styles.gallery}
                onMomentumScrollEnd={onScroll}
            >
                {lugar.Multimedia && lugar.Multimedia.length > 0 ? (
                    lugar.Multimedia.map((img: any, index: number) => (
                        <ImagenConCarga 
                            key={index}
                            uri={img.url}
                            onPress={() => abrirImagenFull(img.url)}
                            style={styles.galleryImage}
                        />
                    ))
                ) : (
                    <View style={[styles.galleryImage, styles.placeholderImage]}>
                        <Ionicons name="image-outline" size={50} color="#ccc" />
                        <Text style={{color:'#ccc'}}>Sin imágenes</Text>
                    </View>
                )}
            </ScrollView>

            {lugar.Multimedia && lugar.Multimedia.length > 1 && (
                <View style={styles.paginationContainer}>
                    {lugar.Multimedia.map((_: any, index: number) => (
                        <View
                            key={index}
                            style={[
                                styles.paginationDot,
                                index === activeSlide ? styles.paginationDotActive : styles.paginationDotInactive
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>

        <View style={styles.content}>
            <View style={styles.headerInfo}>
                <Text style={styles.title}>{lugar.nombre}</Text>
                <View style={styles.badgeCategory}>
                    <Text style={styles.categoryText}>{lugar.Categoria?.nombre}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{lugar.descripcion}</Text>

            <View style={styles.infoBox}>
                {lugar.horario && (
                    <View style={styles.infoRow}>
                        <Ionicons name="time" size={22} color="#005bea" />
                        <Text style={styles.infoText}>{lugar.horario}</Text>
                    </View>
                )}

                <View style={styles.infoRow}>
                    <Ionicons name="location" size={22} color="#005bea" />
                    <Text style={styles.infoText}>
                        <Text style={{fontWeight: 'bold'}}>Parroquia: </Text> 
                        {lugar.Parroquia?.nombre || 'No especificada'}
                    </Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Ubicación</Text>
            
            {osmUrl ? (
                <View style={styles.mapContainer}>
                    <WebView
                        style={styles.map}
                        source={{ uri: osmUrl }}
                        scrollEnabled={true} // Evita que el usuario scrollee dentro del mapa y arruine el scroll general
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            ) : (
                <View style={[styles.mapContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: '#888' }}>Ubicación en mapa no disponible</Text>
                </View>
            )}

            <TouchableOpacity style={styles.routeButton} onPress={comoLlegar}>
                <Ionicons name="navigate-circle" size={28} color="white" />
                <Text style={styles.routeButtonText}>Cómo llegar (GPS)</Text>
            </TouchableOpacity>

            <View style={{height: 40}} /> 
        </View>
      </ScrollView>

      {/* MODAL FULL SCREEN */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
          <View style={styles.modalContainer}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setModalVisible(false)}
              >
                  <Ionicons name="close-circle" size={40} color="white" />
              </TouchableOpacity>

              <Image 
                source={{ uri: imagenSeleccionada }} 
                style={styles.fullScreenImage} 
                resizeMode="contain" 
              />
          </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  headerImageContainer: { position: 'relative' },
  backButton: {
    position: 'absolute',
    top: 40, left: 20, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8, borderRadius: 20
  },
  
  gallery: { height: 250 },
  galleryImage: { width: width, height: 250 }, 
  placeholderImage: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  
  paginationContainer: {
    position: 'absolute',
    bottom: 30, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    zIndex: 10,
  },
  paginationDot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  paginationDotActive: { backgroundColor: '#ffffff', width: 10, height: 10 },
  paginationDotInactive: { backgroundColor: 'rgba(255, 255, 255, 0.4)' },

  content: { 
    padding: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -20, 
    backgroundColor: '#fff', minHeight: 500, elevation: 5
  },
  
  headerInfo: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  badgeCategory: { alignSelf: 'flex-start', backgroundColor: '#e3f2fd', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  categoryText: { color: '#005bea', fontWeight: '600', fontSize: 13 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 15, marginBottom: 8 },
  description: { fontSize: 15, color: '#555', lineHeight: 24, marginBottom: 15 },
  
  infoBox: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 12, marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { marginLeft: 10, fontSize: 15, color: '#444' },
  
  mapContainer: { height: 200, width: '100%', borderRadius: 15, overflow: 'hidden', marginTop: 10, borderWidth: 1, borderColor: '#ddd' },
  map: { width: '100%', height: '100%' },
  
  routeButton: {
    marginTop: 20, backgroundColor: '#2ecc71', 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 15, borderRadius: 15,
    elevation: 4,
    shadowColor: '#2ecc71', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3,
  },
  routeButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },

  modalContainer: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  fullScreenImage: { width: width, height: height },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 20 }
});