/* Functions that send a request to Google APIs */

// Calls the Analytics API with a request and returns response to callback
function callAnalyticsAPI(request, source, callback, message) {
  gapi.client.youtubeAnalytics.reports.query(request)
    .then(response => {
      console.log(source, response);
      callback(response, message);
    })
    .catch(err => {
      console.error("Analytics API call error", err);
    });
}

// Calls the Data API for videos with a request and returns response to callback
function callDataAPIVideos(request, source, callback, message) {
  gapi.client.youtube.videos.list(request)
    .then(response => {
      console.log(source, response);
      callback(response, message);
    })
    .catch(err => {
      console.error("Data API call error", err);
    });
}
