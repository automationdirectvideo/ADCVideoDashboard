// Options
const API_KEY = "AIzaSyAd5qRbldWGyKfLnI27Pga5yUM-TFatp58";
const CLIENT_ID = "440646774290-ism1om8j8hnp1js8tsc9603ogo6uvhco.apps.googleusercontent.com";
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest',
  'https://youtubeanalytics.googleapis.com/$discovery/rest?version=v2',
  'https://content.googleapis.com/discovery/v1/apis/sheets/v4/rest'
];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/spreadsheets.readonly';

const authorizeButton = document.getElementById("authorize-button");
const loginBox = document.getElementById("login-box");
const content = document.getElementById("content");

// Load auth2 library
function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

// Init API client library and set up sign in listeners
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: DISCOVERY_DOCS,
    clientId: CLIENT_ID,
    scope: SCOPES
  }).then(() => {
    // Listen for sign in state changes
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    // Handle initial sign in state
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
  });
}

// Update UI sign in state changes
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    loginBox.style.display = "none";
    content.style.display = "block";
    testAPICalls();
  } else {
    loginBox.style.display = "block";
    content.style.display = "none";
  }
}

// Handle login
function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn();
}

// Handle logout
function handleSignout() {
  gapi.auth2.getAuthInstance().signOut();
}