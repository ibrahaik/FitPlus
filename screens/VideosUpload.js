import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from './api';

const VideosUpload = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {
    retoId,
    retoNombre,
    retoDescripcion,
    usuarioNombre,
    comunidadId,
    usuarioId,
  } = route.params;

  const [estado, setEstado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const CLOUDINARY_UPLOAD_PRESET = 'fitplusvideos';
  const CLOUDINARY_CLOUD_NAME = 'ded9t7aan';

  useEffect(() => {
    const fetchEstado = async () => {
      try {
        const response = await axios.get(`/videos/estado/${retoId}/${usuarioId}`);
        setEstado(response.data.estado);
      } catch (error) {
        console.error('Error al obtener estado:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEstado();
  }, [retoId, usuarioId]);

  const handleStartRecording = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos denegados', 'Necesitamos acceso a la cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoMaxDuration: 60,
      quality: 1,
    });

    if (result.cancelled || !result.assets) {
      console.log('Grabación cancelada');
      return;
    }

    const uri = result.assets[0].uri;
    const filename = `${retoNombre}_${usuarioNombre}_${Date.now()}.mp4`;

    try {
      const formData = new FormData();
      formData.append('file', { uri, name: filename, type: 'video/mp4' });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('public_id', `videos/${comunidadId}/${filename}`);

      setUploading(true);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
        { method: 'POST', body: formData }
      );

      const data = await response.json();
      if (!data.secure_url) {
        console.error('Error al subir a Cloudinary:', data);
        Alert.alert('Error', 'Error al subir el vídeo a Cloudinary');
        setUploading(false);
        return;
      }

      const videoData = {
        usuario_id: usuarioId,
        reto_id: retoId,
        video_url: data.secure_url,
        fecha: new Date().toISOString(),
      };

      await axios.post('/videos', videoData);

      setUploading(false);

      Alert.alert('Éxito', 'Vídeo subido y guardado correctamente');
      navigation.goBack();
    } catch (error) {
      setUploading(false);
      console.error('Error de subida:', error);
      Alert.alert('Error', 'Ocurrió un error al subir el vídeo');
    }
  };

  let buttonMessage = 'Grabar vídeo';
  let buttonIcon = 'videocam';
  let buttonDisabled = false;
  let statusIcon, statusTitle, statusMessage, statusColors;

  if (estado === 'aprobado') {
    buttonMessage = 'Reto completado';
    buttonIcon = 'checkmark-circle';
    buttonDisabled = true;
    statusIcon = 'trophy';
    statusTitle = '¡Reto completado!';
    statusMessage = '¡Felicidades! Las monedas han sido ingresadas en tu cuenta.';
    statusColors = ['#4CD964', '#2ECC71'];
  } else if (estado === 'suspendido') {
    buttonMessage = 'Reto suspendido';
    buttonIcon = 'close-circle';
    buttonDisabled = true;
    statusIcon = 'close-circle';
    statusTitle = 'Reto no superado';
    statusMessage = 'Lo sentimos, no has cumplido los requisitos del reto.';
    statusColors = ['#FF3B30', '#E74C3C'];
  } else if (estado === 'pendiente') {
    buttonMessage = 'En revisión';
    buttonIcon = 'time';
    buttonDisabled = true;
    statusIcon = 'hourglass';
    statusTitle = 'En revisión';
    statusMessage = 'Tu vídeo está en revisión. Pronto se te notificará la resolución.';
    statusColors = ['#FFCC00', '#FFA000'];
  } else {
    statusIcon = 'videocam';
    statusTitle = 'Completar reto';
    statusMessage = 'Graba un video para demostrar que has completado el reto.';
    statusColors = ['#FFD700', '#FFA000'];
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Cargando estado del reto...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Completar Reto</Text>
          <Text style={styles.headerSubtitle}>{retoNombre}</Text>
        </View>
   
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.retoInfoCard}>
          <View style={styles.retoInfoHeader}>
            <Ionicons name="trophy-outline" size={24} color="#FFD700" />
            <Text style={styles.retoInfoTitle}>Información del Reto</Text>
          </View>
          
          <View style={styles.retoInfoItem}>
            <Text style={styles.retoInfoLabel}>Nombre:</Text>
            <Text style={styles.retoInfoValue}>{retoNombre}</Text>
          </View>
          
          <View style={styles.retoInfoItem}>
            <Text style={styles.retoInfoLabel}>Descripción:</Text>
            <Text style={styles.retoInfoValue}>{retoDescripcion}</Text>
          </View>
          
          <View style={styles.retoInfoItem}>
            <Text style={styles.retoInfoLabel}>Usuario:</Text>
            <Text style={styles.retoInfoValue}>{usuarioNombre}</Text>
          </View>
          
          <View style={styles.retoInfoItem}>
            <Text style={styles.retoInfoLabel}>Comunidad:</Text>
            <Text style={styles.retoInfoValue}>{comunidadId}</Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <LinearGradient
            colors={statusColors}
            style={styles.statusCard}
          >
            <View style={styles.statusIconContainer}>
              <Ionicons name={statusIcon} size={40} color="#FFFFFF" />
            </View>
            
            <Text style={styles.statusTitle}>{statusTitle}</Text>
            <Text style={styles.statusMessage}>{statusMessage}</Text>
          </LinearGradient>
        </View>
        
        <TouchableOpacity
          onPress={handleStartRecording}
          disabled={buttonDisabled || uploading}
          activeOpacity={0.8}
          style={[
            styles.actionButton,
            (buttonDisabled || uploading) && styles.actionButtonDisabled
          ]}
        >
          {uploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.uploadingText}>Subiendo vídeo...</Text>
            </View>
          ) : (
            <LinearGradient
              colors={buttonDisabled ? ['#555555', '#333333'] : ['#FFD700', '#FFA000']}
              style={styles.actionButtonGradient}
            >
              <Ionicons name={buttonIcon} size={24} color={buttonDisabled ? '#999' : '#121212'} />
              <Text style={[
                styles.actionButtonText,
                buttonDisabled && styles.actionButtonTextDisabled
              ]}>
                {buttonMessage}
              </Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
        
        {estado === 'aprobado' && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>¡Sigue así!</Text>
            <Text style={styles.tipsText}>
              Completa más retos para ganar monedas y mejorar tu ranking en la comunidad.
            </Text>
          </View>
        )}
        
        {estado === 'suspendido' && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Consejos para la próxima vez:</Text>
            <Text style={styles.tipsText}>
              • Asegúrate de seguir todas las instrucciones del reto{'\n'}
              • Graba en un lugar bien iluminado{'\n'}
              • Muestra claramente cómo realizas el ejercicio
            </Text>
          </View>
        )}
        
        {estado === 'pendiente' && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Tiempo de revisión:</Text>
            <Text style={styles.tipsText}>
              Los administradores suelen revisar los vídeos en un plazo de 24-48 horas.
            </Text>
          </View>
        )}
        
        {!estado && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Consejos para grabar:</Text>
            <Text style={styles.tipsText}>
              • Busca un lugar bien iluminado{'\n'}
              • Asegúrate de que se vea claramente el ejercicio{'\n'}
              • Mantén el teléfono estable o usa un trípode{'\n'}
              • El vídeo debe durar menos de 60 segundos
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#BBBBBB',
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 100,

  },
  headerSubtitle: {
    color: '#FFD700',
    fontSize: 12,
    marginRight: 100,

  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  retoInfoCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  retoInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  retoInfoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  retoInfoItem: {
    marginBottom: 12,
  },
  retoInfoLabel: {
    color: '#BBBBBB',
    fontSize: 14,
    marginBottom: 4,
  },
  retoInfoValue: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusMessage: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  actionButtonText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  actionButtonTextDisabled: {
    color: '#999',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    paddingVertical: 16,
  },
  uploadingText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  tipsContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tipsTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipsText: {
    color: '#BBBBBB',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default VideosUpload;