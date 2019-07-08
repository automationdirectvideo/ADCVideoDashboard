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

// Calls the Data API for channels with a request and returns response to 
// callback
function callDataAPIChannels(request, source, callback) {
  gapi.client.youtube.channels.list(request)
    .then(response => {
      console.log(source, response);
      callback(response);
    })
    .catch(err => {
      console.error("Data API call error", err);
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

// Calls the Sheets API for getting values with a request and returns response
// to callback
function callSheetsAPIGet(request, source, callback, message) {
  gapi.client.sheets.spreadsheets.values.get(request)
    .then(response => {
      console.log(source, response);
      callback(response, message);
    })
    .catch(err => {
      console.error("Google Sheets API call error", err);
    });
}

// Calls the Sheets API for updating values with a request and returns response
// to callback
function callSheetsAPIUpdate(request, source, callback) {
  gapi.client.sheets.spreadsheets.values.update(request)
    .then(response => {
      console.log(source, response);
      callback(response);
    })
    .catch(err => {
      console.error("Google Sheets API call error", err);
    });
}

// Calls the Sheets API for appending values with a request and returns response
// to callback
function callSheetsAPIAppend(request, source, callback) {
  gapi.client.sheets.spreadsheets.values.append(request)
    .then(response => {
      console.log(source, response);
      callback(response);
    })
    .catch(err => {
      console.error("Google Sheets API call error", err);
    });
}

// Calls the Drive API for getting files with a request and returns response to
// callback
function callDriveAPIFiles(request, source, callback, message) {
  gapi.client.drive.files.get(request)
    .then(response => {
      console.log(source, response);
      callback(response, message);
    })
    .catch(err => {
      console.error("Google Sheets API call error", err);
    });
}