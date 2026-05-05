import { Stack, usePathname } from 'expo-router'; // 1. IMPORTA usePathname
import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RefreshProvider, useRefresh } from './context/RefreshContext';

const BotonRefrescar = () => {
  const { triggerRefresh, loading } = useRefresh();

  return (
    <TouchableOpacity 
      onPress={triggerRefresh} 
      style={styles.botonPosicion} 
      disabled={loading}
    >
     {/* Asumo que aquí va tu icono */}
    </TouchableOpacity>
  );
};

export default function RootLayout() {
  // 2. OBTENEMOS LA RUTA ACTUAL
  const pathname = usePathname();
  
  // 3. CREAMOS LA CONDICIÓN: Será true en cualquier pantalla EXCEPTO en el index ("/")
  const mostrarBanner = pathname !== '/';

  return (
    <RefreshProvider>
      <View style={{ flex: 1 }}>
   
        {/* 4. ENVOLVEMOS TU BANNER CON LA CONDICIÓN */}
        {mostrarBanner && (
          <View style={styles.bannerContainer}>
            <View style={styles.contenidoBanner}>
                <Image 
                    source={require('../public/banderaEc.png')} 
                    style={styles.bandera}
                />
                <Text style={styles.bannerTexto}>VIAJERO EC</Text>
            </View>

            <BotonRefrescar />
          </View>
        )}
    
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="estructura" options={{ headerShown: false }} />
          <Stack.Screen name="categorias" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        
        <StatusBar style="auto" />
      </View>
    </RefreshProvider>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    height: 100, 
    backgroundColor: '#005bea', 
    justifyContent: 'flex-end', 
    alignItems: 'center',       
    paddingBottom: 15,          
    zIndex: 10, 
    position: 'relative', 
  },
  
  contenidoBanner: {
    flexDirection: 'row',       
    alignItems: 'center',      
    gap: 12,                    
  },

  bannerTexto: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 3, 
  },
  
  bandera: {
    width: 32,
    height: 22, 
    resizeMode: 'contain',
  },

  botonPosicion: {
    position: 'absolute',
    right: 20,      
    bottom: 15,    
    zIndex: 20,
  }
});