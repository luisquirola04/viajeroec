import { useState } from 'react';
import { Redirect } from 'expo-router';
import TutorialScreen from './TutorialScreen'; 
import CollageScreen from './CollageScreen'; // Importamos el nuevo componente

export default function Index() {
  // Manejamos el flujo de la aplicación con un string de estado
  // 'tutorial' -> 'collage' -> 'ready'
  const [appState, setAppState] = useState('tutorial');

  // 3. Si el estado es ready, redirigimos a la app principal
  if (appState === 'ready') {
    return <Redirect href="/estructura" />;
  }

  // 2. Si el tutorial terminó, mostramos el Collage
  if (appState === 'collage') {
    return <CollageScreen onContinue={() => setAppState('ready')} />;
  }

  // 1. Por defecto, mostramos el tutorial. 
  // Cuando termine, pasamos al estado 'collage'.
  return <TutorialScreen onFinish={() => setAppState('collage')} />;
}