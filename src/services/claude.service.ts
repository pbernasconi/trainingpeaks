import { Anthropic } from '@anthropic-ai/sdk';
import { Workout, StructuredWorkout, WorkoutTypeValueId } from '../types/workout';
import { UserSettings, ZoneCalculator, HeartRateZone } from '../types/user';
import { logger } from '../utils/logger';

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }

  async processWorkout(workout: Workout, userSettings: UserSettings): Promise<Workout | null> {
    if (!workout.description || workout.structure || workout.description === null) {
      return null;
    }

    try {
      const structure = await this.transformWorkoutDescription(workout, userSettings);
      return { ...workout, structure };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to process workout ${workout.workoutId}: ${errorMessage}`);
    }
  }

  mapWorkoutTypeValueId(workoutTypeValueId: WorkoutTypeValueId): string {
    switch (workoutTypeValueId) {
      case WorkoutTypeValueId.Run:
        return 'run';
      case WorkoutTypeValueId.Bike:
        return 'bike';
      case WorkoutTypeValueId.Swim:
        return 'swim';
      case WorkoutTypeValueId.Strength:
        return 'strength';
      default:
        return 'other';
    }
  }

  convertTotalTimePlannedToSeconds(totalTimePlanned: number | null): number | null {
    return totalTimePlanned ? totalTimePlanned * 60 * 60 : null;
  }

  mapHeartRateZones(heartRateZones: ZoneCalculator[], workoutTypeId: number): string {
    const zone = heartRateZones.find(zone => zone.workoutTypeId === workoutTypeId);
    return JSON.stringify(zone?.zones);
  }

  mapHRZonesToThreshold(heartRateZones: ZoneCalculator[], workoutTypeId: number): any {
    const zone = heartRateZones.find(zone => zone.workoutTypeId === workoutTypeId);
    const threshold = zone?.threshold;
    if (!threshold) return null;
    const calculateZone = (zone: HeartRateZone | undefined) => ({
      minimum: zone?.minimum ? Number((zone.minimum / threshold * 100).toFixed(2)) : null,
      maximum: zone?.maximum ? Number((zone.maximum / threshold * 100).toFixed(2)) : null
    });

    return {
      'Zone 1: Recovery': calculateZone(zone.zones.find(z => z.label === 'Zone 1: Recovery')),
      'Zone 2: Aerobic': calculateZone(zone.zones.find(z => z.label === 'Zone 2: Aerobic')),
      'Zone 3: Tempo': calculateZone(zone.zones.find(z => z.label === 'Zone 3: Tempo')),
      'Zone 4: SubThreshold': calculateZone(zone.zones.find(z => z.label === 'Zone 4: SubThreshold')),
      'Zone 5A: SuperThreshold': calculateZone(zone.zones.find(z => z.label === 'Zone 5A: SuperThreshold')),
      'Zone 5B: Aerobic Capacity': calculateZone(zone.zones.find(z => z.label === 'Zone 5B: Aerobic Capacity')),
      'Zone 5C: Anaerobic Capacity': calculateZone(zone.zones.find(z => z.label === 'Zone 5C: Anaerobic Capacity'))
    };
  }

  public async transformWorkoutDescription(workout: Workout, userSettings: UserSettings): Promise<StructuredWorkout> {
    const prompt = this.buildPrompt(workout, userSettings);

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0,
      max_tokens: 8192,
      system: `
        You are a professional triathlon coach who specializes in structuring workouts. 
        You only respond with valid JSON that matches the specified schema. 
        Never include explanations or additional text`,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });
    logger.info(`Response: ${response.content[0].text}`);
    return JSON.parse(response.content[0].text) as StructuredWorkout;
  }

  private buildPrompt(workout: Workout, userSettings: UserSettings): string {
    const { description, title, totalTimePlanned, workoutTypeValueId } = workout;
    const { heartRateZones } = userSettings;
    logger.info(`Heart Rate Threshold zones: ${JSON.stringify(this.mapHRZonesToThreshold(heartRateZones, workoutTypeValueId))}`);
    return `
      Transform this workout description into a structured workout format. Return a valid JSON object with a "structure" array containing workout steps.

      Required JSON format:
      {
        "type": "object",
        "properties": {
          "structure": {
            "type": "array",
            "description": "The main structure of steps and repetitions for the workout.",
            "items": {
              "type": "object",
              "properties": {
                "type": {
                  "type": "string",
                  "enum": ["step", "repetition"],
                  "description": "Indicates if the item is a single step or a group of repeated steps."
                },
                "length": {
                  "type": "object",
                  "description": "Duration or repetitions for the step or group.",
                  "properties": {
                    "unit": {
                      "type": "string",
                      "enum": ["repetition", "second"],
                      "description": "Unit of measurement for the length. second is preferred more than repetition."
                    },
                    "value": {
                      "type": "integer",
                      "minimum": 1,
                      "description": "Value of the length, in repetitions or seconds."
                    }
                  },
                  "required": ["unit", "value"]
                },
                "steps": {
                  "type": "array",
                  "description": "A list of individual steps within the repetition or group.",
                  "items": {
                    "type": "object",
                    "properties": {
                      "name": {
                        "type": "string",
                        "description": "The name of the step, e.g., 'Warm up' or 'Hard push'."
                      },
                      "intensityClass": {
                        "type": "string",
                        "enum": ["warmUp", "active", "coolDown", "rest"],
                        "description": "The intensity classification of the step."
                      },
                      "length": {
                        "type": "object",
                        "description": "The duration of the step.",
                        "properties": {
                          "unit": {
                            "type": "string",
                            "enum": ["second"],
                            "description": "Unit of time measurement (always 'second')."
                          },
                          "value": {
                            "type": "integer",
                            "minimum": 1,
                            "description": "Duration of the step in seconds."
                          }
                        },
                        "required": ["unit", "value"]
                      },
                      "targets": {
                        "type": "array",
                        "description": "Target ranges for metrics like heart rate or pace.",
                        "items": {
                          "type": "object",
                          "properties": {
                            "minValue": {
                              "type": "number",
                              "description": "Minimum value for the target metric."
                            },
                            "maxValue": {
                              "type": "number",
                              "description": "Maximum value for the target metric (optional)."
                            }
                          },
                          "required": ["minValue"]
                        }
                      },
                      "notes": {
                        "type": "string",
                        "description": "Optional notes or instructions for the step."
                      },
                      "openDuration": {
                        "type": "boolean",
                        "description": "Whether the step has an open-ended duration."
                      }
                    },
                    "required": ["intensityClass", "length", "targets"]
                  }
                }
              },
              "required": ["type", "length", "steps"]
            }
          },
          "primaryLengthMetric": {
            "type": "string",
            "description": "The primary metric for workout length.",
            "enum": ["duration", "distance"]
          },
          "primaryIntensityMetric": {
            "type": "string",
            "description": "The primary metric for workout intensity.",
            "enum": ["percentOfThresholdPace", "percentOfThresholdHr", "percentOfMaxHr", "percentOfFtp"]
          },
          "visualizationDistanceUnit": {
            "type": "string",
            "description": "Unit for distance visualization (default is undefined).",
            "enum": ["undefined"]
          }
        },
        "required": ["structure", "primaryLengthMetric", "primaryIntensityMetric"]
      }

      Example response:
      {
        "structure": [
          {
            "type": "step",
            "length": {
              "unit": "repetition",
              "value": 1
            },
            "steps": [
              {
                "type": "step",
                "intensityClass": "warmUp",
                "length": {
                  "unit": "second",
                  "value": 900
                },
                "targets": [
                  {
                    "minValue": 0,
                    "maxValue": 83
                  }
                ],
                "name": "Warm up",
                "openDuration": false
              }
            ]
          },
          {
            "type": "step",
            "length": {
              "unit": "repetition",
              "value": 1
            },
            "steps": [
              {
                "type": "step",
                "intensityClass": "active",
                "name": "Hard",
                "length": {
                  "unit": "second",
                  "value": 1200
                },
                "targets": [
                  {
                    "minValue": 103,
                    "maxValue": 111
                  }
                ],
                "openDuration": false
              }
            ]
          },
          {
            "type": "step",
            "length": {
              "unit": "repetition",
              "value": 1
            },
            "steps": [
              {
                "type": "step",
                "intensityClass": "coolDown",
                "length": {
                  "unit": "second",
                  "value": 2400
                },
                "targets": [
                  {
                    "minValue": 84,
                    "maxValue": 88
                  }
                ],
                "name": "Cool Down",
                "notes": "Just relax and take it slow and easy",
                "openDuration": false
              }
            ]
          }
        ],
        "primaryLengthMetric": "duration",
        "primaryIntensityMetric": "percentOfThresholdPace",
        "visualizationDistanceUnit": "undefined"
      }

      Rules:
      1. Convert all time descriptions to seconds (integer values)
      2. For repeats/intervals use type: "repetition" with nested steps array
      3. Don't include a warmup or cooldown step if the description doesn't mention it
      4. Use these intensity options in order of preference:
         - Heart rate zones (percentOfThresholdHr)
         - Power zones (percentOfFtp)
         - RPE (integers 1-10)
      5. Return only valid JSON matching this exact schema
      6. Find the Zone that best corresponds within these options:
        - Zone 1: Recovery
        - Zone 2: Aerobic
        - Zone 3: Tempo
        - Zone 4: SubThreshold
        - Zone 5A: SuperThreshold
        - Zone 5B: Aerobic Capacity
        - Zone 5C: Anaerobic Capacity
      7. To calculate each step's targets 'minValue' and 'maxValue', use the athlete's exact Heart Rate Threshold Zones that map to the Zone 1/2/3/4/5a/5b/5c:
         - Use the exact decimal values provided in the Heart Rate Threshold Zones without rounding
         - Maintain full numerical precision (do not round or simplify percentages)
         - Example: if Zone 2 is {minimum: 84.48, maximum: 89.08}, use these exact values
         - Never approximate or round these values to nearby whole numbers

      Edge-case handling:
      - If the Workout Planned Time is available, use that as the primary length metric, otherwise use the maximum value from the Workout Title as the primary length metric, otherwise use the Workout Description length where available
      - openDuration should be false if there is a set duration
      - For the root 'length', generally prefer 'repetition' over 'step', where a repetition is a single step
      - When there is a recommendation for multiple zones in the Title or Description (eg: X minutes Zone 1/2), use the higher zone (eg: Zone 2)

      Optional fields for any step:
      - "name": descriptive name
      - "notes": additional instructions
      - "openDuration": boolean
      - "cadenceTarget": { "unit": "rpm", "minValue": number, "maxValue": number }

      Workout Type: ${this.mapWorkoutTypeValueId(workoutTypeValueId)}
      Workout Type ID: ${workoutTypeValueId}
      Workout Title: ${title}
      Workout Planned Time (in seconds): ${this.convertTotalTimePlannedToSeconds(totalTimePlanned)}
      Workout Description:
      ${description}

      Heart Rate Threshold Zones: ${this.mapHRZonesToThreshold(heartRateZones, workoutTypeValueId)}
    `;
  }
} 