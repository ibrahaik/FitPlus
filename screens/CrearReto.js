import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import api from './api'; // Importas la configuración de axios

const CrearReto = () => {
  const [nombreReto, setNombreReto] = useState('');
  const [descripcionReto, setDescripcionReto] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [puntos, setPuntos] = useState('');
  const [comunidadid, setComunidad] = useState('');

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; 
    setFechaInicio(formattedDate); 
  }, []);

  const handleSubmit = async () => {
    if (!nombreReto || !descripcionReto || !fechaInicio || !fechaFin || !puntos || !comunidadid) {
      Alert.alert('Error', 'Por favor, complete todos los campos');
      return;
    }

    try {
      const response = await api.post('/retos', {
        nombre: nombreReto,
        descripcion: descripcionReto,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        puntos: puntos,
        comunidad_id: comunidadid,
      });
      Alert.alert('Éxito', 'Reto publicado correctamente');
      setNombreReto('');
      setDescripcionReto('');
      setFechaInicio(new Date().toISOString().split('T')[0]);      setFechaFin('');
      setPuntos('');
      setComunidad('');
    } catch (error) {
      console.error('Error al publicar el reto:', error);
      Alert.alert('Error', 'Hubo un problema al publicar el reto');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Reto</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del Reto"
        value={nombreReto}
        onChangeText={setNombreReto}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción del Reto"
        value={descripcionReto}
        onChangeText={setDescripcionReto}
      />
      <TextInput
        style={styles.input}
        placeholder="Fecha de Inicio (YYYY-MM-DD)"
        value={fechaInicio}
        onChangeText={setFechaInicio}
      />
      <TextInput
        style={styles.input}
        placeholder="Fecha de Fin (YYYY-MM-DD)"
        value={fechaFin}
        onChangeText={setFechaFin}
      />
      <TextInput
        style={styles.input}
        placeholder="Puntos"
        value={puntos}
        onChangeText={setPuntos}
      />
      <TextInput
        style={styles.input}
        placeholder="Comunidad"
        value={comunidadid}
        onChangeText={setComunidad}
      />

      <Button title="Publicar" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
  },
});

export default CrearReto;
