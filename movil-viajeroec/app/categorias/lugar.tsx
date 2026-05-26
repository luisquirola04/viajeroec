import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import {
    ActionSheetIOS,
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";
import ImageZoom from "react-native-image-pan-zoom";
import { WebView } from "react-native-webview";
import { obtenerLugar } from "../../services/ApiServices";

// --- DETECCIÓN DE YOUTUBE ---
const esYouTube = (url: string): boolean => {
  if (!url) return false;
  const urlLower = url.toLowerCase();
  return urlLower.includes("youtube.com") || urlLower.includes("youtu.be");
};

// --- Detecta si un item multimedia es video ---
const esVideo = (item: any): boolean => {
  if (item.tipo && (item.tipo === "video" || item.tipo.includes("video")))
    return true;
  if (item.url) {
    const url = item.url.toLowerCase();
    if (url.includes("youtube.com") || url.includes("youtu.be")) return true;
    return (
      url.endsWith(".mp4") ||
      url.endsWith(".mov") ||
      url.endsWith(".avi") ||
      url.endsWith(".webm") ||
      url.includes("/video/") ||
      url.includes("video")
    );
  }
  return false;
};

// --- FUNCIÓN OPTIMIZADA PARA IMÁGENES (FUERZA WEBP Y REDUCE TAMAÑO) ---
const obtenerUrlAltaCalidad = (url: string) => {
  if (!url || !url.includes("cloudinary")) return url;

  // Si la imagen ya fue procesada o forzada a webp, la devolvemos
  if (url.includes("f_webp")) return url;

  if (url.includes("/upload/")) {
    // Si ya tiene f_auto configurado de la base de datos, lo cambiamos a f_webp e inyectamos un ancho máximo de 1080px
    if (url.includes("f_auto")) {
      return url.replace("f_auto", "f_webp,c_scale,w_1080");
    }
    // Si ya tiene q_auto pero no formato, le añadimos f_webp y el ancho de escala móvil
    if (url.includes("q_auto")) {
      return url.replace("q_auto", "q_auto,f_webp,c_scale,w_1080");
    }
    // Si la URL viene limpia sin transformaciones intermitentes, inyectamos todo el combo optimizado
    return url.replace("/upload/", "/upload/c_scale,w_1080,q_auto,f_webp/");
  }
  return url;
};

// --- FUERZA MP4 OPTIMIZADO PARA VIDEOS ---
const obtenerVideoOptimizado = (url: string) => {
  if (!url) return "";
  let secureUrl = url.replace(/^http:\/\//i, "https://");
  if (secureUrl.includes("cloudinary")) {
    if (secureUrl.includes("q_auto,f_auto")) {
      return secureUrl.replace("q_auto,f_auto", "q_auto,f_mp4,vc_auto");
    }
    return secureUrl.replace("/upload/", "/upload/q_auto,f_mp4,vc_auto/");
  }
  return secureUrl;
};

// --- FORMATEO DE HORARIO ---
const formatearHorario = (horario: string) => {
  if (!horario) return "Horario no disponible";
  if (horario.includes("00:00 a 00:00")) {
    return horario
      .replace("de 00:00 a 00:00", "(Abierto las 24 horas)")
      .replace("00:00 a 00:00", "Abierto las 24 horas");
  }
  return horario;
};

// --- Componente imagen con loading ---
const ImagenConCarga = ({ uri, style }: { uri: string; style: any }) => {
  const [cargando, setCargando] = useState(true);
  const uriOptimizada = obtenerUrlAltaCalidad(uri);

  return (
    <View
      style={[
        style,
        {
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1a1a2e",
        },
      ]}
    >
      <Image
        source={{ uri: uriOptimizada }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200} // Transición suave reducida a 200ms para mayor sensación de velocidad
        cachePolicy="memory-disk" // Guarda la caché agresivamente tanto en RAM como en Disco
        onLoadStart={() => setCargando(true)}
        onLoadEnd={() => setCargando(false)}
      />
      {cargando && (
        <ActivityIndicator
          style={{ position: "absolute", zIndex: 10 }}
          size="large"
          color="#005bea"
        />
      )}
    </View>
  );
};

const VideoBadge = () => (
  <View style={styles.videoBadge}>
    <Ionicons name="play-circle" size={42} color="rgba(255,255,255,0.92)" />
  </View>
);

const GalleryItem = ({
  item,
  onPress,
  windowWidth,
}: {
  item: any;
  onPress: () => void;
  windowWidth: number;
}) => {
  const isVid = esVideo(item);
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{ width: windowWidth, height: 260 }}
    >
      {isVid ? (
        <View
          style={{
            width: windowWidth,
            height: 260,
            backgroundColor: "#111",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {item.thumbnail ? (
            <Image
              source={{ uri: obtenerUrlAltaCalidad(item.thumbnail) }} // <-- OPTIMIZADO CON WEBP AQUÍ TAMBIÉN
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: "#1a1a2e" }]}
            />
          )}
          <VideoBadge />
          <View style={styles.videoLabelBadge}>
            <Ionicons
              name={esYouTube(item.url) ? "logo-youtube" : "videocam"}
              size={13}
              color="#fff"
            />
            <Text style={styles.videoLabelText}>VIDEO</Text>
          </View>
        </View>
      ) : (
        <ImagenConCarga
          uri={item.url}
          style={{ width: windowWidth, height: 260 }}
        />
      )}
    </TouchableOpacity>
  );
};

