import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import api from './api';

const Home = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading]   = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'No hay token disponible');
          return;
        }
        const { data } = await api.get('/usuarios/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(data);
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        const mensaje =
          error.response?.data?.message ||
          'Hubo un problema al obtener los datos del usuario';
        Alert.alert('Error', mensaje);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={{ padding: 20 }}>
        <Text>No se pudo cargar la información del usuario.</Text>
      </View>
    );
  }

  //Administradores
  if (userData.rol === 'admin') {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
          Panel de Administrador
        </Text>
        <Button
          title="Crear Nuevo Reto"
          onPress={() => navigation.navigate('CrearReto')}
        />
  <View style={{ height: 12 }} />
        <Button
          title="Actualizar reto"
          onPress={() => navigation.navigate('ActualizarReto')}
        />

        <View style={{ height: 12 }} />
        <Button
          title="Revisar Vídeos de Usuarios"
          onPress={() => navigation.navigate('CheckVideo')}
        />
      </View>
    );
  }

  //Usuarios
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Bienvenido, {userData.nombre}
      </Text>
      <Button
        title="Ir al Chat"
        onPress={() =>
          navigation.navigate('Chat', {
            communityId: userData.comunidad_id,
            userName: userData.nombre,
            communityName: userData.comunidad_nombre,
          })
        }
      />
      
        <Button
        title="Retos"
        onPress={() =>
          navigation.navigate('Retos', {
            communityId: userData.comunidad_id,
            userName: userData.nombre,
            communityName: userData.comunidad_nombre,
          })
        }
      />
      {}
    </View>
  );
};

export default Home;
