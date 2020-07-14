/**
 * Creates the Videographer - Average Views Per Video stacked bar graph
 *
 * @param {Object} videographers Videographer statistics
 */
function displayVideographerAvgViews(videographers) {
  videographers = videographers || lsGet("videographers");
  const graphIds = getDashboardGraphIds("videographerGraphs").avgViews;
  const categories = {
    "all": {
      "graphId": graphIds.all,
      "title": "Average Views Per Video By Videographer (All Videos)",
    },
    "organic": {
      "graphId": graphIds.organic,
      "title": "Average Views Per Video By Videographer (Organic Videos)",
    },
    "notOrganic": {
      "graphId": graphIds.notOrganic,
      "title": "Average Views Per Video By Videographer (Not Organic Videos)",
    },
  };
  for (const category in categories) {
    if (categories.hasOwnProperty(category)) {
      const graphTitle = categories[category].title;
      const graphId = categories[category].graphId;
      const graphHeight = 0.8583;
      const graphWidth = 0.9528;
      const height = graphHeight * document.documentElement.clientHeight;
      const width = graphWidth * document.documentElement.clientWidth;
      const titleFontSize =
        Math.floor(0.0208 * document.documentElement.clientWidth);
      const legendFontSize =
        Math.floor(0.0128 * document.documentElement.clientWidth);
      const axisTitleSize =
        Math.floor(0.0156 * document.documentElement.clientWidth);
      const textSize =
        Math.floor(0.0156 * document.documentElement.clientWidth);
      const tickSize =
        Math.floor(0.0128 * document.documentElement.clientWidth);
      const topMargin = Math.floor(0.03 * document.documentElement.clientWidth);
      const bottomMargin =
        Math.floor(0.0104 * document.documentElement.clientWidth);

      let allTime = [];
      let lastXDays = [];
      const people = ["Shane C", "Rick F", "Tim W"];
      people.forEach(name => {
        const stats = videographers[name][category];
        const avgViews = Math.round(stats.avgViews);
        const lastXDaysAvgViews = Math.round(stats.lastXDaysAvgViews);
        allTime.push(avgViews);
        lastXDays.push(lastXDaysAvgViews);
      });
      const trace1 = {
        x: people,
        y: allTime,
        name: "All Time",
        offsetgroup: 1,
        textfont: {
          size: textSize
        },
        textposition: "auto",
        texttemplate: "~%{y:,}<br>views",
        type: "bar",
        yaxis: "y"
      };
      let trace2 = JSON.parse(JSON.stringify(trace1));
      trace2.y = lastXDays;
      trace2.name = "Last 30 Days";
      trace2.offsetgroup = 2;
      trace2.yaxis = "y2";
      let data = [trace1, trace2];

      const layout = {
        height: height,
        width: width,
        barmode: "group",
        hovermode: false,
        legend: {
          bgcolor: "#eeeeee",
          font: {
            size: legendFontSize
          },
          x: 1.1,
          xanchor: 'left',
          y: 0.5
        },
        margin: {
          b: bottomMargin,
          t: topMargin
        },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        title: {
          font: {
            size: titleFontSize
          },
          text: graphTitle
        },
        xaxis: {
          automargin: true,
          fixedrange: true,
          tickfont: {
            size: tickSize
          },
          title: {
            font: {
              size: axisTitleSize
            },
            text: "Videographers"
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
            text: "Average Views Per Video (All Time)"
          }
        },
        yaxis2: {
          automargin: true,
          fixedrange: true,
          showgrid: false,
          overlaying: "y",
          side: "right",
          zeroline: false,
          tickfont: {
            size: tickSize
          },
          title: {
            font: {
              size: axisTitleSize
            },
            text: "Average Views Per Video (Last 30 Days)"
          }
        }
      };

      const config = {
        scrollZoom: false,
        displayModeBar: false,
        staticPlot: true,
        responsive: true
      }

      try {
        createGraph(graphId, data, layout, config, graphHeight, graphWidth,
          false);
      } catch (err) {
        displayGraphError(graphId, err);
      }
    }
  }
}

/**
 * Creates the Monthly Videos and Cumulative Videos By Videographer stacked line
 * graphs
 *
 * @param {Object} videographers Videographer statistics
 */
