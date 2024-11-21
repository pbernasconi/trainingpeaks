## Workout Structure Format:


> Note: Structure should be sent as a JSON string, but it is expanded in the example blow

Example JSON: 
```json
{
  "Structure": [
      {
         "IntensityClass": "WarmUp",
         "Name": "Warm up",
         "Length": {
             "Unit": "Second",
             "Value": 600
         },
         "Type": "Step",
         "IntensityTarget": {
             "Unit": "PercentOfThresholdHr",
             "Value": 75,
             "MinValue":70,
             "MaxValue":80
         }
       },
       {
          "IntensityClass": "Active",
          "Name": "Active",
             "Length": {
             "Unit": "Second",
             "Value": 2095
          },
          "Type": "Step",
          "IntensityTarget": {
             "Unit": "PercentOfThresholdHr",
             "Value": 90,
             "MinValue":80,
             "MaxValue":100
          }
       },
       {
          "Type": "Repetition",
          "Length": {
            "Unit": "Repetition",
            "Value": 3
          },
          "Steps": [
            {
              "IntensityClass": "Active",
              "Name": "Hard",
              "Length": {
                "Unit": "Second",
                "Value": 60
              },
              "Type": "Step",
              "IntensityTarget": {
                "Unit": "PercentOfThresholdHr",
                "Value": 115
              },
              "CadenceTarget": {
		"Unit": "rpm",
		"MinValue": 70,
		"MaxValue": 80
	      }
            },
            {
              "IntensityClass": "Rest",
              "Name": "Easy",
              "Length": {
                "Unit": "Second",
                "Value": 60
              },
              "Type": "Step",
              "IntensityTarget": {
                "Unit": "PercentOfThresholdHr",
                "Value": 70
              }
            }
          ]
       },
       {
          "IntensityClass": "CoolDown",
          "Name": "Cool Down",
          "Length": {
              "Unit": "Second",
              "Value": 600
           },
           "Type": "Step",
           "IntensityTarget": {
               "Unit": "PercentOfThresholdHr",
               "Value": 75
           },
           "OpenDuration" : true
        }
    ]
}
```
**Notes for format type: json**
1. Valid Enum Values
   - IntensityClass:
     - WarmUp
     - CoolDown
     - Active
     - Rest
   - Length/Unit:
     - Meter
     - Second
   - Type:
     - Repetition
     - Step
   - IntensityTarget/Unit:
     - PercentOfFtp
     - PercentOfMaxHr
     - PercentOfThresholdHr
     - PercentOfThresholdSpeed
     - Rpe
   - Cadence Targets:
     - Unit must be rpm
2. Units
    - Length of steps in meter or second
    - Heart Rate in beats per minute
    - Power in watt
    - Speed in meter per second
    - Cadence in rpm
3. Notes
    - Length values are integers.
    - Length is required.
    - Percentages are decimals.
    - Steps may or may not have a name.
    - Steps may or may not have notes.
    - RPE values are integers (with no unit and no relation to any threshold).
    - For open duration steps you can add `"OpenDuration" : true` to a step (Length is still required, when OpenDuration is set to true).
    - Target Intensity Value will also be present.
    - The MinValue and MaxValue target intensities are optional.
    - When the MinValue and MaxValue targets intensities are provided, the Value should always be the midpoint.
    - When you POST or PUT a workout with a `structure` value, we will compute planned distance, duration, and TSS from the sum of the structure steps, if sufficient data is available. These computed values from structure will override the original values in the distance, duration, and TSS fields.