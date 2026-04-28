import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { obtenerCategoriasHijas } from '../../services/ApiServices';

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
  const [cargando, setCargando] = useState(true); // <-- 1. NUEVO ESTADO DE CARGA
  
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const cargarSubcategorias = async () => {
      setCargando(true); // Aseguramos que inicie en cargando
      try {
        if (params.externalPadre) {
          const data = await obtenerCategoriasHijas(params.externalPadre);
          if (data && data.categorias) {
            setSubcategorias(data.categorias);
          }
        }
      } catch (error) {
          console.error("Error cargando subcategorías:", error);
      } finally {
          setCargando(false); // <-- 2. Apagamos el loader independientemente de si hay datos o error
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
          router.push({
             pathname: "/categorias/categoriaElegida", 
             params: {
                 nombreCategoria: item.nombre,
                 externalCategoria: item.external,
                 externalParroquia: params.externalParroquia
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
      
      <View style={styles.banner}>
        <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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

      {/* 3. LÓGICA CONDICIONAL: Mostramos el loader O la lista */}
      {cargando ? (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#1565C0" />
            <Text style={styles.loaderText}>Buscando opciones...</Text>
        </View>
      ) : (
        <FlatList
            data={subcategorias}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.gridContainer}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>No se encontraron subcategorías para esta opción.</Text>
                </View>
            }
        />
      )}
    </View>
  );
}

// ESTILOS
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
  
  // Nuevos estilos para el loader y el empty state
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  loaderText: { marginTop: 15, color: '#555', fontSize: 16, fontWeight: '500' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { textAlign: 'center', marginTop: 15, color: '#888', fontSize: 16, paddingHorizontal: 30 }
});