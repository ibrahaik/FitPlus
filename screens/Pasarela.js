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
} from "react-native"
import { FontAwesome } from "@expo/vector-icons"
import api from "./api"

const { width } = Dimensions.get("window")
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

const PasarelaScreen = ({ route, navigation }) => {
  const { productoId, puntosDisponibles, user_id } = route.params

  const [producto, setProducto] = useState(null)
  const [direccion, setDireccion] = useState("")
  const [nombre, setNombre] = useState("")
  const [puntos, setPuntos] = useState(puntosDisponibles)
  const [loading, setLoading] = useState(true)
  const [existeInformacion, setExisteInformacion] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0]
  const scaleAnim = useState(new Animated.Value(0.95))[0]

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const productoRes = await api.get(`/productos/${productoId}`)
        setProducto(productoRes.data)

        const infoRes = await api.get(`/informacion/${user_id}`)
        if (infoRes.data && infoRes.data.length > 0) {
          const info = infoRes.data[0]
          setNombre(info.nombre_completo)
          setDireccion(info.direccion_envio)
          setExisteInformacion(true)
        }
      } catch (error) {
        console.log("Información no encontrada, el usuario puede rellenar los datos.")
        setExisteInformacion(false)
      } finally {
        setLoading(false)

        // Animate content appearing
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start()
      }
    }

    fetchDatos()
  }, [productoId, user_id])

  const handlePagar = async () => {
    if (!direccion.trim() || !nombre.trim()) {
      Alert.alert("Error", "Por favor, completa tu nombre y dirección de envío.")
      return
    }

    if (puntos < producto.precio_puntos) {
      Alert.alert("Error", "No tienes suficientes puntos para completar la compra.")
      return
    }

    setProcessingPayment(true)

    try {
      if (!existeInformacion) {
        await api.post("/informacion", {
          usuario_id: user_id,
          nombre_completo: nombre,
          direccion_envio: direccion,
        })
      }

      await api.post("/compra", {
        usuario_id: user_id,
        producto_id: productoId,
      })

      setProcessingPayment(false)
      Alert.alert("¡Compra exitosa!", "Tu pedido se ha realizado correctamente y pronto estará en camino.")
      navigation.goBack()
    } catch (error) {
      setProcessingPayment(false)
      console.error("Error en la compra:", error)
      Alert.alert("Error", "Hubo un problema al procesar tu pedido. Inténtalo de nuevo.")
    }
  }

  const renderPaymentButton = () => {
    const canPay = puntos >= (producto?.precio_puntos || 0)

    return (
      <AnimatedTouchable
        style={[styles.botonPagar, !canPay && styles.botonDeshabilitado, { transform: [{ scale: scaleAnim }] }]}
        onPress={handlePagar}
        disabled={!canPay || processingPayment}
        activeOpacity={0.8}
      >
        {processingPayment ? (
          <View style={styles.loadingButton}>
            <ActivityIndicator size="small" color="#121212" />
            <Text style={[styles.botonTexto, { marginLeft: 10 }]}>Procesando...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.botonTexto}>{canPay ? "Confirmar Compra" : "Puntos Insuficientes"}</Text>
            <FontAwesome
              name={canPay ? "check-circle" : "times-circle"}
              size={20}
              color="#121212"
              style={styles.buttonIcon}
            />
          </>
        )}
      </AnimatedTouchable>
    )
  }

  if (loading || !producto) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Preparando tu compra...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={20} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.titulo}>Finalizar Compra</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Product Card */}
          <View style={styles.productCard}>
            <View style={styles.imageContainer}>
              {producto.imagen_url ? (
                <Image source={{ uri: producto.imagen_url }} style={styles.imagen} resizeMode="cover" />
              ) : (
                <View style={styles.placeholderImage}>
                  <FontAwesome name="image" size={40} color="#333" />
                </View>
              )}
            </View>

            <View style={styles.productInfo}>
              <Text style={styles.productoNombre}>{producto.nombre}</Text>
              <View style={styles.priceTag}>
                <Text style={styles.precio}>{producto.precio_puntos}</Text>
                <Text style={styles.precioCurrency}>🪙</Text>
              </View>
              <Text style={styles.descripcion}>{producto.descripcion}</Text>
            </View>
          </View>

          {/* Shipping Information */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="truck" size={18} color="#FFD700" />
              <Text style={styles.sectionTitle}>Información de Envío</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre Completo</Text>
              <View style={styles.inputContainer}>
                <FontAwesome name="user" size={18} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa nombre y apellidos"
                  placeholderTextColor="#666"
                  value={nombre}
                  onChangeText={setNombre}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dirección de Envío</Text>
              <View style={styles.inputContainer}>
                <FontAwesome name="map-marker" size={18} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu dirección completa"
                  placeholderTextColor="#666"
                  value={direccion}
                  onChangeText={setDireccion}
                  multiline
                />
              </View>
            </View>
          </View>

          {/* Payment Summary */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="credit-card" size={18} color="#FFD700" />
              <Text style={styles.sectionTitle}>Resumen de Pago</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Precio del producto</Text>
              <View style={styles.summaryValue}>
                <Text style={styles.summaryValueText}>{producto.precio_puntos}</Text>
                <Text style={styles.summaryCurrency}>🪙</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Puntos disponibles</Text>
              <View style={styles.summaryValue}>
                <Text
                  style={[styles.summaryValueText, puntos < producto.precio_puntos ? styles.insufficientPoints : null]}
                >
                  {puntos}
                </Text>
                <Text style={styles.summaryCurrency}>🪙</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total a pagar</Text>
              <View style={styles.totalValue}>
                <Text style={styles.totalValueText}>{producto.precio_puntos}</Text>
                <Text style={styles.totalCurrency}>🪙</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Fixed Payment Button */}
      <View style={styles.bottomContainer}>{renderPaymentButton()}</View>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 10,
    backgroundColor: "#1A1A1A",
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  backButton: {
    padding: 10,
  },
  placeholder: {
    width: 40,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: 16,
  },
  productCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#2A2A2A",
  },
  imagen: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    padding: 16,
  },
  productoNombre: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  priceTag: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  precio: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD700",
    marginRight: 4,
  },
  precioCurrency: {
    fontSize: 20,
  },
  descripcion: {
    fontSize: 14,
    color: "#BBBBBB",
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#BBBBBB",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3A3A3A",
    overflow: "hidden",
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#BBBBBB",
  },
  summaryValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryValueText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginRight: 4,
  },
  summaryCurrency: {
    fontSize: 14,
  },
  insufficientPoints: {
    color: "#FF6B6B",
  },
  divider: {
    height: 1,
    backgroundColor: "#2A2A2A",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  totalValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalValueText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD700",
    marginRight: 4,
  },
  totalCurrency: {
    fontSize: 18,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1A1A1A",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  botonPagar: {
    backgroundColor: "#FFD700",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  botonDeshabilitado: {
    backgroundColor: "#3A3A3A",
  },
  botonTexto: {
    color: "#121212",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  buttonIcon: {
    marginLeft: 8,
  },
  loadingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
})

export default PasarelaScreen
