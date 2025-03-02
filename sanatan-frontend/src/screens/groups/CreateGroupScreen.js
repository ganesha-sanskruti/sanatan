// src/screens/groups/CreateGroupScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';

const CreateGroupScreen = ({ navigation }) => {
  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    location: '',
    type: 'Community',
    isPrivate: false,
  });

  const handleCreate = () => {
    if (!groupData.name.trim() || !groupData.description.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    
    // Here you would typically send this to your backend
    console.log('New Group Data:', groupData);
    
    Alert.alert(
      'Success',
      'Group created successfully!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Group</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Group Name*</Text>
            <TextInput
              style={styles.input}
              value={groupData.name}
              onChangeText={(text) => setGroupData({...groupData, name: text})}
              placeholder="Enter group name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description*</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={groupData.description}
              onChangeText={(text) => setGroupData({...groupData, description: text})}
              placeholder="Describe your group"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={groupData.location}
              onChangeText={(text) => setGroupData({...groupData, location: text})}
              placeholder="Enter location"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Group Type</Text>
            <View style={styles.typeContainer}>
              {['Community', 'Study', 'Temple', 'Meditation', 'Education'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    groupData.type === type && styles.typeButtonActive
                  ]}
                  onPress={() => setGroupData({...groupData, type})}
                >
                  <Text style={[
                    styles.typeButtonText,
                    groupData.type === type && styles.typeButtonTextActive
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Private Group</Text>
            <Switch
              value={groupData.isPrivate}
              onValueChange={(value) => setGroupData({...groupData, isPrivate: value})}
              trackColor={{ false: colors.background.tertiary, true: colors.primary }}
            />
          </View>

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreate}
          >
            <Text style={styles.createButtonText}>Create Group</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  backButtonText: {
    fontSize: 24,
    color: colors.text.primary,
  },
  headerTitle: {
    ...typography.h2,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  form: {
    padding: spacing.m,
  },
  inputContainer: {
    marginBottom: spacing.l,
  },
  label: {
    ...typography.subtitle2,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.m,
    fontSize: 16,
    backgroundColor: colors.background.secondary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  typeButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  typeButtonTextActive: {
    color: colors.background.main,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.m,
  },
  createButtonText: {
    color: colors.background.main,
    ...typography.subtitle1,
  },
});

export default CreateGroupScreen;