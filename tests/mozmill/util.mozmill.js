/* How to run these tests:
 * Install mozmill extension: https://developer.mozilla.org/en/Mozmill
 * View Mozmill IDE (control shift M) and load and run this file 
 */
var jumlib = {};
Components.utils["import"]("resource://mozmill/modules/jum.js",jumlib);

var lore={};
Components.utils["import"]("resource://lore/util.js",lore);

var setupModule = function (){
  controller = mozmill.getBrowserController();
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
  jumlib.assertEquals(lore.util.escapeHTML(input),expect, 'util.escapeHTML');
};

var testExternalizeDomLinks = function (){
};

var testExternalizeLinks = function(){
  var input = "Some text <A HREF=\"http://austlit.edu.au\">This is a link</A> More text";
  var expect = "Some text <A target=\"_blank\" HREF=\"http://austlit.edu.au\">This is a link</A> More text";
  jumlib.assertEquals(lore.util.externalizeLinks(input),expect, 'util.externalizeLinks with a string containing a link');
};

var testNormalize = function(){
  var input = "   This is       a    string  with  <i>spaces</i> ";
  var expect = "This is a string with <i>spaces</i>";
  jumlib.assertEquals(lore.util.normalize(input),expect, 'util.normalize with a string with spaces');
};

var testSanitizeHTML = function (){
  var input ="<p style='color:red'>This is some html with <a onclick='1+2==3' href='http://www.google.com'>a link</a> and<script type='text/javascript'>alert('hello');</script> a script</p>";
  // Firefox 3.5.x
  //var expect = "<P>This is some html with <A href=\"http://www.google.com\">a link</A> and a script</P>";
  // Firefox 3.6
  var expect = "<p xmlns=\"http://www.w3.org/1999/xhtml\">This is some html with <a href=\"http://www.google.com\">a link</a> and a script</p>";
  var thewin = lore.util.getContentWindow(controller.window);
  jumlib.assertEquals(lore.util.sanitizeHTML(input,thewin),expect,'util.sanitizeHTML'); 
};

var testIsEmptyObject = function(){
    var emptyObj = {};
    var nonEmptyObj = {}; nonEmptyObj.blah = "";
    jumlib.assertEquals(lore.util.isEmptyObject(emptyObj), true, "Object is Empty");
    jumlib.assertEquals(lore.util.isEmptyObject(nonEmptyObj), false, "Object is not empty");    
};

var testSplitTermHash = function (){
  var input = "http://www.w3.org/2002/07/owl#ObjectProperty";
  var expect = {ns: 'http://www.w3.org/2002/07/owl#',term:'ObjectProperty'};
  jumlib.assertEquals(JSON.stringify(lore.util.splitTerm(input)),JSON.stringify(expect),'util.splitTerm with a URL with a hash')
};

var testSplitTermNoHash = function (){
  var input = "http://www.openarchives.org/ore/terms/ResourceMap";
  var expect = {ns: 'http://www.openarchives.org/ore/terms/',term:'ResourceMap'};
  jumlib.assertEquals(JSON.stringify(lore.util.splitTerm(input)),JSON.stringify(expect),'util.splitTerm with a URL with no hash')
};

var testTrim = function (){
  var input = "     This is a string with   leading and trailing spaces     ";
  var expect = "This is a string with   leading and trailing spaces";
  jumlib.assertEquals(lore.util.trim(input),expect, 'util.trim with a string with spaces');
};

var testUnescapeHTML = function (){
  var input = "This string has&amp; &lt; and &gt; and &quot; &apos; and another &amp;";
  var expect = "This string has& < and > and \" ' and another &";
  jumlib.assertEquals(lore.util.unescapeHTML(input),expect, 'util.unescapeHTML');
};

var testFixedEncodeURIComponent = function(){
    var plain = 'http://www.austlit.edu.au/run?ex=ShowWork&workId=C%23IX{'
    var encoded = 'http%3A%2F%2Fwww.austlit.edu.au%2Frun%3Fex%3DShowWork%26workId%3DC%2523IX%257B';
    jumlib.assertEquals(lore.util.fixedEncodeURIComponent(plain), encoded, "Encode URI with { character");    
};

var testUrlsAreSame = function() {
    var url1 = "http://www.omad.net/";
    var url2 = "http://www.omad.net/";
    jumlib.assertTrue(lore.util.urlsAreSame(url1, url2), 'Urls are identical');

    var url1 = "http://www.digitalhumanities.org/dhq/vol/4/1/000080/000080.html#";
    var url2 = "http://www.digitalhumanities.org/dhq/vol/4/1/000080/000080.html";
    jumlib.assertTrue(lore.util.urlsAreSame(url1, url2), 'Urls differ by a hash');

    var url1 = "http://www.digitalhumanities.org/dhq/vol/4/1/000080/000080.html";
    var url2 = "http://www.digitalhumanities.org/dhq/vol/4/1/000080/000080.html#foobar";
    jumlib.assertTrue(lore.util.urlsAreSame(url1, url2), 'Urls differ by a hash and tag');
};

var testStripHTML = function() {
    var html = '<p>Here is <a href="#">some <b>html</b></a> with <span style="color:red">markup</span></p>';
    var result = 'Here is some html with markup';
    jumlib.assertEquals(lore.util.stripHTML(html, controller.window.content.document), result, "Strip well formed HTML");
};



