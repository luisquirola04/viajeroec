import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { listarProvinciasEc } from '../../services/ApiServices';
import ListaRecargable from '../../components/listaRecargable'

export default function ProvinciasScreen() {
  const router = useRouter();

  const optimizarImagen = (url) => {
    if (!url) return null;
    return url.includes('cloudinary') 
      ? url.replace('/upload/', '/upload/w_310,h_200,c_fill,q_auto,f_auto/') 
      : url;
  };

  // Solo defines cómo se ve UNA tarjeta
  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => {
        router.push({
          pathname: "/estructura/canton",
          params: { external: item.external, nombreProvincia: item.nombre }
        });
      }}
    >
      <Text style={styles.nombreProvincia}>{item.nombre}</Text>
      <View style={styles.badgeContainer}>
        <Text style={styles.paisTexto}>📍 En {item.Pais?.nombre || 'Ecuador'}</Text>
      </View>
      <Image
        source={optimizarImagen(item.imagen)}
        style={styles.imagen}
        contentFit="cover"
        transition={500}
      />
      <Text style={styles.descripcion}>{item.info}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.tituloHeader}>Explorar Provincias</Text>

      {/* AQUÍ USAS TU COMPONENTE */}
      <ListaRecargable
        funcionCarga={listarProvinciasEc}  // 1. Le das la función de API
        renderItem={renderCard}            // 2. Le das el diseño
        contentContainerStyle={{ paddingBottom: 20 }} // Estilos extra si quieres
      />
      
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 8,
    alignItems: 'center',
  },
  tituloHeader: {
    fontSize: 24,
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
    backgroundColor: '#e1e4e8',
  },
  descripcion: {
    fontSize: 14,
    color: '#444',
    textAlign: 'justify',
    paddingHorizontal: 12,
    lineHeight: 20,
    marginTop: 10,
  }
});