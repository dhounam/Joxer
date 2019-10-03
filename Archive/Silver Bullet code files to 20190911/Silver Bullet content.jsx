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
		var thisGroup = cGroup.groupItems[gNo];
		if (thisGroup.name === c_itsAllLineSeriesOuterGroup) {
			// This 'all-series' group contains an inner group
			var innerGroup = thisGroup.groupItems[0];
			// Now look for 3rd-level groups of actual lines
			if (innerGroup.groupItems.length > 0) {
				innerGroup.move(cGroup, ElementPlacement.PLACEATBEGINNING);
			} else {
				thisGroup.remove();
			}
		}
	}
	// try {
	// 	var outerLineGroup = cGroup.groupItems[c_itsAllLineSeriesGroup];
	// 	if (typeof outerLineGroup !== 'undefined') {
	// 		$.bp();
	// 		for (var olgNo = (outerLineGroup.groupItems.length - 1); olgNo >= 0; olgNo--) {
	// 			outerLineGroup.groupItems[olgNo].move(cGroup, ElementPlacement.PLACEATBEGINNING);
	// 		}
	// 		outerLineGroup.remove();
	// 	}
	// }
	// catch(e) {};
}
// FIX LINE SERIES GROUP STRUCTURE ends

// PROCESS CONTENT GROUP
// Called from processContentLayer. Args are a single content (panel) group, and its index number
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
  var cIndex = cGroup.name.split('-');
  cIndex = Number(cIndex[cIndex.length - 1]);
	// Target layer. If there's more than one panel, content layers
	// are numbered from 1; if not, they're un-numbered
	var layerName;
	var contentLayer;
	try {
		layerName = c_myContentLayer + (cIndex + 1);
		contentLayer = myDoc.layers[layerName];
	}
	catch(e) {
		// No numbered group, so look for unnumbered (delete hyphen)
		layerName = c_myContentLayer.substring(0, c_myContentLayer.length - 1);
		contentLayer = myDoc.layers[layerName];
	}
	// Move the entire SVG group into the content layer:
	cGroup.move(contentLayer, ElementPlacement.PLACEATBEGINNING);
	
	// Kludge to fix a structural anomaly with line charts
	fixLineSeriesGroupStructure(cGroup);

	// Deal singly...
	// ...starting with x axis
	var xName = c_myXaxisGroup + cIndex;
	var xAxisGroup = lookForElement(cGroup, 'groupItems', xName);
	if (typeof xAxisGroup !== 'undefined') {
		processAxisGroup(xAxisGroup, 'x', cIndex, '');
		moveChildrenUpstairs(xAxisGroup, contentLayer);
		// NOTE: don't forget to delete cGroup (if it doesn't self-destruct)
	}

	// y axis
	// y-axis can be left and/or right...
	var yLeftName = c_myYaxisGroup + cIndex + c_left;
	var yAxisGroup = lookForElement(cGroup, 'groupItems', yLeftName);
	if (typeof yAxisGroup !== 'undefined') {
		processAxisGroup(yAxisGroup, 'y', cIndex, c_left);
		moveChildrenUpstairs(yAxisGroup, contentLayer);
	}

	var yRightName = c_myYaxisGroup + cIndex + c_right;
	var yAxisGroup = lookForElement(cGroup, 'groupItems', yRightName);
	if (typeof yAxisGroup !== 'undefined') {	
		processAxisGroup(yAxisGroup, 'y', cIndex, c_right);
		moveChildrenUpstairs(yAxisGroup, contentLayer);
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
    }
	}
	return true;
}
// PROCESS CONTENT GROUPS ends