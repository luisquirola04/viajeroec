import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, PixelRatio, Platform } from 'react-native';
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

// 1. Extraemos la función fuera del componente para que no se recree en cada render
const optimizarImagen = (url) => {
  if (!url) return null;
  // Usamos q_auto:eco para compresión máxima sin pérdida visual grave, ideal para listas
  return url.includes('cloudinary') 
    ? url.replace('/upload/', '/upload/w_400,h_200,c_fill,q_auto:eco,f_auto/') 
    : url;
};

// 2. CREAMOS UN COMPONENTE MEMORIZADO PARA LA TARJETA (El cambio más importante)
// React.memo evita que la tarjeta se vuelva a renderizar si sus datos no han cambiado
const ProvinciaCard = React.memo(({ item, onPress }) => {
  const nombrePais = (item.Pais && item.Pais.nombre) ? item.Pais.nombre : 'Ecuador';
  const uriOptimizada = optimizarImagen(item.imagen);

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
        transition={200} // Reducido de 500 a 200 para que se sienta instantáneo
        cachePolicy="memory-disk"
        recyclingKey={item.external} // Ayuda a reciclar la vista de la imagen en listas largas
      />
      
      <Text style={styles.descripcion} maxFontSizeMultiplier={1.1}>
        {item.info}
      </Text>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Solo re-renderiza si el ID (external) cambia
  return prevProps.item.external === nextProps.item.external;
});

// --- COMPONENTE PRINCIPAL ---
export default function ProvinciasScreen() {
  const router = useRouter();

  // 3. Usamos useCallback para que la función no cambie la referencia
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
        // 4. Optimizaciones nativas para FlatList (asumiendo que ListaRecargable las acepta)
        initialNumToRender={5} // Renderiza solo 5 al inicio para que la pantalla cargue rápido
        maxToRenderPerBatch={5} // Procesa de 5 en 5 al hacer scroll
        windowSize={11} // Mantiene en memoria 5 pantallas arriba y 5 abajo
        removeClippedSubviews={true} // Oculta elementos fuera de pantalla para ahorrar memoria
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
  descripcion: { fontSize: normalize(14), color: '#444', textAlign: 'left', paddingHorizontal: 4, lineHeight: normalize(20), marginTop: 10, width: '100%' }
});