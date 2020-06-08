/**
 * @fileoverview Variables and function for connecting to Google APIs. Designed
 * for the tools pages.
 */

const API_KEY = "AIzaSyAd5qRbldWGyKfLnI27Pga5yUM-TFatp58";
const CLIENT_ID = "440646774290-ism1om8j8hnp1js8tsc9603ogo6uvhco" +
  ".apps.googleusercontent.com";
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest',
  'https://youtubeanalytics.googleapis.com/$discovery/rest?version=v2',
  'https://sheets.googleapis.com/$discovery/rest?version=v4'
];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly ' +
  'https://www.googleapis.com/auth/yt-analytics.readonly ' +
  'https://www.googleapis.com/auth/spreadsheets.readonly ' +
  'https://www.googleapis.com/auth/spreadsheets ' +
  'https://www.googleapis.com/auth/youtube.force-ssl';

/**
 * Loads auth2 library
 */
function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

/**
 * Init API client library and set up sign in listeners
 */
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: DISCOVERY_DOCS,
    clientId: CLIENT_ID,
    scope: SCOPES
  })
  .then(() => {
    // Listen for sign in state changes
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    // Handle initial sign in state
    loadSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  });
}

/**
 * Updates the page based on the new signed in status
 *
 * @param {Boolean} isSignedIn The sign in status of the user
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    if (!isUserADC()) {
      // The user is not ADC
      handleInvalidAccount();
    } else {
      // The user is ADC. Reload the page to load the signed in view
      window.location.reload();
    }
  }
}

/**
 * Load page based on sign in state
 *
 * @param {Booleans} isSignedIn The sign in status of the user
 */
function loadSigninStatus(isSignedIn) {
  if (isSignedIn) {
    if (!isUserADC()) {
      // The user is not ADC
      handleInvalidAccount();
    } else {
      console.log("Signed In");
      loadSignedIn();
    }
  } else {
    // Show a sign in modal. Prevent using the page until signed in
    console.log("Signed Out");
    createSignInModal();
    const authorizeButton = document.getElementById("authorize-button");
    authorizeButton.onclick = handleAuthClick;
    $('#signinModal').modal({
      backdrop: 'static',
      keyboard: false
    });
  }
}

/**
 * Handles login action
 */
function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 * Login shortcut
 */
function signIn() {
  if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
    handleAuthClick();
  }
}

/**
 * Handles logout action
 */
function handleSignout() {
  gapi.auth2.getAuthInstance().signOut();
  window.location.reload();
}

/**
 * Signs out user who is not ADC and displays an error on the signin modal
 */
function handleInvalidAccount() {
  console.log("Error: You are not ADC");
  gapi.auth2.getAuthInstance().currentUser.get().disconnect();
  $("#signinModal").modal("show");
  $("#invalid-account-alert").show();
}

/**
 * Creates a modal that prompts sign in
 */
function createSignInModal() {
  const innerHTML = `
    <div class="modal fade" id="signinModal" tabindex="-1" role="dialog" aria-labelledby="signinModal" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="signinModalLabel">Sign In</h5>
          </div>
          <div class="modal-body">
            <p>Sign In with the AutomationDirect YouTube account to use this tool.</p>
            <div class="alert alert-danger fade show mb-2 text-center" role="alert" id="invalid-account-alert" style="display:none;">
              <strong><i class="fas fa-exclamation-triangle"></i> Invalid Account:</strong> You have
              logged in with an invalid Google account. You must log in with the <strong>AutomationDirect YouTube account</strong>.
            </div>
          </div>
          <div class="modal-footer">
            <a href="index.html" class="btn btn-secondary" id="return-button">Return to Dashboard</a>
            <button type="button" class="btn btn-primary" id="authorize-button">Sign In</button>
          </div>
        </div>
      </div>
    </div>
  `;
  const modal = createElement(innerHTML, "DIV");
  document.body.appendChild(modal);
}