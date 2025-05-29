import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  Dimensions,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from './api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const SPACING = width * 0.1;

const RegisterStep2 = ({ route, navigation }) => {
  const { nombre, email, password } = route.params;
  const [comunidadId, setComunidadId] = useState('');
  const [comunidades, setComunidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  // Cargar comunidades desde el backend
  useEffect(() => {
    const fetchComunidades = async () => {
      try {
        const response = await api.get('/comunidades');
        setComunidades(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener comunidades:', error.message);
        Alert.alert('Error', 'Hubo un problema al cargar las comunidades');
        setLoading(false);
      }
    };
    fetchComunidades();
  }, []);

  const handleRegister = async () => {
    if (!comunidadId) {
      Alert.alert('Error', 'Por favor, selecciona una comunidad');
      return;
    }
    try {
      setLoading(true);
      const response = await api.post('/usuarios/registro', {
        nombre,
        email,
        contraseña: password,
        comunidad_id: comunidadId,
      });
      console.log('Respuesta del backend:', response.data);
      setLoading(false);
      Alert.alert('Éxito', '¡Registro exitoso, bienvenido!');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error en el registro:', error.message);
      setLoading(false);
      Alert.alert('Error', 'Hubo un problema al registrar al usuario');
    }
  };

  // Colores para las tarjetas de comunidades (alternando)
  const cardColors = [
    ['#FFD700', '#121212'], // Amarillo y negro
    ['#121212', '#FFD700'], // Negro y amarillo
    ['#333333', '#FFD700'], // Gris oscuro y amarillo
    ['#FFD700', '#333333'], // Amarillo y gris oscuro
  ];

  // Renderizar cada tarjeta de comunidad
  const renderComunidadCard = ({ item, index }) => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    const colorIndex = index % cardColors.length;
    const [bgColor, textColor] = cardColors[colorIndex];

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          setComunidadId(item.id);
          // Animar al centro de la tarjeta seleccionada
          flatListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5,
          });
        }}
      >
        <Animated.View
          style={[
            styles.comunidadCard,
            {
              transform: [{ scale }],
              opacity,
              backgroundColor: bgColor,
              borderColor: comunidadId === item.id ? '#FFD700' : 'transparent',
              borderWidth: comunidadId === item.id ? 3 : 0,
            },
          ]}
        >
          <View style={styles.cardContent}>
            <Text style={[styles.comunidadName, { color: textColor }]}>{item.nombre}</Text>
            
            {comunidadId === item.id && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="checkmark-circle" size={28} color={textColor} />
              </View>
            )}
            
            <View style={styles.cardIcon}>
              <Ionicons 
                name={getComunidadIcon(item.nombre)} 
                size={50} 
                color={textColor} 
              />
            </View>
            
            <Text style={[styles.cardDescription, { color: textColor }]}>
              {getComunidadDescription(item.nombre)}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // Función para obtener un icono basado en el nombre de la comunidad
  const getComunidadIcon = (nombre) => {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('madrid')) return 'business-outline';
    if (nombreLower.includes('cataluña') || nombreLower.includes('catalunya')) return 'map-outline';
    if (nombreLower.includes('andalucía')) return 'sunny-outline';
    if (nombreLower.includes('valencia')) return 'water-outline';
    if (nombreLower.includes('galicia')) return 'rainy-outline';
    if (nombreLower.includes('país vasco') || nombreLower.includes('euskadi')) return 'mountains-outline';
    return 'location-outline'; // Icono por defecto
  };

  // Función para obtener una descripción basada en el nombre de la comunidad
  const getComunidadDescription = (nombre) => {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('madrid')) return 'Entrena en la capital';
    if (nombreLower.includes('cataluña') || nombreLower.includes('catalunya')) return 'Fitness mediterráneo';
    if (nombreLower.includes('andalucía')) return 'Entrena con pasión sureña';
    if (nombreLower.includes('valencia')) return 'Fitness junto al mar';
    if (nombreLower.includes('galicia')) return 'Fuerza atlántica';
    if (nombreLower.includes('país vasco') || nombreLower.includes('euskadi')) return 'Potencia norteña';
    return 'Únete a esta comunidad'; // Descripción por defecto
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={styles.content}>
        {/* Espacio para el logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            {/* Aquí irá tu logo del plátano culturista */}
          </View>
          <Text style={styles.appTitle}>BANANA FIT</Text>
          <Text style={styles.appSlogan}>Elige tu comunidad</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.stepTitle}>Último paso</Text>
          <Text style={styles.stepDescription}>
            Selecciona la comunidad a la que perteneces para conectarte con otros culturistas de tu zona
          </Text>

          <View style={styles.carouselContainer}>
            {comunidades.length > 0 ? (
              <Animated.FlatList
                ref={flatListRef}
                data={comunidades}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
                snapToInterval={CARD_WIDTH}
                decelerationRate="fast"
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: true }
                )}
                renderItem={renderComunidadCard}
                scrollEventThrottle={16}
              />
            ) : (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando comunidades...</Text>
              </View>
            )}
          </View>

          <View style={styles.selectionInfo}>
            {comunidadId ? (
              <Text style={styles.selectionText}>
                Has seleccionado: {comunidades.find(c => c.id === comunidadId)?.nombre}
              </Text>
            ) : (
              <Text style={styles.selectionText}>
                Desliza para ver todas las comunidades
              </Text>
            )}
          </View>

          <TouchableOpacity 
            style={[
              styles.registerButton,
              !comunidadId && styles.disabledButton
            ]} 
            onPress={handleRegister}
            activeOpacity={0.8}
            disabled={!comunidadId || loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'PROCESANDO...' : 'COMPLETAR REGISTRO'}
            </Text>
          </TouchableOpacity>

          <View style={styles.backContainer}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={20} color="#FFD700" />
              <Text style={styles.backText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 2,
  },
  appSlogan: {
    fontSize: 14,
    color: '#BBBBBB',
    marginTop: 5,
  },
  formContainer: {
    flex: 1,
    width: '100%',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 14,
    color: '#BBBBBB',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  carouselContainer: {
    height: 220,
    marginBottom: 20,
  },
  flatListContent: {
    paddingHorizontal: SPACING / 2,
  },
  comunidadCard: {
    width: CARD_WIDTH,
    height: 200,
    marginHorizontal: SPACING / 2,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra para Android
    elevation: 5,
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardContent: {
    width: '100%',
    height: '100%',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  comunidadName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  cardIcon: {
    marginVertical: 10,
  },
  cardDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#BBBBBB',
    fontSize: 16,
  },
  selectionInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectionText: {
    color: '#BBBBBB',
    fontSize: 14,
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    // Sombra para Android
    elevation: 5,
    // Sombra para iOS
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#666',
    shadowColor: '#000',
  },
  registerButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  backContainer: {
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backText: {
    color: '#FFD700',
    marginLeft: 5,
    fontSize: 16,
  },
});

export default RegisterStep2;