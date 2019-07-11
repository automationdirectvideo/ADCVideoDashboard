/* Values needed across the site */

const defaultSettings = 
{
  "cycleSpeed": 10,
  "dashboards": [
    {
      "name": "real-time-stats",
      "icon": "fas fa-clock",
      "index": 0,
      "theme": "light",
      "title": "Real Time Channel Stats"
    },
    {
      "name": "platform",
      "icon": "fas fa-user",
      "index": 1,
      "theme": "light",
      "title": "Platform Dashboard"
    },
    {
      "name": "thumbnails",
      "icon": "fas fa-images",
      "index": 2,
      "scrollSpeed": 40,
      "theme": "light",
      "title": "1000 Thumbnail Dashboard"
    },
    {
      "name": "product-categories",
      "icon": "fas fa-chart-pie",
      "index": 3,
      "theme": "light",
      "title": "Product Categories Dashboard"
    },
    {
      "name": "top-ten",
      "icon": "far fa-calendar-alt",
      "index": 4,
      "scrollSpeed": 40,
      "theme": "light",
      "title": "Top Ten Dashboard"
    },
    {
      "name": "feedback",
      "icon": "fas fa-comment-alt",
      "index": 5,
      "scrollSpeed": 30,
      "theme": "light",
      "title": "User Feedback Dashboard"
    },
    {
      "name": "top-video-1",
      "icon": "fas fa-play-circle",
      "index": 6,
      "theme": "light",
      "title": "Programmable Controllers - Most Watched Video"
    },
    {
      "name": "top-video-2",
      "icon": "fas fa-play-circle",
      "index": 7,
      "theme": "light",
      "title": "Drives - Most Watched Video"
    },
    {
      "name": "top-video-3",
      "icon": "fas fa-play-circle",
      "index": 8,
      "theme": "light",
      "title": "HMI - Most Watched Video"
    },
    {
      "name": "top-video-4",
      "icon": "fas fa-play-circle",
      "index": 9,
      "theme": "light",
      "title": "Motion Control - Most Watched Video"
    },
    {
      "name": "top-video-5",
      "icon": "fas fa-play-circle",
      "index": 10,
      "theme": "light",
      "title": "Sensors/Encoders - Most Watched Video"
    },
    {
      "name": "top-video-6",
      "icon": "fas fa-play-circle",
      "index": 11,
      "theme": "light",
      "title": "Motors - Most Watched Video"
    }
  ],
  "numEnabled": 12
};

// Must be in the form YYYY-MM-DD
const joinDate = "2008-04-11";

var autoScrollDivs = [];

var totalNumGraphs = 18;