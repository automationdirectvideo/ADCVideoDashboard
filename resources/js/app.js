/* Helpful utility functions */

// Capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Converts a decimal to a percent with 1 decimal place
function decimalToPercent(decimal) {
    return Math.round(decimal * 1000) / 10;
}

// Get date from numDaysAgo from today in the form YYYY-MM-DD
function getDateFromDaysAgo(numDaysAgo) {
    var today = new Date();
    var priorDate = new Date().setDate(today.getDate() - numDaysAgo);
    priorDate = new Date(priorDate);
    return getYouTubeDateFormat(priorDate);
}

// Get today's date in the form YYYY-MM-DD
function getTodaysDate() {
    return getYouTubeDateFormat(new Date());
}

// Get a date in the form YYYY-MM-DD
function getYouTubeDateFormat(date) {
    var dd = String(date.getDate()).padStart(2, "0");
    var mm = String(date.getMonth() + 1).padStart(2, "0");
    var yyyy = date.getFullYear();
    today = yyyy + "-" + mm + "-" + dd;
    return today;
}

// Converts ISO-8601 duration to seconds (e.g. PT5M25S -> 325 seconds)
function isoDurationToSeconds(duration) {
    duration = duration.replace("PT", "").replace("H", ":").replace("M", ":")
        .replace("S", "");
    durationArr = duration.split(":");
    let seconds;
    if (durationArr.length == 3) {
        seconds = Number(durationArr[0]) * 3600 +
            Number(durationArr[1]) * 60 + Number(durationArr[2]);
    } else if (durationArr.length == 2) {
        seconds = Number(durationArr[0]) * 60 + Number(durationArr[1]);
    } else {
        seconds = duration;
    }
    return seconds;
}

// Get number of months between two dates (ignoring the day of the month)
function monthDiff(dateFrom, dateTo) {
    return dateTo.getMonth() - dateFrom.getMonth() +
        (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
}

// Add commas to number
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Searches input text for URLs and returns list of found URLs
function searchForURLs(inputText) {
    var findURLs = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
    var links = [];
    var match;
    do {
        match = findURLs.exec(inputText);
        if (match) {
            links.push(match[0]);
        }
    } while (match);
    return links;
}

// Converts seconds to duration in the form M:SS
function secondsToDuration(seconds) {
    let minutes = Math.floor(seconds / 60);
    let durationSeconds = ('00' + seconds % 60).substr(-2);
    return minutes + ":" + durationSeconds;
}

function secondsToDurationMinSec(seconds) {
    let minutes = Math.floor(seconds / 60);
    let durationSeconds = ("00" + seconds % 60).substr(-2);
    return minutes + " min " + durationSeconds + " sec";
}

// Reloads thumbnail with lower quality if max resolution thumbnail throws 404
function thumbnailCheck(e, highQuality) {
    var thumbnailURL = e.attr("src");
    if (e[0].naturalWidth == 120 && e[0].naturalHeight == 90) {
        if (highQuality === true) {
            // Keeps higher resolution but adds black bars across top and bottom
            e.attr("src", thumbnailURL.replace("maxresdefault", "hqdefault"));
        } else {
            // Lower resolution but no black bars
            e.attr("src", thumbnailURL.replace("maxresdefault", "mqdefault"));
        }
    }
}

/* Values needed across the site */

const defaultSettings =
{
    "cycleSpeed": 15,
    "dashboards": [
        {
            "name": "intro-animation",
            "icon": "fas fa-video",
            "index": 0,
            "theme": "light",
            "title": "Intro Animation"
        },
        {
            "name": "real-time-stats",
            "icon": "fas fa-clock",
            "index": 1,
            "theme": "light",
            "title": "Real Time Channel Stats"
        },
        {
            "name": "platform",
            "icon": "fas fa-user",
            "index": 2,
            "theme": "light",
            "title": "Platform Dashboard"
        },
        {
            "name": "thumbnails",
            "icon": "fas fa-images",
            "index": 3,
            "scrollSpeed": 40,
            "theme": "light",
            "title": "1000 Thumbnail Dashboard"
        },
        {
            "name": "product-categories",
            "icon": "fas fa-chart-pie",
            "index": 4,
            "theme": "light",
            "title": "Product Categories Dashboard"
        },
        {
            "name": "top-ten",
            "icon": "far fa-calendar-alt",
            "index": 5,
            "theme": "light",
            "title": "Top Ten Dashboard"
        },
        {
            "name": "feedback",
            "icon": "fas fa-comment-alt",
            "index": 6,
            "scrollSpeed": 30,
            "theme": "light",
            "title": "User Feedback Dashboard"
        },
        {
            "name": "top-video-1",
            "icon": "fas fa-play-circle",
            "index": 7,
            "theme": "light",
            "title": "Programmable Controllers - Most Watched Video"
        },
        {
            "name": "top-video-2",
            "icon": "fas fa-play-circle",
            "index": 8,
            "theme": "light",
            "title": "Drives - Most Watched Video"
        },
        {
            "name": "top-video-3",
            "icon": "fas fa-play-circle",
            "index": 9,
            "theme": "light",
            "title": "HMI - Most Watched Video"
        },
        {
            "name": "top-video-4",
            "icon": "fas fa-play-circle",
            "index": 10,
            "theme": "light",
            "title": "Motion Control - Most Watched Video"
        },
        {
            "name": "top-video-5",
            "icon": "fas fa-play-circle",
            "index": 11,
            "theme": "light",
            "title": "Sensors/Encoders - Most Watched Video"
        },
        {
            "name": "top-video-6",
            "icon": "fas fa-play-circle",
            "index": 12,
            "theme": "light",
            "title": "Motors - Most Watched Video"
        },
        {
            "name": "card-performance",
            "icon": "fas fa-info-circle",
            "index": 13,
            "theme": "light",
            "title": "Card Performance Dashboard"
        }
    ],
    "numEnabled": 14
};

const categoryColors = {
    "Programmable Controllers": {
        "name": "Programmable<br>Controllers",
        "color": "#1f77b4",
    },
    "Drives": {
        "name": "Drives",
        "color": "#000075"
    },
    "HMI": {
        "name": "HMI",
        "color": "#ff7f0e"
    },
    "Process Control & Measurement": {
        "name": "Process Control<br>& Measurement",
        "color": "#2ca02c"
    },
    "Motion Control": {
        "name": "Motion Control",
        "color": "#d62728"
    },
    "Cables": {
        "name": "Cables",
        "color": "#e77c7c"
    },
    "Sensors/Encoders": {
        "name": "Sensors/Encoders",
        "color": "#9467bd"
    },
    "Motors": {
        "name": "Motors",
        "color": "#8c564b"
    },
    "Motor Controls": {
        "name": "Motor Controls",
        "color": "#e377c2"
    },
    "Field I/O": {
        "name": "Field I/O",
        "color": "#aaffc3"
    },
    "Communications": {
        "name": "Communications",
        "color": "#a26c21"
    },
    "Pneumatic Components": {
        "name": "Pneumatic<br>Components",
        "color": "#7f7f7f"
    },
    "Relays/Timers": {
        "name": "Relays/Timers",
        "color": "#c6aedc"
    },
    "Stacklights": {
        "name": "Stacklights",
        "color": "#007272"
    },
    "Power Products": {
        "name": "Power Products",
        "color": "#911eb4"
    },
    "Pushbuttons/Switches/Indicators": {
        "name": "Pushbuttons/<br>Switches/Indicators",
        "color": "#f4cce8"
    },
    "Circuit Protection": {
        "name": "Circuit<br>Protection",
        "color": "#ffe119"
    },
    "Safety": {
        "name": "Safety",
        "color": "#9b0000"
    },
    "Tools & Test Equipment": {
        "name": "Tools & Test<br>Equipment",
        "color": "#bcbd22"
    },
    "Wiring Solutions": {
        "name": "Wiring Solutions",
        "color": "#bc8b81"
    },
    "Enclosures": {
        "name": "Enclosures",
        "color": "#103d5d"
    },
    "Terminal Blocks": {
        "name": "Terminal Blocks",
        "color": "#ffb574"
    },
    "Power Transmission": {
        "name": "Power<br>Transmission",
        "color": "#165016"
    },
    "Other Categories": {
        "name": "Other Categories",
        "color": "#5fe0ed"
    },
    "Miscellaneous": {
        "name": "Miscellaneous",
        "color": "#000000"
    }
};

// Must be in the form YYYY-MM-DD
const joinDate = "2008-04-11";

var autoScrollDivs = [];

var totalNumGraphs = 29;

/* Handles fullscreen mode */

window.onload = function () {
    document.getElementById('fullscreen-button')
        .addEventListener("click", function () { toggleFullscreen(); });
}
const doc = document.documentElement;

function openFullscreen() {
    if (!document.fullscreen) {
        if (doc.requestFullscreen) {
            doc.requestFullscreen();
        } else if (doc.mozRequestFullScreen) {
            doc.mozRequestFullScreen();
        } else if (doc.webkitRequestFullscreen) {
            doc.webkitRequestFullscreen();
        } else if (doc.msRequestFullscreen) {
            doc.msRequestFullscreen();
        }
    }
}

function closeFullscreen() {
    if (document.fullscreen) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function toggleFullscreen() {
    if (document.fullscreen) {
        closeFullscreen();
    } else {
        openFullscreen();
    }
}

document.addEventListener("fullscreenchange", function (e) {
    const fullscreenButton = document.getElementById('fullscreen-button');
    if (document.fullscreen) {
        fullscreenButton.className = "fas fa-compress-arrows-alt";
    } else {
        fullscreenButton.className = "fas fa-expand-arrows-alt";
    }
});


/* Variables and functions for connecting to Google APIs */

// Options
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
    'https://www.googleapis.com/auth/spreadsheets';

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

/* Functions that send a request to Google APIs */

// Calls the Analytics API with a request and returns response to callback
function callAnalyticsAPI(request, source, callback, message) {
    gapi.client.youtubeAnalytics.reports.query(request)
        .then(response => {
            //console.log(source, response);
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
            //console.log(source, response);
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
            //console.log(source, response);
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
            //console.log(source, response);
            callback(response, message);
        })
        .catch(err => {
            console.error("Google Sheets API call error", err);
        });
}

// Calls the Sheets API for updating values with a request and returns response
// to callback
function callSheetsAPIUpdate(request, source, callback, message) {
    gapi.client.sheets.spreadsheets.values.update(request)
        .then(response => {
            //console.log(source, response);
            callback(response, message);
        })
        .catch(err => {
            console.error("Google Sheets API call error", err);
        });
}

/* Handles responses of API calls */


/* 1000 Thumbnail Dashboard Calls */

// Displays the number of videos the channel has
function handleChannelNumVideos(response) {
    if (response) {
        let numVideos = response.result.items[0].statistics.videoCount;
        document.getElementById("num-videos").innerText = numVideos;
    }
}


/* Get All Video Stats Calls */

// Saves video stats to allVideoStats and categoryTotals
// Semi-recursively calls requestVideoStatisticsOverall for all uploads
function handleVideoStatisticsOverall(response, settings) {
    if (response) {
        let videoId = response.result.items[0].id;
        let videoStats = response.result.items[0].statistics;
        let durationStr = response.result.items[0].contentDetails.duration;
        let duration = parseInt(isoDurationToSeconds(durationStr));
        let viewCount = parseInt(videoStats.viewCount);
        let likeCount = parseInt(videoStats.likeCount);
        let dislikeCount = parseInt(videoStats.dislikeCount);
        let commentCount = parseInt(videoStats.commentCount);
        let allVideoStats = JSON.parse(localStorage.getItem("allVideoStats"));
        let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
        let categoryTotals = JSON.parse(localStorage.getItem("categoryTotals"));
        let row = {
            "videoId": videoId,
            "views": viewCount,
            "likes": likeCount,
            "dislikes": dislikeCount,
            "comments": commentCount
        };
        allVideoStats.push(row);
        statsByVideoId[videoId]["duration"] = duration;
        let categories = statsByVideoId[videoId]["categories"];
        for (let i = 0; i < categories.length; i++) {
            let categoryId = categories[i];
            let categoryViews = parseInt(categoryTotals[categoryId]["views"]);
            let categoryLikes = parseInt(categoryTotals[categoryId]["likes"]);
            let categoryDuration = parseInt(categoryTotals[categoryId]["duration"]);
            let categoryVideos = categoryTotals[categoryId]["videos"];
            categoryVideos.push(videoId);
            categoryTotals[categoryId]["views"] = categoryViews + viewCount;
            categoryTotals[categoryId]["likes"] = categoryLikes + likeCount;
            categoryTotals[categoryId]["duration"] = categoryDuration + duration;
            categoryTotals[categoryId]["videos"] = categoryVideos;
        }
        localStorage.setItem("categoryTotals", JSON.stringify(categoryTotals));
        localStorage.setItem("allVideoStats", JSON.stringify(allVideoStats));
        localStorage.setItem("statsByVideoId", JSON.stringify(statsByVideoId));

        let uploads = settings["uploads"];
        let index = parseInt(settings["index"]);
        if (index + 1 < uploads.length) {
            settings["index"] = index + 1;
            requestVideoStatisticsOverall(settings);
        } else {
            calcCategoryStats();
        }
    }
}

function handleVideoViewsByYear(response, settings) {
    if (response) {
        let stats = response.result.rows[0];
        if (stats) {
            let videoId = stats[0];
            let viewCount = stats[1];
            let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
            let categoryYearlyTotals =
                JSON.parse(localStorage.getItem("categoryYearlyTotals"));
            let categories = statsByVideoId[videoId]["categories"];
            for (let i = 0; i < categories.length; i++) {
                let categoryId = categories[i];
                let categoryViews = parseInt(categoryYearlyTotals[categoryId]["views"]);
                let categoryNumVideos =
                    parseInt(categoryYearlyTotals[categoryId]["numVideos"]);
                categoryYearlyTotals[categoryId]["views"] = categoryViews + viewCount;
                categoryYearlyTotals[categoryId]["numVideos"] = categoryNumVideos + 1;
            }
            localStorage.setItem("categoryYearlyTotals",
                JSON.stringify(categoryYearlyTotals));
        }

        let uploads = settings["uploads"];
        let index = parseInt(settings["index"]);
        if (index + 1 < uploads.length) {
            settings["index"] = index + 1;
            requestVideoViewsByYear(settings);
        } else {
            let year = settings["year"];
            saveCategoryYearlyStatsToSheets(year);
        }
    }
}


/* Platform Dashboard Calls */

// Loads demographics table in platform dashboard
function handleChannelDemographics(response) {
    if (response) {
        var rows = response.result.rows;
        let maleTotal = 0;
        let femaleTotal = 0;
        let maleMax = 0;
        let femaleMax = 0;
        for (var i = 0; i < rows.length; i++) {
            let percentage = parseFloat(rows[i][2]);
            if (rows[i][1] == "female") {
                femaleTotal += percentage;
                if (percentage > femaleMax) {
                    femaleMax = percentage;
                }
            } else {
                maleTotal += percentage;
                if (percentage > maleMax) {
                    maleMax = percentage;
                }
            }
        }
        for (var i = 0; i < rows.length; i++) {
            let range = rows[i][0].substr(3);
            let percentage = rows[i][2];
            let cell = document.getElementById(rows[i][1] + "-" + range);
            cell.innerHTML = `<span>${percentage}</span>%`;
            if (rows[i][1] == "female") {
                cell.style.opacity = ((parseFloat(percentage) / femaleMax) + 1.5) / 2.5;
            } else {
                cell.style.opacity = ((parseFloat(percentage) / maleMax) + 1.5) / 2.5;
            }
        }
        maleTotal = Math.round(maleTotal * 10) / 10;
        femaleTotal = Math.round(femaleTotal * 10) / 10;
        if (maleTotal + femaleTotal != 100) {
            let diff = 100 - (maleTotal + femaleTotal);
            femaleTotal += diff;
            femaleTotal = Math.round(femaleTotal * 10) / 10;
        }
        document.getElementById("male-title").innerHTML = `
        <i class="fas fa-male" style="font-size:3rem"></i>
        <br>
        <span style="font-size:2rem">${maleTotal}</span>
        %
      `;
        document.getElementById("female-title").innerHTML = `
        <i class="fas fa-female" style="font-size:3rem"></i>
        <br>
        <span style="font-size:2rem">${femaleTotal}</span>
        %
      `;

        var graphId = "demographics-graph";
        var graphHeight = 0.0875;
        var graphWidth = 0.0500;
        var height = graphHeight * document.documentElement.clientHeight;
        var width = graphWidth * document.documentElement.clientWidth;

        var values = [maleTotal, femaleTotal];
        var labels = ["Male", "Female"];
        var data = [{
            values: values,
            labels: labels,
            textinfo: "none",
            hoverinfo: "none",
            marker: {
                colors: ["rgb(84, 157, 209)", "rgb(146, 111, 209)"]
            },
            type: 'pie',
        }];

        var layout = {
            height: height,
            weight: width,
            showlegend: false,
            margin: {
                l: 0,
                r: 0,
                t: 0,
                b: 0,
                pad: 4
            }
        };

        var config = {
            staticPlot: true
        };

        recordGraphData(graphId, data, layout, config, graphHeight, graphWidth);

        if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
            var currentSettings = JSON.parse(localStorage.getItem("settings"));
            var theme = "";
            var index = 0;
            while (index < currentSettings.dashboards.length && theme == "") {
                if (currentSettings.dashboards[index].name == "platform") {
                    theme = currentSettings.dashboards[index].theme;
                }
                index++;
            }
            if (theme == "dark") {
                layout["plot_bgcolor"] = "#222";
                layout["paper_bgcolor"] = "#222";
            }
        }

        var graphContainer = document.getElementById(graphId);
        graphContainer.style.height = width + "px";
        graphContainer.style.width = width + "px";

        Plotly.newPlot(graphId, data, layout, config);

        recordGraphSize(graphId, graphHeight, graphWidth);

        if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
            var body = {
                values: [
                    [
                        JSON.stringify(rows)
                    ]
                ]
            }
            requestUpdateSheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
                "Channel Demographics", body);
        }
    }
}

