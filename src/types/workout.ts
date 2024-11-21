export interface Workout {
  // Identification
  workoutId: number;
  athleteId: number;
  title: string;
  workoutTypeValueId: number;
  code: string | null;

  // Timing
  workoutDay: string;
  startTime: string;
  startTimePlanned: string | null;
  lastModifiedDate: string;

  // Flags and Settings
  isItAnOr: boolean;
  isHidden: boolean | null;
  isLocked: boolean | null;
  completed: boolean | null;
  publicSettingValue: number;
  orderOnDay: number;

  // Description and Comments
  description: string | null;
  userTags: string;
  coachComments: string | null;
  workoutComments: any[]; // You might want to create a specific type for comments
  newComment: string | null;

  // Sharing
  sharedWorkoutInformationKey: string;
  sharedWorkoutInformationExpireKey: string;

  // Distance and Time
  distance: number | null;
  distancePlanned: number | null;
  distanceCustomized: number | null;
  distanceUnitsCustomized: string | null;
  totalTime: number;
  totalTimePlanned: number | null;

  // Heart Rate
  heartRateMinimum: number | null;
  heartRateMaximum: number | null;
  heartRateAverage: number | null;

  // Energy and Intensity
  calories: number | null;
  caloriesPlanned: number | null;
  tssActual: number | null;
  tssPlanned: number | null;
  tssSource: number;
  if: number;
  ifPlanned: number | null;

  // Speed and Power
  velocityAverage: number | null;
  velocityPlanned: number | null;
  velocityMaximum: number | null;
  normalizedSpeedActual: number | null;
  normalizedPowerActual: number | null;
  powerAverage: number | null;
  powerMaximum: number | null;

  // Energy
  energy: number | null;
  energyPlanned: number | null;

  // Elevation
  elevationGain: number | null;
  elevationGainPlanned: number | null;
  elevationLoss: number | null;
  elevationMinimum: number | null;
  elevationAverage: number | null;
  elevationMaximum: number | null;

  // Additional Metrics
  torqueAverage: number | null;
  torqueMaximum: number | null;
  tempMin: number | null;
  tempAvg: number | null;
  tempMax: number | null;
  cadenceAverage: number | null;
  cadenceMaximum: number | null;

  // Equipment
  equipmentBikeId: number | null;
  equipmentShoeId: number | null;

  // Compliance and Performance
  complianceDurationPercent: number | null;
  complianceDistancePercent: number | null;
  complianceTssPercent: number | null;
  rpe: number | null;
  feeling: number | null;
  personalRecordCount: number;

  // Additional Fields
  structure: StructuredWorkout | null;
  syncedTo: string | null;
  poolLengthOptionId: number | null;
}


export interface Length {
  Unit: 'Second' | 'Meter' | 'Repetition';
  Value: number;
}

export interface IntensityTarget {
  Unit: 'PercentOfFtp' | 'PercentOfMaxHr' | 'PercentOfThresholdHr' | 'PercentOfThresholdSpeed' | 'Rpe';
  Value: number;
  MinValue?: number;
  MaxValue?: number;
}

export interface CadenceTarget {
  Unit: 'rpm';
  MinValue?: number;
  MaxValue?: number;
}

export interface WorkoutStep {
  IntensityClass: 'WarmUp' | 'CoolDown' | 'Active' | 'Rest';
  Name?: string;
  Length: Length;
  Type: 'Step' | 'Repetition';
  IntensityTarget: IntensityTarget;
  CadenceTarget?: CadenceTarget;
  OpenDuration?: boolean;
  Steps?: WorkoutStep[];
}

export interface StructuredWorkout {
  Structure: WorkoutStep[];
} 