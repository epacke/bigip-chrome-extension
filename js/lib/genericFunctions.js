
/**************************************************************************
*
*                  Modify the top frame
*
**************************************************************************/

String.prototype.hashCode = function(){
    var hash = 0;
    if (this.length == 0) return hash;
    for (var i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
 }
 
 /**************************************************************************
 *
 *                       Generic functions
 *
 **************************************************************************/
 
 function makeCurrentPartitionObjectsBold(){
    //Get the current partition
    var currentpartition = getCookie("F5_CURRENT_PARTITION")
 
    $("tbody#list_body tr td a").filter(function(){
        return $(this).attr("href").indexOf("/" + currentpartition + "") >= 0
    }).each(function(){
        $(this).css('font-weight', 700);
    });
 }
 
 /**************************************************************************
 *
 *                       Helper functions
 *
 **************************************************************************/
 
 // Used to in cases where jQuery caches the selector at the begining of the script.
 function triggerEvent(ev, el){
    "use strict";
 
    var event = document.createEvent('HTMLEvents');
    event.initEvent(ev, true, true);
    el.dispatchEvent(event);
 
 }
 
 
 function log(s, c = "black"){
    console.log("%c " + s, "color: " + c);
 }
 
 function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
 }
 
 // Credit to Michael Jenkins for this one.
 // https://github.com/jangins101/
 function addDoubleClick(el, btn) {
    $("#" + el).dblclick(function() {  $("#" + btn).click(); });
 }
 
 //Taken from sourceforge
 function addGlobalStyle(css) {
 
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
 
 }
 
 //Get a cookie value. Used to get the current partition
 //Shamelessly stolen from https://gist.github.com/thoov/984751
 
 function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
 }
 function setCookie(name,value,days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        expires = "; expires="+date.toGMTString();
    }
    else expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
 }
 
 function deleteCookie(name) {
    setCookie(name,"",-1);
 }
 
 function replaceCookie(name, value, days){
    deleteCookie(name);
    setCookie(name, value, days);
 }
 
 function getUrlVars(){
 
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
 
    for(var i = 0; i < hashes.length; i++){
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
 
    return vars;
 }
 
 //Tests if browser uri contains string
 function uriContains(s) {
    "use strict";
    var uri = (document.location.pathname + document.location.search);
    return uri.indexOf(s) >= 0;
 }
 