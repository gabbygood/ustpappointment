import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Button,
} from 'react-native'
import { getAuth, onAuthStateChanged, updateProfile } from 'firebase/auth'
import { useRouter } from 'expo-router'
import auth from '../database' // Assuming this is your Firebase initialization

const Profile = () => {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [newDisplayName, setNewDisplayName] = useState('')

  // Track the authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser) // Set the logged-in user
      } else {
        router.push('/') // Redirect to login if no user is logged in
      }
    })

    return () => unsubscribe()
  }, [])

  // Handle updating displayName
  const handleUpdateDisplayName = async () => {
    if (!newDisplayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty.')
      return
    }

    try {
      await updateProfile(auth.currentUser, { displayName: newDisplayName })
      setUser({ ...auth.currentUser, displayName: newDisplayName }) // Update local state
      setModalVisible(false) // Close the modal
      Alert.alert('Success', 'Display name updated successfully.')
    } catch (error) {
      console.error('Error updating display name:', error)
      Alert.alert('Error', 'Failed to update display name. Please try again.')
    }
  }

  // Handle logout
  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        Alert.alert('Logged Out', 'You have been successfully logged out.')
        router.push('/signup') // Redirect to the login screen
      })
      .catch((error) => {
        console.error('Logout error:', error)
        Alert.alert('Error', 'Failed to log out. Please try again.')
      })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {user ? (
        <>
          <Text style={styles.label}>Name: {user.displayName || 'N/A'}</Text>
          <Text style={styles.label}>Email: {user.email}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setModalVisible(true)
              setNewDisplayName(user.displayName || '')
            }}
          >
            <Text style={styles.editText}>Edit Name</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.label}>Loading user info...</Text>
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Modal for Editing Display Name */}
      <Modal visible={modalVisible} animationType='slide' transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Display Name</Text>
            <TextInput
              style={styles.input}
              placeholder='Enter new display name'
              value={newDisplayName}
              onChangeText={setNewDisplayName}
            />
            <View style={styles.buttonGroup}>
              <Button title='Save' onPress={handleUpdateDisplayName} />
              <Button
                title='Cancel'
                color='red'
                onPress={() => setModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, color: '#555', marginBottom: 10 },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#FF5A5F',
    padding: 15,
    borderRadius: 10,
  },
  logoutText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  editButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
  },
  editText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonGroup: { flexDirection: 'row', justifyContent: 'space-between' },
})

export default Profile
