import { useState } from 'react';
import { Redirect } from 'expo-router';
// Asegúrate de poner la ruta correcta hacia donde guardaste el componente
import TutorialScreen from './TutorialScreen'; 

export default function Index() {
  // Estado para saber si debemos redirigir a la app principal
  const [isReadyToRedirect, setIsReadyToRedirect] = useState(false);

  // Si el tutorial terminó (o si el usuario ya lo había visto antes), redirigimos
  if (isReadyToRedirect) {
    return <Redirect href="/estructura" />;
  }

  // Mientras tanto, mostramos el tutorial. 
  // Cuando el TutorialScreen ejecute "onFinish()", cambiará este estado a true.
  return <TutorialScreen onFinish={() => setIsReadyToRedirect(true)} />;
}