function displayVideographerMonthlyVideos(videographers) {
  videographers = videographers || lsGet("videographers");
  const people = ["Shane C", "Rick F", "Tim W"];
  const graphIds = [
    getDashboardGraphIds("videographerGraphs").cumulativeVideos,
    getDashboardGraphIds("videographerGraphs").monthlyVideos
  ];
  const categories = {
    "all": {
      "cumulative": {
        "graphId": graphIds[0].all,
        "title": "Cumulative Videos By Videographer (All Videos)"
      },
      "monthly": {
        "graphId": graphIds[1].all,
        "title": "Monthly Videos By Videographer (All Videos)"
      }
    },
    "organic": {
      "cumulative": {
        "graphId": graphIds[0].organic,
        "title": "Cumulative Videos By Videographer (Organic Videos)"
      },
      "monthly": {
        "graphId": graphIds[1].organic,
        "title": "Monthly Videos By Videographer (Organic Videos)"
      }
    },
    "notOrganic": {
      "cumulative": {
        "graphId": graphIds[0].notOrganic,
        "title": "Cumulative Videos By Videographer (Not Organic Videos)"
      },
      "monthly": {
        "graphId": graphIds[1].notOrganic,
        "title": "Monthly Videos By Videographer (Not Organic Videos)"
      }
    }
  };
  for (const category in categories) {
    if (categories.hasOwnProperty(category)) {
      const cumulativeGraphTitle = categories[category].cumulative.title;
      const cumulativeGraphId = categories[category].cumulative.graphId;
      const monthlyGraphTitle = categories[category].monthly.title;
      const monthlyGraphId = categories[category].monthly.graphId;
      let cumulativeData = [];
      let monthlyData = [];

      people.forEach(name => {
        const stats = videographers[name][category];
        const monthlyVideos = stats.monthlyVideos;
        let sortList = [];
        for (const month in monthlyVideos) {
          if (monthlyVideos.hasOwnProperty(month)) {
            const numVideos = monthlyVideos[month];
            sortList.push({
              month: month,
              numVideos: numVideos
            });
          }
        }
        sortList.sort(function (a, b) {
          return a.month > b.month ? 1 :
            a.month == b.month ? 0 :
            -1;
        });
        let months = [];
        let cumulativeNumVideos = [];
        let monthlyNumVideos = [];
        let videoTotal = 0;
        let cumulativeCustomData = [];
        let monthlyCustomData = [];
        sortList.forEach(elem => {
          videoTotal += elem.numVideos;
          months.push(elem.month);
          cumulativeNumVideos.push(videoTotal);
          monthlyNumVideos.push(elem.numVideos);
          let cumulativeText = [];
          if (elem.numVideos == 1) {
            cumulativeText.push("1 new video");
            monthlyCustomData.push("1 video");
          } else {
            cumulativeText.push(`${elem.numVideos} new videos`);
            monthlyCustomData.push(`${elem.numVideos} videos`);
          }
          if (videoTotal == 1) {
            cumulativeText.push("1 video total");
          } else {
            cumulativeText.push(`${videoTotal} videos total`);
          }
          cumulativeCustomData.push(cumulativeText);
        });
        let cumulativeTrace = {
          x: months,
          y: cumulativeNumVideos,
          name: name,
          customdata: cumulativeCustomData,
          stackgroup: "one",
          hovertemplate: "%{customdata[0]} in %{x}" +
            "<br>%{customdata[1]}<extra>" + name + "</extra>",
        };
        let monthlyTrace = {
          x: months,
          y: monthlyNumVideos,
          name: name,
          customdata: monthlyCustomData,
          stackgroup: "one",
          groupnorm: "percent",
          hovertemplate: "%{y:.0f}% of total videos<br>%{customdata}<extra>" +
            name +"</extra>",
        };
        cumulativeData.push(cumulativeTrace);
        monthlyData.push(monthlyTrace);
      });

      const graphHeight = 0.8583;
      const graphWidth = 0.9528;
      const height = graphHeight * document.documentElement.clientHeight;
      const width = graphWidth * document.documentElement.clientWidth;
      const titleFontSize =
        Math.floor(0.0208 * document.documentElement.clientWidth);
      const legendFontSize =
        Math.floor(0.0100 * document.documentElement.clientWidth);
      const axisTitleSize =
        Math.floor(0.0156 * document.documentElement.clientWidth);
      const tickSize =
        Math.floor(0.0104 * document.documentElement.clientWidth);
      const topMargin = Math.floor(0.03 * document.documentElement.clientWidth);
      const bottomMargin =
        Math.floor(0.0104 * document.documentElement.clientWidth);

      const cumulativeLayout = {
        height: height,
        width: width,
        hoverlabel: {
          font: {
            size: tickSize
          },
          namelength: -1
        },
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
        plot_bgcolor: "rgba(0,0,0,0)",
        title: {
          font: {
            size: titleFontSize
          },
          text: cumulativeGraphTitle
        },
        xaxis: {
          automargin: true,
          fixedrange: true,
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
            text: "Cumulative Videos Created"
          }
        }
      };
      let monthlyLayout = JSON.parse(JSON.stringify(cumulativeLayout));
      monthlyLayout.title.text = monthlyGraphTitle;
      monthlyLayout.yaxis.ticksuffix = "%";
      monthlyLayout.yaxis.title.text = "Percentage of Videos Created";

      const config = {
        scrollZoom: false,
        displayModeBar: false,
      }

      document.querySelector(".graph-loading-container").style.display = "none";

      try {
        createGraph(cumulativeGraphId, cumulativeData, cumulativeLayout, config,
          graphHeight, graphWidth, false);
      } catch (err) {
        displayGraphError(cumulativeGraphId, err);
      }
      try {
        createGraph(monthlyGraphId, monthlyData, monthlyLayout, config,
          graphHeight, graphWidth, false);
      } catch (err) {
        displayGraphError(monthlyGraphId, err);
      }
    }
  }
}