// Creates top search terms graph in platform dashboard
function handleChannelSearchTerms(response) {
    if (response) {
        let searchTerms = response.result.rows;
        let xValues = [];
        let yValues = [];
        let numTerms = Math.min(9, searchTerms.length + - 1);
        for (var i = numTerms; i >= 0; i--) {
            xValues.push(searchTerms[i][1]);
            yValues.push(searchTerms[i][0]);
        }
        var textValues = xValues.map(String);
        for (var i = 0; i < textValues.length; i++) {
            textValues[i] = numberWithCommas(textValues[i]);
        }

        var graphId = "channel-search-terms";
        var graphHeight = 0.2287;
        var graphWidth = 0.4681;
        var height = graphHeight * document.documentElement.clientHeight;
        var width = graphWidth * document.documentElement.clientWidth;
        var fontSize = Math.floor(0.0125 * document.documentElement.clientWidth);
        var yaxis = {
            showline: true,
            showticklabels: true,
            tickmode: 'linear',
            automargin: true
        };
        var automargin = { yaxis: yaxis };

        var data = [
            {
                x: xValues,
                y: yValues,
                type: 'bar',
                orientation: 'h',
                text: textValues,
                textposition: 'auto',
                marker: {
                    color: 'rgb(255,0,0)'
                }
            }
        ];

        var layout = {
            height: height,
            width: width,
            font: { size: fontSize },
            margin: {
                b: 10,
                r: 0,
                t: 10,
            },
            xaxis: {
                visible: false,
                automargin: true
            },
            yaxis: yaxis
        };

        var config = {
            staticPlot: true,
            responsive: true
        };

        recordGraphData(graphId, data, layout, config, graphHeight, graphWidth,
            automargin);

        var currentSettings = JSON.parse(localStorage.getItem("settings"));
        var theme = "";
        var index = 0;
        while (index < currentSettings.dashboards.length && theme == "") {
            if (currentSettings.dashboards[index].name == "platform") {
                theme = currentSettings.dashboards[index].theme;
            }
            index++;
        }
        if (theme == "dark") {
            layout["plot_bgcolor"] = "#222";
            layout["paper_bgcolor"] = "#222";
            layout["font"]["color"] = "#fff";
            yaxis["linecolor"] = "#fff";
            layout["yaxis"] = yaxis;
            automargin = { yaxis: yaxis };
        }

        Plotly.newPlot(graphId, data, layout, config);

        recordGraphSize(graphId, graphHeight, graphWidth, automargin);
    }
}

// Creates minutes by subscribers graph in platform dashboard
function handleMinutesSubscribedStatus(response) {
    if (response) {
        var rows = response.result.rows;
        var labelConversion = {
            "UNSUBSCRIBED": "Not Subscribed",
            "SUBSCRIBED": "Subscribed"
        };
        var total = 0;
        var xValues = [];
        var yValues = [];
        for (var i = 0; i < rows.length; i++) {
            total += rows[i][1];
            xValues.push(rows[i][1]);
            yValues.push(labelConversion[rows[i][0]]);
        }
        var textValues = [];
        for (var i = 0; i < xValues.length; i++) {
            textValues[i] = decimalToPercent(xValues[i] / total) + "%";
        }
        if (xValues[0] > xValues[1]) {
            xValues.reverse();
            yValues.reverse();
            textValues.reverse();
        }

        var graphId = "channel-watch-time";
        var graphHeight = 0.1039;
        var graphWidth = 0.4681;
        var height = graphHeight * document.documentElement.clientHeight;
        var width = graphWidth * document.documentElement.clientWidth;
        var fontSize = Math.floor(0.0125 * document.documentElement.clientWidth);
        var yaxis = {
            showline: true,
            showticklabels: true,
            tickmode: 'linear',
            automargin: true
        };
        var automargin = { yaxis: yaxis };

        var data = [{
            x: xValues,
            y: yValues,
            type: 'bar',
            orientation: 'h',
            text: textValues,
            textposition: 'auto',
            marker: {
                color: 'rgb(255,0,0)'
            }
        }];

        var layout = {
            height: height,
            width: width,
            font: { size: fontSize },
            margin: {
                r: 0,
                t: 10,
                b: 10
            },
            xaxis: {
                visible: false,
                automargin: true
            },
            yaxis: yaxis,
        };

        var config = {
            staticPlot: true,
            responsive: true
        };

        recordGraphData(graphId, data, layout, config, graphHeight, graphWidth,
            automargin);

        var currentSettings = JSON.parse(localStorage.getItem("settings"));
        var theme = "";
        var index = 0;
        while (index < currentSettings.dashboards.length && theme == "") {
            if (currentSettings.dashboards[index].name == "platform") {
                theme = currentSettings.dashboards[index].theme;
            }
            index++;
        }
        if (theme == "dark") {
            layout["plot_bgcolor"] = "#222";
            layout["paper_bgcolor"] = "#222";
            layout["font"]["color"] = "#fff";
            yaxis["linecolor"] = "#fff";
            layout["yaxis"] = yaxis;
            automargin = { yaxis: yaxis };
        }

        Plotly.newPlot(graphId, data, layout, config);

        recordGraphSize(graphId, graphHeight, graphWidth, automargin);
    }
}

// Creates views by device type graph in platform dashboard
function handleViewsByDeviceType(response) {
    if (response) {
        var rows = response.result.rows;
        var temp = rows[1];
        rows[1] = rows[3];
        rows[3] = temp;
        var labelConversion = {
            "DESKTOP": "Desktop",
            "MOBILE": "Mobile",
            "TABLET": "Tablet",
            "TV": "TV",
            "GAME_CONSOLE": "Game<br>Console"
        };
        var values = [];
        var labels = [];
        for (var i = 0; i < rows.length; i++) {
            values.push(rows[i][1]);
            labels.push(labelConversion[rows[i][0]]);
        }

        var graphId = "channel-views-by-device";
        var graphHeight = 0.3742;
        var graphWidth = 0.3065;
        var height = graphHeight * document.documentElement.clientHeight;
        var width = graphWidth * document.documentElement.clientWidth;
        var fontSize = Math.floor(0.0125 * document.documentElement.clientWidth);

        var data = [{
            values: values,
            labels: labels,
            type: 'pie',
            sort: false,
            textinfo: 'label+percent',
            textposition: ["inside", "outside", "outside", "inside", "outside"],
            rotation: -120,
            direction: 'clockwise'
        }];

        var layout = {
            height: height,
            width: width,
            font: { size: fontSize },
            automargin: true,
            autosize: true,
            showlegend: false,
            margin: {
                l: 0,
                r: 0,
                t: 0,
                b: 20,
                pad: 4
            }
        };

        var config = {
            staticPlot: true,
            responsive: true
        };

        recordGraphData(graphId, data, layout, config, graphHeight, graphWidth);

        var currentSettings = JSON.parse(localStorage.getItem("settings"));
        var theme = "";
        var index = 0;
        while (index < currentSettings.dashboards.length && theme == "") {
            if (currentSettings.dashboards[index].name == "platform") {
                theme = currentSettings.dashboards[index].theme;
            }
            index++;
        }
        if (theme == "dark") {
            layout["plot_bgcolor"] = "#222";
            layout["paper_bgcolor"] = "#222";
            layout["font"]["color"] = "#fff";
        }

        Plotly.newPlot(graphId, data, layout, config);

        recordGraphSize(graphId, graphHeight, graphWidth);
    }
}

// Creates views by state cholorpleth map in platform dashboard
function handleViewsByState(response) {
    if (response) {
        var rows = response.result.rows;
        var locations = [];
        var z = []
        var labels = [];
        for (var i = 0; i < rows.length; i++) {
            locations.push(rows[i][0].substr(3));
            z.push(rows[i][1]);
            labels.push(numberWithCommas(rows[i][1]) + " views")
        }

        var graphId = "channel-views-by-state";
        var graphHeight = 0.3742;
        var graphWidth = 0.4681;
        var height = graphHeight * document.documentElement.clientHeight;
        var width = graphWidth * document.documentElement.clientWidth;
        var fontSize = Math.floor(0.0093 * document.documentElement.clientWidth);

        var data = [{
            type: 'choropleth',
            locationmode: 'USA-states',
            locations: locations,
            z: z,
            text: labels,
            hovertemplate: "%{location}<br>%{text}",
            name: "Views By State",
            autocolorscale: true,
            colorbar: {
                tickfont: {
                    size: fontSize
                }
            }
        }];

        var layout = {
            height: height,
            width: width,
            geo: {
                scope: 'usa',
                countrycolor: 'rgb(255, 255, 255)',
                showland: true,
                landcolor: 'rgb(217, 217, 217)',
                showlakes: true,
                lakecolor: 'rgb(255, 255, 255)',
                subunitcolor: 'rgb(255, 255, 255)'
            },
            margin: {
                l: 0,
                r: 0,
                t: 0,
                b: 10,
                pad: 4
            }
        };

        var config = {
            scrollZoom: false,
            displayModeBar: false,
            responsive: true
        };

        recordGraphData(graphId, data, layout, config, graphHeight, graphWidth);

        var currentSettings = JSON.parse(localStorage.getItem("settings"));
        var theme = "";
        var index = 0;
        while (index < currentSettings.dashboards.length && theme == "") {
            if (currentSettings.dashboards[index].name == "platform") {
                theme = currentSettings.dashboards[index].theme;
            }
            index++;
        }
        if (theme == "dark") {
            layout["plot_bgcolor"] = "#222";
            layout["paper_bgcolor"] = "#222";
            data[0]["colorbar"] = {
                tickfont: {
                    color: "#fff"
                }
            };
            layout["geo"]["bgcolor"] = "#222";
            layout["geo"]["showlakes"] = false;
        }

        Plotly.plot(graphId, data, layout, config);

        recordGraphSize(graphId, graphHeight, graphWidth);
    }
}

// Creates views by traffic source graph in platform dashboard
function handleViewsByTrafficSource(response) {
    if (response) {
        var rows = response.result.rows;
        var advertisingViews = 0;
        var externalViews = 0;
        var youtubeSearchViews = 0;
        var relatedViews = 0;
        var otherViews = 0;
        var advertisingSources = ["ADVERTISING", "PROMOTED"];
        var externalSources = ["EXT_URL", "NO_LINK_EMBEDDED", "NO_LINK_OTHER"];
        var youtubeSearchSources = ["YT_SEARCH"];
        var relatedSources = ["RELATED_VIDEO"];
        for (var i = 0; i < rows.length; i++) {
            if (advertisingSources.includes(rows[i][0])) {
                advertisingViews += rows[i][1];
            } else if (externalSources.includes(rows[i][0])) {
                externalViews += rows[i][1];
            } else if (youtubeSearchSources.includes(rows[i][0])) {
                youtubeSearchViews += rows[i][1];
            } else if (relatedSources.includes(rows[i][0])) {
                relatedViews += rows[i][1];
            } else {
                otherViews += rows[i][1];
            }
        }
        var values = [advertisingViews, externalViews, youtubeSearchViews,
            relatedViews, otherViews];
        var labels = ["Advertising", "External", "YouTube<br>Search",
            "Related<br>Video", "Other"];

        var graphId = "channel-traffic-sources";
        var graphHeight = 0.3742;
        var graphWidth = 0.3065;
        var height = graphHeight * document.documentElement.clientHeight;
        var width = graphWidth * document.documentElement.clientWidth;
        var fontSize = Math.floor(0.0125 * document.documentElement.clientWidth);

        var data = [{
            values: values,
            labels: labels,
            type: 'pie',
            textinfo: 'label+percent',
            textposition: "inside",
            rotation: 90
        }];

        var layout = {
            height: height,
            width: width,
            font: { size: fontSize },
            automargin: true,
            autosize: true,
            showlegend: false,
            margin: {
                l: 0,
                r: 0,
                t: 0,
                b: 10,
                pad: 4
            }
        };

        var config = {
            staticPlot: true,
            responsive: true
        };

        recordGraphData(graphId, data, layout, config, graphHeight, graphWidth);

        var currentSettings = JSON.parse(localStorage.getItem("settings"));
        var theme = "";
        var index = 0;
        while (index < currentSettings.dashboards.length && theme == "") {
            if (currentSettings.dashboards[index].name == "platform") {
                theme = currentSettings.dashboards[index].theme;
            }
            index++;
        }
        if (theme == "dark") {
            layout["plot_bgcolor"] = "#222";
            layout["paper_bgcolor"] = "#222";
            layout["font"]["color"] = "#fff";
        }

        Plotly.newPlot(graphId, data, layout, config);

        recordGraphSize(graphId, graphHeight, graphWidth);
    }
}


/* Real Time Stats Calls */

// Saves stats to realTimeStats then loads them
function handleRealTimeStats(response, message) {
    if (response) {
        if (!localStorage.getItem("realTimeStats")) {
            localStorage.setItem("realTimeStats", JSON.stringify({}));
        }
        let stats = JSON.parse(localStorage.getItem("realTimeStats"));

        let realTimeStats = {};
        let headers = response.result.columnHeaders;
        let row = response.result.rows[0];
        for (let i = 0; i < row.length; i++) {
            realTimeStats[headers[i].name] = row[i];
        }
        realTimeStats["netSubscribersGained"] = realTimeStats.subscribersGained -
            realTimeStats.subscribersLost;
        delete realTimeStats.subscribersGained;
        delete realTimeStats.subscribersLost;
        stats[message] = realTimeStats;
        localStorage.setItem("realTimeStats", JSON.stringify(stats));

        //console.log("Real Time Stats: ", stats);
        // message is either "cumulative", "month", or "today"
        if (message == "cumulative") {
            saveRealTimeStatsToSheets();
            loadRealTimeStats();
        }
    }
}


/* Top Ten Dashboard Calls */

// Saves most watched videos by month to a Google Sheet
function handleMostWatchedVideos(response, month) {
    if (response) {
        var videos = response.result.rows;
        let uploads = JSON.parse(localStorage.getItem("uploads"));
        if (month != undefined) {
            var values = [[month]];
            var index = 0;
            var numVideos = 1;
            while (numVideos <= 10) {
                if (uploads.includes(videos[index][0])) {
                    values[0][numVideos] = videos[index][0];
                    values[0][numVideos + 10] = videos[index][1];
                    values[0][numVideos + 20] = videos[index][2];
                    numVideos++;
                }
                index++;
            }
            var body = {
                "values": values
            };
            var row = 3 + monthDiff(new Date(2010, 6), new Date(month));
            var sheet = "Top Ten Videos!A" + row;
            requestUpdateSheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
                sheet, body);
        }
    }
}


/* Top Video Calls */

// Displays video views, likes, comments, etc. in top video dashboard
function handleVideoBasicStats(response, dashboardId) {
    if (response) {
        let stats = response.result.rows[0];

        let views = document.getElementById(dashboardId + "-views");
        views.innerHTML = numberWithCommas(stats[1]);

        let subsNet = document.getElementById(dashboardId + "-subs-net");
        subsNet.innerHTML = numberWithCommas(stats[7] - stats[8]);

        let likeRatioElem = document.getElementById(dashboardId + "-like-ratio");
        let likes = document.getElementById(dashboardId + "-likes");
        let likeBar = document.getElementById(dashboardId + "-like-bar");
        let likeRatio = decimalToPercent(stats[3] / (stats[3] + stats[4]));
        likeRatioElem.innerHTML = likeRatio + "%";
        likes.innerHTML = numberWithCommas(stats[3]) + " Likes";
        likeBar.style.width = likeRatio + "%";
        likeBar.setAttribute("aria-valuenow", likeRatio);

        let dislikes = document.getElementById(dashboardId + "-dislikes");
        dislikes.innerHTML = stats[4] + " Dislikes";

        let comments = document.getElementById(dashboardId + "-comments");
        comments.innerHTML = numberWithCommas(stats[2]);

        let avgViewDuration =
            document.getElementById(dashboardId + "-avg-view-duration");
        let avd = stats[6];
        avgViewDuration.innerHTML = secondsToDuration(avd);
        let videoDuration =
            document.getElementById(dashboardId + "-duration-seconds").innerHTML;

        let avp = decimalToPercent(avd / videoDuration);
        let avgViewPercentage =
            document.getElementById(dashboardId + "-avg-view-percentage");
        avgViewPercentage.innerHTML = " (" + avp + "%)";

        let estimatedMinutesWatched =
            document.getElementById(dashboardId + "-minutes-watched");
        estimatedMinutesWatched.innerHTML = numberWithCommas(stats[5]);

        let videoData = {
            "views": stats[1],
            "subscribersGained": stats[7] - stats[8],
            "avgViewDuration": stats[6],
            "minutesWatched": stats[5],
            "comments": stats[2],
            "likes": stats[3],
            "dislikes": stats[4]
        };
        if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
            recordTopVideoStats(dashboardId, videoData);
        }
    }
}

