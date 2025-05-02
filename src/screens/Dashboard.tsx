// src/screens/Dashboard.tsx
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { printSample } from '../services/BrotherPrinter';


const Dashboard = () => {
  const { signOut, user } = useAuthenticator();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Dryclean POS Dashboard</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.welcomeText}>Welcome, {user?.username || 'User'}!</Text>
      </View>

      <View style={styles.menuGrid}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>New Order</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Pickup Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Inventory</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Reports</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.menuItem} onPress={printSample}>
        <Text style={styles.menuItemText}>Print Test</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2c3e50',
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  signOutText: {
    color: 'white',
    fontWeight: 'bold',
  },
  userInfo: {
    padding: 16,
    backgroundColor: '#ecf0f1',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  welcomeText: {
    fontSize: 18,
    color: '#2c3e50',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  menuItem: {
    width: '46%',
    backgroundColor: 'white',
    margin: '2%',
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
  },
});

export default Dashboard;