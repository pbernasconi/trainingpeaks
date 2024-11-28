export interface HeartRateZone {
  label: string;
  maximum: number;
  minimum: number;
}

export interface PowerZone {
  label: string;
  maximum: number;
  minimum: number;
}

export interface SpeedZone {
  label: string;
  maximum: number;
  minimum: number;
}

export interface ZoneCalculator {
  zoneCalculatorId: number | null;
  threshold: number;
  maximumHeartRate?: number;
  restingHeartRate?: number;
  calculationMethod: number;
  workoutTypeId: number;
  zones: HeartRateZone[] | PowerZone[] | SpeedZone[];
  distance?: number;  // Only for speedZones
}

interface NutritionSettings {
  athleteId: number;
  plannedCalories: number;
}

interface ICalendarKeys {
  workoutsAndMeals: string | null;
  workoutsOnly: string | null;
  mealsOnly: string | null;
}

export interface UserSettings {
  // Basic User Info
  athleteId: number;
  personId: number;
  accountSettingsId: number;
  userName: string;
  email: string;
  isEmailVerified: boolean;
  firstName: string;
  lastName: string;
  fullName: string;
  userType: number;
  userIdentifierHash: string;

  // Training Settings
  preferredRunningTssSource: number;
  coachedBy: number;
  athleteType: number;
  heartRateZones: ZoneCalculator[];
  powerZones: ZoneCalculator[];
  speedZones: ZoneCalculator[];

  // Thresholds and Notifications
  thresholdsAutoApply: boolean;
  thresholdsNotifyAthlete: boolean;
  thresholdsNotifyCoach: boolean;
  virtualCoachEmailHour: number;
  enableVirtualCoachEmails: boolean;
  shareMctWithCoach: boolean | null;
  enableWorkoutCommentNotification: boolean;
  enablePostWorkoutNotifications: boolean;

  // Calendar and Nutrition
  iCalendarKeys: ICalendarKeys;
  optedOutOfIcal: boolean;
  nutritionSettings: NutritionSettings;

  // Account Status
  expireDate: string;
  premiumTrial: boolean;
  premiumTrialDaysRemaining: number;
  lastLogon: string;
  numberOfVisits: number;
  created: string;

  // Personal Information
  age: number;
  birthday: string;
  gender: 'm' | 'f';

  // Preferences
  dateFormat: 'mdy' | 'dmy' | 'ymd';
  timeZone: string;
  units: number;
  temperatureUnit: number;
  windSpeedUnit: number;
  language: string;
  allowMarketingEmails: boolean;

  // Contact Information
  address: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  phone: string | null;
  cellPhone: string | null;

  // Location and Profile
  latitude: number | null;
  longitude: number | null;
  personPhotoUrl: string;

  // Misc
  approvedConsent: any[];
  affiliateId: number;
  isAthlete: boolean;
} 