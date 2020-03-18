// Content group/layer processing

var contentExists = true;

// FIX LINE SERIES GROUP STRUCTURE
// Called from processContentGroup.
// NOTE: this is at least partly temporary, until I can fix in Sibyl
// There are 2 issues:
// 		Line grouping has an additional interposed group,
// 			so move line series sub-group up a level
//		But also, this interposed group is duplicated, so I
//			need to eliminate the 'dummy'
function fixLineSeriesGroupStructure(cGroup) {
  // Loop, looking for the group
	var gLen = cGroup.groupItems.length;
	for (var gNo = gLen - 1; gNo >= 0; gNo--) {
    // Hunt through the content group
		var thisGroup = cGroup.groupItems[gNo];
		if (thisGroup.name === c_itsAllLineSeriesOuterGroup) {
			// This 'all-series' group should contain 2 inner groups:
             //     line-series-group:line
             //     line-series-group:points
            //  debugger;
             var g2Len = thisGroup.groupItems.length - 1;
             for (var g2No = g2Len; g2No >= 0; g2No--) {
                var innerGroup = thisGroup.groupItems[g2No];
                if (
                  innerGroup.name.search(':points') > 0 ||
                  innerGroup.name.search(':line') > 0
                ) {
                    // Target group of individual line or points series groups
                    // If these have contents, move them up a level
                    // debugger;
                    if (innerGroup.groupItems.length > 0) {
                        innerGroup.move(cGroup, ElementPlacement.PLACEATEND);
                    } else {
                        thisGroup.remove();
                    }
                }
            }
		}
	}
}
// FIX LINE SERIES GROUP STRUCTURE ends

// PROCESS TABLE RULES
// Called from processTableGroup to handle
// table rules
function processTableRules(rGrp) {
  // debugger;
  for (var rNo = 0; rNo < rGrp.pathItems.length; rNo++) {
    var thisRule = rGrp.pathItems[rNo];
    setPathAttributes(thisRule);
  }
}
// PROCESS TABLE RULES ends

// PROCESS TABLE FILLS
// Called from processTableGroup to handle
// table fills (tints)
function processTableFills(rGrp) {
  // debugger;
  for (var rNo = 0; rNo < rGrp.pathItems.length; rNo++) {
    var thisRule = rGrp.pathItems[rNo];
    setPathAttributes(thisRule);
  }
}
// PROCESS TABLE FILLS ends

// PROCESS TABLE GROUP
// Called from processContentLayer. Args are an outer
// table group, and the document obj
function processTableGroup(tGroup, myDoc) {
  // Table has 3 child groups: text, tints and rules
	// Number of outer group:
  var cIndex = isolateElementIndex(tGroup.name);
  // Text
  var tgName = c_myTableTextGroupName + (cIndex);
  var textGroup = myDoc.groupItems[tgName];
  // Move the entire text group into the content layer:
	var contentLayer = isolateContentLayer(myDoc, cIndex);
	textGroup.move(contentLayer, ElementPlacement.PLACEATBEGINNING);
	
  // Text comes as a group of separate textItems,
  // each corresponding to a Sibyl tSpan
  var textElement = textGroup.groupItems[0];
  var goodText = rationaliseText(textElement, true);
  // Rules
  var rgName = c_myTableRulesGroupName + (cIndex);
  var rulesGroup = myDoc.groupItems[rgName];
  // Move to content layer
	rulesGroup.move(contentLayer, ElementPlacement.PLACEATEND);
  //
  processTableRules(rulesGroup);
  // Fills
  var fgName = c_myTableFillsGroupName + (cIndex);
  var fillsGroup = myDoc.groupItems[fgName];
  // Move to content layer
	fillsGroup.move(contentLayer, ElementPlacement.PLACEATEND);
  //
  processTableRules(fillsGroup);
}
// PROCESS TABLE GROUP ends

