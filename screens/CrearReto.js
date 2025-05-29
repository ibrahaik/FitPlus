import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from './api';

const CrearReto = ({ navigation }) => {
  const [nombreReto, setNombreReto] = useState('');
  const [descripcionReto, setDescripcionReto] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Una semana después
  const [puntos, setPuntos] = useState('');
  const [comunidadId, setComunidadId] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comunidades, setComunidades] = useState([]);
  const [showComunidades, setShowComunidades] = useState(false);

  useEffect(() => {
    const fetchComunidades = async () => {
      try {
        const response = await api.get('/comunidades');
        setComunidades(response.data);
      } catch (error) {
        console.error('Error al cargar comunidades:', error);
      }
    };
    
    fetchComunidades();
  }, []);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setFechaInicio(selectedDate);
      
      if (selectedDate > fechaFin) {
        const newEndDate = new Date(selectedDate);
        newEndDate.setDate(selectedDate.getDate() + 7);
        setFechaFin(newEndDate);
      }
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setFechaFin(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!nombreReto.trim()) {
      Alert.alert('Error', 'Por favor, ingresa el nombre del reto');
      return;
    }
    
    if (!descripcionReto.trim()) {
      Alert.alert('Error', 'Por favor, ingresa la descripción del reto');
      return;
    }
    
    if (!puntos || isNaN(parseInt(puntos))) {
      Alert.alert('Error', 'Por favor, ingresa un valor numérico válido para los puntos');
      return;
    }
    
    if (!comunidadId) {
      Alert.alert('Error', 'Por favor, selecciona una comunidad');
      return;
    }
    
    if (fechaInicio >= fechaFin) {
      Alert.alert('Error', 'La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/retos', {
        nombre: nombreReto,
        descripcion: descripcionReto,
        fecha_inicio: formatDate(fechaInicio),
        fecha_fin: formatDate(fechaFin),
        puntos: parseInt(puntos),
        comunidad_id: parseInt(comunidadId),
      });
      
      setIsSubmitting(false);
      Alert.alert('Éxito', 'Reto publicado correctamente');
      
      setNombreReto('');
      setDescripcionReto('');
      setFechaInicio(new Date());
      setFechaFin(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      setPuntos('');
      setComunidadId('');
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error al publicar el reto:', error);
      Alert.alert('Error', 'Hubo un problema al publicar el reto');
    }
  };

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
          <Text style={styles.headerTitle}>Panel de Administración</Text>
          <Text style={styles.headerSubtitle}>Crear Nuevo Reto</Text>
        </View>
        
        <View style={styles.logoPlaceholder}>
          {/* Aquí irá tu logo */}
        </View>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Información del Reto</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="trophy-outline" size={22} color="#FFD700" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre del Reto"
                placeholderTextColor="#999"
                value={nombreReto}
                onChangeText={setNombreReto}
              />
            </View>
            
            <View style={styles.textAreaContainer}>
              <Ionicons name="document-text-outline" size={22} color="#FFD700" style={styles.inputIcon} />
              <TextInput
                style={styles.textArea}
                placeholder="Descripción del Reto"
                placeholderTextColor="#999"
                value={descripcionReto}
                onChangeText={setDescripcionReto}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <Text style={styles.sectionTitle}>Fechas</Text>
            
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={22} color="#FFD700" style={styles.inputIcon} />
              <Text style={styles.datePickerButtonText}>
                Fecha de Inicio: {formatDate(fechaInicio)}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
            
            {showStartDatePicker && (
              <DateTimePicker
                value={fechaInicio}
                mode="date"
                display="default"
                onChange={handleStartDateChange}
                minimumDate={new Date()}
              />
            )}
            
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Ionicons name="calendar" size={22} color="#FFD700" style={styles.inputIcon} />
              <Text style={styles.datePickerButtonText}>
                Fecha de Fin: {formatDate(fechaFin)}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
            
            {showEndDatePicker && (
              <DateTimePicker
                value={fechaFin}
                mode="date"
                display="default"
                onChange={handleEndDateChange}
                minimumDate={new Date(fechaInicio.getTime() + 24 * 60 * 60 * 1000)} // Al menos un día después
              />
            )}
            
            <Text style={styles.sectionTitle}>Detalles</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="star-outline" size={22} color="#FFD700" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Puntos (1-100)"
                placeholderTextColor="#999"
                value={puntos}
                onChangeText={setPuntos}
                keyboardType="numeric"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => setShowComunidades(!showComunidades)}
            >
              <Ionicons name="people-outline" size={22} color="#FFD700" style={styles.inputIcon} />
              <Text style={styles.dropdownButtonText}>
                {comunidadId ? 
                  comunidades.find(c => c.id.toString() === comunidadId)?.nombre || 'Seleccionar Comunidad' : 
                  'Seleccionar Comunidad'}
              </Text>
              <Ionicons 
                name={showComunidades ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#999" 
              />
            </TouchableOpacity>
            
            {showComunidades && (
              <View style={styles.dropdownList}>
                {comunidades.map(comunidad => (
                  <TouchableOpacity
                    key={comunidad.id}
                    style={[
                      styles.dropdownItem,
                      comunidadId === comunidad.id.toString() && styles.dropdownItemSelected
                    ]}
                    onPress={() => {
                      setComunidadId(comunidad.id.toString());
                      setShowComunidades(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      comunidadId === comunidad.id.toString() && styles.dropdownItemTextSelected
                    ]}>
                      {comunidad.nombre}
                    </Text>
                    {comunidadId === comunidad.id.toString() && (
                      <Ionicons name="checkmark" size={18} color="#FFD700" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#121212" size="small" />
              ) : (
                <LinearGradient
                  colors={['#FFD700', '#FFA000']}
                  style={styles.submitButtonGradient}
                >
                  <Ionicons name="add-circle" size={22} color="#121212" />
                  <Text style={styles.submitButtonText}>Publicar Reto</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
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
  },
  headerSubtitle: {
    color: '#FFD700',
    fontSize: 12,
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    height: '100%',
  },
  textAreaContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 15,
    paddingTop: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    alignItems: 'flex-start',
  },
  textArea: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    justifyContent: 'space-between',
  },
  datePickerButtonText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  dropdownList: {
    backgroundColor: '#252525',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  dropdownItemText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  dropdownItemTextSelected: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  submitButtonText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default CrearReto;