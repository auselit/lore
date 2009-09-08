<?xml version="1.0"?> 

<xsl:stylesheet version="1.0"
	xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:dcterms="http://purl.org/dc/terms/"
	xmlns:ore="http://www.openarchives.org/ore/terms/"
	xmlns:foaf="http://xmlns.com/foaf/0.1/"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	exclude-result-prefixes="rdf dc dcterms ore foaf xsl">
	<xsl:param name="width" select="'100%'"/>
	<xsl:param name="height" select="'100%'"/>
	<xsl:variable name="mwidth" select="'150'"/>
	
	<xsl:output method="html" indent="yes"/>
	<xsl:strip-space elements="*"/>

	<xsl:template match="/">
		<xsl:apply-templates select="//rdf:Description[ore:describes]"/>
		<xsl:apply-templates select="//rdf:Description[@rdf:about='#aggregation']/ore:aggregates"/>
		
	</xsl:template>
	
	<xsl:template match="rdf:Description[ore:describes]">
		<!--  display title slide -->
		<xsl:variable name="title">
			<xsl:choose>
				<xsl:when test="dc:title"><xsl:value-of select="dc:title"/></xsl:when>
				<xsl:otherwise>Compound Object</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<div class="item" title="{$title} Slideshow">
		<div style="text-align:left; padding:20px">
		<xsl:for-each select="*">
		<xsl:if test="text() and not (local-name() = 'creator' or local-name() = 'modified' or local-name() = 'created')">
		<div style="padding-top:1em;">
		<span style="font-weight:bold"><xsl:call-template name="capitalize-first"><xsl:with-param name="str" select="local-name()"/></xsl:call-template>: </span>
		<xsl:value-of select="."/>
		</div>
		</xsl:if>	
		</xsl:for-each>
		
		<div style="color:#51666b;padding-top:2em;font-size:smaller">This compound object was created by <xsl:value-of select="dc:creator"/>
		on <xsl:value-of select="dcterms:created"/> 
		<xsl:if test="dcterms:modified"> and last updated on <xsl:value-of select="dcterms:modified"/></xsl:if>.</div>
		</div>
		</div>
	</xsl:template>
	
	<!--  display each aggregated resource -->
	<xsl:template match="rdf:Description[@rdf:about='#aggregation']/ore:aggregates">
			<xsl:variable name="about" select="@rdf:resource"/>
			
			<xsl:variable name="title" select="//rdf:Description[@rdf:about = $about]/dc:title[1]"/>
			
			<div class="item" title="{$title}">
				<xsl:apply-templates mode="preview" select="//rdf:Description[@rdf:about = $about]"/>
				<div style='width:{$mwidth}px;height:{$height}px' class='itemdesc'>
					<xsl:variable name="linkLabel">
						<xsl:choose>
							<xsl:when test="contains($about,'ShowAgent')">Agent record</xsl:when>
							<xsl:when test="contains($about,'ShowWork')">Work record</xsl:when>
							<xsl:otherwise>resource</xsl:otherwise>
						</xsl:choose>
					</xsl:variable> 
					 
					
					 <div class="desctitle">
					  <a href='#' onclick="lore.util.launchTab('{$about}');"><img src="../../skin/icons/page_go.png" title="Open {$linkLabel} in a new tab"/></a>
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
    			<img src="{$about}" alt="{$about}" style="max-height:{$height}"/> 
    		</xsl:when>
    		<xsl:when test="contains($format,'application/rdf+xml')">
    			<!--  most likely another compound object -->
    			
    			<p style='color:#51666b;margin-top:3em'>This resource is an RDF/XML document. No preview available</p> 
    			
    		</xsl:when>
    		<xsl:otherwise>
    			<!--  minus 10 to account for 5px padding on each side of itemdesc -->
    			<object data="{$about}"  height="{$height}" width="{($width - $mwidth) - 10}"></object>
    		</xsl:otherwise>
    	</xsl:choose>
		</div>		
	</xsl:template>

	<xsl:template match="rdf:Description" mode="preview"></xsl:template>
	
	<xsl:template name="capitalize-first">
		<xsl:param name="str"/>
		<xsl:variable name="up" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"/>
		<xsl:variable name="lo" select="'abcdefghijklmnopqrstuvwxyz'"/>
		<xsl:value-of select="translate(substring($str,1,1),$lo,$up)"/><xsl:value-of select="substring($str,2)"/>
	</xsl:template>
</xsl:stylesheet>