// This version of the main 'Joxer' 
// Silver Bullet code file originated Sept 2017
// Major restructure: August 2019

// KILL EMPTY GROUPS IN LAYER
// Called from processSibyl to do final check through
// all layers, deleting empty groups
function killEmptyGroupsInLayer(theLayer) {
	var gCount = theLayer.groupItems.length;
	for (var gNo = gCount - 1; gNo >= 0; gNo--) {
		var thisGroup = theLayer.groupItems[gNo];
		if (thisGroup.pageItems.length === 0) {
			thisGroup.remove();
		}
	}
}
// KILL EMPTY GROUPS IN LAYER ends

function movePanelHeaders(fromGrp, toLayer) {
  var itemCount = fromGrp.pageItems.length;
  for (var itemNo = itemCount - 1; itemNo >= 0; itemNo --) {
    var pItem = fromGrp.pageItems[itemNo]
    pItem.move(toLayer, ElementPlacement.PLACEATBEGINNING);
    if (pItem.typename === 'PathItem') {
      setPathAttributes(pItem);
    } else {
      rationaliseText(pItem, true);
    }
  }
}


function newContentLayer(parent, counter) {
  var layerName = c_myContentLayer;
  // Remove final hyphen, or append number
  if (typeof counter === 'undefined') {
    layerName = layerName.substring(0, layerName.length - 1);
  } else {
    layerName += counter;
  }
  var pLayer = parent.layers.add();
  pLayer.name = layerName;
  layerColour = makeRgbColourObject(layerName);
  pLayer.color = layerColour;
  return pLayer;
}

// CREATE PANEL LAYERS
// Called from moveBackgroundElements. Creates a layer for
// each panel, initially populated with header and panel-flash
// Args are the original SVG background group, and my new background layer
function createPanelLayers(backGroup, backLayer) {
  var parent = backLayer.parent;
  // Find outer panels group in the SVG background group
  var outerPanelGroup;
  try {
    outerPanelGroup = backGroup.groupItems[c_itsPanelsGroup];
  }
  catch (e) {
    return false;
  }
  // Still here?
  var pLayer;
  if (typeof outerPanelGroup !== 'undefined') {
    var pTotal = outerPanelGroup.groupItems.length;
    if (pTotal > 0) {
      // Add a content layer for each panel
      var counter = 1;
      for (var pNo = pTotal - 1; pNo >= 0; pNo--) {
        pLayer = newContentLayer(parent, counter);
        // FIXME: currently numbered and ordered backwards
        // Panels are numbered from 1
        // Now we move the panel header rects and strings
        var pGroup = outerPanelGroup.groupItems[pNo];
        movePanelHeaders(pGroup, pLayer);
        counter++;
      }
    } else {
      // No panels; but create an empty content layer
      pLayer = newContentLayer(parent);
    }
  }
  // Delete the original panels group
  // debugger;
  outerPanelGroup.remove();
  return true;
}
// CREATE PANEL LAYERS ends

// MOVE ELEMENTS TO BACK LAYER
// Called from moveBackgroundElements. Arg is a group of either
// shapes or strings. In each case, the contents are transferred to
// the new backLayer.
function moveElementsToBackLayer(fromGrp) {
  var target = fromGrp.parent;
  var piCount = fromGrp.pageItems.length;
  for (var piNo = piCount - 1; piNo >= 0; piNo--) {
    var pItem = fromGrp.pageItems[piNo];
    // NOTE: strings end up stacked backwards -- re-order
    if (pItem.name.search('string') >= 0) {
      // Background strings move to background layer
      pItem.move(target, ElementPlacement.PLACEATBEGINNING);
      rationaliseText(pItem, true);
    } else if (pItem.typename === "PathItem") {
      // Background shapes to background layer
      // But numberbox rect stays in its group
      if (pItem.name.search('shape') >= 0) {
        pItem.move(target, ElementPlacement.PLACEATBEGINNING);
      }
      setPathAttributes(pItem);
    } else if (pItem.name.search('chartnumber-text') >= 0) {
      // Numberbox text stays in its group and is
      // assumed to be un-wrapped text
      var newFrame = makeNewTextFrame(pItem, fromGrp);
      // Numberboxes may have tabular lining
      if (c_convertNumBoxesToTabularLining) {
        newFrame.textRange.characterAttributes.figureStyle = FigureStyleType.TABULAR;
      }
      pItem.remove();
    }
  }
}
// MOVE ELEMENTS TO BACK LAYER ends

