import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TabNavigator = ({ activeTab, onChangeTab }) => {
  return (
    <View style={styles.tabsContainer}>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'home' && styles.activeTabButton]}
        onPress={() => onChangeTab('home')}
      >
        <Ionicons name="home" size={20} color={activeTab === 'home' ? "#FFD700" : "#999"} />
        <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>
          Inicio
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'tienda' && styles.activeTabButton]}
        onPress={() => onChangeTab('tienda')}
      >
        <Ionicons name="cart" size={20} color={activeTab === 'tienda' ? "#FFD700" : "#999"} />
        <Text style={[styles.tabText, activeTab === 'tienda' && styles.activeTabText]}>
          Tienda
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#252525',
  },
  tabText: {
    color: '#999',
    marginLeft: 6,
    fontSize: 14,
  },
  activeTabText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
});

export default TabNavigator;