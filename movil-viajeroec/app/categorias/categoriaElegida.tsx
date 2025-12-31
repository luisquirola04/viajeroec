import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { listarLugaresCategoriaParroquia } from '../../services/ApiServices'; 

export default function CategoriaElegidaScreen() {
  const [lugares, setLugares] = useState([]);
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const cargarLugares = async () => {
      if (params.externalParroquia && params.externalCategoria) {
        const respuesta = await listarLugaresCategoriaParroquia(params.externalParroquia, params.externalCategoria);
        
        if (respuesta && respuesta.data) {
             setLugares(respuesta.data);
        }
      }
    };
    cargarLugares();
  }, [params.externalParroquia, params.externalCategoria]);

  const renderLugar = ({ item }) => {
    const imagenUrl = item.Multimedia && item.Multimedia.length > 0 
        ? item.Multimedia[0].url 
        : "https://via.placeholder.com/300x150.png?text=Sin+Imagen"; 

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => {
            router.push({
                pathname: "/categorias/lugar",
                params: {
                    externalLugar: item.external,
                    nombreLugar: item.nombre
                }
            });
        }}
      >
        <Image source={{ uri: imagenUrl }} style={styles.cardImage} resizeMode="cover" />
        
        <View style={styles.cardContent}>
            <View style={styles.rowHeader}>
                <Text style={styles.cardTitle}>{item.nombre}</Text>
                {item.horario ? (
                    <View style={styles.badgeHorario}>
                        <Ionicons name="time-outline" size={14} color="#555" />
                    </View>
                ) : null}
            </View>
            
            <Text style={styles.cardDescription} numberOfLines={2}>
                {item.descripcion}
            </Text>

            <Text style={styles.verMas}>Toca para ver detalles</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#005bea" />

      {/* --- BANNER AZUL COMPACTO (Igual al anterior) --- */}
      <View style={styles.banner}>
        <View style={styles.headerRow}>
            <TouchableOpacity 
                onPress={() => router.back()} 
                style={styles.backButton}
                hitSlop={{top: 15, bottom: 15, left: 15, right: 15}} 
            >
                <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>

            <Text style={styles.bannerTitle}>
                {params.nombreCategoria || 'Lugares'}
            </Text>
            
            {/* Espaciador para centrar */}
            <View style={{width: 30}} />
        </View>

        <Text style={styles.bannerSubtitle}>
            Explora los mejores destinos seleccionados
        </Text>
      </View>

      <FlatList 
        data={lugares}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderLugar}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
            <View style={styles.center}>
                <Text style={styles.emptyText}>No hay lugares registrados aún en esta categoría.</Text>
            </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  listContainer: { paddingHorizontal: 10, paddingBottom: 20 },
  center: { marginTop: 250, alignItems: 'center' },
  
  // --- ESTILOS DEL BANNER ---
  banner: {
    backgroundColor: '#1565C0', 
    paddingTop: 20,   
    paddingBottom: 30, 
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25, 
    borderBottomRightRadius: 25,
    marginBottom: 20, 
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
    marginBottom: 8, 
  },
  backButton: { padding: 5 },
  bannerTitle: {
    fontSize: 22, 
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
  },
  bannerSubtitle: {
    fontSize: 14, 
    color: '#E3F2FD', 
    textAlign: 'center',
  },

  // --- CARD STYLES ---
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 160, 
    backgroundColor: '#e1e4e8',
  },
  cardContent: { padding: 15 },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  badgeHorario: {
    backgroundColor: '#f0f0f0',
    padding: 6,
    borderRadius: 50,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  verMas: {
    fontSize: 13,
    color: '#005bea',
    fontWeight: '600',
    textAlign: 'right',
  },
  emptyText: { color: '#aaa', fontSize: 16 }
});