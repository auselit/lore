/* This notice must be untouched at all times.

wz_jsgraphics.js    v. 3.05
The latest version is available at
http://www.walterzorn.com
or http://www.devira.com
or http://www.walterzorn.de

Copyright (c) 2002-2009 Walter Zorn. All rights reserved.
Created 3. 11. 2002 by Walter Zorn (Web: http://www.walterzorn.com )
Last modified: 2. 2. 2009

Performance optimizations for Internet Explorer
by Thomas Frank and John Holdsworth.
fillPolygon method implemented by Matthieu Haller.

High Performance JavaScript Graphics Library.
Provides methods
- to draw lines, rectangles, ellipses, polygons
    with specifiable line thickness,
- to fill rectangles, polygons, ellipses and arcs
- to draw text.
NOTE: Operations, functions and branching have rather been optimized
to efficiency and speed than to shortness of source code.

LICENSE: LGPL

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License (LGPL) as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA,
or see http://www.gnu.org/copyleft/lesser.html
*/
var jg_ok,jg_ie,jg_fast,jg_dom,jg_moz;function _chkDHTM(C,A,B){A=C.document.body||null;jg_ie=A&&typeof A.insertAdjacentHTML!="undefined"&&C.document.createElement;jg_dom=(A&&!jg_ie&&typeof A.appendChild!="undefined"&&typeof C.document.createRange!="undefined"&&typeof (B=C.document.createRange()).setStartBefore!="undefined"&&typeof B.createContextualFragment!="undefined");jg_fast=jg_ie&&C.document.all&&!C.opera;jg_moz=jg_dom&&typeof A.style.MozOpacity!="undefined";jg_ok=!!(jg_ie||jg_dom)}function _pntCnvDom(){var A=this.wnd.document.createRange();A.setStartBefore(this.cnv);A=A.createContextualFragment(jg_fast?this._htmRpc():this.htm);if(this.cnv){this.cnv.appendChild(A)}this.htm=""}function _pntCnvIe(){if(this.cnv){this.cnv.insertAdjacentHTML("BeforeEnd",jg_fast?this._htmRpc():this.htm)}this.htm=""}function _pntDoc(){this.wnd.document.write(jg_fast?this._htmRpc():this.htm);this.htm=""}function _pntN(){}function _mkDiv(A,D,B,C){this.htm+='<div style="position:absolute;left:'+A+"px;top:"+D+"px;width:"+B+"px;height:"+C+"px;clip:rect(0,"+B+"px,"+C+"px,0);background-color:"+this.color+(!jg_moz?";overflow:hidden":"")+';"></div>'}function _mkDivIe(A,D,B,C){this.htm+="%%"+this.color+";"+A+";"+D+";"+B+";"+C+";"}function _mkDivPrt(A,D,B,C){this.htm+='<div style="position:absolute;border-left:'+B+"px solid "+this.color+";left:"+A+"px;top:"+D+"px;width:0px;height:"+C+"px;clip:rect(0,"+B+"px,"+C+"px,0);background-color:"+this.color+(!jg_moz?";overflow:hidden":"")+';"></div>'}var _regex=/%%([^;]+);([^;]+);([^;]+);([^;]+);([^;]+);/g;function _htmRpc(){return this.htm.replace(_regex,'<div style="overflow:hidden;position:absolute;background-color:$1;left:$2px;top:$3px;width:$4px;height:$5px"></div>\n')}function _htmPrtRpc(){return this.htm.replace(_regex,'<div style="overflow:hidden;position:absolute;background-color:$1;left:$2px;top:$3px;width:$4px;height:$5px;border-left:$4px solid $1"></div>\n')}function _mkLin(E,M,B,K){if(E>B){var J=B;var G=K;B=E;K=M;E=J;M=G}var P=B-E,O=Math.abs(K-M),L=E,I=M,N=(M>K)?-1:1;if(P>=O){var A=O<<1,H=A-(P<<1),D=A-P,F=L;while(P>0){--P;++L;if(D>0){this._mkDiv(F,I,L-F,1);I+=N;D+=H;F=L}else{D+=A}}this._mkDiv(F,I,B-F+1,1)}else{var A=P<<1,H=A-(O<<1),D=A-O,C=I;if(K<=M){while(O>0){--O;if(D>0){this._mkDiv(L++,I,1,C-I+1);I+=N;D+=H;C=I}else{I+=N;D+=A}}this._mkDiv(B,K,1,C-K+1)}else{while(O>0){--O;I+=N;if(D>0){this._mkDiv(L++,C,1,I-C);D+=H;C=I}else{D+=A}}this._mkDiv(B,C,1,K-C+1)}}}function _mkLin2D(Q,B,P,A){if(Q>P){var F=P;var N=A;P=Q;A=B;Q=F;B=N}var J=P-Q,I=Math.abs(A-B),H=Q,G=B,M=(B>A)?-1:1;var K=this.stroke;if(J>=I){if(J>0&&K-3>0){var R=(K*J*Math.sqrt(1+I*I/(J*J))-J-(K>>1)*I)/J;R=(!(K-4)?Math.ceil(R):Math.round(R))+1}else{var R=K}var S=Math.ceil(K/2);var O=I<<1,E=O-(J<<1),L=O-J,D=H;while(J>0){--J;++H;if(L>0){this._mkDiv(D,G,H-D+S,R);G+=M;L+=E;D=H}else{L+=O}}this._mkDiv(D,G,P-D+S+1,R)}else{if(K-3>0){var R=(K*I*Math.sqrt(1+J*J/(I*I))-(K>>1)*J-I)/I;R=(!(K-4)?Math.ceil(R):Math.round(R))+1}else{var R=K}var S=Math.round(K/2);var O=J<<1,E=O-(I<<1),L=O-I,C=G;if(A<=B){++S;while(I>0){--I;if(L>0){this._mkDiv(H++,G,R,C-G+S);G+=M;L+=E;C=G}else{G+=M;L+=O}}this._mkDiv(P,A,R,C-A+S)}else{while(I>0){--I;G+=M;if(L>0){this._mkDiv(H++,C,R,G-C+S);L+=E;C=G}else{L+=O}}this._mkDiv(P,C,R,A-C+S+1)}}}function _mkLinDott(D,K,B,I){if(D>B){var H=B;var E=I;B=D;I=K;D=H;K=E}var O=B-D,N=Math.abs(I-K),J=D,G=K,M=(K>I)?-1:1,L=true;if(O>=N){var A=N<<1,F=A-(O<<1),C=A-O;while(O>0){--O;if(L){this._mkDiv(J,G,1,1)}L=!L;if(C>0){G+=M;C+=F}else{C+=A}++J}}else{var A=O<<1,F=A-(N<<1),C=A-N;while(N>0){--N;if(L){this._mkDiv(J,G,1,1)}L=!L;G+=M;if(C>0){++J;C+=F}else{C+=A}}}if(L){this._mkDiv(J,G,1,1)}}function _mkOv(E,N,R,P){var V=(++R)>>1,U=(++P)>>1,L=R&1,D=P&1,C=E+V,B=N+U,I=0,H=U,G=0,F=U,Q=(V*V)<<1,O=Q<<1,M=(U*U)<<1,K=M<<1,S=(Q>>1)*(1-(U<<1))+M,A=(M>>1)-Q*((U<<1)-1),J,T;while(H>0){if(S<0){S+=M*((I<<1)+3);A+=K*(++I)}else{if(A<0){S+=M*((I<<1)+3)-O*(H-1);A+=K*(++I)-Q*(((H--)<<1)-3);J=I-G;T=F-H;if((J&2)&&(T&2)){this._mkOvQds(C,B,I-2,H+2,1,1,L,D);this._mkOvQds(C,B,I-1,H+1,1,1,L,D)}else{this._mkOvQds(C,B,I-1,F,J,T,L,D)}G=I;F=H}else{A-=Q*((H<<1)-3);S-=O*(--H)}}}J=V-G+1;T=(F<<1)+D;H=B-F;this._mkDiv(C-V,H,J,T);this._mkDiv(C+G+L-1,H,J,T)}function _mkOv2D(E,H,A,B){var e=this.stroke;A+=e+1;B+=e+1;var r=A>>1,p=B>>1,o=A&1,V=B&1,L=E+r,K=H+p,c=0,X=p,S=(r*r)<<1,Q=S<<1,G=(p*p)<<1,D=G<<1,I=(S>>1)*(1-(p<<1))+G,n=(G>>1)-S*((p<<1)-1);if(e-4<0&&(!(e-2)||A-51>0&&B-51>0)){var O=0,N=p,d,k,T;while(X>0){if(I<0){I+=G*((c<<1)+3);n+=D*(++c)}else{if(n<0){I+=G*((c<<1)+3)-Q*(X-1);n+=D*(++c)-S*(((X--)<<1)-3);d=c-O;k=N-X;if(d-1){T=d+1+(e&1);k=e}else{if(k-1){T=e;k+=1+(e&1)}else{T=k=e}}this._mkOvQds(L,K,c-1,N,T,k,o,V);O=c;N=X}else{n-=S*((X<<1)-3);I-=Q*(--X)}}}this._mkDiv(L-r,K-N,e,(N<<1)+V);this._mkDiv(L+r+o-e,K-N,e,(N<<1)+V)}else{var t=(A-(e<<1))>>1,q=(B-(e<<1))>>1,Y=0,W=q,R=(t*t)<<1,P=R<<1,F=(q*q)<<1,C=F<<1,J=(R>>1)*(1-(q<<1))+F,m=(F>>1)-R*((q<<1)-1),Z=new Array(),U=new Array(),f=new Array();Z[0]=0;U[0]=p;f[0]=q-1;while(X>0){if(I<0){Z[Z.length]=c;U[U.length]=X;I+=G*((c<<1)+3);n+=D*(++c)}else{if(n<0){Z[Z.length]=c;I+=G*((c<<1)+3)-Q*(X-1);n+=D*(++c)-S*(((X--)<<1)-3);U[U.length]=X}else{n-=S*((X<<1)-3);I-=Q*(--X)}}if(W>0){if(J<0){J+=F*((Y<<1)+3);m+=C*(++Y);f[f.length]=W-1}else{if(m<0){J+=F*((Y<<1)+3)-P*(W-1);m+=C*(++Y)-R*(((W--)<<1)-3);f[f.length]=W-1}else{m-=R*((W<<1)-3);J-=P*(--W);f[f.length-1]--}}}}var O=-o,N=p,M=f[0],g=Z.length,d,k;for(var j=0;j<g;j++){if(typeof f[j]!="undefined"){if(f[j]<M||U[j]<N){c=Z[j];this._mkOvQds(L,K,c,N,c-O,N-M,o,V);O=c;N=U[j];M=f[j]}}else{c=Z[j];this._mkDiv(L-c,K-N,1,(N<<1)+V);this._mkDiv(L+O+o,K-N,1,(N<<1)+V);O=c;N=U[j]}}this._mkDiv(L-r,K-N,1,(N<<1)+V);this._mkDiv(L+O+o,K-N,1,(N<<1)+V)}}function _mkOvDott(E,L,Q,O){var T=(++Q)>>1,S=(++O)>>1,J=Q&1,D=O&1,H=D^1,C=E+T,B=L+S,G=0,F=S,P=(T*T)<<1,M=P<<1,K=(S*S)<<1,I=K<<1,R=(P>>1)*(1-(S<<1))+K,A=(K>>1)-P*((S<<1)-1),N=true;while(F>0){if(R<0){R+=K*((G<<1)+3);A+=I*(++G)}else{if(A<0){R+=K*((G<<1)+3)-M*(F-1);A+=I*(++G)-P*(((F--)<<1)-3)}else{A-=P*((F<<1)-3);R-=M*(--F)}}if(N&&F>=H){this._mkOvQds(C,B,G,F,1,1,J,D)}N=!N}}function _mkRect(A,E,B,D){var C=this.stroke;this._mkDiv(A,E,B,C);this._mkDiv(A+B,E,C,D);this._mkDiv(A,E+D,B+C,C);this._mkDiv(A,E+C,C,D-C)}function _mkRectDott(A,D,B,C){this.drawLine(A,D,A+B,D);this.drawLine(A+B,D,A+B,D+C);this.drawLine(A,D+C,A+B,D+C);this.drawLine(A,D,A,D+C)}function jsgFont(){this.PLAIN="font-weight:normal;";this.BOLD="font-weight:bold;";this.ITALIC="font-style:italic;";this.ITALIC_BOLD=this.ITALIC+this.BOLD;this.BOLD_ITALIC=this.ITALIC_BOLD}var Font=new jsgFont();function jsgStroke(){this.DOTTED=-1}var Stroke=new jsgStroke();function jsGraphics(A,B){this.setColor=function(C){this.color=C.toLowerCase()};this.setStroke=function(C){this.stroke=C;if(!(C+1)){this.drawLine=_mkLinDott;this._mkOv=_mkOvDott;this.drawRect=_mkRectDott}else{if(C-1>0){this.drawLine=_mkLin2D;this._mkOv=_mkOv2D;this.drawRect=_mkRect}else{this.drawLine=_mkLin;this._mkOv=_mkOv;this.drawRect=_mkRect}}};this.setPrintable=function(C){this.printable=C;if(jg_fast){this._mkDiv=_mkDivIe;this._htmRpc=C?_htmPrtRpc:_htmRpc}else{this._mkDiv=C?_mkDivPrt:_mkDiv}};this.setFont=function(D,E,C){this.ftFam=D;this.ftSz=E;this.ftSty=C||Font.PLAIN};this.drawPolyline=this.drawPolyLine=function(C,E){for(var D=C.length-1;D;){--D;this.drawLine(C[D],E[D],C[D+1],E[D+1])}};this.fillRect=function(C,F,D,E){this._mkDiv(C,F,D,E)};this.drawPolygon=function(C,D){this.drawPolyline(C,D);this.drawLine(C[C.length-1],D[C.length-1],C[0],D[0])};this.drawEllipse=this.drawOval=function(C,F,D,E){this._mkOv(C,F,D,E)};this.fillEllipse=this.fillOval=function(G,Q,L,U){var X=L>>1,W=U>>1,M=L&1,F=U&1,E=G+X,D=Q+W,J=0,I=W,H=W,S=(X*X)<<1,R=S<<1,O=(W*W)<<1,K=O<<1,T=(S>>1)*(1-(W<<1))+O,C=(O>>1)-S*((W<<1)-1),P,N,V;if(L){while(I>0){if(T<0){T+=O*((J<<1)+3);C+=K*(++J)}else{if(C<0){T+=O*((J<<1)+3)-R*(I-1);P=E-J;N=(J<<1)+M;C+=K*(++J)-S*(((I--)<<1)-3);V=H-I;this._mkDiv(P,D-H,N,V);this._mkDiv(P,D+I+F,N,V);H=I}else{C-=S*((I<<1)-3);T-=R*(--I)}}}}this._mkDiv(E-X,D-H,L,(H<<1)+F)};this.fillArc=function(E,g,Z,I,F,U){var f=Z>>1,e=I>>1,Q=(Z&1)|((I&1)<<16),G=E+f,D=g+e,O=0,M=e,K=O,J=M,V=(f*f)<<1,T=V<<1,R=(e*e)<<1,P=R<<1,X=(V>>1)*(1-(e<<1))+R,C=(R>>1)-V*((e<<1)-1),Y,N,L,d,c=(1<<(Math.floor((F%=360)/180)<<3))|(2<<(Math.floor((U%=360)/180)<<3))|((F>=U)<<16),H=new Array(e+1),W=new Array(e+1);F*=Math.PI/180;U*=Math.PI/180;Y=G+Math.round(f*Math.cos(F));N=D+Math.round(-e*Math.sin(F));_mkLinVirt(H,G,D,Y,N);L=G+Math.round(f*Math.cos(U));d=D+Math.round(-e*Math.sin(U));_mkLinVirt(W,G,D,L,d);while(M>0){if(X<0){X+=R*((O<<1)+3);C+=P*(++O)}else{if(C<0){X+=R*((O<<1)+3)-T*(M-1);K=O;C+=P*(++O)-V*(((M--)<<1)-3);this._mkArcDiv(K,M,J,G,D,Q,H,W,c);J=M}else{C-=V*((M<<1)-3);X-=T*(--M);if(M&&(H[M]!=H[M-1]||W[M]!=W[M-1])){this._mkArcDiv(O,M,J,G,D,Q,H,W,c);K=O;J=M}}}}this._mkArcDiv(O,0,J,G,D,Q,H,W,c);if(Q>>16){if(c>>16){var S=(N<=D||d>D)?(G-O):G;this._mkDiv(S,D,O+G-S+(Q&65535),1)}else{if((c&1)&&d>D){this._mkDiv(G-O,D,O,1)}}}};this.fillPolygon=function(I,H){var J;var O;var Q,M;var D,P;var C,N;var L,K;var E;var F=I.length;if(!F){return }Q=H[0];M=H[0];for(J=1;J<F;J++){if(H[J]<Q){Q=H[J]}if(H[J]>M){M=H[J]}}for(O=Q;O<=M;O++){var G=new Array();E=0;for(J=0;J<F;J++){if(!J){L=F-1;K=0}else{L=J-1;K=J}P=H[L];N=H[K];if(P<N){D=I[L];C=I[K]}else{if(P>N){N=H[L];P=H[K];C=I[L];D=I[K]}else{continue}}if((O>=P)&&(O<N)){G[E++]=Math.round((O-P)*(C-D)/(N-P)+D)}else{if((O==M)&&(O>P)&&(O<=N)){G[E++]=Math.round((O-P)*(C-D)/(N-P)+D)}}}G.sort(_CompInt);for(J=0;J<E;J+=2){this._mkDiv(G[J],O,G[J+1]-G[J]+1,1)}}};this.drawString=function(D,C,E){this.htm+='<div style="position:absolute;white-space:nowrap;left:'+C+"px;top:"+E+"px;font-family:"+this.ftFam+";font-size:"+this.ftSz+";color:"+this.color+";"+this.ftSty+'">'+D+"</div>"};this.drawStringRect=function(D,C,G,E,F){this.htm+='<div style="position:absolute;overflow:hidden;left:'+C+"px;top:"+G+"px;width:"+E+"px;text-align:"+F+";font-family:"+this.ftFam+";font-size:"+this.ftSz+";color:"+this.color+";"+this.ftSty+'">'+D+"</div>"};this.drawImage=function(G,C,H,E,F,D){this.htm+='<div style="position:absolute;left:'+C+"px;top:"+H+"px;"+(E?("width:"+E+"px;"):"")+(F?("height:"+F+"px;"):"")+'"><img src="'+G+'"'+(E?(' width="'+E+'"'):"")+(F?(' height="'+F+'"'):"")+(D?(" "+D):"")+"></div>"};this.clear=function(){this.htm="";if(this.cnv){this.cnv.innerHTML=""}};this._mkOvQds=function(E,D,K,J,L,F,N,I){var G=E-K,C=E+K+N-L,M=D-J,H=D+J+I-F;if(C>G+L){this._mkDiv(C,M,L,F);this._mkDiv(C,H,L,F)}else{L=C-G+L}this._mkDiv(G,M,L,F);this._mkDiv(G,H,L,F)};this._mkArcDiv=function(O,N,D,H,G,E,L,K,Q){var C=H+O+(E&65535),M,I=D-N,J,F,P;if(!I){I=1}O=H-O;if(Q&16711680){M=G-N-I;if(Q&255){if(Q&2){J=Math.max(O,K[N]);P=C-J;if(P>0){this._mkDiv(J,M,P,I)}}if(Q&1){F=Math.min(C,L[N]);P=F-O;if(P>0){this._mkDiv(O,M,P,I)}}}else{this._mkDiv(O,M,C-O,I)}M=G+N+(E>>16);if(Q&65280){if(Q&256){J=Math.max(O,L[N]);P=C-J;if(P>0){this._mkDiv(J,M,P,I)}}if(Q&512){F=Math.min(C,K[N]);P=F-O;if(P>0){this._mkDiv(O,M,P,I)}}}else{this._mkDiv(O,M,C-O,I)}}else{if(Q&255){if(Q&2){J=Math.max(O,K[N])}else{J=O}if(Q&1){F=Math.min(C,L[N])}else{F=C}M=G-N-I;P=F-J;if(P>0){this._mkDiv(J,M,P,I)}}if(Q&65280){if(Q&256){J=Math.max(O,L[N])}else{J=O}if(Q&512){F=Math.min(C,K[N])}else{F=C}M=G+N+(E>>16);P=F-J;if(P>0){this._mkDiv(J,M,P,I)}}}};this.setStroke(1);this.setFont("verdana,geneva,helvetica,sans-serif","12px",Font.PLAIN);this.color="#000000";this.htm="";this.wnd=B||window;if(!jg_ok){_chkDHTM(this.wnd)}if(jg_ok){if(A){if(typeof (A)=="string"){this.cont=document.all?(this.wnd.document.all[A]||null):document.getElementById?(this.wnd.document.getElementById(A)||null):null}else{if(A==window.document){this.cont=document.getElementsByTagName("body")[0]}else{this.cont=A}}this.cnv=this.wnd.document.createElement("div");this.cnv.style.fontSize=0;this.cont.appendChild(this.cnv);this.paint=jg_dom?_pntCnvDom:_pntCnvIe}else{this.paint=_pntDoc}}else{this.paint=_pntN}this.setPrintable(false)}function _mkLinVirt(M,E,K,C,J){var P=Math.abs(C-E),O=Math.abs(J-K),L=E,I=K,A=(E>C)?-1:1,N=(K>J)?-1:1,D,F=0;if(P>=O){var B=O<<1,H=B-(P<<1);D=B-P;while(P>0){--P;if(D>0){M[F++]=L;I+=N;D+=H}else{D+=B}L+=A}}else{var B=P<<1,H=B-(O<<1);D=B-O;while(O>0){--O;I+=N;M[F++]=L;if(D>0){L+=A;D+=H}else{D+=B}}}for(var G=M.length,F=G-F;F;){M[G-(F--)]=L}}function _CompInt(A,B){return(A-B)};