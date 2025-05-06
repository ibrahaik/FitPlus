import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api.js';  

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await api.post('/usuarios/login', {
        email,
        contraseña: password,
      });

      console.log('Respuesta del backend:', response.data);
      await AsyncStorage.setItem('token', response.data.token);
      navigation.navigate('Home');
      Alert.alert('Éxito', 'Inicio de sesión exitoso');
    } catch (error) {
      console.error('Error en el login:', error.message);
      Alert.alert('Error', 'Credenciales incorrectos o no se pudo conectar al servidor');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ marginBottom: 10, borderBottomWidth: 1, padding: 5 }}
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 20, borderBottomWidth: 1, padding: 5 }}
      />
      <Button title="Iniciar sesión" onPress={handleLogin} />
      <View style={{ marginTop: 10 }}>
        <Button title="Registrarme" onPress={() => navigation.navigate('Register')} />
      </View>
    </View>
  );
};

export default Login;
