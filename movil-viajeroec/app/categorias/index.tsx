import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { listarCategorias, obtenerCategoriasHijas } from '../../services/ApiServices'; 

// --- LÓGICA DE ICONOS ---
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
  const [isLoading, setIsLoading] = useState(true); // <-- Nuevo estado de carga inicial
  const [loadingCheck, setLoadingCheck] = useState(false); // Estado para mostrar carga al verificar hijas
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const cargarCategorias = async () => {
      setIsLoading(true); // Iniciamos carga inicial
      try {
        const data = await listarCategorias();
        if (data && data.categorias) {
          setCategorias(data.categorias);
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      } finally {
        setIsLoading(false); // Detenemos carga inicial
      }
    };
    cargarCategorias();
  }, []);

  // Función inteligente de navegación
  const manejarNavegacion = async (item) => {
    setLoadingCheck(true); // Mostramos spinner si la consulta tarda
    try {
        // Consultamos si tiene hijas
        const dataHijas = await obtenerCategoriasHijas(item.external);
        
        setLoadingCheck(false);

        // Verificamos si el array tiene elementos
        if (dataHijas && dataHijas.categorias && dataHijas.categorias.length > 0) {
            // CASO 1: TIENE HIJAS -> Vamos a la pantalla intermedia
            router.push({
                pathname: "/categorias/categoriasHijas",
                params: {
                    externalPadre: item.external,
                    nombrePadre: item.nombre,
                    externalParroquia: params.parroquiaExternal // Pasamos la parroquia para no perderla
                }
            });
        } else {
            // CASO 2: NO TIENE HIJAS -> Vamos directo a los lugares (Comportamiento original)
            router.push({
                pathname: "/categorias/categoriaElegida", 
                params: {
                    nombreCategoria: item.nombre,
                    externalCategoria: item.external,      
                    externalParroquia: params.parroquiaExternal 
                }
            });
        }
    } catch (error) {
        setLoadingCheck(false);
        console.error("Error verificando subcategorías", error);
        // Si falla, por seguridad mandamos a lugares
        router.push({
            pathname: "/categorias/categoriaElegida", 
            params: {
                nombreCategoria: item.nombre,
                externalCategoria: item.external,      
                externalParroquia: params.parroquiaExternal 
            }
        });
    }
  };

  const renderItem = ({ item }) => {
    const { icon, color } = getAtributosCategoria(item.nombre);
    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.7}
        // Usamos la nueva función
        onPress={() => manejarNavegacion(item)}
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
      
      {/* Banner */}
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
                Parroquia <Text style={styles.resaltado}>{params.nombreParroquia}</Text>
            </Text>
            <View style={{width: 30}} />
        </View>

        <Text style={styles.bannerSubtitle}>
            Elige una categoría para explorar:
        </Text>
      </View>

      {/* Spinner de carga superpuesto para la navegación */}
      {loadingCheck && (
          <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#005bea" />
          </View>
      )}

      {/* Condicional para mostrar el cargando inicial o el grid */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005bea" />
          <Text style={styles.loadingText}>Cargando categorías...</Text>
        </View>
      ) : (
        <FlatList
          data={categorias}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContainer}
          ListEmptyComponent={
              <Text style={styles.emptyText}>No se encontraron categorías.</Text>
          }
        />
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');
const cardSize = (width - 50) / 2; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', 
  },
  // Estilo para el contenedor de carga inicial
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6c757d',
    fontSize: 16,
  },
  // Estilo para el spinner de navegación (superpuesto)
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.5)', zIndex: 10,
    justifyContent: 'center', alignItems: 'center'
  },
  banner: {
    backgroundColor: '#1565C0', paddingTop: 20, paddingBottom: 30, paddingHorizontal: 20,
    borderBottomLeftRadius: 25, borderBottomRightRadius: 25, marginBottom: 30, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backButton: { padding: 5 },
  bannerTitle: { fontSize: 25, fontWeight: '600', color: '#ffffff', textAlign: 'center', flex: 1 },
  resaltado: { fontWeight: 'bold', color: '#FFD700', fontSize: 19 },
  bannerSubtitle: { fontSize: 18, color: '#E3F2FD', textAlign: 'center' },
  gridContainer: { paddingHorizontal: 15, paddingBottom: 40 },
  row: { justifyContent: 'space-between', marginBottom: 15 },
  card: {
    width: cardSize, height: cardSize * 0.9, backgroundColor: '#ffffff', borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#90A4AE', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, padding: 10,
  },
  iconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardText: { fontSize: 14, fontWeight: '600', color: '#455A64', textAlign: 'center' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#aaa', fontSize: 16 }
});