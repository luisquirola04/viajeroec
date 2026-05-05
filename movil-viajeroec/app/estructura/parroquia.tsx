import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { listarParroquiasCanton } from '../../services/ApiServices'; 

// --- NUEVO COMPONENTE DE TARJETA ANIMADA ---
const ParroquiaCard = React.memo(({ item, onPress }) => {
  // Configuración de respiración para el botón
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.04, // Crece un 4%
          duration: 1200, 
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1, // Vuelve a la normalidad
          duration: 1200, 
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
      <View style={styles.cardHeader}>
          <Text style={styles.nombreParroquia}>{item.nombre}</Text>
          
          {/* Badge para el TIPO DE PARROQUIA (Urbana/Rural) */}
          <View style={[
              styles.badgeTipo, 
              item.tipoParroquia === 'URBANA' ? styles.badgeUrbana : styles.badgeRural
          ]}>
              <Text style={styles.badgeTextTipo}>{item.tipoParroquia}</Text>
          </View>
      </View>

      {/* Ubicación Jerárquica */}
      <View style={styles.ubicacionContainer}>
          <Text style={styles.ubicacionLabel}>Ubicación:</Text>
          <Text style={styles.ubicacionTexto}>
            {item.Canton.nombre}, {item.Canton.Provincia.nombre}
          </Text>
      </View>

      <View style={styles.separator} />

      <Text style={styles.descripcion}>
          {item.info}
      </Text>

      {/* --- BOTÓN ANIMADO --- */}
      <Animated.View 
        style={[
          styles.botonContainer, 
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Text style={styles.textoBoton}>Ver categorías</Text>
      </Animated.View>

    </TouchableOpacity>
  );
});

// --- COMPONENTE PRINCIPAL ---
export default function ParroquiasScreen() {
  const [parroquias, setParroquias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useLocalSearchParams(); 
  const router = useRouter();

  useEffect(() => {
    const cargarParroquias = async () => {
      setIsLoading(true); // Iniciamos carga
      try {
        if (params.external) {
          console.log("Cargando parroquias del cantón:", params.external);
          const data = await listarParroquiasCanton(params.external);
          
          if (data && data.parroquias) {
            setParroquias(data.parroquias);
          }
        }
      } catch (error) {
        console.error("Error al cargar parroquias:", error);
      } finally {
        setIsLoading(false); // Detenemos carga
      }
    };
    cargarParroquias();
  }, [params.external]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{}} />

      <Text style={styles.tituloHeader}>
        {params.nombreCanton ? `Parroquias de ${params.nombreCanton}` : 'Parroquias'}
      </Text>

      {/* Condicional para mostrar el cargando o la lista */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#28a745" />
          <Text style={styles.loadingText}>Cargando parroquias...</Text>
        </View>
      ) : (
        <FlatList
          data={parroquias}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <ParroquiaCard 
              item={item}
              onPress={() => {
                  router.push({
                      pathname: "/categorias", 
                      params: { 
                          nombreParroquia: item.nombre, 
                          parroquiaExternal: item.external 
                      }
                  });
              }}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay parroquias registradas.</Text>
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
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
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
    borderLeftColor: '#28a745', 
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nombreParroquia: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  badgeTipo: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 10,
  },
  badgeUrbana: {
    backgroundColor: '#d1e7dd', 
  },
  badgeRural: {
    backgroundColor: '#fff3cd',
  },
  badgeTextTipo: {
    fontSize: 10,
    fontWeight: '700',
    color: '#333',
  },
  ubicacionContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center'
  },
  ubicacionLabel: {
    fontSize: 12,
    color: '#999',
    marginRight: 5,
  },
  ubicacionTexto: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
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
    marginBottom: 10,
  },
  emptyText: {
    marginTop: 50,
    color: '#adb5bd',
    fontSize: 16,
  },
  
  // ESTILOS PARA EL BOTÓN ANIMADO
  botonContainer: {
    backgroundColor: '#28a745', // Color verde que ya usas en la tarjeta
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
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});