import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, PixelRatio, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { listarProvinciasEc } from '../../services/ApiServices';
import ListaRecargable from '../../components/listaRecargable';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; 

function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
}

const optimizarImagen = (url) => {
  if (!url) return null;
  return url.includes('cloudinary') 
    ? url.replace('/upload/', '/upload/w_400,h_200,c_fill,q_auto:eco,f_auto/') 
    : url;
};

// COMPONENTE DE TARJETA ACTUALIZADO
const ProvinciaCard = React.memo(({ item, onPress }) => {
  const nombrePais = (item.Pais && item.Pais.nombre) ? item.Pais.nombre : 'Ecuador';
  const uriOptimizada = optimizarImagen(item.imagen);

  // --- CONFIGURACIÓN DE RESPIRACIÓN (SÓLO EL BOTÓN) ---
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Secuencia que hace crecer y encoger EL BOTÓN suavemente
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.04, // Crece un 4% para llamar la atención
          duration: 1200, // Tarda 1.2 segundos en crecer
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1, // Vuelve a su tamaño normal
          duration: 1200, // Tarda 1.2 segundos en encoger
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text style={styles.nombreProvincia} adjustsFontSizeToFit={true} numberOfLines={1}>
        {item.nombre}
      </Text>

      <View style={styles.badgeContainer}>
        <Text style={styles.paisTexto}>📍 En {nombrePais}</Text>
      </View>

      <Image
        source={uriOptimizada ? { uri: uriOptimizada } : null}
        style={styles.imagen}
        contentFit="cover"
        transition={200} 
        cachePolicy="memory-disk"
        recyclingKey={item.external} 
      />
      
      <Text style={styles.descripcion} maxFontSizeMultiplier={1.1}>
        {item.info}
      </Text>

      {/* --- BOTÓN ANIMADO --- */}
      <Animated.View 
        style={[
          styles.botonContainer, 
          { transform: [{ scale: scaleAnim }] } // Aplicamos la animación solo aquí
        ]}
      >
        <Text style={styles.textoBoton}>Explorar cantones</Text>
      </Animated.View>

    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return prevProps.item.external === nextProps.item.external;
});

// --- COMPONENTE PRINCIPAL ---
export default function ProvinciasScreen() {
  const router = useRouter();

  const renderCard = useCallback(({ item }) => {
    return (
      <ProvinciaCard 
        item={item} 
        onPress={() => {
          router.push({
            pathname: "/estructura/canton",
            params: { external: item.external, nombreProvincia: item.nombre }
          });
        }} 
      />
    );
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.tituloHeader}>Explorar Provincias</Text>

      <ListaRecargable
        funcionCarga={listarProvinciasEc}
        renderItem={renderCard}
        contentContainerStyle={{ paddingBottom: 20 }}
        initialNumToRender={5} 
        maxToRenderPerBatch={5} 
        windowSize={11} 
        removeClippedSubviews={true} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 8, alignItems: 'center' },
  tituloHeader: { fontSize: normalize(24), fontWeight: 'bold', marginBottom: 20, color: '#333' },
  card: {
    backgroundColor: '#ffffff', borderRadius: 15, borderWidth: 1, borderColor: '#ddd',
    padding: 15, marginBottom: 20, width: '90%', maxWidth: 400, alignSelf: 'center', 
    alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  nombreProvincia: { fontSize: normalize(22), fontWeight: 'bold', marginBottom: 5, color: '#333', textAlign: 'center', width: '100%' },
  badgeContainer: { backgroundColor: '#e6f0ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 10 },
  paisTexto: { fontSize: normalize(14), color: '#0056b3', fontWeight: '600' },
  imagen: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10, backgroundColor: '#e1e4e8' },
  descripcion: { fontSize: normalize(14), color: '#444', textAlign: 'left', paddingHorizontal: 4, lineHeight: normalize(20), marginTop: 10, width: '100%', marginBottom: 15 },
  
  // ESTILOS PARA EL BOTÓN
  botonContainer: {
    backgroundColor: '#0056b3', 
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  textoBoton: {
    color: '#ffffff', 
    fontSize: normalize(16),
    fontWeight: 'bold',
    textAlign: 'center',
  }
});