// Creates daily views graph for a video in top video dashboard
function handleVideoDailyViews(response, dashboardId) {
    if (response) {
        let rows = response.result.rows;
        var xValues = [];
        var yValues = [];

        for (var i = 0; i < rows.length; i++) {
            xValues.push(rows[i][0]);
            yValues.push(rows[i][1]);
        }

        var graphId = dashboardId + "-views-graph";
        var graphHeight = 0.2280;
        var graphWidth = 0.4681;
        var height = graphHeight * document.documentElement.clientHeight;
        var width = graphWidth * document.documentElement.clientWidth;
        var fontSize = Math.floor(0.0104 * document.documentElement.clientWidth);
        var xaxis = {
            automargin: true,
            fixedrange: true,
            tickangle: -60,
            tickformat: '%-m/%d',
            type: 'date'
        };
        var yaxis = {
            automargin: true,
            fixedrange: true,
            showline: true,
            showticklabels: true,
            title: 'Views'
        };
        var automargin = {
            xaxis: xaxis,
            yaxis: yaxis
        };

        var data = [
            {
                x: xValues,
                y: yValues,
                fill: 'tozeroy',
                type: 'scatter',
                marker: {
                    color: 'rgb(255,0,0)'
                }
            }
        ];

        var layout = {
            height: height,
            width: width,
            font: { size: fontSize },
            margin: {
                b: 0,
                t: 0
            },
            xaxis: xaxis,
            yaxis: yaxis
        };

        var config = {
            displayModeBar: false,
            responsive: true
        };

        recordGraphData(graphId, data, layout, config, graphHeight, graphWidth,
            automargin);

        var currentSettings = JSON.parse(localStorage.getItem("settings"));
        var theme = "";
        var index = 0;
        while (index < currentSettings.dashboards.length && theme == "") {
            if (currentSettings.dashboards[index].name == dashboardId) {
                theme = currentSettings.dashboards[index].theme;
            }
            index++;
        }
        if (theme == "dark") {
            layout["plot_bgcolor"] = "#222";
            layout["paper_bgcolor"] = "#222";
            layout["font"]["color"] = "#fff";
            xaxis["linecolor"] = "#fff";
            yaxis["linecolor"] = "#fff";
            layout["xaxis"] = xaxis;
            layout["yaxis"] = yaxis;
            automargin = {
                xaxis: xaxis,
                yaxis: yaxis
            };
        }

        Plotly.newPlot(graphId, data, layout, config);

        recordGraphSize(graphId, graphHeight, graphWidth, automargin);
    }
}

// Creates top search terms graph for a video in top video dashboard
function handleVideoSearchTerms(response, dashboardId) {
    if (response) {
        let searchTerms = response.result.rows;
        let xValues = [];
        let yValues = [];
        let numTerms = Math.min(4, searchTerms.length - 1);
        for (var i = numTerms; i >= 0; i--) {
            xValues.push(searchTerms[i][1]);
            yValues.push(searchTerms[i][0]);
        }
        var textValues = xValues.map(String);
        for (var i = 0; i < textValues.length; i++) {
            textValues[i] = numberWithCommas(textValues[i]);
        }

        var graphId = dashboardId + "-search-terms";
        var graphHeight = 0.2280;
        var graphWidth = 0.4681;
        var height = graphHeight * document.documentElement.clientHeight;
        var width = graphWidth * document.documentElement.clientWidth;
        var fontSize = Math.floor(0.0125 * document.documentElement.clientWidth);
        var yaxis = {
            showline: true,
            showticklabels: true,
            tickmode: 'linear',
            automargin: true
        };
        var automargin = { yaxis: yaxis };

        var data = [
            {
                x: xValues,
                y: yValues,
                type: 'bar',
                orientation: 'h',
                text: textValues,
                textangle: 0,
                textposition: 'auto',
                marker: {
                    color: 'rgb(255,0,0)'
                }
            }
        ];

        var layout = {
            height: height,
            width: width,
            font: { size: fontSize },
            autosize: false,
            margin: {
                b: 0,
                r: 0,
                t: 0,
            },
            xaxis: {
                visible: false
            },
            yaxis: yaxis
        };

        var config = {
            staticPlot: true,
            responsive: true
        };

        recordGraphData(graphId, data, layout, config, graphHeight, graphWidth,
            automargin);

        var currentSettings = JSON.parse(localStorage.getItem("settings"));
        var theme = "";
        var index = 0;
        while (index < currentSettings.dashboards.length && theme == "") {
            if (currentSettings.dashboards[index].name == dashboardId) {
                theme = currentSettings.dashboards[index].theme;
            }
            index++;
        }
        if (theme == "dark") {
            layout["plot_bgcolor"] = "#222";
            layout["paper_bgcolor"] = "#222";
            layout["font"]["color"] = "#fff";
            yaxis["linecolor"] = "#fff";
            layout["yaxis"] = yaxis;
            automargin = { yaxis: yaxis };
        }

        Plotly.newPlot(graphId, data, layout, config);

        recordGraphSize(graphId, graphHeight, graphWidth, automargin);
    }
}

// Displays video title, duration, publish date, and thumbnail in top video
// dashboard
function handleVideoSnippet(response, dashboardId) {
    if (response) {
        let title = document.getElementById(dashboardId + "-title");
        title.innerHTML = response.result.items[0].snippet.title;
        duration = response.result.items[0].contentDetails.duration;
        let videoDuration = isoDurationToSeconds(duration);
        document.getElementById(dashboardId + "-duration").innerHTML =
            "Duration: " + secondsToDuration(videoDuration);
        document.getElementById(dashboardId + "-duration-seconds").innerHTML =
            videoDuration;

        let publishDateText =
            document.getElementById(dashboardId + "-publish-date");
        let publishDate = response.result.items[0].snippet.publishedAt;
        let year = publishDate.slice(0, 4);
        let month = publishDate.slice(5, 7);
        let day = publishDate.slice(8, 10);
        publishDate = month + "/" + day + "/" + year;
        publishDateText.innerHTML = "Published: " + publishDate;

        let thumbnail = document.getElementById(dashboardId + "-thumbnail");
        let videoId = response.result.items[0].id;
        let videoTitle = "YouTube Video ID: " + videoId;
        let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
        if (statsByVideoId && statsByVideoId[videoId]) {
            videoTitle = statsByVideoId[videoId]["title"];
        }
        thumbnail.innerHTML = `
        <a href="https://youtu.be/${videoId}" target="_blank"
            onclick="closeFullscreen()" alt="${videoTitle}">
          <img class="top-video-thumbnail" onload="thumbnailCheck($(this), true)"
              src="https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg"
              alt="thumbnail" title="${videoTitle}">
        </a>`;
    }
}


/* Card Performance Calls */

function handleCardPerformance(response, endOfMonth) {
    if (response) {
        let month = endOfMonth.substr(0, 7);
        let monthData = [month, 0, 0, 0, 0];
        try {
            let responseRow = response.result.rows[0];
            let cardImpressions = parseInt(responseRow[0]);
            let cardCTR = parseFloat(responseRow[1]).toFixed(4);
            let cardTeaserImpressions = parseInt(responseRow[2]);
            let cardTeaserCTR = parseFloat(responseRow[3]).toFixed(4);
            monthData[1] = cardImpressions;
            monthData[2] = cardCTR;
            monthData[3] = cardTeaserImpressions;
            monthData[4] = cardTeaserCTR;
        } catch (err) {
            //console.log("No card data exists for month: " + month);
        }
        let cardData = JSON.parse(localStorage.getItem("cardData"));
        cardData.push(monthData);
        localStorage.setItem("cardData", JSON.stringify(cardData));

        // Initiate next requestCardPerformance call
        let endOfMonthDate = new Date(endOfMonth);
        let now = new Date();
        if (endOfMonthDate - now > 0) {
            // Reached current month - display data in charts
            displayCardPerformanceCharts();
            //console.log("Done gathering card data");
        } else {
            let startDate = new Date(endOfMonthDate.getFullYear(),
                endOfMonthDate.getMonth() + 1, 1);
            let endDate = getYouTubeDateFormat(new Date(startDate.getFullYear(),
                startDate.getMonth() + 1, 0));
            startDate = getYouTubeDateFormat(startDate);
            requestCardPerformance(startDate, endDate);
        }
    }
}


/* Google Sheets Calls */

// Calls different functions based on what sheet data was requested
function handleSpreadsheetData(response, message) {
    if (response) {
        if (message == "Category List") {
            localStorage.setItem("categoryListSheet",
                JSON.stringify(response.result.values));
            recordCategoryListData();
        } else if (message == "Video List") {
            localStorage.setItem("videoListSheet",
                JSON.stringify(response.result.values));
            recordVideoListData();
        } else if (message == "Video Stats") {
            localStorage.setItem("videoSheet",
                JSON.stringify(response.result.values));
            recordVideoData();
        } else if (message == "Category Stats") {
            localStorage.setItem("categoriesSheet",
                JSON.stringify(response.result.values));
            recordCategoryData();
        } else if (message == "Top Ten Videos") {
            localStorage.setItem("topTenSheet",
                JSON.stringify(response.result.values));
            displayTopTenThumbnails();
        } else if (message == "User Feedback List") {
            localStorage.setItem("feedbackSheet",
                JSON.stringify(response.result.values));
            displayUserFeedback();
        } else if (message == "Graph Data") {
            localStorage.setItem("graphDataSheet",
                JSON.stringify(response.result.values));
            recordGraphDataFromSheets();
        } else if (message == "Top Video Stats") {
            localStorage.setItem("topVideoStatsSheet",
                JSON.stringify(response.result.values));
            recordTopVideoStatsFromSheets();
        } else if (message == "Real Time Stats") {
            localStorage.setItem("realTimeStatsSheet",
                JSON.stringify(response.result.values));
            recordRealTimeStatsFromSheets();
        } else if (message == "Channel Demographics") {
            var rows = JSON.parse(response.result.values[0][0]);
            var newResponse = {
                "result": {
                    "rows": rows
                }
            };
            handleChannelDemographics(newResponse);
        } else if (message == "Thumbnail Chart Uploads") {
            localStorage.setItem("videoListSheet",
                JSON.stringify(response.result.values));
            recordUploads();
        } else if (message == "Category Views By Year") {
            localStorage.setItem("yearlyCategorySheet",
                JSON.stringify(response.result.values));
            try {
                recordYearlyCategoryViews();
            } catch (err) {
                //console.log(err);
                window.setTimeout(recordYearlyCategoryViews, 5000);
            }
        }
        let date = new Date();
        date.setHours(10, 30, 0, 0);
        localStorage.setItem("lastUpdatedOn", date.toString());
    }
}

// Gets Top Ten Videos stats if "Video Stats" sheet was updated
function handleUpdateSheetData(response, message) {
    if (response) {
        if (message == "Video Stats") {
            updateTopTenVideoSheet();
        }
    }
}

/* Non-dashboard Related Calls */

function handleVideoDescription(response) {
    if (response) {
        var videoId = response.result.items[0].id;
        var description = response.result.items[0].snippet.description;
        var links = searchForURLs(description);
        //console.log(videoId, links);
    }
}

/* Sends requests to API call functions */


/* 1000 Thumbnail Dashboard Calls */

// Request number of videos the channel has
function requestChannelNumVideos() {
    var request = {
        part: "statistics",
        forUsername: "automationdirect"
    };
    callDataAPIChannels(request, "ChannelInfo: ", handleChannelNumVideos);
}


/* Get All Video Stats Calls */

function requestVideoStatisticsOverall(settings) {
    var videoId = settings["uploads"][settings["index"]];
    var request = {
        "part": "statistics,contentDetails",
        "id": videoId
    };
    callDataAPIVideos(request, "VideoStatistics: ", handleVideoStatisticsOverall,
        settings);
}

function requestVideoViewsByYear(settings) {
    var videoId = settings["uploads"][settings["index"]];
    var year = settings["year"];
    var startDate = year + "-01-01";
    var endDate = year + "-12-31";
    var filters = "video==" + videoId;
    var request = {
        "dimensions": "video",
        "endDate": endDate,
        "filters": filters,
        "ids": "channel==MINE",
        "metrics": "views",
        "startDate": startDate
    }
    callAnalyticsAPI(request, "VideoViewsByYear: ", handleVideoViewsByYear,
        settings);
}


/* Platform Dashboard Calls */

// Request age group and gender of channel views
function requestChannelDemographics(startDate, endDate) {
    var request = {
        "dimensions": "ageGroup,gender",
        "endDate": endDate,
        "ids": "channel==MINE",
        "metrics": "viewerPercentage",
        "sort": "gender,ageGroup",
        "startDate": startDate
    };
    callAnalyticsAPI(request, "ChannelDemographics: ", handleChannelDemographics);
}

function requestChannelSearchTerms(startDate, endDate) {
    const request = {
        "dimensions": "insightTrafficSourceDetail",
        "endDate": endDate,
        "filters": "insightTrafficSourceType==YT_SEARCH",
        "ids": "channel==MINE",
        "maxResults": 5,
        "metrics": "views",
        "sort": "-views",
        "startDate": startDate
    };
    callAnalyticsAPI(request, "ChannelSearchTerms: ", handleChannelSearchTerms);

}

function requestMinutesSubscribedStatus(startDate, endDate) {
    var request = {
        "dimensions": "subscribedStatus",
        "endDate": endDate,
        "ids": "channel==MINE",
        "metrics": "estimatedMinutesWatched",
        "startDate": startDate
    };
    callAnalyticsAPI(request, "MinutesSubscribedStatus: ",
        handleMinutesSubscribedStatus);
}

function requestViewsByDeviceType(startDate, endDate) {
    var request = {
        "dimensions": "deviceType",
        "endDate": endDate,
        "ids": "channel==MINE",
        "metrics": "views",
        "sort": "-views",
        "startDate": startDate
    };
    callAnalyticsAPI(request, "ViewsByDeviceType: ", handleViewsByDeviceType);
}

function requestViewsByState(startDate, endDate) {
    var request = {
        "dimensions": "province",
        "endDate": endDate,
        "filters": "country==US",
        "ids": "channel==MINE",
        "metrics": "views",
        "sort": "province",
        "startDate": startDate
    };
    callAnalyticsAPI(request, "ViewsByTrafficSource: ", handleViewsByState);
}

function requestViewsByTrafficSource(startDate, endDate) {
    var request = {
        "dimensions": "insightTrafficSourceType",
        "endDate": endDate,
        "ids": "channel==MINE",
        "metrics": "views",
        "sort": "-views",
        "startDate": startDate
    };
    callAnalyticsAPI(request, "ViewsByTrafficSource: ",
        handleViewsByTrafficSource);
}


/* Real Time Stats Calls */

function requestRealTimeStats(startDate, endDate, message) {
    var request = {
        "endDate": endDate,
        "ids": "channel==MINE",
        "metrics": "views,subscribersGained,subscribersLost," +
            "estimatedMinutesWatched,averageViewDuration",
        "startDate": startDate
    };
    callAnalyticsAPI(request, "RealTimeStats: ", handleRealTimeStats, message);
}

function requestRealTimeStatsCumulative() {
    requestRealTimeStats(joinDate, getDateFromDaysAgo(4), "cumulative");
}

function requestRealTimeStatsMonth() {
    requestRealTimeStats(getDateFromDaysAgo(34), getDateFromDaysAgo(4), "month");
}

function requestRealTimeStatsToday() {
    var date = getDateFromDaysAgo(3);
    requestRealTimeStats(date, date, "today");
}


/* Top Ten Dashboard Calls */

// Requests the numVideos most watched videos from startDate to endDate
function requestMostWatchedVideos(startDate, endDate, numVideos, month) {
    var request = {
        "dimensions": "video",
        "endDate": endDate,
        "ids": "channel==MINE",
        "maxResults": numVideos,
        "metrics": "views,estimatedMinutesWatched",
        "sort": "-views",
        "startDate": startDate
    };
    callAnalyticsAPI(request, "MostWatchedVideos: ", handleMostWatchedVideos,
        month);
}


/* Top Video Calls */

