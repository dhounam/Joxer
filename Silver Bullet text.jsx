// Contains text-specific functions

// MY TRIM
// Since we've no built-in trim...
function myTrim(str) {
	return str.replace(/^\s+|\s+$/g,'');
}
// MY TRIM ends

// DO PROPORTIONAL TEXT
// Called from makeText to set Proportional OldStyle or Lining on numbers in
// title, subtitle or sub-subtitle
function doProportionalText(tRange, isTitle) {
    var result;
    var str = tRange.contents;
    var patt = /\d+/g;
    var hasNumbers = true;
    while (hasNumbers) {
        result = patt.exec(str);
        if (result === null) {
            // Numbers not found; reset flag to break
            hasNumbers = false;
        } else {
            // Get the actual string
            var numbers = result[0];
            var start = result.index;
            var end = start + numbers.length;
            var numberRange = tRange.characters[start]
            numberRange.length = numbers.length;
            if (isTitle) {
                numberRange.characterAttributes.figureStyle = FigureStyleType.PROPORTIONALOLDSTYLE;
            } else {
                numberRange.characterAttributes.figureStyle = FigureStyleType.PROPORTIONAL;
            }
        }
    }
//~   var str = "First12345then 456 and more";
//~   var patt = /\d+/g;
//~   var res = patt.exec(str);
//~   var myStr = res[0];
//~   var len = myStr.length;
//~   var start = res.index;
//~   var end = res.index + len;
//~   document.getElementById("demo").innerHTML = myStr + ' ' + start + ':' + end;

    // var regex = /\d+/g;
}
// DO PROPORTIONAL TEXT ends

// LABELS ARE ALL NUMBERS
// Called from setTabularLining to check whether all
// textFrames in an axis-label group are numbers
function labelsAreAllNumbers(group) {
	var allNumbers = true;
     var tCount = group.textFrames.length;
     for (var tNo = 0; tNo < tCount; tNo++) {
         var thisFrame = group.textFrames[tNo];
         // Exclude any header
         if (thisFrame.name.search('header') < 0) {
             if (isNaN(thisFrame.contents)) {
                 allNumbers = false;
                 break;
             }   
         }
	}
	return allNumbers;
}
// LABELS ARE ALL NUMBERS ends

// SET TABULAR LINING
// Called from processAxisGroup. Argument is a group
// of label text-frames. If the labels are all numeric,
// set tabular lining
function setTabularLining(group) {
	if (labelsAreAllNumbers(group)) {
		var tCount = group.textFrames.length;
		for (var tNo = 0; tNo < tCount; tNo++) {
			var tFrame = group.textFrames[tNo];
			if (tFrame.name.search('header') < 0) {
				tFrame.textRange.characterAttributes.figureStyle = FigureStyleType.TABULAR;
			}
		}	
	}
}
// SET TABULAR LINING ends

// MAKE TEXT
// Major utility: passed a text object definition, creates it with all attributes
function makeText(tObj) {
	try {
		// Point text at point of origin
		var myText = tObj.context.textFrames.pointText([tObj.anchor[0], tObj.anchor[1]]);
		// Dummy contents so that I can set other attributes
		// myText.contents = tObj.contents;
		var cArray = tObj.contentsArray;
		myText.contents = '';
		var tRange = myText.textRange;
		// Append tspan contents, setting font on each textRange as we go...
		for (var iii = 0; iii < cArray.length; iii++) {
			var newRange = tRange.characters.add(cArray[iii].contents);
			newRange.characterAttributes.textFont = cArray[iii].textFont;
		}
		with (myText) {
			name = tObj.name;
			note = tObj.name;
			// Justification -- 0=left, 1=centre, 2=right
			// Has to be on all paragraphs (lines)
			var pLen = paragraphs.length;
			var just = Justification.CENTER;
			switch (tObj.justification) {
				case 'start' :
					just=Justification.LEFT;
					break;
				case 'end' :
					just=Justification.RIGHT;
					break;
				default :
					just=Justification.CENTER;
			}
			for (pNo = 0; pNo < pLen; pNo++) {
				paragraphs[pNo].paragraphAttributes.justification = just;
			}
			// Embedding following in a WITH{} causes Illustrator runtime error, so:
			textRange.characterAttributes.fillColor = tObj.fill;
			// textRange.characterAttributes.textFont = tObj.font;
			textRange.characterAttributes.size = tObj.size;
			textRange.characterAttributes.autoLeading=false;
			textRange.characterAttributes.leading = tObj.leading;
			textRange.characterAttributes.tracking = tObj.tracking;
             // By default: proportional lining
			textRange.characterAttributes.figureStyle= FigureStyleType.PROPORTIONAL;
             // Overprinting
             var overprint = c_textOverprint.search(tObj.fill) >= 0;
             textRange.characterAttributes.overprintFill = overprint;
		}
         // Proportional text for numbers...
         if (tObj.name === 'title-string') {
             doProportionalText(myText, true);
         } else if (tObj.name.search('subtitle') >= 0) {
             doProportionalText(myText, false);
         }
		return myText;
		// Do I need to wrap the text? Apparently not...
		// if (tObj.contents.search(c_newline) > -1) {
		// 	if (!wrapText(myText)) {
		// 		alert('Failed to wrap ' + tObj.name + ' Please adjust manually');
		// 	}
		// }
	}
	catch (err) {};
}
// MAKE TEXT ends


