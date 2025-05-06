import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from './api';

const VideosUpload = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {
    retoId,             // ← RECIBIDO
    retoNombre,
    retoDescripcion,
    usuarioNombre,
    comunidadId,
    usuarioId,          // ← RECIBIDO
  } = route.params;

  const CLOUDINARY_UPLOAD_PRESET = 'fitplusvideos';
  const CLOUDINARY_CLOUD_NAME = 'ded9t7aan';

  const handleStartRecording = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos denegados', 'Necesitamos acceso a la cámara');
      return;
    }
  
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos, // ← la API correcta
      videoMaxDuration: 60,
      quality: 1,
    });
  
    // Propiedad correcta: cancelled
    if (result.cancelled) {
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

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`, {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      if (!data.secure_url) {
        console.error('Error al subir a Cloudinary:', data);
        Alert.alert('Error', 'Error al subir el vídeo a Cloudinary');
        return;
      }

      // Ahora insertamos el vídeo en la base de datos
      const videoData = {
        usuario_id: usuarioId,           // viene de route.params
        reto_id: retoId,                 // viene de route.params
        video_url: data.secure_url,
        fecha: new Date().toISOString(),
      };

      await axios.post('/videos', videoData);
      Alert.alert('Éxito', 'Vídeo subido y guardado correctamente');
      navigation.goBack();

    } catch (error) {
      console.error('Error de subida:', error);
      Alert.alert('Error', 'Ocurrió un error al subir el vídeo');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completar Reto</Text>
      <Text style={styles.label}>Nombre del reto:</Text>
      <Text style={styles.value}>{retoNombre}</Text>
      <Text style={styles.label}>Descripción:</Text>
      <Text style={styles.value}>{retoDescripcion}</Text>
      <Text style={styles.label}>Usuario:</Text>
      <Text style={styles.value}>{usuarioNombre}</Text>
      <Text style={styles.label}>Comunidad ID:</Text>
      <Text style={styles.value}>{comunidadId}</Text>
      <Button title="Grabar vídeo" onPress={handleStartRecording} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 10 },
  value: { fontSize: 16, marginBottom: 5 },
});

export default VideosUpload;
