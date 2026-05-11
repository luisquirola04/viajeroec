import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { obtenerCategoriasHijas } from '../../services/ApiServices';

export default function CategoriasHijasScreen() {
  const [subcategorias, setSubcategorias] = useState([]);
  const [cargando, setCargando] = useState(true); 
  
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const cargarSubcategorias = async () => {
      setCargando(true); 
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
          setCargando(false); 
      }
    };
    
    cargarSubcategorias();
  }, [params.externalPadre]);

  const renderItem = ({ item }) => {
    // AQUÍ TAMBIÉN CONSUMIMOS DIRECTAMENTE DE LA BD
    const iconName = item.icono || 'grid';
    const hexColor = item.color || '#78909C';

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
        <View style={[styles.iconContainer, { backgroundColor: hexColor + '15' }]}>
           <Ionicons name={iconName as any} size={32} color={hexColor} />
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
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  loaderText: { marginTop: 15, color: '#555', fontSize: 16, fontWeight: '500' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { textAlign: 'center', marginTop: 15, color: '#888', fontSize: 16, paddingHorizontal: 30 }
}); 