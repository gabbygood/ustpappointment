import React, { useState } from 'react'
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from './(tabs)/database' // Ensure you import your Firestore config

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    try {
      // Sign in the user with Firebase Authentication
      const auth = getAuth()
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )
      const user = userCredential.user

      // Fetch user role from Firestore after successful login
      const userDoc = doc(db, 'users', user.uid) // Assuming you have a 'users' collection
      const userSnapshot = await getDoc(userDoc)

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data()
        const userRole = userData.role

        // Navigate based on role
        if (userRole === 'staff') {
          router.push('/(tabs)') // Navigate to staff-specific page
        } else if (userRole === 'student') {
          router.push('/(tabs)') // Navigate to student-specific page
        } else {
          setError('User role not found') // Handle unexpected roles
        }
      } else {
        setError('User not found in database')
      }
    } catch (err: any) {
      setError(err.message) // Handle any login errors
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior='padding'>
      <Text style={styles.title}>Welcome Back</Text>
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
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('/signup')}
        style={styles.link}
      >
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
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

export default Login