function requestVideoBasicStats(startDate, endDate, videoId, dashboardId) {
    var stringVideoId = "video==" + videoId;
    const request = {
        "dimensions": "video",
        "endDate": endDate,
        "filters": stringVideoId,
        "ids": "channel==MINE",
        "metrics": "views,comments,likes,dislikes,estimatedMinutesWatched," +
            "averageViewDuration,subscribersGained,subscribersLost",
        "startDate": startDate
    };
    callAnalyticsAPI(request, "VideoBasicStats: ", handleVideoBasicStats,
        dashboardId);
}

function requestVideoDailyViews(startDate, endDate, videoId, dashboardId) {
    var filters = "video==" + videoId;
    const request = {
        "dimensions": "day",
        "endDate": endDate,
        "filters": filters,
        "ids": "channel==MINE",
        "metrics": "views",
        "sort": "day",
        "startDate": startDate
    };
    callAnalyticsAPI(request, "VideoDailyViews: ", handleVideoDailyViews,
        dashboardId);
}

function requestVideoSearchTerms(startDate, endDate, videoId, dashboardId) {
    var filters = "video==" + videoId + ";insightTrafficSourceType==YT_SEARCH";
    const request = {
        "dimensions": "insightTrafficSourceDetail",
        "endDate": endDate,
        "filters": filters,
        "ids": "channel==MINE",
        "maxResults": 10,
        "metrics": "views",
        "sort": "-views",
        "startDate": startDate
    };
    callAnalyticsAPI(request, "VideoSearchTerms: ", handleVideoSearchTerms,
        dashboardId);
}

function requestVideoSnippet(videoId, dashboardId) {
    var request = {
        "part": "snippet,contentDetails",
        "id": videoId
    };
    callDataAPIVideos(request, "VideoSnippet: ", handleVideoSnippet, dashboardId);
}


/* Card Performance Calls */

function requestCardPerformance(startDate, endDate) {
    var request = {
        "endDate": endDate,
        "ids": "channel==MINE",
        "metrics": "cardImpressions,cardClickRate," +
            "cardTeaserImpressions,cardTeaserClickRate",
        "startDate": startDate
    };
    callAnalyticsAPI(request, "CardPerformance: ", handleCardPerformance,
        endDate);
}


/* Google Sheets Calls */

function requestSpreadsheetData(spreadsheetId, range, message) {
    var request = {
        "spreadsheetId": spreadsheetId,
        "range": range
    };
    if (message != undefined) {
        range = message
    }
    callSheetsAPIGet(request, "SpreadsheetData: ", handleSpreadsheetData, range);
}

function requestUpdateSheetData(spreadsheetId, range, body) {
    var request = {
        "spreadsheetId": spreadsheetId,
        "range": range,
        "valueInputOption": "RAW",
        "resource": body
    };
    callSheetsAPIUpdate(request, "UpdateSheetData:", handleUpdateSheetData,
        range);
}

/* Multiple Requests Functions */

function getAllVideoStats(uploads) {
    var settings = {
        "uploads": uploads,
        "index": 0
    };
    localStorage.setItem("allVideoStats", JSON.stringify([]));
    requestVideoStatisticsOverall(settings);
}

function getYearlyCategoryViews(year) {
    let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
    let uploadsByYear = [];
    for (var videoId in statsByVideoId) {
        if (statsByVideoId.hasOwnProperty(videoId)) {
            let publishDate = statsByVideoId[videoId]["publishDate"];
            let publishYear = publishDate.substr(0, 4);
            if (year >= publishYear) {
                uploadsByYear.push(videoId);
            }
        }
    }
    let settings = {
        "index": 0,
        "uploads": uploadsByYear,
        "year": year
    };
    let categoryStats = JSON.parse(localStorage.categoryStats);
    let categoryYearlyTotals = {};
    for (var i = 0; i < categoryStats.length; i++) {
        let categoryId = categoryStats[i]["categoryId"];
        let shortName = categoryStats[i]["shortName"];
        categoryYearlyTotals[categoryId] = {
            "numVideos": 0,
            "shortName": shortName,
            "views": 0
        }
    }
    localStorage.setItem("categoryYearlyTotals",
        JSON.stringify(categoryYearlyTotals));
    requestVideoViewsByYear(settings);
}

function getCardPerformanceByMonth() {
    // Oct. 2017 was the first month the ADC YT channel used impressions
    let cardData = [];
    localStorage.setItem("cardData", JSON.stringify(cardData));
    requestCardPerformance("2017-10-01", "2017-10-31");
}

function getTopTenVideosByMonth(startDate) {
    startDate = startDate || new Date("2010-07-1");
    var endDate = new Date();
    if (endDate - startDate > 0) {
        let firstDay = getYouTubeDateFormat(startDate);
        let lastDay = getYouTubeDateFormat(new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0));
        let month = firstDay.substr(0, 7);
        requestMostWatchedVideos(firstDay, lastDay, 20, month);
        startDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
        // Space out the calls to Data and Sheets APIs to stay under quota limit
        setTimeout(function () {
            getTopTenVideosByMonth(startDate);
        }, 200);
    } else {
        // Wait to reload the page after the last Data API request is called
        setTimeout(function () {
            window.location.reload();
        }, 5000);
    }
}

function platformDashboardCalls(startDate, endDate) {
    requestChannelSearchTerms(startDate, endDate);
    requestViewsByDeviceType(startDate, endDate);
    requestViewsByTrafficSource(startDate, endDate);
    requestViewsByState(startDate, endDate);
    requestChannelDemographics(startDate, endDate);
    requestMinutesSubscribedStatus(startDate, endDate);
}

// Requests data for real time stats dashboard
function realTimeStatsCalls() {
    requestRealTimeStatsMonth();
    requestRealTimeStatsToday();
    requestRealTimeStatsCumulative();
}

// Makes requests data for top video dashboard
function topVideoCalls(startDate, endDate, videoId, dashboardId) {
    requestVideoSearchTerms(startDate, endDate, videoId, dashboardId);
    requestVideoDailyViews(getDateFromDaysAgo(32), endDate, videoId, dashboardId);
    requestVideoBasicStats(startDate, endDate, videoId, dashboardId);
    displayTopVideoTitle(videoId, dashboardId);
}

/* Non-dashboard Related Calls */

// Requests description of given video
function requestVideoDescription(videoId) {
    var request = {
        "part": "snippet",
        "id": videoId
    };
    callDataAPIVideos(request, "VideoDescription: ", handleVideoDescription);
}

/* Handles recording data from Google Sheets and saving data to Google Sheets */

// Records category IDs/names from Google Sheet
// Eventually initiates recordVideoListData()
function recordCategoryListData() {
    let categoryList = JSON.parse(localStorage.getItem("categoryListSheet"));
    let categoryTotals = {};
    let columns = {};
    let columnHeaders = categoryList[0];
    for (let i = 0; i < columnHeaders.length; i++) {
        columns[columnHeaders[i]] = i;
    }
    for (let i = 1; i < categoryList.length; i++) {
        let row = categoryList[i];
        let categoryId = row[columns["Category ID"]];
        let level1 = row[columns["L1 Category"]];
        let level2 = row[columns["L2 Category"]];
        let level3 = row[columns["L3 Category"]];
        let name = "";
        let shortName = row[columns["Short Name"]];
        let root = false;
        let leaf = true;

        // Set up root and leaf
        if (!/\d/.test(categoryId)) {
            root = true;
            name = level1;
        } else {
            let parentCategoryLvl1 = categoryId.match(/[A-Z]+/)[0];
            categoryTotals[parentCategoryLvl1].leaf = false;
            name = categoryTotals[parentCategoryLvl1].name + "->" + level2;
            if (categoryId.replace(/[A-Z]+[0-9]+/, "") != "") {
                let parentCategoryLvl2 = categoryId.match(/[A-Z]+[0-9]+/)[0];
                categoryTotals[parentCategoryLvl2].leaf = false;
                name = categoryTotals[parentCategoryLvl2].name + "->" + level3;
            }
        }

        categoryTotals[categoryId] = {
            "shortName": shortName,
            "name": name,
            "root": root,
            "leaf": leaf,
            "views": 0,
            "likes": 0,
            "duration": 0,
            "videos": []
        };
    }
    localStorage.removeItem("categoryListSheet");
    localStorage.setItem("categoryTotals", JSON.stringify(categoryTotals));

    requestSpreadsheetData("1LNVjw5Hf2Ykp89jtxaX9itH5NOoudwaz0T74E7flZZg",
        "Video List");
}

// Records video IDs from Google Sheet
// Initiates displayUploadThumbnails() and getAllVideoStats()
function recordVideoListData() {
    let videoList = JSON.parse(localStorage.getItem("videoListSheet"));
    let statsByVideoId = {};
    let uploads = [];
    let columns = {};
    let columnHeaders = videoList[0];
    for (let i = 0; i < columnHeaders.length; i++) {
        columns[columnHeaders[i]] = i;
    }
    for (let i = 1; i < videoList.length; i++) {
        let row = videoList[i];
        let organic = ("TRUE" === row[columns["Organic"]]);
        if (organic) {
            let videoId = row[columns["Video ID"]];
            let title = row[columns["Title"]];
            let publishDate = row[columns["Publish Date"]];
            let duration = row[columns["Duration"]];
            let categoryString = row[columns["Categories"]];
            categoryString = categoryString.replace(/\s/g, ''); // Removes whitespace
            let initialCategories = categoryString.split(",");
            let allCategories = [];
            for (let j = 0; j < initialCategories.length; j++) {
                let categoryId = initialCategories[j];
                if (allCategories.indexOf(categoryId) == -1) {
                    allCategories.push(categoryId);
                }
                if (/\d/.test(categoryId)) {
                    let parentCategoryLvl1 = categoryId.match(/[A-Z]+/)[0];
                    if (allCategories.indexOf(parentCategoryLvl1) == -1) {
                        allCategories.push(parentCategoryLvl1);
                    }
                    if (categoryId.replace(/[A-Z]+[0-9]+/, "") != "") {
                        let parentCategoryLvl2 = categoryId.match(/[A-Z]+[0-9]+/)[0];
                        if (allCategories.indexOf(parentCategoryLvl2) == -1) {
                            allCategories.push(parentCategoryLvl2);
                        }
                    }
                }
            }
            statsByVideoId[videoId] = {
                "categories": allCategories,
                "title": title,
                "publishDate": publishDate,
                "duration": duration
            };

            uploads.push(videoId);
        }
    }
    localStorage.removeItem("videoListSheet");
    localStorage.setItem("statsByVideoId", JSON.stringify(statsByVideoId));
    localStorage.setItem("uploads", JSON.stringify(uploads));

    displayUploadThumbnails();
    getAllVideoStats(uploads);
}

// Records category data from Google Sheet to localStorage.categoryStats
function recordCategoryData() {
    let categoriesSheet = JSON.parse(localStorage.getItem("categoriesSheet"));
    let columns = {};
    let columnHeaders = categoriesSheet[0];
    for (var i = 0; i < columnHeaders.length; i++) {
        columns[columnHeaders[i]] = i;
    }
    let categoryStats = [];
    for (var i = 1; i < categoriesSheet.length; i++) {
        let categoryId = categoriesSheet[i][columns["Category ID"]]
        let name = categoriesSheet[i][columns["Name"]];
        let shortName = categoriesSheet[i][columns["Short Name"]];
        let views = parseInt(categoriesSheet[i][columns["Views"]]);
        let likes = parseInt(categoriesSheet[i][columns["Likes"]]);
        let duration = parseInt(categoriesSheet[i][columns["Duration (sec)"]]);
        let avgViews =
            parseFloat(categoriesSheet[i][columns["Average Video Views"]]);
        let avgLikes =
            parseFloat(categoriesSheet[i][columns["Average Video Likes"]]);
        let avgDuration =
            parseFloat(categoriesSheet[i][columns["Average Video Duration"]]);
        let videosString = categoriesSheet[i][columns["Videos"]];
        let videos = videosString.split(",");
        let root = ("TRUE" === categoriesSheet[i][columns["Root"]]);
        let leaf = ("TRUE" === categoriesSheet[i][columns["Leaf"]]);
        categoryStats.push({
            "categoryId": categoryId,
            "name": name,
            "shortName": shortName,
            "views": views,
            "likes": likes,
            "duration": duration,
            "avgViews": avgViews,
            "avgLikes": avgLikes,
            "avgDuration": avgDuration,
            "videos": videos,
            "root": root,
            "leaf": leaf,
        });
    }
    localStorage.removeItem("categoriesSheet");
    localStorage.setItem("categoryStats", JSON.stringify(categoryStats));
}

// Records video data from Google Sheet to localStorage.allVideoStats, .uploads,
// and .statsByVideoId
function recordVideoData() {
    let videoSheet = JSON.parse(localStorage.getItem("videoSheet"));
    let columns = {};
    let columnHeaders = videoSheet[0];
    for (var i = 0; i < columnHeaders.length; i++) {
        columns[columnHeaders[i]] = i;
    }
    let uploads = [];
    let allVideoStats = [];
    let statsByVideoId = {};
    for (var i = 1; i < videoSheet.length; i++) {
        let videoId = videoSheet[i][columns["Video ID"]];
        let title = videoSheet[i][columns["Title"]];
        let viewCount = parseInt(videoSheet[i][columns["Views"]]);
        let likeCount = parseInt(videoSheet[i][columns["Likes"]]);
        let dislikeCount = parseInt(videoSheet[i][columns["Dislikes"]]);
        let duration = parseInt(videoSheet[i][columns["Duration (sec)"]]);
        let commentCount = parseInt(videoSheet[i][columns["Comments"]]);
        let publishDate = videoSheet[i][columns["Publish Date"]].substr(0, 10);
        let categories = videoSheet[i][columns["Categories"]].replace(/\s/g, '');
        let row = {
            "videoId": videoId,
            "views": viewCount,
            "likes": likeCount,
            "dislikes": dislikeCount,
            "comments": commentCount
        };
        allVideoStats.push(row);
        if (!statsByVideoId[videoId]) {
            statsByVideoId[videoId] = {};
        }
        statsByVideoId[videoId]["title"] = title;
        statsByVideoId[videoId]["publishDate"] = publishDate;
        statsByVideoId[videoId]["duration"] = duration;
        statsByVideoId[videoId]["categories"] = categories;
        uploads.push(videoId);
    }
    localStorage.removeItem("videoSheet");
    localStorage.setItem("allVideoStats", JSON.stringify(allVideoStats));
    localStorage.setItem("statsByVideoId", JSON.stringify(statsByVideoId));
    localStorage.setItem("uploads", JSON.stringify(uploads));
}

// Displays graphs on dashboards
function recordGraphDataFromSheets() {
    let graphDataSheet = JSON.parse(localStorage.getItem("graphDataSheet"));
    let columns = {};
    let columnHeaders = graphDataSheet[0];
    for (let i = 0; i < columnHeaders.length; i++) {
        columns[columnHeaders[i]] = i;
    }
    for (let i = 1; i < graphDataSheet.length; i++) {
        let row = graphDataSheet[i];
        let graphId = row[columns["Graph ID"]];
        let data = JSON.parse(row[columns["Data"]]);
        let layout = JSON.parse(row[columns["Layout"]]);
        let config = JSON.parse(row[columns["Config"]]);
        let graphHeight = row[columns["Graph Height"]];
        let graphWidth = row[columns["Graph Width"]];
        let automargin = JSON.parse(row[columns["Automargin"]]);
        // Display graphs
        try {
            Plotly.newPlot(graphId, data, layout, config);
            if (automargin != "None") {
                recordGraphSize(graphId, graphHeight, graphWidth, automargin);
            } else {
                recordGraphSize(graphId, graphHeight, graphWidth);
            }
        } catch (err) {
            console.error(err);
        }
    }
    localStorage.removeItem("graphDataSheet");
}

// Displays top video stats on dashboards
function recordTopVideoStatsFromSheets() {
    let topVideoStatsSheet =
        JSON.parse(localStorage.getItem("topVideoStatsSheet"));
    let columns = {};
    let columnHeaders = topVideoStatsSheet[0];
    for (let i = 0; i < columnHeaders.length; i++) {
        columns[columnHeaders[i]] = i;
    }
    for (let i = 1; i < topVideoStatsSheet.length; i++) {
        let row = topVideoStatsSheet[i];
        let dashboardId = row[columns["Dashboard ID"]];
        let videoId = row[columns["Video ID"]];
        let title = row[columns["Title"]];
        let duration = row[columns["Duration"]];
        let publishDate = row[columns["Publish Date"]];
        let thumbnail = row[columns["Thumbnail"]];
        let views = row[columns["Views"]];
        let subscribersGained = row[columns["Subscribers Gained"]];
        let avgViewDuration = row[columns["Average View Duration"]];
        let minutesWatched = row[columns["Estimated Minutes Watched"]];
        let comments = row[columns["Comments"]];
        let likes = parseInt(row[columns["Likes"]]);
        let dislikes = parseInt(row[columns["Dislikes"]]);
        try {
            document.getElementById(dashboardId + "-title").innerHTML = title;
            document.getElementById(dashboardId + "-duration").innerHTML =
                "Duration: " + secondsToDuration(duration);
            document.getElementById(dashboardId + "-duration-seconds").innerHTML =
                duration;

            document.getElementById(dashboardId + "-publish-date").innerHTML =
                "Published: " + publishDate;

            document.getElementById(dashboardId + "-thumbnail").innerHTML =
                thumbnail;
            let response = {
                "result": {
                    "rows": [
                        [
                            0,
                            views,
                            comments,
                            likes,
                            dislikes,
                            minutesWatched,
                            avgViewDuration,
                            subscribersGained,
                            0
                        ]
                    ]
                }
            };
            handleVideoBasicStats(response, dashboardId);
        } catch (err) {
            console.error(`Dashboard "${dashboardId}" does not exist`, err)
        }
    }
    localStorage.removeItem("topVideoStatsSheet");
}

