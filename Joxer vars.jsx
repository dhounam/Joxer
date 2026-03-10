// File created Aug 2019, contains all global variable definitions
// (NB: VSC debugger doesn't like 'const')
// 
var c_contactNotice = " Donald Hounam: mobile 07825 994445; email donaldhounam@economist.com; slack donaldhounam ";
// In- and out-boxes. These remain the same when this code is uploaded to server.
// Data files are always local.
// Default folder for incoming SVGs
var c_svgFolder = "~/downloads";
// Save to:
var c_outbox = '~/desktop/_Silver Bullet/outbox/';

// EDITABLE SECTION===============================
// Lookup of colours. This is a duplicate of colours in Sibyl's colours.json...
// Note distinction between 'blackop75', which overprints, and
// 'black75', which doesn't
var c_colourLookup = {
  "econred": {"c": 0, "m": 100, "y": 100, "k": 0},
  "econred85": {"c": 0, "m": 85, "y": 85, "k": 0},
  "econredtint": {"c": 0, "m": 40, "y": 40, "k": 0},
  "econreddark": {"c": 0, "m": 100, "y": 100, "k": 30},
  "chicago30": {"c": 96, "m": 90, "y": 0, "k": 30},
  "chartchicago": {"c": 96, "m": 85, "y": 0, "k": 0},
  "chartblue": {"c": 60, "m": 30, "y": 0, "k": 0},
  "land4": {"c": 0, "m": 0, "y": 14, "k": 56},
  "land3": {"c": 0, "m": 0, "y": 14, "k": 42},
  "white": {"c": 0, "m": 0, "y": 0, "k": 0},
  "black25": {"c": 0, "m": 0, "y": 0, "k": 25},
  "black50": {"c": 0, "m": 0, "y": 0, "k": 50},
  "black75": {"c": 0, "m": 0, "y": 0, "k": 75},
  "blackop75": {"c": 0, "m": 0, "y": 0, "k": 75},
  "black100": {"c": 0, "m": 0, "y": 0, "k": 100},
  "highlight": {"c": 0, "m": 0, "y": 6, "k": 18},
  "printbkgd": {"c": 0, "m": 0, "y": 6, "k": 8},
  "gridlines": {"c": 0, "m": 0, "y": 0, "k": 25},
  "greybox": {"c": 0, "m": 0, "y": 6, "k": 18},
  "conservative": {"c": 96, "m": 85, "y": 0, "k": 0},
  "labour": {"c": 0, "m": 85, "y": 85, "k": 0},
  "lib": {"c": 0, "m": 33, "y": 100, "k": 0},
  "snp": {"c": 0, "m": 22, "y": 66, "k": 0},
  "green": {"c": 60, "m": 0, "y": 100, "k": 0},
  "plaid": {"c": 70, "m": 0, "y": 100, "k": 40},
  "other": {"c": 0, "m": 0, "y": 0, "k": 50},
  "democrat": {"c": 96, "m": 85, "y": 0, "k": 0},
  "republican": {"c": 0, "m": 85, "y": 85, "k": 0},
  "note-1": "2 colours deprecated Apr'24; but left for legacy charts",
  "note-2": "neither will overprint",
  "greytext": {"c": 0, "m": 0, "y": 0, "k": 75},
  "landtext": {"c": 0, "m": 0, "y": 0, "k": 75},
};
var c_old_colourLookup = {
  "black25": {"c": 0, "m":0, "y": 0, "k": 25},
  "black50": {"c": 0, "m":0, "y": 0, "k": 50},
  "black75": {"c": 0, "m":0, "y": 0, "k": 75},
  "black100": {"c": 0, "m":0, "y": 0, "k": 100},
  "blue1": {"c": 90, "m":50, "y": 15, "k": 5},
  "blue2": {"c": 67, "m":0, "y": 18, "k": 0},
  "bluetint": {"c": 54, "m":29, "y": 10, "k": 4},
  "bluetext": {"c": 82, "m":0, "y": 18, "k": 8},
  "bluedark": {"c": 85, "m":10, "y": 0, "k": 58},
  "econred": {"c": 0, "m": 100, "y": 100, "k": 0},
  "green1": {"c": 85, "m":0, "y": 30, "k": 20},
  "green2": {"c": 53, "m":0, "y": 26, "k": 0},
  "greybox": {"c": 30, "m":0, "y": 0, "k": 50},
  "greytext": {"c": 20, "m":0, "y": 0, "k": 80},
  "gridlines": {"c": 10, "m":0, "y": 0, "k": 25},
  "highlight": {"c": 15, "m":0, "y": 0, "k": 10},
  "numberbox": {"c": 24, "m":0, "y": 0, "k": 16},
  "printbkgd": {"c": 9, "m":0, "y": 0, "k": 6},
  "purple1": {"c": 0, "m":75, "y": 35, "k": 45},
  "purple2": {"c": 27, "m":42, "y": 25, "k": 10},
  "pink": {"c": 10, "m": 60, "y": 40, "k": 0},
  "red1": {"c": 12, "m":80, "y": 60, "k": 0},
  "redtext": {"c": 12, "m":80, "y": 60, "k": 0},
  "socmedbkgd": {"c": 0, "m":0, "y": 0, "k": 7.5},
  "white": {"c": 0, "m":0, "y": 0, "k": 0},
  "yellow": {"c": 12, "m":30, "y": 70, "k": 0},
  "conservative": {"c": 90, "m":50, "y": 15, "k": 5},
  "labour": {"c": 10, "m":70, "y": 50, "k": 0},
  "lib": {"c": 6, "m": 40, "y": 100, "k": 0},
  "brexit": {"c": 67, "m":0, "y": 18, "k": 0},
  "snp": {"c": 10, "m": 10, "y": 100, "k": 0},
  "ukip": {"c": 40, "m": 70, "y": 30, "k": 6},
  "green": {"c": 85, "m": 0, "y": 30, "k": 20},
  "plaid": {"c": 53, "m": 0, "y": 26, "k": 0},
  "other": {"c": 30, "m": 0, "y": 0, "k": 50},
  "democrat": {"c": 90, "m": 50, "y": 15, "k": 5},
  "republican": {"c": 10, "m": 70, "y": 50, "k": 0},
  "extra1": {"c": 0, "m": 80, "y": 50, "k": 0},
  "extra2": {"c": 0, "m": 35, "y": 90, "k": 0},
  "extra3": {"c": 70, "m": 60, "y": 0, "k": 0},
  "extra4": {"c": 30, "m": 70, "y": 50, "k": 10},
  "extra5": {"c": 20, "m": 80, "y": 0, "k": 0},
  "extra6": {"c": 10, "m": 10, "y": 75, "k": 0},
  "extra7": {"c": 40, "m": 0, "y": 30, "k": 0},
  "extra8": {"c": 80, "m": 20, "y": 80, "k": 0},
  "extra9": {"c": 0, "m": 0, "y": 0, "k": 70},
  "extra10": {"c": 0, "m": 70, "y": 80, "k": 0},
  "none": {"c": 0, "m": 0, "y": 0, "k": 0 },
}
// NOTE: there's a provisional list of 2024 DC colours at the bottom of this file
// EDITABLE SECTION ENDS==========================

