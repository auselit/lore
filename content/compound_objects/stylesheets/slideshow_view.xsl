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
		<xsl:apply-templates select="//rdf:Description[@rdf:about]/ore:aggregates"/>
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
		<div style="height:100%;text-align:left; padding:20px;">
		
		<!-- Title, creator, date, contributor, abstract, source, coverage, rights, then the others  -->

		<div style="color:#cc0000;font-weight:bold;font-size:120%;padding-bottom:0.5em"><xsl:value-of select="$title"/></div>
		<table style="width:100%;font-size:80%;color:#465458;border-top:1px solid #cc0000;padding-top:0.5em;line-height:1.3em">
		<tr style="vertical-align:top">
		<td colspan="2">Created by <xsl:value-of select="dc:creator"/> on <xsl:value-of select="dcterms:created"/> 
		<xsl:if test="dcterms:modified">, last updated on <xsl:value-of select="dcterms:modified"/></xsl:if>
		</td>
		</tr>
		<xsl:if test="dc:contributor">
		<tr style="vertical-align:top">
		<td>
			<xsl:text>Contributor</xsl:text>
			<xsl:if test="count(dc:contributor) &gt; 1">s</xsl:if>
			<xsl:text>: </xsl:text>
		</td>
		<td style="width:90%">
			<xsl:for-each select="dc:contributor">
				<xsl:value-of select="."/>
				<xsl:if test="position() != last()">, </xsl:if>
			</xsl:for-each>
		</td></tr>
		</xsl:if>
		<xsl:for-each select="dcterms:abstract">
		<tr style="vertical-align:top">
		<td>Abstract: </td><td style="width:90%"><xsl:value-of select="."/></td>
		</tr>
		</xsl:for-each>
		<xsl:for-each select="dc:source">
		<tr style="vertical-align:top">
		<td>Source: </td><td style="width:90%"><xsl:value-of select="."/></td>
		</tr>
		</xsl:for-each>
		<xsl:for-each select="dc:coverage">
		<tr style="vertical-align:top">
		<td>Coverage: </td><td style="width:90%"><xsl:value-of select="."/></td>
		</tr>
		</xsl:for-each>
		<xsl:for-each select="dc:rights">
		<tr style="vertical-align:top">
		<td>Rights: </td><td style="width:90%"><xsl:value-of select="."/></td>
		</tr>
		</xsl:for-each>
		<!--  all other properties including those from the domain ontology -->
		<xsl:for-each select="*[text() and not (local-name() = 'source' or local-name() = 'rights' or local-name() = 'coverage' or local-name() = 'abstract' or local-name() = 'contributor' or local-name() = 'title' or local-name() = 'creator' or local-name() = 'modified' or local-name() = 'created')]">
			<tr style="vertical-align:top">
			<td><xsl:call-template name="capitalize-first"><xsl:with-param name="str" select="local-name()"/></xsl:call-template>: </td>
			<td style="width:90%"><xsl:value-of select="."/></td>
		</tr>
		
		</xsl:for-each>
		</table>
		</div>
		</div>
	</xsl:template>
	
	<!--  display each aggregated resource -->
	<xsl:template match="rdf:Description[contains(@rdf:about,'#aggregation')]/ore:aggregates">
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
					  <a href='#' onclick="lore.global.util.launchTab('{$about}');"><img src="../../skin/icons/page_go.png" title="Open {$linkLabel} in a new tab"/></a>
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
    			<img class="sspreview" src="{$about}" alt="{$about}" style="max-height:{$height}"/> 
    		</xsl:when>
    		<xsl:when test="contains($format, 'application/xml') and //rdf:Description[@rdf:about=$about and (contains(rdf:type/@rdf:resource,'http://www.w3.org/2000/10/annotation') or contains(rdf:type/@rdf:resource,'http://www.w3.org/2001/12/replyType'))]">
    			<object class="sspreview" data="{$about}?danno_useStylesheet="  height="{$height}" width="{($width - $mwidth) - 10}"></object>
    		</xsl:when>
    		<xsl:when test="contains($format,'application/rdf+xml') and //rdf:Description[@rdf:about=$about and contains(rdf:type/@rdf:resource,'ResourceMap')]">
    			<!--  and rdf:type is compound object : show link to open in lore -->
    			<p style='color:#51666b;margin-top:3em'>
    			<a href='#'>
    			 <xsl:attribute name="onclick">
    			 <xsl:text>lore.ore.readRDF("</xsl:text><xsl:value-of select="$about"/><xsl:text>");</xsl:text>
    			 </xsl:attribute>
    			 <xsl:text>Compound Object:</xsl:text> 
				 <br />
    			 <img src='../../skin/icons/action_go.gif'/>
    			 <xsl:text> Load in LORE</xsl:text>
    			 </a>
    			 </p> 
    		</xsl:when>
    		<xsl:when test="contains($about,'austlit.edu.au') and (contains($about,'ShowWork') or contains($about,'ShowAgent'))">
    			<object class="sspreview" data="{$about}&amp;printPreview=y"  height="{$height}" width="{($width - $mwidth) - 10}"></object>
    		</xsl:when>
    		<xsl:otherwise>
    			<!--  minus 10 to account for 5px padding on each side of itemdesc -->
    			<!--  object class="sspreview" data="{$about}"  width="{($width - $mwidth) - 10}"></object-->
    			<div style='height:50px;width:{($width - $mwidth) - 10}px;color:#51666b;margin-top:3em;'>
    			<a title="Open in new tab" onclick="lore.global.util.launchTab('{$about}');return false;" href="{$about}"><xsl:value-of select="$about"/></a>
    			</div>
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