// PROCESS BACKGROUND ELEMENTS
// Called from restructureDoc. Moves all background elements
// from the SVG's background group to the target background layer
function processBackgroundElements(mainGroup, backLayer) {
  // Args are the top-level main group (child of the SVG's forced 'Layer 1');
  // and the target background layer
  var bgMoved = true;
  try {
    // Get the SVG's background group, which is a child of the main group
    var backGroup =  mainGroup.groupItems[c_itsBackGroup];
    // Elements should be 'shapes', 'strings' and 'panels'
    // I need to create one sibling layer of backLayer per panel
    createPanelLayers(backGroup, backLayer);
    // Move strings and shapes. I'm targeting 2 groups in the SVG backGroup: one
    // of shapes, the other of strings. I move each of these groupItems from the
    // SVG backGroup to the new backLayer. Then call a fcn to move each
    // groupItem's contents (shapes and strings) into the backLayer. And
    // finally deletes the entire original SVG backGroup
	for (var i = backGroup.groupItems.length - 1; i >= 0; i--) {
      var g = backGroup.groupItems[i];
      g.move(backLayer,ElementPlacement.PLACEATBEGINNING);
      // Make individual strings and shapes direct children
      // of backLayer...
      moveElementsToBackLayer(g);
		}
		// ...and delete the background group:
		backGroup.remove();
	} catch (e) {
    alert('Moving background elements to new layer failed with error ' + e);
		bgMoved = false;
  }
  return bgMoved;
}
// PROCESS BACKGROUND ELEMENTS ends



// FUNCTIONS CALLED IMMEDIATELY FROM PROCESS_SIBYL

// RESTRUCTURE DOC
// Called from processSibyl. SVG opens in a default 'Layer 1'
// containing a single 'main-group'. This in turn contains
// several groups:
//    background
//    1 or more content groups
//    legends
function restructureDoc(myDoc) {
  // Identify the default 'Layer 1' and its single 'main-group'
	try {
		// Grab the default SVG layer
		var layer1 = myDoc.layers[c_itsLayer1];
		// That has a 'base' group...
		var mainGroup = layer1.groupItems[c_itsMainGroup];
	}
	catch (e) {
    // Structure no good: bale out
		return false;
	}
  // Create background layer
  var backLayer = myDoc.layers.add();
  backLayer.name = c_myBackLayer;
  var layerColour = makeRgbColourObject(c_myBackLayer);
  backLayer.color = layerColour;
  // Move groups into the new background layer
  var backGroundElementsProcessed = processBackgroundElements(mainGroup, backLayer);
	// So the document contains
	// 		my backLayer, now containing background strings,
	//				shapes, and legends (fully processed)
	//		one or more content layers. These may be numbered
	//				if there are more than one panel, or
	//				unnumbered if none (i.e. single chart)

	return true;
}
// RESTRUCTURE DOC ends

// APPEND TEXT WIDTH
// Called from digForText. Arg is a pageItem,
// even though it's text of some sort. Measure
// width and append to item name
function appendWidthToTextFrame(item) {
  var w = item.width;
  var itemName = item.name;
  itemName += ', width:' + w;
  item.name = itemName;
}
// APPEND TEXT WIDTH ends

function appendWidthToTextGroup(grp) {
  var grpItems = grp.pageItems;
  var gLen = grpItems.length;
  var gName = grp.name;
  var grpWidth = 0;
  // Loop through whatever's in the group (should,
  // in fact, all be textFrames). Get width of each
  // textFrame and retain max
  for (var itemNo = 0; itemNo < gLen; itemNo++) {
    var pItem = grp.pageItems[itemNo];
    if (pItem.typename.search('Text') >= 0) {
      var w = pItem.width;
      grpWidth = Math.max(grpWidth, w)
    }
  }
  gName += ', width:' + grpWidth;
  grp.name = gName;
}

// DIG FOR TEXT
// Called from measureTextItems
// Arg is a group containing all groups
// Digs recursively through the entire contents of
// the main group, picking out text items
function digForText(grp) {
  var grpItems = grp.pageItems;
  var gLen = grpItems.length;
  for (var gNo = 0; gNo < gLen; gNo++) {
    var oneItem = grpItems[gNo];
    var itemTypeName = oneItem.typename;
    if (itemTypeName === 'GroupItem') {
      // If we hit a groupItem with a name that includes
      // the separator '~~~', that indicates a group of
      // tSpans.
      var gName = oneItem.name;
      if (gName.search(c_metaDataSep) > 0) {
        appendWidthToTextGroup(oneItem);
        // I need to call a function that will loop
        // through all child pageItems, measure widths
        // of those that are textFrames,
        // and attach the max to the groupItem's name
      } else {
        digForText(oneItem);
      }
    } else if (itemTypeName.search('Text') >= 0) {
      // Append width to item name
      // This will apply to axis labels
      appendWidthToTextFrame(oneItem);
      }
      // Paths are ignored
    }
  }
  // DIG FOR TEXT ends

