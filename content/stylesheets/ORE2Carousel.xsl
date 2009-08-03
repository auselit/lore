<?xml version="1.0"?> 

<xsl:stylesheet version="1.0"
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
		<xsl:apply-templates select="//rdf:Description[@rdf:about='#aggregation']/ore:aggregates"/>
	</xsl:template>
	
	<!--  display each aggregated resource -->
	<xsl:template match="rdf:Description[@rdf:about='#aggregation']/ore:aggregates">
			<xsl:variable name="about" select="@rdf:resource"/>
			
			<xsl:variable name="title" select="//rdf:Description[@rdf:about = $about]/dc:title[1]"/>
			
			<div class="item" title="{$title}">
				<xsl:apply-templates mode="preview" select="//rdf:Description[@rdf:about = $about]"/>
				<div class='itemdesc'>
					<xsl:variable name="linkLabel">
						<xsl:choose>
							<xsl:when test="contains($about,'ShowAgent')">Agent record</xsl:when>
							<xsl:when test="contains($about,'ShowWork')">Work record</xsl:when>
							<xsl:otherwise>resource</xsl:otherwise>
						</xsl:choose>
					</xsl:variable> 
					 
					
					 <div class="desctitle">
					  <a target="_blank" href="{$about}"><img src="../skin/icons/page_go.png" title="Open {$linkLabel} in a new window"/></a>
					  <xsl:text> </xsl:text>
					 <xsl:choose>
					 	<xsl:when test="$title"><xsl:value-of select="$title"/></xsl:when>
					 	<xsl:otherwise>(Untitled)</xsl:otherwise>
					 </xsl:choose>
					 <hr/>
					 </div>
					 
					 <xsl:for-each select="//rdf:Description[@rdf:about = $about]/dc:* | //rdf:Description[@rdf:about = $about]//dcterms:*">
					 	<xsl:if test="local-name() != 'title' and local-name() != 'format'">
					 	<span style='font-weight:bold;font-variant:small-caps;font-style:normal'><xsl:value-of select="local-name()"/>: </span><xsl:value-of select="."/><br/>
					 	</xsl:if>
					 </xsl:for-each>
					 </div>	
			</div>
	</xsl:template>

	<xsl:template match="rdf:Description[dc:format]" mode="preview">
		<xsl:variable name="format" select="dc:format"/>
		<xsl:variable name="about" select="@rdf:about"/>
		<div class="preview">
        <xsl:choose>
        	<xsl:when test="contains($format,'image')">
    			<img src="{$about}" alt="{$about}" style="max-height:400px"/> 
    		</xsl:when>
    		<xsl:when test="contains($format,'application/rdf+xml')">
    			<!--  most likely another compound object -->
    			
    			Load compound object
    			
    		</xsl:when>
    		<xsl:otherwise>
    			<object data="{$about}"  height="400px" width="100%"></object>
    		</xsl:otherwise>
    	</xsl:choose>
		</div>		
	</xsl:template>
	
	<xsl:template match="rdf:Description" mode="preview"></xsl:template>
</xsl:stylesheet>