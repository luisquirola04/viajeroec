import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { obtenerCategoriasHijas } from '../../services/ApiServices'; // Asegúrate de importar tu hook

// --- LÓGICA DE ICONOS (Reutilizada) ---
const getAtributosCategoria = (nombre: string) => {
  const nombreLower = nombre.toLowerCase();
  if (nombreLower.includes('comer') || nombreLower.includes('tradicional') || nombreLower.includes('plato')) return { icon: 'restaurant', color: '#FF5252' }; 
  if (nombreLower.includes('dormir') || nombreLower.includes('hotel')) return { icon: 'bed', color: '#00E676' }; 
  if (nombreLower.includes('evento')) return { icon: 'calendar', color: '#FFD600' }; 
  if (nombreLower.includes('visitar') || nombreLower.includes('turismo')) return { icon: 'camera', color: '#00B0FF' }; 
  if (nombreLower.includes('hacer') || nombreLower.includes('deporte')) return { icon: 'bicycle', color: '#FF6D00' }; 
  return { icon: 'grid', color: '#78909C' }; 
};

export default function CategoriasHijasScreen() {
  const [subcategorias, setSubcategorias] = useState([]);
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const cargarSubcategorias = async () => {
      if (params.externalPadre) {
        // Llamamos al backend buscando las hijas del ID recibido
        const data = await obtenerCategoriasHijas(params.externalPadre);
        if (data && data.categorias) {
          setSubcategorias(data.categorias);
        }
      }
    };
    cargarSubcategorias();
  }, [params.externalPadre]);

  const renderItem = ({ item }) => {
    const { icon, color } = getAtributosCategoria(item.nombre);
    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => {
          // Desde aquí SIEMPRE vamos a la lista de lugares, porque ya estamos en el último nivel
          router.push({
             pathname: "/categorias/categoriaElegida", 
             params: {
                 nombreCategoria: item.nombre,
                 externalCategoria: item.external, // ID de la subcategoría
                 externalParroquia: params.externalParroquia // Pasamos el ID de la parroquia que venía arrastrando
             }
          });
        }}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
           <Ionicons name={icon as any} size={32} color={color} />
        </View>
        <Text style={styles.cardText}>{item.nombre}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#005bea" />
      <Stack.Screen options={{ headerShown: false }} /> 
      
      {/* BANNER REUTILIZADO (Azul) */}
      <View style={styles.banner}>
        <View style={styles.headerRow}>
            <TouchableOpacity 
                onPress={() => router.back()} 
                style={styles.backButton}
            >
                <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>

            <Text style={styles.bannerTitle}>
                {params.nombrePadre || 'Subcategorías'}
            </Text>
            <View style={{width: 30}} />
        </View>

        <Text style={styles.bannerSubtitle}>
            Selecciona una opción específica:
        </Text>
      </View>

      <FlatList
        data={subcategorias}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContainer}
        ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron subcategorías.</Text>
        }
      />
    </View>
  );
}

// ESTILOS (Mismos que el index para mantener consistencia)
const { width } = Dimensions.get('window');
const cardSize = (width - 50) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  banner: {
    backgroundColor: '#1565C0', paddingTop: 20, paddingBottom: 30, paddingHorizontal: 20,
    borderBottomLeftRadius: 25, borderBottomRightRadius: 25, marginBottom: 30, elevation: 5
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backButton: { padding: 5 },
  bannerTitle: { fontSize: 22, fontWeight: '600', color: '#ffffff', textAlign: 'center', flex: 1 },
  bannerSubtitle: { fontSize: 16, color: '#E3F2FD', textAlign: 'center' },
  gridContainer: { paddingHorizontal: 15, paddingBottom: 40 },
  row: { justifyContent: 'space-between', marginBottom: 15 },
  card: {
    width: cardSize, height: cardSize * 0.9, backgroundColor: '#ffffff', borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', elevation: 2, padding: 10
  },
  iconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardText: { fontSize: 14, fontWeight: '600', color: '#455A64', textAlign: 'center' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#aaa', fontSize: 16 }
});