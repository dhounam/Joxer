// Process zero line

// FIND TOP AXIS GROUP
// Called from processZeroLine
// Loops through the content layer and returns the first axis group
function findTopAxisGroup(contentLayer) {
	var thisItem;
	var iCount = contentLayer.pageItems.length;
	// Assume we count from the top...
	for (var iNo = 0; iNo < iCount; iNo++) {
		var thisItem = contentLayer.pageItems[iNo];
		if (thisItem.name.search('axis') >= 0) {
			topAxisGroup = thisItem;
			break;
		}
	}
	return topAxisGroup;
}
// FIND TOP AXIS GROUP ends

// PROCESS ZERO LINES
// Sets attributes on red zero lines and moves them into stack
// position, in front of bar/column group, but behind line
// or scatter groups
// NOTE: there may be more refinements necessary, for other styles
// and for double scales...
function processZeroLines(zGrp, contentLayer) {
  var zCount = zGrp.pathItems.length;
  for (var zNo = zCount - 1; zNo >= 0; zNo--) {
    zLine = zGrp.pathItems[zNo];
    if (typeof zLine !== 'undefined') {
      setPathAttributes(zLine);
      // Position is either at top or behind first group...
      if (zeroLineBehind) {
        // In most cases, zero line goes behind any series, and in front of all axis groups
        var topAxisGroup = findTopAxisGroup(contentLayer);
				if (typeof topAxisGroup !== 'undefined') {
          zLine.move(topAxisGroup, ElementPlacement.PLACEBEFORE);
				}
      } else {
        // Bars/cols, layercakes, thermos: goes right to front
        zLine.move(contentLayer, ElementPlacement.PLACEATBEGINNING);
      }
    }
  }
	// Whatever, delete the separate group
	zGrp.remove();
}
// PROCESS ZERO LINES ends
