// src/screens/events/EventDetailScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';

const EventDetailScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [rsvpModalVisible, setRsvpModalVisible] = useState(false);
  const [rsvpForm, setRsvpForm] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const handleRSVP = () => {
    if (!rsvpForm.name || !rsvpForm.phone || !rsvpForm.email) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    
    console.log('RSVP Form:', rsvpForm);
    setRsvpModalVisible(false);
    Alert.alert('Success', 'Your RSVP has been registered!');
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView style={styles.scrollView}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        {/* Event Image */}
        <View style={styles.imageContainer}>
          {event.image ? (
            <Image source={{ uri: event.image }} style={styles.eventImage} />
          ) : (
            <View style={styles.placeholderImage} />
          )}
          <View style={styles.eventType}>
            <Text style={styles.eventTypeText}>{event.type}</Text>
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.temple}>{event.temple}</Text>
          
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Date & Time</Text>
            <Text style={styles.infoText}>{event.date} • {event.time}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Location</Text>
            <Text style={styles.infoText}>{event.location}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Description</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* RSVP Button */}
          <TouchableOpacity
            style={styles.rsvpButton}
            onPress={() => setRsvpModalVisible(true)}
          >
            <Text style={styles.rsvpButtonText}>RSVP Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* RSVP Modal */}
      <Modal
        visible={rsvpModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>RSVP for Event</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              value={rsvpForm.name}
              onChangeText={(text) => setRsvpForm({...rsvpForm, name: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={rsvpForm.phone}
              onChangeText={(text) => setRsvpForm({...rsvpForm, phone: text})}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={rsvpForm.email}
              onChangeText={(text) => setRsvpForm({...rsvpForm, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRsvpModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleRSVP}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  backButton: {
    position: 'absolute',
    top: spacing.m,
    left: spacing.m,
    zIndex: 1,
    backgroundColor: colors.background.main,
    borderRadius: 20,
    padding: spacing.s,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.text.primary,
  },
  imageContainer: {
    height: 250,
    backgroundColor: colors.background.tertiary,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.tertiary,
  },
  eventType: {
    position: 'absolute',
    top: spacing.m,
    right: spacing.m,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  eventTypeText: {
    color: colors.background.main,
    ...typography.body2,
    fontWeight: '600',
  },
  contentContainer: {
    padding: spacing.m,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  temple: {
    ...typography.subtitle1,
    color: colors.text.secondary,
    marginBottom: spacing.m,
  },
  infoSection: {
    marginBottom: spacing.m,
  },
  infoTitle: {
    ...typography.subtitle2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  description: {
    ...typography.body1,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  rsvpButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  rsvpButtonText: {
    color: colors.background.main,
    ...typography.subtitle1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background.main,
    borderRadius: 12,
    padding: spacing.m,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.m,
    marginBottom: spacing.m,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.m,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.m,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  cancelButton: {
    backgroundColor: colors.background.secondary,
  },
  cancelButtonText: {
    color: colors.text.primary,
    ...typography.subtitle2,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    color: colors.background.main,
    ...typography.subtitle2,
  },
});

export default EventDetailScreen;