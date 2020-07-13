function displayCategoryStrengthBars(categoryStats, categoryName,
  categoryColor) {
  const allVideoStats = lsGet("allVideoStats");
  const popupGraphTitle = document.getElementById("popup-graph-title");
  popupGraphTitle.innerHTML = categoryName;
  showCategoryStrengthGraph();

  let bins = [];
  let binCount = 0;
  let interval = 5;
  let maxValue = 100;

  // Setup Bins
  for (let i = 0; i < maxValue; i += interval){
    bins.push({
      binNum: binCount,
      minNum: i,
      maxNum: i + interval,
      count: 0
    });
    binCount++;
  }

  // Loop through data and add to bin's count
  const videosWithStrength = categoryStats.videosWithStrength;
  videosWithStrength.forEach(videoId => {
    const avsIndex = allVideoStats.findIndex((element) => {
      return videoId == element.videoId;
    });
    const videoStrength = allVideoStats[avsIndex].strength;
    for (let j = 0; j < bins.length; j++){
      let bin = bins[j];
      if (videoStrength > bin.minNum && videoStrength <= bin.maxNum){
        bin.count++;
      }
    }
  });

  let labels = [];
  let frequencies = [];
  let customdata = [];
  let labelsToShow = [];
  for (let index = 0; index < bins.length; index++) {
    const bin = bins[index];
    labels.push(bin.minNum);
    frequencies.push(bin.count / videosWithStrength.length);
    let numVideosText = `${bin.count} videos`;
    if (bin.count == 1) {
      numVideosText = `${bin.count} video`;
    }
    customdata.push([
      numVideosText,
      `${bin.minNum} - ${bin.maxNum}`
    ]);
    if (index % 2 == 0) {
      labelsToShow.push(String(bin.minNum));
    } else {
      labelsToShow.push("");
    }
  }

  const data = [{
    x: labels,
    y: frequencies,
    customdata: customdata,
    hovermode: "none",
    hovertemplate: "%{customdata[1]}<br>%{customdata[0]}<extra></extra>",
    offset: 0.5,
    marker: {
      color: categoryColor
    },
    type: "bar"
  }];

  var graphHeight = 0.2938;
  var graphWidth = 0.2713;
  var height = graphHeight * document.documentElement.clientHeight;
  var width = graphWidth * document.documentElement.clientWidth;
  var topMargin = Math.floor(0.02 * document.documentElement.clientWidth);
  var rightMargin = Math.floor(0.02 * document.documentElement.clientWidth);

  const layout = {
    height: height,
    width: width,
    bargap: 0,
    hovermode: "closest",
    margin: {
      b: 0,
      l: 0,
      r: rightMargin,
      t: topMargin
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    title: {
      text: "Distribution of Video Strength"
    },
    xaxis: {
      automargin: true,
      fixedrange: true,
      tickmode: "array",
      ticktext: labelsToShow,
      tickvals: labels,
      title: {
        text: "Video Strength"
      }
    },
    yaxis: {
      automargin: true,
      fixedrange: true,
      gridcolor: "#888888",
      tickprefix: "   ",
      title: {
        text: "Relative Frequency"
      },
      zerolinewidth: 2
    }
  };
  const config = {
    scrollZoom: false,
    displayModeBar: false,
    responsive: true
  };
  const graphId = "category-strength-popup-graph";
  try {
    createGraph(graphId, data, layout, config, graphHeight, graphWidth, false);
    document.getElementById(graphId).style.display = "initial";
    document.getElementById("popup-graph-loading").style.display = "none";
  } catch (err) {
    displayGraphError(graphId, err);
  }
}

function displayCategoryViewsAreaCharts(categoryTraces) {
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

  const graphIds = getDashboardGraphIds("categoryGraphs");

  let plotViews = graphIds[0];
  let plotViewsNorm = graphIds[1];
  let plotCumViews = graphIds[2];
  let plotCumViewsNorm = graphIds[3];
  let plotAvgViews = graphIds[4];
  let plotAvgViewsNorm = graphIds[5];
  let plotCumAvgViews = graphIds[6];
  let plotCumAvgViewsNorm = graphIds[7];


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
      normalCumulativeAvgViewLayout
    ],
  ];
  let numErrors = 0;
  for (var i = 0; i < plotInfo.length; i++) {
    let [graphId, trace, layout] = plotInfo[i];
    try {
      createGraph(graphId, trace, layout, config, graphHeight, graphWidth,
        false);
    } catch (err) {
      displayGraphError(graphId, err)
      numErrors++;
    }
  }
  return Promise.resolve("Displayed Category Views Area Charts with " +
    numErrors + " errors");
}

