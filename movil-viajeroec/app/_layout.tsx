import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RefreshProvider, useRefresh } from './context/RefreshContext';
// 1. IMPORTA EL HOOK DE RED
import { useNetInfo } from '@react-native-community/netinfo';

const BotonRefrescar = () => {
  const { triggerRefresh, loading } = useRefresh();

  return (
    <TouchableOpacity 
      onPress={triggerRefresh} 
      style={styles.botonPosicion} 
      disabled={loading}
    >
    </TouchableOpacity>
  );
};

export default function RootLayout() {
  const pathname = usePathname();
  const mostrarBanner = pathname !== '/';
  
  // 2. INICIALIZA EL ESTADO DE LA RED
  const netInfo = useNetInfo();

  return (
    <RefreshProvider>
      <View style={{ flex: 1 }}>
   
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

        {/* 3. ALERTA GLOBAL DE SIN CONEXIÓN */}
        {/* Se inserta en el flujo normal, así empuja el Stack hacia abajo sin tapar nada */}
        {netInfo.isConnected === false && (
          <View style={styles.alertaOffline}>
            <Text style={styles.textoOffline}>
               No tienes conexión a internet. Revisa tus datos o Wi-Fi.
            </Text>
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
  },

  // 4. ESTILOS PARA LA ALERTA DE RED
  alertaOffline: {
    backgroundColor: '#ff4d4f', 
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5, 
  },
  textoOffline: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  }
});