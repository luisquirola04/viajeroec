import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { listarCantonesProvincia } from '../../services/ApiServices'; 

export default function CantonesScreen() {
  const [cantones, setCantones] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // <-- Nuevo estado
  const params = useLocalSearchParams(); 
  const router = useRouter();

  useEffect(() => {
    const cargarCantones = async () => {
      setIsLoading(true); // Iniciamos carga
      try {
        if (params.external) {
          const data = await listarCantonesProvincia(params.external);
          if (data && data.cantones) {
            setCantones(data.cantones);
          }
        }
      } catch (error) {
        console.error("Error al cargar cantones:", error);
      } finally {
        setIsLoading(false); // Detenemos carga pase lo que pase
      }
    };
    cargarCantones();
  }, [params.external]);

  return (
    <View style={styles.container}>
    
      <Text style={styles.tituloHeader}>
        {params.nombreProvincia ? `Cantones de ${params.nombreProvincia}` : 'Seleccione un Cantón'}
      </Text>

      {/* Condicional para mostrar el cargando o la lista */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Cargando cantones...</Text>
        </View>
      ) : (
        <FlatList
          data={cantones}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              activeOpacity={0.6}
              onPress={() => {
                  router.push({ 
                    pathname: "/estructura/parroquia", 
                    params: { 
                      external: item.external, 
                      nombreCanton: item.nombre 
                    } 
                  });
              }}
            >
              <View style={styles.cardHeader}>
                  <Text style={styles.nombreCanton}>{item.nombre}</Text>
                  
                  <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                          {item.Provincia.nombre}, {item.Provincia.Pais.nombre}
                      </Text>
                  </View>
              </View>

              <View style={styles.separator} />

              <Text style={styles.descripcion} >
                  {item.info}
              </Text>

              <Text style={styles.verMas}>Ver parroquias de este cantón &gt;</Text>

            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron cantones registrados.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', 
    paddingTop: 10, 
    alignItems: 'center',
  },
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
  tituloHeader: {
    fontSize: 24,
    fontWeight: '800', 
    marginBottom: 25,
    color: '#1a1a1a',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,       
    marginBottom: 15,
    width: 340,       
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    borderLeftWidth: 5, 
    borderLeftColor: '#007bff', 
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap', 
  },
  nombreCanton: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1, 
  },
  badge: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 10,
  },
  badgeText: {
    fontSize: 10,
    color: '#495057',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f3f5',
    marginBottom: 10,
  },
  descripcion: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20, 
    marginBottom: 15,
  },
  verMas: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
    textAlign: 'right', 
  },
  emptyText: {
    marginTop: 50,
    color: '#adb5bd',
    fontSize: 16,
  }
});