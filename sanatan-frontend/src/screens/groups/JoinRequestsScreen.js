// src/screens/groups/JoinRequestsScreen.js
import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,  // Add this
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';

// Dummy data for join requests
const DUMMY_REQUESTS = [
  {
    id: '1',
    name: 'Amit Sharma',
    requestDate: '2024-02-20',
    message: 'I would love to join and learn more about spirituality.',
    image: null,
  },
  {
    id: '2',
    name: 'Priya Patel',
    requestDate: '2024-02-21',
    message: 'Looking forward to being part of this spiritual community.',
    image: null,
  },
  {
    id: '3',
    name: 'Rahul Verma',
    requestDate: '2024-02-22',
    message: 'Interested in participating in group discussions and events.',
    image: null,
  },
  {
    id: '4',
    name: 'Neha Singh',
    requestDate: '2024-02-22',
    message: 'Would like to connect with like-minded spiritual seekers.',
    image: null,
  }
];

const JoinRequestsScreen = ({ navigation }) => {
  const renderRequest = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestInfo}>
        <View style={styles.userAvatar} />
        <View style={styles.requestDetails}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.requestMessage}>{item.message}</Text>
          <Text style={styles.requestDate}>Requested on {item.requestDate}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => {
            // Handle accept
            Alert.alert('Success', 'Request accepted');
          }}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => {
            Alert.alert(
              'Decline Request',
              'Are you sure you want to decline this request?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Decline',
                  style: 'destructive',
                  onPress: () => console.log('Request declined:', item.id)
                }
              ]
            );
          }}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Join Requests</Text>
      </View>

      <FlatList
        data={DUMMY_REQUESTS}
        renderItem={renderRequest}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.m,
    padding: spacing.xs,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.text.primary,
  },
  headerTitle: {
    ...typography.h2,
    flex: 1,
  },
  listContent: {
    padding: spacing.m,
  },
  requestCard: {
    backgroundColor: colors.background.main,
    borderRadius: 8,
    marginBottom: spacing.m,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requestInfo: {
    flexDirection: 'row',
    marginBottom: spacing.m,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.background.tertiary,
    marginRight: spacing.m,
  },
  requestDetails: {
    flex: 1,
  },
  userName: {
    ...typography.subtitle1,
    marginBottom: spacing.xs,
  },
  requestMessage: {
    ...typography.body1,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  requestDate: {
    ...typography.body2,
    color: colors.text.tertiary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.s,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  acceptButton: {
    backgroundColor: colors.primary,
  },
  declineButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  acceptButtonText: {
    ...typography.subtitle2,
    color: colors.background.main,
  },
  declineButtonText: {
    ...typography.subtitle2,
    color: colors.text.primary,
  }
});

export default JoinRequestsScreen;