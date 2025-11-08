import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { rapidsAPI } from '../services/api';

const getDifficultyColor = (difficulty) => {
  const colors = {
    'I': '#4ade80',
    'II': '#60a5fa',
    'III': '#fbbf24',
    'IV': '#fb923c',
    'IV+': '#f97316',
    'V': '#ef4444',
    'V+': '#dc2626',
    'VI': '#991b1b',
  };
  return colors[difficulty] || '#8b5cf6';
};

export default function MapScreen({ navigation }) {
  const [rapids, setRapids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [region, setRegion] = useState({
    latitude: 39.8283,
    longitude: -98.5795,
    latitudeDelta: 30,
    longitudeDelta: 30,
  });

  useEffect(() => {
    loadRapids();
  }, [selectedDifficulty]);

  const loadRapids = async () => {
    try {
      setLoading(true);
      const params = selectedDifficulty ? { difficulty: selectedDifficulty } : {};
      const response = await rapidsAPI.getAll(params);
      setRapids(response.data.rapids);
    } catch (error) {
      console.error('Error loading rapids:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadRapids();
      return;
    }

    try {
      setLoading(true);
      const response = await rapidsAPI.search(searchQuery);
      setRapids(response.data.results);
    } catch (error) {
      console.error('Error searching rapids:', error);
    } finally {
      setLoading(false);
    }
  };

  const difficulties = ['I', 'II', 'III', 'IV', 'IV+', 'V', 'V+'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌊 Whitewater Rapids</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search rapids or rivers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            data={difficulties}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.difficultyButton,
                  selectedDifficulty === item && styles.difficultyButtonActive,
                  { borderColor: getDifficultyColor(item) },
                ]}
                onPress={() =>
                  setSelectedDifficulty(selectedDifficulty === item ? '' : item)
                }
              >
                <Text
                  style={[
                    styles.difficultyButtonText,
                    selectedDifficulty === item && styles.difficultyButtonTextActive,
                  ]}
                >
                  Class {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      ) : (
        <MapView style={styles.map} region={region} onRegionChangeComplete={setRegion}>
          {rapids.map((rapid) => (
            <Marker
              key={rapid.id}
              coordinate={{
                latitude: rapid.latitude,
                longitude: rapid.longitude,
              }}
              pinColor={getDifficultyColor(rapid.difficulty)}
              onPress={() => navigation.navigate('RapidDetail', { rapidId: rapid.id })}
            >
              <View
                style={[
                  styles.markerContainer,
                  { backgroundColor: getDifficultyColor(rapid.difficulty) },
                ]}
              >
                <Text style={styles.markerText}>{rapid.difficulty}</Text>
              </View>
            </Marker>
          ))}
        </MapView>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {rapids.length} rapids {selectedDifficulty && `(Class ${selectedDifficulty})`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#667eea',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#764ba2',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  filterContainer: {
    marginTop: 10,
  },
  difficultyButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  difficultyButtonActive: {
    backgroundColor: '#f0f0f0',
  },
  difficultyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  difficultyButtonTextActive: {
    color: '#000',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});