// MEASURE TEXT ITEMS
// Called from processSibyl, to iterate through all text
// elements in the file, as pageItems, and get their width.
function measureTextItems(myDoc) {
  var result = true;
  try {
    // Grab the default SVG layer
    var layer1 = myDoc.layers[c_itsLayer1];
    // That has a 'base' group...
    var mainGrp = layer1.groupItems[c_itsMainGroup];
    digForText(mainGrp);
  }
  catch (e) {
    result = false;
  }
  // To stop things going any further during devel:
  return result;
}
// MEASURE TEXT ITEMS ends

// FUNCTIONS CALLED FROM IMPORTSIBYL

// PROCESS SIBYL
// Called when importSybil has opened the SVG
// Controls processing of document elements. It restructures the SVG groups
// and sends each one to processGroup for unpicking and processing
function processSibyl(myDoc) {
  // First: append a width to all text elements
  if (!measureTextItems(myDoc)) {
    alert("Text-width measurement failed. Sorry...");
    return;
  }

  // Basic restructuring sets up the document with:
	//		background layer, containing
	//			background shapes and strings
	//		one or more content (panel) layes, so far containing panel rects and headers (if any)

	// All these elements have been converted
  if (!restructureDoc(myDoc)) {
    alert("Initial document restructure failed. Sorry...");
    return;
  }
  
	// Now sort out the SVG content groups (in Content)
	if (!processContentGroups(myDoc)) {
    alert("Failed to process main group of chart-specific content...");
		return false;
	}
  
  // LEGENDS
  if (!processLegends(myDoc)) {
    alert("Failed to process legends...");
    return false;
  }

	// Finally, kill the original default SVG layer
	// No: done in loop below
	// try {
	// 	myDoc.layers[c_itsLayer1].remove();
	// }
	// catch (e) {}

	// Layer tidying
	var lCount = myDoc.layers.length;
	for (var lNo = lCount - 1; lNo >= 0; lNo--) {
		var theLayer = myDoc.layers[lNo];
		if (theLayer.name === c_itsLayer1) {
			// Kill original SVG default layer
			theLayer.remove();
		} else {	
			// Kill any empty groups in surviving layers. Actually,
			// this is a bit weird. It looks to me as though Illy
			// auto-removes empty groups... but not necessarily
			// in time before I finish processing and save the
			// file out. So kill anything we can still find...
			killEmptyGroupsInLayer(theLayer);
		}
	}


	return true;
}
// PROCESS SIBYL ends

// FIX FILE NAME
// Called from saveAsEPS to remove any number from file name
function fixFileName(fileName) {
  // I don't need to explicitly remove extension;
  // Illy seems to cope with that
  // var fName = fileName.replace('.svg', '');
  // Lose number, if any -- e.g.: ' (2)'
  var fName = fileName.replace(/\s?\(\d\)/,'');
  return fName;
}
// FIX FILE NAME

// SAVE AS EPS
// Called from importSibyl to save file as EPS to output folder
function saveAsEPS(myFile) {
	var path = c_outbox + fixFileName(myFile.name);
	var newFile = new File(path);
	var saveOpts = new EPSSaveOptions();
	saveOpts.cmykPostScript = true;
	saveOpts.embedAllFonts = true;
	myFile.saveAs( newFile, saveOpts );
}
// SAVE AS EPS ends

// FILE IS INVALID
// Called from openSVG to check that the file has
// .svg extension, and that it isn't already open
function fileIsInvalid(myFile) {
  // myFile is file name. Lose ext.
  var fArray = myFile.split(".");
  if (fArray.length < 2 || fArray[1] !== 'svg') {
    alert("This doesn't look like an SVG file...")
    return true;
  }
  var fName = fArray[0].replace("%20", " ");
  var docs = app.documents;
  for (var dNo = 0; dNo < docs.length; dNo++) {
    var dName = docs[dNo].name.split(".")[0];
    if (dName === fName) {
      alert("You already have a file of this name open. Please close it and try again...")
      return true;
    }
  }
  return false;
}
// FILE IS INVALID ends

