import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Switch,
  Linking,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  LogOut,
  FileText,
  Shield,
  HelpCircle,
  Bell,
  ChevronRight,
  Mail,
  Star,
  Trash2,
  Download,
  Edit,
  AlertTriangle,
} from 'lucide-react-native';
import { useAuth } from '../../lib/contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import NotificationSettings from '../../components/NotificationSettings';
import EditProfile from '../../components/EditProfile';
import TabScreenWrapper from '../../components/TabScreenWrapper';
import Toast from '../../components/Toast';
import {
  PRIMARY_ORANGE,
  WHITE,
  BACKGROUND,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  SUCCESS_GREEN,
  ERROR_RED,
  BORDER_RADIUS,
  SPACING_LARGE,
  SPACING_MEDIUM,
  SHADOW,
} from '../../constants/theme';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  // Modals
  const [notificationModal, setNotificationModal] = useState(false);
  const [editProfileModal, setEditProfileModal] = useState(false);

  // User data
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [pushNotifications, setPushNotifications] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({ visible: false, type: 'success', message: '' });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('users_metadata')
        .select('display_name, avatar_url, notifications_settings')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setDisplayName(data.display_name || user?.email?.split('@')[0] || 'User');
        setAvatarUrl(data.avatar_url);
        setPushNotifications(data.notifications_settings?.enabled || false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ visible: true, type, message });
  };

  const getInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleExportData = () => {
    const options = ['Routines as PDF', 'Schedules as CSV', 'Full Data Export (JSON)', 'Cancel'];
    const cancelButtonIndex = 3;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex },
        async (buttonIndex) => {
          if (buttonIndex === 0) await exportPDF();
          else if (buttonIndex === 1) await exportCSV();
          else if (buttonIndex === 2) await exportJSON();
        }
      );
    } else {
      Alert.alert('Export Data', 'Choose format:', [
        { text: 'Routines as PDF', onPress: exportPDF },
        { text: 'Schedules as CSV', onPress: exportCSV },
        { text: 'Full Data Export (JSON)', onPress: exportJSON },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const exportPDF = async () => {
    try {
      // TODO: Implement PDF export
      showToast('info', 'PDF export coming soon!');
    } catch (error) {
      showToast('error', 'Unable to export data. Try again later.');
    }
  };

  const exportCSV = async () => {
    try {
      // TODO: Implement CSV export
      showToast('info', 'CSV export coming soon!');
    } catch (error) {
      showToast('error', 'Unable to export data. Try again later.');
    }
  };

  const exportJSON = async () => {
    try {
      // TODO: Implement JSON export
      showToast('info', 'JSON export coming soon!');
    } catch (error) {
      showToast('error', 'Unable to export data. Try again later.');
    }
  };

  const handleDeleteAllRoutines = () => {
    Alert.alert(
      '⚠️ Delete All Routines',
      'This will permanently delete all your routines and schedules. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('routines')
                .delete()
                .eq('user_id', user?.id);

              if (error) throw error;

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              showToast('success', 'All routines deleted');
            } catch (error) {
              console.error('Error deleting routines:', error);
              showToast('error', 'Unable to delete. Check connection.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '🚨 Delete Account',
      'This will permanently delete your account and ALL data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            Alert.alert(
              'Final Warning',
              'Are you absolutely sure? Your account will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      // Delete all user data
                      await supabase.from('routines').delete().eq('user_id', user?.id);
                      await supabase.from('users_metadata').delete().eq('user_id', user?.id);

                      // Delete auth account
                      const { error } = await supabase.auth.admin.deleteUser(user?.id || '');
                      if (error) throw error;

                      await signOut();
                      showToast('success', 'Account deleted');
                    } catch (error) {
                      console.error('Error deleting account:', error);
                      showToast('error', 'Unable to delete account. Contact support.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleTogglePushNotifications = async (value: boolean) => {
    setPushNotifications(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const { error } = await supabase
        .from('users_metadata')
        .update({
          notifications_settings: { ...{ enabled: value } },
        })
        .eq('user_id', user?.id);

      if (error) throw error;
      showToast('success', 'Settings saved ✓');
    } catch (error) {
      console.error('Error updating notifications:', error);
      setPushNotifications(!value);
      showToast('error', 'Failed to save settings');
    }
  };

  const handleContactSupport = () => {
    const email = 'support@saufee.com';
    const subject = 'Saufee Support Request';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    Linking.openURL(url);
  };

  const handleRateApp = () => {
    // Open app store based on platform
    const appStoreUrl = Platform.OS === 'ios'
      ? 'https://apps.apple.com/app/saufee/id123456789' // Replace with actual App Store ID
      : 'https://play.google.com/store/apps/details?id=com.saufee.app'; // Replace with actual Play Store ID

    Linking.openURL(appStoreUrl).catch(() => {
      showToast('error', 'Unable to open app store');
    });
  };

  const handleOpenPrivacyPolicy = () => {
    Linking.openURL('https://saufee.com/privacy');
  };

  const handleOpenTerms = () => {
    Linking.openURL('https://saufee.com/terms');
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await signOut();
        },
      },
    ]);
  };

  const SettingRow = ({
    icon,
    title,
    subtitle,
    onPress,
    destructive,
    showChevron = true,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress: () => void;
    destructive?: boolean;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, destructive && { color: ERROR_RED }]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {showChevron && <ChevronRight size={20} color={TEXT_SECONDARY} />}
    </TouchableOpacity>
  );

  return (
    <TabScreenWrapper>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={8}
          showsVerticalScrollIndicator={false}
        >
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitials}>{getInitials(displayName)}</Text>
                </View>
              )}
            </View>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setEditProfileModal(true);
              }}
            >
              <Edit size={16} color={PRIMARY_ORANGE} />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Push Notifications</Text>
              <Switch
                value={pushNotifications}
                onValueChange={handleTogglePushNotifications}
                trackColor={{ false: '#D1D5DB', true: PRIMARY_ORANGE }}
                thumbColor={WHITE}
              />
            </View>
            <View style={styles.divider} />
            <SettingRow
              icon={<Bell size={20} color={TEXT_SECONDARY} />}
              title="Configure Reminders"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setNotificationModal(true);
              }}
            />
          </View>
        </View>

        {/* Data & Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATA & PRIVACY</Text>
          <View style={styles.card}>
            <SettingRow
              icon={<Download size={20} color={TEXT_SECONDARY} />}
              title="Export My Data"
              onPress={handleExportData}
            />
            <View style={styles.divider} />
            <SettingRow
              icon={<Trash2 size={20} color={ERROR_RED} />}
              title="Delete All Routines"
              onPress={handleDeleteAllRoutines}
              destructive
            />
            <View style={styles.divider} />
            <SettingRow
              icon={<AlertTriangle size={20} color={ERROR_RED} />}
              title="Delete Account"
              onPress={handleDeleteAccount}
              destructive
            />
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP INFO</Text>
          <View style={styles.card}>
            <SettingRow
              icon={<Shield size={20} color={TEXT_SECONDARY} />}
              title="Privacy Policy"
              onPress={handleOpenPrivacyPolicy}
            />
            <View style={styles.divider} />
            <SettingRow
              icon={<FileText size={20} color={TEXT_SECONDARY} />}
              title="Terms of Service"
              onPress={handleOpenTerms}
            />
            <View style={styles.divider} />
            <SettingRow
              icon={<Mail size={20} color={TEXT_SECONDARY} />}
              title="Contact Support"
              onPress={handleContactSupport}
            />
            <View style={styles.divider} />
            <SettingRow
              icon={<Star size={20} color={TEXT_SECONDARY} />}
              title="Rate Saufee"
              onPress={handleRateApp}
            />
            <View style={styles.divider} />
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>App Version</Text>
              <Text style={styles.versionValue}>1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <LogOut size={20} color={PRIMARY_ORANGE} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      {user && (
        <>
          <NotificationSettings
            visible={notificationModal}
            onClose={() => setNotificationModal(false)}
            userId={user.id}
          />
          <EditProfile
            visible={editProfileModal}
            onClose={() => setEditProfileModal(false)}
            userId={user.id}
            currentDisplayName={displayName}
            currentAvatarUrl={avatarUrl}
            onSuccess={(newName, newAvatar) => {
              setDisplayName(newName);
              setAvatarUrl(newAvatar);
              showToast('success', 'Profile updated ✓');
            }}
          />
        </>
      )}

      {/* Toast */}
      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />
      </View>
    </TabScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING_LARGE,
    paddingTop: Platform.OS === 'ios' ? 70 : 40,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: TEXT_SECONDARY,
    marginBottom: 12,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: BORDER_RADIUS,
    padding: SPACING_MEDIUM,
    ...SHADOW,
  },
  profileCard: {
    backgroundColor: WHITE,
    borderRadius: BORDER_RADIUS,
    padding: 24,
    alignItems: 'center',
    ...SHADOW,
  },
  avatarContainer: {
    marginBottom: SPACING_MEDIUM,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: PRIMARY_ORANGE,
  },
  avatarPlaceholder: {
    backgroundColor: PRIMARY_ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: WHITE,
  },
  displayName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: TEXT_SECONDARY,
    marginBottom: 16,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PRIMARY_ORANGE,
  },
  editProfileText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: PRIMARY_ORANGE,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  premiumTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: TEXT_PRIMARY,
  },
  subscriptionType: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: TEXT_SECONDARY,
    marginBottom: 16,
  },
  manageButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PRIMARY_ORANGE,
    alignItems: 'center',
  },
  manageButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: PRIMARY_ORANGE,
  },
  planTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  featuresList: {
    marginBottom: 16,
  },
  featureItem: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: TEXT_SECONDARY,
    marginBottom: 6,
  },
  usageBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  usageBarFill: {
    height: '100%',
    backgroundColor: PRIMARY_ORANGE,
  },
  usageText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: TEXT_SECONDARY,
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: PRIMARY_ORANGE,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: WHITE,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  toggleLabel: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: TEXT_PRIMARY,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: TEXT_PRIMARY,
  },
  settingSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  versionLabel: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: TEXT_PRIMARY,
  },
  versionValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: TEXT_SECONDARY,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
    borderRadius: BORDER_RADIUS,
    paddingVertical: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: PRIMARY_ORANGE,
    ...SHADOW,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: PRIMARY_ORANGE,
  },
});