// -------------------------------------------------------------------
// PLAYER REAL: solo se monta cuando el usuario toca play.
// -------------------------------------------------------------------
const VideoPlayerActivo = ({ uri }: { uri: string }) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [cargando, setCargando] = useState(true);
  const uriOptimizada = obtenerVideoOptimizado(uri);

  const player = useVideoPlayer(uriOptimizada, (p) => {
    p.loop = false;
    p.play();
  });

  useEffect(() => {
    const sub = player.addListener(
      "statusChange",
      ({ status }: { status: string }) => {
        if (status === "readyToPlay") setCargando(false);
      },
    );
    return () => sub.remove();
  }, [player]);

  return (
    <View
      style={{
        width: windowWidth,
        height: windowHeight * 0.75,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    >
      <VideoView
        player={player}
        style={{ width: "100%", height: "100%" }}
        contentFit="contain"
        nativeControls
        fullscreenOptions={{ enable: true }}
      />
      {cargando && (
        <View
          pointerEvents="none"
          style={{
            ...StyleSheet.absoluteFillObject,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.55)",
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 10, fontSize: 13 }}>
            Cargando video...
          </Text>
        </View>
      )}
    </View>
  );
};

// -------------------------------------------------------------------
// WRAPPER LAZY: muestra thumbnail + botón play.
// -------------------------------------------------------------------
const VideoItem = ({ uri, thumbnail }: { uri: string; thumbnail?: string }) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [reproduciendo, setReproduciendo] = useState(false);

  if (reproduciendo) {
    return <VideoPlayerActivo uri={uri} />;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => setReproduciendo(true)}
      style={{
        width: windowWidth,
        height: windowHeight * 0.75,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {thumbnail ? (
        <Image
          source={{ uri: obtenerUrlAltaCalidad(thumbnail) }} // <-- OPTIMIZADO CON WEBP AQUÍ TAMBIÉN
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: "#1a1a2e" }]}
        />
      )}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(0,0,0,0.38)" },
        ]}
      />
      <View style={{ alignItems: "center" }}>
        <Ionicons name="play-circle" size={80} color="rgba(255,255,255,0.92)" />
        <Text
          style={{
            color: "rgba(255,255,255,0.82)",
            marginTop: 10,
            fontSize: 14,
          }}
        >
          Toca para reproducir
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// --- Modal de galería fullscreen ---
const GaleriaModal = ({
  visible,
  items,
  initialIndex,
  onClose,
}: {
  visible: boolean;
  items: any[];
  initialIndex: number;
  onClose: () => void;
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
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
    const uriOptimizadaModal = obtenerUrlAltaCalidad(item.url);

    return (
      <View
        style={{
          width: windowWidth,
          height: windowHeight,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        {isVid ? (
          esYouTube(item.url) ? (
            <View
              style={{
                width: windowWidth,
                height: windowHeight * 0.75,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {item.thumbnail ? (
                <Image
                  source={{ uri: obtenerUrlAltaCalidad(item.thumbnail) }} // <-- OPTIMIZADO CON WEBP
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              ) : (
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: "#1a1a2e" },
                  ]}
                />
              )}

              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: "rgba(0,0,0,0.6)" },
                ]}
              />

              <Ionicons
                name="logo-youtube"
                size={70}
                color="#FF0000"
                style={{ marginBottom: 15 }}
              />
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  marginBottom: 20,
                  textAlign: "center",
                  paddingHorizontal: 20,
                }}
              >
                Este video se reproduce en YouTube
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => Linking.openURL(item.url)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#FF0000",
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 30,
                  elevation: 5,
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                >
                  Abrir en YouTube
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <VideoItem uri={item.url} thumbnail={item.thumbnail} />
          )
        ) : (
          <ImageZoom
            cropWidth={windowWidth}
            cropHeight={windowHeight}
            imageWidth={windowWidth}
            imageHeight={windowHeight * 0.85}
            enableSwipeDown={false}
          >
            <Image
              source={{ uri: uriOptimizadaModal }}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
              transition={150}
              cachePolicy="memory-disk"
            />
          </ImageZoom>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <StatusBar hidden />
        <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
          <Ionicons
            name="close-circle"
            size={38}
            color="rgba(255,255,255,0.9)"
          />
        </TouchableOpacity>
        <View style={styles.modalCounter}>
          <Text style={styles.modalCounterText}>
            {currentIndex + 1} / {items.length}
          </Text>
        </View>
        {items[currentIndex] && esVideo(items[currentIndex]) && (
          <View style={styles.modalTypeBadge}>
            <Ionicons
              name={
                esYouTube(items[currentIndex].url) ? "logo-youtube" : "videocam"
              }
              size={14}
              color="#fff"
            />
            <Text style={styles.modalTypeText}>VIDEO</Text>
          </View>
        )}
        <FlatList
          ref={flatListRef}
          data={items}
          renderItem={renderItem}
          keyExtractor={(_, i) => i.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: windowWidth,
            offset: windowWidth * index,
            index,
          })}
          removeClippedSubviews
        />
        {items.length > 1 && (
          <View style={styles.modalDots}>
            {items.map((item, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === currentIndex ? styles.dotActive : styles.dotInactive,
                  esVideo(item) ? styles.dotVideo : {},
                ]}
              />
            ))}
          </View>
        )}
        {items.length > 1 && (
          <>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={styles.arrowLeft}
                onPress={() => {
                  const ni = currentIndex - 1;
                  flatListRef.current?.scrollToIndex({
                    index: ni,
                    animated: true,
                  });
                  setCurrentIndex(ni);
                }}
              >
                <Ionicons
                  name="chevron-back-circle"
                  size={44}
                  color="rgba(255,255,255,0.7)"
                />
              </TouchableOpacity>
            )}
            {currentIndex < items.length - 1 && (
              <TouchableOpacity
                style={styles.arrowRight}
                onPress={() => {
                  const ni = currentIndex + 1;
                  flatListRef.current?.scrollToIndex({
                    index: ni,
                    animated: true,
                  });
                  setCurrentIndex(ni);
                }}
              >
                <Ionicons
                  name="chevron-forward-circle"
                  size={44}
                  color="rgba(255,255,255,0.7)"
                />
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
  const { width: windowWidth } = useWindowDimensions();
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
    const slide = Math.ceil(
      event.nativeEvent.contentOffset.x /
        event.nativeEvent.layoutMeasurement.width,
    );
    if (slide !== activeSlide) setActiveSlide(slide);
  };

  const comoLlegar = () => {
    if (!lugar || !lugar.latitud || !lugar.longitud) return;
    const lat = lugar.latitud;
    const lng = lugar.longitud;
    const label = encodeURIComponent(lugar.nombre);

    if (Platform.OS === "android") {
      Linking.openURL(`geo:${lat},${lng}?q=${lat},${lng}(${label})`);
    } else {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancelar", "Apple Maps", "Google Maps", "Waze"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1)
            Linking.openURL(`maps:0,0?q=${label}@${lat},${lng}`);
          else if (buttonIndex === 2) {
            const urlApp = `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`;
            const urlWeb = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
            Linking.canOpenURL(urlApp).then((s) =>
              s ? Linking.openURL(urlApp) : Linking.openURL(urlWeb),
            );
          } else if (buttonIndex === 3) {
            const urlWaze = `waze://?ll=${lat},${lng}&navigate=yes`;
            Linking.canOpenURL(urlWaze).then((s) => {
              if (s) Linking.openURL(urlWaze);
              else
                Alert.alert(
                  "Waze no instalado",
                  "No se encontró la aplicación Waze.",
                );
            });
          }
        },
      );
    }
  };

  const abrirGaleria = (index: number) => {
    setModalIndex(index);
    setModalVisible(true);
  };

  if (!lugar)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#005bea" />
      </View>
    );

  const lat = parseFloat(lugar.latitud);
  const lng = parseFloat(lugar.longitud);
  const zoomFactor = 0.0002;
  const osmUrl =
    lugar.latitud && lugar.longitud
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - zoomFactor},${lat - zoomFactor},${lng + zoomFactor},${lat + zoomFactor}&layer=mapnik&marker=${lat},${lng}`
      : null;

  const multimedia =
    lugar.Multimedia ||
    lugar.multimedia ||
    lugar.multimedialugars ||
    lugar.multimedias ||
    [];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
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

          {multimedia.length > 0 && (
            <View style={styles.mediaCountBadge}>
              <Ionicons name="images-outline" size={14} color="#fff" />
              <Text style={styles.mediaCountText}> {multimedia.length}</Text>
            </View>
          )}

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.gallery}
            onMomentumScrollEnd={onScroll}
          >
            {multimedia.length > 0 ? (
              multimedia.map((item: any, index: number) => (
                <GalleryItem
                  key={index}
                  item={item}
                  onPress={() => abrirGaleria(index)}
                  windowWidth={windowWidth}
                />
              ))
            ) : (
              <View
                style={[
                  { width: windowWidth, height: 260 },
                  styles.placeholderImage,
                ]}
              >
                <Ionicons name="image-outline" size={50} color="#ccc" />
                <Text style={{ color: "#ccc", marginTop: 8 }}>
                  Sin imágenes
                </Text>
              </View>
            )}
          </ScrollView>

          {multimedia.length > 1 && (
            <View style={styles.paginationContainer}>
              {multimedia.map((item: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === activeSlide
                      ? styles.paginationDotActive
                      : styles.paginationDotInactive,
                    esVideo(item) ? styles.paginationDotVideo : {},
                  ]}
                />
              ))}
            </View>
          )}

          {multimedia.length > 0 && (
            <View style={styles.tapHint}>
              <Ionicons
                name="expand-outline"
                size={13}
                color="rgba(255,255,255,0.8)"
              />
              <Text style={styles.tapHintText}>
                {" "}
                Toca para ver en pantalla completa
              </Text>
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
                <Text style={styles.infoText}>
                  {formatearHorario(lugar.horario)}
                </Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Ionicons name="location" size={22} color="#005bea" />
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: "bold" }}>Parroquia: </Text>
                {lugar.Parroquia?.nombre || "No especificada"}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Ubicación</Text>
          {osmUrl ? (
            <View style={styles.mapContainer}>
              <WebView
                style={styles.map}
                source={{ uri: osmUrl }}
                scrollEnabled={true}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          ) : (
            <View
              style={[
                styles.mapContainer,
                { justifyContent: "center", alignItems: "center" },
              ]}
            >
              <Text style={{ color: "#888" }}>
                Ubicación en mapa no disponible
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.routeButton} onPress={comoLlegar}>
            <Ionicons name="navigate-circle" size={28} color="white" />
            <Text style={styles.routeButtonText}>Cómo llegar (GPS)</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <GaleriaModal
        visible={modalVisible}
        items={multimedia}
        initialIndex={modalIndex}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerImageContainer: { position: "relative" },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 8,
    borderRadius: 20,
  },
  mediaCountBadge: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  mediaCountText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  gallery: { height: 260 },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  videoBadge: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  videoLabelBadge: {
    position: "absolute",
    bottom: 14,
    left: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 5,
  },
  videoLabelText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
  },
  paginationContainer: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  paginationDot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 3 },
  paginationDotActive: { backgroundColor: "#ffffff", width: 10, height: 10 },
  paginationDotInactive: { backgroundColor: "rgba(255,255,255,0.4)" },
  paginationDotVideo: { borderWidth: 1.5, borderColor: "#e74c3c" },
  tapHint: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  tapHintText: { color: "rgba(255,255,255,0.75)", fontSize: 11 },
  content: {
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    backgroundColor: "#fff",
    minHeight: 500,
    elevation: 5,
  },
  headerInfo: { marginBottom: 20 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  badgeCategory: {
    alignSelf: "flex-start",
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryText: { color: "#005bea", fontWeight: "600", fontSize: 13 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
    marginBottom: 15,
  },
  infoBox: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  infoText: { marginLeft: 10, fontSize: 15, color: "#444" },
  mapContainer: {
    height: 200,
    width: "100%",
    borderRadius: 15,
    overflow: "hidden",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  map: { width: "100%", height: "100%" },
  routeButton: {
    marginTop: 20,
    backgroundColor: "#2ecc71",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 15,
    elevation: 4,
    shadowColor: "#2ecc71",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
  },
  routeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  modalCloseBtn: { position: "absolute", top: 50, right: 18, zIndex: 30 },
  modalCounter: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 20,
  },
  modalCounterText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontWeight: "600",
  },
  modalTypeBadge: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    backgroundColor: "rgba(231,76,60,0.8)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 20,
  },
  modalTypeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  modalDots: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 20,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  dotActive: { backgroundColor: "#fff", width: 10, height: 10 },
  dotInactive: { backgroundColor: "rgba(255,255,255,0.35)" },
  dotVideo: { backgroundColor: "#e74c3c" },
  arrowLeft: { position: "absolute", left: 10, top: "45%", zIndex: 25 },
  arrowRight: { position: "absolute", right: 10, top: "45%", zIndex: 25 },
});
