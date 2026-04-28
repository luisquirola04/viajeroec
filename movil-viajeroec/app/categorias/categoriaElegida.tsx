import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { listarLugaresCategoriaParroquia } from '../../services/ApiServices';

export default function CategoriaElegidaScreen() {
  const [lugares, setLugares] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- Estados y Refs para el buscador ---
  const [searchQuery, setSearchQuery] = useState(''); 
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef(null);

  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const cargarLugares = async () => {
      setIsLoading(true);
      try {
        if (params.externalParroquia && params.externalCategoria) {
          const respuesta = await listarLugaresCategoriaParroquia(params.externalParroquia, params.externalCategoria);
          
          if (respuesta && respuesta.data) {
               setLugares(respuesta.data);
          }
        }
      } catch (error) {
        console.error("Error al cargar lugares:", error);
      } finally {
        setIsLoading(false);
      }
    };
    cargarLugares();
  }, [params.externalParroquia, params.externalCategoria]);

  // Filtro en tiempo real
  const lugaresFiltrados = lugares.filter((lugar) => 
    lugar.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Funciones para controlar el buscador
  const abrirBuscador = () => {
    setShowSearch(true);
    // Esperamos un instante para que el TextInput se renderice antes de hacer focus
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const cerrarBuscador = () => {
    setSearchQuery(''); // Limpiamos el texto
    setShowSearch(false); // Ocultamos la barra
  };

  const renderLugar = ({ item }) => {
    // 1. Capturamos la lista de multimedia cubriendo posibles variaciones del nombre del campo
    const listaMedia = item.Multimedia || item.multimedia || item.multimedialugars || item.multimedias || [];
    
    // 2. Extraemos la URL original (o un placeholder si no hay fotos)
    const imagenOriginal = listaMedia.length > 0 
        ? listaMedia[0].url 
        : "https://via.placeholder.com/300x150.png?text=Sin+Imagen"; 

    // 3. OPTIMIZACIÓN CLOUDINARY PARA LISTA: Cortamos a 400px (w_400), ajustamos calidad (q_auto) y formato (f_auto)
    const imagenOptimizada = imagenOriginal.includes('cloudinary') 
        ? imagenOriginal.replace('/upload/', '/upload/c_scale,w_400,q_auto,f_auto/') 
        : imagenOriginal;

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
        <Image 
            // 4. Usamos la imagen optimizada
            source={{ uri: imagenOptimizada }} 
            style={styles.cardImage} 
            contentFit="cover" 
            transition={200} // Transición suave pero rápida
            cachePolicy="memory-disk"
        />
        
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
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* --- BANNER AZUL (Se adapta dinámicamente si el buscador está abierto) --- */}
      <View style={[styles.banner, { paddingBottom: showSearch ? 45 : 30 }]}>
        <View style={styles.headerRow}>
            <TouchableOpacity 
                onPress={() => router.back()} 
                style={styles.backButton}
                hitSlop={{top: 15, bottom: 15, left: 15, right: 15}} 
            >
                <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>

            <Text style={styles.bannerTitle} numberOfLines={1}>
                {params.nombreCategoria || 'Lugares'}
            </Text>
            
            {/* Botón de lupa (Solo se muestra si el buscador está cerrado) */}
            {!showSearch ? (
              <TouchableOpacity onPress={abrirBuscador} hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
                  <Ionicons name="search" size={24} color="#ffffff" />
              </TouchableOpacity>
            ) : (
              <View style={{width: 24}} /> /* Espaciador para mantener el título centrado */
            )}
        </View>

        <Text style={styles.bannerSubtitle}>
            Explora los mejores destinos seleccionados
        </Text>
      </View>

      {/* --- BARRA DE BÚSQUEDA DESPLEGABLE --- */}
      {!isLoading && lugares.length > 0 && showSearch && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#888" />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Escribe el nombre del lugar..."
              placeholderTextColor="#aaa"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {/* Botón "X" para cerrar el buscador y limpiar */}
            <TouchableOpacity onPress={cerrarBuscador} hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
              <Ionicons name="close-circle" size={22} color="#888" />
            </TouchableOpacity>
          </View>
      )}

      {/* --- CONTENIDO --- */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1565C0" />
          <Text style={styles.loadingText}>Cargando lugares...</Text>
        </View>
      ) : (
        <FlatList 
          data={lugaresFiltrados}
          keyExtractor={(item: any) => item.id ? item.id.toString() : Math.random().toString()}
          renderItem={renderLugar}
          contentContainerStyle={styles.listContainer}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          ListEmptyComponent={
              <View style={styles.center}>
                  <Text style={styles.emptyText}>
                     {searchQuery.length > 0 
                        ? `No encontramos "${searchQuery}" en esta categoría.` 
                        : "No hay lugares registrados aún en esta categoría."}
                  </Text>
              </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#6c757d', fontSize: 16 },
  listContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  center: { marginTop: 100, alignItems: 'center', paddingHorizontal: 20 }, 
  
  // --- BANNER ---
  banner: {
    backgroundColor: '#1565C0', 
    paddingTop: 20,   
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25, 
    borderBottomRightRadius: 25,
    elevation: 5,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 5,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backButton: { padding: 5 },
  bannerTitle: { fontSize: 22, fontWeight: '600', color: '#ffffff', textAlign: 'center', flex: 1 },
  bannerSubtitle: { fontSize: 14, color: '#E3F2FD', textAlign: 'center' },

  // --- BARRA DE BÚSQUEDA DESPLEGADA ---
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: -25, // Se superpone al banner
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    height: '100%',
  },

  // --- CARDS ---
  card: {
    backgroundColor: 'white', borderRadius: 16, marginBottom: 20, elevation: 3, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 4, overflow: 'hidden',
  },
  cardImage: { width: '100%', height: 160, backgroundColor: '#e1e4e8' },
  cardContent: { padding: 15 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 10 },
  badgeHorario: { backgroundColor: '#f0f0f0', padding: 6, borderRadius: 50 },
  cardDescription: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 12 },
  verMas: { fontSize: 13, color: '#005bea', fontWeight: '600', textAlign: 'right' },
  emptyText: { color: '#aaa', fontSize: 16, textAlign: 'center', lineHeight: 24 }
});