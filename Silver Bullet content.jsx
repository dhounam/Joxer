// Content group/layer processing

var contentExists = true;

// PROCESS CONTENT GROUP
// Called from processContentLayer. Args are a single content (panel) group, and its index number
function processContentGroup(cGrp, myDoc) {
	// One content group (i.e. panel) may contain:
	//		xaxis-group-n
	//		yaxis-group-n-left
	//		yaxis-group-n-right
	//		series-group
	//		zeroline-group-n
	//
	// Special case: line series (lines and points) are buried
	// another layer down; move up where we'll find them...
	// ...if they exist
	// NOTE: did some code get deleted here?
	//
	// Number of this group:
	// 		(SVG groups are numbered from zero)
  var cIndex = cGrp.name.split('-');
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
	cGrp.move(contentLayer, ElementPlacement.PLACEATBEGINNING);
	// Line grouping has an additional interposed group,
	// so move line series sub-group up a level:
	try {
		var outerLineGrp = cGrp.groupItems[c_itsAllLineSeriesGroup];
		if (typeof outerLineGrp !== 'undefined') {
			for (var olgNo = (outerLineGrp.groupItems.length - 1); olgNo >= 0; olgNo--) {
				outerLineGrp.groupItems[olgNo].move(cGrp, ElementPlacement.PLACEATBEGINNING);
			}
			outerLineGrp.remove();
		}
	}
	catch(e) {};

	// Deal singly...
	// ...starting with x axis
	// $.bp();
	var xName = c_myXaxisGroup + cIndex;
	var xAxisGrp = cGrp.groupItems[xName];
	processAxisGroup(xAxisGrp, 'x', cIndex, '');
	xAxisGrp.move(contentLayer, ElementPlacement.PLACEATBEGINNING);

	// NOTE: don't forget to delete cGrp (if it doesn't self-destruct)
	return;
	// y axis
	// y-axis can be left and/or right...
	try {
		var yLeftName = c_myYaxisGroup + cIndex + c_left;
		var yAxisGrp = cGrp.groupItems[yLeftName];
		processAxisGroup(yAxisGrp, 'y', cIndex, c_left);
	}
	catch(e) {};
	try {
		var yRightName = c_myYaxisGroup + cIndex + c_right;
		var yAxisGrp = cGrp.groupItems[yRightName];
		processAxisGroup(yAxisGrp, 'y', cIndex, c_right);
	}
	catch(e) {};
	// Blobs (if any??)
	var bName = c_blobsMainGroup + cIndex;
	try {
		var bGrp = cGrp.groupItems[bName];
		processBlobsGroup(bGrp, cIndex);
	}
	catch (e) {};

	// Series...
	// There may be more than one series group, so I loop through...
	for (var gNo = 0; gNo < cGrp.groupItems.length; gNo++) {
		var myGrp = cGrp.groupItems[gNo];
		if (myGrp.name.search('series-group') >= 0) {
			var seriesType = myGrp.name.split(':')[1];
			switch(seriesType) {
				case 'line':
					processLineSeries(myGrp);
					break;
				case 'column':
					processColBarSeries(myGrp);
					break;
				case 'bar':
					processColBarSeries(myGrp);
					break;
				case 'points':
					processColBarSeries(myGrp);
					break;
				case 'thermo':
					// Note: thermo group includes 'spindles'
					processThermoSeries(myGrp);
					break;
			}
		}
	}

	// Zero line (if any)
	var zName = c_zeroLineGroup + cIndex;
	var zGrp = cGrp.groupItems[zName];
	processZeroLine(zGrp, cGrp);
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
    var myGrp = mainGroup.groupItems[gNo];
    if (myGrp.name.search('content') >= 0) {
      processContentGroup(myGrp, myDoc);      
    }
	}
	return true;
}
// PROCESS CONTENT GROUPS ends