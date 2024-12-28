import React from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'

const Services = () => {
  const services = [
    { id: '1', name: 'Medical Consultation', description: 'Meet a doctor.' },
    { id: '2', name: 'IT Support', description: 'Resolve technical issues.' },
    {
      id: '3',
      name: 'Library Assistance',
      description: 'Help with library resources.',
    },
  ]

  const renderService = ({ item }: any) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Services</Text>
      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  name: { fontSize: 18, fontWeight: 'bold' },
  description: { fontSize: 14, color: '#555', marginTop: 5 },
  list: {
    paddingBottom: 20, // Adds some padding to the bottom to ensure all items are visible
  },
})
export default Services
