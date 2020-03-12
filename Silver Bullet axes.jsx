// PROCESS ONE DOUBLE-SCALE AXIS HEADER
// Originally called from processDoubleScaleAxisHeaders. 
// No longer called
// function processOneDoubleScaleAxisHeader(hGroup) {
//     // alert('In processOneDoubleScaleAxisHeader')
// 	if (!rationaliseText(hGroup, true)) {
//         alert('Double-scale axis header rationalisation failed. Sorry...');
//     }
//     // Processed text is a textFrame in hGroup
//     // Move to parent group and delete hGroup (unless it self-destructs)
// 		var toGroup = hGroup.parent;
// 		if (hGroup.textFrames.length > 0) {
// 			hGroup.textFrames[0].move(toGroup, ElementPlacement.PLACEATEND);
// 		}
// 		try {
// 			hGroup.remove();
// 		}
// 		catch(e) {};
// }
// PROCESS ONE DOUBLE-SCALE AXIS HEADER ends

// PROCESS DOUBLE SCALE AXIS HEADER
// Param is axis group. Header is, putatively, a child groupItem
// No longer called
// function processDoubleScaleAxisHeaders(aGroup, index) {
//      alert('Does processDoubleScaleAxisHeaders ever get called?')
//     // Look for headers and, if found, process them
//     var headRoot = 'yaxis-header-' + index;
//     var leftName = headRoot + '-left';
//     var rightName = headRoot + '-right';
//     // The trouble is: the headers' IDs have suffixed metadata
//     // So loop
//     for (var gNo = 0; gNo < aGroup.groupItems.length; gNo++) {
//         var thisG = aGroup.groupItems[gNo];
//         if (thisG.name.search(headRoot) >= 0) {
// 					// $.bp();
//             processOneDoubleScaleAxisHeader(thisG);
//          }
//     }
// }
// PROCESS DOUBLE SCALE AXIS HEADER ends

function processAxisHeader(aGroup) {
  // Loop to find header group:
	var hGroup;
	var hFrame;
	for (var gNo = 0; gNo < aGroup.groupItems.length; gNo++) {
		var thisGroup = aGroup.groupItems[gNo];
		if (thisGroup.name.search('header') >= 0) {
			hGroup = thisGroup;
			break;
		}
	}
	if (
		typeof hGroup === 'undefined' ||
		hGroup.pageItems.length === 0
	) {
		return;
	}
	// Actual textFrame(s) may be buried 1 or 2 levels down
	if (hGroup.textFrames.length === 0) {
		hGroup = hGroup.groupItems[0];
	}
	rationaliseText(hGroup);
	try {
		hFrame = aGroup.textFrames[0];
	}
	catch(e) {};
	return hFrame;
}

