// This version of the main 'Joxer' 
// Silver Bullet code file originated Sept 2017
// Major restructure: August 2019

// MAKE DEFAULT METADATA OBJECT
// Called from getMetadata, returns an object with default values
// (in case anything is missing from an incoming SVG element's metadata)
function makeDefaultMetadataObject(isText) {
	var metaObj = {
		name: 'No name found',
		note: '',
		// NOTE: that failsafe colours are strings here... I think!!
		// fill: 'c_failsafeColour',
		// stroke: 'c_failsafeColour',
	}
	// If text, append additional props
	if (isText) {
		metaObj.justification = 'start';
		metaObj.font = c_failsafeFont;
		metaObj.size = 8;
		metaObj.leading = 9;
		metaObj.contents = '';
	}
	return metaObj;
}
// MAKE DEFAULT METADATA OBJECT ends

// GET METADATA
// Passed an elemen's id, separates out the actual name from
// the SVG metadata, and returns an object containing all properties
function getMetadata(id, isText) {
	// I think I need a default object, with all properties...
	var myObj = makeDefaultMetadataObject(isText);
	if (id.search(c_metaDataSep) > -1) {
		// Separate element name and id
		firstSplit = id.split(c_metaDataSep);
		myObj.name = firstSplit[0];
		// If there's metadata, process it...
		var props = firstSplit[1];
		if (props.length > 0) {
			// Split svg metadata into individual properties
			// Anything can have fill and/or
			// stroke; text can also have justification and original xpos
			var mArray = props.split(c_metaItemSep);
			for (i = 0; i < mArray.length; i++) {
				var oneProp = mArray[i];
				// oneProp is a string: property:value
				// So split (again!) and triage
				var pArray = oneProp.split(c_metaPropSep);
				// This is a property name:value pair
				var prop = myTrim(pArray[0]);
				var val = myTrim(pArray[1]);
				myObj[prop] = val;
			}
		}
	} else {
			// No metadata; return name
			myObj.name = id;
	}
	return myObj;
}
// GET METADATA ends

// MAKE CMYK COLOUR OBJECT
// Utility: looks up a colour name and returns a CMYK colour object
function makeCmykColourObject(cName) {
    var myCol = new CMYKColor();
    var def = c_colourLookup[cName];
		if (typeof def === 'undefined') {
			def = c_failsafeColour;
		}
    myCol.black = def.k;
    myCol.cyan = def.c;
    myCol.magenta = def.m;
    myCol.yellow = def.y;
    return myCol;
}
// MAKE CMYK COLOUR OBJECT ends

// MAKE RGB COLOUR OBJECT
// Utility: looks up a colour name and returns a RGB colour object
function makeRgbColourObject(cName) {
    var myCol = new RGBColor();
    var def = c_layerColourLookup[cName];
		if (typeof def === 'undefined') {
			def = c_failsafeRgbColour;
		}
    myCol.red = def.r;
    myCol.green = def.g;
    myCol.blue = def.b;
    return myCol;
}
// MAKE RGB COLOUR OBJECT ends

// ***** INDIVIDUAL ATTRIBUTE SETTERS *****

// FILL ELEMENT
// Args are the element and the name of the colour
function fillElement(myE, cName) {
  var myCol = makeCmykColourObject(cName);
  var overprint = c_textOverprint.search(cName) >= 0;
  if (myE.typename == 'PathItem') {
    myE.fillColor = myCol;
        myE.overprintFill = overprint;
  } else if (myE.typename == 'TextFrame') {
        myE.textRange.characterAttributes.fillColor = myCol;
        myE.overprintFill = overprint;
  } else {
    alert('Sorry, failed to fill object ' + myE.name + ' with ' + cName);
  }
}
// FILL ELEMENT ends

// STROKE ELEMENT
// Args are the element and the name of the colour
// Also does overprinting
function strokeElement(myE, cName) {
  var myCol = makeCmykColourObject(cName);
  if (myE.typename == 'PathItem') {
    myE.strokeColor = myCol;
        var overprint = c_textOverprint.search(cName) >= 0;
        myE.strokeOverprint = overprint;
  } else {
    alert('Object ' + myE.name + ' is not a pathItem, so cannot apply colour ' + cName);
  }
}
// STROKE ELEMENT ends

