const workoutTypeColor = (type) => {
  switch (type) {
    case "AlpineSki":
      return "#2a5d8f"; // Darker Steel Blue
    case "BackcountrySki":
      return "#483d8b"; // Dark Slate Blue
    case "Badminton":
      return "#b0b0b0"; // Medium Gray
    case "Canoeing":
      return "#228b87"; // Strong Teal
    case "Crossfit":
      return "#a9a9a9"; // Dark Gray
    case "EBikeRide":
      return "#e6b800"; // Strong Gold
    case "EMountainBikeRide":
      return "#b8860b"; // Dark Goldenrod
    case "Elliptical":
      return "#bdbdbd"; // Medium Gray
    case "Football":
      return "#888888"; // Medium Gray
    case "Golf":
      return "#969696"; // Medium Gray
    case "GravelRide":
      return "#ff6600"; // Strong Orange
    case "Handcycle":
      return "#bdbdbd"; // Medium Gray
    case "Hike":
      return "#d2691e"; // Chocolate
    case "HIIT":
      return "#a9a9a9"; // Dark Gray
    case "IceSkate":
      return "#4682b4"; // Steel Blue
    case "InlineSkate":
      return "#8b4513"; // Saddle Brown
    case "Kayaking":
      return "#008080"; // Teal
    case "Kitesurf":
      return "#8a2be2"; // Blue Violet
    case "MountainBikeRide":
      return "#654321"; // Dark Brown
    case "NordicSki":
      return "#27408b"; // Dark Blue
    case "Pickleball":
      return "#b0b0b0"; // Medium Gray
    case "Pilates":
      return "#b0b0b0"; // Medium Gray
    case "Racquetball":
      return "#a9a9a9"; // Dark Gray
    case "Ride":
      return "#006400"; // Dark Green
    case "RockClimb":
      return "#696969"; // Dim Gray
    case "RollerSki":
      return "#a0522d"; // Sienna
    case "Rowing":
      return "#1e90ff"; // Dodger Blue (distinct from Ride)
    case "Run":
      return "#c21807"; // Strong Red
    case "Sail":
      return "#4682b4"; // Steel Blue
    case "Skateboard":
      return "#888888"; // Medium Gray
    case "Snowboard":
      return "#222222"; // Very Dark Gray
    case "Snowshoe":
      return "#b0b0b0"; // Medium Gray
    case "Squash":
      return "#a9a9a9"; // Dark Gray
    case "StairStepper":
      return "#b0b0b0"; // Medium Gray
    case "StandUpPaddling":
      return "#006666"; // Deep Teal
    case "Surfing":
      return "#008080"; // Teal
    case "Swim":
      return "#0099cc"; // Strong Blue
    case "TableTennis":
      return "#888888"; // Medium Gray
    case "Tennis":
      return "#888888"; // Medium Gray
    case "TrailRun":
      return "#c71585"; // Medium Violet Red
    case "Velomobile":
      return "#8b008b"; // Dark Magenta
    case "VirtualRide":
      return "#ff9900"; // Strong Orange
    case "VirtualRow":
      return "#b8860b"; // Dark Goldenrod
    case "VirtualRun":
      return "#c71585"; // Medium Violet Red
    case "Walk":
      return "#003399"; // Strong Blue (was Deep Purple)
    case "WeightTraining":
      return "#888888"; // Medium Gray
    case "Wheelchair":
      return "#555555"; // Dark Gray
    case "Windsurf":
      return "#4682b4"; // Steel Blue
    case "Workout":
      return "#888888"; // Medium Gray
    case "Yoga":
      return "#4682b4"; // Steel Blue
    default:
      return "#444444"; // Default dark gray
  }
};

export const highlightedActivity = "#FFD700"; // Gold – for selected/highlighted activity

export default workoutTypeColor;