// CONVERT TEXT TO FRAME
// Called from rationaliseText. Converts passed group of textFrames
// into a single textFrame...
function convertTextGroupToFrames(tGrp) {
	var contents = '';
	var len = tGrp.textFrames.length - 1;
	// Use group xpos:
	var anchorX = tGrp.position[0];
	// yPos from text object anchor (this will be applied to the emergent textFrame)
	var anchorY = tGrp.textFrames[len].anchor[1];
	// But I also need a changeable yPos to check for new lines
	var checkPos = tGrp.textFrames[0].anchor[1];
	// Experimental contents array
	var contentsArray = [];
	// for (var i = 0; i < len; i++) {
	// Tspans get reversed. Doesn't everything?!
	for (var i = len; i >= 0; i--) {
		var tf = tGrp.textFrames[i];
    var str = tf.contents;	//myTrim(tf.contents);
    // Temporarily, Jan'20, for table tabbing:
    // str = str.replace(c_tabSubstitute, c_tabChar)
    str = str.replace(/___/g, c_tabChar)
		var newline = false;
		if (str.length > 0) {
			// Set xAnchor on each loop, leaving it at last position
			// (looping back, remember!)
			// tf.anchor is array [xPos, yPos]. I'm only
			// interested in yPos, which indicates a new line
			// (I'll get xPos from the metadata)
			var yPos = tf.anchor[1];
			if (yPos !== checkPos) {
				// New line: append separator to existing string:
				if (contents.length > 0) {
					contents += c_newline;
					newline = true;
				}
				// Reset ypos comparison
				checkPos = yPos;
				// And probably reset 'final' anchor, which I want to be
				// the y-anchor of the topmost tspan
				// (
//				if (checkPos > anchorY) {
//					anchorY = checkPos;
//				}
			}
			// Add contents to this tspan
			var myStr = str;	// myTrim(str)
			contents += myStr;
			if (newline) {
				myStr = c_newline + myStr;
				// And catch space at start of line:
				myStr = myStr.replace((c_newline + ' '), c_newline);
			}
			var tfObj = {
				contents: myStr,
				textFont: tf.textRange.textFont,
				newline: newline
			}
			contentsArray.push(tfObj);
		}
	}
	// Do we have contents?
	if (contents.length > 0) {
		// Extract the metadata constituent
		var tProps = getMetadata(tGrp.name);
		// Now work out xPos from width and justification
		var width = parseFloat(tProps.width);
		var just = tProps.justification;
		if (just === 'center' || just === 'middle') {
			anchorX += width / 2;
		} else if (just === 'end') {
			anchorX += width;
		}

		// Assemble all properties into an object
		var textProps = {
			context: tGrp.parent,
			anchor: [anchorX, anchorY],
			fill: makeCmykColourObject(tProps.fill),
			font: tGrp.textFrames[0].textRange.characterAttributes.textFont,
			size: tGrp.textFrames[0].textRange.characters[0].size,
			// Note: AI converts 'letter-spacing' to 'tracking'
			tracking: tGrp.textFrames[0].textRange.characterAttributes.tracking,
			leading: parseFloat(tProps.leading),
			justification: just,
			contents: contents,
			contentsArray: contentsArray,
			name: tProps.name
		}
		var myText = makeText(textProps);
        // tGrp.remove();
	}
	return myText;
}
// CONVERT TEXT TO FRAME ends

