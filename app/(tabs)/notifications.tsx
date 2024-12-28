import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './database' // Import your Firestore DB configuration
import { Ionicons } from '@expo/vector-icons'

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch notifications from Firestore
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'notifications'))

        const notificationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setNotifications(notificationsData)
        Alert.alert('Print', 'Print The Appointment Letter')
      } catch (error) {
        console.error('Error fetching notifications:', error)
        Alert.alert('Error', 'Failed to load notifications.')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const renderNotification = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.message}>{item.message}</Text>
      <TouchableOpacity
        style={styles.printButton}
        onPress={() =>
          Alert.alert('Print', 'You can now print the appointment letter')
        }
      >
        <Text style={styles.printButtonText}>Print</Text>
        <Ionicons name='print' size={20} color='#fff' />
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  list: {
    paddingBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#4CAF50',
    textAlign: 'center',
  },
  printButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  printButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
})

export default Notifications
