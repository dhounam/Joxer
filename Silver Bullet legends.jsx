
// PROCESS ONE LEGEND
// Called from processLegends. Arg is a single legend 'pair' of pathItem (rect or line)
// and text (textFrame or group-of-tspans)
function processOneLegend(legGroup, counter) {
	// Let's get the pathitem out of the way first
	var legPath = legGroup.pathItems[0];
	setPathAttributes(legPath);
	// Now text could be either a group of tspans, or a single textFrame.
	// Start with group...
	var grpCount = legGroup.groupItems.length;
	var legText;
	if (grpCount > 0) {
		legText = legGroup.groupItems[0];
		rationaliseText(legText, true);
	} else {
		legText = legGroup.textFrames[0];
		// NOTE: why doesn't this go through rationaliseText?
		setTextFrameAttributes(legText);
	}
    // Name everything
    legGroup.name = c_myLegendPair + counter;
    legGroup.textFrames[0].name = c_myLegendText;
    legPath.name = c_myLegendKey;
	return true;
}
// PROCESS ONE LEGEND ends

// FORCE LEGEND HEAD OVERPRINTING
// Called from processLegendSet.
// The problem is that although the legend head, like all black text, has overprinting ON,
// it actually knocks out, for some reason that I can't work out. For me, at least, setting
// transparency to Multiply seems to work -- although what worked for Adam was setting
// Transparency.Isolate Blending off...
// Even weirder: this seems to work... but when I open the document, Transparency is 'Normal'!
function forceTextOverprinting(lHead) {
    // Comm'd out Mar'21. I suspect that this was necessary for an earlier version of Illy
    // but it no longer seems necessary. If this holds, I can remove altogether...
    // lHead.blendingMode = BlendModes.MULTIPLY;
}
// FORCE LEGEND HEAD OVERPRINTING ends

// PROCESS LEGEND SET
// Called from processLegends to unpick one legend-set
function processLegendSet(legSet) {
  // Each legendSet should consist of:
	//	- a header group
	//	- a legendkey group, containing 2 or more indexed legend groups--
	// 		each containing a path and a text-group...
	var legCount = legSet.groupItems.length	
	// Is this necessary?
  // if (legCount < 2) { return false; }
  //
	for (var legNo = 0; legNo < legCount; legNo++) {
		var oneGroup = legSet.groupItems[legNo];
		if (oneGroup.name.search('key') >= 0) {
			// This is the 'key' group, containing 2 or more
			// legend-pair groups. I process those
      // For naming
      var counter = 1;
			for (var i = oneGroup.groupItems.length - 1; i >= 0; i--) {
        var lPairGroup = oneGroup.groupItems[i];
        // Sibyl has been known to generate empty legendset groups
        // So check...
        if (lPairGroup.pageItems.length > 0) {
          processOneLegend(lPairGroup, counter);
          counter++;
        } else {
          lPairGroup.remove();
        }
			}
		} else if (oneGroup.name.search('header')) {
			// Header group
			if (oneGroup.textFrames.length > 0) {
				var theHeader = oneGroup.textFrames[0];
				setTextFrameAttributes(theHeader);
        // Special whacky tweak for legend header to force overprinting
        forceTextOverprinting(theHeader);
			} else {
        oneGroup.remove();
      }
		}
	}	
}
// PROCESS LEGEND SET ends

function restructureLegendSet(legSet) {
	var legCount = legSet.groupItems.length;
	// The legend set should consist of 2 groups:
	// keys and header. Loop to isolate the keys
  var keysGroup;
  var headerGroup;
	for (var legNo = 0; legNo < legCount; legNo++) {
		var oneGroup = legSet.groupItems[legNo];
		if (oneGroup.name.search('key') >= 0) {
			// This is the 'keys' group
			keysGroup = oneGroup;
		} else if (oneGroup.name.search('header') >= 0) {
			// 'Header' group
			headerGroup = oneGroup;
		}
	}
	if (typeof keysGroup !== "undefined") {
    for (var i = keysGroup.groupItems.length - 1; i >= 0; i--) {
      var lPairGroup = keysGroup.groupItems[i];
			lPairGroup.move(legSet, ElementPlacement.PLACEATEND);
		}
  }
  if (typeof headerGroup !== "undefined") {
    var hText = headerGroup.textFrames[0];
      hText.move(legSet, ElementPlacement.PLACEATBEGINNING);
  }
}