// SET COLOUR SPACE
// Called from openSVG. Checks name (id) of first group in first layer
// Sets colour space and global flag to rgb/cmyk
function setColourSpace(openDoc) {
  var mainGrp = openDoc.layers[0].groupItems[0];
  var gName = mainGrp.name;
  // By default, Illustrator opens SVGs as RGB
  // But set to CMYK if the name of the main group
  // suggests it, or if it's a legacy SVG
  if (
    gName === 'main-group' ||
    gName === 'main-group-cmyk') {
    app.executeMenuCommand('doc-color-cmyk');
    g_colourSpaceRgb = false;
  }
  // RGB or CMYK, main group has consistent name
  mainGrp.name = 'main-group';
}
// SET COLOUR SPACE ends

// OPEN SVG
function openSVG() {
  var openedSVG;
  var svgPath = new File(c_svgFolder);
  var myFile= svgPath.openDlg("Import SVG file...");
  var canOpenFile = true;
	if (myFile == null) {
    canOpenFile = false;
  } else if (fileIsInvalid(myFile.name)) {
    canOpenFile = false;
  }
	var myDoc;
	if(canOpenFile) {
    // If we selected a file, open it...
    // Default is RGB colour space
    while (typeof myDoc !== 'object') {
      myDoc = app.open(myFile, DocumentColorSpace.RGB);
    }
    g_colourSpaceRgb = true;
		// ...but may (usually) reset colourspace to CMYK
    setColourSpace(myDoc);
		// if (myDoc.documentColorSpace !== DocumentColorSpace.CMYK) {
    //   var msg = 'Failed to reset file colour space. If this keeps happening,';
    //   msg += ' please call ' + c_contactNotice;
		// 	alert(msg);
		// } else {
    openedSVG = myDoc;
    // }
  }
  return openedSVG;
}
// OPEN SVG ends

// CHECK OPEN DOCUMENT
// Called from importSibyl
// Returns true if there's at least 1 document already open
// (see var msg just below)
function checkOpenDocument() {
	var od = true;
	if (app.documents.length > 0) {
		var docA = app.activeDocument;
	} else {
		var msg = "Annoyingly, Illustrator won't set the colour space of an SVG ";
		msg += "to CMYK unless there's already a file open! I'm going to open a new document, ";
		msg += "but you'll have to invoke the script again...";
		alert(msg);
		jdocA = app.documents.add();
		od = false;
	}
	return od;
}
// CHECK OPEN DOCUMENT ends


// CHECK OUTBOX
// Called from importSibyl to verify that outbox exists; if not, create...
function checkOutbox() {
	if (Folder(c_outbox).exists) {
		return true;
	}
	else {
		// Folder doesn't exist: try to create it
		try {
			var tF = new Folder(c_outbox);
			tF.create();
			alert("New folder " + c_outbox +
				"\nI have created this folder as an out-tray for Silver Bullet .EPS files...")
			return true;
		}
		catch (err) {
			// Error returns false
			alert("EPS output folder " + c_outbox + "doesn't exist and I failed " +
				" to create it. Please create the folder manually and try again", "Folder error")
			return false;
		}
	}
}
// CHECK OUTBOX ends

// IMPORT SIBYL is called at kick-off. It opens a file via a system dialog.
// Sets colour space then calls main processor function
function importSibyl() {
  // Check that there's an outbox
	if (!checkOutbox()) {
		return;
	}
  // Check that the necessary DUMMY file is open
	if (!checkOpenDocument()) {
		return;
  }
	// Still here? There's an open (dummy) file, which means we can get at the colourspace...
  // Prompt to open an SVG file...
  var processedSuccessfully = false;
  var svgDoc = openSVG();
  // Hopefully returned a file object
  if (typeof svgDoc !== 'undefined') {
    // Now call main processing controller:
    processedSuccessfully = processSibyl(svgDoc);
  }

	if (processedSuccessfully) {
    // Save if successful
    saveAsEPS(svgDoc);
  } else {
    // Failed: 
    msg = 'Processing failed. If this re-occurs, call ' + c_contactNotice;
    alert(msg);
    // Eventually failure should simply close the active doc
    // if (typeof myDoc !== 'undefined') {
      // myDoc.close( SaveOptions.DONOTSAVECHANGES );
    // }
  }
  return
}
// IMPORT SIBYL ends