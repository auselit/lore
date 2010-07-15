<?xml version="1.0"?> 

<xsl:stylesheet version="1.0"
	xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:dcterms="http://purl.org/dc/terms/"
	xmlns:ore="http://www.openarchives.org/ore/terms/"
	xmlns:foaf="http://xmlns.com/foaf/0.1/"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:sparql="http://www.w3.org/2005/sparql-results#"
	exclude-result-prefixes="rdf dc dcterms ore foaf xsl">
	<xsl:key name="results-key" match="sparql:result" use="sparql:binding[@name='something']/sparql:uri" />
	<xsl:strip-space elements="*"/>
	<xsl:param name="subj" select="'http://austlit.edu.au/'"/>
	<xsl:param name="title"/>
	<xsl:param name="isCompoundObject" select="'n'"/>
	<xsl:output method="text"/>
	<!--  [{"id":"node0","name":remid,"data":{'$dim': 6,'$color': 'orange', '$type': 'circle'},"adjacencies":
	[{"nodeTo":"node1","data":{"weight":3}},{"nodeTo":"node2","data":{"weight":3}},
	{"nodeTo":"node3","data":{"weight":3}},{"nodeTo":"node4","data":{"weight":1}},
	{"nodeTo":"node5","data":{"weight":1}}]},
	{"id":"node1","name":"node1 name","data":[{"key":"weight","value":13.077119090372014},{"key":"some other key","value":"some other value"}],"adjacencies":[{"nodeTo":"node0","data":{"weight":3}},{"nodeTo":"node2","data":{"weight":1}},{"nodeTo":"node3","data":{"weight":3}},{"nodeTo":"node4","data":{"weight":1}},{"nodeTo":"node5","data":{"weight":1}}]},{"id":"node2","name":"node2 name","data":[{"key":"weight","value":24.937383149648717},{"key":"some other key","value":"some other value"}],"adjacencies":[{"nodeTo":"node0","data":{"weight":3}},{"nodeTo":"node1","data":{"weight":1}},{"nodeTo":"node3","data":{"weight":3}},{"nodeTo":"node4","data":{"weight":3}},{"nodeTo":"node5","data":{"weight":1}}]},{"id":"node3","name":"node3 name","data":[{"key":"weight","value":10.53272740718869},{"key":"some other key","value":"some other value"}],"adjacencies":[{"nodeTo":"node0","data":{"weight":3}},{"nodeTo":"node1","data":{"weight":3}},{"nodeTo":"node2","data":{"weight":3}},{"nodeTo":"node4","data":{"weight":1}},{"nodeTo":"node5","data":{"weight":3}}]},{"id":"node4","name":"node4 name","data":[{"key":"weight","value":1.3754347037767345},{"key":"some other key","value":"some other value"}],"adjacencies":[{"nodeTo":"node0","data":{"weight":1}},{"nodeTo":"node1","data":{"weight":1}},{"nodeTo":"node2","data":{"weight":3}},{"nodeTo":"node3","data":{"weight":1}},{"nodeTo":"node5","data":{"weight":3}}]},{"id":"node5","name":"node5 name","data":{'type': 'rem'},"adjacencies":[{"nodeTo":"node0","data":{"weight":1}},{"nodeTo":"node1","data":{"weight":1}},{"nodeTo":"node2","data":{"weight":1}},{"nodeTo":"node3","data":{"weight":3}},{"nodeTo":"node4","data":{"weight":3}}]}];
 -->
 	
 	<xsl:template match="sparql:results">
 	  <!--  <binding name='something'>
        <uri>http://austlit.edu.au/rem/kellypics</uri>
      </binding>
      <binding name='somerel'>
        <uri q:qname='ore:ResourceMap'>http://www.openarchives.org/ore/terms/ResourceMap</uri>
      </binding>
      <binding name='sometitle'>

        <literal>Ned Kelly Pictures</literal>
      </binding>-->
      
      <!--  create a node for the base subj, with adjacencies to each something -->
      <xsl:text>[{"id": "</xsl:text><xsl:value-of select="$subj"/><xsl:text>", "name": "</xsl:text>
      <xsl:choose>
      <xsl:when test="$title">
      	<xsl:value-of select="$title"/>
      </xsl:when>
      <xsl:otherwise>
      <xsl:choose>
        <xsl:when test="$isCompoundObject = 'y'">Untitled Compound Object</xsl:when>
        <xsl:otherwise><xsl:value-of select="$subj"/></xsl:otherwise>
        </xsl:choose>
      </xsl:otherwise>
      </xsl:choose>
      
      <xsl:text>", "data": {"$dim": 6, "$color": "red", "$type": "</xsl:text>
      <xsl:choose>
      	<xsl:when test="$isCompoundObject = 'y'">circle</xsl:when>
      	<xsl:otherwise>square</xsl:otherwise>
      </xsl:choose>
      <xsl:text>"}, "adjacencies": [</xsl:text>
      <xsl:for-each select="sparql:result">
      <xsl:text>{"nodeTo":"</xsl:text>
      <xsl:value-of select="sparql:binding[@name='something']/sparql:uri"/>
      <xsl:text>","data":{"rel":"</xsl:text>
      <xsl:value-of select="sparql:binding[@name='somerel']/sparql:uri"/>
      <xsl:text>"}}</xsl:text>
      <xsl:if test="position()!=last()">
      	<xsl:text>,</xsl:text>
      </xsl:if>
      </xsl:for-each>
      <xsl:text>
      ]}
      </xsl:text>
      <xsl:if test="sparql:result">
      	<xsl:text>,</xsl:text>
      </xsl:if>
      
      <!--  create a node for each something -->
      <xsl:for-each select="sparql:result[count(. | key('results-key',sparql:binding[@name='something']/sparql:uri)[1]) = 1]">
        <xsl:variable name="theuri" select="sparql:binding[@name='something']/sparql:uri"/>
        <xsl:variable name="isCO">
            <xsl:choose>
                <xsl:when test="key('results-key',$theuri)/sparql:binding[@name='sometype']/sparql:uri = 'http://www.openarchives.org/ore/terms/ResourceMap'">y</xsl:when>
                <xsl:otherwise>n</xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
      	
      	<xsl:text>{"id" : "</xsl:text><xsl:value-of select="$theuri"/>
      	<xsl:text>", "data": {</xsl:text>
      	<xsl:if test="$isCO = 'y'">"$dim": 6, "$color": "orange", "$type": "circle"</xsl:if>
      	<xsl:variable name="creator" select="key('results-key',$theuri)/sparql:binding[@name='creator']"/>
      	<xsl:if test="$creator">,"creator": "<xsl:value-of select="$creator/*"/>"</xsl:if>
      	<xsl:variable name="modified" select="key('results-key',$theuri)/sparql:binding[@name='modified']"/>
      	<xsl:if test="$creator">,"modified": "<xsl:value-of select="$modified/*"/>"</xsl:if>
      	<!--  adjacencies to other nodes -->
      	<xsl:text>}, "adjacencies": [</xsl:text>
      	<xsl:for-each select="key('results-key',$theuri)/sparql:binding[@name='somethingelse'][key('results-key',sparql:uri)]">
      	 <xsl:text>{"nodeTo":"</xsl:text>
         <xsl:value-of select="sparql:uri"/>
         <xsl:text>","data":{"rel":"</xsl:text>
         <xsl:value-of select="following-sibling::sparql:binding[@name='anotherrel']/sparql:uri"/>
         <xsl:text>"}}</xsl:text>
         <xsl:if test="position()!=last()">
           <xsl:text>,</xsl:text>
         </xsl:if>
      	
      	</xsl:for-each>
      	<xsl:text>], "name": "</xsl:text>
      	<xsl:choose>
      		<xsl:when test="key('results-key',$theuri)/sparql:binding[@name='sometitle']">
      			<xsl:value-of select="key('results-key',$theuri)/sparql:binding[@name='sometitle']/sparql:literal"/>
      		</xsl:when>
      		<xsl:otherwise>
      		    <xsl:choose>
      		    <xsl:when test="$isCO='y'">Untitled Compound Object</xsl:when>
      		    <xsl:otherwise>
      			   <xsl:value-of select="$theuri"/>
      			</xsl:otherwise>
      			</xsl:choose>
      		</xsl:otherwise>
      		</xsl:choose>
      	<xsl:text>"}</xsl:text>
      	<xsl:if test="position()!=last()">
      	<xsl:text>,</xsl:text>
      	</xsl:if>
      </xsl:for-each>
      
      <xsl:text>]</xsl:text>
 	</xsl:template>
 	
 	<xsl:template match="sparql:head">
 	</xsl:template>
</xsl:stylesheet>