function displayTopCategoriesGraphTwo(categoryStats) {
  categoryStats = categoryStats || lsGet("categoryStats");
  const excludeKeys = ["SPECIAL CATEGORIES", "OTHER", "MISC"];

  const graphHeight = 0.8583;
  const graphWidth = 0.9528;
  const height = graphHeight * document.documentElement.clientHeight;
  const width = graphWidth * document.documentElement.clientWidth;
  const titleFontSize =
    Math.floor(0.0156 * document.documentElement.clientWidth);
  const labelFontSize =
    Math.floor(0.0100 * document.documentElement.clientWidth);
  const legendFontSize =
    Math.floor(0.0100 * document.documentElement.clientWidth);
  const axisTitleSize =
    Math.floor(0.013 * document.documentElement.clientWidth);
  const hoverFontSize =
    Math.floor(0.01 * document.documentElement.clientWidth);

  let values = [];
  let labels = [];
  let list = [];
  let type = "views";

  for (let i = 0; i < categoryStats.length; i++) {
    const category = categoryStats[i];
    let include = category.root;
    if (include) {
      for (let j = 0; j < excludeKeys.length; j++) {
        if (category.name.includes(excludeKeys[j])) {
          include = false;
        }
      }
    }
    if (include) {
      const value = Math.round(category[type]);
      list.push({
        "value": value,
        "label": category.shortName
      });
    }
  }
  // Sort by value from largest to smallest
  list.sort(function(a,b) {
    return a.value > b.value ? -1 :
      a.value == b.value ? 0 :
      1;
  });
  for (let index = 0; index < list.length; index++) {
    const category = list[index];
    values.push(category.value);
    labels.push(category.label);
  }

  const data1 = {
    x: labels,
    y: values,
    hoverlabel: {
      namelength: "-1"
    },
    hovertemplate: "%{label}<br>%{value:,} views<extra></extra>",
    name: "Total Views<br>By Category",
    offsetgroup: 1,
    type: 'bar',
    yaxis: "y"
  };

  // Avg Views Trace

  values = [];
  labels = [];
  list = [];
  type = "avgViews";

  for (let i = 0; i < categoryStats.length; i++) {
    const category = categoryStats[i];
    let include = category.root;
    if (include) {
      for (let j = 0; j < excludeKeys.length; j++) {
        if (category.name.includes(excludeKeys[j])) {
          include = false;
        }
      }
    }
    if (include) {
      const value = Math.round(category[type]);
      list.push({
        "value": value,
        "label": category.shortName
      });
    }
  }
  // Sort by value from largest to smallest
  list.sort(function(a,b) {
    return a.value > b.value ? -1 :
      a.value == b.value ? 0 :
      1;
  });
  for (let index = 0; index < list.length; index++) {
    const category = list[index];
    values.push(category.value);
    labels.push(category.label);
  }

  const data2 = {
    x: labels,
    y: values,
    hoverlabel: {
      namelength: "-1"
    },
    hovertemplate: "%{label}<br>~%{value:,} views per video<extra></extra>",
    name: "Average Views Per Video<br>By Category",
    offsetgroup: 2,
    type: 'bar',
    yaxis: "y2"
  };

  const data = [data1, data2];

  const layout = {
    height: height,
    width: width,
    font: {
      size: labelFontSize
    },
    hoverlabel: {
      font: {
        size: hoverFontSize
      }
    },
    legend: {
      bgcolor: "#eeeeee",
      font: {
        size: legendFontSize
      },
      x: 0.8
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    title: {
      font: {
        size: titleFontSize
      },
      text: "Product Category Performance"
    },
    xaxis: {
      automargin: true,
      fixedrange: true,
      title: {
        font: {
          size: axisTitleSize
        },
        text: "Category"
      }
    },
    yaxis: {
      automargin: true,
      fixedrange: true,
      title: {
        font: {
          size: axisTitleSize
        },
        text: "Total Category Views"
      }
    },
    yaxis2: {
      automargin: true,
      fixedrange: true,
      overlaying: "y",
      showgrid: false,
      side: "right",
      title: {
        font: {
          size: axisTitleSize
        },
        text: "Average Views Per Video"
      },
      zeroline: false,
    }
  };

  const config = {
    displayModeBar: false,
    scrollZoom: false
  }

  const graphIds = getDashboardGraphIds("product-categories");
  const graphId = graphIds.graphTwo;

  const theme = getCurrentDashboardTheme("product-categories");
  if (theme == "dark") {
    layout["plot_bgcolor"] = "#222";
    layout["paper_bgcolor"] = "#222";
    layout["font"]["color"] = "#fff";
    layout["legend"]["bgcolor"] = "#444";
    layout["legend"]["font"]["color"] = "#fff";
  }

  try {
    createGraph(graphId, data, layout, config, graphHeight, graphWidth, false);
  } catch (err) {
    displayGraphError(graphId, err);
  }
}

function displayTopCategoriesGraphThree(categoryStats) {
  categoryStats = categoryStats || lsGet("categoryStats");
  const excludeKeys = ["SPECIAL CATEGORIES", "OTHER", "MISC"];

  let minStrength = 1;
  categoryStats.forEach(category => {
    if (category.root) {
      const strength = category.strength;
      if (strength < minStrength) {
        minStrength = strength;
      }
    }
  });

  const graphHeight = 0.8583;
  const graphWidth = 0.9528;
  const height = graphHeight * document.documentElement.clientHeight;
  const width = graphWidth * document.documentElement.clientWidth;
  const titleFontSize = Math.floor(0.0125 * document.documentElement.clientWidth);
  const labelFontSize = Math.floor(0.0100 * document.documentElement.clientWidth);
  const legendFontSize =
    Math.floor(0.0100 * document.documentElement.clientWidth);
  const axisTitleSize = Math.floor(0.013 * document.documentElement.clientWidth);
  const hoverFontSize =
    Math.floor(0.01 * document.documentElement.clientWidth);

  let viewsList = [];
  let avgViewsList = [];
  let numVideosList = [];
  let labelList = [];
  let colors = [];
  let indices = [];
  let data = [];

  const labelConversion = categoryColors;

  for (let i = 0; i < categoryStats.length; i++) {
    let category = categoryStats[i];
    let include = category.root;
    if (include) {
      for (let j = 0; j < excludeKeys.length; j++) {
        if (category.name.includes(excludeKeys[j])) {
          include = false;
        }
      }
    }
    if (include) {
      let views = Math.round(category["views"]);
      let avgViews = Math.round(category["avgViews"]);
      let strength = Math.round(category["avgStrength"] * 100);
      let numVideos = category["videos"].length;
      let label = category.shortName;
      let color = labelConversion[category.shortName].color;
      if (strength != 0) {
        viewsList.push(views);
        avgViewsList.push(avgViews);
        numVideosList.push(numVideos);
        labelList.push(label);
        colors.push(color);
        indices.push(i);
        data.push({
          x: [views],
          y: [numVideos],
          mode: "markers",
          type: 'scatter',
          marker: {
            color: [color],
            size: [strength],
            sizemode: "area"
          },
          customdata: [
            [
              Math.round(category["avgStrength"]),
              i
            ]
          ],
          name: label,
          text: [label],
          hoverlabel: {
            namelength: "-1"
          },
          hovertemplate: "<b>%{text}</b><br>%{x:,} views<br>%{y} videos<br>Category Strength: %{customdata[0]:,}<extra></extra>"
        });
      }
    }
  }

  let layout = {
    height: height,
    width: width,
    font: {
      size: labelFontSize
    },
    hoverlabel: {
      font: {
        size: hoverFontSize
      }
    },
    hovermode: "closest",
    legend: {
      bgcolor: "#eeeeee",
      font: {
        size: legendFontSize
      },
      y: 0.5
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    title: {
      font: {
        size: titleFontSize
      },
      text: "<b>Product Category Performance</b><br>Circle Area is proportional to Category Strength"
    },
    xaxis: {
      automargin: true,
      fixedrange: true,
      gridcolor: "#aaaaaa",
      title: {
        font: {
          size: axisTitleSize
        },
        text: "Total Category Views"
      },
      type: "log"
    },
    yaxis: {
      automargin: true,
      fixedrange: true,
      gridcolor: "#888888",
      title: {
        font: {
          size: axisTitleSize
        },
        text: "Number of Videos"
      },
      type: "log"
    }
  };

  const config = {
    displayModeBar: false,
    scrollZoom: false
  }

  const graphIds = getDashboardGraphIds("product-categories");
  const graphId = graphIds.graphThree;

  const theme = getCurrentDashboardTheme("product-categories");
  if (theme == "dark") {
    layout["plot_bgcolor"] = "#222";
    layout["paper_bgcolor"] = "#222";
    layout["font"]["color"] = "#fff";
    layout["legend"]["bgcolor"] = "#444";
    layout["legend"]["font"]["color"] = "#fff";
  }

  try {
    createGraph(graphId, data, layout, config, graphHeight, graphWidth, false);
    const plot = document.getElementById(graphId);
    plot.on('plotly_click', (data) => {
      const categoryName = data.points[0].text;
      const categoryColor = data.points[0]["marker.color"];
      const categoryIndex = data.points[0].customdata[1];
      const stats = categoryStats[categoryIndex];
      displayCategoryStrengthBars(stats, categoryName, categoryColor);
    });
  } catch (err) {
    displayGraphError(graphId, err);
  }
}