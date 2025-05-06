import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native';


const RetosComunidad = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [retos, setRetos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRetosComunidad = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'No hay token disponible');
          return;
        }

        // Obtener los datos del usuario
        const userResponse = await api.get('/usuarios/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usuario = userResponse.data;
        setUserData(usuario);

        // Obtener todos los retos
        const retosResponse = await api.get('/retos');
        const todosRetos = retosResponse.data;

        // Filtrar los retos que coincidan con su comunidad_id
        const retosFiltrados = todosRetos.filter(
          (reto) => reto.comunidad_id === usuario.comunidad_id
        );
        setRetos(retosFiltrados);
      } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', 'No se pudieron cargar los retos');
      } finally {
        setLoading(false);
      }
    };

    fetchRetosComunidad();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>No se pudo cargar la información del usuario.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Retos de tu Comunidad</Text>
      <ScrollView style={styles.scrollContainer}>
        {retos.length === 0 ? (
          <Text>No hay retos disponibles para tu comunidad.</Text>
        ) : (
          retos.map((reto) => (
            <View key={reto.id} style={styles.card}>
            <Text style={styles.cardTitle}>{reto.nombre}</Text>
            <Text style={styles.cardText}>{reto.descripcion}</Text>
            <Text style={styles.cardText}>
              Puntos: {reto.puntos} | Inicio: {reto.fecha_inicio.split('T')[0]}
            </Text>
            <Text style={styles.cardText}>Fin: {reto.fecha_fin.split('T')[0]}</Text>
          
            <Button
              title="Completar reto"
              onPress={() =>
                navigation.navigate('VideosUpload', {
                  retoNombre: reto.nombre,
                  retoDescripcion: reto.descripcion,
                  usuarioNombre: userData.nombre,
                  comunidadId: userData.comunidad_id,
                  retoId: reto.id,
                  usuarioId: userData.id,
                })
              }
            />
          </View>
          
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollContainer: {
    maxHeight: 500,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    color: '#555',
  },
});

export default RetosComunidad;
