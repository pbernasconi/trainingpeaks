import { Anthropic } from '@anthropic-ai/sdk';
import { Workout, StructuredWorkout } from '../types/workout';

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

  async processWorkout(workout: Workout): Promise<Workout | null> {
    if (!workout.description || workout.structure || workout.description === null) {
      return null;
    }

    try {
      const structure = await this.transformWorkoutDescription(workout);
      return { ...workout, structure };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to process workout ${workout.workoutId}: ${errorMessage}`);
    }
  }

  public async transformWorkoutDescription(workout: Workout): Promise<StructuredWorkout> {
    const prompt = this.buildPrompt(workout.description, workout.workoutTypeValueId);

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0,
      max_tokens: 8192,
      system: "You are a professional triathlon coach who specializes in structuring workouts. You only respond with valid JSON that matches the specified schema. Never include explanations or additional text.",
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return JSON.parse(response.content[0].text) as StructuredWorkout;
  }

  private buildPrompt(description: string | null, workoutType: number): string {
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
                    "minValue": 70,
                    "maxValue": 80
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
                    "minValue": 70,
                    "maxValue": 80
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
      5. When using minValue/maxValue, value must be the exact midpoint
      6. Return only valid JSON matching this exact schema

      Optional fields for any step:
      - "name": descriptive name
      - "notes": additional instructions
      - "openDuration": boolean
      - "cadenceTarget": { "unit": "rpm", "minValue": number, "maxValue": number }

      Workout Type ID: ${workoutType}
      Workout description:
      ${description}
    `;
  }
} 