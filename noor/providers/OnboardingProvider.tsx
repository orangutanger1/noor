import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';

const ONBOARDING_COMPLETE_KEY = 'noor_onboarding_complete';
const ONBOARDING_DATA_KEY = 'noor_onboarding_data';

export interface LocationData {
  latitude: number;
  longitude: number;
  cityName: string;
  method: 'auto' | 'manual';
}

export interface NotificationSettings {
  enabled: boolean;
  prayers: string[];
  reminderMinutes: number;
}

export type Gender = 'male' | 'female' | 'prefer_not_to_say';
export type AgeRange = '13-17' | '18-24' | '25-34' | '35-44' | '45-54' | '55+';
export type LifeStage = 'student' | 'early_career' | 'established_career' | 'parent' | 'retired' | 'other';
export type IslamicExperience = 'new_to_islam' | 'growing' | 'practicing' | 'knowledgeable';
export type CommitmentLevel = 'exploring' | 'building_habits' | 'consistent' | 'devoted';

export type Motivation =
  | 'prayer_times'
  | 'quran_connection'
  | 'build_habits'
  | 'learn_more'
  | 'community'
  | 'spiritual_growth'
  | 'ramadan_prep'
  | 'new_muslim';

export interface UserProfile {
  name: string;
  gender: Gender | null;
  ageRange: AgeRange | null;
  motivations: Motivation[];
  lifeStage: LifeStage | null;
  islamicExperience: IslamicExperience | null;
  commitmentLevel: CommitmentLevel | null;
}

export interface OnboardingData {
  userProfile: UserProfile;
  location: LocationData | null;
  calculationMethod: string;
  notifications: NotificationSettings;
  completedAt: string | null;
}

const defaultUserProfile: UserProfile = {
  name: '',
  gender: null,
  ageRange: null,
  motivations: [],
  lifeStage: null,
  islamicExperience: null,
  commitmentLevel: null,
};

const defaultOnboardingData: OnboardingData = {
  userProfile: defaultUserProfile,
  location: null,
  calculationMethod: 'isna',
  notifications: {
    enabled: false,
    prayers: [],
    reminderMinutes: 15,
  },
  completedAt: null,
};

export const [OnboardingProvider, useOnboarding] = createContextHook(() => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultOnboardingData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const [completeStatus, savedData] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY),
        AsyncStorage.getItem(ONBOARDING_DATA_KEY),
      ]);

      setIsOnboardingComplete(completeStatus === 'true');

      if (savedData) {
        setOnboardingData(JSON.parse(savedData));
      }
    } catch (error) {
      console.log('Error checking onboarding status:', error);
      setIsOnboardingComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  const setLocationData = useCallback((location: LocationData) => {
    setOnboardingData((prev) => ({
      ...prev,
      location,
    }));
  }, []);

  const setCalculationMethod = useCallback((method: string) => {
    setOnboardingData((prev) => ({
      ...prev,
      calculationMethod: method,
    }));
  }, []);

  const setNotificationSettings = useCallback((settings: NotificationSettings) => {
    setOnboardingData((prev) => ({
      ...prev,
      notifications: settings,
    }));
  }, []);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setOnboardingData((prev) => ({
      ...prev,
      userProfile: {
        ...prev.userProfile,
        ...updates,
      },
    }));
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      const finalData = {
        ...onboardingData,
        completedAt: new Date().toISOString(),
      };

      await Promise.all([
        AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true'),
        AsyncStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(finalData)),
      ]);

      setOnboardingData(finalData);
      setIsOnboardingComplete(true);
    } catch (error) {
      console.log('Error completing onboarding:', error);
      throw error;
    }
  }, [onboardingData]);

  const resetOnboarding = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY),
        AsyncStorage.removeItem(ONBOARDING_DATA_KEY),
      ]);

      setOnboardingData(defaultOnboardingData);
      setIsOnboardingComplete(false);
    } catch (error) {
      console.log('Error resetting onboarding:', error);
    }
  }, []);

  return {
    // State
    isOnboardingComplete,
    isLoading,
    onboardingData,
    userProfile: onboardingData.userProfile,
    locationData: onboardingData.location,
    calculationMethod: onboardingData.calculationMethod,
    notificationSettings: onboardingData.notifications,

    // Actions
    updateUserProfile,
    setLocationData,
    setCalculationMethod,
    setNotificationSettings,
    completeOnboarding,
    resetOnboarding,
  };
});
