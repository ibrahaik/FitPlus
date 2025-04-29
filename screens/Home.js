import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import api from './api';

const Home = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'No hay token disponible');
          setLoading(false);
          return;
        }

        const response = await api.get('/usuarios/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log('userData:', response.data);
        setUserData(response.data);
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        const mensaje =
          error.response?.data?.message || 'Hubo un problema al obtener los datos del usuario';
        Alert.alert('Error', mensaje);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Bienvenido a la Home</Text>

      {/* Aquí puedes añadir más componentes */}

      {loading ? (
        <ActivityIndicator size="large" />
      ) : userData ? (
        <Button
          title="Ir al Chat"
          onPress={() => {
            if (userData.comunidad_id && userData.nombre) {
              navigation.navigate('Chat', {
                communityId: userData.comunidad_id,
                userName: userData.nombre,
                communityName: userData.comunidad_nombre
              });
            } else {
              Alert.alert('Error', 'Datos del usuario incompletos');
            }
          }}
        />
      ) : (
        <Text>No se pudo cargar el usuario.</Text>
      )}
    </View>
  );
};

export default Home;
