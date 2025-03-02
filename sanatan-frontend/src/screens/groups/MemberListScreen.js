// src/screens/groups/MemberListScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';

// Dummy data for members
const DUMMY_MEMBERS = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    role: 'admin',
    joinDate: '2024-01-15',
    image: null,
  },
  {
    id: '2',
    name: 'Priya Singh',
    role: 'moderator',
    joinDate: '2024-02-01',
    image: null,
  },
  {
    id: '3',
    name: 'Amit Sharma',
    role: 'member',
    joinDate: '2024-02-15',
    image: null,
  },
  {
    id: '4',
    name: 'Neha Patel',
    role: 'member',
    joinDate: '2024-02-20',
    image: null,
  },
];

const MemberListScreen = ({ route, navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { group, isAdmin } = route.params;

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return colors.primary;
      case 'moderator':
        return '#5B8AF5';
      default:
        return colors.text.secondary;
    }
  };

  const handleRoleChange = (memberId, newRole) => {
    Alert.alert(
      'Change Role',
      'Are you sure you want to change this member\'s role?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm',
          onPress: () => console.log('Role changed:', memberId, newRole)
        }
      ]
    );
  };

  const renderMember = ({ item }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <View style={styles.memberAvatar} />
        <View>
          <Text style={styles.memberName}>{item.name}</Text>
          <Text style={[styles.memberRole, { color: getRoleColor(item.role) }]}>
            {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
          </Text>
          <Text style={styles.joinDate}>Joined {item.joinDate}</Text>
        </View>
      </View>

      {isAdmin && item.role !== 'admin' && (
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => {
            Alert.alert(
              'Member Options',
              'Choose an action',
              [
                { 
                  text: 'Make Admin',
                  onPress: () => handleRoleChange(item.id, 'admin')
                },
                { 
                  text: 'Make Moderator',
                  onPress: () => handleRoleChange(item.id, 'moderator')
                },
                { 
                  text: 'Remove from Group',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert(
                      'Remove Member',
                      'Are you sure you want to remove this member?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Remove',
                          style: 'destructive',
                          onPress: () => console.log('Member removed:', item.id)
                        }
                      ]
                    );
                  }
                },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          }}
        >
          <Text style={styles.moreButtonText}>•••</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const filteredMembers = DUMMY_MEMBERS.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
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
        <Text style={styles.headerTitle}>Members</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search members..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor={colors.text.tertiary}
      />

      <FlatList
        data={filteredMembers}
        renderItem={renderMember}
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
  searchInput: {
    margin: spacing.m,
    padding: spacing.m,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    ...typography.body1,
  },
  listContent: {
    padding: spacing.m,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.m,
    backgroundColor: colors.background.main,
    borderRadius: 8,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.background.tertiary,
    marginRight: spacing.m,
  },
  memberName: {
    ...typography.subtitle1,
    marginBottom: spacing.xs,
  },
  memberRole: {
    ...typography.body2,
    marginBottom: spacing.xs,
  },
  joinDate: {
    ...typography.body2,
    color: colors.text.tertiary,
  },
  moreButton: {
    padding: spacing.s,
  },
  moreButtonText: {
    fontSize: 20,
    color: colors.text.secondary,
  }
});

export default MemberListScreen;