"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import api from "../screens/api"

const { width } = Dimensions.get("window")
const COLUMN_WIDTH = (width - 48) / 2 // 48 = padding (16) * 2 + gap between columns (16)

const TiendaScreen = ({ userData, points, refreshing, onRefresh }) => {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const navigation = useNavigation()

  const fetchProductos = async () => {
    setLoading(true)
    try {
      const { data } = await api.get("/productos")
      setProductos(data)
    } catch (err) {
      console.error(err)
      Alert.alert("Error", "No se pudieron cargar los productos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductos()
  }, [])

  useEffect(() => {
    if (refreshing) {
      fetchProductos().then(() => onRefresh(false))
    }
  }, [refreshing])

  const handleComprar = (productoId) => {
    navigation.navigate('Pasarela', { 
      productoId: productoId,
      puntosDisponibles: points,  
      user_id: userData.id,
    });
  };
  
  

  const renderItem = ({ item, index }) => {
    const isLeftItem = index % 2 === 0

    return (
      <View
        style={[
          styles.card,
          {
            width: COLUMN_WIDTH,
            marginRight: isLeftItem ? 8 : 0,
            marginLeft: isLeftItem ? 0 : 8,
          },
        ]}
      >
        <View style={styles.imageContainer}>
          {item.imagen_url ? (
            <Image source={{ uri: item.imagen_url }} style={styles.imagenProducto} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>Sin imagen</Text>
            </View>
          )}
          <View style={styles.precioTag}>
            <Text style={styles.precioText}>🪙 {item.precio_puntos}</Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.nombre} numberOfLines={1} ellipsizeMode="tail">
            {item.nombre}
          </Text>
          <Text style={styles.descripcion} numberOfLines={2} ellipsizeMode="tail">
            {item.descripcion}
          </Text>

          <TouchableOpacity style={styles.boton} onPress={() => handleComprar(item.id)} activeOpacity={0.7}>
            <Text style={styles.botonTexto}>Comprar</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />


      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay productos disponibles</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

export default TiendaScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  titulo: {
    fontSize: 24,
    color: "#FFD700",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  monedasContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  monedasLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginRight: 8,
  },
  monedasBadge: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  monedasValue: {
    fontSize: 16,
    color: "#FFD700",
    fontWeight: "bold",
    marginRight: 4,
  },
  monedaIcon: {
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 140,
  },
  imagenProducto: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#666",
    fontSize: 14,
  },
  precioTag: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopLeftRadius: 8,
  },
  precioText: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 14,
  },
  infoContainer: {
    padding: 12,
  },
  nombre: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "bold",
    marginBottom: 4,
  },
  descripcion: {
    fontSize: 13,
    color: "#aaaaaa",
    marginBottom: 12,
    height: 36, // Altura fija para 2 líneas
  },
  boton: {
    backgroundColor: "#FFD700",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  botonTexto: {
    color: "#121212",
    fontWeight: "bold",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
})
