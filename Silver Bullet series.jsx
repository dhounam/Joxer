// Functions to process series:
//    Line
//    Columns and bars
//    Thermometers

// PROCESS LINE SERIES
// Called from processContentGroup to deal with a collection of line series,
// each of which is a pathItem. Arg is the group of series.
function processLineSeries(group, contentLayer) {
  var isStacked = false;
  // Lines and possible fills are embedded in enclosing groups
// for(var i = 0; i < group.groupItems.length; i++) {
for(var i = group.groupItems.length - 1; i >= 0; i--) {
  var thisLine = group.groupItems[i].pathItems[0];
  setPathAttributes(thisLine);
  // Layer cake?
  if (group.groupItems[i].pathItems.length > 1) {
    var thisFill = group.groupItems[i].pathItems[1];
    setPathAttributes(thisFill);
    thisFill.move(contentLayer, ElementPlacement.PLACEATBEGINNING);
    // Some redundancy, but still: zero line comes to front of layercakes
    // (flag is global)
    zeroLineBehind = false;
  } else {
    zeroLineBehind = true;
  }
  thisLine.move(contentLayer, ElementPlacement.PLACEATBEGINNING);
}
// And handle any index dot. The assumption is that the
// overall line series group can contain only 1 pathItem: the dot
if (group.pathItems.length > 0) {
  var iDot = group.pathItems[0];
  if (iDot.name.search(c_indexDot) === 0) {
      setPathAttributes(iDot);
  }
}
}
// PROCESS LINE SERIES ends

// PROCESS COL-BAR-POINT SERIES
// Called from Content.processContentGroup to process a
// weries of column or bar rects, or a (line-) point series dots
function processColBarPointSeries(group, contentLayer, isPoints) {
  // Zero line flag, unless points for pointline series
  if (!isPoints) {
    zeroLineBehind = false;
  }
  // Group contains a subgroup for each series, so...
  for (var gNo = group.groupItems.length - 1; gNo >= 0; gNo--) {
    var seriesGroup = group.groupItems[gNo];
    // Loop by rects/dots
    for(var rNo = 0; rNo < seriesGroup.pathItems.length; rNo++) {
      var thisPath = seriesGroup.pathItems[rNo];
      setPathAttributes(thisPath, false);
    }
    seriesGroup.move(contentLayer, ElementPlacement.PLACEATBEGINNING);
    seriesGroup.name = c_myLinePointSeries;
  }
}
// PROCESS COL-BAR-POINT SERIES ends

// PROCESS THERMO SERIES
// Arg 'group' includes any number of series groups, and one group of spindles
function processThermoSeries(group, contentLayer) {
  // Group contains a subgroup for each series, so...
  for (var gNo = 0; gNo < group.groupItems.length; gNo++) {
    var seriesGroup = group.groupItems[gNo];
    // Loop by paths
    for(var rNo = 0; rNo < seriesGroup.pathItems.length; rNo++) {
      var thisPath = seriesGroup.pathItems[rNo];
      setPathAttributes(thisPath);
    }
  }
}
// PROCESS THERMO SERIES ends

// PROCESS SCATTER POINT ITEMS
// Called from processScatterSeries. Arg is a group
// representing one point
function processScatterPointItems(pGroup) {
  // A scatter point will have a dot; and may have
  // a link and text
  var pLen = pGroup.pageItems.length;
  for (pNo = pLen - 1; pNo >= 0; pNo--) {
    var item = pGroup.pageItems[pNo];
    var iName = item.name;
    if (iName.search('dot') >= 0 ) {
      setPathAttributes(item, false);
      if (pLen === 1) {
        item.move(pGroup.parent, ElementPlacement.PLACEATBEGINNING)
      }
    } else if (iName.search('link') >= 0 ) {
      setPathAttributes(item, false);
    } else {
      // text
      setTextFrameAttributes(item);
    }
  }
  //
  if (pLen > 1) {
    pGroup.name = c_myScatterPoint;
  } else {
    pGroup.remove();
  }
}
// PROCESS SCATTER POINT ITEMS ends

function processScatterSeries(group, contentLayer) {
  // Group contains a subgroup for each series, so...
  for (var gNo = group.groupItems.length - 1; gNo >= 0; gNo--) {
    var seriesGroup = group.groupItems[gNo];
    var pLen = seriesGroup.groupItems.length;
    if (pLen > 0) {
      // Each seriesGroup then contains a number of pointGroups,
      // each containing the dot, link and text
      // Loop by pointGroups
      for (var pNo = seriesGroup.groupItems.length - 1; pNo >= 0; pNo--) {
        var pointGroup = seriesGroup.groupItems[pNo];
        processScatterPointItems(pointGroup);
      }
      seriesGroup.move(contentLayer, ElementPlacement.PLACEATBEGINNING);
      seriesGroup.name = c_myScatterSeries;
    } else {
      // Just kill any empty group
      // (Currently, scatters contrive to include an empty group: '<div>')
      // NOTE: kill that in Sibyl
      seriesGroup.remove();
    }
  }
}

// PROCESS ONE PIE
// Called from processPieSeries. Argument is a group
// containing header text, and a number of 'wedges'
// NOTE: currently each wedge is just a path. 
// Eventually, there will be wedge-groups containing
// wedge-path, link(?) and label
function processOnePie(pieGroup) {
  // Count elements
  var elCount = pieGroup.pageItems.length;
  var wedgeNo = 1;
  for (var elNo = elCount - 1; elNo >= 0; elNo--) {
    var el = pieGroup.pageItems[elNo];
    var elName = el.name;
    // Can be path or text (or, eventually, group)
    if (elName.search('header') >= 0) {
      if (el.typename === 'TextFrame') {
        setTextFrameAttributes(el);
      } else {
        rationaliseText(el);
      }
      el.name = c_myPieHeader;
    } else if (el.typename = 'path') {
      setPathAttributes(el);
      el.name = c_myPieWedge + wedgeNo;
      wedgeNo++;
    } else {
      // NOTE: to come: deal with group
    }
  }
}
// PROCESS ONE PIE ends

// PROCESS PIE SERIES
// Processes pie. Arg is a group containing all the
// pies on the chart
function processPieSeries(group, contentLayer) {
  // Loop by individual pie groups:
  var pieCount = group.groupItems.length;
  var groupNumber = 1
  for (var pieNo = pieCount - 1; pieNo >= 0; pieNo--) {
    var pieGroup = group.groupItems[pieNo];
    processOnePie(pieGroup)
    pieGroup.move(contentLayer, ElementPlacement.PLACEATEND);
    pieGroup.name = c_myPieGroup + groupNumber;
    groupNumber++;
  }
}
// PROCESS PIE SERIES ends