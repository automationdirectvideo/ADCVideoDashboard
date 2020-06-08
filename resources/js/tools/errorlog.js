/**
 * @fileoverview Creates the error log table.
 */

/**
 * Gets list of errors from the log Google Sheet and displays them in a table
 *
 * @returns {Promise} Status message
 */
function loadErrorLog() { 
  return requestSpreadsheetData("Logs", "Error Log")
    .then(errorValues => {
      console.log("ErrorValues: ", errorValues);
      const errorTableBody = document.getElementById("error-table-body");
      let output = ``;
      const columns = getColumnHeaders(errorValues);
      for (let index = errorValues.length - 1; index >= 1; index--) {
        const error = errorValues[index];
        const time = error[columns["Time"]];
        const sortTime = new Date(time).getTime();
        const browser = error[columns["Browser"]];
        let loginStatus;
        if (error[columns["Login Status"]].toUpperCase() == "TRUE") {
          loginStatus = "Logged In";
        } else {
          loginStatus = "Not Logged In";
        }
        const message = error[columns["Message"]];
        const name = error[columns["Name"]];
        output += `
        <tr>
          <td data-sort="${sortTime}">${time}</td>
          <td>${browser}</td>
          <td>${loginStatus}</td>
          <td>${message}</td>
          <td>${name}</td>
        </tr>
        `;
      }
      errorTableBody.innerHTML = output;
      $("#error-table").DataTable({
        "order": [[0, 'desc']],
        "pageLength": 25
      });
      document.getElementById("table-loading").style.display = "none";
    })
    .catch(err => {
      const errorMsg = "Unable to display error log: ";
      console.error(errorMsg, err);
      recordError(err, errorMsg);
    });
}

/**
 * Loads the page once the user has signed into Google
 */
function loadSignedIn() {
  const loadingCog = document.getElementById("table-loading");
  loadingCog.style.display = "";
  loadErrorLog();
}