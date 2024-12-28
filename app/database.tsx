import { FirebaseApp, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: 'AIzaSyCYg-5wWBsEQrQoru1nTrLjZNwIXadcHmM',
  authDomain: 'ustpappointmentsystem.firebase.app',
  projectId: 'ustpappointmentsystem',
  storageBucket: 'ustpappointmentsystem.firebasestorage.app',
  messagingSenderId: 'ustpappointmentsystem',
  appId: '1:84682061466:android:8a86b183c4d3f38e181123',
}

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig)

// Initialize Firebase Auth
const auth = getAuth(app)

export default auth
