// src/screens/events/EventsScreen.js
import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';

// Dummy data for events
const DUMMY_EVENTS = [
  {
    id: '1',
    title: 'Mahashivratri Celebration',
    temple: 'Shiva Temple',
    date: '2025-03-08',
    time: '6:00 PM',
    location: 'Mumbai, Maharashtra',
    description: 'Join us for special Mahashivratri puja and celebrations. There will be bhajans, abhishekam, and prasad distribution.',
    type: 'Shiva',
    image: null, // Add image URL here
    rsvpCount: 128,
  },
  {
    id: '2',
    title: 'Krishna Janmashtami',
    temple: 'ISKCON Temple',
    date: '2025-08-15',
    time: '4:00 PM',
    location: 'Delhi',
    description: 'Grand celebration of Sri Krishna Janmashtami with cultural programs, bhajans, and midnight aarti.',
    type: 'ISKCON',
    image: null,
    rsvpCount: 256,
  },
  // Add more events...
];

const EventsScreen = ({ navigation }) => {
  const renderEvent = (event) => (
    <TouchableOpacity
      key={event.id}
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { event })}
    >
      <View style={styles.eventImageContainer}>
        {event.image ? (
          <Image source={{ uri: event.image }} style={styles.eventImage} />
        ) : (
          <View style={styles.placeholderImage} />
        )}
        <View style={styles.eventType}>
          <Text style={styles.eventTypeText}>{event.type}</Text>
        </View>
      </View>

      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventTemple}>{event.temple}</Text>
        <Text style={styles.eventDateTime}>{event.date} • {event.time}</Text>
        <Text style={styles.eventLocation}>{event.location}</Text>
        <View style={styles.rsvpContainer}>
          <Text style={styles.rsvpCount}>{event.rsvpCount} attending</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Religious Events</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {DUMMY_EVENTS.map(event => renderEvent(event))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background.main,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  eventCard: {
    backgroundColor: colors.background.main,
    marginHorizontal: spacing.m,
    marginTop: spacing.m,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventImageContainer: {
    height: 160,
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
  eventContent: {
    padding: spacing.m,
  },
  eventTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  eventTemple: {
    ...typography.subtitle1,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  eventDateTime: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  eventLocation: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  rsvpContainer: {
    marginTop: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rsvpCount: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default EventsScreen;