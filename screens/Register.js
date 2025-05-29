import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from './api';

const Register = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (nombre.length < 5) {
      Alert.alert('Error', 'El nombre debe tener al menos 5 caracteres');
      return false;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@(gmail\.com|outlook\.es)$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Email inválido');
      return false;
    }
    return true;
  };

  const handleRegister1 = async () => {
    if (!validateForm()) return;

    try {
      const response = await api.post('/usuarios/verificar', {
        nombre,
        email,
      });

      if (response.data.existe) {
        Alert.alert('Error', response.data.mensaje);
      } else {
        navigation.navigate('RegisterStep2', { nombre, email, password });
      }
    } catch (error) {
      console.error('Error al verificar usuario:', error.message);
      Alert.alert('Error', 'No se pudo conectar al servidor o ya está en uso');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Espacio para el logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoPlaceholder}>
                {/* Aquí irá tu logo del plátano culturista */}
              </View>
              <Text style={styles.appTitle}>BANANA FIT</Text>
              <Text style={styles.appSlogan}>Únete a la comunidad fitness</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Crear cuenta</Text>
              
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={22} color="#FFD700" style={styles.inputIcon} />
                <TextInput
                  placeholder="Nombre"
                  placeholderTextColor="#999"
                  value={nombre}
                  onChangeText={setNombre}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={22} color="#FFD700" style={styles.inputIcon} />
                <TextInput
                  placeholder="Email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={22} color="#FFD700" style={styles.inputIcon} />
                <TextInput
                  placeholder="Contraseña"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={22} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.passwordRequirements}>
                <Text style={styles.requirementText}>• Mínimo 8 caracteres</Text>
                <Text style={styles.requirementText}>• Email válido (gmail.com o outlook.es)</Text>
                <Text style={styles.requirementText}>• Nombre mínimo 5 caracteres</Text>
              </View>

              <TouchableOpacity 
                style={styles.registerButton} 
                onPress={handleRegister1}
                activeOpacity={0.8}
              >
                <Text style={styles.registerButtonText}>REGISTRARME</Text>
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Inicia sesión</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  appTitle: {
    fontSize: 28,
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
    width: '100%',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
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
  eyeIcon: {
    padding: 8,
  },
  passwordRequirements: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  requirementText: {
    color: '#BBBBBB',
    fontSize: 12,
    marginBottom: 4,
  },
  registerButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  registerButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  loginText: {
    color: '#BBBBBB',
    fontSize: 14,
  },
  loginLink: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Register;