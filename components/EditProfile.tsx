import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActionSheet,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { X, Camera } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import AnimatedGradientButton from './AnimatedGradientButton';
import {
  PRIMARY_ORANGE,
  WHITE,
  BACKGROUND,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  BORDER_RADIUS,
  SPACING_LARGE,
  SPACING_MEDIUM,
} from '../constants/theme';

interface EditProfileProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  currentDisplayName: string;
  currentAvatarUrl?: string;
  onSuccess: (displayName: string, avatarUrl?: string) => void;
}

export default function EditProfile({
  visible,
  onClose,
  userId,
  currentDisplayName,
  currentAvatarUrl,
  onSuccess,
}: EditProfileProps) {
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(currentDisplayName);
    setAvatarUrl(currentAvatarUrl);
  }, [currentDisplayName, currentAvatarUrl, visible]);

  const getInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const showImagePickerOptions = () => {
    const options = ['Take Photo', 'Choose from Library'];
    if (avatarUrl) {
      options.push('Remove Photo');
    }
    options.push('Cancel');

    const cancelButtonIndex = options.length - 1;
    const destructiveButtonIndex = avatarUrl ? options.length - 2 : undefined;

    if (Platform.OS === 'ios') {
      ActionSheet.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
        },
        async (buttonIndex) => {
          if (buttonIndex === 0) {
            await takePhoto();
          } else if (buttonIndex === 1) {
            await pickImage();
          } else if (buttonIndex === 2 && avatarUrl) {
            removePhoto();
          }
        }
      );
    } else {
      // Android - use Alert
      Alert.alert(
        'Change Photo',
        'Choose an option',
        [
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Choose from Library', onPress: pickImage },
          ...(avatarUrl
            ? [{ text: 'Remove Photo', onPress: removePhoto, style: 'destructive' as const }]
            : []),
          { text: 'Cancel', style: 'cancel' as const },
        ]
      );
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Photo library permission is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Generate unique filename
      const fileExt = uri.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(urlData.publicUrl);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error uploading image:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAvatarUrl(undefined);
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Invalid Name', 'Please enter a display name.');
      return;
    }

    try {
      setSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Update users_metadata
      const { error } = await supabase
        .from('users_metadata')
        .update({
          display_name: displayName.trim(),
          avatar_url: avatarUrl || null,
        })
        .eq('user_id', userId);

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess(displayName.trim(), avatarUrl);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitials}>
                  {getInitials(displayName || 'User')}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={showImagePickerOptions}
            disabled={uploading}
          >
            <Camera size={18} color={PRIMARY_ORANGE} />
            <Text style={styles.changePhotoText}>
              {uploading ? 'Uploading...' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Display Name Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your name"
            placeholderTextColor={TEXT_SECONDARY}
            autoCapitalize="words"
            maxLength={50}
          />
        </View>

        {/* Save Button */}
        <View style={styles.footer}>
          <AnimatedGradientButton
            onPress={handleSave}
            disabled={saving || uploading || !displayName.trim()}
            style={styles.saveButton}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </AnimatedGradientButton>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING_LARGE,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: SPACING_MEDIUM,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: TEXT_PRIMARY,
  },
  closeButton: {
    padding: 8,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  avatarContainer: {
    marginBottom: SPACING_MEDIUM,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: PRIMARY_ORANGE,
  },
  avatarPlaceholder: {
    backgroundColor: PRIMARY_ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 40,
    fontFamily: 'Inter-Bold',
    color: WHITE,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PRIMARY_ORANGE,
  },
  changePhotoText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: PRIMARY_ORANGE,
  },
  inputSection: {
    paddingHorizontal: SPACING_LARGE,
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: TEXT_SECONDARY,
    marginBottom: 8,
  },
  input: {
    backgroundColor: WHITE,
    borderRadius: BORDER_RADIUS,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  footer: {
    padding: SPACING_LARGE,
    marginTop: 'auto',
  },
  saveButton: {
    height: 56,
  },
});
