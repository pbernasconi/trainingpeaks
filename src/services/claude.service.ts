import { Anthropic } from '@anthropic-ai/sdk';

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY!,
    });
  }

  async transformWorkoutDescription(description: string): Promise<string> {
    try {
      const prompt = `
        Transform this workout description into a structured JSON format following this schema:
        {
          "Structure": [
            {
              "IntensityClass": "WarmUp"|"CoolDown"|"Active"|"Rest",
              "Name": string,
              "Length": {
                "Unit": "Second"|"Meter",
                "Value": number
              },
              "Type": "Step"|"Repetition",
              "IntensityTarget": {
                "Unit": "PercentOfFtp"|"PercentOfMaxHr"|"Rpe",
                "Value": number,
                "MinValue?": number,
                "MaxValue?": number
              }
            }
          ]
        }

        Workout description:
        ${description}

        Rules:
        1. Convert time descriptions to seconds
        2. Use RPE for intensity if no specific zones are mentioned
        3. Identify warm-up and cool-down sections
        4. Structure repeats as Type: "Repetition" with nested steps
        5. Return only valid JSON with no additional text
        `;

      const response = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        temperature: 0, // Lower temperature for more consistent JSON output
        system: "You are a workout structuring assistant. You only respond with valid JSON that matches the specified schema. Never include explanations or additional text.",
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return response.content[0].text;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to transform workout with Claude: ${errorMessage}`);
    }
  }
} 