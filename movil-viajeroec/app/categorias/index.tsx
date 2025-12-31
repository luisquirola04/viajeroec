import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { listarCategorias } from '../../services/ApiServices'; 

// --- LÓGICA DE ICONOS (Igual) ---
const getAtributosCategoria = (nombre: string) => {
  const nombreLower = nombre.toLowerCase();
  if (nombreLower.includes('comer') || nombreLower.includes('gastronomia')) return { icon: 'restaurant', color: '#FF5252' }; 
  if (nombreLower.includes('dormir') || nombreLower.includes('alojamiento')) return { icon: 'bed', color: '#00E676' }; 
  if (nombreLower.includes('evento') || nombreLower.includes('agenda')) return { icon: 'calendar', color: '#FFD600' }; 
  if (nombreLower.includes('visitar') || nombreLower.includes('turismo')) return { icon: 'camera', color: '#00B0FF' }; 
  if (nombreLower.includes('hacer') || nombreLower.includes('actividad')) return { icon: 'bicycle', color: '#FF6D00' }; 
  return { icon: 'grid', color: '#78909C' }; 
};

export default function CategoriasScreen() {
  const [categorias, setCategorias] = useState([]);
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const cargarCategorias = async () => {
      const data = await listarCategorias();
      if (data && data.categorias) {
        setCategorias(data.categorias);
      }
    };
    cargarCategorias();
  }, []);

  const renderItem = ({ item }) => {
    const { icon, color } = getAtributosCategoria(item.nombre);
    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => console.log("Categoría click:", item.nombre)}
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
      
      {/* --- BANNER COMPACTO --- */}
      <View style={styles.banner}>
        
        {/* Contenedor fila para Flecha + Título */}
        <View style={styles.headerRow}>
            <TouchableOpacity 
                onPress={() => router.back()} 
                style={styles.backButton}
                hitSlop={{top: 15, bottom: 15, left: 15, right: 15}} 
            >
                <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>

            <Text style={styles.bannerTitle}>
                Parroquia <Text style={styles.resaltado}>{params.nombreParroquia}</Text>
            </Text>
            
            {/* View vacía para equilibrar el espacio a la derecha y que el texto quede centrado */}
            <View style={{width: 30}} />
        </View>

        <Text style={styles.bannerSubtitle}>
            Elige una categoría para explorar:
        </Text>
      </View>

      {/* --- CUADRÍCULA --- */}
      <FlatList
        data={categorias}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContainer}
        ListEmptyComponent={
            <Text style={styles.emptyText}>Cargando categorías...</Text>
        }
      />
    </View>
  );
}

const { width } = Dimensions.get('window');
const cardSize = (width - 50) / 2; // Ajusté un poco el cálculo

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', 
  },
  // --- BANNER COMPACTO ---
  banner: {
    backgroundColor: '#1565C0', // Un azul un poco menos oscuro, más amable
    paddingTop: 20,   
    paddingBottom: 30, 
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25, // Curvas más sutiles
    borderBottomRightRadius: 25,
    marginBottom: 30, // Menos separación con las tarjetas
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8, // Espacio pequeño entre título y subtítulo
  },
  backButton: {
    padding: 5,
    // Eliminé el fondo de la flecha para que sea más limpia
  },
  bannerTitle: {
    fontSize: 25, // Texto más pequeño
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    flex: 1, // Para que ocupe el centro
  },
  resaltado: {
    fontWeight: 'bold',
    color: '#FFD700', 
    fontSize: 19,
  },
  bannerSubtitle: {
    fontSize: 18, // Subtítulo discreto
    color: '#E3F2FD', // Azul muy claro
    textAlign: 'center',
  },
  // --- GRID ---
  gridContainer: {
    paddingHorizontal: 15, // Márgenes laterales un poco más ajustados
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15, // Menos espacio entre filas
  },
  card: {
    width: cardSize,
    height: cardSize * 0.9, // Tarjetas un poco más rectangulares (menos altas)
    backgroundColor: '#ffffff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2, // Sombra más sutil
    shadowColor: '#90A4AE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 10,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#455A64',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#aaa',
    fontSize: 16,
  }
});