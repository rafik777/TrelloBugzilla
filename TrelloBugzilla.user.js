// ==UserScript==
// @name Trello Bugzilla Integration
// @namespace http://www.navicon.dk/
// @version 0.1
// @require http://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js
// @description Looks for card titles with 'Bug \d+' and adds badge/links to bugzilla. Also autocompletes new card titles that starts with 'Bug \d+' from bugzilla. Autocomplete is actived when pressing spacebar after 'Bug \d+'.
// @match https://trello.com/b/*
// @copyright 2012+, Carsten Madsen
// ==/UserScript==



var bugzillaImg= '<img src="http://s17.postimg.org/6ylghgluz/cgm_bz.png" height="22" width="22" style="margin-right: 5px"/>';
var bugzillaLink = 'https://support.cgmpolska.pl/show_bug.cgi?id=';

var addBugzillaBadge = function() {
    $(".list-card-title").each(function(i,val){
        //console.log($(this).html());
        if ($(this).html().match(/Bug \d+/)) {
            var regExpMatch = $(this).html().match(/Bug (\d+)/);
            //console.log("match found " + $(this).parent().children('.badges'));
            //console.log("bugz found " + $(this).parent().find(".bugz").length);
            if ($(this).parent().find(".bugz").length < 1){
                $(this).parent().children('.badges').append('<a class="bugz" href="'+ bugzillaLink + regExpMatch[1] +'">'+bugzillaImg+'</a>');}
        }
    });
};

// intercept spacebar press when creating new cards and look in
// bugzilla to do possible autocomplete

unsafeWindow.$("body").delegate(".js-card-title", "keypress", function(e){
    var code = (e.keyCode ? e.keyCode : e.which);
    //console.log("code="+code);
    if(code == 32) { //Enter keycode
        var text = $(this).val();
        //console.log("text="+text);
        var regExpMatch = text.match(/Bug (\d+)/);
        var textarea = $(this);
        //console.log(regExpMatch);
        if (regExpMatch) {
            // see http://stackoverflow.com/questions/11007605/gm-xmlhttprequest-why-is-it-never-firing-the-onload-in-firefox
            setTimeout(function() {GM_xmlhttpRequest({
                method: "GET",
                url: bugzillaLink+regExpMatch[1],
                onload: function(response) {
                    //console.log( response.responseText);
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

setInterval(addBugzillaBadge, 10000);
