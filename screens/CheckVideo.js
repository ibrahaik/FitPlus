// CheckVideo.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { Video } from 'expo-av';
import axios from './api';

const { width } = Dimensions.get('window');

const CheckVideo = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get('/videos');
        setVideos(response.data);
      } catch (err) {
        console.error('Error al obtener videos:', err);
        Alert.alert('Error', 'No se pudieron cargar los vídeos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

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
});

export default CheckVideo;
