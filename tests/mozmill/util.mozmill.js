var jumlib = {};
Components.utils.import("resource://mozmill/modules/jum.js",jumlib);

var test={};
Components.utils.import("resource://lore/util.js",test);

var setupModule = function (){
  controller = mozmill.getBrowserController();
};

var testClone = function(){
  var input = {"test": 1, "test2": "abcd", "test3": {"a": 1,"b":"two", "c":{"d":1}}};
  // util.clone also copies functions but we never use it for that purpose
  jumlib.assertEquals(JSON.stringify(input),JSON.stringify(test.util.clone(input)),'util.clone');
};

var testCreateSecureIFrame = function(){ 
};
var testCreateWrapper = function(){  
};
var testCreateXULIFrame = function(){
};

var testEscapeHTML = function (){
  var input = "This string has& < and > and \" ' and another &";
  var expect = "This string has&amp; &lt; and &gt; and &quot; &apos; and another &amp;";
  jumlib.assertEquals(test.util.escapeHTML(input),expect, 'util.escapeHTML');
};

var testExternalizeDomLinks = function (){
};

var testExternalizeLinks = function(){
  var input = "Some text <A HREF=\"http://austlit.edu.au\">This is a link</A> More text";
  var expect = "Some text <A target=\"_blank\" HREF=\"http://austlit.edu.au\">This is a link</A> More text";
  jumlib.assertEquals(test.util.externalizeLinks(input),expect, 'util.externalizeLinks with a string containing a link');
};

var testNormalize = function(){
  var input = "   This is       a    string  with  <i>spaces</i> ";
  var expect = "This is a string with <i>spaces</i>";
  jumlib.assertEquals(test.util.normalize(input),expect, 'util.normalize with a string with spaces');
};

var testSanitizeHTML = function (){
  var input ="<p style='color:red'>This is some html with <a onclick='1+2==3' href='http://www.google.com'>a link</a> and<script type='text/javascript'>eval('foo=2;');</script> a script</p>";
  // Firefox 3.5.x
  //var expect = "<P>This is some html with <A href=\"http://www.google.com\">a link</A> and a script</P>";
  // Firefox 3.6
  var expect = "<p xmlns=\"http://www.w3.org/1999/xhtml\">This is some html with <a href=\"http://www.google.com\">a link</a> and a script</p>";
  var thewin = test.util.getContentWindow(controller.window);
  jumlib.assertEquals(test.util.sanitizeHTML(input,thewin),expect,'util.sanitizeHTML'); 
};

var testSplitTermHash = function (){
  var input = "http://www.w3.org/2002/07/owl#ObjectProperty";
  var expect = {ns: 'http://www.w3.org/2002/07/owl#',term:'ObjectProperty'};
  jumlib.assertEquals(JSON.stringify(test.util.splitTerm(input)),JSON.stringify(expect),'util.splitTerm with a URL with a hash')
};

var testSplitTermNoHash = function (){
  var input = "http://www.openarchives.org/ore/terms/ResourceMap";
  var expect = {ns: 'http://www.openarchives.org/ore/terms/',term:'ResourceMap'};
  jumlib.assertEquals(JSON.stringify(test.util.splitTerm(input)),JSON.stringify(expect),'util.splitTerm with a URL with no hash')
};

var testTrim = function (){
  var input = "     This is a string with   leading and trailing spaces     ";
  var expect = "This is a string with   leading and trailing spaces";
  jumlib.assertEquals(test.util.trim(input),expect, 'util.trim with a string with spaces');
};

var testUnescapeHTML = function (){
  var input = "This string has&amp; &lt; and &gt; and &quot; &apos; and another &amp;";
  var expect = "This string has& < and > and \" ' and another &";
  jumlib.assertEquals(test.util.unescapeHTML(input),expect, 'util.unescapeHTML');
};