// PROCESS LEGENDS
// Called from processSibyl. Arg is the main legends group, 'silver-chart-legends-group', which is a child
// of the background layer and will contain one or more legendset-groups ('legendset-group-n').
// Each of those legendset-groups will, in turn, consist of:
//    a legendheader-group, containing just a single text item (but possibly empty)
//    a legendkey-group, containing a series of 'pair' groups, each consisting of
//        a path and a group of tspans
function processLegends(myDoc) {
	// First, look for a legends group
	try {
		var itsLegendsGroup = myDoc.groupItems[c_itsLegendsGroup];
	}
	catch (e) {
		// No legend sets found. Fair enough.
		return true;
	}
	// Still here? the main legends group consists of one or more, panel-specific, legendset groups
	var setCount = itsLegendsGroup.groupItems.length;
	if (setCount === 0) {
    return true;
	}
	// Still here? There's at least 1 legend-set
  // Process backwards, preserving original numbering
  var counter = 1
	for (var setNo = setCount - 1; setNo >= 0; setNo--) {
    // So this is a legendset-group, relating to a single panel
    var mySet = itsLegendsGroup.groupItems[setNo];
    // Get original number
    var mySetName = mySet.name;
    var myArray = mySetName.split('-');
    var mySetNo = Number(myArray[myArray.length - 1]) + 1;
    processLegendSet(mySet);
    mySet.name = c_myLegendSet + mySetNo;
    counter++;
	}
	// Now restructure
	// NOTE: ideally I'd have done this from processLegendSet,
	// but Illustrator bombs
	var backLayer = myDoc.layers[c_myBackLayer];
	// Legend pairs move up a level, and legend sets move to 
	// my background layer
	// Loop by legendSets
	for (var setNo = setCount - 1; setNo >= 0; setNo--) {
    var mySet = itsLegendsGroup.groupItems[setNo];
		restructureLegendSet(mySet);
	}
	// Now that everything's clean, move into the matching content layer
  // Count layers. If < 4, my layers are the default 'Layer 1', a background
  // layer and an unnumbered content layer
  var oneChart = (myDoc.layers.length < 4);
  if (oneChart) {
      var lName = c_myContentLayer.substr(0, c_myContentLayer.length - 1);
      var cLayer = myDoc.layers[lName];
      var setGroup = itsLegendsGroup.groupItems[0];
      finalLegendSetMove(setGroup, cLayer);
  } else {
    // Content layers are numbered
    var setCount = itsLegendsGroup.groupItems.length;
    for (var setNo = setCount - 1; setNo >= 0; setNo--) {
      var setGroup = itsLegendsGroup.groupItems[setNo];
      // Match number of legendset to content layer
      var lSetName = setGroup.name;
      var lsnArray = lSetName.split('-');
      var lSetNo = lsnArray[lsnArray.length - 1];
      var cLayer = myDoc.layers[c_myContentLayer + lSetNo];
      finalLegendSetMove(setGroup, cLayer);
    }
	}
	// Kill the import group
	itsLegendsGroup.remove();
	return true;
}
// PROCESS LEGENDS ends

// FINAL LEGEND SET MOVE
// Kludge introd'd Mar'20 to move legendset header
// and pairs up to content layer
function finalLegendSetMove(setGroup, cLayer) {
  var pairCount = setGroup.groupItems.length;
  for (var pairNo = pairCount - 1; pairNo >= 0; pairNo--) {
    var myPair = setGroup.groupItems[pairNo];
    myPair.move(cLayer,ElementPlacement.PLACEATBEGINNING);
  }
  // And header, if any
  if (setGroup.textFrames.length > 0) {
    var header = setGroup.textFrames[0];
    if (typeof header !== 'undefined') {
      header.move(cLayer,ElementPlacement.PLACEATBEGINNING);
    }
  }
}
// FINAL LEGEND SET MOVE ends

// ========== SCATTER Z-AXIS KEY ============

// PROCESS SCATTER Z-AXIS KEY
// Called from Content
function processScatterZaxisKey(keyGroup, contentLayer) {
    keyGroup.move(contentLayer, ElementPlacement.PLACEATEND);
    if (keyGroup.pathItems.length > 0) {
      var keyDot = keyGroup.pathItems[0];
      setPathAttributes(keyDot);
    }
    // Text may be TextFrame or a group of tspans!
    if (keyGroup.textFrames.length > 0) {
      var keyText = keyGroup.textFrames[0];
      setTextFrameAttributes(keyText);
      forceTextOverprinting(keyText)
    } else if (keyGroup.groupItems.length > 0) {
      var keyTextGrp = keyGroup.groupItems[0];
		  rationaliseText(keyTextGrp);
      kludgeTidyingUpZaxisKey(keyGroup);
    }
  }
  // PROCESS SCATTER Z-AXIS KEY ends
  
  // KLUDGE TIDYING UP Z-AXIS KEY
  // FIXME: Mar'21. Illustrator is throwing MRAPs all over the shop
  // during debugging, so I'm kludging my way out of this.
  // I'm left with three items in the original keyGroup:
  //    - the 'dot' pathItem
  //    - the original text groupItem, which seems to evaporate of its own accord
  //    - a textRange which needs overprinting forced on it
  //    (I'm being over-cautious about the possible survival of an original tSpan)
  // If debugging ever settles down, this would repay a revisit...
  function kludgeTidyingUpZaxisKey(keyGroup) {
    var tfLen = keyGroup.textFrames.length
    if (tfLen > 0) {
      for (var tfNo = tfLen - 1; tfNo >= 0; tfNo--) {
        var myTf = keyGroup.textFrames[tfNo];
        if (myTf.name.search(c_metaDataSep) >= 0) {
          myTf.remove();
        } else {
          myTf.textRange.characterAttributes.overprintFill = true;
          // forceTextOverprinting(myTf);
        }
      }
    }
  }
  // KLUDGE TIDYING UP Z-AXIS KEY ends
  
  