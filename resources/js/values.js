/* Values needed across the site */

const defaultSettings = 
{
  "cycleSpeed": 15,
  "dashboards": [
    {
      "name": "intro-animation",
      "icon": "fas fa-video",
      "index": 0,
      "theme": "light",
      "title": "Intro Animation"
    },
    {
      "name": "real-time-stats",
      "icon": "fas fa-clock",
      "index": 1,
      "theme": "light",
      "title": "Real Time Channel Stats"
    },
    {
      "name": "platform",
      "icon": "fas fa-user",
      "index": 2,
      "theme": "light",
      "title": "Platform Dashboard"
    },
    {
      "name": "thumbnails",
      "icon": "fas fa-images",
      "index": 3,
      "scrollSpeed": 40,
      "theme": "light",
      "title": "1000 Thumbnail Dashboard"
    },
    {
      "name": "product-categories",
      "icon": "fas fa-chart-pie",
      "index": 4,
      "theme": "light",
      "title": "Product Categories Dashboard"
    },
    {
      "name": "top-ten",
      "icon": "far fa-calendar-alt",
      "index": 5,
      "theme": "light",
      "title": "Top Ten Dashboard"
    },
    {
      "name": "feedback",
      "icon": "fas fa-comment-alt",
      "index": 6,
      "scrollSpeed": 30,
      "theme": "light",
      "title": "User Feedback Dashboard"
    },
    {
      "name": "top-video-1",
      "icon": "fas fa-play-circle",
      "index": 7,
      "theme": "light",
      "title": "Programmable Controllers - Most Watched Video"
    },
    {
      "name": "top-video-2",
      "icon": "fas fa-play-circle",
      "index": 8,
      "theme": "light",
      "title": "Drives - Most Watched Video"
    },
    {
      "name": "top-video-3",
      "icon": "fas fa-play-circle",
      "index": 9,
      "theme": "light",
      "title": "HMI - Most Watched Video"
    },
    {
      "name": "top-video-4",
      "icon": "fas fa-play-circle",
      "index": 10,
      "theme": "light",
      "title": "Motion Control - Most Watched Video"
    },
    {
      "name": "top-video-5",
      "icon": "fas fa-play-circle",
      "index": 11,
      "theme": "light",
      "title": "Sensors/Encoders - Most Watched Video"
    },
    {
      "name": "top-video-6",
      "icon": "fas fa-play-circle",
      "index": 12,
      "theme": "light",
      "title": "Motors - Most Watched Video"
    },
    {
      "name": "card-performance",
      "icon": "fas fa-info-circle",
      "index": 13,
      "theme": "light",
      "title": "Card Performance Dashboard"
    },
    {
      "name": "video-strength",
      "icon": "fas fa-dumbbell",
      "index": 14,
      "theme": "light",
      "title": "Video Strength Dashboard"
    }
  ],
  "numEnabled": 15
};

const categoryColors = {
  "Programmable Controllers": {
    "name": "Programmable<br>Controllers",
    "color": "#1f77b4",
  },
  "Drives": {
    "name": "Drives",
    "color": "#000075"
  },
  "HMI": {
    "name": "HMI",
    "color": "#ff7f0e"
  },
  "Process Control & Measurement": {
    "name": "Process Control<br>& Measurement",
    "color": "#2ca02c"
  },
  "Motion Control": {
    "name": "Motion Control",
    "color": "#d62728"
  },
  "Cables": {
    "name": "Cables",
    "color": "#e77c7c"
  },
  "Sensors/Encoders": {
    "name": "Sensors/Encoders",
    "color": "#9467bd"
  },
  "Motors": {
    "name": "Motors",
    "color": "#8c564b"
  },
  "Motor Controls": {
    "name": "Motor Controls",
    "color": "#e377c2"
  },
  "Field I/O": {
    "name": "Field I/O",
    "color": "#aaffc3"
  },
  "Communications": {
    "name": "Communications",
    "color": "#a26c21"
  },
  "Pneumatic Components": {
    "name": "Pneumatic<br>Components",
    "color": "#7f7f7f"
  },
  "Relays/Timers": {
    "name": "Relays/Timers",
    "color": "#c6aedc"
  },
  "Stacklights": {
    "name": "Stacklights",
    "color": "#007272"
  },
  "Power Products": {
    "name": "Power Products",
    "color": "#911eb4"
  },
  "Pushbuttons/Switches/Indicators": {
    "name": "Pushbuttons/<br>Switches/Indicators",
    "color": "#f4cce8"
  },
  "Circuit Protection": {
    "name": "Circuit<br>Protection",
    "color": "#ffe119"
  },
  "Safety": {
    "name": "Safety",
    "color": "#9b0000"
  },
  "Tools & Test Equipment": {
    "name": "Tools & Test<br>Equipment",
    "color": "#bcbd22"
  },
  "Wiring Solutions": {
    "name": "Wiring Solutions",
    "color": "#bc8b81"
  },
  "Enclosures": {
    "name": "Enclosures",
    "color": "#103d5d"
  },
  "Terminal Blocks": {
    "name": "Terminal Blocks",
    "color": "#ffb574"
  },
  "Power Transmission": {
    "name": "Power<br>Transmission",
    "color": "#165016"
  },
  "Other Categories": {
    "name": "Other Categories",
    "color": "#5fe0ed"
  },
  "Miscellaneous": {
    "name": "Miscellaneous",
    "color": "#000000"
  }
};

// Must be in the form YYYY-MM-DD
const joinDate = "2008-04-11";

var autoScrollDivs = [];