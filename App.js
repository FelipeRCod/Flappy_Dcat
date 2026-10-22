import React, { useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar, AppState, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TelaBoasVindas from './src/views/TelaBoasVindas';
import TelaInstrucoes from './src/views/TelaInstrucoes';
import TelaJogo from './src/views/TelaJogo';
import TelaCreditos from './src/views/TelaCreditos';

const Stack = createNativeStackNavigator();

export const ocultarBarrasDoSistema = () => {
  try {
    RNStatusBar.setHidden(true, 'fade');
    if (Platform.OS === 'android') {
      RNStatusBar.setTranslucent(true);
      if (NavigationBar.NavigationBar && NavigationBar.NavigationBar.setHidden) {
        NavigationBar.NavigationBar.setHidden(true);
      }
      if (NavigationBar.setVisibilityAsync) {
        NavigationBar.setVisibilityAsync('hidden').catch(() => {});
      }
    }
  } catch (e) {}
};

export default function App() {
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    ocultarBarrasDoSistema();
    const timer = setTimeout(ocultarBarrasDoSistema, 300);
    return () => clearTimeout(timer);
  }, [width, height]);

  useEffect(() => {
    ocultarBarrasDoSistema();

    const subAppState = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        ocultarBarrasDoSistema();
      }
    });

    let subNavVisibility = null;
    if (Platform.OS === 'android' && NavigationBar.addVisibilityListener) {
      try {
        subNavVisibility = NavigationBar.addVisibilityListener(({ visibility }) => {
          if (visibility === 'visible') {
            setTimeout(ocultarBarrasDoSistema, 1200);
          }
        });
      } catch (e) {}
    }

    return () => {
      subAppState.remove();
      if (subNavVisibility && subNavVisibility.remove) {
        subNavVisibility.remove();
      }
    };
  }, []);

  return (
    <NavigationContainer onStateChange={ocultarBarrasDoSistema}>
      <StatusBar style="light" hidden={true} translucent={true} />
      {Platform.OS === 'android' && NavigationBar.NavigationBar ? (
        <NavigationBar.NavigationBar hidden={true} />
      ) : null}
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