var c_layerColourLookup = {
  "background-layer": {r: 100, g: 200, b: 200},
  "content-layer": {r: 50, g: 50, b: 150},
  "content-layer-1": {r: 100, g: 200, b: 50},
  "content-layer-2": {r: 0, g: 100, b: 100},
  "content-layer-3": {r: 50, g: 150, b: 200},
  "content-layer-4": {r: 100, g: 150, b: 150},
  "content-layer-5": {r: 100, g: 100, b: 100},
  "content-layer-6": {r: 150, g: 150, b: 150},
  "content-layer-7": {r: 200, g: 200, b: 100},
  "content-layer-8": {r: 250, g: 250, b: 0},
}

// In addition, the following colours are defined in Sibyl for responsive
// DCs. They have no CMYK values here, since they go through as unconverted
// RGB
// dc-econred,dc-econred60,dc-econredtint,dc-econreddark,
// dc-chicago30,dc-chicago55,dc-chartchicago,
// dc-chartblue,dc-land3,dc-land4,dc-landtext,
// dc-london5,dc-london20,dc-london30,dc-london55,dc-london70,dc-london85,
// dc-gridlines,dc-greytext,dc-highlight,dc-socmedbkgd
// And the following for films
// films-bkgd, films-greytext, films-axis-greytext, films-gridlines
// Hex values for all these are in the Sibyl colours lookup file

// Colours for which text overprints:
// var c_textOverprint = 'black100,black75,greytext,landtext';
// Changed Apr'24
var c_textOverprint = 'black100,blackop75,black25';
// Failsafe values (defaults in case metadata lacks property)
var c_failsafeColour = {c:10, m:0, y:10, k:0};
var c_failsafeRgbColour = {red:0, green:0, blue:10};
var c_failsafeFont = "EconSansCndReg";

// Separators for metadata
// Between itam name (id) and ALL metadata
var c_metaDataSep = '~~~';
// Individual metadata items
var c_metaItemSep = ',';
// Metadata prop:value
var c_metaPropSep = ':';

// Newline (text wrap) tag
var c_newline = '\r';
// Tab
var c_tabChar = '\t';
var c_tabSubstitute = '___';

// String to use for groups that get deleted
var c_deleteme = 'Group to be deleted';