// PROCESS AXIS GROUP
// Args are the axis group; a prefix ('x' or 'y'); the panel index;
// and a left/right string for y-axis (for x-axis, this is an empty string)
// So, in theory, this can handle x or y axes, linear or ordinal...
function processAxisGroup(aGroup, prefix, index, axisSide, contentLayer) {
	// An axis group may contain:
	//		xaxis-ticks-group-n (or yaxis...)
	//		xaxis-labels-group-n (empty by default)
	//		xaxis-secondary-group-n
	//		xaxis-header-group-n
	// I need to separate things out into 2 groups: labels and ticks
	// Labels are actually in 'ticks', and move to labels...
	// Secondary and header move there too
	var ticksGroup = aGroup.groupItems[prefix + c_myTicksGroup + index + axisSide];
	// labelsGroup is currently empty; all text will move in here
	var labelsGroup = aGroup.groupItems[prefix + c_myLabelsGroup + index + axisSide];
	// Find the header, if any
	var hFrame = processAxisHeader(aGroup);
	// (Moved into labels group below)
	// Any secondary labels will be moved to labelsGroup, then 2ryGroup removed
	// But is there a 2ryGroup?
	var secondaryGroupName = prefix + c_itsSecondaryGroup + index + axisSide;
	var secondaryGroup = lookForElement(aGroup, 'groupItems', secondaryGroupName);
	// So if no 2ryGroup, var === undefined. Picked up below...
	// Move all textFrames from ticksGroup subgroups into labelsGroup
	// And all tick paths from subgroups into main ticksGroup
	// Loop by 'tick' groups. There are tick-number such groups, each containing
	// a textFrame (label) and a pageItem (tick)
	var tickCount = ticksGroup.groupItems.length - 1;
	for (var i = tickCount; i >= 0; i--) {
		var thisTick = ticksGroup.groupItems[i];
		// Move labels to separate group
		if (thisTick.textFrames.length > 0) {
			var lab = thisTick.textFrames[0];
			lab.move(labelsGroup, ElementPlacement.PLACEATEND);
		}
		else if (thisTick.groupItems.length > 0) {
			// As of March'19, wrapped axis strings come as a group of textFrames (tspans)
			var labGroup = thisTick.groupItems[0];
			labGroup.move(labelsGroup, ElementPlacement.PLACEATEND);
		}
		// And ticks out of sub-groups into main group...
		// ...careful: there may be more than one tick in the group
		var pCount = thisTick.pathItems.length;
		if (pCount > 0) {
			for (var j = (pCount - 1); j >= 0; j--) {
				var tickLine = thisTick.pathItems[j];
				// Check tick length; if zero, remove
				if (tickLine.length === 0) {
					tickLine.remove();
				} else {
					tickLine.move(ticksGroup, ElementPlacement.PLACEATEND);
				}
			}
		}
		// Delete tickgroup:
		thisTick.remove();
	}
	// Secondary group: is there one?
	if (typeof secondaryGroup !== 'undefined') {
		// D3 buried any 2ry axis labels in tick-groups, so...
		for (i = 0; i < secondaryGroup.groupItems.length; i++) {
			var lab = secondaryGroup.groupItems[i].textFrames[0];
			lab.move(labelsGroup, ElementPlacement.PLACEATEND);
		}
		// And delete entire 2ry group (with subgroups):
		secondaryGroup.remove();
	}

	// Broken scale symbol or baseline
	// Overall x- or y-axis group MAY contain a single pathItem:
	// either the broken scale symbol or a baseline
	var bsElement;
	if (aGroup.pathItems.length > 0) {
		var bsElement = aGroup.pathItems[0];
		// (Can't use 'includes')
		if (
			(bsElement.name.search(c_breakSymbol) >= 0) ||
			(bsElement.name.search(c_breakBaseline) >= 0)
			) {
				setPathAttributes(bsElement);
				// Move up 2 levels, into content layer as independent element
				bsElement.move(aGroup.parent.parent, ElementPlacement.PLACEATEND);
		}
	}


	// Filter ticks and labels
	// Ticks (if there are any: zero-length ticks got deleted)
	if (ticksGroup.pathItems.length > 0) {
		if (!resetAllPathAttributes(ticksGroup)) {
			alert('Failed to reset ' + prefix + '-axis tick attributes. Sorry...');
			return false;
		}
	}
	// Labels
  // rationaliseText returns a groupItem: In this case, the new group
  // to which labels have been moved.
  var rationalisedLabelsGroup = rationaliseText(labelsGroup, false);
  // Axis headers now move to content layer (below, later), so comm'd out:
  // var groupForAxisHeaders = rationalisedLabelsGroup.parent.parent.parent;
  // var contentLayerName = c_myContentLayer + index;
  // var contextForAxisHeaders = myDoc.layers[contentLayerName];
	//  {
  //       alert('Label rationalisation on ' + prefix + '-axis failed. Sorry...');
  //       return false;
  //   }

	// If axis labels are numbers, set tabular lining
    // This trap added Nov'19 to kludge round a problem that seems only
    // to occur on a couple of machines, whereby the labels group is undefined
    if (typeof rationalisedLabelsGroup === 'undefined') {
        alert('A problem occurred with the ' + prefix + '-axis labels. Please check these when processing finishes...');
    } else {
        setTabularLining(rationalisedLabelsGroup);
    }
	
	// If double-scale, axis headers
	// if (prefix === 'y') {
	// 	processDoubleScaleAxisHeaders(aGroup, index);
	// }
  // Move header:
  // debugger;
	if (typeof hFrame !== 'undefined') {
		hFrame.name = prefix + c_myAxisHeader + axisSide;
		hFrame.move(contentLayer, ElementPlacement.PLACEATBEGINNING);
	}
	// Originally moved brokenscale or baseline into labels group
    // But now (Oct'19) stays where I put it above, in content layer
	// if (typeof bsElement !== 'undefined') {
	// 	bsElement.move(rationalisedLabelsGroup, ElementPlacement.PLACEATEND);
	// }

	return true;
}
// PROCESS AXIS GROUP ends