// BRING MIXED SCALE LINE SERIES TO FRONT
// If there's a mixed/double chart with column and line series, I have
// to move the lines in front of any zero base-line. And it's a bit
// fiddly...
function bringMixedScaleLineSeriesToFront(contentLayer) {
  var pItems = contentLayer.pathItems;
  // Is there a zero line?
  var zeroLine = lookForElement(contentLayer, 'pathItems', 'axis-zero-line');
  if (typeof zeroLine === 'undefined') {
    return;
  }
  // The problem is that I have to work backwards to restructure in the
  // same order as Sibyl; but if I re-stack on the fly, that messes up
  // the structure, so that series get 'left behind'
  //  get an array of names
  var pNameArray = [];
  for (var pNo = 0; pNo < pItems.length; pNo ++) {
    var thisPath = pItems[pNo];
    if (thisPath.name.search('stroke-path-') >= 0) {
      // The array is 'back to front'
      pNameArray.unshift(thisPath.name);
    }
  }
  // Now move all the series, as named in the array, to the front
  // (i.e., in front of any zero line)
  for (var elNo in pNameArray) {
    var pName = pNameArray[elNo];
    var thisPath = pItems[pName];
    thisPath.move(contentLayer, ElementPlacement.PLACEATBEGINNING);
  }
}
// BRING MIXED SCALE LINE SERIES TO FRONT ends

