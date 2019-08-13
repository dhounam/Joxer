


// PROCESS ONE DOUBLE-SCALE AXIS HEADER
// Called from processDoubleScaleAxisHeaders. Converts 
function processOneDoubleScaleAxisHeader(hGrp) {
	if (!rationaliseText(hGrp, true)) {
        alert('Double-scale axis header rationalisation failed. Sorry...');
    }
    // Processed text is a textFrame in hGrp
    // Move to parent group and delete hGrp
    var toGrp = hGrp.parent;
    hGrp.textFrames[0].move(toGrp, ElementPlacement.PLACEATEND);
    hGrp.remove();
}
// PROCESS ONE DOUBLE-SCALE AXIS HEADER ends

// PROCESS DOUBLE SCALE AXIS HEADER
// Param is axis group. Header is, putatively, a child groupItem
function processDoubleScaleAxisHeaders(aGrp, index) {
    // Look for headers and, if found, process them
    var headRoot = 'yaxis-header-' + index;
    var leftName = headRoot + '-left';
    var rightName = headRoot + '-right';
    // The trouble is: the headers' IDs have suffixed metadata
    // So loop
    for (var gNo = 0; gNo < aGrp.groupItems.length; gNo++) {
        var thisG = aGrp.groupItems[gNo];
        if (thisG.name.search(headRoot) >= 0) {
            processOneDoubleScaleAxisHeader(thisG);
         }
    }
}
// PROCESS DOUBLE SCALE AXIS HEADER ends


// PROCESS AXIS GROUP
// Args are the axis group; a prefix ('x' or 'y'); the panel index;
// and a left/right string for y-axis (for x-axis, this is an empty string)
// So, in theory, this can handle x or y axes, linear or ordinal...
function processAxisGroup(aGrp, prefix, index, axisSide) {
	// An axis group may contain:
	//		xaxis-ticks-group-n (or yaxis...)
	//		xaxis-labels-group-n;
	//		xaxis-secondary-group-n
	// I need to separate things out into 2 groups: labels and ticks
	// It's all in 'ticks', so I move labels to labels...
	// So I want the three subgroups:
	// tickGrp currently contains all paths and textFrames
	// There may also be a header...?
	if (aGrp.textFrames.length > 0) {
    var t = aGrp.textFrames[0];
    // NOTE: use rationaliseText?
		var headText = setTextFrameAttributes(t);
  }
	var ticksGrp = aGrp.groupItems[prefix + c_myTicksGroup + index + axisSide];
	// labelsGrp is currently empty; all text will move in here
	var labelsGrp = aGrp.groupItems[prefix + c_myLabelsGroup + index + axisSide];
	// Any secondary labels will be moved to labelsGrp, then 2ryGrp removed
	// But is there a 2ryGrp?
	var secondaryGrp;
	try {
		secondaryGrp = aGrp.groupItems[prefix + c_mySecondaryGroup + index + axisSide];
	}
	catch (err) {}
	// So if no 2ryGrp, error was caught and var === undefined. See below...
	// Move all textFrames from ticksGrp subgroups into labelsGrp
	// And all tick paths from subgroups into main ticksGrp
	// Loop by 'tick' groups. There are tick-number such groups, each containing
	// a textFrame (label) and a pageItem (tick)
	var tickCount = ticksGrp.groupItems.length - 1;
	for (var i = tickCount; i >= 0; i--) {
		var thisTick = ticksGrp.groupItems[i];
		// Move labels to separate group
		if (thisTick.textFrames.length > 0) {
			var lab = thisTick.textFrames[0];
			lab.move(labelsGrp, ElementPlacement.PLACEATEND);
		}
         // But as of March'19, wrapped axis strings come as a group of textFrames (tspans)
         else if (thisTick.groupItems.length > 0) {
             var labGrp = thisTick.groupItems[0];
             labGrp.move(labelsGrp, ElementPlacement.PLACEATEND);
         }
		// And ticks out of sub-groups into main group...
		// ...careful: there may be more than one tick in the group
		var pCount = thisTick.pathItems.length;
		if (pCount > 0) {
			for (var j = (pCount - 1); j >= 0; j--) {
				var tickLine = thisTick.pathItems[j];
				// Check tick length; if zero, remove
				if (tickLine.length === 0) {
//					alert("Deleting tick")
					tickLine.remove();
				} else {
					tickLine.move(ticksGrp, ElementPlacement.PLACEATEND);
				}
			}
		}
		// Delete tickgroup:
		thisTick.remove();
	}
	// Secondary group: is there one?
	if (typeof secondaryGrp !== 'undefined') {
		// D3 buried any 2ry axis labels in tick-groups, so...
		for (i = 0; i < secondaryGrp.groupItems.length; i++) {
			var lab = secondaryGrp.groupItems[i].textFrames[0];
			lab.move(labelsGrp, ElementPlacement.PLACEATEND);
		}
		// And delete entire 2ry group (with subgroups):
		secondaryGrp.remove();
	}
	// Filter ticks and labels
	// Ticks (if there are any: zero-length ticks got deleted)
	if (ticksGrp.pathItems.length > 0) {
		if (!resetAllPathAttributes(ticksGrp)) {
			alert('Failed to reset ' + prefix + '-axis tick attributes. Sorry...');
			return false;
		}
	}
  // Labels
	if (!rationaliseText(labelsGrp, false)) {
        alert('Label rationalisation on ' + prefix + '-axis failed. Sorry...');
        return false;
    }
    // FIXME: INSERT CALL TO setTablularLining
    // setTabularLining(labelsGrp);
    // If double-scale, axis headers
    if (prefix === 'y') {
        processDoubleScaleAxisHeaders(aGrp, index);
    }
	// And handle any broken scale symbol or baseline.
	// Overall x- or y-axis group MAY contain a single pathItem:
	// either the broken scale symbol or baseline
	if (aGrp.pathItems.length > 0) {
		var bsElement = aGrp.pathItems[0];
		// (Can't use 'includes')
		if (
			(bsElement.name.search(c_breakSymbol) >= 0) ||
			(bsElement.name.search(c_breakBaseline) >= 0)
			) {
				setPathAttributes(bsElement);
		}
	}
	return true;
}
// PROCESS AXIS GROUP ends
