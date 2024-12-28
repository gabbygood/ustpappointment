import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Replace these values with your Firebase project credentials
const firebaseConfig = {
  apiKey: 'AIzaSyCYg-5wWBsEQrQoru1nTrLjZNwIXadcHmM',
  authDomain: 'ustpappointmentsystem.firebase.app',
  projectId: 'ustpappointmentsystem',
  storageBucket: 'ustpappointmentsystem.firebasestorage.app',
  messagingSenderId: 'ustpappointmentsystem',
  appId: '1:84682061466:android:8a86b183c4d3f38e181123',
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig)

// Initialize Firestore database
export const db = getFirestore(app)
