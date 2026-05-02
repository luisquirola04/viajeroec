import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, StatusBar, ActivityIndicator, Pressable } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; 

export default function TutorialScreen({ onFinish }) {
  const [status, setStatus] = useState('loading'); // 'loading', 'choice', 'video'
  const [controlsVisible, setControlsVisible] = useState(true); // Controla la visibilidad del botón de pausa
  const hideTimer = useRef(null); // Referencia para el temporizador
  
  // 1. Configuración del Player
  const player = useVideoPlayer(require('../public/tutorial.mp4'), (player) => {
    player.loop = false;
    player.showControls = false; 
  });

  // 2. Escuchar si el video está reproduciéndose
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  // 3. Lógica para ocultar el botón de pausa automáticamente
  const startHideTimer = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setControlsVisible(false); // Oculta los controles después de 2 segundos
    }, 2000);
  };

  useEffect(() => {
    if (isPlaying) {
      startHideTimer();
    } else {
      // Si está en pausa o no ha iniciado, siempre mostramos el botón (Play)
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setControlsVisible(true);
    }
    
    // Limpieza del temporizador al desmontar
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [isPlaying]);

  // Manejador de toques en la pantalla
  const handleScreenTap = () => {
    if (isPlaying) {
      setControlsVisible(true); // Muestra el botón de pausa
      startHideTimer(); // Reinicia el temporizador para volver a ocultarlo
    }
  };

  useEffect(() => {
    const checkFirstLaunch = async () => {
      const hasLaunched = await AsyncStorage.getItem('@viajero_ec_launched');
      if (hasLaunched === null) {
        setStatus('choice'); 
      } else {
        onFinish(); 
      }
    };
    checkFirstLaunch();
  }, []);

  const completeTutorial = async () => {
    await AsyncStorage.setItem('@viajero_ec_launched', 'true');
    onFinish();
  };

  if (status === 'choice') {
    return (
      <View style={styles.choiceContainer}>
        <StatusBar barStyle="light-content" />
        <Ionicons name="map-outline" size={80} color="#11CAA0" />
        <Text style={styles.title}>¡Bienvenido a ViajeroEC!</Text>
        <Text style={styles.subtitle}>¿Quieres ver un breve tutorial de cómo explorar Ecuador con nuestra app?</Text>
        
        <TouchableOpacity style={styles.mainButton} onPress={() => setStatus('video')}>
          <Text style={styles.mainButtonText}>Ver Tutorial</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={completeTutorial}>
          <Text style={styles.skipButtonText}>Saltar, ya conozco la app</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'video') {
    return (
      <View style={styles.videoContainer}>
        <StatusBar hidden />
        
        <VideoView 
          player={player} 
          style={StyleSheet.absoluteFill} 
          contentFit="cover"
        />

        {/* OVERLAY INTERACTIVO: Detecta toques en la pantalla */}
        <Pressable style={styles.videoOverlay} onPress={handleScreenTap}>
          
          <TouchableOpacity style={styles.topSkip} onPress={completeTutorial}>
            <Text style={styles.topSkipText}>Saltar</Text>
            <Ionicons name="play-forward" size={20} color="white" />
          </TouchableOpacity>

          {/* BOTÓN CENTRAL DINÁMICO */}
          {(!isPlaying || controlsVisible) && (
            <TouchableOpacity 
              style={styles.playPauseBtn} 
              onPress={() => isPlaying ? player.pause() : player.play()}
            >
              <View style={styles.iconBackground}>
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={45} 
                  color="white" 
                  style={{ marginLeft: isPlaying ? 0 : 5 }} // Centra el ícono de play
                />
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>💡 Tip: ¡Los recuadros son interactivos! Presiónalos para ver más detalles y explorar cada destino.</Text>
          </View>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.choiceContainer}>
      <ActivityIndicator size="large" color="#11CAA0" />
    </View>
  );
}

const styles = StyleSheet.create({
  choiceContainer: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 40,
  },
  mainButton: {
    backgroundColor: '#11CAA0',
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 35,
    width: '100%',
    alignItems: 'center',
  },
  mainButtonText: {
    color: '#020617',
    fontSize: 18,
    fontWeight: '700',
  },
  skipButton: {
    marginTop: 20,
    padding: 10,
  },
  skipButtonText: {
    color: '#64748b',
    fontSize: 16,
    textDecorationLine: 'underline',
  },

  videoContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topSkip: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  topSkipText: {
    color: 'white',
    marginRight: 8,
    fontWeight: '600',
  },
  playPauseBtn: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackground: {
    backgroundColor: 'rgba(0,0,0,0.6)', // Fondo oscuro circular para resaltar el ícono
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.75)', 
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 20, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  infoText: {
    color: '#FFFFFF', 
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22, 
  }
});
