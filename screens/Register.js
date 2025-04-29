// Register.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import api from './api';  // <-- Importa la instancia con baseURL de ngrok

const Register = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const validateForm = () => {
    if (nombre.length < 5) {
      Alert.alert('Error', 'El nombre debe tener al menos 5 caracteres');
      return false;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@(gmail\.com|outlook\.es)$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Email inválido');
      return false;
    }
    return true;
  };

  const handleRegister1 = async () => {
    if (!validateForm()) return;

    try {
      // Usamos `api.post` en lugar de axios.post con la IP local
      const response = await api.post('/usuarios/verificar', {
        nombre,
        email,
      });

      if (response.data.existe) {
        Alert.alert('Error', response.data.mensaje);
      } else {
        navigation.navigate('RegisterStep2', { nombre, email, password });
      }
    } catch (error) {
      console.error('Error al verificar usuario:', error.message);
      Alert.alert('Error', 'No se pudo conectar al servidor o ya está en uso');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
        style={{ marginBottom: 10, borderBottomWidth: 1, padding: 5 }}
      />
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

      <Button title="Registrar" onPress={handleRegister1} />
    </View>
  );
};

export default Register;
