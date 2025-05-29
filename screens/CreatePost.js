import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from './api';

const CLOUDINARY_UPLOAD_PRESET = 'fitplusvideos';
const CLOUDINARY_CLOUD_NAME = 'ded9t7aan';

const CreatePostScreen = () => {
  const { user_id } = useRoute().params;
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const pickAndUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos denegados', 'Necesitamos permiso para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });

    if (result.cancelled) return;

    const uri = result.assets[0].uri;
    const type = result.assets[0].type; 
    const name = uri.split('/').pop();

    const formData = new FormData();
    formData.append('file', { uri, name, type: `${type}/${name.split('.').pop()}` });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    setUploading(true);
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${type}/upload`,
        { method: 'POST', body: formData }
      );
      const data = await response.json();
      if (!data.secure_url) throw new Error('No se obtuvo URL de Cloudinary');

      setMediaUrl(data.secure_url);
      setMediaType(type);
    } catch (err) {
      console.error('Error subiendo a Cloudinary:', err);
      Alert.alert('Error', 'No se pudo subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!title || !description || !mediaUrl || !mediaType) {
      Alert.alert('Error', 'Por favor, complete todos los campos');
      return;
    }
    const postData = { user_id, title, description, media_url: mediaUrl, media_type: mediaType };
    try {
      const res = await axios.post('/posts', postData);
      if (res.status === 201) {
        Alert.alert('Éxito', 'Post creado correctamente');
        setTitle(''); setDescription(''); setMediaUrl(''); setMediaType('');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'No se pudo crear el post');
      }
    } catch (err) {
      console.error('Error creando post:', err);
      Alert.alert('Error', 'Ocurrió un error al crear el post');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear un Nuevo Post</Text>

      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Escribe el título del post"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={styles.input}
        placeholder="Escribe la descripción del post"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Selecciona Imagen o Vídeo</Text>
      <TouchableOpacity
        style={[styles.uploadButton, uploading && styles.disabled]}
        onPress={pickAndUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.uploadText}>Abrir Galería</Text>
        )}
      </TouchableOpacity>

      {mediaUrl ? (
        mediaType === 'image' ? (
          <Image source={{ uri: mediaUrl }} style={styles.preview} />
        ) : (
          <Text style={styles.previewText}>Vídeo listo para subir</Text>
        )
      ) : null}

      <Button title="Crear Post" onPress={handleCreatePost} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 10 },
  input: {
    height: 40, borderColor: 'gray', borderWidth: 1,
    marginBottom: 10, paddingLeft: 10,
  },
  uploadButton: {
    marginVertical: 10,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadText: { color: '#fff', fontWeight: 'bold' },
  disabled: { opacity: 0.6 },
  preview: {
    width: '100%', height: 200, marginBottom: 20, borderRadius: 8,
  },
  previewText: {
    fontStyle: 'italic', marginBottom: 20, textAlign: 'center',
  },
});

export default CreatePostScreen;
