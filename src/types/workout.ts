export interface Workout {
  // Identification
  workoutId: number;
  athleteId: number;
  title: string;
  workoutTypeValueId: WorkoutTypeValueId;
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
  syncedTo: string | null;
  poolLengthOptionId: number | null;

  // Additional Fields
  structure: StructuredWorkout | string | null;
}


export interface Length {
  unit: 'Second' | 'Meter' | 'Repetition';
  value: number;
}

export interface IntensityTarget {
  unit: 'PercentOfFtp' | 'PercentOfMaxHr' | 'PercentOfThresholdHr' | 'PercentOfThresholdSpeed' | 'Rpe';
  value: number;
  minValue?: number;
  maxValue?: number;
}

export interface CadenceTarget {
  unit: 'rpm';
  minValue?: number;
  maxValue?: number;
}

export interface WorkoutStep {
  intensityClass: 'WarmUp' | 'CoolDown' | 'Active' | 'Rest';
  name?: string;
  length: Length;
  type: 'Step' | 'Repetition';
  intensityTarget: IntensityTarget;
  cadenceTarget?: CadenceTarget;
  openDuration?: boolean;
  steps?: WorkoutStep[];
  notes?: string;
}

export interface StructuredWorkout {
  structure: WorkoutStep[];
}

export enum WorkoutTypeValueId {
  Swim = 1,
  Bike = 2,
  Run = 3,
  Strength = 9,
}
