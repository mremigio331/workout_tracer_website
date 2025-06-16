const workoutTypeColor = (type) => {
  switch (type) {
    case "Run":
      return "#ff6600";
    case "Ride":
      return "#0074D9";
    case "Swim":
      return "#2ECC40";
    case "Walk":
      return "#B10DC9";
    case "Hike":
      return "#b8860b";
    case "Workout":
      return "#FF4136";
    case "AlpineSki":
      return "#1f77b4";
    case "BackcountrySki":
      return "#aec7e8";
    case "Canoeing":
      return "#17becf";
    case "EBikeRide":
      return "#7f7f7f";
    case "Golf":
      return "#bcbd22";
    case "Handcycle":
      return "#8c564b";
    case "IceSkate":
      return "#c5b0d5";
    case "InlineSkate":
      return "#9467bd";
    case "Kayaking":
      return "#2ca02c";
    case "Kitesurf":
      return "#e377c2";
    case "NordicSki":
      return "#9edae5";
    case "RollerSki":
      return "#c49c94";
    case "Rowing":
      return "#98df8a";
    case "Sail":
      return "#f7b6d2";
    case "Skateboard":
      return "#d62728";
    case "Snowboard":
      return "#1c1c1c";
    case "Snowshoe":
      return "#c7c7c7";
    case "StandUpPaddling":
      return "#ffbb78";
    case "Surfing":
      return "#17becf";
    case "Velomobile":
      return "#e377c2";
    case "VirtualRide":
      return "#ff7f0e";
    case "VirtualRun":
      return "#ff9896";
    case "Wheelchair":
      return "#FFDC00"; // Yellow
    case "Windsurf":
      return "#aec7e8";
    default:
      return "#888888";
  }
};

export default workoutTypeColor;
