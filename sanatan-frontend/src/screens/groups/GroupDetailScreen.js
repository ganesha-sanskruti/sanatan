// src/screens/groups/GroupDetailScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';

const GroupDetailScreen = ({ route, navigation }) => {
  const { group } = route.params;
  const [isMember, setIsMember] = useState(false);

    //   With isAdmin = false (regular member):
// Can only view members
// Can only view rules
// Can join/leave group
// Cannot modify rules
// Cannot manage other members
     // With isAdmin = true:
// Can edit group rules
// Can manage members (make admin, moderator, remove)
// Can see join requests
// Can access group settings
// Has all regular member features too

  const [isAdmin] = useState(false); // For testing, you can change to true

  const [memberCount, setMemberCount] = useState(group.members);

  const handleJoinLeave = () => {
    if (group.isPrivate && !isMember) {
      Alert.alert(
        'Request to Join',
        'This is a private group. Would you like to send a join request?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Send Request',
            onPress: () => {
              Alert.alert(
                'Request Sent',
                'The group administrators will review your request.'
              );
            },
          },
        ]
      );
    } else {
      if (isMember) {
        Alert.alert(
          'Leave Group',
          'Are you sure you want to leave this group?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Leave',
              style: 'destructive',
              onPress: () => {
                setIsMember(false);
                setMemberCount(prev => prev - 1);
                Alert.alert('Success', 'You have left the group');
              },
            },
          ]
        );
      } else {
        setIsMember(true);
        setMemberCount(prev => prev + 1);
        Alert.alert('Welcome!', 'You have successfully joined the group');
      }
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView}>
        {/* Group Image */}
        <View style={styles.imageContainer}>
          {group.image ? (
            <Image source={{ uri: group.image }} style={styles.groupImage} />
          ) : (
            <View style={styles.placeholderImage} />
          )}
        </View>

        {/* Group Details */}
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.groupName}>{group.name}</Text>
            {group.isPrivate && (
              <View style={styles.privateBadge}>
                <Text style={styles.privateBadgeText}>Private Group</Text>
              </View>
            )}
          </View>

          <Text style={styles.memberCount}>{memberCount} members • {group.type}</Text>
          <Text style={styles.location}>{group.location}</Text>

          {/* Membership Status */}
          {isMember && (
            <View style={styles.membershipStatus}>
              <Text style={styles.membershipText}>
              {isAdmin ? "You're an admin" : "You're a member"}
              </Text>
            </View>
          )}

          {/* Main Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[
                styles.actionButton,
                isMember ? styles.leaveButton : styles.joinButton
              ]}
              onPress={handleJoinLeave}
            >
              <Text style={[
                styles.actionButtonText,
                isMember && styles.leaveButtonText
              ]}>
                {isMember ? 'Leave Group' : group.isPrivate ? 'Request to Join' : 'Join Group'}
              </Text>
            </TouchableOpacity>

            {isMember && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.inviteButton]}
                onPress={() => Alert.alert('Invite', 'Invite feature coming soon!')}
              >
                <Text style={styles.inviteButtonText}>Invite Members</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>About This Group</Text>
            <Text style={styles.description}>{group.description}</Text>
          </View>

          {/* Admin/Member Actions */}
          {(isMember || isAdmin) && (
            <View style={styles.memberActions}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('MemberList', { group, isAdmin })}
              >
                <Text style={styles.actionCardTitle}>Members</Text>
                <Text style={styles.actionCardSubtitle}>View all members</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('GroupPosts', { group, isAdmin })}
              >
                <Text style={styles.actionCardTitle}>Posts</Text>
                <Text style={styles.actionCardSubtitle}>View group discussions</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('GroupRules', { group, isAdmin })}
              >
                <Text style={styles.actionCardTitle}>Rules</Text>
                <Text style={styles.actionCardSubtitle}>Group guidelines</Text>
              </TouchableOpacity>

              {isAdmin && (
                <>
                  <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('JoinRequests', { group })}
                  >
                    <Text style={styles.actionCardTitle}>Requests</Text>
                    <Text style={styles.actionCardSubtitle}>Manage join requests</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => Alert.alert('Settings', 'Group settings coming soon!')}
                  >
                    <Text style={styles.actionCardTitle}>Settings</Text>
                    <Text style={styles.actionCardSubtitle}>Manage group settings</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>
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
    height: 200,
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
  contentContainer: {
    padding: spacing.m,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  groupName: {
    ...typography.h2,
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
  memberCount: {
    ...typography.body1,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  location: {
    ...typography.body2,
    color: colors.text.tertiary,
    marginBottom: spacing.m,
  },
  membershipStatus: {
    backgroundColor: colors.background.secondary,
    padding: spacing.s,
    borderRadius: 8,
    marginBottom: spacing.m,
  },
  membershipText: {
    ...typography.body2,
    color: colors.primary,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    marginBottom: spacing.l,
  },
  actionButton: {
    paddingVertical: spacing.m,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  joinButton: {
    backgroundColor: colors.primary,
  },
  leaveButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inviteButton: {
    backgroundColor: colors.background.secondary,
  },
  actionButtonText: {
    color: colors.background.main,
    ...typography.subtitle1,
  },
  leaveButtonText: {
    color: colors.text.primary,
  },
  inviteButtonText: {
    color: colors.primary,
    ...typography.subtitle1,
  },
  descriptionContainer: {
    marginBottom: spacing.l,
  },
  descriptionTitle: {
    ...typography.subtitle1,
    marginBottom: spacing.s,
  },
  description: {
    ...typography.body1,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  memberActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  actionCard: {
    width: '50%',
    padding: spacing.xs,
  },
  actionCardInner: {
    backgroundColor: colors.background.secondary,
    padding: spacing.m,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionCardTitle: {
    ...typography.subtitle1,
    marginBottom: spacing.xs,
  },
  actionCardSubtitle: {
    ...typography.body2,
    color: colors.text.secondary,
  },
});

export default GroupDetailScreen;