// Records real time stats from Google Sheet to localStorage.realTimeStats
function recordRealTimeStatsFromSheets() {
    let realTimeStatsSheet =
        JSON.parse(localStorage.getItem("realTimeStatsSheet"));
    let realTimeStats = {};
    let columns = {};
    let columnHeaders = realTimeStatsSheet[0];
    for (let i = 0; i < columnHeaders.length; i++) {
        columns[columnHeaders[i]] = i;
    }
    for (let i = 1; i < realTimeStatsSheet.length; i++) {
        let row = realTimeStatsSheet[i];
        let timeRange = row[columns["Time Range"]];
        let views = row[columns["Views"]];
        let estimatedMinutesWatched = row[columns["Estimated Minutes Watched"]];
        let averageViewDuration = row[columns["Average View Duration"]];
        let netSubscribersGained = row[columns["Subscribers Gained"]];
        realTimeStats[timeRange] = {
            "views": parseInt(views),
            "estimatedMinutesWatched": parseInt(estimatedMinutesWatched),
            "averageViewDuration": parseInt(averageViewDuration),
            "netSubscribersGained": parseInt(netSubscribersGained),
        };
    }
    localStorage.removeItem("topVideoStatsSheet");
    localStorage.setItem("realTimeStats", JSON.stringify(realTimeStats));
    loadRealTimeStats();
}

function recordUploads() {
    let videoList = JSON.parse(localStorage.getItem("videoListSheet"));
    let uploads = [];
    let columns = {};
    let columnHeaders = videoList[0];
    for (let i = 0; i < columnHeaders.length; i++) {
        columns[columnHeaders[i]] = i;
    }
    for (let i = videoList.length - 1; i >= 1; i--) {
        let row = videoList[i];
        let videoId = row[columns["Video ID"]];
        uploads.push(videoId);
    }
    localStorage.removeItem("videoListSheet");
    localStorage.setItem("uploads", JSON.stringify(uploads));
    displayThumbnails();
}

function recordYearlyCategoryViews() {
    let sheetValues = JSON.parse(localStorage.getItem("yearlyCategorySheet"));
    let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
    let categoryTraces = {};
    let years = [];
    for (var row = 1; row < sheetValues.length; row += 2) {
        let year = sheetValues[row][0].substr(0, 4);
        years.push(year);
    }
    categoryTraces["years"] = years;
    let yearlyTotals = new Array(years.length).fill(0);
    for (var column = 1; column < sheetValues[0].length; column++) {
        let categoryId = sheetValues[0][column];
        let categoryInfo = false;
        var index = 0;
        while (categoryInfo == false && index < categoryStats.length) {
            if (categoryStats[index]["categoryId"] == categoryId) {
                categoryInfo = categoryStats[index];
            }
            index++;
        }
        let root = categoryInfo["root"];
        if (root && categoryId != "A") {
            let viewTrace = [];
            let avgViewTrace = [];
            let cumulativeViews = [];
            let cumulativeAvgViewTrace = [];
            for (var row = 1; row < sheetValues.length; row += 2) {
                // Get views and numVideos for this year
                let yearViews = parseInt(sheetValues[row][column]);
                let numVideos = parseInt(sheetValues[row + 1][column]);
                viewTrace.push(yearViews);
                // Calculate cumulative views up to current year
                let previousSumViews = 0;
                if (row != 1) {
                    previousSumViews = parseInt(cumulativeViews[((row - 1) / 2) - 1]);
                }
                let currentSumViews = previousSumViews + yearViews;
                cumulativeViews.push(currentSumViews);
                // Calculate average views for current year & cumulative average view
                // up to current year
                let avgView = 0;
                let cumulativeAvgView = 0;
                if (numVideos != 0) {
                    avgView = (yearViews / numVideos).toFixed(0);
                    cumulativeAvgView = (currentSumViews / numVideos).toFixed(0);
                }
                avgViewTrace.push(avgView);
                cumulativeAvgViewTrace.push(cumulativeAvgView);
                // Calculate yearly totals
                yearlyTotals[(row - 1) / 2] += parseInt(yearViews);
            }
            categoryTraces[categoryId] = {
                "name": categoryInfo["shortName"],
                "viewTrace": viewTrace,
                "avgViewTrace": avgViewTrace,
                "cumulativeViews": cumulativeViews,
                "cumulativeAvgViewTrace": cumulativeAvgViewTrace
            };
        }
    }
    categoryTraces["totals"] = yearlyTotals;
    localStorage.removeItem("yearlyCategorySheet");
    localStorage.setItem("categoryTraces", JSON.stringify(categoryTraces));
    displayCategoryViewsAreaCharts();
}

// Saves categoryStats to Google Sheets
function saveCategoryStatsToSheets() {
    let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
    var values = [
        ["Category ID", "Name", "Short Name", "Views", "Likes", "Duration (sec)",
            "Average Video Views", "Average Video Likes", "Average Video Duration",
            "Videos", "Root", "Leaf"]
    ];
    for (var i = 0; i < categoryStats.length; i++) {
        var row = [];
        row.push(categoryStats[i]["categoryId"]);
        row.push(categoryStats[i]["name"]);
        row.push(categoryStats[i]["shortName"]);
        row.push(categoryStats[i]["views"]);
        row.push(categoryStats[i]["likes"]);
        row.push(categoryStats[i]["duration"]);
        row.push(categoryStats[i]["avgViews"]);
        row.push(categoryStats[i]["avgLikes"]);
        row.push(categoryStats[i]["avgDuration"]);
        row.push(categoryStats[i]["videos"].join(","));
        row.push(categoryStats[i]["root"]);
        row.push(categoryStats[i]["leaf"]);
        values.push(row);
    }
    var body = {
        "values": values
    };
    requestUpdateSheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
        "Category Stats", body);
}

// Saves categoryYearlyStats to Google Sheets
function saveCategoryYearlyStatsToSheets(year) {
    var categoryYearlyTotals =
        JSON.parse(localStorage.getItem("categoryYearlyTotals"));

    var request = {
        "spreadsheetId": "1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
        "range": "Category Views By Year"
    };
    gapi.client.sheets.spreadsheets.values.get(request)
        .then(response => {
            if (response) {
                sheetValues = response.result.values;
                let columnHeaders = sheetValues[0];
                let viewsRow = [];
                viewsRow.push(year + " Views");
                let numVideosRow = [];
                numVideosRow.push(year + " Number of Videos");
                for (let i = 1; i < columnHeaders.length; i++) {
                    let categoryId = columnHeaders[i];
                    let totals = categoryYearlyTotals[categoryId];
                    let views = parseInt(totals["views"]);
                    let numVideos = parseInt(totals["numVideos"]);
                    viewsRow.push(views);
                    numVideosRow.push(numVideos);
                }
                startingRowIndex = (2 * (year - 2010)) + 1;
                while (sheetValues.length < startingRowIndex + 2) {
                    sheetValues.push([]);
                }
                sheetValues[startingRowIndex] = viewsRow;
                sheetValues[startingRowIndex + 1] = numVideosRow;

                var body = {
                    "values": sheetValues
                };
                var sheetName = "Category Views By Year";
                requestUpdateSheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
                    sheetName, body);
                localStorage.removeItem("categoryYearlyTotals");
            }
        })
        .catch(err => {
            console.error("Category Views By Year Google Sheet not found", err);
        });
}

// Saves allVideoStats and statsByVideoId to Google Sheets
function saveVideoStatsToSheets() {
    var values = [
        ["Video ID", "Title", "Views", "Likes", "Dislikes", "Duration (sec)",
            "Comments", "Publish Date", "Categories"]
    ];
    var allVideoStats = JSON.parse(localStorage.getItem("allVideoStats"));
    var statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
    for (var i = 0; i < allVideoStats.length; i++) {
        var row = [];
        var videoId = allVideoStats[i]["videoId"];
        row.push(videoId);
        row.push(statsByVideoId[videoId]["title"]);
        row.push(allVideoStats[i]["views"]);
        row.push(allVideoStats[i]["likes"]);
        row.push(allVideoStats[i]["dislikes"]);
        row.push(statsByVideoId[videoId]["duration"]);
        row.push(allVideoStats[i]["comments"]);
        row.push(statsByVideoId[videoId]["publishDate"]);
        row.push(statsByVideoId[videoId]["categories"].join(","));
        values.push(row);
    }
    var body = {
        "values": values
    };
    requestUpdateSheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
        "Video Stats", body);
}

// Saves graphData to Google Sheets
function saveGraphDataToSheets() {
    var values = [
        ["Graph ID", "Data", "Layout", "Config", "Graph Height", "Graph Width",
            "Automargin"]
    ];
    var graphData = JSON.parse(localStorage.getItem("graphData"));
    for (var graphId in graphData) {
        if (graphData.hasOwnProperty(graphId)) {
            var row = [];
            row.push(graphId);
            row.push(JSON.stringify(graphData[graphId]["data"]));
            row.push(JSON.stringify(graphData[graphId]["layout"]));
            row.push(JSON.stringify(graphData[graphId]["config"]));
            row.push(graphData[graphId]["graphHeight"]);
            row.push(graphData[graphId]["graphWidth"]);
            row.push(JSON.stringify(graphData[graphId]["automargin"]));
            values.push(row);
        }
    }
    var body = {
        "values": values
    };
    requestUpdateSheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
        "Graph Data", body);
    localStorage.removeItem("graphData");
}

// Saves topVideoStats to Google Sheets
function saveTopVideoStatsToSheets() {
    var values = [
        ["Dashboard ID", "Video ID", "Title", "Duration", "Publish Date",
            "Thumbnail", "Views", "Subscribers Gained", "Average View Duration",
            "Estimated Minutes Watched", "Comments", "Likes", "Dislikes"]
    ];
    let topVideoStats = JSON.parse(localStorage.getItem("topVideoStats"));
    for (var dashboardId in topVideoStats) {
        if (topVideoStats.hasOwnProperty(dashboardId)) {
            var row = [];
            row.push(dashboardId);
            row.push(topVideoStats[dashboardId]["videoId"]);
            row.push(topVideoStats[dashboardId]["title"]);
            row.push(topVideoStats[dashboardId]["duration"]);
            row.push(topVideoStats[dashboardId]["publishDate"]);
            row.push(topVideoStats[dashboardId]["thumbnail"]);
            row.push(topVideoStats[dashboardId]["views"]);
            row.push(topVideoStats[dashboardId]["subscribersGained"]);
            row.push(topVideoStats[dashboardId]["avgViewDuration"]);
            row.push(topVideoStats[dashboardId]["minutesWatched"]);
            row.push(topVideoStats[dashboardId]["comments"]);
            row.push(topVideoStats[dashboardId]["likes"]);
            row.push(topVideoStats[dashboardId]["dislikes"]);
            values.push(row);
        }
    }
    var body = {
        "values": values
    };
    requestUpdateSheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
        "Top Video Stats", body);
}

// Saves realTimeStats to Google Sheets
function saveRealTimeStatsToSheets() {
    var values = [
        ["Time Range", "Views", "Estimated Minutes Watched",
            "Average View Duration", "Subscribers Gained"]
    ];
    let realTimeStats = JSON.parse(localStorage.getItem("realTimeStats"));
    for (var timeRange in realTimeStats) {
        if (realTimeStats.hasOwnProperty(timeRange)) {
            var row = [];
            row.push(timeRange);
            row.push(realTimeStats[timeRange]["views"]);
            row.push(realTimeStats[timeRange]["estimatedMinutesWatched"]);
            row.push(realTimeStats[timeRange]["averageViewDuration"]);
            row.push(realTimeStats[timeRange]["netSubscribersGained"]);
            values.push(row);
        }
    }
    var body = {
        "values": values
    };
    requestUpdateSheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
        "Real Time Stats", body);
}

// Saves top ten videos by views this month to Google Sheets
function updateTopTenVideoSheet() {
    let now = new Date();
    let firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    if (now - firstDayOfMonth > 432000000) {
        // Update for current month
        let lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        let startDate = getYouTubeDateFormat(firstDayOfMonth);
        let endDate = getYouTubeDateFormat(lastDayOfMonth);
        let month = startDate.substr(0, 7);
        requestMostWatchedVideos(startDate, endDate, 20, month);
    } else {
        // Update for previous month
        firstDayOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 0);
        let lastDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        let startDate = getYouTubeDateFormat(firstDayOfMonth);
        let endDate = getYouTubeDateFormat(lastDayOfMonth);
        let month = startDate.substr(0, 7);
        requestMostWatchedVideos(startDate, endDate, 20, month);
    }
}

/* Load and display dashboards */

function loadDashboards() {
    var carouselInner = document.getElementsByClassName("carousel-inner")[0];
    var todayDate = getTodaysDate();
    if (carouselInner.children["intro-animation"]) {
        let introVideo = document.getElementById("intro-video");
        introVideo.load();
        var promise = introVideo.play();
        if (promise !== undefined) {
            promise.then(_ => {
                // Autoplay started!
            }).catch(error => {
                document.getElementsByClassName("VIDEO")[0].play();
            });
        }
    }
    if (carouselInner.children["real-time-stats"]) {
        try {
            loadRealTimeStats();
        } catch (err) {
            //console.log(err);
            realTimeStatsCalls();
        }
    }
    if (carouselInner.children["thumbnails"]) {
        try {
            requestChannelNumVideos();
        } catch (err) {
            //console.log(err);
            window.setTimeout(requestChannelNumVideos, 5000);
        }
        try {
            displayUploadThumbnails();
        } catch (err) {
            //console.log(err);
            window.setTimeout(displayUploadThumbnails, 5000);
        }
        displayUploadThumbnails();
    }
    if (carouselInner.children["platform"]) {
        platformDashboardCalls(joinDate, todayDate);
    }
    if (carouselInner.children["product-categories"]) {
        try {
            displayTopCategories();
        } catch (TypeError) {
            console.error(TypeError);
            requestSpreadsheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
                "Category Stats");
            window.setTimeout(displayTopCategories, 10000);
        }
        // Initiate Category Area Charts
        loadCategoryCharts();

    }
    if (carouselInner.children["top-ten"]) {
        requestSpreadsheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
            "Top Ten Videos");
    }
    if (carouselInner.children["feedback"]) {
        requestSpreadsheetData("1LNVjw5Hf2Ykp89jtxaX9itH5NOoudwaz0T74E7flZZg",
            "User Feedback List");
    }
    if (carouselInner.children["card-performance"]) {
        getCardPerformanceByMonth();
    }
    try {
        loadTopVideoDashboards();
    } catch (err) {
        //console.log(err);
        requestSpreadsheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
            "Video Stats");
        window.setTimeout(loadTopVideoDashboards, 5000);
    }
}

function loadTopVideoDashboards() {
    var carouselInner = document.getElementsByClassName("carousel-inner")[0];
    var todayDate = getTodaysDate();
    if (carouselInner.children["top-video-1"]) {
        let plcVideo = getTopVideoByCategory("B", "views")[0];
        if (plcVideo != undefined) {
            topVideoCalls(joinDate, todayDate, plcVideo, "top-video-1");
        }
    }
    if (carouselInner.children["top-video-2"]) {
        let drivesVideo = getTopVideoByCategory("C", "views")[0];
        if (drivesVideo != undefined) {
            topVideoCalls(joinDate, todayDate, drivesVideo, "top-video-2");
        }
    }
    if (carouselInner.children["top-video-3"]) {
        let hmiVideo = getTopVideoByCategory("D", "views")[0];
        if (hmiVideo != undefined) {
            topVideoCalls(joinDate, todayDate, hmiVideo, "top-video-3");
        }
    }
    if (carouselInner.children["top-video-4"]) {
        let motionControlVideo = getTopVideoByCategory("F", "views")[0];
        if (motionControlVideo != undefined) {
            topVideoCalls(joinDate, todayDate, motionControlVideo, "top-video-4");
        }
    }
    if (carouselInner.children["top-video-5"]) {
        let sensorsVideo = getTopVideoByCategory("H", "views")[0];
        if (sensorsVideo != undefined) {
            topVideoCalls(joinDate, todayDate, sensorsVideo, "top-video-5");
        }
    }
    if (carouselInner.children["top-video-6"]) {
        let motorsVideo = getTopVideoByCategory("I", "views")[0];
        if (motorsVideo != undefined) {
            topVideoCalls(joinDate, todayDate, motorsVideo, "top-video-6");
        }
    }
}

