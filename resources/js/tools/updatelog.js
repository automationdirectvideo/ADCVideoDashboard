/**
 * @fileoverview Creates the update log table
 */

/**
 * Gets list of updates from the log Google Sheet and displays them in a table
 *
 * @returns {Promise} Status message
 */
function loadUpdateLog() { 
  return requestSpreadsheetData("Logs", "Update Log")
    .then(updateValues => {
      console.log("UpdateValues: ", updateValues);
      const updateTableBody = document.getElementById("update-table-body");
      let output = ``;
      const columns = getColumnHeaders(updateValues);
      for (let index = updateValues.length - 1; index >= 1; index--) {
        const update = updateValues[index];
        const time = update[columns["Time"]];
        const sortTime = new Date(time).getTime();
        const browser = update[columns["Browser"]];
        let loginStatus;
        if (update[columns["Login Status"]].toUpperCase() == "TRUE") {
          loginStatus = "Logged In";
        } else {
          loginStatus = "Not Logged In";
        }
        const message = update[columns["Message"]];
        output += `
        <tr>
          <td data-sort="${sortTime}">${time}</td>
          <td>${browser}</td>
          <td>${loginStatus}</td>
          <td>${message}</td>
        </tr>
        `;
      }
      updateTableBody.innerHTML = output;
      $("#update-table").DataTable({
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
  loadUpdateLog();
}