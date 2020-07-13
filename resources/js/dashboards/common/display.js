// *Used by main & category stats dashboard sections
function displayTopCategoriesGraphOne(categoryStats) {
  categoryStats = categoryStats || lsGet("categoryStats");
  let excludeKeys = ["SPECIAL CATEGORIES", "OTHER", "MISC"];

  let total = 0;
  let otherTotal = 0;
  const graphHeight = 0.8583;
  const graphWidth = 0.9528;
  const height = graphHeight * document.documentElement.clientHeight;
  const width = graphWidth * document.documentElement.clientWidth;
  const titleFontSize = Math.floor(0.0234 * document.documentElement.clientWidth);
  const labelFontSize = Math.floor(0.0200 * document.documentElement.clientWidth);
  const legendFontSize =
    Math.floor(0.0125 * document.documentElement.clientWidth);
    
  const hoverFontSize = Math.floor(0.01 * document.documentElement.clientWidth);
  let values = [];
  let labels = [];
  let colors = [];
  let type = "views";
  let cutoff = 0.025;

  let labelConversion = categoryColors;

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
      total += Math.round(category[type]);
    }
  }
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

  const data1 = {
    values: values,
    labels: labels,
    domain: {
      row: 0,
      column: 0
    },
    hoverlabel: {
      namelength: "-1",
      font: {
        size: hoverFontSize
      }
    },
    hovertemplate:
      "<b>%{label}</b><br>%{value} views<br>%{percent}<extra></extra>",
    marker: {
      colors: colors
    },
    name: "Total Views<br>By Category",
    rotation: 90,
    sort: false,
    textinfo: "label",
    textposition: "inside",
    title: {
      font: {
        size: titleFontSize
      },
      text: "Total Views<br>By Category"
    },
    type: 'pie'
  };

  // Avg Views Graph

  total = 0;
  otherTotal = 0;
  values = [];
  labels = [];
  colors = [];
  type = "avgViews";
  cutoff = 0.025;

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
      total += Math.round(category[type]);
    }
  }
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

  const data2 = {
    values: values,
    labels: labels,
    domain: {
      row: 0,
      column: 1
    },
    hoverlabel: {
      namelength: "-1",
      font: {
        size: hoverFontSize
      }
    },
    hovertemplate:"<b>%{label}</b><br>~%{value} views per video<br>" +
      "%{percent}<extra></extra>",
    marker: {
      colors: colors
    },
    name: "Average Views Per Video<br>By Category",
    rotation: 140,
    sort: false,
    textinfo: "label",
    textposition: "inside",
    title: {
      font: {
        size: titleFontSize
      },
      text: "Average Views Per Video<br>By Category"
    },
    type: 'pie'
  };

  const data = [data2, data1];

  let layout = {
    height: height,
    width: width,
    automargin: true,
    autosize: true,
    font: {
      size: labelFontSize
    },
    grid: {
      columns: 2,
      rows: 1
    },
    legend: {
      bgcolor: "#eeeeee",
      font: {
        size: legendFontSize
      },
      y: 0.5
    },
    margin: {
      b: 5,
      l: 5,
      r: 5,
      t: 5
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)"
  };

  const config = {
    responsive: true,
    staticPlot: true
  };

  const graphIds = getDashboardGraphIds("product-categories");
  const graphId = graphIds.graphOne;

  const theme = getCurrentDashboardTheme("product-categories");
  if (theme == "dark") {
    layout["plot_bgcolor"] = "#222";
    layout["paper_bgcolor"] = "#222";
    layout["font"]["color"] = "#fff";
    layout["legend"]["bgcolor"] = "#444";
    layout["legend"]["font"]["color"] = "#fff";
  }

  try {
    createGraph(graphId, data, layout, config, graphHeight, graphWidth);
  } catch (err) {
    displayGraphError(graphId, err);
  }
}

// Creates daily views graph for a video in top video dashboard
// *Used by main & contest stats dashboard sections
function displayVideoDailyViews(response, dashboardId) {
  if (response) {
    const rows = response.result.rows;
    let xValues = [];
    let yValues = [];
    let labels = [];

    for (let i = 0; i < rows.length; i++) {
      xValues.push(rows[i][0]);
      const y = rows[i][1];
      yValues.push(y);
      if (y == 1) {
        labels.push(`${y} view`);
      } else {
        labels.push(`${y} views`);
      }
    }

    const graphHeight = 0.2280;
    const graphWidth = 0.4681;
    const height = graphHeight * document.documentElement.clientHeight;
    const width = graphWidth * document.documentElement.clientWidth;
    const fontSize = Math.floor(0.0104 * document.documentElement.clientWidth);
    const hoverFontSize =
      Math.floor(0.01 * document.documentElement.clientWidth);
    let xaxis = {
      automargin: true,
      fixedrange: true,
      tickangle: -60,
      tickformat: '%-m/%d',
      type: 'date'
    };
    let yaxis = {
      automargin: true,
      fixedrange: true,
      showline: true,
      showticklabels: true,
      title: 'Views'
    };
    let automargin = {
      xaxis: xaxis,
      yaxis: yaxis
    };

    const data = [{
      x: xValues,
      y: yValues,
      customdata: labels,
      fill: 'tozeroy',
      hovertemplate: "%{customdata}<extra></extra>",
      marker: {
        color: 'rgb(255,0,0)'
      },
      mode: 'lines',
      type: 'scatter'
    }];

    let layout = {
      height: height,
      width: width,
      font: {
        size: fontSize
      },
      hoverlabel: {
        font: {
          size: hoverFontSize
        }
      },
      margin: {
        b: 0,
        r: 0,
        t: 0
      },
      xaxis: xaxis,
      yaxis: yaxis
    };

    const config = {
      displayModeBar: false,
      responsive: true
    };

    const theme = getCurrentDashboardTheme(dashboardId);
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

    const graphIds = getDashboardGraphIds(dashboardId);
    const graphId = graphIds.dailyViews;

    try {
      createGraph(graphId, data, layout, config, graphHeight, graphWidth, true,
        automargin);
    } catch (err) {
      displayGraphError(graphId);
      throw err;
    }
  }
}