// Element ids
// 'its' are elementes in the incoming SVG
var c_itsLayer1 = 'Layer 1';
var c_itsMainGroup = 'main-group';
var c_itsBackGroup = 'background-group';
var c_itsPanelsGroup  = 'panels-group';
var c_itsContentGroup = 'content-group';
var c_itsLegendsGroup = 'legends-group';
var c_itsAllLineSeriesOuterGroup = 'all-line-series-outer-group-';
var c_itsBlobGroup = 'blob-group-';
var c_itsBlobHeaderGroup = 'blob-header-group-';
var c_itsZeroLineGroup = 'zeroline-group-';
var c_itsSecondaryGroup = 'axis-secondary-group-'
var c_itsAxisHeaderGroup = 'axis-header-group-';
var c_itsZaxisKeyGroup = 'zaxis-header-group';
var c_zeroLine = 'axis-zero-line';

// The following 'c_my...' vars identify elements that I create in processing
/*
  Under the restructure I want only
    background layer
      This has no top-level sub-groups
      Strings and shapes are independent in the layer
      Legends are grouped only as legendset-groups, each with
        legendkey groups
        a legendheader, not in its own group
    content layer
      No overall subgroup. Immediate children are:
        Series (grouped if columns, bars...)
        Broken scale symbol
        Broken scale baseline
        Zero line
        X/Yaxis labels as a group
        X/Yaxis ticks as a group
        
        Blobs are individually grouped
        Ditto blob header
*/
// Another major change is that each panel occupies its own
// Layer: content-layer-<n>
var c_myBackLayer = 'background-layer';
var c_myContentLayer = 'content-layer-';
// Some subgroups are indexed by panel/content...
var c_left = '-left';
var c_right = '-right';
// Axes
var c_myXaxisGroup = 'xaxis-group-'
var c_myYaxisGroup = 'yaxis-group-'
var c_myTicksGroup = 'axis-ticks-group-';
var c_myLabelsGroup = 'axis-labels-group-';
// Legends:
var c_myLegendSet = 'legendset-';
var c_myLegendPair = 'legend-';
var c_myLegendText = 'legend-text';
var c_myLegendKey = 'legend-key';
var c_myLegendHeader = 'legend-header';
// 
var c_myLinePointSeries = 'point-lines-group';
var c_myScatterPoint = 'scatter-point';
var c_myScatterSeries = 'scatter-series';
var c_myPieGroup = 'pie-group-';
var c_myPieHeader = 'pie-header';
var c_myPieWedge = 'pie-wedge-';
// Blobs -- maybe not all used...
var c_blobSeriesGroup = 'blob-series-group-';
var c_blobPairGroup = 'blob-pair-group';
var c_blobShape = 'blob-shape';
var c_blobText = 'blob-text';
var c_myBlobHeaderGroup = 'blob-header-group';
var c_blobHeaderRect = 'blob-header-rect';
var c_blobHeaderText = 'blob-header-text';
var c_indexDot = 'index-dot-';
var c_breakSymbol = 'broken-scale-symbol';
var c_breakBaseline = 'broken-scale-baseline';
//
var c_myAxisHeader = 'axis-header';
// Tables
var c_myTableTextGroupName = 'table-text-group-';
var c_myTableRulesGroupName = 'table-rules-group-';
var c_myTableFillsGroupName = 'table-fills-group-';
// Tabular lining for numbers
// All-number axis labels
var c_convertNumAxisLablesToTabularLining = false;
// Number boxes
var c_convertNumBoxesToTabularLining = true;
// Numbers in tables
var c_convertTableNumbersToTabularLining = true;

// GLOBALS
var g_zeroLineBehind = true;
var g_colourSpaceRgb = false;

// Provisional list of 2024 DC colours as hex values
// "dc-Econred": "#e3120b",
// "dc-Econred60": "#f6423c",
// "dc-Econredtint": "#fba493",
// "dc-Econreddark": "#c11614",
// "dc-Chicago30": "#1f2e7a",
// "dc-ChartChicago": "#3a4dac",
// "dc-ChartBlue": "#7892c5",
// "dc-Land4": "#989683",
// "dc-Land3": "#bebcab",
// "dc-Landtext": "#6a6654",
// "dc-London5": "#0d0d0d",
// "dc-London30": "#4d4d4d",
// "dc-London70": "#b3b3b3",
// "dc-gridlines": "#d9d9d9",
// "dc-greybox": "#d9d9d9",
// "dc-greytext": "#666666",
// "dc-highlight": "#f2f2f2",
// "dc-numberbox": "#d9d9d9",
// "dc-socmedbkgd": "#f5f4ef",
// "films-bkgd": "#f5f4ef",
// "films-greytext": "#666666",
