const defaultSettings = 
{
  "cycleSpeed": 10,
  "dashboards": [
    {
      "name": "platform",
      "index": 0,
      "theme": "light"
    },
    {
      "name": "top-ten",
      "index": 1,
      "theme": "light"
    },
    {
      "name": "thumbnails",
      "index": 2,
      "theme": "light"
    },
    {
      "name": "views",
      "index": 3,
      "theme": "light"
    },
    {
      "name": "seo",
      "index": 4,
      "theme": "light"
    },
    {
      "name": "real-time-stats",
      "index": 5,
      "theme": "light"
    },
    {
      "name": "top-video-1",
      "index": 6,
      "theme": "light"
    }
  ],
  "footer": "show",
  "numEnabled": 7
};

const defaultChannel = "automationdirect";
// Must be in the form YYYY-MM-DD
const joinDate = "2008-04-11";
const defaultNumDays = 30;
const uploadsPlaylistId = "UUR5c2ZGLZY2FFbxZuSxzzJg";
var numVideosProcessed = 0;

// Average video duration in seconds of the 926 public videos in uploadsIds
const averageVideoDuration = 251.4;