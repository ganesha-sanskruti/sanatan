// src/screens/groups/GroupRulesScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, commonStyles } from '../../styles/styles';

const INITIAL_RULES = [
  'Respect all members and their beliefs',
  'No hate speech or inappropriate content',
  'Keep discussions focused on spirituality',
  'Share authentic and verified information only',
  'Maintain the sanctity of the group'
];

const GroupRulesScreen = ({ route, navigation }) => {
  const { group, isAdmin } = route.params;
  const [editMode, setEditMode] = useState(false);
  const [rules, setRules] = useState(INITIAL_RULES);
  const [newRule, setNewRule] = useState('');

  const handleAddRule = () => {
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule('');
    }
  };

  const handleDeleteRule = (index) => {
    Alert.alert(
      'Delete Rule',
      'Are you sure you want to delete this rule?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const newRules = [...rules];
            newRules.splice(index, 1);
            setRules(newRules);
          }
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
        <Text style={styles.headerTitle}>Group Rules</Text>
        {isAdmin && (
          <TouchableOpacity 
            onPress={() => setEditMode(!editMode)}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>
              {editMode ? 'Done' : 'Edit'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.container}>
        {rules.map((rule, index) => (
          <View key={index} style={styles.ruleContainer}>
            <View style={styles.ruleContent}>
              <Text style={styles.ruleNumber}>{index + 1}.</Text>
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
            {editMode && (
              <TouchableOpacity
                onPress={() => handleDeleteRule(index)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {editMode && (
          <View style={styles.addRuleContainer}>
            <TextInput
              style={styles.addRuleInput}
              placeholder="Add new rule..."
              value={newRule}
              onChangeText={setNewRule}
              multiline
              placeholderTextColor={colors.text.tertiary}
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                !newRule.trim() && styles.addButtonDisabled
              ]}
              onPress={handleAddRule}
              disabled={!newRule.trim()}
            >
              <Text style={styles.addButtonText}>Add Rule</Text>
            </TouchableOpacity>
          </View>
        )}
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
  editButton: {
    padding: spacing.s,
  },
  editButtonText: {
    ...typography.subtitle2,
    color: colors.primary,
  },
  container: {
    flex: 1,
    padding: spacing.m,
  },
  ruleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.main,
    padding: spacing.m,
    borderRadius: 8,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ruleContent: {
    flex: 1,
    flexDirection: 'row',
  },
  ruleNumber: {
    ...typography.subtitle1,
    marginRight: spacing.s,
    color: colors.primary,
    minWidth: 25,
  },
  ruleText: {
    ...typography.body1,
    flex: 1,
    lineHeight: 24,
  },
  deleteButton: {
    padding: spacing.s,
    marginLeft: spacing.s,
  },
  deleteButtonText: {
    fontSize: 24,
    color: colors.text.secondary,
  },
  addRuleContainer: {
    marginTop: spacing.m,
  },
  addRuleInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.m,
    marginBottom: spacing.m,
    backgroundColor: colors.background.secondary,
    ...typography.body1,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: spacing.m,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.background.tertiary,
  },
  addButtonText: {
    ...typography.subtitle1,
    color: colors.background.main,
  }
});

export default GroupRulesScreen;