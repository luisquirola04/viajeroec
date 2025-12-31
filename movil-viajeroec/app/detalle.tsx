import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function DetalleScreen() {

  const item = useLocalSearchParams(); 

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{item.nombre}</Text>

      {item.imagen ? (
        <Image source={{ uri: item.imagen as string }} style={styles.imagen} />
      ) : null}
      
      <Text style={styles.descripcion}>{item.info}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  imagen: {
    width: '100%',
    height: 300,
    borderRadius: 15,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  descripcion: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    textAlign: 'justify',
  }
});