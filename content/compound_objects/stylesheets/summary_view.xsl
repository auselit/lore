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

	<xsl:output method="html" indent="yes"/>
	<xsl:strip-space elements="*"/>

	<xsl:template match="/">
	
	</xsl:template>
	
	<!--  display each aggregated resource -->
	<xsl:template match="rdf:Description[@rdf:about='#aggregation']/ore:aggregates">
			<xsl:variable name="aggregates" select="@rdf:resource"/>
			
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
	</xsl:template>

	
</xsl:stylesheet>