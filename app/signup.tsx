import React, { useState, useEffect } from 'react'
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { db } from './(tabs)/database' // Make sure to import your Firestore config

// List of staff emails
const staffEmails = [
  'gabriellegoylan@gmail.com',
  'johnsmith@example.com', // Add more staff emails here
  'janedoe@example.com',
]

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student') // Default role is 'student'
  const [error, setError] = useState('')
  const router = useRouter()

  // Check if the email is in the staff email list
  useEffect(() => {
    if (staffEmails.includes(email)) {
      setRole('staff') // Set the role to 'staff' for a staff email
    } else {
      setRole('student') // Set the role to 'student' for other emails
    }
  }, [email])

  const handleSignup = async () => {
    try {
      // Create a new user with Firebase Authentication
      const auth = getAuth()
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      const user = userCredential.user

      // Save user details and role in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: role, // Store the role (either 'staff' or 'student')
        displayName: user.displayName || 'N/A',
        uid: user.uid, // Ensure the UID is stored in the Firestore document
      })

      // Redirect to login after successful signup
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior='padding'>
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        style={styles.input}
        placeholder='Email'
        placeholderTextColor='#aaa'
        value={email}
        onChangeText={setEmail}
        keyboardType='email-address'
        autoCapitalize='none'
      />
      <TextInput
        style={styles.input}
        placeholder='Password'
        placeholderTextColor='#aaa'
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* No Role Selector: The role is automatically set based on email */}
      <Text style={styles.roleText}>
        Role: {role === 'staff' ? 'Staff' : 'Student'}
      </Text>

      {/* Display error message if there is an error */}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Link to Login page */}
      <TouchableOpacity onPress={() => router.push('/')} style={styles.link}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  roleText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    marginTop: 20,
  },
  linkText: {
    color: '#4CAF50',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'center',
  },
})

export default Signup
