const workoutTypeColor = (type) => {
  switch (type) {
    case "AlpineSki":
      return "#4682B4"; // Steel Blue – seasonal with GPS
    case "BackcountrySki":
      return "#6A5ACD"; // Slate Blue – seasonal with GPS
    case "Badminton":
      return "#E0E0E0"; // Light Gray – indoor/racket sport
    case "Canoeing":
      return "#66CDAA"; // Medium Aquamarine – moderate GPS
    case "Crossfit":
      return "#DCDCDC"; // Gainsboro – indoor gym
    case "EBikeRide":
      return "#FABE28"; // Bright Yellow – very popular and GPS-heavy
    case "EMountainBikeRide":
      return "#FFD700"; // Gold – popular e-mtb, GPS
    case "Elliptical":
      return "#E6E6E6"; // Light Gray – gym cardio
    case "Football":
      return "#CCCCCC"; // Soccer – semi-popular, limited GPS
    case "Golf":
      return "#D3D3D3"; // Light Gray – low GPS, low visibility
    case "GravelRide":
      return "#FF7F0E"; // Vivid Orange – fast-growing, GPS-heavy
    case "Handcycle":
      return "#F0F0F0"; // Very Light Gray – lower volume, may lack GPS
    case "Hike":
      return "#3CB44B"; // Strong Green – very popular and GPS-rich
    case "HIIT":
      return "#DADADA"; // Light Gray – indoor, grouped with Crossfit
    case "IceSkate":
      return "#B0C4DE"; // Light Steel Blue – niche, seasonal
    case "InlineSkate":
      return "#A0522D"; // Sienna – mid-tier popularity, GPS-capable
    case "Kayaking":
      return "#00CED1"; // Dark Turquoise – active water GPS sport
    case "Kitesurf":
      return "#BA55D3"; // Medium Orchid – niche water sport
    case "MountainBikeRide":
      return "#8B4513"; // Saddle Brown – highly active GPS terrain
    case "NordicSki":
      return "#6495ED"; // Cornflower Blue – seasonal with GPS
    case "Pickleball":
      return "#DCDCDC"; // Matches Crossfit/indoor tones
    case "Pilates":
      return "#E0E0E0"; // Indoor stretching – similar to Yoga
    case "Racquetball":
      return "#D3D3D3"; // Grouped with squash, table tennis
    case "Ride":
      return "#4363D8"; // Strong Blue – one of the most popular sports
    case "RockClimb":
      return "#A9A9A9"; // Dark Gray – indoor/outdoor mix
    case "RollerSki":
      return "#D2691E"; // Chocolate – niche with GPS
    case "Rowing":
      return "#228B22"; // Forest Green – water sport with GPS
    case "Run":
      return "#E6194B"; // Vivid Red – most popular Strava sport
    case "Sail":
      return "#87CEFA"; // Light Sky Blue – water GPS sport, less popular
    case "Skateboard":
      return "#DDDDDD"; // Soft Gray – low GPS, less common
    case "Snowboard":
      return "#2F4F4F"; // Dark Slate Gray – seasonal, GPS-capable
    case "Snowshoe":
      return "#EEEEEE"; // Very Pale Gray – uncommon and low GPS
    case "Squash":
      return "#D3D3D3"; // Racket sport, grouped with others
    case "StairStepper":
      return "#E8E8E8"; // Indoor cardio – light variant
    case "StandUpPaddling":
      return "#008080"; // Teal – moderate popularity, GPS supported
    case "Surfing":
      return "#20B2AA"; // Light Sea Green – ocean GPS sport
    case "Swim":
      return "#42D4F4"; // Bright Aqua – highly popular, GPS-enabled (open water)
    case "TableTennis":
      return "#CCCCCC"; // Indoor sport, same group
    case "Tennis":
      return "#C0C0C0"; // Indoor/outdoor sport – less GPS
    case "TrailRun":
      return "#FF1493"; // Deep Pink – growing segment, GPS-rich
    case "Velomobile":
      return "#D8BFD8"; // Thistle – niche, low volume
    case "VirtualRide":
      return "#FFDAB9"; // Peach – virtual, lower map priority
    case "VirtualRow":
      return "#F5DEB3"; // Wheat – grouped with other virtuals
    case "VirtualRun":
      return "#FFE4E1"; // Misty Rose – virtual, low GPS
    case "Walk":
      return "#911EB4"; // Strong Purple – high popularity, GPS available
    case "WeightTraining":
      return "#E0E0E0"; // Indoor gym – low map relevance
    case "Wheelchair":
      return "#FAFAFA"; // Almost White – low usage, often no GPS
    case "Windsurf":
      return "#5F9EA0"; // Cadet Blue – seasonal with GPS
    case "Workout":
      return "#E0E0E0"; // Light Gray – no GPS, low map relevance
    case "Yoga":
      return "#F0F8FF"; // Alice Blue – calm indoor activity
    default:
      return "#888888"; // Default muted gray
  }
};

export const highlightedActivity = "#FFD700"; // Gold – for selected/highlighted activity

export default workoutTypeColor;
