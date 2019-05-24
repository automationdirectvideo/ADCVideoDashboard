// Options
const CLIENT_ID = "440646774290-ism1om8j8hnp1js8tsc9603ogo6uvhco.apps.googleusercontent.com";
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest',
  'https://youtubeanalytics.googleapis.com/$discovery/rest?version=v2'
];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly';

const authorizeButton = document.getElementById("authorize-button");
const loginBox = document.getElementById("login-box");
const content = document.getElementById("content");

const defaultChannel = "automationdirect";
// Must be in the form YYYY-MM-DD
const joinDate = "2008-04-11";
const defaultNumDays = 30;
const uploadsPlaylistId = "UUR5c2ZGLZY2FFbxZuSxzzJg";
var numVideosProcessed = 0;

// Load auth2 library
function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

// Init API client library and set up sign in listeners
function initClient() {
  gapi.client.init({
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
    requestChannelInfo(defaultChannel);
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