function loadDashboardsSignedOut() {
    var carouselInner = document.getElementsByClassName("carousel-inner")[0];
    if (carouselInner.children["intro-animation"]) {
        let introVideo = document.getElementById("intro-video");
        var promise = introVideo.play();
        if (promise !== undefined) {
            promise.then(_ => {
                // Autoplay started!
            }).catch(error => {
                document.getElementsByClassName("VIDEO")[0].play();
            });
        }
    }
    if (carouselInner.children["real-time-stats"]) {
        requestSpreadsheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
            "Real Time Stats");
    }
    if (carouselInner.children["thumbnails"]) {
        try {
            requestSpreadsheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
                "Video Stats");
            displayUploadThumbnails();
        } catch (err) {
            //console.log(err);
            window.setTimeout(displayUploadThumbnails, 5000);
        }
    }
    if (carouselInner.children["platform"]) {
        requestSpreadsheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
            "Channel Demographics");
    }
    if (carouselInner.children["top-ten"]) {
        requestSpreadsheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
            "Top Ten Videos");
    }
    if (carouselInner.children["feedback"]) {
        requestSpreadsheetData("1LNVjw5Hf2Ykp89jtxaX9itH5NOoudwaz0T74E7flZZg",
            "User Feedback List");
    }
    requestSpreadsheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
        "Graph Data");
    requestSpreadsheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
        "Top Video Stats");
}

function initializeUpdater() {
    var updateId = window.setInterval(updateStats, 1000);
}

function updateStats() {
    let isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
    if (isSignedIn) {
        if (!localStorage.getItem("lastUpdatedOn")) {
            let oldDate = new Date(0);
            localStorage.setItem("lastUpdatedOn", oldDate.toString());
        }
        let lastUpdatedOn = localStorage.getItem("lastUpdatedOn");
        let updateCount = Math.floor((new Date() - new Date(lastUpdatedOn)) / 1000);
        if (updateCount >= 86400) {
            let newUpdate = new Date();
            newUpdate.setHours(10, 30, 0, 0);
            localStorage.setItem("lastUpdatedOn", newUpdate.toString());
            if (newUpdate.getMonth() == 0 && newUpdate.getDate() >= 10 &&
                newUpdate.getDate <= 20) {
                let lastYear = newUpdate.getFullYear() - 1;
                getYearlyCategoryViews(lastYear);
            }
            updateTopTenVideoSheet();
            realTimeStatsCalls();
            requestSpreadsheetData("1LNVjw5Hf2Ykp89jtxaX9itH5NOoudwaz0T74E7flZZg",
                "Category List");
        } else if (updateCount % 900 == 0) {
            loadDashboards();
        }
        var carouselInner = document.getElementsByClassName("carousel-inner")[0];
        if (carouselInner.children["real-time-stats"]) {
            //console.log("Update");
            updateRealTimeStats(updateCount);
        }
    } else {
        if (!localStorage.getItem("lastUpdatedOn")) {
            let lastUpdatedOn = new Date();
            lastUpdatedOn.setHours(10, 30, 0, 0);
            localStorage.setItem("lastUpdatedOn", lastUpdatedOn.toString());
        }
        let lastUpdatedOn = localStorage.getItem("lastUpdatedOn");
        let updateCount = Math.floor((new Date() - new Date(lastUpdatedOn)) / 1000);
        var carouselInner = document.getElementsByClassName("carousel-inner")[0];
        if (carouselInner.children["real-time-stats"]) {
            //console.log("Update");
            updateRealTimeStats(updateCount);
        }
    }
}

// Update odometers in real time stats dashboard
function updateRealTimeStats(updateCount) {
    let secondsPerIncrement =
        JSON.parse(localStorage.getItem("secondsPerIncrement"));
    let odometerCategories =
        JSON.parse(localStorage.getItem("odometerCategories"));
    for (var key in secondsPerIncrement) {
        if (secondsPerIncrement.hasOwnProperty(key)) {
            if (updateCount % secondsPerIncrement[key] == 0) {
                var odometers = odometerCategories[key];
                odometers.forEach(odometer => {
                    var elemOdometer = document.getElementById(odometer);
                    var newValue = parseInt(elemOdometer.getAttribute("value")) + 1;
                    elemOdometer.innerHTML = newValue;
                    elemOdometer.setAttribute("value", newValue);
                });
            }
        }
    }
}

// Initialize real time stats in real time stats dashboard
function loadRealTimeStats() {
    let stats = JSON.parse(localStorage.getItem("realTimeStats"));
    if (stats.cumulative && stats.month && stats.today) {

        //console.log("Real Time Stats: ", stats);

        var secondsPerIncrement = {};
        for (var key in stats.today) {
            if (stats.today.hasOwnProperty(key) && key != "averageViewDuration") {
                secondsPerIncrement[key] = Math.round(43200 / stats.today[key]);
            }
        }
        //console.log(secondsPerIncrement);
        localStorage.setItem("secondsPerIncrement",
            JSON.stringify(secondsPerIncrement));

        if (!localStorage.getItem("lastUpdatedOn")) {
            let lastUpdatedOn = new Date();
            lastUpdatedOn.setHours(10, 30, 0, 0);
            localStorage.setItem("lastUpdatedOn", lastUpdatedOn.toString());
        }

        var recordDate = new Date(localStorage.getItem("lastUpdatedOn"));
        var now = new Date();
        var diffInSeconds = Math.round((now - recordDate) / 1000);

        var avgDurationOdometer = document.getElementById("stat-avg-duration");
        var odometerCategories = {
            "views": ["stat-views-cumulative", "stat-views-month"],
            "estimatedMinutesWatched": ["stat-minutes-cumulative",
                "stat-minutes-month"],
            "netSubscribersGained": ["stat-subs-cumulative", "stat-subs-month"],
            "cumulative": {
                "views": "stat-views-cumulative",
                "estimatedMinutesWatched": "stat-minutes-cumulative",
                "netSubscribersGained": "stat-subs-cumulative"
            },
            "month": {
                "views": "stat-views-month",
                "estimatedMinutesWatched": "stat-minutes-month",
                "netSubscribersGained": "stat-subs-month"
            }
        };
        localStorage.setItem("odometerCategories",
            JSON.stringify(odometerCategories));

        // Load data into odometers
        ["cumulative", "month"].forEach(category => {
            var odometers = odometerCategories[category];
            for (var key in odometers) {
                if (odometers.hasOwnProperty(key)) {
                    var odometer = odometers[key];
                    var elemOdometer = document.getElementById(odometer);
                    var value = stats[category][key];
                    value += Math.round(diffInSeconds / secondsPerIncrement[key]);
                    elemOdometer.setAttribute("value", value);
                    elemOdometer.innerHTML = value;
                }
            }
        });
        var avgDurationCumulative =
            secondsToDurationMinSec(stats.cumulative.averageViewDuration);
        avgDurationOdometer.innerHTML = avgDurationCumulative;
        avgDurationOdometer.value = stats.cumulative.averageViewDuration;
        calcAvgVideoDuration(stats.cumulative.averageViewDuration);
    }


}

function calcAvgVideoDuration() {
    let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
    if (statsByVideoId) {
        let numVideos = 0;
        let totalDuration = 0;
        for (let videoId in statsByVideoId) {
            if (statsByVideoId.hasOwnProperty(videoId)) {
                totalDuration += statsByVideoId[videoId]["duration"];
                numVideos++;
            }
        }
        let avgDuration = totalDuration / numVideos;
        let avgViewDuration = document.getElementById("stat-avg-duration").value;
        let avgViewPercentage = decimalToPercent(avgViewDuration / avgDuration);
        if (isNaN(avgViewPercentage)) {
            avgViewPercentage = 36.1;
        }
        document.getElementById("stat-avg-percentage").innerText =
            avgViewPercentage + "%";
    } else {
        // Default value if statsByVideoId does not exist yet
        document.getElementById("stat-avg-percentage").innerText = "36.1%";
    }
}

function calcCategoryStats() {
    let categoryTotals = JSON.parse(localStorage.getItem("categoryTotals"));
    let categoryStats = [];
    for (var categoryId in categoryTotals) {
        if (categoryTotals.hasOwnProperty(categoryId)) {
            let totals = categoryTotals[categoryId];
            let shortName = totals["shortName"];
            let name = totals["name"];
            let root = totals["root"];
            let leaf = totals["leaf"];
            let views = parseInt(totals["views"]);
            let likes = parseInt(totals["likes"]);
            let duration = parseInt(totals["duration"]);
            let videos = totals["videos"];
            let numVideos = videos.length;
            let avgViews = views / numVideos;
            let avgLikes = likes / numVideos;
            let avgDuration = duration / numVideos;
            categoryStats.push({
                "avgDuration": avgDuration,
                "avgLikes": avgLikes,
                "avgViews": avgViews,
                "categoryId": categoryId,
                "duration": duration,
                "leaf": leaf,
                "likes": likes,
                "name": name,
                "root": root,
                "shortName": shortName,
                "videos": videos,
                "views": views
            });
        }
    }
    localStorage.setItem("categoryStats", JSON.stringify(categoryStats));

    //console.log("Category Stats: ", categoryStats);
    saveCategoryStatsToSheets();
    saveVideoStatsToSheets();
}

function getTopVideoByCategory(categoryId, type, numVideos) {
    let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
    let allVideoStats = JSON.parse(localStorage.getItem("allVideoStats"));
    allVideoStats.sort(function (a, b) {
        return parseInt(b[type]) - parseInt(a[type]);
    });
    if (numVideos == undefined || numVideos <= 0) {
        numVideos = 1;
    }
    let topVideos = [];
    let i = 0;
    let categoryFound = false;
    while (i < categoryStats.length && !categoryFound) {
        if (categoryStats[i]["categoryId"] == categoryId) {
            categoryFound = true;
            let videos = categoryStats[i]["videos"];
            let j = 0;
            let numFound = 0;
            while (j < allVideoStats.length && numFound < numVideos) {
                if (videos.includes(allVideoStats[j]["videoId"])) {
                    topVideos.push(allVideoStats[j]["videoId"]);
                    numFound++;
                }
                j++;
            }
        }
        i++;
    }
    return topVideos;
}

function displayCategoryViewsAreaCharts() {
    let categoryTraces = JSON.parse(localStorage.getItem("categoryTraces"));

    let years = categoryTraces["years"];
    let numYears = years.length;
    let yearlyTotals = categoryTraces["totals"];
    let viewTraces = [];
    let avgViewTraces = [];
    let cumulativeViewTraces = [];
    let cumulativeAvgViewTraces = [];

    for (var categoryId in categoryTraces) {
        if (categoryTraces.hasOwnProperty(categoryId) && categoryId != "years" &&
            categoryId != "totals") {
            let viewTrace = categoryTraces[categoryId]["viewTrace"];
            let avgViewTrace = categoryTraces[categoryId]["avgViewTrace"];
            let cumulativeViewTrace = categoryTraces[categoryId]["cumulativeViews"];
            let cumulativeAvgViewTrace =
                categoryTraces[categoryId]["cumulativeAvgViewTrace"];
            let categoryName = categoryTraces[categoryId]["name"];
            let percentageTrace = [];
            for (var i = 0; i < viewTrace.length; i++) {
                let percentage = (100 * (viewTrace[i] / yearlyTotals[i])).toFixed(2);
                percentageTrace.push(percentage);
            }
            let lineColor = categoryColors[categoryName].color;
            if (lineColor == undefined) {
                lineColor = "#a0a0a0"
            }
            let fillColor = lineColor + "80";
            viewTraces.push({
                "x": years,
                "y": viewTrace,
                "stackgroup": "one",
                "fillcolor": fillColor,
                "line": {
                    "color": lineColor
                },
                "hovertemplate": "%{text}% of %{x} views: <i>" + categoryName + "</i><extra></extra>",
                "name": categoryName,
                "text": percentageTrace
            });
            avgViewTraces.push({
                "x": years,
                "y": avgViewTrace,
                "stackgroup": "one",
                "fillcolor": fillColor,
                "line": {
                    "color": lineColor
                },
                "hovertemplate": "~%{y:,g} views per video in %{x}: <i>" + categoryName + "</i><extra></extra>",
                "name": categoryName,
            });
            cumulativeViewTraces.push({
                "x": years,
                "y": cumulativeViewTrace,
                "stackgroup": "one",
                "fillcolor": fillColor,
                "line": {
                    "color": lineColor
                },
                "hovertemplate": "%{y:,g} views: <i>" + categoryName + "</i><extra></extra>",
                "name": categoryName
            });
            cumulativeAvgViewTraces.push({
                "x": years,
                "y": cumulativeAvgViewTrace,
                "stackgroup": "one",
                "fillcolor": fillColor,
                "line": {
                    "color": lineColor
                },
                "hovertemplate": "~%{y:,g} views per video: <i>" + categoryName + "</i><extra></extra>",
                "name": categoryName
            });
        }
    }
    var sortDescByLastY = function (a, b) {
        return parseInt(b["y"][numYears - 1]) - parseInt(a["y"][numYears - 1]);
    };
    viewTraces.sort(sortDescByLastY);
    avgViewTraces.sort(sortDescByLastY);
    cumulativeViewTraces.sort(sortDescByLastY);
    cumulativeAvgViewTraces.sort(sortDescByLastY);

    var graphHeight = 0.8583;
    var graphWidth = 0.9528;
    var height = graphHeight * document.documentElement.clientHeight;
    var width = graphWidth * document.documentElement.clientWidth;
    var legendFontSize =
        Math.floor(0.017 * document.documentElement.clientHeight);
    var tickSize = Math.floor(0.0104 * document.documentElement.clientWidth);
    var axisTitleSize = Math.floor(0.0156 * document.documentElement.clientWidth);
    var titleSize = Math.floor(0.0208 * document.documentElement.clientWidth);
    var hoverDistance = Math.floor(0.0260 * document.documentElement.clientWidth);
    var topMargin = Math.floor(0.03 * document.documentElement.clientWidth);
    var bottomMargin = Math.floor(0.0104 * document.documentElement.clientWidth);

    let viewLayout = {
        height: height,
        width: width,
        hoverdistance: hoverDistance,
        hoverlabel: {
            font: {
                size: tickSize
            },
            namelength: -1
        },
        hovermode: "x",
        hovertemplate: "Test",
        legend: {
            bgcolor: "#eeeeee",
            font: {
                size: legendFontSize
            },
            y: 0.5
        },
        margin: {
            b: bottomMargin,
            t: topMargin
        },
        paper_bgcolor: "rgba(0,0,0,0)",
        title: {
            font: {
                size: titleSize
            },
            text: "Views By Category"
        },
        xaxis: {
            automargin: true,
            fixedrange: true,
            tickfont: {
                size: tickSize
            },
            ticks: "outside",
            title: {
                font: {
                    size: axisTitleSize
                },
                text: "Year"
            }
        },
        yaxis: {
            automargin: true,
            fixedrange: true,
            tickfont: {
                size: tickSize
            },
            ticks: "outside",
            tickprefix: "  ", // To give extra space between ticks and axis title
            title: {
                font: {
                    size: axisTitleSize
                },
                text: "Yearly Views"
            }
        }
    }

    let config = {
        scrollZoom: false,
        displayModeBar: false,
    }

    let plotViews = "categories-views-chart";
    let plotViewsNorm = "categories-normal-views-chart";
    let plotCumViews = "categories-cum-views-chart";
    let plotCumViewsNorm = "categories-normal-cum-views-chart";
    let plotAvgViews = "categories-avg-views-chart";
    let plotAvgViewsNorm = "categories-normal-avg-views-chart";
    let plotCumAvgViews = "categories-cum-avg-views-chart";
    let plotCumAvgViewsNorm = "categories-normal-cum-avg-views-chart";


    let normalViewTraces = JSON.parse(JSON.stringify(viewTraces));
    normalViewTraces[0]["groupnorm"] = "percent";
    let normalViewLayout = JSON.parse(JSON.stringify(viewLayout));
    normalViewLayout.title.text = "Views By Category, Normalized"
    normalViewLayout.yaxis.title.text = "Percent Views";
    normalViewLayout.yaxis.ticksuffix = "%";


    let cumulativeViewLayout = JSON.parse(JSON.stringify(viewLayout));
    cumulativeViewLayout.title.text = "Cumulative Views By Category";
    cumulativeViewLayout.yaxis.title.text = "Cumulative Views";

    let normalCumulativeViewTraces = JSON.parse(JSON.stringify(cumulativeViewTraces));
    normalCumulativeViewTraces[0]["groupnorm"] = "percent";
    let normalCumulativeViewLayout = JSON.parse(JSON.stringify(cumulativeViewLayout));
    normalCumulativeViewLayout.title.text = "Cumulative Views By Category, Normalized";
    normalCumulativeViewLayout.yaxis.title.text = "Percent Cumulative Views";
    normalCumulativeViewLayout.yaxis.ticksuffix = "%";
    for (var i = 0; i < normalCumulativeViewTraces.length; i++) {
        var trace = normalCumulativeViewTraces[i];
        var categoryName = trace.name;
        trace.hovertemplate = "%{y:.2f}% of total views: <i>" + categoryName + "</i><extra></extra>";
    }


    let avgViewLayout = JSON.parse(JSON.stringify(viewLayout));
    avgViewLayout.title.text = "Average Views Per Video By Category";
    avgViewLayout.yaxis.title.text = "Average Views Per Video";
    avgViewLayout.yaxis.tickformat = ",g";

    let normalAvgViewTraces = JSON.parse(JSON.stringify(avgViewTraces));
    normalAvgViewTraces[0]["groupnorm"] = "percent";
    let normalAvgViewLayout = JSON.parse(JSON.stringify(avgViewLayout));
    normalAvgViewLayout.title.text = "Average Views Per Video By Category, Normalized";
    normalAvgViewLayout.yaxis.title.text = "Percent Average Views Per Video";
    normalAvgViewLayout.yaxis.ticksuffix = "%";
    for (var i = 0; i < normalAvgViewTraces.length; i++) {
        var trace = normalAvgViewTraces[i];
        var categoryName = trace.name;
        trace.hovertemplate = "%{y:.2f}%: <i>" + categoryName + "</i><extra></extra>";
    }


    let cumulativeAvgViewLayout = JSON.parse(JSON.stringify(viewLayout));
    cumulativeAvgViewLayout.title.text = "Cumulative Average Views Per Video By Category";
    cumulativeAvgViewLayout.yaxis.title.text = "Average Views Per Video";
    cumulativeAvgViewLayout.yaxis.tickformat = ",g";

    let normalCumulativeAvgViewTraces = JSON.parse(JSON.stringify(cumulativeAvgViewTraces));
    normalCumulativeAvgViewTraces[0]["groupnorm"] = "percent";
    let normalCumulativeAvgViewLayout = JSON.parse(JSON.stringify(cumulativeAvgViewLayout));
    normalCumulativeAvgViewLayout.title.text = "Cumulative Average Views Per Video By Category, Normalized";
    normalCumulativeAvgViewLayout.yaxis.title.text = "Percent Average Views Per Video";
    normalCumulativeAvgViewLayout.yaxis.ticksuffix = "%";
    for (var i = 0; i < normalCumulativeAvgViewTraces.length; i++) {
        var trace = normalCumulativeAvgViewTraces[i];
        var categoryName = trace.name;
        trace.hovertemplate = "%{y:.2f}%: <i>" + categoryName + "</i><extra></extra>";
    }

    let plotInfo = [
        [plotViews, viewTraces, viewLayout],
        [plotViewsNorm, normalViewTraces, normalViewLayout],
        [plotCumViews, cumulativeViewTraces, cumulativeViewLayout],
        [plotCumViewsNorm, normalCumulativeViewTraces, normalCumulativeViewLayout],
        [plotAvgViews, avgViewTraces, avgViewLayout],
        [plotAvgViewsNorm, normalAvgViewTraces, normalAvgViewLayout],
        [plotCumAvgViews, cumulativeAvgViewTraces, cumulativeAvgViewLayout],
        [plotCumAvgViewsNorm, normalCumulativeAvgViewTraces,
            normalCumulativeAvgViewLayout],
    ];
    for (var i = 0; i < plotInfo.length; i++) {
        let [graphId, trace, layout] = plotInfo[i];
        try {
            recordGraphData(graphId, trace, layout, config, graphHeight, graphWidth);
            Plotly.newPlot(graphId, trace, layout, config);
            recordGraphSize(graphId, graphHeight, graphWidth);
        } catch (err) {
            //console.log("There was an error initiating graph: " + graphId + ", Error: ", err);
        }
    }
}

