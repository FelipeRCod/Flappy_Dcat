import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TelaBoasVindas from './src/views/TelaBoasVindas';
import TelaInstrucoes from './src/views/TelaInstrucoes';
import TelaJogo from './src/views/TelaJogo';
import TelaCreditos from './src/views/TelaCreditos';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" hidden={false} />
      <Stack.Navigator
        initialRouteName="TelaBoasVindas"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="TelaBoasVindas" component={TelaBoasVindas} />
        <Stack.Screen name="TelaInstrucoes" component={TelaInstrucoes} />
        <Stack.Screen name="TelaJogo" component={TelaJogo} />
        <Stack.Screen name="TelaCreditos" component={TelaCreditos} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