/**
 * Creates the Monthly Views and Cumulative Views By Videographer stacked line
 * graphs
 *
 * @param {Object} videographers Videographer statistics
 */
function displayVideographerMonthlyViews(videographers) {
  videographers = videographers || lsGet("videographers");
  const people = ["Shane C", "Rick F", "Tim W"];
  const graphIds = [
    getDashboardGraphIds("videographerGraphs").cumulativeViews,
    getDashboardGraphIds("videographerGraphs").monthlyViews
  ];
  const categories = {
    "all": {
      "cumulative": {
        "graphId": graphIds[0].all,
        "title": "Cumulative Views By Videographer (All Videos)"
      },
      "monthly": {
        "graphId": graphIds[1].all,
        "title": "Monthly Views By Videographer (All Videos)"
      }
    },
    "organic": {
      "cumulative": {
        "graphId": graphIds[0].organic,
        "title": "Cumulative Views By Videographer (Organic Videos)"
      },
      "monthly": {
        "graphId": graphIds[1].organic,
        "title": "Monthly Views By Videographer (Organic Videos)"
      }
    },
    "notOrganic": {
      "cumulative": {
        "graphId": graphIds[0].notOrganic,
        "title": "Cumulative Views By Videographer (Not Organic Videos)"
      },
      "monthly": {
        "graphId": graphIds[1].notOrganic,
        "title": "Monthly Views By Videographer (Not Organic Videos)"
      }
    }
  };
  for (const category in categories) {
    if (categories.hasOwnProperty(category)) {
      const cumulativeGraphTitle = categories[category].cumulative.title;
      const cumulativeGraphId = categories[category].cumulative.graphId;
      const monthlyGraphTitle = categories[category].monthly.title;
      const monthlyGraphId = categories[category].monthly.graphId;
      let cumulativeData = [];
      let monthlyData = [];

      people.forEach(name => {
        const stats = videographers[name][category];
        const monthlyViews = stats.monthlyViews;
        let sortList = [];
        for (const month in monthlyViews) {
          if (monthlyViews.hasOwnProperty(month)) {
            const numViews = monthlyViews[month];
            sortList.push({
              month: month,
              numViews: numViews
            });
          }
        }
        sortList.sort(function (a, b) {
          return a.month > b.month ? 1 :
            a.month == b.month ? 0 :
            -1;
        });
        let months = [];
        let cumulativeNumViews = [];
        let monthlyNumViews = [];
        let viewTotal = 0;
        let cumulativeCustomData = [];
        let monthlyCustomData = [];
        sortList.forEach(elem => {
          viewTotal += elem.numViews;
          months.push(elem.month);
          cumulativeNumViews.push(viewTotal);
          monthlyNumViews.push(elem.numViews);
          let cumulativeText = [];
          if (elem.numViews == 1) {
            cumulativeText.push("1 new view");
            monthlyCustomData.push("1 view");
          } else {
            cumulativeText.push(`${numberWithCommas(elem.numViews)} new views`);
            monthlyCustomData.push(`${numberWithCommas(elem.numViews)} views`);
          }
          if (viewTotal == 1) {
            cumulativeText.push("1 view total");
          } else {
            cumulativeText.push(`${numberWithCommas(viewTotal)} views total`);
          }
          cumulativeCustomData.push(cumulativeText);
        });
        let cumulativeTrace = {
          x: months,
          y: cumulativeNumViews,
          name: name,
          customdata: cumulativeCustomData,
          stackgroup: "one",
          hovertemplate: "%{customdata[0]} in %{x}" +
            "<br>%{customdata[1]}<extra>" + name + "</extra>",
        };
        let monthlyTrace = {
          x: months,
          y: monthlyNumViews,
          name: name,
          customdata: monthlyCustomData,
          stackgroup: "one",
          groupnorm: "percent",
          hovertemplate: "%{y:.0f}% of total videos<br>%{customdata}<extra>" +
            name +"</extra>",
        };
        cumulativeData.push(cumulativeTrace);
        monthlyData.push(monthlyTrace);
      });

      const graphHeight = 0.8583;
      const graphWidth = 0.9528;
      const height = graphHeight * document.documentElement.clientHeight;
      const width = graphWidth * document.documentElement.clientWidth;
      const titleFontSize =
        Math.floor(0.0208 * document.documentElement.clientWidth);
      const legendFontSize =
        Math.floor(0.0100 * document.documentElement.clientWidth);
      const axisTitleSize =
        Math.floor(0.0156 * document.documentElement.clientWidth);
      const tickSize =
        Math.floor(0.0104 * document.documentElement.clientWidth);
      const topMargin = Math.floor(0.03 * document.documentElement.clientWidth);
      const bottomMargin =
        Math.floor(0.0104 * document.documentElement.clientWidth);

      const cumulativeLayout = {
        height: height,
        width: width,
        hoverlabel: {
          font: {
            size: tickSize
          },
          namelength: -1
        },
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
        plot_bgcolor: "rgba(0,0,0,0)",
        title: {
          font: {
            size: titleFontSize
          },
          text: cumulativeGraphTitle
        },
        xaxis: {
          automargin: true,
          fixedrange: true,
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
            text: "Cumulative Views"
          }
        }
      };
      let monthlyLayout = JSON.parse(JSON.stringify(cumulativeLayout));
      monthlyLayout.title.text = monthlyGraphTitle;
      monthlyLayout.yaxis.ticksuffix = "%";
      monthlyLayout.yaxis.title.text = "Percentage of Views";

      const config = {
        scrollZoom: false,
        displayModeBar: false,
      }

      try {
        createGraph(cumulativeGraphId, cumulativeData, cumulativeLayout, config,
          graphHeight, graphWidth, false);
      } catch (err) {
        displayGraphError(cumulativeGraphId, err);
      }
      try {
        createGraph(monthlyGraphId, monthlyData, monthlyLayout, config,
          graphHeight, graphWidth, false);
      } catch (err) {
        displayGraphError(monthlyGraphId, err);
      }
    }
  }
}

