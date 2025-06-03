import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import api from './api';

const { width } = Dimensions.get('window');

const CheckVideo = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingVideo, setProcessingVideo] = useState(null);

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
    setProcessingVideo(`${usuario_id}-${reto_id}`);
    try {
      await api.put(`/videos/${tipo}/${usuario_id}/${reto_id}`);

      if (tipo === 'aprobar') {
        const retoRes = await api.get(`/retos/${reto_id}`);
        const cantidad = retoRes.data.puntos; 
        await api.post('/puntos', { usuario_id, cantidad });
      }

      Alert.alert(
        'Éxito', 
        `Video ${tipo === 'aprobar' ? 'aprobado' : 'suspendido'} correctamente`,
        [{ text: 'OK', style: 'default' }],
        { 
          titleStyle: { color: '#FFD700' },
          messageStyle: { color: '#FFFFFF' }
        }
      );
      fetchVideos();
    } catch (err) {
      console.error(`Error al ${tipo} video:`, err);
      Alert.alert('Error', `No se pudo ${tipo} el video`);
    } finally {
      setProcessingVideo(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Cargando videos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item, index }) => {
    const isProcessing = processingVideo === `${item.usuario_id}-${item.reto_id}`;
    
    return (
      <View style={[styles.card, { marginTop: index === 0 ? 20 : 0 }]}>
        <LinearGradient
          colors={['#1A1A1A', '#2A2A2A']}
          style={styles.cardGradient}
        >
          {/* Header del video */}
          <View style={styles.cardHeader}>
            <View style={styles.headerInfo}>
              <Text style={styles.retoId}>Reto #{item.reto_id}</Text>
              <Text style={styles.usuarioId}>Usuario #{item.usuario_id}</Text>
            </View>
            <View style={styles.dateContainer}>
              <Text style={styles.date}>{formatDate(item.fecha)}</Text>
            </View>
          </View>

          {/* Video */}
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: item.video_url }}
              style={styles.video}
              useNativeControls
              resizeMode="contain"
            />
          </View>

          {/* Botones de acción */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleAccion(item.usuario_id, item.reto_id, 'aprobar')}
              disabled={isProcessing}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.buttonGradient}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <>
                    <Text style={styles.approveIcon}>✓</Text>
                    <Text style={styles.buttonText}>Aprobar</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleAccion(item.usuario_id, item.reto_id, 'suspender')}
              disabled={isProcessing}
            >
              <View style={styles.rejectButtonContent}>
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FFD700" />
                ) : (
                  <>
                    <Text style={styles.rejectIcon}>✕</Text>
                    <Text style={styles.rejectButtonText}>Suspender</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Revisión de Videos</Text>
          <Text style={styles.headerSubtitle}>
            {videos.length} video{videos.length !== 1 ? 's' : ''} pendiente{videos.length !== 1 ? 's' : ''}
          </Text>
        </LinearGradient>
      </View>

      <FlatList
        data={videos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerGradient: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  list: {
    padding: 20,
    paddingTop: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFD700',
    fontSize: 16,
    marginTop: 15,
    fontWeight: '600',
  },
  card: {
    marginBottom: 25,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  headerInfo: {
    flex: 1,
  },
  retoId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  usuarioId: {
    fontSize: 16,
    color: '#CCCCCC',
    fontWeight: '600',
  },
  dateContainer: {
    backgroundColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  date: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
  videoContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#000',
  },
  video: {
    width: width - 80,
    height: (width - 80) * 0.56,
    alignSelf: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 4,
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  approveIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  rejectButton: {
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: 'transparent',
  },
  rejectButtonContent: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginRight: 8,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
});

export default CheckVideo;