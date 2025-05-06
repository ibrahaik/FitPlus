import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, StackActions } from '@react-navigation/native';

import Login from './screens/Login';
import Register from './screens/Register';
import Home from './screens/Home';
import RegisterStep2 from './screens/RegisterStep2';
import Chat from './screens/Chat';
import CrearReto from './screens/CrearReto';
import ActualizaReto from './screens/ActualizarReto';
import Retos from './screens/Retos';
import VideosUpload from './screens/VideosUpload';
import CheckVideo from './screens/CheckVideo';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
   <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Login" component={Login}/>
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="RegisterStep2" component={RegisterStep2} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Chat" 
      component={Chat} 
      options={({ route }) => ({
        title: route.params?.communityName || 'Chat',
      })}/>
      <Stack.Screen name="CrearReto" component={CrearReto} />
    <Stack.Screen name="ActualizarReto" component={ActualizaReto} />
      <Stack.Screen name="Retos" component={Retos} />
      <Stack.Screen name="VideosUpload" component={VideosUpload} />
      <Stack.Screen name="CheckVideo" component={CheckVideo} />
    </Stack.Navigator>

    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