// PROCESS CONTENT GROUP
// Called from processContentLayer. Args are a single content (panel) group, and the doc obj
function processContentGroup(cGroup, myDoc) {
	// One content group (i.e. panel) may contain:
	//		xaxis-group-n
	//		yaxis-group-n-left
	//		yaxis-group-n-right
	//		series-group(s)
	//		zeroline-group-n
	//
	// Special case: line series (lines and points) may be buried
	// another layer down; move up where we'll find them...
	// ...if they exist
	// NOTE: moved down
	// try {
	// 	var outerLineGroup = cGroup.groupItems['all-line-series-outer-group'];
	// 	if (typeof outerLineGroup !== 'undefined') {
	// 		for (var gNo = (outerLineGroup.groupItems.length - 1); gNo >= 0; gNo--) {
	// 			outerLineGroup.groupItems[gNo].move(cGrpou, ElementPlacement.PLACEATBEGINNING);
	// 		}
	// 		outerLineGroup.remove();
	// 	}
	// }
	// catch(e) {};
	//
	// Number of this group:
	// 		(SVG groups are numbered from zero)
  var cIndex = isolateElementIndex(cGroup.name);
	// Target layer. If there's more than one panel, content layers
	// are numbered from 1; if not, they're un-numbered
  // Move the entire SVG group into the content layer:
	var contentLayer = isolateContentLayer(myDoc, cIndex);
	cGroup.move(contentLayer, ElementPlacement.PLACEATBEGINNING);
	
	// Kludge (here) to fix a structural anomaly with line charts
	fixLineSeriesGroupStructure(cGroup);

	// Deal singly...
	// ...starting with x axis
	var xName = c_myXaxisGroup + cIndex;
	var xAxisGroup = lookForElement(cGroup, 'groupItems', xName);
	if (typeof xAxisGroup !== 'undefined') {
		processAxisGroup(xAxisGroup, 'x', cIndex, '', contentLayer);
		moveChildrenUpstairs(xAxisGroup, contentLayer, false);
		// NOTE: don't forget to delete cGroup (if it doesn't self-destruct)
	}

  // NOTE: axis stacking, Mar'20
  // Scatters, at least,
  // need it the other way round (so that grey x-axis ticks
  // dont overlap y-axis black baseline)
  // But how do we know it's a scatter chart? We have to loop
  // through to a series group and look there:
  var yBefore = false;
  for (var gNo = 0; gNo < cGroup.groupItems.length; gNo++) {
    var myGroup = cGroup.groupItems[gNo];
    if (myGroup.name.search('scatter') >= 0) {
      yBefore = true;
      break;
    }
  }

	// y axis
	// y-axis can be left and/or right...
	var yLeftName = c_myYaxisGroup + cIndex + c_left;
	var yAxisGroup = lookForElement(cGroup, 'groupItems', yLeftName);
	if (typeof yAxisGroup !== 'undefined') {
		processAxisGroup(yAxisGroup, 'y', cIndex, c_left, contentLayer);
		moveChildrenUpstairs(yAxisGroup, contentLayer, yBefore);
  }
  
	var yRightName = c_myYaxisGroup + cIndex + c_right;
	var yAxisGroup = lookForElement(cGroup, 'groupItems', yRightName);
	if (typeof yAxisGroup !== 'undefined') {	
		processAxisGroup(yAxisGroup, 'y', cIndex, c_right, contentLayer);
		moveChildrenUpstairs(yAxisGroup, contentLayer, yBefore);
	}

	// Blobs (if any)
	var bName = c_itsBlobGroup + cIndex;
	try {
		var bGroup = cGroup.groupItems[bName];
		processBlobsGroup(bGroup, cIndex);
		bGroup.move(contentLayer, ElementPlacement.PLACEATBEGINNING)
	}
	catch (e) {};
  // Series...
  var seriesTypeList = '';
	// There may be more than one series group, so I loop through...
	for (var gNo = cGroup.groupItems.length - 1; gNo >= 0; gNo--) {
		var myGroup = cGroup.groupItems[gNo];
		if (myGroup.name.search('series-group') >= 0) {
      var seriesType = myGroup.name.split(':')[1];
      seriesTypeList += seriesType
			switch(seriesType) {
				case 'column':
					processColBarPointSeries(myGroup, contentLayer, false);
					break;
				case 'bar':
					processColBarPointSeries(myGroup, contentLayer, false);
					break;
				case 'pie':
					processPieSeries(myGroup, contentLayer);
					break;
				case 'scatter':
					processScatterSeries(myGroup, contentLayer);
					break;
				case 'thermo':
					// Note: thermo group includes 'spindles'
					processThermoSeries(myGroup, contentLayer);
					break;
        case 'line':
          processLineSeries(myGroup, contentLayer);
          break;
        case 'points':
          // Points on pointline series
          // debugger;
          processColBarPointSeries(myGroup, contentLayer, true);
          break;
      }
			myGroup.move(contentLayer, ElementPlacement.PLACEATBEGINNING);
		}
  }
  // Reloop to bring linepoint groups to front
  // debugger;
  // for (gNo = cGroup.groupItems.length - 1; gNo >= 0; gNo--) {
  for (gNo = 0; gNo < contentLayer.groupItems.length; gNo++) {
		var myGroup = contentLayer.groupItems[gNo];
		if (myGroup.name.search('point-lines') >= 0) {
      // debugger;
			myGroup.move(contentLayer, ElementPlacement.PLACEATBEGINNING);
    }
  }

	// Zero line (if any)
	var zName = c_itsZeroLineGroup + cIndex;
    try {
        var zGroup = cGroup.groupItems[zName];
        // Process and move to content layer
        processZeroLines(zGroup, contentLayer);
    }
	catch(e) {};
    
    // Scatter chart z-axis key group (if any)
    var kName = c_itsZaxisKeyGroup;
    try {
        var keyGroup = cGroup.groupItems[kName];
        // Process and move to content layer
        processScatterZaxisKey(keyGroup, contentLayer);
    }
    catch(e) {};
    // If mixed/double scale with lines and columns, bring lines to front:
    if (seriesTypeList.search('line') >= 0 && seriesTypeList.search('column') >= 0) {
      bringMixedScaleLineSeriesToFront(contentLayer);
    }
		
}
// PROCESS CONTENT GROUP ends

// PROCESS CONTENT GROUPS
function processContentGroups(myDoc) {
	// Content groups are in original 'main' group
	var mainGroup = myDoc.groupItems[c_itsMainGroup];	
  // So let's loop through...
	var contentTotal = mainGroup.groupItems.length;
	//  I can't assume that mainGroup contains *only* panel groups...
	for (var gNo = contentTotal - 1; gNo >= 0; gNo--) {
    var myGroup = mainGroup.groupItems[gNo];
    if (myGroup.name.search('content') >= 0) {
      processContentGroup(myGroup, myDoc);      
    } else if (myGroup.name.search('table') >= 0) {
      processTableGroup(myGroup, myDoc);
    }
	}
	return true;
}
// PROCESS CONTENT GROUPS ends