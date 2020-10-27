// Process zero line

// FIND TOP AXIS OR SPINDLE GROUP
// Called from processZeroLine
// Loops through the content layer and returns the first axis group
// Mod July'20 will look for spindle group, too
function findTopAxisOrSpindleGroup(contentLayer) {
	var thisItem;
	var iCount = contentLayer.pageItems.length;
  // Assume we count from the top...
  // ...so we'll hit any spindle group first
	for (var iNo = 0; iNo < iCount; iNo++) {
		var thisItem = contentLayer.pageItems[iNo];
		if (
      thisItem.name.search('spindle') >= 0 ||
      thisItem.name.search('axis') >= 0) {
			topAxisGroup = thisItem;
			break;
		}
	}
	return topAxisGroup;
}
// FIND TOP AXIS OR SPINDLE GROUP ends

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
        var topAxisOrSpindleGroup = findTopAxisOrSpindleGroup(contentLayer);
				if (typeof topAxisOrSpindleGroup !== 'undefined') {
          // Mega-kludge: move a RED zero line behind thermo spindles...
          // ...IF there's more than one series!!!
          // but a BLACK line in front of either spindles or axis ticks
          var isSpindle = topAxisOrSpindleGroup.name.search('spindle') >= 0;
          // Thermometers: count series (could be farmed out)
          var seriesCount = 0;
          if (isSpindle) {
            for (var i = 0; i < contentLayer.groupItems.length; i++) {
              if (contentLayer.groupItems[i].name.search('series-group series-') >= 0) {
                seriesCount++;
              }
            }
          }
          var noBlack = zLine.strokeColor.black === 0;
          if (isSpindle && noBlack && seriesCount > 1) {
            // PLACEAFTER = 'behind'
            zLine.move(topAxisOrSpindleGroup, ElementPlacement.PLACEAFTER);
          } else {
            // PLACEBEFORE = 'in front of'
            zLine.move(topAxisOrSpindleGroup, ElementPlacement.PLACEBEFORE);
          }
				}
      } else {
        // Bars/cols, layercakes: goes right to front
        zLine.move(contentLayer, ElementPlacement.PLACEATBEGINNING);
      }
    }
  }
	// Whatever, delete the separate group
	zGrp.remove();
}
// PROCESS ZERO LINES ends