// ********** PATH CONVERSIONS

// SET PATH ATTRIBUTES
// Called from recolourGroup to recolour a single path element
function setPathAttributes(myE) {
	// Function returns an object with simple element name and other
	// optional svg-related properties
	// Is there a name?
	var id = myTrim(myE.name);
	if (id.length < 1) {
		return;
	}
	// Still here? Get path metadata props
	var eProps = getMetadata(myE.name, false);
	for (var pName in eProps) {
		if (eProps.hasOwnProperty(pName)) {
			var val = eProps[pName];
			switch (pName) {
				case 'name':
					myE.name = val;
					break;
				case 'note':
					myE.note = val;
					break;
				case 'fill':
					fillElement(myE, val);
					break;
				case 'stroke':
					strokeElement(myE, val);
					break;
			}
		}
	}
}
// SET PATH ATTRIBUTES ends

// RESET ALL PATH ATTRIBUTES
function resetAllPathAttributes(grp) {
	var pathCount = grp.pathItems.length;
	// If I just loop on the paths and reset attributes, Illy scrambles them.
	// So get array of original IDs...
	var pArray = [];
	for (var i = 0; i < pathCount; i++) {
		pArray.push(grp.pathItems[i].name);
	}
	// Then loop on original IDs
	for (var j = 0; j < pArray.length; j++) {
		var onePath = grp.pathItems[pArray[j]];
		setPathAttributes(onePath);
	}
	return true;
}

// RESET ALL PATH ATTRIBUTES ends


// ********** PATH CONVERSIONS end



// DELETE MARKED GROUP
function deleteMarkedGroups(grps) {
  var len = grps.length - 1;
	for (var i = len; i >= 0; i--) {
    var g = grps[i];
		if (g.name === c_deleteme) {
      g.remove();
		}
	}
}
// DELETE MARKED GROUP ends

// REMOVE ORIGINAL GROUP
// Called from rationaliseText. Deletes all elements in a group
// Possible duplicate of deleteMarkedGroups; and probably better!
// So FIXME:
function removeOriginalGrp(grp) {
    var len = grp.pageItems.length - 1;
	for (var i = len; i >= 0; i--) {
		var item = grp.pageItems[i];
		item.remove();
	}
}
// REMOVE ORIGINAL GROUP ends

// MAKE NEW TEXT FRAME
// Called from rationaliseText and processBlobPair
// Collects properties from a text frame, then calls makeText
// to create a new text element. In each case, the caller
// removes the original
function makeNewTextFrame(oFrame, newGroup) {
	var anchorX = oFrame.anchor[0];
    var anchorY = oFrame.anchor[1];
	// Extract the metadata constituent
	var tProps = getMetadata(oFrame.name, true);
	// Now work out xPos from width and justification
	var width = parseFloat(tProps.width);
	var just = tProps.justification;
	if (just === 'middle' || just === 'center') {
		anchorX += width / 2;
	} else if (just === 'end') {
		anchorX += width;
	}
    var contents = oFrame.contents;
    var contentsArray = [{
        contents: contents,
        textFont: oFrame.textRange.characterAttributes.textFont,
        newline: false
    }];
    // Extract properties from original frame
    var textProps = {
        context: oFrame.parent,
        anchor: [anchorX, anchorY],
        fill: makeCmykColourObject(tProps.fill),
        font: oFrame.textRange.characterAttributes.textFont,
        size: oFrame.textRange.characters[0].size,
        tracking: oFrame.textRange.characterAttributes.tracking,
        leading: parseFloat(tProps.leading),
        justification:  just,
        name: tProps.name,
        contents: contents,
        contentsArray: contentsArray
    };
    var newText = makeText(textProps);
    newText.move(newGroup, ElementPlacement.PLACEATBEGINNING);
}
// MAKE NEW TEXT FRAME ends

// ********** TEXT CONVERSION FUNCTIONS END

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

	// Now sort out the SVG content groups
	if (!processContentGroups(myDoc)) {
		alert("Failed to process main group of chart-specific content...");
		return false;
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
  // NOTE: stopping here for now
  return;
  if (processedSuccessfully) {
    // Save if successful
    saveAsEPS(myDoc);
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