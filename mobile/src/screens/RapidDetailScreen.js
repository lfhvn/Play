import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { rapidsAPI, discussionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RapidDetailScreen({ route, navigation }) {
  const { rapidId } = route.params;
  const { isAuthenticated } = useAuth();
  const [rapid, setRapid] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });

  useEffect(() => {
    loadRapidData();
  }, [rapidId]);

  const loadRapidData = async () => {
    try {
      setLoading(true);
      const [rapidRes, discussionsRes] = await Promise.all([
        rapidsAPI.getById(rapidId),
        discussionsAPI.getByRapidId(rapidId),
      ]);
      setRapid(rapidRes.data);
      setDiscussions(discussionsRes.data.discussions);
    } catch (error) {
      console.error('Error loading rapid:', error);
      Alert.alert('Error', 'Failed to load rapid information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDiscussion = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to post discussions');
      return;
    }

    if (!newDiscussion.title || !newDiscussion.content) {
      Alert.alert('Error', 'Title and content are required');
      return;
    }

    try {
      await discussionsAPI.create({
        rapid_id: rapidId,
        ...newDiscussion,
      });
      setNewDiscussion({ title: '', content: '' });
      setShowNewDiscussion(false);
      loadRapidData();
      Alert.alert('Success', 'Discussion posted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to post discussion');
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'I': '#4ade80', 'II': '#60a5fa', 'III': '#fbbf24',
      'IV': '#fb923c', 'IV+': '#f97316', 'V': '#ef4444',
      'V+': '#dc2626', 'VI': '#991b1b',
    };
    return colors[difficulty] || '#8b5cf6';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  if (!rapid) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Rapid not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{rapid.name}</Text>
        <Text style={styles.river}>{rapid.river}</Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: getDifficultyColor(rapid.difficulty) }]}>
            <Text style={styles.badgeText}>Class {rapid.difficulty}</Text>
          </View>
          {rapid.permit_required && (
            <View style={styles.permitBadge}>
              <Text style={styles.permitText}>Permit Required</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{rapid.description}</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Length</Text>
            <Text style={styles.infoValue}>{rapid.length_miles} mi</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Gradient</Text>
            <Text style={styles.infoValue}>{rapid.gradient_fppm} ft/mi</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Season</Text>
            <Text style={styles.infoValue}>{rapid.season}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Flow Range</Text>
            <Text style={styles.infoValue}>
              {rapid.optimal_flow_min}-{rapid.optimal_flow_max} CFS
            </Text>
          </View>
        </View>

        {rapid.hazards && rapid.hazards.length > 0 && (
          <View style={[styles.section, styles.hazardsSection]}>
            <Text style={styles.hazardsTitle}>⚠️ Hazards</Text>
            {rapid.hazards.map((hazard, index) => (
              <Text key={index} style={styles.hazardItem}>• {hazard}</Text>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Access Notes</Text>
          <Text style={styles.description}>{rapid.access_notes}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.discussionHeader}>
            <Text style={styles.sectionTitle}>Discussions ({discussions.length})</Text>
            {isAuthenticated && (
              <TouchableOpacity
                style={styles.newDiscussionButton}
                onPress={() => setShowNewDiscussion(!showNewDiscussion)}
              >
                <Text style={styles.newDiscussionButtonText}>
                  {showNewDiscussion ? 'Cancel' : '+ New'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {showNewDiscussion && (
            <View style={styles.newDiscussionForm}>
              <TextInput
                style={styles.input}
                placeholder="Discussion Title"
                value={newDiscussion.title}
                onChangeText={(text) => setNewDiscussion({ ...newDiscussion, title: text })}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Share your beta, trip report, or ask questions..."
                value={newDiscussion.content}
                onChangeText={(text) => setNewDiscussion({ ...newDiscussion, content: text })}
                multiline
                numberOfLines={4}
              />
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmitDiscussion}>
                <Text style={styles.submitButtonText}>Post Discussion</Text>
              </TouchableOpacity>
            </View>
          )}

          {discussions.map((discussion) => (
            <View key={discussion.id} style={styles.discussionCard}>
              <Text style={styles.discussionTitle}>{discussion.title}</Text>
              <Text style={styles.discussionContent} numberOfLines={3}>
                {discussion.content}
              </Text>
              <View style={styles.discussionMeta}>
                <Text style={styles.discussionAuthor}>{discussion.username || 'Anonymous'}</Text>
                <Text style={styles.discussionReplies}>{discussion.reply_count} replies</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  river: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 15,
  },
  badges: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '600',
  },
  permitBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  permitText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 25,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  hazardsSection: {
    backgroundColor: '#fef2f2',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fecaca',
  },
  hazardsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 10,
  },
  hazardItem: {
    fontSize: 14,
    color: '#7f1d1d',
    marginBottom: 5,
  },
  discussionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  newDiscussionButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newDiscussionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  newDiscussionForm: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#667eea',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  discussionCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  discussionContent: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 10,
  },
  discussionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  discussionAuthor: {
    fontSize: 12,
    color: '#6b7280',
  },
  discussionReplies: {
    fontSize: 12,
    color: '#6b7280',
  },
});