function displayVideographerStats(videographers = lsGet("videographers")) {
  const people = ["Shane C", "Rick F", "Tim W"];
  people.forEach(name => {
    const updatedName = name.replace(" ", "*");
    for (const category in videographers[name]) {
      if (videographers[name].hasOwnProperty(category)) {
        const vStats = videographers[name][category];
        // Main vstats dashboard
        const preCatId = `vstats-${updatedName}-`;
        const dashboardId = `${preCatId}${category}-`;
        const viewsTotal = document.getElementById(`${dashboardId}views-total`);
        const viewsAvg = document.getElementById(`${dashboardId}views-avg`);
        const subsTotal = document.getElementById(`${dashboardId}subs-total`);
        const subsAvg = document.getElementById(`${dashboardId}subs-avg`);
        const commentsTotal =
          document.getElementById(`${dashboardId}comments-total`);
        const commentsAvg =
          document.getElementById(`${dashboardId}comments-avg`);
        const likesTotal = document.getElementById(`${dashboardId}likes-total`);
        const likesAvg = document.getElementById(`${dashboardId}likes-avg`);
        const dislikesTotal =
          document.getElementById(`${dashboardId}dislikes-total`);
        const dislikesAvg =
          document.getElementById(`${dashboardId}dislikes-avg`);
        const likeRatioTotal =
          document.getElementById(`${dashboardId}like-ratio-total`);
        const likeRatioAvg =
          document.getElementById(`${dashboardId}like-ratio-avg`);
        const likeBarTotal =
          document.getElementById(`${dashboardId}like-bar-total`);
        const likeBarAvg =
          document.getElementById(`${dashboardId}like-bar-avg`);
        const durationTotal =
          document.getElementById(`${dashboardId}duration-total`);
        const durationAvg =
          document.getElementById(`${dashboardId}duration-avg`);
        viewsTotal.innerHTML = numberWithCommas(vStats.totalViews);
        viewsAvg.innerHTML = numberWithCommas(roundTo(vStats.avgViews, 0));
        subsTotal.innerHTML = numberWithCommas(vStats.totalSubsGained);
        subsAvg.innerHTML = roundTo(vStats.avgSubsGained, 2);
        commentsTotal.innerHTML = numberWithCommas(vStats.totalComments);
        commentsAvg.innerHTML = roundTo(vStats.avgComments, 1);
        likesTotal.innerHTML = numberWithCommas(vStats.totalLikes);
        likesAvg.innerHTML = roundTo(vStats.avgLikes, 2);
        dislikesTotal.innerHTML = numberWithCommas(vStats.totalDislikes);
        dislikesAvg.innerHTML = roundTo(vStats.avgDislikes, 2);
        const totalLikeRatio = decimalToPercent(vStats.cumLikeRatio);
        const avgLikeRatio = decimalToPercent(vStats.avgLikeRatio);
        likeRatioTotal.innerHTML = totalLikeRatio + "%";
        likeRatioAvg.innerHTML = avgLikeRatio + "%";
        likeBarTotal.style.width = totalLikeRatio + "%";
        likeBarAvg.style.width = avgLikeRatio + "%";
        durationTotal.innerHTML =
          secondsToDurationLabeled(vStats.totalDuration.toFixed(0));
        durationAvg.innerHTML =
          secondsToDurationLabeled(vStats.avgDuration.toFixed(0));

        // Overall vstats dashboard
        const preCatOverallId = `vstats-overall-${updatedName}-`;
        const dashboardOverallId = `${preCatOverallId}${category}-`;
        const videosTotal =
          document.getElementById(`${dashboardOverallId}videos-total`);
        const videosLast =
          document.getElementById(`${dashboardOverallId}videos-last`);
        const avpTotal =
          document.getElementById(`${dashboardOverallId}avp-total`);
        const avpLast =
          document.getElementById(`${dashboardOverallId}avp-last`);
        const minWatchedTotal =
          document.getElementById(`${dashboardOverallId}watched-total`);
        const minWatchedLast =
          document.getElementById(`${dashboardOverallId}watched-last`);
        videosTotal.innerHTML = vStats.numVideos;
        videosLast.innerHTML = numberWithCommas(vStats.numVideosLastXDays);
        avpTotal.innerHTML = roundTo(vStats.avgViewPercentage, 1) + "%";
        avpLast.innerHTML = roundTo(vStats.avgViewPercentageLastXDays, 1) + "%";
        minWatchedTotal.innerHTML = numberWithCommas(vStats.minWatched);
        minWatchedLast.innerHTML = numberWithCommas(vStats.minWatchedLastXDays);

        let ids = [{
            "dashboardId": dashboardId,
            "preCatId": preCatId,
            "leftBtn": {
              "id": null,
              "target": null
            },
            "rightBtn": {
              "id": `${dashboardId}more`,
              "target": `${dashboardOverallId}grid`
            }
          },
          {
            "dashboardId": dashboardOverallId,
            "preCatId": preCatOverallId,
            "leftBtn": {
              "id": null,
              "target": null
            },
            "rightBtn": {
              "id": `${dashboardOverallId}more`,
              "target": `${dashboardId}grid`
            }
          }
        ];
        ids.forEach(dashboard => {
          for (const category2 in videographers[name]) {
            if (videographers[name].hasOwnProperty(category2)) {
              // Add onclick functions to category buttons
              const currGrid =
                document.getElementById(`${dashboard.dashboardId}grid`);
              const gridBtn = document
                .getElementById(`${dashboard.dashboardId}btn-${category2}`);
              if (category == category2) {
                gridBtn.disabled = "disabled";
              } else {
                const targetGrid = document.getElementById(
                  `${dashboard.preCatId}${category2}-grid`);
                gridBtn.onclick = function () {
                  currGrid.classList.remove("active-grid");
                  targetGrid.classList.add("active-grid");
                }
              }
              // Add onclick functions to more stats and top videos buttons
              const rightBtn = document.getElementById(dashboard.rightBtn.id);
              const targetGrid =
                document.getElementById(dashboard.rightBtn.target);
              rightBtn.onclick = function () {
                currGrid.classList.remove("active-grid");
                targetGrid.classList.add("active-grid");
              }
            }
          }
        });
      }
    }
  });
}