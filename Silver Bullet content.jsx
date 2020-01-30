// Content group/layer processing

var contentExists = true;

// FIX LINE SERIES GROUP STRUCTURE
// Called from processContentGroup.
// This is at least partly temporary, until I can fix in Sibyl
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
    // $.bp();
		if (thisGroup.name === c_itsAllLineSeriesOuterGroup) {
			// This 'all-series' group contains possible inner groups:
             //     line-series-group:points
             //     line-series-group:line
             var g2Len = thisGroup.groupItems.length - 1;
             for (var g2No = g2Len; g2No >= 0; g2No--) {
                var innerGroup = thisGroup.groupItems[g2No];
                if (innerGroup.name.search(':') > 0) {
                    // Target group of individual :line or :points series groups
                    // If these have contents, move them up a level
                    if (innerGroup.groupItems.length > 0) {
                        innerGroup.move(cGroup, ElementPlacement.PLACEATEND);
                    } else {
                        thisGroup.remove();
                    }
                }
            }
		}
	}
	// try {
	// 	var outerLineGroup = cGroup.groupItems[c_itsAllLineSeriesGroup];
	// 	if (typeof outerLineGroup !== 'undefined') {
	// 		for (var olgNo = (outerLineGroup.groupItems.length - 1); olgNo >= 0; olgNo--) {
	// 			outerLineGroup.groupItems[olgNo].move(cGroup, ElementPlacement.PLACEATBEGINNING);
	// 		}
	// 		outerLineGroup.remove();
	// 	}
	// }
	// catch(e) {};
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

// PROCESS CONTENT GROUP
// Called from processContentLayer. Args are a single content (panel) group, and the doc obj
function processContentGroup(cGroup, myDoc) {
	// One content group (i.e. panel) may contain:
	//		xaxis-group-n
	//		yaxis-group-n-left
	//		yaxis-group-n-right
	//		series-group
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
		processAxisGroup(xAxisGroup, 'x', cIndex, '');
		moveChildrenUpstairs(xAxisGroup, contentLayer, false);
		// NOTE: don't forget to delete cGroup (if it doesn't self-destruct)
	}

	// y axis
	// y-axis can be left and/or right...
	var yLeftName = c_myYaxisGroup + cIndex + c_left;
	var yAxisGroup = lookForElement(cGroup, 'groupItems', yLeftName);
	if (typeof yAxisGroup !== 'undefined') {
		processAxisGroup(yAxisGroup, 'y', cIndex, c_left);
		moveChildrenUpstairs(yAxisGroup, contentLayer, false);
	}

	var yRightName = c_myYaxisGroup + cIndex + c_right;
	var yAxisGroup = lookForElement(cGroup, 'groupItems', yRightName);
	if (typeof yAxisGroup !== 'undefined') {	
		processAxisGroup(yAxisGroup, 'y', cIndex, c_right);
		moveChildrenUpstairs(yAxisGroup, contentLayer, false);
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
	// There may be more than one series group, so I loop through...
	for (var gNo = cGroup.groupItems.length - 1; gNo >= 0; gNo--) {
		var myGroup = cGroup.groupItems[gNo];
		if (myGroup.name.search('series-group') >= 0) {
			var seriesType = myGroup.name.split(':')[1];
			switch(seriesType) {
				case 'line':
					processLineSeries(myGroup, contentLayer);
					break;
				case 'points':
					// Points on pointline series
					processColBarPointSeries(myGroup, contentLayer, true);
					break;
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
			}
			myGroup.move(contentLayer, ElementPlacement.PLACEATBEGINNING);
		}
	}

	// Zero line (if any)
	var zName = c_itsZeroLineGroup + cIndex;
    try {
        var zGroup = cGroup.groupItems[zName];
        // Process and move to content layer
        processZeroLine(zGroup, contentLayer);
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