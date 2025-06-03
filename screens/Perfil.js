"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
  FlatList,
  RefreshControl,
} from "react-native"
import { FontAwesome } from "@expo/vector-icons"
import api from "./api"

const { width } = Dimensions.get("window")

const PerfilScreen = ({ route, navigation }) => {
  const userId = route?.params?.userId || null

  const [usuario, setUsuario] = useState(null)
  const [comunidad, setComunidad] = useState(null)
  const [compras, setCompras] = useState([])
  const [informacion, setInformacion] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [showOrders, setShowOrders] = useState(true)
  const [error, setError] = useState(null)

  // Estados para edición
  const [nombreCompleto, setNombreCompleto] = useState("")
  const [direccionEnvio, setDireccionEnvio] = useState("")
  const [existeInformacion, setExisteInformacion] = useState(false)

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0]

  useEffect(() => {
    if (userId) {
      loadProfileData()
    } else {
      setLoading(false)
      setError("No se ha proporcionado un ID de usuario válido")
    }
  }, [userId])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      setError(null)
      await Promise.all([loadUsuario(), loadCompras(), loadInformacion()])

      // Animate content appearing
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start()
    } catch (error) {
      console.error("Error loading profile data:", error)
      setError("No se pudo cargar la información del perfil")
    } finally {
      setLoading(false)
    }
  }

  const loadUsuario = async () => {
    if (!userId) return

    try {
      const res = await api.get(`/usuarios/${userId}`)
      setUsuario(res.data)

      if (res.data.comunidad_id) {
        const comunidadRes = await api.get(`/comunidades/${res.data.comunidad_id}`)
        setComunidad(comunidadRes.data)
      }
    } catch (error) {
      console.error("Error loading usuario:", error)
    }
  }

  const loadCompras = async () => {
    if (!userId) return

    try {
      const res = await api.get(`/compra/${userId}`)
      console.log("Respuesta completa de compras:", res) 
      console.log("Data de compras:", res.data) 

      if (res.data) {
        if (Array.isArray(res.data)) {
          setCompras(res.data)
          console.log("Compras cargadas como array:", res.data)
        }
        else if (res.data.compras && Array.isArray(res.data.compras)) {
          setCompras(res.data.compras)
          console.log("Compras cargadas desde res.data.compras:", res.data.compras)
        }
        else if (typeof res.data === "object" && res.data.compra_id) {
          setCompras([res.data])
          console.log("Compra única convertida a array:", [res.data])
        }
        else {
          console.log("Estructura de datos no reconocida:", res.data)
          setCompras([])
        }
      } else {
        console.log("No hay datos en la respuesta")
        setCompras([])
      }
    } catch (error) {
      console.error("Error loading compras:", error)
      setCompras([])
    }
  }

  const loadInformacion = async () => {
    if (!userId) return

    try {
      const res = await api.get(`/informacion/${userId}`)
      if (res.data && res.data.length > 0) {
        const info = res.data[0]
        setInformacion(info)
        setNombreCompleto(info.nombre_completo || "")
        setDireccionEnvio(info.direccion_envio || "")
        setExisteInformacion(true)
      } else {
        setExisteInformacion(false)
        setEditMode(true)
      }
    } catch (error) {
      console.log("Información no encontrada")
      setInformacion({})
      setExisteInformacion(false)
      setEditMode(true)
    }
  }

  const handleSaveInformation = async () => {
    if (!userId) {
      Alert.alert("Error", "No se ha proporcionado un ID de usuario válido")
      return
    }

    if (!nombreCompleto.trim() || !direccionEnvio.trim()) {
      Alert.alert("Error", "Por favor, completa todos los campos.")
      return
    }

    try {
      setLoading(true)

      if (!existeInformacion) {
        await api.post("/informacion", {
          user_id: userId,
          nombre_completo: nombreCompleto,
          direccion_envio: direccionEnvio,
        })

        await loadProfileData()
        Alert.alert("¡Perfecto!", "Tu información ha sido guardada correctamente.")
      } else {
        await api.put(`/informacion/${userId}`, {
          nombre_completo: nombreCompleto,
          direccion_envio: direccionEnvio,
        })

        await loadInformacion()
        Alert.alert("¡Actualizado!", "Tu información ha sido actualizada correctamente.")
      }

      setEditMode(false)
      setLoading(false)
    } catch (error) {
      console.error("Error saving information:", error)
      Alert.alert("Error", "No se pudo guardar la información. Inténtalo de nuevo.")
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadProfileData()
    setRefreshing(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const maskPassword = (password) => {
    return "•".repeat(8)
  }

  const renderCompraItem = ({ item, index }) => (
    <View style={[styles.compraItem, { marginLeft: index % 2 === 0 ? 0 : 8 }]}>
      <View style={styles.compraImageContainer}>
        {item.imagen_url ? (
          <Image source={{ uri: item.imagen_url }} style={styles.compraImage} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <FontAwesome name="shopping-bag" size={24} color="#FFD700" />
          </View>
        )}
      </View>
      <View style={styles.compraInfo}>
        <Text style={styles.compraTitle}>{item.producto_nombre}</Text>
        <Text style={styles.compraDescription} numberOfLines={2}>
          {item.descripcion}
        </Text>
        <View style={styles.compraFooter}>
          <Text style={styles.compraDate}>{formatDate(item.fecha)}</Text>
          <View style={styles.compraPuntosContainer}>
            <Text style={styles.compraPuntos}>{item.precio_puntos}</Text>
            <Text style={styles.compraCurrency}>🪙</Text>
          </View>
        </View>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    )
  }

  if (error || !userId) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <FontAwesome name="exclamation-triangle" size={50} color="#FFD700" />
        <Text style={styles.errorText}>{error || "Error al cargar el perfil"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Header más natural */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={18} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.titulo}>Mi Perfil</Text>
    
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Profile Header más orgánico */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <FontAwesome name="user" size={40} color="#FFD700" />
            </View>
            {usuario && (
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>¡Hola, {usuario.nombre}!</Text>
                <Text style={styles.subtitleText}>🍌 Fitness Warrior</Text>
              </View>
            )}
          </View>

          {/* Información Personal con diseño más natural */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>
              <FontAwesome name="user-circle" size={16} color="#FFD700" /> Información Personal
            </Text>

            {usuario && (
              <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                  <FontAwesome name="user" size={14} color="#FFD700" />
                  <Text style={styles.infoLabel}>Nombre</Text>
                  <Text style={styles.infoValue}>{usuario.nombre}</Text>
                </View>

                <View style={styles.infoItem}>
                  <FontAwesome name="envelope" size={14} color="#FFD700" />
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{usuario.email}</Text>
                </View>

                <View style={styles.infoItem}>
                  <FontAwesome name="lock" size={14} color="#FFD700" />
                  <Text style={styles.infoLabel}>Contraseña</Text>
                  <Text style={styles.infoValue}>{maskPassword(usuario.contraseña)}</Text>
                </View>

                {comunidad && (
                  <View style={styles.infoItem}>
                    <FontAwesome name="users" size={14} color="#FFD700" />
                    <Text style={styles.infoLabel}>Comunidad</Text>
                    <Text style={styles.infoValue}>
                      {comunidad.nombre} - {comunidad.pais}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Información de Envío */}
          <View style={styles.shippingSection}>
            <View style={styles.shippingSectionHeader}>
              <Text style={styles.sectionTitle}>
                <FontAwesome name="truck" size={16} color="#FFD700" /> Información de Envío
              </Text>
              {existeInformacion && (
                <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(!editMode)}>
                  <FontAwesome name={editMode ? "times" : "edit"} size={14} color="#FFD700" />
                </TouchableOpacity>
              )}
            </View>

            {editMode ? (
              <View style={styles.editContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nombre Completo</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tu nombre completo"
                    placeholderTextColor="#666"
                    value={nombreCompleto}
                    onChangeText={setNombreCompleto}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Dirección de Envío</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Tu dirección completa"
                    placeholderTextColor="#666"
                    value={direccionEnvio}
                    onChangeText={setDireccionEnvio}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSaveInformation}>
                  <FontAwesome name="check" size={16} color="#121212" />
                  <Text style={styles.saveButtonText}>{existeInformacion ? "Actualizar" : "Guardar"}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.shippingInfo}>
                {existeInformacion ? (
                  <>
                    <View style={styles.shippingItem}>
                      <FontAwesome name="user-o" size={14} color="#FFD700" />
                      <Text style={styles.shippingLabel}>Nombre:</Text>
                      <Text style={styles.shippingValue}>{informacion.nombre_completo}</Text>
                    </View>
                    <View style={styles.shippingItem}>
                      <FontAwesome name="map-marker" size={14} color="#FFD700" />
                      <Text style={styles.shippingLabel}>Dirección:</Text>
                      <Text style={styles.shippingValue}>{informacion.direccion_envio}</Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.emptyShipping}>
                    <FontAwesome name="plus-circle" size={32} color="#FFD700" />
                    <Text style={styles.emptyText}>Agrega tu información de envío</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Mis Pedidos */}
          <View style={styles.ordersSection}>
            <TouchableOpacity style={styles.ordersHeader} onPress={() => setShowOrders(!showOrders)}>
              <Text style={styles.sectionTitle}>
                <FontAwesome name="shopping-bag" size={16} color="#FFD700" /> Mis Pedidos ({compras.length})
              </Text>
              <FontAwesome name={showOrders ? "chevron-up" : "chevron-down"} size={16} color="#FFD700" />
            </TouchableOpacity>

            {showOrders && (
              <View style={styles.ordersContainer}>
                {compras.length > 0 ? (
                  <FlatList
                    data={compras}
                    renderItem={renderCompraItem}
                    keyExtractor={(item) => (item.compra_id ? item.compra_id.toString() : Math.random().toString())}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                  />
                ) : (
                  <View style={styles.emptyOrders}>
                    <FontAwesome name="shopping-cart" size={32} color="#FFD700" />
                    <Text style={styles.emptyText}>No tienes pedidos aún</Text>
                    <Text style={styles.emptySubtext}>¡Explora nuestra tienda!</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 1 : 1,
    paddingBottom: 15,
    backgroundColor: "#1A1A1A",
  },
  backButton: {
    padding: 8,
  },
  refreshButton: {
    padding: 8,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginRight: 132,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#121212",
    fontWeight: "600",
    fontSize: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#1E1E1E",
    padding: 20,
    borderRadius: 20,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitleText: {
    color: "#BBBBBB",
    fontSize: 14,
  },
  infoSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFD700",
    marginBottom: 15,
  },
  infoContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    padding: 15,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  infoLabel: {
    color: "#BBBBBB",
    fontSize: 14,
    marginLeft: 10,
    minWidth: 80,
  },
  infoValue: {
    color: "#FFFFFF",
    fontSize: 14,
    flex: 1,
    marginLeft: 10,
  },
  shippingSection: {
    marginBottom: 25,
  },
  shippingSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  editButton: {
    padding: 8,
    backgroundColor: "#2A2A2A",
    borderRadius: 15,
  },
  editContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    padding: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#2A2A2A",
    borderRadius: 10,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#121212",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 8,
  },
  shippingInfo: {
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    padding: 15,
  },
  shippingItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  shippingLabel: {
    color: "#BBBBBB",
    fontSize: 14,
    marginLeft: 10,
    minWidth: 70,
  },
  shippingValue: {
    color: "#FFFFFF",
    fontSize: 14,
    flex: 1,
    marginLeft: 10,
  },
  emptyShipping: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 10,
  },
  ordersSection: {
    marginBottom: 20,
  },
  ordersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  ordersContainer: {
    marginTop: 0,
  },
  compraItem: {
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
  },
  compraImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#2A2A2A",
    marginRight: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  compraImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  compraInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  compraTitle: {
    color: "#FFD700",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  compraDescription: {
    color: "#BBBBBB",
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  compraFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  compraDate: {
    color: "#888888",
    fontSize: 11,
  },
  compraPuntosContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compraPuntos: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "600",
    marginRight: 2,
  },
  compraCurrency: {
    fontSize: 10,
  },
  emptyOrders: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
  },
  emptySubtext: {
    color: "#888888",
    fontSize: 12,
    marginTop: 4,
  },
})

export default PerfilScreen
