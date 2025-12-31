import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { listarProvinciasEc } from '../../services/ApiServices';

export default function ProvinciasScreen() {
  const [provincias, setProvincias] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const obtenerProvincias = async () => {
      try {
        console.log("Consultando provincias...");
        const data = await listarProvinciasEc();

        
        if (data && data.provincias) {
          setProvincias(data.provincias);
        }
      } catch (error) {
        console.log("Error cargando provincias:", error);
      }
    };
    obtenerProvincias();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.tituloHeader}>Explorar Provincias</Text>

      <FlatList
        data={provincias}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => {
              router.push({
                
                pathname: "/estructura/canton",
                params: {
                  external: item.external, //
                  nombreProvincia: item.nombre
                }
              });
            }}
          >
           
            <Text style={styles.nombreProvincia}>{item.nombre}</Text>

            
            <View style={styles.badgeContainer}>
              <Text style={styles.paisTexto}>📍 En {item.Pais.nombre}</Text>
            </View>

            <Image
              source={{ uri: item.imagen }}
              style={styles.imagen}
            />

            <Text style={styles.descripcion} numberOfLines={2}>
              {item.info}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 40,
    alignItems: 'center',
  },
  tituloHeader: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 20,
    width: 340,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nombreProvincia: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    textAlign: 'center',
  },
  
  badgeContainer: {
    backgroundColor: '#e6f0ff', 
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  paisTexto: {
    fontSize: 14,
    color: '#0056b3', 
    fontWeight: '600',
  },
  imagen: {
    width: 310,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  descripcion: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 5
  }
});