// maximize-select2-height v1.0.4
// (c) Panorama Education 2020
// MIT License
!function(t){"use strict"
var e=t(window),n=t(document),o=function(o,i){return t.extend({cushion:i&&n.width()>e.width()?30:10},o)},i=function(t,n,i,c,s){var r,u,h
return s?r=window.document.documentElement.clientHeight+e.scrollTop()-n.offset().top:(h=t.offset().top,u=i.height()-n.height(),r=h-e.scrollTop()-u),r-o(c,s).cushion}
t.fn.maximizeSelect2Height=function(e){return this.each(function(n,o){var c=t(o)
c.on("select2:open",function(){setTimeout(function(){var n=t("#select2-"+o.id+"-results"),s=n.parent(),r=s.parent(),u=r.hasClass("select2-dropdown--below"),h=i(c,n,r,e,u)
s.css("max-height",h),n.css("max-height",h),t(document).trigger("scroll")})})})}}(jQuery)