// src/screens/groups/GroupsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';

// Dummy data for groups
const DUMMY_GROUPS = [
  {
    id: '1',
    name: 'Bhagavad Gita Study Circle',
    description: 'Daily discussion and learning of Bhagavad Gita teachings',
    members: 1240,
    type: 'Study',
    isPrivate: false,
    location: 'Mumbai',
    image: null,
  },
  {
    id: '2',
    name: 'ISKCON Youth Forum',
    description: 'A community for young devotees to connect and organize events',
    members: 2800,
    type: 'Community',
    isPrivate: false,
    location: 'Delhi',
    image: null,
  },
  {
    id: '3',
    name: 'Vedic Mathematics',
    description: 'Learn and discuss ancient Indian mathematical techniques',
    members: 850,
    type: 'Education',
    isPrivate: true,
    location: 'Bangalore',
    image: null,
  },
];

const GROUP_TYPES = ['All', 'Study', 'Community', 'Education', 'Meditation', 'Temple'];

const GroupsScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const filteredGroups = DUMMY_GROUPS.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = selectedType === 'All' || group.type === selectedType;
    return matchesSearch && matchesType;
  });

  const renderGroup = (group) => (
    <TouchableOpacity
      key={group.id}
      style={styles.groupCard}
      onPress={() => navigation.navigate('GroupDetail', { group })}
    >
      <View style={styles.groupImageContainer}>
        {group.image ? (
          <Image source={{ uri: group.image }} style={styles.groupImage} />
        ) : (
          <View style={styles.placeholderImage} />
        )}
      </View>

      <View style={styles.groupContent}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupName}>{group.name}</Text>
          {group.isPrivate && (
            <View style={styles.privateBadge}>
              <Text style={styles.privateBadgeText}>Private</Text>
            </View>
          )}
        </View>

        <Text style={styles.groupDescription} numberOfLines={2}>
          {group.description}
        </Text>

        <View style={styles.groupFooter}>
          <Text style={styles.memberCount}>{group.members} members</Text>
          <Text style={styles.groupType}>{group.type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Groups</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateGroup')}
        >
          <Text style={styles.createButtonText}>+ Create Group</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search groups..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Type Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {GROUP_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              selectedType === type && styles.filterButtonActive
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedType === type && styles.filterButtonTextActive
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Groups List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {filteredGroups.map(group => renderGroup(group))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background.main,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.primary,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 20,
  },
  createButtonText: {
    color: colors.background.main,
    fontWeight: '600',
  },
  searchContainer: {
    padding: spacing.m,
    backgroundColor: colors.background.main,
  },
  searchInput: {
    backgroundColor: colors.background.secondary,
    padding: spacing.m,
    borderRadius: 8,
    fontSize: 16,
  },
  filterContainer: {
    padding: spacing.m,
    backgroundColor: colors.background.main,
  },
  filterButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 20,
    marginRight: spacing.s,
    backgroundColor: colors.background.secondary,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  filterButtonTextActive: {
    color: colors.background.main,
  },
  groupCard: {
    backgroundColor: colors.background.main,
    marginHorizontal: spacing.m,
    marginTop: spacing.m,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  groupImageContainer: {
    width: 100,
    height: 100,
    backgroundColor: colors.background.tertiary,
  },
  groupImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.tertiary,
  },
  groupContent: {
    flex: 1,
    padding: spacing.m,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  groupName: {
    ...typography.subtitle1,
    flex: 1,
  },
  privateBadge: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginLeft: spacing.s,
  },
  privateBadgeText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  groupDescription: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.s,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCount: {
    ...typography.body2,
    color: colors.text.tertiary,
  },
  groupType: {
    ...typography.body2,
    color: colors.primary,
  },
});

export default GroupsScreen;