function displayCardPerformanceCharts() {
    let cardData = JSON.parse(localStorage.getItem("cardData"));

    let months = [];
    let cardImpressions = [];
    let cardCTR = [];
    let cardTeaserImpressions = [];
    let cardTeaserCTR = [];

    // If the last month has no data (all zeros), omit it from the graph
    let numMonths = cardData.length;
    let lastMonth = cardData[cardData.length - 1];
    if (lastMonth[1] == 0 && lastMonth[3] == 0) {
        numMonths--;
    }

    for (var i = 0; i < numMonths; i++) {
        months.push(cardData[i][0]);
        cardImpressions.push(cardData[i][1]);
        cardCTR.push(cardData[i][2] * 100);
        cardTeaserImpressions.push(cardData[i][3]);
        cardTeaserCTR.push(cardData[i][4] * 100);
    }

    var impressionsTrace = {
        "x": months,
        "y": cardImpressions,
        "type": "bar",
        "hovertemplate": "%{y} Impressions<extra></extra>",
        "name": "Card Impressions"
    };

    var ctrTrace = {
        "x": months,
        "y": cardCTR,
        "type": "scatter",
        "hovertemplate": "%{y} Click Rate<extra></extra>",
        "line": {
            "width": 4,
        },
        "name": "Card Click Rate",
        "yaxis": "y2"
    };

    var teaserImpressionsTrace = {
        "x": months,
        "y": cardTeaserImpressions,
        "type": "bar",
        "hovertemplate": "%{y:,g} Teaser Impressions<extra></extra>",
        "name": "Card Teaser Impressions"
    };

    var teaserCTRTrace = {
        "x": months,
        "y": cardTeaserCTR,
        "type": "scatter",
        "hovertemplate": "%{y} Teaser Click Rate<extra></extra>",
        "line": {
            "width": 4,
        },
        "name": "Card Teaser Click Rate",
        "yaxis": "y2"
    };

    var cardTraces = [impressionsTrace, ctrTrace];
    var cardTeaserTraces = [teaserImpressionsTrace, teaserCTRTrace];

    var graphHeight = 0.4159;
    var graphWidth = 0.9192;
    var teaserGraphWidth = 0.9528;
    var height = graphHeight * document.documentElement.clientHeight;
    var width = graphWidth * document.documentElement.clientWidth;
    var teaserWidth = teaserGraphWidth * document.documentElement.clientWidth;
    var legendFontSize =
        Math.floor(0.017 * document.documentElement.clientHeight);
    var tickSize = Math.floor(0.0094 * document.documentElement.clientWidth);
    var axisTitleSize = Math.floor(0.013 * document.documentElement.clientWidth);
    var titleSize = Math.floor(0.0156 * document.documentElement.clientWidth);
    var topMargin = Math.floor(0.03 * document.documentElement.clientWidth);
    var bottomMargin = Math.floor(0.0104 * document.documentElement.clientWidth);

    var cardLayout = {
        height: height,
        width: width,
        legend: {
            bgcolor: "#eeeeee",
            font: {
                size: legendFontSize
            },
            x: 1.1,
            y: 0.5
        },
        margin: {
            b: bottomMargin,
            t: topMargin
        },
        title: {
            font: {
                size: titleSize
            },
            text: "Card Performance"
        },
        xaxis: {
            automargin: true,
            fixedrange: true,
            hoverformat: "%b %Y",
            tickformat: "%b<br>%Y",
            tickfont: {
                size: tickSize
            },
            title: {
                font: {
                    size: axisTitleSize
                },
                text: "Month"
            }
        },
        yaxis: {
            automargin: true,
            fixedrange: true,
            tickfont: {
                size: tickSize
            },
            title: {
                font: {
                    size: axisTitleSize
                },
                text: "Card Impressions"
            }
        },
        yaxis2: {
            automargin: true,
            fixedrange: true,
            showgrid: false,
            tickfont: {
                size: tickSize
            },
            title: {
                font: {
                    size: axisTitleSize
                },
                text: "Card Click Rate"
            },
            overlaying: "y",
            side: "right",
            ticksuffix: "%",
            zeroline: false
        }
    };

    let config = {
        scrollZoom: false,
        displayModeBar: false,
    }

    let teaserLayout = JSON.parse(JSON.stringify(cardLayout));
    teaserLayout.title.text = "Card Teaser Performance";
    teaserLayout.yaxis.title.text = "Card Teaser Impressions";
    teaserLayout.width = teaserWidth;

    let cardTeaserGraph = "card-teaser-performance-chart";
    let cardGraph = "card-performance-chart";

    recordGraphData(cardTeaserGraph, cardTeaserTraces, teaserLayout, config,
        graphHeight, graphWidth);
    Plotly.newPlot(cardTeaserGraph, cardTeaserTraces, teaserLayout, config);
    recordGraphSize(cardTeaserGraph, graphHeight, teaserGraphWidth);

    recordGraphData(cardGraph, cardTraces, cardLayout, config, graphHeight,
        graphWidth);
    Plotly.newPlot(cardGraph, cardTraces, cardLayout, config);
    recordGraphSize(cardGraph, graphHeight, graphWidth);

    localStorage.removeItem("cardData");
}

function displayTopCategories() {
    let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
    var excludeKeys = ["SPECIAL CATEGORIES", "OTHER", "MISC"];

    var total = 0;
    let otherTotal = 0;
    var graphHeight = 0.8583;
    var graphWidth = 0.9528;
    var height = graphHeight * document.documentElement.clientHeight;
    var width = graphWidth * document.documentElement.clientWidth;
    var titleFontSize = Math.floor(0.0234 * document.documentElement.clientWidth);
    var labelFontSize = Math.floor(0.0200 * document.documentElement.clientWidth);
    var legendFontSize =
        Math.floor(0.0125 * document.documentElement.clientWidth);
    var values = [];
    var labels = [];
    var colors = [];
    var type = "views";
    var cutoff = 0.025;

    var labelConversion = categoryColors;

    for (var i = 0; i < categoryStats.length; i++) {
        let category = categoryStats[i];
        let include = category.root;
        if (include) {
            for (var j = 0; j < excludeKeys.length; j++) {
                if (category.name.includes(excludeKeys[j])) {
                    include = false;
                }
            }
        }
        if (include) {
            total += Math.round(category[type]);
        }
    }
    for (var i = 0; i < categoryStats.length; i++) {
        let category = categoryStats[i];
        let include = category.root;
        if (include) {
            for (var j = 0; j < excludeKeys.length; j++) {
                if (category.name.includes(excludeKeys[j])) {
                    include = false;
                }
            }
        }
        if (include) {
            let value = Math.round(category[type]);
            if (value / total <= cutoff) {
                otherTotal += value;
            } else {
                values.push(value);
                labels.push(labelConversion[category.shortName].name);
                colors.push(labelConversion[category.shortName].color);
            }
        }
    }
    if (cutoff != undefined && cutoff > 0) {
        values.push(otherTotal);
        labels.push("Other");
        colors.push("#5fe0ed");
    }

    var data1 = {
        values: values,
        labels: labels,
        marker: {
            colors: colors
        },
        domain: {
            row: 0,
            column: 0
        },
        name: "Total Views<br>By Category",
        title: {
            text: "Total Views<br>By Category",
            font: {
                size: titleFontSize
            }
        },
        textinfo: "label",
        textposition: "inside",
        hoverlabel: {
            namelength: "-1"
        },
        hovertemplate: "%{label}<br>%{value} views<br>%{percent}",
        sort: false,
        type: 'pie',
        rotation: 90
    };

    // Avg Views Graph

    total = 0;
    otherTotal = 0;
    values = [];
    labels = [];
    colors = [];
    type = "avgViews";
    cutoff = 0.025;

    for (var i = 0; i < categoryStats.length; i++) {
        let category = categoryStats[i];
        let include = category.root;
        if (include) {
            for (var j = 0; j < excludeKeys.length; j++) {
                if (category.name.includes(excludeKeys[j])) {
                    include = false;
                }
            }
        }
        if (include) {
            total += Math.round(category[type]);
        }
    }
    for (var i = 0; i < categoryStats.length; i++) {
        let category = categoryStats[i];
        let include = category.root;
        if (include) {
            for (var j = 0; j < excludeKeys.length; j++) {
                if (category.name.includes(excludeKeys[j])) {
                    include = false;
                }
            }
        }
        if (include) {
            let value = Math.round(category[type]);
            if (value / total <= cutoff) {
                otherTotal += value;
            } else {
                values.push(value);
                labels.push(labelConversion[category.shortName].name);
                colors.push(labelConversion[category.shortName].color);
            }
        }
    }
    if (cutoff != undefined && cutoff > 0) {
        values.push(otherTotal);
        labels.push("Other");
        colors.push("#5fe0ed");
    }

    var data2 = {
        values: values,
        labels: labels,
        marker: {
            colors: colors
        },
        domain: {
            row: 0,
            column: 1
        },
        name: "Average Views Per Video<br>By Category",
        title: {
            text: "Average Views Per Video<br>By Category",
            font: {
                size: titleFontSize
            }
        },
        textinfo: "label",
        textposition: "inside",
        hoverlabel: {
            namelength: "-1"
        },
        hovertemplate: "%{label}<br>~%{value} views per video<br>%{percent}",
        sort: false,
        type: 'pie',
        rotation: 140
    };

    var data = [data2, data1];

    var layout = {
        height: height,
        width: width,
        font: { size: labelFontSize },
        automargin: true,
        autosize: true,
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        legend: {
            bgcolor: "#eeeeee",
            font: {
                size: legendFontSize
            },
            y: 0.5
        },
        grid: {
            rows: 1,
            columns: 2
        },
        margin: {
            b: 5,
            l: 5,
            r: 5,
            t: 5
        }
    };

    var config = {
        staticPlot: true,
        responsive: true
    };

    var graphId = "categories-double-views-chart";
    recordGraphData(graphId, data, layout, config, graphHeight, graphWidth);

    var currentSettings = JSON.parse(localStorage.getItem("settings"));
    var theme = "";
    var index = 0;
    while (index < currentSettings.dashboards.length && theme == "") {
        if (currentSettings.dashboards[index].name == "product-categories") {
            theme = currentSettings.dashboards[index].theme;
        }
        index++;
    }
    if (theme == "dark") {
        layout["plot_bgcolor"] = "#222";
        layout["paper_bgcolor"] = "#222";
        layout["font"]["color"] = "#fff";
        layout["legend"]["bgcolor"] = "#444";
        layout["legend"]["font"]["color"] = "#fff";
    }

    Plotly.newPlot(graphId, data, layout, config);

    recordGraphSize(graphId, graphHeight, graphWidth);
}

// Displays thumbnails with arrows on Top Ten Dashboard
function displayTopTenThumbnails() {
    let topTenSheet = JSON.parse(localStorage.getItem("topTenSheet"));
    let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
    let output = ``;
    for (var j = 1; j < topTenSheet.length; j++) {
        for (var i = 0; i < 11; i++) {
            if (i == 0) {
                output += `<div class="column-title"><h4>${topTenSheet[j][i]}</h4></div>`;
            } else {
                var videoId = topTenSheet[j][i];
                var views = numberWithCommas(parseInt(topTenSheet[j][i + 10]));
                var minutesWatched = numberWithCommas(parseInt(topTenSheet[j][i + 20]));
                var videoTitle = "YouTube Video ID: " + videoId;
                if (statsByVideoId && statsByVideoId[videoId]) {
                    videoTitle = statsByVideoId[videoId]["title"];
                }
                videoTitle += ` | ${views} views & ${minutesWatched} minutes watched`;
                output += `
            <div class="top-ten-thumbnail-holder column-thumbnail">
              <a href="https://youtu.be/${videoId}" target="_blank"
                  onclick="closeFullscreen()" alt="${videoTitle}">
                <img class="top-ten-thumbnail"
                    src="https://i.ytimg.com/vi/${videoId}/mqdefault.jpg" 
                    alt="thumbnail" title="${videoTitle}">`;
                if (j != 1) {
                    var currPosition = i;
                    var prevPosition = topTenSheet[j - 1].indexOf(videoId);
                    if (prevPosition == -1) {
                        // Add + up arrow
                        output += `
                <span class="oi oi-arrow-thick-top arrow-green"></span>
                <span class="arrow-text-black">+</span>
              `;
                    } else if (prevPosition != currPosition) {
                        var change = prevPosition - currPosition;
                        if (change < 0) {
                            // Add down arrow
                            output += `
                  <span class="oi oi-arrow-thick-bottom arrow-red"></span>
                  <span class="arrow-text-white">${Math.abs(change)}</span>
                `;
                        } else if (change > 0) {
                            // Add up arrow
                            output += `
                  <span class="oi oi-arrow-thick-top arrow-green"></span>
                  <span class="arrow-text-black">${change}</span>
                `;
                        }
                    }
                }
                output += `</a></div>`;
            }
        }
    }
    let thumbnailContainer =
        document.getElementById("top-ten-thumbnail-container");
    thumbnailContainer.innerHTML = output;
    let thumbnailWrapper = document.getElementById("top-ten-thumbnail-wrapper");
    thumbnailWrapper.scrollLeft = thumbnailWrapper.scrollWidth;
}

