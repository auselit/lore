var testData = {
  emptyResourceMap : '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dc10="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:ore="http://www.openarchives.org/ore/terms/" xmlns:foaf="http://xmlns.com/foaf/0.1/" xmlns:layout="http://maenad.itee.uq.edu.au/lore/layout.owl#" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:annotea="http://www.w3.org/2000/10/annotation-ns#" xmlns:annotype="http://www.w3.org/2000/10/annotationType#" xmlns:thread="http://www.w3.org/2001/03/thread#" xmlns:annoreply="http://www.w3.org/2001/12/replyType#" xmlns:vanno="http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#" xmlns:sparql="http://www.w3.org/2005/sparql-results#" xmlns:http="http://www.w3.org/1999/xx/http#" xmlns:xsd="http://www.w3.org/2001/XMLSchema#" xmlns:oac="http://www.openannotation.org/ns/" xmlns:owl="http://www.w3.org/2002/07/owl#" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#" xmlns:austlit="http://austlit.edu.au/owl/austlit.owl#" xmlns:danno="http://metadata.net/2009/09/danno#" xmlns:lorestore="http://auselit.metadata.net/lorestore/" xmlns:cnt="http://www.w3.org/2008/content#" xmlns:lore="http://austlit.edu.au/owl/austlitore.owl#"><ore:ResourceMap rdf:about="http://example.org/rem/123456"><ore:describes rdf:resource="http://austlit.edu.au/auselit/ore/#aggregation"/><dcterms:modified rdf:datatype="http://purl.org/dc/terms/W3CDTF">2011-12-08T11:11:23+10:00</dcterms:modified><dc:creator>Anna Gerber</dc:creator><layout:loreVersion>0.80</layout:loreVersion></ore:ResourceMap><ore:Aggregation rdf:about="http://austlit.edu.au/auselit/ore/#aggregation"><dcterms:modified>2011-12-08T11:11:23+10:00</dcterms:modified></ore:Aggregation></rdf:RDF>',
  basicResourceMap : '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dc10="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:ore="http://www.openarchives.org/ore/terms/" xmlns:foaf="http://xmlns.com/foaf/0.1/" xmlns:layout="http://maenad.itee.uq.edu.au/lore/layout.owl#" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:annotea="http://www.w3.org/2000/10/annotation-ns#" xmlns:annotype="http://www.w3.org/2000/10/annotationType#" xmlns:thread="http://www.w3.org/2001/03/thread#" xmlns:annoreply="http://www.w3.org/2001/12/replyType#" xmlns:vanno="http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#" xmlns:sparql="http://www.w3.org/2005/sparql-results#" xmlns:http="http://www.w3.org/1999/xx/http#" xmlns:xsd="http://www.w3.org/2001/XMLSchema#" xmlns:oac="http://www.openannotation.org/ns/" xmlns:owl="http://www.w3.org/2002/07/owl#" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#" xmlns:austlit="http://austlit.edu.au/owl/austlit.owl#" xmlns:danno="http://metadata.net/2009/09/danno#" xmlns:lorestore="http://auselit.metadata.net/lorestore/" xmlns:cnt="http://www.w3.org/2008/content#"><ore:ResourceMap rdf:about="http://austlit.edu.au/auselit/ore/ccbfa40a-571b-52e7-1ab8-8827cba5f604"><ore:describes rdf:resource="http://austlit.edu.au/auselit/ore/ccbfa40a-571b-52e7-1ab8-8827cba5f604#aggregation"/><layout:loreVersion>1.0</layout:loreVersion><dcterms:created rdf:datatype="http://purl.org/dc/terms/W3CDTF">2009-10-07T00:00:00+10:00</dcterms:created><dc:creator>Anna Gerber</dc:creator><dc:creator>A Hyland</dc:creator><dc:description>A sample description field.</dc:description><dc:description>Compound object used to test LORE</dc:description><dcterms:modified rdf:datatype=\"http://purl.org/dc/terms/W3CDTF\">2011-12-08T11:41:39+10:00</dcterms:modified><dc:rights>This work is licensed under a Creative Commons Attribution Noncommercial Share Alike 3.0 Australia License. http://creativecommons.org/licenses/by-nc-sa/3.0/au/</dc:rights><dc:title>Test Compound Object</dc:title></ore:ResourceMap><ore:Aggregation rdf:about="http://austlit.edu.au/auselit/ore/ccbfa40a-571b-52e7-1ab8-8827cba5f604#aggregation"><ore:aggregates rdf:resource="http://www.google.com.au/firefox?client=firefox-a&amp;rls=org.mozilla:en-GB:official"/><ore:aggregates rdf:resource="http://www.smh.com.au/"/><ore:aggregates rdf:resource="http://austlit.edu.au/auselit/ore/903F9538-4871-4BBF-A4A1-475B412FB7A8"/><ore:aggregates rdf:resource="http://austlit.edu.au/auselit/ids/e8c57a15-de01-92f2-b27b-b4bc9eb0d6ac"/></ore:Aggregation><rdf:Description rdf:about="http://www.google.com.au/firefox?client=firefox-a&amp;rls=org.mozilla:en-GB:official"><dc:format>text/html; charset=UTF-8</dc:format><dc:relation rdf:resource="http://austlit.edu.au/auselit/ore/903F9538-4871-4BBF-A4A1-475B412FB7A8"/><layout:x rdf:datatype="xsd:int">18</layout:x><layout:y rdf:datatype="xsd:int">24</layout:y><layout:width rdf:datatype="xsd:int">220</layout:width><layout:height rdf:datatype="xsd:int">32</layout:height><layout:originalHeight rdf:datatype="xsd:int">170</layout:originalHeight><layout:orderIndex rdf:datatype="xsd:int">3</layout:orderIndex></rdf:Description><rdf:Description rdf:about="http://www.smh.com.au/"><dcterms:abstract rdf:datatype="http://maenad.itee.uq.edu.au/lore/layout.owl#escapedHTMLFragment">John Fairfax, who bought control of the &lt;i&gt;Sydney Herald&lt;/i&gt; in 1841, beginning his family\'s 149-year long control of the paper he later renamed &lt;i&gt;The Sydney Morning Herald&lt;/i&gt;. &lt;br&gt;&lt;br&gt;&lt;b&gt;THE BIRTH OF THE HERALD &lt;/b&gt;&lt;br&gt;The &lt;i&gt;Sydney Morning Herald&lt;/i&gt; began life as the weekly &lt;i&gt;Sydney Herald&lt;/i&gt;. It cost 7d, had just four pages and only 750 copies were printed. The paper, named after Scotland\'s &lt;i&gt;Glasgow Herald&lt;/i&gt;, was founded by Englishmen Alfred Ward Stephens, Frederick Stokes and William McGarvie, who all worked for the &lt;i&gt;Sydney Gazette&lt;/i&gt;. The trio\'s new paper was initially based in Redman\'s Court, near George Street. Ten years later, John Fairfax began his family\'s 149-year long control of the paper. The bankrupt Englishman had published the &lt;i&gt;Leamington Spa Sketch Book&lt;/i&gt; before migrating to New South Wales in 1838. &lt;br&gt;&lt;br&gt;The paper became a daily in 1840, two years before it was renamed to its present masthead. The front page carried nothing but notices and advertisements, with news buried at the end of page two. Its editorial policies were based "upon principles of candour, honesty and honour... We have no wish to mislead; no interest to gratify by unsparing abuse or indiscriminate approbation."</dcterms:abstract><dcterms:abstract rdf:datatype="http://maenad.itee.uq.edu.au/lore/layout.owl#escapedHTMLFragment">&lt;div align="center"&gt;&amp; A gold discovery near Bathurst&lt;b&gt; &lt;/b&gt;made the &lt;u&gt;Herald&lt;/u&gt; nervous. It wrote:&lt;br&gt;&lt;br&gt;&amp;nbsp;&lt;i&gt;"should our gold prove to be abundant ... let the inhabitants of New South Wales and the neighbouring colonies stand prepared for calamities far more terrible than earthquakes or pestilence." &lt;/i&gt;&lt;br&gt;&lt;div align="left"&gt;&lt;br&gt;&lt;br&gt;The calamities may not have eventuated as predicted, but soon after the paper brought a rotating cylindrical press to replace the slower flat bed press. It had also switched to wider columns and a smaller font to give room for more advertisements. Illustrations had appeared a decade ago. &lt;br&gt;&lt;br&gt;&lt;blockquote&gt;The paper remained dependant on ships for news, with no telegraph connection between Sydney, Melbourne and Adelaide until 1858 or international link until the 1870s.&lt;/blockquote&gt;&lt;/div&gt;&lt;/div&gt;</dcterms:abstract><dc:description>The Sydney Morning Herald website</dc:description><dc:format>text/html; charset=UTF-8</dc:format><layout:highlightColor>EFD7FF</layout:highlightColor><dc:rights>Abstracts copied from About Us page on the SMH website</dc:rights><dc:rights rdf:resource="http://creativecommons.org/licenses/by/3.0/au/"/><dc:source>Source &amp; statement</dc:source><dc:title>SMH</dc:title><austlit:title>Test</austlit:title><layout:x rdf:datatype="xsd:int">414</layout:x><layout:y rdf:datatype="xsd:int">33</layout:y><layout:width rdf:datatype="xsd:int">220</layout:width><layout:height rdf:datatype="xsd:int">164</layout:height><layout:originalHeight rdf:datatype="xsd:int">-1</layout:originalHeight><layout:abstractPreview rdf:datatype="xsd:int">1</layout:abstractPreview><layout:orderIndex rdf:datatype="xsd:int">2</layout:orderIndex></rdf:Description><ore:ResourceMap rdf:about="http://austlit.edu.au/auselit/ore/903F9538-4871-4BBF-A4A1-475B412FB7A8"><dc:format>application/rdf+xml;charset=UTF-8</dc:format><dc:title>Two poems about Pangolins</dc:title><layout:x rdf:datatype="xsd:int">121</layout:x><layout:y rdf:datatype="xsd:int">151</layout:y><layout:width rdf:datatype="xsd:int">201</layout:width><layout:height rdf:datatype="xsd:int">106</layout:height><layout:originalHeight rdf:datatype="xsd:int">-1</layout:originalHeight><layout:orderIndex rdf:datatype="xsd:int">1</layout:orderIndex></ore:ResourceMap><rdf:Description rdf:about="http://austlit.edu.au/auselit/ids/e8c57a15-de01-92f2-b27b-b4bc9eb0d6ac"><dc:title>Example placeholder</dc:title><layout:x rdf:datatype="xsd:int">455</layout:x><layout:y rdf:datatype="xsd:int">543</layout:y><layout:width rdf:datatype="xsd:int">130</layout:width><layout:height rdf:datatype="xsd:int">48</layout:height><layout:originalHeight rdf:datatype="xsd:int">50</layout:originalHeight><layout:orderIndex rdf:datatype="xsd:int">4</layout:orderIndex><layout:isPlaceholder rdf:datatype="xsd:int">1</layout:isPlaceholder></rdf:Description></rdf:RDF>',
  simpleWithOwner : "<rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:dc10=\"http://purl.org/dc/elements/1.1/\" xmlns:dcterms=\"http://purl.org/dc/terms/\" xmlns:ore=\"http://www.openarchives.org/ore/terms/\" xmlns:foaf=\"http://xmlns.com/foaf/0.1/\" xmlns:layout=\"http://maenad.itee.uq.edu.au/lore/layout.owl#\" xmlns:xhtml=\"http://www.w3.org/1999/xhtml\" xmlns:annotea=\"http://www.w3.org/2000/10/annotation-ns#\" xmlns:annotype=\"http://www.w3.org/2000/10/annotationType#\" xmlns:thread=\"http://www.w3.org/2001/03/thread#\" xmlns:annoreply=\"http://www.w3.org/2001/12/replyType#\" xmlns:vanno=\"http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#\" xmlns:sparql=\"http://www.w3.org/2005/sparql-results#\" xmlns:http=\"http://www.w3.org/1999/xx/http#\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema#\" xmlns:oac=\"http://www.openannotation.org/ns/\" xmlns:owl=\"http://www.w3.org/2002/07/owl#\" xmlns:rdfs=\"http://www.w3.org/2000/01/rdf-schema#\" xmlns:austlit=\"http://austlit.edu.au/owl/austlit.owl#\">\r\n" + 
    "   <ore:ResourceMap rdf:about=\"http://doc.localhost/rem/344385ed-2a79-4598-8a99-27be35e0b773\">\r\n" + 
    "       <ore:describes rdf:resource=\"http://doc.localhost/rem/344385ed-2a79-4598-8a99-27be35e0b773#aggregation\"/>\r\n" + 
    "       <dcterms:modified rdf:datatype=\"http://purl.org/dc/terms/W3CDTF\">2011-03-09T16:47:22+10:00</dcterms:modified>\r\n" + 
    "       <dcterms:created rdf:datatype=\"http://purl.org/dc/terms/W3CDTF\">2011-03-09T16:39:33+10:00</dcterms:created>\r\n" + 
    "       <dc:creator>Damien Ayers</dc:creator>\r\n" + 
    "       <user xmlns=\"http://auselit.metadata.net/lorestore/\" rdf:resource=\"http://doc.localhost/users/ore\"/>" + 
    "   </ore:ResourceMap>\r\n" + 
    "   <ore:Aggregation rdf:about=\"http://doc.localhost/rem/344385ed-2a79-4598-8a99-27be35e0b773#aggregation\">\r\n" + 
    "       <dcterms:modified>2011-03-09T16:47:22+10:00</dcterms:modified>\r\n" + 
    "       <ore:aggregates rdf:resource=\"http://omad.net/\"/>\r\n" + 
    "   </ore:Aggregation>\r\n" + 
    "   <rdf:Description rdf:about=\"http://omad.net/\">\r\n" + 
    "       <dc:title>omad.net</dc:title>\r\n" + 
    "       <dc:format>text/html; charset=UTF-8</dc:format>\r\n" + 
    "       <layout:x>40</layout:x>\r\n" + 
    "       <layout:y>40</layout:y>\r\n" + 
    "       <layout:width>220</layout:width>\r\n" + 
    "       <layout:height>170</layout:height>\r\n" + 
    "       <layout:originalHeight>-1</layout:originalHeight>\r\n" + 
    "       <layout:orderIndex>1</layout:orderIndex>\r\n" + 
    "   </rdf:Description>\r\n" + 
    "</rdf:RDF>",
    simpleLockedResourceMap : "<rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:dc10=\"http://purl.org/dc/elements/1.1/\" xmlns:dcterms=\"http://purl.org/dc/terms/\" xmlns:ore=\"http://www.openarchives.org/ore/terms/\" xmlns:foaf=\"http://xmlns.com/foaf/0.1/\" xmlns:layout=\"http://maenad.itee.uq.edu.au/lore/layout.owl#\" xmlns:xhtml=\"http://www.w3.org/1999/xhtml\" xmlns:annotea=\"http://www.w3.org/2000/10/annotation-ns#\" xmlns:annotype=\"http://www.w3.org/2000/10/annotationType#\" xmlns:thread=\"http://www.w3.org/2001/03/thread#\" xmlns:annoreply=\"http://www.w3.org/2001/12/replyType#\" xmlns:vanno=\"http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#\" xmlns:sparql=\"http://www.w3.org/2005/sparql-results#\" xmlns:http=\"http://www.w3.org/1999/xx/http#\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema#\" xmlns:oac=\"http://www.openannotation.org/ns/\" xmlns:owl=\"http://www.w3.org/2002/07/owl#\" xmlns:rdfs=\"http://www.w3.org/2000/01/rdf-schema#\" xmlns:austlit=\"http://austlit.edu.au/owl/austlit.owl#\" xmlns:lorestore=\"http://auselit.metadata.net/lorestore/\">\r\n" + 
    "   <ore:ResourceMap rdf:about=\"http://doc.localhost/rem/344385ed-2a79-4598-8a99-27be35e0b773\">\r\n" + 
    "       <ore:describes rdf:resource=\"http://doc.localhost/rem/344385ed-2a79-4598-8a99-27be35e0b773#aggregation\"/>\r\n" + 
    "       <dcterms:modified rdf:datatype=\"http://purl.org/dc/terms/W3CDTF\">2011-03-09T16:47:22+10:00</dcterms:modified>\r\n" + 
    "       <dcterms:created rdf:datatype=\"http://purl.org/dc/terms/W3CDTF\">2011-03-09T16:39:33+10:00</dcterms:created>\r\n" + 
    "       <dc:creator>Damien Ayers</dc:creator>\r\n" + 
    "       <lorestore:isLocked>true</lorestore:isLocked>\r\n" + 
    "   </ore:ResourceMap>\r\n" + 
    "   <ore:Aggregation rdf:about=\"http://doc.localhost/rem/344385ed-2a79-4598-8a99-27be35e0b773#aggregation\">\r\n" + 
    "       <dcterms:modified>2011-03-09T16:47:22+10:00</dcterms:modified>\r\n" + 
    "       <ore:aggregates rdf:resource=\"http://omad.net/\"/>\r\n" + 
    "   </ore:Aggregation>\r\n" + 
    "   <rdf:Description rdf:about=\"http://omad.net/\">\r\n" + 
    "       <dc:title>omad.net</dc:title>\r\n" + 
    "       <dc:format>text/html; charset=UTF-8</dc:format>\r\n" + 
    "       <layout:x>40</layout:x>\r\n" + 
    "       <layout:y>40</layout:y>\r\n" + 
    "       <layout:width>220</layout:width>\r\n" + 
    "       <layout:height>170</layout:height>\r\n" + 
    "       <layout:originalHeight>-1</layout:originalHeight>\r\n" + 
    "       <layout:orderIndex>1</layout:orderIndex>\r\n" + 
    "   </rdf:Description>\r\n" + 
    "</rdf:RDF>",
    badNoResourceMap : "<rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:dc10=\"http://purl.org/dc/elements/1.1/\" xmlns:dcterms=\"http://purl.org/dc/terms/\" xmlns:ore=\"http://www.openarchives.org/ore/terms/\" xmlns:foaf=\"http://xmlns.com/foaf/0.1/\" xmlns:layout=\"http://maenad.itee.uq.edu.au/lore/layout.owl#\" xmlns:xhtml=\"http://www.w3.org/1999/xhtml\" xmlns:annotea=\"http://www.w3.org/2000/10/annotation-ns#\" xmlns:annotype=\"http://www.w3.org/2000/10/annotationType#\" xmlns:thread=\"http://www.w3.org/2001/03/thread#\" xmlns:annoreply=\"http://www.w3.org/2001/12/replyType#\" xmlns:vanno=\"http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#\" xmlns:sparql=\"http://www.w3.org/2005/sparql-results#\" xmlns:http=\"http://www.w3.org/1999/xx/http#\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema#\" xmlns:oac=\"http://www.openannotation.org/ns/\" xmlns:owl=\"http://www.w3.org/2002/07/owl#\" xmlns:rdfs=\"http://www.w3.org/2000/01/rdf-schema#\" xmlns:austlit=\"http://austlit.edu.au/owl/austlit.owl#\">\r\n" + 
    "   <ore:Aggregation rdf:about=\"http://doc.localhost/rem/344385ed-2a79-4598-8a99-27be35e0b773#aggregation\">\r\n" + 
    "       <dcterms:modified>2011-03-09T16:47:22+10:00</dcterms:modified>\r\n" + 
    "       <ore:aggregates rdf:resource=\"http://omad.net/\"/>\r\n" + 
    "   </ore:Aggregation>\r\n" + 
    "   <rdf:Description rdf:about=\"http://omad.net/\">\r\n" + 
    "       <dc:title>omad.net</dc:title>\r\n" + 
    "       <dc:format>text/html; charset=UTF-8</dc:format>\r\n" + 
    "       <layout:x>40</layout:x>\r\n" + 
    "       <layout:y>40</layout:y>\r\n" + 
    "       <layout:width>220</layout:width>\r\n" + 
    "       <layout:height>170</layout:height>\r\n" + 
    "       <layout:originalHeight>-1</layout:originalHeight>\r\n" + 
    "       <layout:orderIndex>1</layout:orderIndex>\r\n" + 
    "   </rdf:Description>\r\n" + 
    "</rdf:RDF>",
    causesError: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + 
    "<rdf:RDF\n" + 
    "   xmlns:lorerel=\"http://austlit.edu.au/owl/austlitore.owl#\"\n" + 
    "   xmlns:rda=\"http://RDVocab.info/Elements#\"\n" + 
    "   xmlns:annoreply=\"http://www.w3.org/2001/12/replyType#\"\n" + 
    "   xmlns:xhtml=\"http://www.w3.org/1999/xhtml\"\n" + 
    "   xmlns:ns22=\"http://RDVocab.info/Elements/\"\n" + 
    "   xmlns:danno=\"http://metadata.net/2009/09/danno#\"\n" + 
    "   xmlns:ns23=\"http://rdvocab.info/Elements/\"\n" + 
    "   xmlns:vanno=\"http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#\"\n" + 
    "   xmlns:annotea=\"http://www.w3.org/2000/10/annotation-ns#\"\n" + 
    "   xmlns:ore=\"http://www.openarchives.org/ore/terms/\"\n" + 
    "   xmlns:ns24=\"http://RDVocab.info/\"\n" + 
    "   xmlns:sparql=\"http://www.w3.org/2005/sparql-results#\"\n" + 
    "   xmlns:dcterms=\"http://purl.org/dc/terms/\"\n" + 
    "   xmlns:rdfs=\"http://www.w3.org/2000/01/rdf-schema#\"\n" + 
    "   xmlns:layout=\"http://maenad.itee.uq.edu.au/lore/layout.owl#\"\n" + 
    "   xmlns:thread=\"http://www.w3.org/2001/03/thread#\"\n" + 
    "   xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"\n" + 
    "   xmlns:lorestore=\"http://auselit.metadata.net/oreextensions/\"\n" + 
    "   xmlns:austlit=\"http://austlit.edu.au/owl/austlit.owl#\"\n" + 
    "   xmlns:annotype=\"http://www.w3.org/2000/10/annotationType#\"\n" + 
    "   xmlns:oac=\"http://www.openannotation.org/ns/\"\n" + 
    "   xmlns:dc=\"http://purl.org/dc/elements/1.1/\"\n" + 
    "   xmlns:ns16=\"http://purl.utwente.nl/ns/escape-system.owl#\"\n" + 
    "   xmlns:dc1_0=\"http://purl.org/dc/elements/1.0/\"\n" + 
    "   xmlns:ns17=\"http://swrc.ontoware.org/ontology#\"\n" + 
    "   xmlns:foaf=\"http://xmlns.com/foaf/0.1/\"\n" + 
    "   xmlns:frbr=\"http://purl.org/vocab/frbr/core#\"\n" + 
    "   xmlns:http=\"http://www.w3.org/1999/xx/http#\"\n" + 
    "   xmlns:xsd=\"http://www.w3.org/2001/XMLSchema#\"\n" + 
    "   xmlns:owl=\"http://www.w3.org/2002/07/owl#\">\n" + 
    "\n" + 
    "<rdf:Description rdf:about=\"http://www.austlit.edu.au/run?ex=ShowAgent&amp;agentId=A8T3\">\n" + 
    "   <dc:title>AustLit Agent: Nat Phillips' Stiffy and Mo Revue Company</dc:title>\n" + 
    "       <dc:relation rdf:resource=\"http://www.austlit.edu.au/run?ex=ShowWork&amp;workId=C%23Ahy&amp;mode=full\"/>\n" + 
    "   <dc:relation rdf:resource=\"http://www.austlit.edu.au/run?ex=ShowAgent&amp;agentId=A9pO&amp;mode=full\"/>\n" + 
    "   <dc:relation rdf:resource=\"http://www.austlit.edu.au/run?ex=ShowAgent&amp;agentId=A9mn&amp;mode=full\"/>\n" + 
    "   <dc:relation rdf:resource=\"http://www.austlit.edu.au/run?ex=ShowAgent&amp;agentId=A9tr&amp;mode=full\"/>\n" + 
    "   <dc:relation rdf:resource=\"http://www.austlit.edu.au/run?ex=ShowAgent&amp;agentId=A9PG&amp;mode=full\"/>\n" + 
    "   <dc:relation rdf:resource=\"http://www.austlit.edu.au/run?ex=ShowAgent&amp;agentId=A9UU&amp;mode=full\"/>\n" + 
    "   <dc:relation rdf:resource=\"http://www.austlit.edu.au/run?ex=ShowWork&amp;workId=C%23AtF&amp;mode=full\"/>\n" + 
    "</rdf:Description>\n" + 
    "\n" + 
    "<rdf:Description rdf:about=\"http://austlit.edu.au/auselit/ore/7dc3a82c-bcd5-4ee0-bd23-2643c443f5e7\">\n" + 
    "   <ore:describes rdf:resource=\"http://austlit.edu.au/auselit/ore/7dc3a82c-bcd5-4ee0-bd23-2643c443f5e7#aggregation\"/>\n" + 
    "   <rdf:type rdf:resource=\"http://www.openarchives.org/ore/terms/ResourceMap\"/>\n" + 
    "   <dc:creator>Aus-e-Lit relationship miner</dc:creator>\n" + 
    "   <dc:title>Mined relationships for Nat Phillips' Stiffy and Mo Revue Company</dc:title>\n" + 
    "   <dcterms:modified rdf:datatype=\"http://purl.org/dc/terms/W3CDTF\">2010-07-06T11:18:38+1000</dcterms:modified>\n" + 
    "   <dcterms:created rdf:datatype=\"http://purl.org/dc/terms/W3CDTF\">2010-07-06T11:18:38+1000</dcterms:created>\n" + 
    "</rdf:Description>\n" + 
    "\n" + 
    "<rdf:Description rdf:about=\"http://austlit.edu.au/auselit/ore/7dc3a82c-bcd5-4ee0-bd23-2643c443f5e7#aggregation\">\n" + 
    "   <rdf:type rdf:resource=\"http://www.openarchives.org/ore/terms/Aggregation\"/>\n" + 
    "   <ore:aggregates rdf:resource=\"http://www.austlit.edu.au/run?ex=ShowWork&amp;workId=C%23Ahy&amp;mode=full\"/>\n" + 
    "   <ore:aggregates rdf:resource=\"http://www.austlit.edu.au/run?ex=ShowWork&amp;workId=C%23Aq%7B\"/>\n" + 
    "   <ore:aggregates rdf:resource=\"http://www.austlit.edu.au/run?ex=ShowAgent&amp;agentId=A9mn\"/>\n" + 
    "   <ore:aggregates rdf:resource=\"http://www.austlit.edu.au/run?ex=ShowAgent&amp;agentId=A9pO&amp;mode=full\"/>\n" + 
    "   <ore:aggregates rdf:resource=\"http://www.austlit.edu.au/run?ex=ShowAgent&amp;agentId=A9mn&amp;mode=full\"/>\n" + 
    "   <ore:aggregates rdf:resource=\"http://www.austlit.edu.au/run?ex=ShowAgent&amp;agentId=A9tr&amp;mode=full\"/>\n" + 
    "   <ore:aggregates rdf:resource=\"http://www.austlit.edu.au/run?ex=ShowAgent&amp;agentId=A9PG&amp;mode=full\"/>\n" + 
    "   <ore:aggregates rdf:resource=\"http://www.austlit.edu.au/run?ex=ShowAgent&amp;agentId=A9UU&amp;mode=full\"/>\n" + 
    "   <ore:aggregates rdf:resource=\"http://www.austlit.edu.au/run?ex=ShowWork&amp;workId=C%23AtF&amp;mode=full\"/>\n" + 
    "</rdf:Description>\n" + 
    "\n" + 
    "</rdf:RDF>"
    
  
};