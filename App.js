import React from 'react';
import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import Login from './screens/Login';
import Register from './screens/Register';
import RegisterStep2 from './screens/RegisterStep2';
import Home from './screens/Home';
import Chat from './screens/Chat';
import CrearReto from './screens/CrearReto';
import ActualizaReto from './screens/ActualizarReto';
import Retos from './screens/Retos';
import VideosUpload from './screens/VideosUpload';
import CheckVideo from './screens/CheckVideo';
import CreatePost from './screens/CreatePost';
import CreateProduct from './screens/CreateProduct';
import PasarelaScreen from './screens/Pasarela';
import PerfilScreen from './screens/Perfil';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, 
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="RegisterStep2" component={RegisterStep2} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen
          name="Chat"
          component={Chat}
          options={({ route }) => ({
          
          })}
        />
        <Stack.Screen name="CrearReto" component={CrearReto} />
        <Stack.Screen name="ActualizarReto" component={ActualizaReto} />
        <Stack.Screen name="Retos" component={Retos} />
        <Stack.Screen name="VideosUpload" component={VideosUpload} />
        <Stack.Screen name="CheckVideo" component={CheckVideo} />
        <Stack.Screen name="CreatePost" component={CreatePost} />
        <Stack.Screen name="CreateProduct" component={CreateProduct} />
        <Stack.Screen name="Pasarela" component={PasarelaScreen} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
          </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
