import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from './(tabs)/database' // Firebase initialization

const DetailedView = () => {
  const { id } = useLocalSearchParams() // Get the appointment ID from the route
  const [appointment, setAppointment] = useState(null)

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const docRef = doc(db, 'appointments', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setAppointment(docSnap.data())
        } else {
          console.error('No such document!')
        }
      } catch (error) {
        console.error('Error fetching appointment details:', error)
      }
    }

    fetchAppointment()
  }, [id])

  if (!appointment) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointment Details</Text>
      <Text style={styles.detail}>Date: {appointment.date}</Text>
      <Text style={styles.detail}>Time: {appointment.time}</Text>
      <Text style={styles.detail}>Status: {appointment.status}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  detail: { fontSize: 18, marginBottom: 10 },
})

export default DetailedView
