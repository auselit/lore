var TEST_XPATH_1 = 'xpointer(string-range(/html[1]/body[1]/div[1]/p[3], "", 92, 21))';
var TEST_XPATH_2 = 'xpointer(start-point(string-range(/html[1]/body[1]/div[2]/p[2], "", 143, 1))/range-to(end-point(string-range(/html[1]/body[1]/div[2]/p[2], "", 188, 1))))';
var TEST_XPATH_3 = 'string-range(/html[1]/body[1]/div[1]/p[3], "", 92, 21)';
var TEST_XPATH_4 = 'xpointer(/html[1]/body[1]/div[1]/p[3])';
var TEST_XPATH_5 = '/html[1]/body[1]/div[1]/p[3]';
var TEST_XPATH_6 = 'GARBAGE';
var TEST_XPATH_7 = 'xpointer(/html[1]/body[1])';

var TEST_VALID_XPATH = 'xpointer(string-range(/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/div[1]/div[1]/h1[1], "", 4, 5))';
var TEST_VALID_XPATH_LORECOMMON = 'xpointer(start-point(string-range(/html[1]/body[1]/div[1]/p[3], "", 134, 1))/range-to(end-point(string-range(/html[1]/body[1]/div[1]/p[3], "", 234, 1))))';
var TEST_VALID_XPATH_LORECOMMON_2 = 'xpointer(start-point(string-range(/html[1]/body[1]/div[8]/p[2], "", 185, 1))/range-to(end-point(string-range(/html[1]/body[1]/div[8]/p[2], "", 333, 1))))';


function testRevisionMarkers() {
  if (consoleDebug) console.debug('[testRevisionMarkers() begin]');
  var sourceFrame = document.getElementById("revisionSourceFrame");
  
  highlightXPointer(TEST_VALID_XPATH_LORECOMMON, sourceFrame.contentDocument, false);
  highlightXPointer(TEST_VALID_XPATH_LORECOMMON_2, sourceFrame.contentDocument, true);
  
  if (consoleDebug) console.debug('[testRevisionMarkers() end]');
}

function testParse() {
  if (consoleDebug) console.debug('[testParse() begin]'); 
  var sourceFrame = document.getElementById('revisionSourceFrame');
  var targetFrame = document.getElementById('revisionTargetFrame');
  
  if (consoleDebug) console.debug('Retrieved revision frame handles.');

  if (targetFrame.contentDocument) {
    if (consoleDebug) console.debug('Target frame has content document.');
  }
  // var sel = m_xps.parseXPointerToRange(TEST_VALID_XPATH, document);
  var sel = m_xps.parseXPointerToRange(TEST_XPATH_4, targetFrame.contentDocument);
  
  if (consoleDebug) console.debug('Parse result: ');
  if (consoleDebug) console.debug(sel);
  if (consoleDebug) console.debug('[testParse() end]');
}
