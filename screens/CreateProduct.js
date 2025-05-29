import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import api from './api';

const CLOUDINARY_UPLOAD_PRESET = 'fitplusvideos';
const CLOUDINARY_CLOUD_NAME   = 'ded9t7aan';

export default function CreateProductScreen() {
  const navigation = useNavigation();

  const [nombre, setNombre]             = useState('');
  const [descripcion, setDescripcion]   = useState('');
  const [precioPuntos, setPrecioPuntos] = useState('');
  const [stock, setStock]               = useState('');

  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating]   = useState(false);

  const pickAndUploadImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permisos denegados', 'Necesitamos permiso para acceder a la galería');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.cancelled) return;

    const uri  = result.assets[0].uri;
    const name = uri.split('/').pop();
    const type = `image/${name.split('.').pop()}`;

    const formData = new FormData();
    formData.append('file',         { uri, name, type });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    setUploading(true);
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      if (!data.secure_url) throw new Error('No se obtuvo URL de Cloudinary');
      setImageUrl(data.secure_url);
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      Alert.alert('Error', 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!nombre || !precioPuntos || !stock || !imageUrl) {
      return Alert.alert('Error', 'Completa todos los campos y sube una imagen');
    }
    setCreating(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const payload = {
        nombre,
        descripcion,
        precio_puntos: parseInt(precioPuntos, 10),
        stock:         parseInt(stock, 10),
        imagen_url:    imageUrl,     // ← aquí
      };
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  
      const { data } = await api.post('/productos', payload, { headers });
      Alert.alert('Éxito', `Producto "${data.nombre}" creado`);
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.error || 'No se pudo crear el producto');
    } finally {
      setCreating(false);
    }
  };

  

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.flex} 
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Crear Nuevo Producto</Text>

        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej. Banda Elástica"
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Detalles opcionales..."
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Precio en puntos *</Text>
        <TextInput
          style={styles.input}
          value={precioPuntos}
          onChangeText={setPrecioPuntos}
          placeholder="Ej. 100"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Stock *</Text>
        <TextInput
          style={styles.input}
          value={stock}
          onChangeText={setStock}
          placeholder="Ej. 10"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Imagen</Text>
        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.disabled]}
          onPress={pickAndUploadImage}
          disabled={uploading}
        >
          {uploading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.uploadText}>{ imageUrl ? 'Reemplazar Imagen' : 'Seleccionar Imagen' }</Text>
          }
        </TouchableOpacity>

        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.preview} />
        ) : null}

        <View style={styles.button}>
          {creating
            ? <ActivityIndicator size="small" color="#FFD700" />
            : <Button title="Publicar Producto" onPress={handleCreate} color="#28a745" />
          }
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    padding: 20,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    color: '#fff',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    textAlignVertical: 'top',
    height: 100,
  },
  uploadButton: {
    marginVertical: 10,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.6,
  },
  preview: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 8,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