function displayTopVideoTitle(videoId, dashboardId) {
    let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
    let title = document.getElementById(dashboardId + "-title");
    title.innerHTML = statsByVideoId[videoId]["title"];
    let duration = statsByVideoId[videoId]["duration"];
    document.getElementById(dashboardId + "-duration").innerHTML = "Duration: " +
        secondsToDuration(duration);
    document.getElementById(dashboardId + "-duration-seconds").innerHTML =
        duration;

    let publishDateText = document.getElementById(dashboardId + "-publish-date");
    let publishDate = statsByVideoId[videoId]["publishDate"];
    let year = publishDate.slice(0, 4);
    let month = publishDate.slice(5, 7);
    let day = publishDate.slice(8, 10);
    publishDate = month + "/" + day + "/" + year;
    publishDateText.innerHTML = "Published: " + publishDate;

    let thumbnail = document.getElementById(dashboardId + "-thumbnail");
    let videoTitle = "YouTube Video ID: " + videoId;
    if (statsByVideoId && statsByVideoId[videoId]) {
        videoTitle = statsByVideoId[videoId]["title"];
    }
    let thumbnailText = `
      <a href="https://youtu.be/${videoId}" target="_blank"
          onclick="closeFullscreen()" alt="${videoTitle}">
        <img class="top-video-thumbnail" onload="thumbnailCheck($(this), true)"
            src="https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg"
            alt="thumbnail" title="${videoTitle}">
      </a>`;
    thumbnail.innerHTML = thumbnailText;

    let videoData = {
        "videoId": videoId,
        "title": statsByVideoId[videoId]["title"],
        "duration": statsByVideoId[videoId]["duration"],
        "publishDate": publishDate,
        "thumbnail": thumbnailText
    };
    recordTopVideoStats(dashboardId, videoData);
}

// Load thumbnails in 1000 thumbnail dashboard
function displayUploadThumbnails() {
    try {
        let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
        var carouselInner = document.getElementsByClassName("carousel-inner")[0];
        if (carouselInner.children.thumbnails) {
            let uploads = JSON.parse(localStorage.getItem("uploads"));
            if (!uploads) {
                throw "Uploads does not exist";
            } else {
                var uploadThumbnails = "";
                for (var i = 0; i < uploads.length; i++) {
                    var videoTitle = "YouTube Video ID: " + uploads[i];
                    if (statsByVideoId && statsByVideoId[uploads[i]]) {
                        videoTitle = statsByVideoId[uploads[i]]["title"];
                    }
                    uploadThumbnails += `
              <a href="https://youtu.be/${uploads[i]}" target="_blank"
                  onclick="closeFullscreen()" alt="${videoTitle}">
                <img class="thumbnail"
                    src="https://i.ytimg.com/vi/${uploads[i]}/mqdefault.jpg" 
                    alt="thumbnail" title="${videoTitle}">
              </a>`;
                }
                var thumbnailContainer = document.getElementById("thumbnail-container");
                thumbnailContainer.innerHTML = uploadThumbnails;

                if (!autoScrollDivs.includes("thumbnail-wrapper")) {
                    let currentSettings = JSON.parse(localStorage.getItem("settings"));
                    let speed = -1;
                    let index = 0;
                    while (speed == -1 && index <= currentSettings.dashboards.length) {
                        let dashboard = currentSettings.dashboards[index];
                        if (dashboard.name == "thumbnails") {
                            speed = dashboard.scrollSpeed;
                        }
                        index++;
                    }
                    if (speed <= 0) {
                        speed = 0;
                    } else {
                        speed = Math.ceil(1000 / speed);
                    }
                    new AutoDivScroll("thumbnail-wrapper", speed, 1, 1);
                    autoScrollDivs.push("thumbnail-wrapper");
                }
            }
        }
    } catch (err) {
        //console.log(err);
        window.setTimeout(displayUploadThumbnails, 5000);
    }
}

function displayUserFeedback() {
    let feedbackSheet = JSON.parse(localStorage.getItem("feedbackSheet"));
    let statsByVideoId = JSON.parse(localStorage.getItem("statsByVideoId"));
    let output = ``;
    for (var i = 1; i < feedbackSheet.length; i++) {
        var videoId = feedbackSheet[i][0];
        var feedbackText = feedbackSheet[i][1];
        let videoTitle = "YouTube Video ID: " + videoId;
        if (statsByVideoId && statsByVideoId[videoId]) {
            videoTitle = statsByVideoId[videoId]["title"];
        }
        var thumbnail = `
        <div class="col-4">
          <a href="https://youtu.be/${videoId}" target="_blank"
              onclick="closeFullscreen()" alt="${videoTitle}">
            <img class="feedback-thumbnail" onload="thumbnailCheck($(this), true)"
                src="https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg"
                alt="thumbnail" title="${videoTitle}">
          </a>
        </div>`;
        var feedback = `
        <div class="col-8">
          <h1 class="feedback-text">"${feedbackText}"</h1>
        </div>
      `;
        var spacer = `<div class="col-12"><hr></div>`;
        if (i % 2 == 0) {
            output += feedback + thumbnail;
        } else {
            output += thumbnail + feedback;
        }
        if (i != feedbackSheet.length - 1) {
            output += spacer;
        }
    }
    let feedbackContainer = document.getElementById("feedback-container");
    feedbackContainer.innerHTML = output;
    if (!autoScrollDivs.includes("feedback-wrapper")) {
        let currentSettings = JSON.parse(localStorage.getItem("settings"));
        let speed = -1;
        let index = 0;
        while (speed == -1 && index <= currentSettings.dashboards.length) {
            let dashboard = currentSettings.dashboards[index];
            if (dashboard.name == "top-ten") {
                speed = dashboard.scrollSpeed;
            }
            index++;
        }
        if (speed <= 0) {
            speed = 0;
        } else {
            speed = Math.ceil(1000 / speed);
        }
        new AutoDivScroll("feedback-wrapper", speed, 1, 1);
        autoScrollDivs.push("feedback-wrapper");
    }

}

function recordTopVideoStats(dashboardId, data) {
    let topVideoStats = JSON.parse(localStorage.getItem("topVideoStats"));
    if (!topVideoStats) {
        topVideoStats = {};
    }
    if (!topVideoStats[dashboardId]) {
        topVideoStats[dashboardId] = {};
    }
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            topVideoStats[dashboardId][key] = data[key];
        }
    }
    if (!topVideoStats["numUpdates"]) {
        topVideoStats["numUpdates"] = 0;
    }
    topVideoStats["numUpdates"] = topVideoStats["numUpdates"] + 1;
    if (topVideoStats["numUpdates"] == 12) {
        delete topVideoStats["numUpdates"];
        localStorage.setItem("topVideoStats", JSON.stringify(topVideoStats));
        saveTopVideoStatsToSheets();
    } else {
        localStorage.setItem("topVideoStats", JSON.stringify(topVideoStats));
    }
}

function recordGraphData(graphId, data, layout, config, graphHeight, graphWidth,
    automargin) {
    let graphData = JSON.parse(localStorage.getItem("graphData"));
    if (!graphData || Object.keys(graphData).length >= totalNumGraphs) {
        graphData = {};
    }
    if (!automargin) {
        automargin = "None";
    }
    graphData[graphId] = {
        "data": data,
        "layout": layout,
        "config": config,
        "graphHeight": graphHeight,
        "graphWidth": graphWidth,
        "automargin": automargin,
    };
    if (Object.keys(graphData).length == totalNumGraphs) {
        localStorage.setItem("graphData", JSON.stringify(graphData));
        saveGraphDataToSheets();
    } else {
        localStorage.setItem("graphData", JSON.stringify(graphData));
    }
}

function recordGraphSize(graphId, graphHeight, graphWidth, automargin) {
    if (!localStorage.getItem("graphSizes")) {
        localStorage.setItem("graphSizes", JSON.stringify({}));
    }
    let graphSizes = JSON.parse(localStorage.getItem("graphSizes"));
    graphSizes[graphId] = {
        height: graphHeight,
        width: graphWidth
    };
    if (automargin) {
        graphSizes[graphId]["automargin"] = automargin;
    }
    localStorage.setItem("graphSizes", JSON.stringify(graphSizes));
}

function resizeGraphs() {
    //this.//console.log("Resize");
    let graphSizes = JSON.parse(this.localStorage.getItem("graphSizes"));
    let viewportHeight = document.documentElement.clientHeight;
    let viewportWidth = document.documentElement.clientWidth;
    for (var graphId in graphSizes) {
        let height = graphSizes[graphId].height * viewportHeight;
        let width = graphSizes[graphId].width * viewportWidth;
        let update = {
            height: height,
            width: width
        };
        Plotly.relayout(graphId, update);
    }
}

function swapNormalCharts() {
    var activeDashboard =
        $(".carousel-container.active >>> .carousel-item.active")[0].id;
    var standardChartId = activeDashboard + "-chart";
    var standardChart = document.getElementById(standardChartId);
    if (standardChart) {
        if (standardChart.style.display == "none") {
            standardChart.style.display = "";
        } else {
            standardChart.style.display = "none";
        }
    }
}

function fixGraphMargins() {
    let graphSizes = JSON.parse(this.localStorage.getItem("graphSizes"));
    for (var graphId in graphSizes) {
        let automargin = graphSizes[graphId]["automargin"];
        if (automargin) {
            Plotly.relayout(graphId, automargin);
        }
    }
}

function updateTheme(dashboardIndex) {
    try {
        if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
            var endDashboard =
                document.getElementsByClassName("carousel-item")[dashboardIndex];
            var body = document.getElementsByTagName("body")[0];
            if (endDashboard.getAttribute("theme") == "dark") {
                body.className = "dark";
                if (endDashboard.id == "platform") {
                    document.getElementsByClassName("demographics-table")[0]
                        .classList.add("table-dark");
                }
            } else {
                body.className = "";
            }
        }
    } catch (err) {
        console.error(err);
    }
}

function carouselNext() {
    $(".carousel-container.active > .carousel").carousel("next");
}

function carouselPrev() {
    $(".carousel-container.active > .carousel").carousel("prev");
}

function pauseDashboard() {
    let pauseText = document.getElementById("pause-text");
    let playText = document.getElementById("play-text");
    $("#dashboard-carousel").carousel('pause');
    pauseText.style.display = "initial";
    playText.style.display = "none";
}

function playDashboard() {
    let pauseText = document.getElementById("pause-text");
    let playText = document.getElementById("play-text");
    $("#dashboard-carousel").carousel('cycle');
    pauseText.style.display = "none";
    playText.style.display = "initial";
    setTimeout(function () {
        if (playText.offsetHeight != 0) {
            $('#play-text').fadeOut();
        }
    }, 2000);
}

function toggleDashboardPause() {
    let pauseText = document.getElementById("pause-text");
    if (pauseText.offsetHeight == 0) {
        pauseDashboard();
    } else {
        playDashboard();
    }
}

function goToCarouselItem(index) {
    $(".carousel-container.active > .carousel").carousel(index);
}

function swapCarousels() {
    let activeCarouselContainer = $(".carousel-container.active");
    let inactiveCarouselContainer = $(".carousel-container:not(.active)");
    pauseDashboard();
    activeCarouselContainer.removeClass("active");
    inactiveCarouselContainer.addClass("active");
}

function loadSignedIn() {
    var signinModalButton = document.getElementById("signin-modal-button");
    var signoutModalButton = document.getElementById("signout-modal-button");
    signinModalButton.style.display = "none";
    signoutModalButton.style.display = "inline";
    initializeUpdater();
    loadDashboards();
    updateTheme(0);
}

function loadSignedOut() {
    var signinModalButton = document.getElementById("signin-modal-button");
    var signoutModalButton = document.getElementById("signout-modal-button");
    signinModalButton.style.display = "inline";
    signoutModalButton.style.display = "none";
    initializeUpdater();
    loadDashboardsSignedOut();
}

function loadCategoryCharts() {
    requestSpreadsheetData("1lRYxCbEkNo2zfrBRfRwJn1H_2FOxOy7p36SvZSw4XHQ",
        "Category Views By Year");
}

// Get current settings
if (!localStorage.getItem("settings")) {
    localStorage.setItem("settings", JSON.stringify(defaultSettings));
}
var currentSettings = JSON.parse(localStorage.getItem("settings"));
//console.log("Current Settings: ", currentSettings);


// Initialize carousels
var carouselInner = document.getElementById("main-carousel-inner");
var indicatorList = document.getElementById("main-indicator-list");
const cycleSpeed = currentSettings.cycleSpeed * 1000;
var carousel = document.getElementById("dashboard-carousel");
carousel.setAttribute("data-interval", cycleSpeed);
carousel.setAttribute("data-pause", "false");

var categoryStatsCarousel = document.getElementById("category-stats-carousel");
categoryStatsCarousel.setAttribute("data-interval", 0);
categoryStatsCarousel.setAttribute("data-pause", "false");

// Set order of dashboards
var enabledOrder = new Array(currentSettings.numEnabled);
for (var i = 0; i < currentSettings.dashboards.length; i++) {
    var dashboard = currentSettings.dashboards[i];
    if (dashboard.index >= 0) {
        enabledOrder.splice(dashboard.index, 1, {
            "name": dashboard.name,
            "icon": dashboard.icon,
            "theme": dashboard.theme,
            "title": dashboard.title
        });
    }
}
for (var i = 0; i < enabledOrder.length; i++) {
    var dashboardItem = document.getElementById(enabledOrder[i].name);
    var indicator = document.getElementById("indicator").cloneNode();
    if (enabledOrder[i].name.includes("top-video-")) {
        dashboardItem = document.getElementById("top-video-#").cloneNode(true);
        dashboardText = dashboardItem.outerHTML;
        dashboardText = dashboardText.replace(/top-video-#/g, enabledOrder[i].name);
        dashboardText =
            dashboardText.replace(/TITLE PLACEHOLDER/, enabledOrder[i].title);
        var template = document.createElement("template");
        template.innerHTML = dashboardText;
        dashboardItem = template.content.firstChild;
    } else {
        dashboardItem.remove();
    }
    document.createElement("div", dashboardItem.outerText)
    dashboardItem.setAttribute("theme", enabledOrder[i].theme);
    indicator.id = "main-indicator-" + i;
    indicator.setAttribute("onclick", "goToCarouselItem(" + i + ")");
    indicator.className = enabledOrder[i].icon + " indicator";
    carouselInner.appendChild(dashboardItem);
    indicatorList.appendChild(indicator);
    if (i == 0) {
        dashboardItem.classList.add("active");
        indicator.classList.add("active");
    }
}

// Handle carousel scrolling and keyboard shortcuts
document.addEventListener("keyup", function (e) {
    if (e.key == "ArrowLeft") {
        carouselPrev();
    } else if (e.key == "ArrowRight") {
        carouselNext();
    } else if (e.key == "ArrowUp" || e.key == "ArrowDown") {
        swapCarousels();
    } else if (e.which == 32) {
        toggleDashboardPause();
    } else if (e.key == "F2") {
        signIn();
    } else if (e.key.toUpperCase() == "A") {
        goToCarouselItem(9);
    } else if (e.key.toUpperCase() == "B") {
        goToCarouselItem(10);
    } else if (e.key.toUpperCase() == "C") {
        goToCarouselItem(11);
    } else if (e.key.toUpperCase() == "D") {
        goToCarouselItem(12);
    } else if (e.key.toUpperCase() == "E") {
        goToCarouselItem(13);
    } else if (e.key.toUpperCase() == "F") {
        goToCarouselItem(14);
    } else if (e.key.toUpperCase() == "N") {
        swapNormalCharts();
    } else if (e.key.toUpperCase() == "R") {
        loadCategoryCharts();
    } else if (!isNaN(e.key) && e.which != 32) {
        if (e.ctrlKey || e.altKey) {
            goToCarouselItem(parseInt(e.key) + 9);
        } else {
            goToCarouselItem(parseInt(e.key) - 1);
        }
    }
});
$(".carousel").on("slide.bs.carousel", function (e) {
    var carouselName = e.target.getAttribute("name");
    var indicatorName = carouselName + "-indicator-";
    var startIndicator = document.getElementById(indicatorName + e.from);
    var endIndicator = document.getElementById(indicatorName + e.to);
    startIndicator.classList.remove("active");
    endIndicator.classList.add("active");
    window.setTimeout(function () {
        fixGraphMargins();
        updateTheme(e.to);
        // Scroll top ten dashboard to the end on load
        let topTenWrapper = document.getElementById("top-ten-thumbnail-wrapper");
        if (topTenWrapper.scrollLeft != topTenWrapper.scrollWidth) {
            topTenWrapper.scrollLeft = topTenWrapper.scrollWidth;
        }
    }, 250);
});
$(".carousel").on("slid.bs.carousel", function (e) {
    fixGraphMargins();
})

window.addEventListener('resize', function () {
    resizeGraphs();
    let topTenDashboard = document.getElementById("top-ten");
    if (topTenDashboard.classList.contains("active")) {
        let thumbnailContainer =
            document.getElementById("top-ten-thumbnail-container");
        thumbnailContainer.style.display = "none";
        this.window.setTimeout(function () {
            thumbnailContainer.style.display = "flex";
        }, 500);
    }
}, true);