import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Button,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native'
import DatePicker from 'react-native-date-picker'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  getDoc,
  setDoc,
} from 'firebase/firestore'
import { db } from './database'
import { getAuth } from 'firebase/auth'
import * as FileSystem from 'expo-file-system'
import RNHTMLtoPDF from 'react-native-html-to-pdf'
import RNFS from 'react-native-fs'

const Appointments = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    date: new Date(),
    time: new Date(),
    attendees: '',
    location: '',
    subject: '',
    status: 'Upcoming',
  })
  const [userUID, setUserUID] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const router = useRouter()

  // Fetch the logged-in user's UID and role
  useEffect(() => {
    const auth = getAuth()
    const user = auth.currentUser
    if (user) {
      setUserUID(user.uid) // Set the user's UID

      const fetchUserRole = async () => {
        try {
          const userDocRef = query(
            collection(db, 'users'),
            where('uid', '==', user.uid)
          )
          const querySnapshot = await getDocs(userDocRef)

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data()
            console.log('Fetched user data:', userData) // Log the fetched data

            if (userData.role) {
              setUserRole(userData.role) // Set the user's role
            } else {
              console.log('No role found, setting default role')
              await setDoc(
                doc(db, 'users', user.uid),
                {
                  ...userData,
                  role: 'student', // Default role if not set
                },
                { merge: true }
              )
              setUserRole('student') // Set default role in the app
            }
          } else {
            Alert.alert('Error', 'User role not found.')
            router.push('/') // Redirect to login if user role is not found
          }
        } catch (error) {
          console.error('Error fetching user role:', error)
          Alert.alert('Error', 'Failed to fetch user role.')
        }
      }

      fetchUserRole()
    } else {
      router.push('/') // Redirect to login if no user is logged in
    }
  }, [])

  // Fetch appointments based on the user's role
  useEffect(() => {
    if (!userUID || !userRole) return

    const fetchAppointments = async () => {
      setLoading(true)
      try {
        let appointmentsQuery

        if (userRole === 'staff') {
          appointmentsQuery = query(collection(db, 'appointments'))
        } else if (userRole === 'student') {
          appointmentsQuery = query(
            collection(db, 'appointments'),
            where('userUID', '==', userUID)
          )
        }

        const querySnapshot = await getDocs(appointmentsQuery)
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setAppointments(data)
      } catch (error) {
        console.error('Error fetching appointments:', error)
        Alert.alert('Error', 'Failed to load appointments.')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [userUID, userRole])

  const resetNewAppointment = () => {
    setNewAppointment({
      date: new Date(),
      time: new Date(),
      attendees: '',
      location: '',
      subject: '',
      status: 'Upcoming',
    })
  }

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Permission to access Downloads folder',
            message:
              'We need access to your Downloads folder to save the appointment PDF.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permission granted')
        } else {
          console.log('Permission denied')
        }
      } catch (err) {
        console.warn(err)
      }
    }
  }

  const saveAppointment = async () => {
    if (!newAppointment.subject.trim()) {
      Alert.alert('Error', 'Please fill in the subject.')
      return
    }

    try {
      
      const formattedAppointment = {
        ...newAppointment,
        date: newAppointment.date.toDateString(),
        time: newAppointment.time.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        userUID,
        status: 'Pending'
      }
      

      const docRef = await addDoc(
        collection(db, 'appointments'),
        formattedAppointment
      )

      setAppointments((prev) => [
        ...prev,
        { id: docRef.id, ...formattedAppointment },
      ])
      setModalVisible(false)
      resetNewAppointment()
    } catch (error) {
      console.error('Error adding appointment:', error)
      Alert.alert('Error', 'Failed to save appointment. Please try again.')
    }
  }

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId)

      const appointmentDoc = await getDoc(appointmentRef)
      const appointmentData = appointmentDoc.data()

      if (!appointmentData) {
        Alert.alert('Error', 'Appointment not found.')
        return
      }
 

      await setDoc(appointmentRef, { status: 'Confirmed' }, { merge: true })
      setAppointments((prevAppointments) =>
        prevAppointments.map((appt) =>
          appt.id === appointmentId ? { ...appt, status: 'Confirmed' } : appt
        )
      )

      

      const notificationMessage = `Your appointment with subject "${
        appointmentData.subject
      }" on ${new Date(appointmentData.date).toLocaleDateString()} at ${
        appointmentData.time
      } has been confirmed. Please print the appointment letter`

      await addDoc(collection(db, 'notifications'), {
        userUID: appointmentData.userUID,
        message: notificationMessage,
        date: new Date().toISOString(),
        status: 'unread',
      })

      Alert.alert(
        'Appointment Confirmed',
        'The appointment has been confirmed.'
      )
    } catch (error) {
      console.error('Error confirming appointment:', error)
      Alert.alert(
        'Error',
        'Failed to confirm the appointment. Please try again.'
      )
    }
  }

  const handleCancel = async (id) => {
    try {
      await deleteDoc(doc(db, 'appointments', id))
      setAppointments((prev) => prev.filter((appt) => appt.id !== id))
    } catch (error) {
      console.error('Error deleting appointment:', error)
      Alert.alert(
        'Error',
        'Failed to cancel the appointment. Please try again.'
      )
    }
  }

  const generatePDF = async (appointment) => {
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #4CAF50; text-align: center; }
              p { font-size: 16px; line-height: 1.5; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
            </style>
          </head>
          <body>
            <h1>Appointment Letter</h1>
            <p><strong>Subject:</strong> ${appointment.subject}</p>
            <p><strong>Date:</strong> ${appointment.date}</p>
            <p><strong>Time:</strong> ${appointment.time}</p>
            <p><strong>Location:</strong> ${appointment.location}</p>
            <p><strong>Attendees:</strong> ${appointment.attendees}</p>
            <p class="footer">Status: Confirmed</p>
          </body>
        </html>
      `

      await requestPermissions()

      const downloadPath =
        RNFS.ExternalStorageDirectoryPath +
        '/Download/Appointment_' +
        appointment.id +
        '.pdf'

      const file = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: `Appointment_${appointment.id}`,
        directory: 'Documents',
      })

      await RNFS.moveFile(file.filePath, downloadPath)

      Alert.alert('PDF Saved', `PDF saved to: ${file.filePath}`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      Alert.alert('Error', 'Failed to generate PDF.')
    }
  }

  const renderAppointment = ({ item }) => {
    const statusStyle = {
      color: item.status === 'Pending' ? '#f44336' : '#4CAF50', // Red for Pending, Green for Confirmed
      fontWeight: 'bold',
    }

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/detailedview?id=${item.id}`)}
      >
        <Text style={styles.subject}>{item.subject}</Text>
        <Text style={styles.date}>Date: {item.date}</Text>
        <Text style={styles.time}>Time: {item.time}</Text>
        <Text style={styles.attendees}>Attendees: {item.attendees}</Text>
        <Text style={styles.location}>Location: {item.location}</Text>
        <Text style={[styles.status, statusStyle]}>Status: {item.status}</Text>

        {userRole === 'staff' && item.status === 'Pending' && (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => handleConfirmAppointment(item.id)}
          >
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        )}

        {item.status === 'Upcoming' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() =>
              Alert.alert(
                'Cancel Appointment',
                'Are you sure you want to cancel this appointment?',
                [
                  { text: 'No', style: 'cancel' },
                  { text: 'Yes', onPress: () => handleCancel(item.id) },
                ]
              )
            }
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}

        {userRole === 'student' && item.status === 'Confirmed' && (
          <TouchableOpacity
            style={styles.pdfButton}
            onPress={() => generatePDF(item)}
          >
            <Text style={styles.pdfText}>Generate PDF</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    )
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointments</Text>
      {loading ? (
        <ActivityIndicator size='large' color='#4CAF50' />
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
      {userRole === 'student' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name='add' size={24} color='#fff' />
        </TouchableOpacity>
      )}

      {/* Modal for Adding New Appointment */}
      <Modal visible={modalVisible} animationType='slide' transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Appointment</Text>

            <Text style={styles.label}>Date:</Text>
            <DatePicker
              date={newAppointment.date}
              onDateChange={(date) =>
                setNewAppointment({ ...newAppointment, date })
              }
              mode='date'
            />

            <Text style={styles.label}>Time:</Text>
            <DatePicker
              date={newAppointment.time}
              onDateChange={(time) =>
                setNewAppointment({ ...newAppointment, time })
              }
              mode='time'
            />

            <TextInput
              placeholder='Attendees'
              value={newAppointment.attendees}
              onChangeText={(text) =>
                setNewAppointment({ ...newAppointment, attendees: text })
              }
              style={styles.input}
            />

            <TextInput
              placeholder='Location'
              value={newAppointment.location}
              onChangeText={(text) =>
                setNewAppointment({ ...newAppointment, location: text })
              }
              style={styles.input}
            />

            <TextInput
              placeholder='Subject'
              value={newAppointment.subject}
              onChangeText={(text) =>
                setNewAppointment({ ...newAppointment, subject: text })
              }
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <Button title='Cancel' onPress={() => setModalVisible(false)} />
              <Button title='Save' onPress={saveAppointment} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
    marginTop: 15
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  subject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  date: {
    fontSize: 14,
    color: '#555',
  },
  time: {
    fontSize: 14,
    color: '#555',
  },
  attendees: {
    fontSize: 14,
    color: '#555',
  },
  location: {
    fontSize: 14,
    color: '#555',
  },
  status: {
    fontSize: 14,
    color: 'green',
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f44336',
    borderRadius: 5,
  },
  cancelText: {
    color: '#fff',
    textAlign: 'center',
  },
  confirmButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  confirmText: {
    color: '#fff',
    textAlign: 'center',
  },
  pdfButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  pdfText: {
    color: '#fff',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    marginTop: 10,
  },
  modalButtons: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
})

export default Appointments
