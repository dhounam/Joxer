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
      for (var pNo = pTotal - 1; pNo >= 0; pNo--) {
        var counter = pTotal - pNo;
        pLayer = newContentLayer(parent, counter);
        // FIXME: currently numbered and ordered backwards
        // Panels are numbered from 1
        // Now we move the panel header rects and strings
        var pGroup = outerPanelGroup.groupItems[pNo];
        movePanelHeaders(pGroup, pLayer);
      }
    } else {
      // No panels; but create an empty content layer
      pLayer = newContentLayer(parent);
    }
  }
  // Delete the original panels group
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
    // Inferentially, if this is a string group (which background
    // strings always are), convert to text;
    if (pItem.name.search('string') >= 0) {
      // Move it to backLayer
      pItem.move(target, ElementPlacement.PLACEATBEGINNING);
      rationaliseText(pItem, true);
    } else {
      // Shapes
      // Move it to backLayer
      pItem.move(target, ElementPlacement.PLACEATBEGINNING);
      setPathAttributes(pItem);
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

// FUNCTIONS CALLED FROM IMPORTSIBYL

// PROCESS SIBYL
// Called when importSybil has opened the SVG
// Controls processing of document elements. It restructures the SVG groups
// and sends each one to processGroup for unpicking and processing
function processSibyl(myDoc) {
	// Basic restructuring sets up the document with:
	//		background layer, containing
	//			background shapes and strings
	//		one or more content (panel) layes, so far containing panel rects and headers (if any)

	// All these elements have been converted
  if (!restructureDoc(myDoc)) {
    alert("Initial document restructure failed. Sorry...");
    return;
  }
	// LEGENDS
	if (!processLegends(myDoc)) {
		alert("Failed to process legends...");
		return false;
	}

	// Now sort out the SVG content groups (in Content)
	if (!processContentGroups(myDoc)) {
		alert("Failed to process main group of chart-specific content...");
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

// SAVE AS EPS
// Called from importSibyl to save file as EPS to output folder
function saveAsEPS(myFile) {
	var path = c_outbox + myFile.name;
	var newFile = new File(path);
	var saveOpts = new EPSSaveOptions();
	saveOpts.cmykPostScript = true;
	saveOpts.embedAllFonts = true;
	myFile.saveAs( newFile, saveOpts );
}
// SAVE AS EPS ends


function openSVG() {
  var openedSVG;
  var svgPath = new File(c_svgFolder);
	var myFile= svgPath.openDlg("Import SVG file...");
	var myDoc;
	if(myFile != null) {
    // If we selected a file, open it...
		myDoc = app.open(myFile, DocumentColorSpace.CMYK);
		// ...and set colourspace
		app.executeMenuCommand('doc-color-cmyk');
		if (myDoc.documentColorSpace !== DocumentColorSpace.CMYK) {
      var msg = 'Failed to reset file colour space. If this keeps happening,';
      msg += ' please call ' + c_contactNotice;
			alert(msg);
		} else {
      openedSVG = myDoc;
    }
  }
  return openedSVG;
}

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