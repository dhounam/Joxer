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

// Lookup of colours. This is a duplicate of colours in Sibyl's colours.json...
var c_colourLookup = {
  "black25": {"c": 0, "m":0, "y": 0, "k": 25},
  "black50": {"c": 0, "m":0, "y": 0, "k": 50},
  "black75": {"c": 0, "m":0, "y": 0, "k": 75},
  "black100": {"c": 0, "m":0, "y": 0, "k": 100},
  "blue1": {"c": 90, "m":50, "y": 15, "k": 5},
  "blue2": {"c": 67, "m":0, "y": 18, "k": 0},
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
  "random1": {"c": 0, "m": 80, "y": 50, "k": 0},
  "random2": {"c": 0, "m": 35, "y": 90, "k": 0},
  "random3": {"c": 70, "m": 60, "y": 0, "k": 0},
  "random4": {"c": 30, "m": 70, "y": 50, "k": 10},
  "random5": {"c": 20, "m": 80, "y": 0, "k": 0},
  "random6": {"c": 10, "m": 10, "y": 75, "k": 0},
  "random7": {"c": 40, "m": 0, "y": 30, "k": 0},
  "random8": {"c": 80, "m": 20, "y": 80, "k": 0},
  "random9": {"c": 0, "m": 0, "y": 0, "k": 70},
  "random10": {"c": 0, "m": 70, "y": 80, "k": 0},
}
c_layerColourLookup = {
  "background-layer": {r: 100, g: 150, b: 250},
  "content-layer": {r: 250, g: 0, b: 50},
  "content-layer-1": {r: 250, g: 0, b: 50},
  "content-layer-2": {r: 200, g: 100, b: 100},
  "content-layer-3": {r: 150, g: 0, b: 0},
  "content-layer-4": {r: 250, g: 150, b: 150},
  "content-layer-5": {r: 100, g: 100, b: 100},
  "content-layer-6": {r: 150, g: 150, b: 150},
  "content-layer-7": {r: 200, g: 200, b: 200},
  "content-layer-8": {r: 250, g: 250, b: 250},
}

// Colours for which text overprints:
var c_textOverprint = 'black100,black75,greytext';
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
var c_itsAllLineSeriesOuterGroup = 'all-line-series-outer-group';
var c_itsBlobGroup = 'blob-group-';
var c_itsBlobHeaderGroup = 'blob-header-group-';
var c_itsZeroLineGroup = 'zeroline-group-';
var c_itsSecondaryGroup = 'axis-secondary-group-'
var c_itsAxisHeaderGroup = 'axis-header-group-';
var c_itsZaxisKeyGroup = 'zaxis-header-group';
var c_zeroLine = 'axis-zero-line';
// 'my' are elements that I create in processing
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

// GLOBALS
var zeroLineBehind = true;