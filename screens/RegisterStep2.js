// RegisterStep2.js
import React, { useState, useEffect } from 'react';
import { View, Button, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from './api';  // ← Importa la instancia configurada

const RegisterStep2 = ({ route, navigation }) => {
  const { nombre, email, password } = route.params;
  const [comunidadId, setComunidadId] = useState('');
  const [comunidades, setComunidades] = useState([]);

  // Cargar comunidades desde el backend
  useEffect(() => {
    const fetchComunidades = async () => {
      try {
        const response = await api.get('/comunidades');  // ← usa API pública
        setComunidades(response.data);
      } catch (error) {
        console.error('Error al obtener comunidades:', error.message);
        Alert.alert('Error', 'Hubo un problema al cargar las comunidades');
      }
    };
    fetchComunidades();
  }, []);

  const handleRegister = async () => {
    if (!comunidadId) {
      Alert.alert('Error', 'Por favor, selecciona una comunidad');
      return;
    }
    try {
      const response = await api.post('/usuarios/registro', {
        nombre,
        email,
        contraseña: password,
        comunidad_id: comunidadId,
      });
      console.log('Respuesta del backend:', response.data);
      Alert.alert('Éxito', '¡Registro exitoso, bienvenido!');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error en el registro:', error.message);
      Alert.alert('Error', 'Hubo un problema al registrar al usuario');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Picker
        selectedValue={comunidadId}
        onValueChange={(itemValue) => setComunidadId(itemValue)}
        style={{ marginBottom: 20 }}
      >
        <Picker.Item label="Selecciona tu comunidad" value="" />
        {comunidades.map((c) => (
          <Picker.Item key={c.id} label={c.nombre} value={c.id} />
        ))}
      </Picker>
      <Button title="Registrar" onPress={handleRegister} />
    </View>
  );
};

export default RegisterStep2;
