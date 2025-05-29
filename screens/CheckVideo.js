import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  Dimensions,
  Button,
} from 'react-native';
import { Video } from 'expo-av';
import api from './api';

const { width } = Dimensions.get('window');

const CheckVideo = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      const response = await api.get('/videos/pendientes');
      setVideos(response.data);
    } catch (err) {
      console.error('Error al obtener videos:', err);
      Alert.alert('Error', 'No se pudieron cargar los vídeos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleAccion = async (usuario_id, reto_id, tipo) => {
    try {
      await api.put(`/videos/${tipo}/${usuario_id}/${reto_id}`);

      if (tipo === 'aprobar') {
        const retoRes = await api.get(`/retos/${reto_id}`);
        const cantidad = retoRes.data.puntos; 
        await api.post('/puntos', { usuario_id, cantidad });
      }

      Alert.alert('Éxito', `Video ${tipo === 'aprobar' ? 'aprobado' : 'suspendido'} correctamente`);
      fetchVideos();
    } catch (err) {
      console.error(`Error al ${tipo} video:`, err);
      Alert.alert('Error', `No se pudo ${tipo} el video`);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Reto ID: {item.reto_id}</Text>
      <Text style={styles.subTitle}>Usuario ID: {item.usuario_id}</Text>
      <Text style={styles.date}>{new Date(item.fecha).toLocaleString()}</Text>
      <Video
        source={{ uri: item.video_url }}
        style={styles.video}
        useNativeControls
        resizeMode="contain"
      />
      <View style={styles.buttonRow}>
        <View style={styles.buttonContainer}>
          <Button
            title="Aprobar"
            color="green"
            onPress={() => handleAccion(item.usuario_id, item.reto_id, 'aprobar')}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Suspender"
            color="red"
            onPress={() => handleAccion(item.usuario_id, item.reto_id, 'suspender')}
          />
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 24,
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 12,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subTitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#555',
  },
  date: {
    marginTop: 4,
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  video: {
    width: width - 64,
    height: (width - 64) * 0.56,
    alignSelf: 'center',
    backgroundColor: '#000',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default CheckVideo;
