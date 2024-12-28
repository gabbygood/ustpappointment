import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

export default function Home() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to USTP Appointment System</Text>

      <Text style={styles.subtitle}>
        Schedule, manage, and confirm your appointments easily.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/appointments')}
      >
        <Text style={styles.buttonText}>Go to Appointments</Text>
        <Ionicons name='arrow-forward' size={20} color='#fff' />
      </TouchableOpacity>

      <Text style={styles.footer}>Developed by USTP | 2024</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    marginRight: 10,
  },
  footer: {
    fontSize: 12,
    color: '#888',
    position: 'absolute',
    bottom: 20,
    textAlign: 'center',
  },
})
