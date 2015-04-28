// ==UserScript==
// @name Trello Bugzilla Integration
// @namespace http://www.navicon.dk/
// @version 0.1
// @require http://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js
// @description Looks for card titles with 'Bug \d+' and adds badge/links to bugzilla. Also autocompletes new card titles that starts with 'Bug \d+' from bugzilla. Autocomplete is actived when pressing spacebar after 'Bug \d+'.
// @match https://trello.com/b/*
// @copyright 2012+, Carsten Madsen
// ==/UserScript==


var bzIcon= 'http://s17.postimg.org/6ylghgluz/cgm_bz.png';
var bugzillaImg= '<img src="http://s17.postimg.org/6ylghgluz/cgm_bz.png" height="22" width="22" style="margin-right: 5px"/>';
var bugzillaLink = 'https://support.cgmpolska.pl/show_bug.cgi?id=';

var addBugzillaBadge = function() {
    $(".list-card-title").each(function(i,val){
        if ($(this).html().match(/Bug \d+/)) {
            var regExpMatch = $(this).html().match(/Bug (\d+)/);
            if ($(this).parent().find(".bugz").length < 1){
                var sHref = bugzillaLink + regExpMatch[1];
                var newLink = $('<a class="bugz" href="#">'+bugzillaImg+'</a>').click( function( event ) {
                   window.open( sHref, '_blank').focus();
                   event.preventDefault();
                   return false;
                });
                $(this).parent().children('.badges').append(newLink );
            }
        }
    });
};

// intercept spacebar press when creating new cards and look in
// bugzilla to do possible autocomplete

unsafeWindow.$("body").delegate(".js-card-title", "keypress", function(e){
    var code = (e.keyCode ? e.keyCode : e.which);
    if(code == 32) { //Enter keycode
        var text = $(this).val();
        var regExpMatch = text.match(/Bug (\d+)/);
        var textarea = $(this);
        if (regExpMatch) {
            // see http://stackoverflow.com/questions/11007605/gm-xmlhttprequest-why-is-it-never-firing-the-onload-in-firefox
            setTimeout(function() {GM_xmlhttpRequest({
                method: "GET",
                url: bugzillaLink+regExpMatch[1],
                onload: function(response) {
                    var jq = $(response.responseText);
                    console.log($("#short_desc_nonedit_display", response.responseText).text());
                    textarea.val(jq.find(".bz_alias_short_desc_container b").text().replace(String.fromCharCode(160)," ")+ " - " + jq.find("#short_desc_nonedit_display").text());
                },
                onerror: function(response) {
                    console.log("Error " +response.responseText);
                },
                onabort: function(response) {
                    console.log("Error " +response.responseText);
                }
            })}, 0);
        }   
    }
});


/* link do zbiorczej listy zgłoszeń */

var bzLinkMultiBugView = 'https://support.cgmpolska.pl/buglist.cgi?quicksearch='
function createBugListLink(){
 if ( $('#bugListLink').length === 0 ){

    var bugs = {};
    $('a.list-card-title').each(function(n,t){
        var x = $(this).find('span').parent().text(),
        y = /Bug \d+/.exec(x);
        if (y && y.length > 0){
        bugs[ y[0].split(' ')[1] ] = 1;
        }
    });
    var bugListStr = Object.keys( bugs ).join(',')

    // $('.board-header-btns.mod-left').append('<a id="bugListLink" href="' + bugListStr + '" class="board-header-btn">Lista zgłoszeń</a>')

    $('.board-header-btns.mod-left').append('<a id="bugListLink" target="_blank" href="' + bzLinkMultiBugView + bugListStr + '" class="board-header-btn">\
    <span class="board-header-btn-icon icon-sm"><img src="' + bzIcon + '" height="22" width="22" /></span>\
    <span class="">Lista zgłoszeń</span>\
    </a>')
 }
}

setTimeout(addBugzillaBadge, 1500);
setInterval(addBugzillaBadge, 5000);
setTimeout(createBugListLink, 3000);

