"use client"

import React, { useEffect, useState, useRef } from "react"
import { SafeAreaView, StatusBar, DrawerLayoutAndroid, Platform, StyleSheet, BackHandler } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import api from "./api"

// Componentes modulares
import HomeHeader from "../components/HomeHeader"
import TabNavigator from "../components/TabNavigator"
import DrawerMenu from "../components/DrawerMenu"
import AdminContent from "../components/AdminContent"
import HomeContent from "../components/HomeContent"
import TiendaContent from "../components/TiendaContent"
import LoadingScreen from "../components/LoadingScreen"
import ErrorScreen from "../components/ErrorScreen"

const Home = () => {
  const [userData, setUserData] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [points, setPoints] = useState(0)
  const [loadingPoints, setLoadingPoints] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const [refreshing, setRefreshing] = useState(false)
  const [isDrawerMounted, setIsDrawerMounted] = useState(false)

  const drawerRef = useRef(null)
  const navigation = useNavigation()
  const isFocused = useRef(false)

  // Refrescar datos cuando la pantalla obtiene el foco
  useFocusEffect(
    React.useCallback(() => {
      isFocused.current = true
      refreshData()

      // Importante: Reiniciar el estado del drawer cuando la pantalla obtiene el foco
      if (Platform.OS === "android") {
        // Pequeño retraso para asegurar que el componente esté completamente montado
        setTimeout(() => {
          setIsDrawerMounted(true)
        }, 100)
      }

      // Manejar el botón de retroceso en Android
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
        if (drawerRef.current && drawerRef.current.state.drawerShown) {
          drawerRef.current.closeDrawer()
          return true // Prevenir el comportamiento por defecto
        }
        return false
      })

      return () => {
        isFocused.current = false
        backHandler.remove()
        // Desmontar el drawer cuando la pantalla pierde el foco
        if (Platform.OS === "android") {
          setIsDrawerMounted(false)
        }
      }
    }, []),
  )

  const refreshData = async () => {
    setRefreshing(true)
    await fetchUserData()
    setRefreshing(false)
  }

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token")
      if (!token) {
        throw new Error("No hay token disponible")
      }

      // Obtener datos del usuario
      const { data: user } = await api.get("/usuarios/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUserData(user)

      // Obtener puntos
      setLoadingPoints(true)
      const { data: balance } = await api.get(`/puntos/balance/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPoints(balance.total_puntos)
    } catch (error) {
      console.error("Error al obtener datos:", error)
    } finally {
      setLoadingUser(false)
      setLoadingPoints(false)
    }
  }

  useEffect(() => {
    fetchUserData()

    // Inicializar el estado del drawer
    if (Platform.OS === "android") {
      setIsDrawerMounted(true)
    }

    return () => {
      if (Platform.OS === "android") {
        setIsDrawerMounted(false)
      }
    }
  }, [])

  // Cambiar la pestaña activa
  const changeTab = (tab) => {
    setActiveTab(tab)
  }

  // Abrir el drawer
  const openDrawer = () => {
    if (drawerRef.current) {
      drawerRef.current.openDrawer()
    }
  }

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token")
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  if (loadingUser) {
    return <LoadingScreen />
  }

  if (!userData) {
    return <ErrorScreen onRetry={() => setLoadingUser(true)} />
  }

  // Renderizar el contenido principal
  const renderContent = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <HomeHeader userData={userData} points={points} loadingPoints={loadingPoints} onMenuPress={openDrawer} />

      {userData.rol !== "admin" && <TabNavigator activeTab={activeTab} onChangeTab={changeTab} />}

      {userData.rol === "admin" ? (
        <AdminContent userData={userData} navigation={navigation} refreshing={refreshing} onRefresh={refreshData} />
      ) : activeTab === "home" ? (
        <HomeContent userData={userData} navigation={navigation} refreshing={refreshing} onRefresh={refreshData} />
      ) : (
        <TiendaContent userData={userData} points={points} refreshing={refreshing} onRefresh={refreshData} />
      )}
    </SafeAreaView>
  )

  // En Android, usar DrawerLayoutAndroid
  if (Platform.OS === "android") {
    // Importante: Solo renderizar el drawer cuando isDrawerMounted es true
    if (!isDrawerMounted) {
      return renderContent()
    }

    return (
      <DrawerLayoutAndroid
        ref={drawerRef}
        drawerWidth={280}
        drawerPosition="left"
        renderNavigationView={() => (
          <DrawerMenu
            userData={userData}
            points={points}
            onProfilePress={() => {
              if (drawerRef.current) {
                drawerRef.current.closeDrawer()
              }
              navigation.navigate("Perfil", { userId: userData?.id })
            }}
            onLogoutPress={handleLogout}
          />
        )}
      >
        {renderContent()}
      </DrawerLayoutAndroid>
    )
  }

  // En iOS, implementar un drawer personalizado (simplificado)
  return renderContent()
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
})

export default Home
