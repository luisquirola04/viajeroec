import React, { useEffect, useState, useRef } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    Dimensions, Linking, Platform, StatusBar, Modal, ActionSheetIOS, Alert,
    ActivityIndicator, FlatList
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview'; 
import { VideoView, useVideoPlayer } from 'expo-video';
import { Image } from 'expo-image'; 
import { obtenerLugar } from '../../services/ApiServices'; 

const { width, height } = Dimensions.get('window');

// --- DETECCIÓN DE YOUTUBE ---
const esYouTube = (url: string): boolean => {
    if (!url) return false;
    const urlLower = url.toLowerCase();
    return urlLower.includes('youtube.com') || urlLower.includes('youtu.be');
};

const obtenerIdYouTube = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// --- Detecta si un item multimedia es video ---
const esVideo = (item: any): boolean => {
    if (item.tipo && (item.tipo === 'video' || item.tipo.includes('video'))) return true;
    if (item.url) {
        const url = item.url.toLowerCase();
        if (url.includes('youtube.com') || url.includes('youtu.be')) return true;
        return url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.avi') || 
               url.endsWith('.webm') || url.includes('/video/') || url.includes('video');
    }
    return false;
};

// --- Componente imagen con loading (Optimizado con expo-image) ---
const ImagenConCarga = ({ uri, style }: { uri: string; style: any }) => {
    const [cargando, setCargando] = useState(true);
    return (
        <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }]}>
            {cargando && (
                <ActivityIndicator style={StyleSheet.absoluteFill} size="large" color="#005bea" />
            )}
            <Image 
                source={{ uri }}
                style={[StyleSheet.absoluteFill]}
                contentFit="cover"
                transition={300}
                cachePolicy="memory-disk"
                onLoadStart={() => setCargando(true)}
                onLoadEnd={() => setCargando(false)}
            />
        </View>
    );
};

// --- Badge sobre la miniatura que indica si es video ---
const VideoBadge = () => (
    <View style={styles.videoBadge}>
        <Ionicons name="play-circle" size={42} color="rgba(255,255,255,0.92)" />
    </View>
);

// --- Item individual dentro del carrusel principal ---
const GalleryItem = ({ item, onPress }: { item: any; onPress: () => void }) => {
    const isVid = esVideo(item);
    return (
        <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ width, height: 260 }}>
            {isVid ? (
                <View style={{ width, height: 260, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}>
                    {item.thumbnail ? (
                        <Image 
                           source={{ uri: item.thumbnail }} 
                           style={StyleSheet.absoluteFill} 
                           contentFit="cover" 
                           cachePolicy="memory-disk"
                        />
                    ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1a1a2e' }]} />
                    )}
                    <VideoBadge />
                    <View style={styles.videoLabelBadge}>
                        <Ionicons name={esYouTube(item.url) ? "logo-youtube" : "videocam"} size={13} color="#fff" />
                        <Text style={styles.videoLabelText}>VIDEO</Text>
                    </View>
                </View>
            ) : (
                <ImagenConCarga uri={item.url} style={{ width, height: 260 }} />
            )}
        </TouchableOpacity>
    );
};

// --- Componente de video usando expo-video ---
const VideoItem = ({ uri }: { uri: string }) => {
    const player = useVideoPlayer(uri, p => {
        p.loop = false;
        p.pause();
    });
    return (
        <VideoView
            player={player}
            style={{ width, height: height * 0.75 }}
            contentFit="contain"
            nativeControls
        />
    );
};

