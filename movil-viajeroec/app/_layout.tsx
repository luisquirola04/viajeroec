import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Image } from 'react-native'; 

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
 
      <View style={styles.bannerContainer}>
        
    
        <View style={styles.contenidoBanner}>
          
            <Image 
                source={require('../public/banderaEc.png')} 
                style={styles.bandera}
            />
            <Text style={styles.bannerTexto}>VIAJERO EC</Text>
        </View>

      </View>

  
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="estructura" options={{ headerShown: false }} />
        <Stack.Screen name="categorias" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      
      <StatusBar style="auto" />
    </View>
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
  }
});