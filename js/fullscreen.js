window.onload = function () {
  document.getElementById('fullscreen-button')
      .addEventListener("click", function () { toggleFullscreen(); });
}
var doc = document.documentElement;
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
  var fullscreenButton = document.getElementById('fullscreen-button');
  if (fullscreenStatus == "opened") {
    closeFullscreen();
    fullscreenButton.src="open-iconic/svg/fullscreen-enter.svg";
  } else {
    openFullscreen();
    fullscreenButton.src="open-iconic/svg/fullscreen-exit.svg";
  }
}