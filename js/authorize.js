/* Variables and functions for connecting to Google APIs */

// Options
const API_KEY = "AIzaSyAd5qRbldWGyKfLnI27Pga5yUM-TFatp58";
const CLIENT_ID = "440646774290-ism1om8j8hnp1js8tsc9603ogo6uvhco" +
    ".apps.googleusercontent.com";
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest',
  'https://youtubeanalytics.googleapis.com/$discovery/rest?version=v2',
  'https://sheets.googleapis.com/$discovery/rest?version=v4',
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly ' +
    'https://www.googleapis.com/auth/yt-analytics.readonly ' +
    'https://www.googleapis.com/auth/spreadsheets.readonly ' +
    'https://www.googleapis.com/auth/spreadsheets ' +
    'https://www.googleapis.com/auth/drive.metadata.readonly';

const authorizeButton = document.getElementById("authorize-button");
const signoutButton = document.getElementById("signout-button");

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
    loadSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignout;
  });
}

function updateSigninStatus(isSignedIn) {
  window.location.reload();
}

// Load page based on sign in state
function loadSigninStatus(isSignedIn) {
  if (isSignedIn) {
    loadSignedIn();
  } else {
    loadSignedOut();
  }
}

// Handle login
function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn();
}

// Login shortcut
function signIn() {
  if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
    handleAuthClick();
  }
}

// Handle logout
function handleSignout() {
  gapi.auth2.getAuthInstance().signOut();
  window.location.reload();
}