<?xml version="1.0"?> 

<xsl:stylesheet version="1.0"
	xmlns="http://www.w3.org/ns/SMIL"
	xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:dcterms="http://purl.org/dc/terms/"
	xmlns:ore="http://www.openarchives.org/ore/terms/"
	xmlns:foaf="http://xmlns.com/foaf/0.1/"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:foxml="info:fedora/fedora-system:def/foxml#"
	exclude-result-prefixes="rdf dc dcterms ore foaf xsl">

	<xsl:output method="xml" indent="yes"/>
	<xsl:strip-space elements="*"/>
	<xsl:param name="coid" select="'demo:1234'"/>
	
	<xsl:template match="/">
		<foxml:digitalObject VERSION="1.1" PID="{$coid}"
 			xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 			xsi:schemaLocation="info:fedora/fedora-system:def/foxml# http://www.fedora.info/definitions/1/0/foxml1-1.xsd">
 			<foxml:objectProperties>
    			<foxml:property NAME="info:fedora/fedora-system:def/model#state" VALUE="A"/>
    			<foxml:property NAME="info:fedora/fedora-system:def/model#label" VALUE="Compound object exported from LORE"/>
  			</foxml:objectProperties>
 			<xsl:apply-templates select="//rdf:Description[@rdf:about='#aggregation']/ore:aggregates"/>
 			<xsl:apply-templates/>
 		</foxml:digitalObject>
	</xsl:template>
	
	<!--  create a data stream for each aggregated resource -->
	<xsl:template match="rdf:Description[@rdf:about='#aggregation']/ore:aggregates">
		<xsl:variable name="aggregates" select="@rdf:resource"/>
		<xsl:variable name="aggnum" select="position()"/>
		<xsl:variable name="mimetype">
			<xsl:choose>
				<xsl:when test="//rdf:Description[@rdf:about = $aggregates]/dc:format"><xsl:value-of select="//rdf:Description[@rdf:about = $aggregates]/dc:format"/></xsl:when>
				<xsl:otherwise>text/html</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="label">
			<xsl:choose>
				<xsl:when test="//rdf:Description[@rdf:about = $aggregates]/dc:title">
					<xsl:value-of select="//rdf:Description[@rdf:about = $aggregates]/dc:title"/>
				</xsl:when>
				<xsl:otherwise><xsl:value-of select="$aggregates"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<foxml:datastream CONTROL_GROUP="R" ID="OBJ.{$aggnum}" STATE="A">
	    	<foxml:datastreamVersion ID="OBJ.{$aggnum}.0" MIMETYPE="{$mimetype}"
	       		LABEL="{$label}">
	      		<foxml:contentLocation REF="{$aggregates}" TYPE="URL"/>
	    	</foxml:datastreamVersion>
	  	</foxml:datastream>
	</xsl:template>
	
	<!--  dc datastream and rels-int for the entire resource map -->
	<xsl:template match="rdf:Description[ore:describes[@rdf:resource='#aggregation']]">
		<foxml:datastream ID="DC" STATE="A" CONTROL_GROUP="X">
	    	<foxml:datastreamVersion FORMAT_URI="http://www.openarchives.org/OAI/2.0/oai_dc/"
	      		ID="DC.0" MIMETYPE="text/xml"
	      		LABEL="Dublin Core Record for this object">
		      	<foxml:xmlContent>
			       	<oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" xmlns:dc="http://purl.org/dc/elements/1.1/">
				        <xsl:for-each select="*">
				        	<xsl:copy-of select="."/>
				        </xsl:for-each>  
			        </oai_dc:dc>
		      	</foxml:xmlContent>
	    	</foxml:datastreamVersion>
	  	</foxml:datastream>
  
  <foxml:datastream ID="RELS-INT" STATE="A" CONTROL_GROUP="X" VERSIONABLE="true">
		<foxml:datastreamVersion ID="RELS-INT.0" MIMETYPE="text/xml" LABEL="Fedora Internal Object Relationship Metadata">
			<foxml:xmlContent>
				<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
				xmlns:ore="http://www.openarchives.org/ore/terms/">
					<rdf:Description rdf:about="info:fedora/{$coid}">
						<rdf:type rdf:resource="http://www.openarchives.org/ore/terms/Aggregation"/>
						<xsl:for-each select="//rdf:Description[@rdf:about='#aggregation']/ore:aggregates">
							<ore:aggregates rdf:resource="info:fedora/{$coid}/OBJ.{position()}"/>
						</xsl:for-each>
					</rdf:Description>
				</rdf:RDF>
			</foxml:xmlContent>
		</foxml:datastreamVersion>
	</foxml:datastream>
	</xsl:template>
	
	<xsl:template match="rdf:Description">
	</xsl:template>
</xsl:stylesheet>