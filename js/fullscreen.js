window.onload = function () {
  document.getElementById('fullscreen-button')
      .addEventListener("click", function () { toggleFullscreen(); });
}
const doc = document.documentElement;

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