<?xml version="1.0"?> 

<xsl:stylesheet version="1.0"
	xmlns="http://www.w3.org/ns/SMIL"
	xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:dcterms="http://purl.org/dc/terms/"
	xmlns:ore="http://www.openarchives.org/ore/terms/"
	xmlns:foaf="http://xmlns.com/foaf/0.1/"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	exclude-result-prefixes="rdf dc dcterms ore foaf xsl">

	<xsl:output method="xml" indent="yes"/>
	<xsl:strip-space elements="*"/>

	<xsl:template match="/">
	<smil>
		<head>
			<xsl:apply-templates mode="head" />
			<layout>
				<root-layout height="768" width="1024" background-color="#ffffff"
					title="Slideshow" />
				<region id="img_r" left="15" top="10" width="100%" height="400px"
					background-color="#ffffff" />
				<region id="txt_r" left="15" top="465" width="700px"
					background-color="#ffffff" z-index="3" />
			</layout>
			<transition id="fade1" dur="2s"  type="fade" />
			
		</head>
		<body>
			<seq dur="indefinite">
				<par id="slideshow" repeatCount="50">
					<seq>
						<xsl:apply-templates select="//rdf:Description[@rdf:about]/ore:aggregates"/>
					</seq>
				</par>
				<!-- create a link to start slideshow again -->
				<par>
					<img region="img_r" src="../../skin/icons/ore/action_go.gif">
						<area id="back" region="img_r" href="#slideshow" />
					</img>
					<smilText region="txt_r">Play slideshow again:</smilText>
				</par>
			</seq>
		</body>
	</smil>
	</xsl:template>
	
	<!--  display each aggregated resource -->
	<xsl:template match="rdf:Description[@rdf:about]/ore:aggregates">
			<xsl:variable name="aggregates" select="@rdf:resource"/>
			<par dur="2s">
			<smilText textFontSize="9px" textFontWeight="bold" region="txt_r">
				<!--  <xsl:text>URL: </xsl:text><xsl:value-of select="$aggregates"/><br/>-->
				<xsl:for-each select="//rdf:Description[@rdf:about = $aggregates]">
					<xsl:variable name="theChild" select="child::node()[local-name()!='format' and namespace-uri()!='http://maenad.itee.uq.edu.au/lore/layout.owl#']"/>
					<xsl:if test="$theChild">
						<xsl:value-of select="local-name($theChild)"/><xsl:text>: </xsl:text>
						<xsl:value-of select="$theChild/@rdf:resource"/>
						<xsl:value-of select="$theChild"/><br/>
					</xsl:if>
				</xsl:for-each>
			</smilText>
			<xsl:apply-templates mode="preview" select="//rdf:Description[@rdf:about = $aggregates]"/>
			</par>
	</xsl:template>
	
	<!--  for html resources, generate a link only -->
	<xsl:template match="rdf:Description[contains(dc:format,'text/html')]" mode="preview">
		<xsl:variable name="about" select="@rdf:about"/>
		<xsl:variable name="title" select="//rdf:Description[@rdf:about = $about]/dc:title"/>
          <smilText region="img_r" type="text/html" dur="2s">
          <xsl:text>Online resource: </xsl:text>
          		  <xsl:choose>
          			<xsl:when test="$title">
          				<xsl:value-of select="$title"/><xsl:text> (</xsl:text>
          				<xsl:value-of select="$about"/><xsl:text>)</xsl:text>
          			</xsl:when>
          			<xsl:otherwise>
          				<xsl:value-of select="$about"/>
          			  </xsl:otherwise>
          		</xsl:choose>
          	<area external="true">
          	<xsl:attribute name="href"><xsl:value-of select="$about"/> </xsl:attribute>
          	</area>
          </smilText>		
	</xsl:template>
	
	<!--  show images -->
	<xsl:template match="rdf:Description[contains(dc:format,'image')]" mode="preview">
		<xsl:variable name="about" select="@rdf:about"/>
		<img  fit="meet" region = "img_r" src="{$about}" type="{dc:format}"/>
	</xsl:template>
	
	
	<!--  the metadata for the entire resource map -->
	<xsl:template match="rdf:Description[ore:describes[@rdf:resource='#aggregation']]" mode="head">
		<xsl:variable name="title">
			<xsl:choose>
				<xsl:when test="dc:title">
					<xsl:value-of select="dc:title"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="@rdf:about"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<meta content="{$title}" name="title"/>
		<meta content="{dc:creator}" name="author"/>
		<xsl:if test="dcterms:abstract">
			<meta content="{dcterms:abstract}" name="abstract"/>
		</xsl:if>
		<!-- <meta content="" name="copyright"/>-->
	</xsl:template>

	<!-- templates to disable output in these modes -->

	<xsl:template match="rdf:Description" mode="preview">
	</xsl:template>
	<xsl:template match="rdf:Description" mode="head">
	</xsl:template>
	<!-- 
	http://images.pageglimpse.com/v1/thumbnails?url=http://austlit.edu.au/&size=large&devkey=4344f19f7e0f9a31e1e590c66c1c0d05
	 -->
</xsl:stylesheet>