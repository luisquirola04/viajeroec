import { Stack } from 'expo-router';

export default function EstructuraLayout() {
  return (
    <Stack
      screenOptions={{
        
        headerStyle: { backgroundColor: '#f8f9fa' },
      
        headerTintColor: '#000000', 
       
        headerShadowVisible: false,
        
        headerTitleAlign: 'center',
        
        headerBackTitle: "", 
      }}
    >
      
      <Stack.Screen name="index" options={{ title: "Provincias" }} />
      <Stack.Screen name="canton" options={{ title: "Cantones" }} />
      <Stack.Screen name="parroquia" options={{ title: "Parroquias" }} />
    </Stack>
  );
}