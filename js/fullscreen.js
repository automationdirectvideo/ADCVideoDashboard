window.onload = function () {
  document.getElementById('fullscreen-button')
      .addEventListener("click", function () { toggleFullscreen(); });
}
const doc = document.documentElement;
var fullscreenStatus = "closed";

function openFullscreen() {
  if (doc.requestFullscreen) {
    doc.requestFullscreen();
  } else if (doc.mozRequestFullScreen) {
    doc.mozRequestFullScreen();
  } else if (doc.webkitRequestFullscreen) {
    doc.webkitRequestFullscreen();
  } else if (doc.msRequestFullscreen) {
    doc.msRequestFullscreen();
  }
  fullscreenStatus = "opened";
}

function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
  fullscreenStatus = "closed";
}

function toggleFullscreen() {
  const fullscreenButton = document.getElementById('fullscreen-button');
  if (fullscreenStatus == "opened") {
    closeFullscreen();
    fullscreenButton.className = "fas fa-expand-arrows-alt";
  } else {
    openFullscreen();
    fullscreenButton.className = "fas fa-compress-arrows-alt";
  }
}