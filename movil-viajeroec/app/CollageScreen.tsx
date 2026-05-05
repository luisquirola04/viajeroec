import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Calculamos el tamaño de cada imagen para que sea un 3x3 perfecto
const IMAGE_SIZE = width / 3; 

// Array con las rutas de las imágenes ubicadas en public/banner
// Nota: Si usas Expo Router y la carpeta public, puedes usar require o URIs relativas. 
// Aquí usamos require asumiendo que el archivo está en la raíz de componentes. 
// Ajusta el '../public/...' según la profundidad de tu carpeta.
const images = [
  require('../public/banner/basilica-del-voto-nacional-quito.jpg'),
  require('../public/banner/Chimborazo.jpg'),
  require('../public/banner/el-cisne-church.jpg'),
  require('../public/banner/Mitad del mundo.jpg'),
  require('../public/banner/Pailon-del-Diablo_Cover.jpg'),
  require('../public/banner/pinaculoislabartolome.jpg'),
  require('../public/banner/PuertaCiudadLoja.jpg'),
  require('../public/banner/quillotoa.jpg'),
  require('../public/banner/salinas.jpg'),
];

export default function CollageScreen({ onContinue }) {
  return (
    <View style={styles.container}>
      {/* Contenedor del Collage */}
      <View style={styles.gridContainer}>
        {images.map((img, index) => (
          <Image 
            key={index} 
            source={img} 
            style={styles.imageItem} 
            resizeMode="cover" 
          />
        ))}
      </View>

      {/* Capa oscura superpuesta para que el texto resalte (Overlay) */}
      <View style={styles.overlay}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Ecuador en tus Manos</Text>
          <Text style={styles.subtitle}>Descubre la magia, cultura y paisajes de nuestro increible pais.</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={onContinue} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Explorar Provincias</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: width,
    height: height,
    position: 'absolute',
  },
  imageItem: {
    width: IMAGE_SIZE,
    height: height / 3, // Divide la altura en 3 filas
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)', // Oscurece el fondo al 55%
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#FFD700', // Un amarillo vibrante que contrasta bien
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});