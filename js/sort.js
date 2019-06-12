/* 
  Sort functions for categoryStats and allVideoStats
  The sorted array is recorded to localStorage after sorting
*/

function sortCategoriesByViews() {
  let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
  categoryStats.sort(function(a, b) {
    return parseInt(b["views"]) - parseInt(a["views"]);
  });
  console.log("Stats Sorted by views: ", categoryStats);
  localStorage.setItem("categoryStats", JSON.stringify(categoryStats));
  displayTopCategories("views");
}

function sortCategoriesByLikes() {
  let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
  categoryStats.sort(function(a, b) {
    return parseInt(b["likes"]) - parseInt(a["likes"]);
  });
  console.log("Stats Sorted by likes: ", categoryStats);
  localStorage.setItem("categoryStats", JSON.stringify(categoryStats));
  displayTopCategories("likes");
}

function sortCategoriesByAvgViews() {
  let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
  categoryStats.sort(function(a, b) {
    return parseInt(b["avgViews"]) - parseInt(a["avgViews"]);
  });
  console.log("Stats Sorted by AvgViews: ", categoryStats);
  localStorage.setItem("categoryStats", JSON.stringify(categoryStats));
  displayTopCategories("avgViews");
}

function sortCategoriesByAvgLikes() {
  let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
  categoryStats.sort(function(a, b) {
    return parseInt(b["avgLikes"]) - parseInt(a["avgLikes"]);
  });
  console.log("Stats Sorted by AvgLikes: ", categoryStats);
  localStorage.setItem("categoryStats", JSON.stringify(categoryStats));
  displayTopCategories("avgLikes");
}

function sortCategoriesByAvgDuration() {
  let categoryStats = JSON.parse(localStorage.getItem("categoryStats"));
  categoryStats.sort(function(a, b) {
    return parseInt(b["avgDuration"]) - parseInt(a["avgDuration"]);
  });
  console.log("Stats Sorted by AvgDuration: ", categoryStats);
  localStorage.setItem("categoryStats", JSON.stringify(categoryStats));
  displayTopCategories("avgDuration");
}

function sortVideosByViews() {
  let allVideoStats = JSON.parse(localStorage.getItem("allVideoStats"));
  allVideoStats.sort(function(a, b) {
    return parseInt(b["views"]) - parseInt(a["views"]);
  });
  console.log("Videos Sorted by Views: ", allVideoStats);
  localStorage.setItem("allVideoStats", JSON.stringify(allVideoStats));
  displayTopVideos();
}

function sortVideosByLikes() {
  let allVideoStats = JSON.parse(localStorage.getItem("allVideoStats"));
  allVideoStats.sort(function(a, b) {
    return parseInt(b["likes"]) - parseInt(a["likes"]);
  });
  console.log("Videos Sorted by Likes: ", allVideoStats);
  localStorage.setItem("allVideoStats", JSON.stringify(allVideoStats));
  displayTopVideos();
}