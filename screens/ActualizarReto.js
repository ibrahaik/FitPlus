"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import axios from "./api"

const ActualizarRetos = () => {
  const navigation = useNavigation()
  const [retos, setRetos] = useState([])
  const [retoSeleccionado, setRetoSeleccionado] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [puntos, setPuntos] = useState("")
  const [comunidadId, setComunidadId] = useState("")

  useEffect(() => {
    obtenerRetos()
  }, [])

  const obtenerRetos = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/retos")
      setRetos(response.data)
    } catch (error) {
      console.error("Error al obtener retos:", error)
      Alert.alert("Error", "No se pudieron obtener los retos")
    } finally {
      setLoading(false)
    }
  }

  const seleccionarReto = (reto) => {
    setRetoSeleccionado(reto)
    setNombre(reto.nombre)
    setDescripcion(reto.descripcion)
    setFechaInicio(reto.fecha_inicio.split("T")[0])
    setFechaFin(reto.fecha_fin.split("T")[0])
    setPuntos(reto.puntos.toString())
    setComunidadId(reto.comunidad_id.toString())
  }

  const actualizarReto = async () => {
    if (!retoSeleccionado) return

    if (!nombre.trim() || !descripcion.trim() || !fechaInicio || !fechaFin || !puntos || !comunidadId) {
      Alert.alert("Error", "Por favor, complete todos los campos")
      return
    }

    setUpdating(true)
    try {
      await axios.put(`/retos/${retoSeleccionado.id}`, {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        puntos: Number.parseInt(puntos),
        comunidad_id: Number.parseInt(comunidadId),
      })

      Alert.alert("Éxito", "Reto actualizado correctamente")
      setRetoSeleccionado(null)
      limpiarCampos()
      obtenerRetos()
    } catch (error) {
      console.error("Error al actualizar reto:", error)
      Alert.alert("Error", "No se pudo actualizar el reto")
    } finally {
      setUpdating(false)
    }
  }


  const limpiarCampos = () => {
    setNombre("")
    setDescripcion("")
    setFechaInicio("")
    setFechaFin("")
    setPuntos("")
    setComunidadId("")
  }

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "short", year: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  const getRetoColor = (puntos) => {
    if (puntos >= 100) return ["#FFD700", "#FFA000"]
    if (puntos >= 50) return ["#C0C0C0", "#A0A0A0"]
    return ["#CD7F32", "#A05A2C"]
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Cargando retos...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Gestionar Retos</Text>
          <Text style={styles.headerSubtitle}>Actualizar y eliminar</Text>
        </View>

        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.retosListContainer}>
          <Text style={styles.sectionTitle}>
            <Text color="#FFD700" /> Seleccionar Reto
          </Text>

          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {retos.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => seleccionarReto(item)}
                style={[styles.card, retoSeleccionado?.id === item.id && styles.cardSelected]}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={retoSeleccionado?.id === item.id ? ["#FFD700", "#FFA000"] : ["#1E1E1E", "#252525"]}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, retoSeleccionado?.id === item.id && styles.cardTitleSelected]}>
                      {item.nombre}
                    </Text>
                    <View style={styles.pointsContainer}>
                      <LinearGradient colors={getRetoColor(item.puntos)} style={styles.pointsBadge}>
                        <Text style={styles.pointsText}>{item.puntos} pts</Text>
                      </LinearGradient>
                    </View>
                  </View>

                  <Text
                    style={[styles.cardDescription, retoSeleccionado?.id === item.id && styles.cardDescriptionSelected]}
                  >
                    {item.descripcion}
                  </Text>

                  <View style={styles.cardDates}>
                    <View style={styles.dateItem}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={retoSeleccionado?.id === item.id ? "#121212" : "#BBB"}
                      />
                      <Text style={[styles.dateText, retoSeleccionado?.id === item.id && styles.dateTextSelected]}>
                        {formatDate(item.fecha_inicio)} - {formatDate(item.fecha_fin)}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {retoSeleccionado && (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="create-outline" size={18} color="#FFD700" /> Editar Reto
            </Text>

            <ScrollView style={styles.formScrollContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del reto"
                  placeholderTextColor="#666"
                  value={nombre}
                  onChangeText={setNombre}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Descripción del reto"
                  placeholderTextColor="#666"
                  value={descripcion}
                  onChangeText={setDescripcion}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.dateRow}>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.inputLabel}>Fecha Inicio</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#666"
                    value={fechaInicio}
                    onChangeText={setFechaInicio}
                  />
                </View>

                <View style={styles.dateInputContainer}>
                  <Text style={styles.inputLabel}>Fecha Fin</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#666"
                    value={fechaFin}
                    onChangeText={setFechaFin}
                  />
                </View>
              </View>

              <View style={styles.numberRow}>
                <View style={styles.numberInputContainer}>
                  <Text style={styles.inputLabel}>Puntos</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#666"
                    value={puntos}
                    keyboardType="numeric"
                    onChangeText={setPuntos}
                  />
                </View>

                <View style={styles.numberInputContainer}>
                  <Text style={styles.inputLabel}>Comunidad ID</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#666"
                    value={comunidadId}
                    keyboardType="numeric"
                    onChangeText={setComunidadId}
                  />
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, updating && styles.actionButtonDisabled]}
                  onPress={actualizarReto}
                  disabled={updating}
                >
                  <LinearGradient
                    colors={updating ? ["#555", "#333"] : ["#4CD964", "#2ECC71"]}
                    style={styles.actionButtonGradient}
                  >
                    {updating ? (
                      <View style={styles.buttonContent}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.buttonText}>Actualizando...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.buttonText}>Actualizar Reto</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

              
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "#BBBBBB",
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#FFD700",
    fontSize: 12,
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
  retosListContainer: {
    flex: 1,
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: "#333",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardSelected: {
    elevation: 6,
    shadowOpacity: 0.5,
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
  },
  cardTitleSelected: {
    color: "#121212",
  },
  pointsContainer: {
    marginLeft: 8,
  },
  pointsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    color: "#121212",
    fontWeight: "bold",
    fontSize: 12,
  },
  cardDescription: {
    color: "#DDDDDD",
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  cardDescriptionSelected: {
    color: "#121212",
  },
  cardDates: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    color: "#BBBBBB",
    fontSize: 12,
    marginLeft: 4,
  },
  dateTextSelected: {
    color: "#121212",
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  formScrollContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  numberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  numberInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  buttonContainer: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonGradient: {
    padding: 16,
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
})

export default ActualizarRetos
