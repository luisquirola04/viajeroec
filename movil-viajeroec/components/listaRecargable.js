import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, View, ActivityIndicator, Text } from 'react-native';

// Este componente recibe:
// 1. funcionCarga: La función de la API (ej: listarProvinciasEc)
// 2. renderItem: Cómo se ve cada tarjeta
// 3. ...props: Cualquier otra cosa (estilos, numColumns, etc.)
export default function ListaRecargable({ funcionCarga, renderItem, ...props }) {
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Lógica interna para cargar datos
  const cargarDatos = async () => {
    try {
      // Si ya estamos refrescando, no ponemos loading general
      if (!refreshing) setLoading(true); 
      
      const respuesta = await funcionCarga();
      
      // Asumimos que tu backend devuelve { provincias: [...] } o similar
      // Aquí intentamos detectar la lista dentro de la respuesta
      const lista = respuesta.provincias || respuesta.cantones || respuesta.data || respuesta;
      
      if (Array.isArray(lista)) {
        setData(lista);
      }
    } catch (error) {
      console.error("Error en ListaRecargable:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Carga inicial automática
  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para el Pull-to-Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarDatos();
  }, []);

  if (loading && !refreshing && data.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 }}>
        <ActivityIndicator size="large" color="#005bea" />
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
      
      // La magia automática
      refreshing={refreshing}
      onRefresh={onRefresh}
      
      // Pasamos el resto de props (estilos, columnas, etc)
      {...props}
    />
  );
}