// --- Modal de galería fullscreen con swipe ---
const GaleriaModal = ({ visible, items, initialIndex, onClose }: { visible: boolean; items: any[]; initialIndex: number; onClose: () => void; }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (visible) {
            setCurrentIndex(initialIndex);
            setTimeout(() => {
                flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
            }, 50);
        }
    }, [visible, initialIndex]);

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index ?? 0);
        }
    }).current;

    const renderItem = ({ item }: { item: any }) => {
        const isVid = esVideo(item);
        return (
            <View style={{ width, height, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                {isVid ? (
                    esYouTube(item.url) ? (
                        <WebView
                            style={{ width, height: height * 0.4 }} 
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            allowsFullscreenVideo={true}
                            source={{ uri: `https://www.youtube.com/embed/${obtenerIdYouTube(item.url)}?autoplay=1&controls=1` }}
                        />
                    ) : (
                        <VideoItem uri={item.url} />
                    )
                ) : (
                    <Image
                        source={{ uri: item.url }}
                        style={{ width, height: height * 0.85 }}
                        contentFit="contain"
                        transition={200}
                        cachePolicy="memory-disk"
                    />
                )}
            </View>
        );
    };

    return (
        <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onClose} statusBarTranslucent >
            <View style={{ flex: 1, backgroundColor: '#000' }}>
                <StatusBar hidden />
                <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
                    <Ionicons name="close-circle" size={38} color="rgba(255,255,255,0.9)" />
                </TouchableOpacity>
                <View style={styles.modalCounter}>
                    <Text style={styles.modalCounterText}>{currentIndex + 1} / {items.length}</Text>
                </View>
                {esVideo(items[currentIndex]) && (
                    <View style={styles.modalTypeBadge}>
                        <Ionicons name={esYouTube(items[currentIndex].url) ? "logo-youtube" : "videocam"} size={14} color="#fff" />
                        <Text style={styles.modalTypeText}>VIDEO</Text>
                    </View>
                )}
                <FlatList
                    ref={flatListRef} data={items} renderItem={renderItem} keyExtractor={(_, i) => i.toString()}
                    horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged} viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
                    initialScrollIndex={initialIndex} getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                    removeClippedSubviews
                />
                {items.length > 1 && (
                    <View style={styles.modalDots}>
                        {items.map((item, i) => (
                            <View key={i} style={[ styles.dot, i === currentIndex ? styles.dotActive : styles.dotInactive, esVideo(item) ? styles.dotVideo : {} ]} />
                        ))}
                    </View>
                )}
                {items.length > 1 && (
                    <>
                        {currentIndex > 0 && (
                            <TouchableOpacity style={styles.arrowLeft} onPress={() => { const ni = currentIndex - 1; flatListRef.current?.scrollToIndex({ index: ni, animated: true }); setCurrentIndex(ni); }}>
                                <Ionicons name="chevron-back-circle" size={44} color="rgba(255,255,255,0.7)" />
                            </TouchableOpacity>
                        )}
                        {currentIndex < items.length - 1 && (
                            <TouchableOpacity style={styles.arrowRight} onPress={() => { const ni = currentIndex + 1; flatListRef.current?.scrollToIndex({ index: ni, animated: true }); setCurrentIndex(ni); }}>
                                <Ionicons name="chevron-forward-circle" size={44} color="rgba(255,255,255,0.7)" />
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </View>
        </Modal>
    );
};

// ============================================================
// PANTALLA PRINCIPAL
// ============================================================
export default function LugarDetalleScreen() {
  const [lugar, setLugar] = useState<any>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const cargarDetalle = async () => {
      if (params.externalLugar) {
        try {
          const respuesta = await obtenerLugar(params.externalLugar);
          if (respuesta && respuesta.data && Array.isArray(respuesta.data)) {
              if (respuesta.data.length > 0) setLugar(respuesta.data[0]);
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
    if (slide !== activeSlide) setActiveSlide(slide);
  };

  const comoLlegar = () => {
    if (!lugar || !lugar.latitud || !lugar.longitud) return;
    const lat = lugar.latitud;
    const lng = lugar.longitud;
    const label = encodeURIComponent(lugar.nombre);

    if (Platform.OS === 'android') {
        Linking.openURL(`geo:${lat},${lng}?q=${lat},${lng}(${label})`);
    } else {
        ActionSheetIOS.showActionSheetWithOptions(
            { options: ['Cancelar', 'Apple Maps', 'Google Maps', 'Waze'], cancelButtonIndex: 0 },
            (buttonIndex) => {
                if (buttonIndex === 1) Linking.openURL(`maps:0,0?q=${label}@${lat},${lng}`);
                else if (buttonIndex === 2) {
                    const urlApp = `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`;
                    const urlWeb = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                    Linking.canOpenURL(urlApp).then(s => s ? Linking.openURL(urlApp) : Linking.openURL(urlWeb));
                } else if (buttonIndex === 3) {
                    const urlWaze = `waze://?ll=${lat},${lng}&navigate=yes`;
                    Linking.canOpenURL(urlWaze).then(s => {
                        if (s) Linking.openURL(urlWaze);
                        else Alert.alert("Waze no instalado", "No se encontró la aplicación Waze.");
                    });
                }
            }
        );
    }
  };

  const abrirGaleria = (index: number) => {
      setModalIndex(index);
      setModalVisible(true);
  };

  if (!lugar) return (
    <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#005bea" /></View>
  );

  const lat = parseFloat(lugar.latitud);
  const lng = parseFloat(lugar.longitud);
  const zoomFactor = 0.0002;
  const osmUrl = lugar.latitud && lugar.longitud 
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - zoomFactor},${lat - zoomFactor},${lng + zoomFactor},${lat + zoomFactor}&layer=mapnik&marker=${lat},${lng}`
    : null;

  const multimedia = lugar.Multimedia || [];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="light-content" backgroundColor="#005bea" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerImageContainer}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            {multimedia.length > 0 && (
                <View style={styles.mediaCountBadge}>
                    <Ionicons name="images-outline" size={14} color="#fff" />
                    <Text style={styles.mediaCountText}> {multimedia.length}</Text>
                </View>
            )}

            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.gallery} onMomentumScrollEnd={onScroll} >
                {multimedia.length > 0 ? (
                    multimedia.map((item: any, index: number) => (
                        <GalleryItem key={index} item={item} onPress={() => abrirGaleria(index)} />
                    ))
                ) : (
                    <View style={[{ width, height: 260 }, styles.placeholderImage]}>
                        <Ionicons name="image-outline" size={50} color="#ccc" />
                        <Text style={{ color: '#ccc', marginTop: 8 }}>Sin imágenes</Text>
                    </View>
                )}
            </ScrollView>

            {multimedia.length > 1 && (
                <View style={styles.paginationContainer}>
                    {multimedia.map((item: any, index: number) => (
                        <View key={index} style={[ styles.paginationDot, index === activeSlide ? styles.paginationDotActive : styles.paginationDotInactive, esVideo(item) ? styles.paginationDotVideo : {} ]} />
                    ))}
                </View>
            )}

            {multimedia.length > 0 && (
                <View style={styles.tapHint}>
                    <Ionicons name="expand-outline" size={13} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.tapHintText}> Toca para ver en pantalla completa</Text>
                </View>
            )}
        </View>

        <View style={styles.content}>
            <View style={styles.headerInfo}>
                <Text style={styles.title}>{lugar.nombre}</Text>
                <View style={styles.badgeCategory}><Text style={styles.categoryText}>{lugar.Categoria?.nombre}</Text></View>
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
                    <Text style={styles.infoText}><Text style={{ fontWeight: 'bold' }}>Parroquia: </Text>{lugar.Parroquia?.nombre || 'No especificada'}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Ubicación</Text>
            {osmUrl ? (
                <View style={styles.mapContainer}>
                    <WebView style={styles.map} source={{ uri: osmUrl }} scrollEnabled={true} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} />
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

            <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <GaleriaModal visible={modalVisible} items={multimedia} initialIndex={modalIndex} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerImageContainer: { position: 'relative' },
  backButton: { position: 'absolute', top: 40, left: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.35)', padding: 8, borderRadius: 20 },
  mediaCountBadge: { position: 'absolute', top: 40, right: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  mediaCountText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  gallery: { height: 260 },
  placeholderImage: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  videoBadge: { position: 'absolute', justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  videoLabelBadge: { position: 'absolute', bottom: 14, left: 14, backgroundColor: 'rgba(0,0,0,0.55)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, zIndex: 5 },
  videoLabelText: { color: '#fff', fontSize: 11, fontWeight: '700', marginLeft: 4 },
  paginationContainer: { position: 'absolute', bottom: 32, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  paginationDot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 3 },
  paginationDotActive: { backgroundColor: '#ffffff', width: 10, height: 10 },
  paginationDotInactive: { backgroundColor: 'rgba(255,255,255,0.4)' },
  paginationDotVideo: { borderWidth: 1.5, borderColor: '#e74c3c' },
  tapHint: { position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  tapHintText: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
  content: { padding: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -20, backgroundColor: '#fff', minHeight: 500, elevation: 5 },
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
  routeButton: { marginTop: 20, backgroundColor: '#2ecc71', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, borderRadius: 15, elevation: 4, shadowColor: '#2ecc71', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3 },
  routeButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  modalCloseBtn: { position: 'absolute', top: 50, right: 18, zIndex: 30 },
  modalCounter: { position: 'absolute', top: 55, left: 0, right: 0, alignItems: 'center', zIndex: 20 },
  modalCounterText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  modalTypeBadge: { position: 'absolute', top: 100, alignSelf: 'center', backgroundColor: 'rgba(231,76,60,0.8)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, zIndex: 20 },
  modalTypeText: { color: '#fff', fontSize: 12, fontWeight: '700', marginLeft: 4 },
  modalDots: { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', zIndex: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  dotActive: { backgroundColor: '#fff', width: 10, height: 10 },
  dotInactive: { backgroundColor: 'rgba(255,255,255,0.35)' },
  dotVideo: { backgroundColor: '#e74c3c' },
  arrowLeft: { position: 'absolute', left: 10, top: '45%', zIndex: 25 },
  arrowRight: { position: 'absolute', right: 10, top: '45%', zIndex: 25 },
});