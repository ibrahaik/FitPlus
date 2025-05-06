import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from './api';
import { SafeAreaView } from 'react-native-safe-area-context';


const ActualizarRetos = () => {
  const [retos, setRetos] = useState([]);
  const [retoSeleccionado, setRetoSeleccionado] = useState(null);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [puntos, setPuntos] = useState('');
  const [comunidadId, setComunidadId] = useState('');

  useEffect(() => {
    obtenerRetos();
  }, []);

  const obtenerRetos = async () => {
    try {
      const response = await axios.get('/retos');
      setRetos(response.data);
    } catch (error) {
      console.error('Error al obtener retos:', error);
      Alert.alert('Error', 'No se pudieron obtener los retos');
    }
  };

  const seleccionarReto = (reto) => {
    setRetoSeleccionado(reto);
    setNombre(reto.nombre);
    setDescripcion(reto.descripcion);
    setFechaInicio(reto.fecha_inicio.split('T')[0]);
    setFechaFin(reto.fecha_fin.split('T')[0]);
    setPuntos(reto.puntos.toString());
    setComunidadId(reto.comunidad_id.toString());
  };

  const actualizarReto = async () => {
    if (!retoSeleccionado) return;

    try {
      await axios.put(`/retos/${retoSeleccionado.id}`, {
        nombre,
        descripcion,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        puntos: parseInt(puntos),
        comunidad_id: parseInt(comunidadId),
      });

      Alert.alert('Éxito', 'Reto actualizado correctamente');
      setRetoSeleccionado(null);
      limpiarCampos();
      obtenerRetos();
    } catch (error) {
      console.error('Error al actualizar reto:', error);
      Alert.alert('Error', 'No se pudo actualizar el reto');
    }
  };

  const eliminarReto = async () => {
    if (!retoSeleccionado) return;

    try {
      await axios.delete(`/retos/${retoSeleccionado.id}`);
      Alert.alert('Éxito', 'Reto eliminado correctamente');
      setRetoSeleccionado(null);
      limpiarCampos();
      obtenerRetos();
    } catch (error) {
      console.error('Error al eliminar reto:', error);
      Alert.alert('Error', 'No se pudo eliminar el reto');
    }
  };

  const limpiarCampos = () => {
    setNombre('');
    setDescripcion('');
    setFechaInicio('');
    setFechaFin('');
    setPuntos('');
    setComunidadId('');
  };

  return (
        <SafeAreaView style={{ flex: 1 }}>
    <View style={styles.container}>
      <Text style={styles.title}>Actualizar Retos</Text>

      <ScrollView style={styles.scrollContainer}>
        {retos.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => seleccionarReto(item)}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            <Text style={styles.cardText}>Puntos: {item.puntos}</Text>
            <Text style={styles.cardText}>
              Inicio: {item.fecha_inicio.split('T')[0]}
            </Text>
            <Text style={styles.cardText}>
              Fin: {item.fecha_fin.split('T')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {retoSeleccionado && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
          />
          <TextInput
            style={styles.input}
            placeholder="Descripción"
            value={descripcion}
            onChangeText={setDescripcion}
          />
          <TextInput
            style={styles.input}
            placeholder="Fecha Inicio (YYYY-MM-DD)"
            value={fechaInicio}
            onChangeText={setFechaInicio}
          />
          <TextInput
            style={styles.input}
            placeholder="Fecha Fin (YYYY-MM-DD)"
            value={fechaFin}
            onChangeText={setFechaFin}
          />
          <TextInput
            style={styles.input}
            placeholder="Puntos"
            value={puntos}
            keyboardType="numeric"
            onChangeText={setPuntos}
          />
          <TextInput
            style={styles.input}
            placeholder="Comunidad ID"
            value={comunidadId}
            keyboardType="numeric"
            onChangeText={setComunidadId}
          />

          <Button title="Actualizar" onPress={actualizarReto} color="#2e7d32" />
          <View style={{ marginTop: 10 }} />
          <Button title="Eliminar" onPress={eliminarReto} color="#c62828" />
        </>
      )}
    </View>
        </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollContainer: {
    maxHeight: 300,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
  },
});

export default ActualizarRetos;