// SET TEXT FRAME ATTRIBUTES
// Called from rationaliseText. Passed a simple text frame (i.e. not a group of 'tspans'),
// it just sets attributes from metadata buried in element.name
function setTextFrameAttributes(tFrame) {
	// Extract the metadata constituent
	var tProps = getMetadata(tFrame.name, true);
	// Overwrite props on the element
	// Position (seems to work better than 'anchor')
	var position = tFrame.position;
	// Fill (from name)
	var fill = tProps.fill;
	var colObj = makeCmykColourObject(fill);
	tFrame.textRange.characterAttributes.fillColor = colObj;
	// Does text overprint? Look it up the fill name in the list...
	var overprint = c_textOverprint.search(fill) >= 0;
	tFrame.textRange.characterAttributes.overprintFill = overprint;
	// Justification: default is 'end' / RIGHT
	// Careful: width comes in as a string...
	var xTweak = parseFloat(tProps.width);
	var just = Justification.RIGHT;
	switch (tProps.justification) {
		case 'start' :
			just=Justification.LEFT;
			xTweak = 0;;
			break;
		case 'center' :
			just=Justification.CENTER;
			xTweak /= 2;
			break;
		case 'middle' :
			just=Justification.CENTER;
			xTweak /= 2;
			break;
		default :
			just=Justification.RIGHT;
	}
	position[0] = position[0] + xTweak;
	tFrame.position = position;
	tFrame.textRange.justification = just;
	// And ID...
	tFrame.name = tProps.name;
}
// SET TEXT FRAME ATTRIBUTES ends

// IS TEXT GROUP
// Called from rationaliseText. Passed a groupItem, loops through
// its child pageItems to check whether thay are all textFrames...
function isTextGroup(grp) {
	// The problem is that a block of text comes through as a GroupItem
  // So I need to check if this is a textblock
	// Set a flag (forced to false if empty group, which will recurse and get zapped)
	var isText = true;
  // Iterate through the group. If every child is a TextFrame, this is text...
	for (var j = 0; j < grp.pageItems.length; j++) {
		if (grp.pageItems[j].typename !== 'TextFrame') {
			isText = false;
			break;
		}
	}
	return isText;
}
// IS TEXT GROUP ends

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



// RATIONALISE TEXT
// Called from processSibyl, etc., to convert text groups into textFrames...
// Arg 1 is a groupItem: a strings group;
// Arg 2 is a flag: use the group's name to set attributes on child textFrames
function rationaliseText(grp, useGroupName) {
  var returnedGroup;
  var gLen = grp.groupItems.length;
  var tLen = grp.textFrames.length;
	// This may be over-optimistic... but...
	if (gLen > 0) {
		// Text as groups
		for (var i = (gLen - 1); i >= 0; i--) {
			var myG = grp.groupItems[i];
			// If group is empty, simply delete it
			if (myG.pageItems.length === 0) {
				alert("Deleting textGroup " + myG);
				myG.remove();
			} else if (isTextGroup(myG)) {
				// All children are text, so treat as such
				var textFrame = convertTextGroupToFrames(myG);
				// Mark original group for deletion
				myG.name = c_deleteme;
			}
			// Assumption is that any other groups are non-text and get handled when we've sorted text out...
		}
		// Now loop through again, deleting marked groups
		// (I can't delete groups on the fly, because in the end any parent group (specifically
		// the background.strings group) winds up containing only textFrames and getting zapped.
    // So I mark groups-of-text as I go and kill them now:
    // FIXME: I think I can remove this and move call to
    // removeOriginalGrp out of the loop, below 
		deleteMarkedGroups(grp.groupItems, true);
		returnedGroup = grp;
	} else if (tLen > 0) {
        // So the argument was a single group of textFrames. These can, however, have
        // originally been tspans to be assembled into a single textFrame...
				var tSpans = (grp.pageItems[0].typename === 'TextFrame');
				// But 2nd check required, since a group of 'un-spanned'
				// textFrames (i.e. axis labels) meet the test
				// tSpans don't have an id
				if (tSpans) {
					tSpans = grp.textFrames[0].name.search(c_metaDataSep) < 0;
				}
        if (tSpans) {
            var textFrame = convertTextGroupToFrames(grp);
        } else {
            // Otherwise we have a set of independent textFrames 
            // (i.e. standard axis labels)
            // New group
            var newGroup = grp.parent.groupItems.add();
            newGroup.name = grp.name;
            for (i = tLen - 1; i >= 0; i--) {
                var tFrame = grp.textFrames[i];
                if (useGroupName) {
                    tFrame.name = grp.name;
                }
                // Create a duplicate (original deleted below)
                makeNewTextFrame(tFrame, newGroup);
            }
				}
				returnedGroup = newGroup;
        removeOriginalGrp(grp);
	}
    
  return returnedGroup;
}
// RATIONALISE TEXT ends
