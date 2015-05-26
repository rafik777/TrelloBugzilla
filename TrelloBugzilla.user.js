
// ==UserScript==
// @name Trello Bugzilla Integration
// @namespace http://www.navicon.dk/
// @version 0.1
// @require http://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js
// @description Looks for card titles with 'Bug \d+' and adds badge/links to bugzilla. Also autocompletes new card titles that starts with 'Bug \d+' from bugzilla. Autocomplete is actived when pressing spacebar after 'Bug \d+'.
// @match https://trello.com/b/*
// @copyright 2012+, Carsten Madsen
// ==/UserScript==


// red bugz icon
//var bugzillaImgRed = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAHWSURBVHj aYvz//z8DJQAggJiQOe/fv2fv7Oz8rays/N+VkfG/iYnJfyD/1+rVq7ffu3dPFpsBAAHEAHIBCJ85c8bN2Nj4vwsDw/8zQLwKiO8CcRoQu0DxqlWrdsHUwzBAAIGJmTNnPgYa9j8UqhFElwPxf2MIDeIrKSn9FwSJoRkAEEAM0DD4DzMAyPi/G+QKY4hh5WAXGf8PDQ0FGwJ22d27CjADAAIIrLmjo+MXA9R2kAHvGBA2wwx6B8W7od6CeQcggKCmCEL8bgwxYCbUIGTDVkHDBia+CuotgACCueD3TDQN75D4xmAvCoK9ARMHBzAw0AECiBHkAlC0Mdy7x9ABNA3obAZXIAa6iKEcGlMVQHwWyjYuL2d4v2cPg8vZswx7gHyAAAK7AOif7SAbOqCmn4Ha3AHFsIDtgPq/vLz8P4MSkJ2W9h8ggBjevXvHDo4FQUQg/kdypqCg4H8lUIACnQ/SOBMYI8bAsAJFPcj1AAEEjwVQqLpAbXmH5BJjqI0gi9DTAAgDBBCcAVLkgmQ7yKCZxpCQxqUZhAECCJ4XgMl493ug21ZD+aDAXH0WLM4A9MZPXJkJIIAwTAR5pQMalaCABQUULttBGCCAGCnNzgABBgAMJ5THwGvJLAAAAABJRU5ErkJggg==" />';


var bugzillaLink = 'https://support.cgmpolska.pl/show_bug.cgi?id=',
    bzImgLinkStart = '<img data-href="',
    bzIcon = "http://s17.postimg.org/6ylghgluz/cgm_bz.png",
    bzImgLinkEnd = '" src=' + bzIcon + ' height="22" width="22" style="margin-right: 5px" class="bugz"/>',
    clickHandler = function( event ) {
                   var href = $( this ).data( "href");
                   window.open( bugzillaLink + href, '_blank').focus();
                   event.preventDefault();
                   return false;
};

var addBugzillaBadge = function() {
    $(".list-card-title").each(function(i,val){
        if ($(this).html().match(/Bug \d+/)) {
            var thisParent = $(this).parent();
            if (thisParent.find(".bugz").length < 1){
                var regExpMatch = $(this).html().match(/Bug (\d+)/),
                    newLink = $( bzImgLinkStart + regExpMatch[1] + bzImgLinkEnd ).click(clickHandler);
                thisParent.children('.badges').append(newLink );
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
 var link =  $('#bugListLink');
 if ( link.length === 0 ){
    $('.board-header-btns.mod-left').append('<a id="bugListLink" target="_blank" href="" class="board-header-btn">\
    <span class="board-header-btn-icon icon-sm"><img src="' + bzIcon + '" height="22" width="22" /></span>\
    <span class="">Lista zgłoszeń</span>\
    </a>');
    link =  $('#bugListLink');
 }

    var bugs = {};
    $('a.list-card-title').each(function(n,t){
        var x = $(this).find('span').parent().text(),
        y = /Bug \d+/.exec(x);
        if (y && y.length > 0){
        bugs[ y[0].split(' ')[1] ] = 1;
        }
    });
    var bugListStr = Object.keys( bugs ).join(',')
    link.attr('href',bzLinkMultiBugView + bugListStr);
    console.log( bugListStr );
}




/*  link do wykresu + onko z ramką */
  function loadScript(url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    if (script.readyState) { //IE
        script.onreadystatechange = function () {
            if (script.readyState == "loaded" || script.readyState == "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {
        script.onload = function () { callback(); };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  }

  function createChartLink(){

    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '#chartwrap, #chart{\
       background:#eaebec;\
       margin:2px;\
       border:#ccc 1px solid;\
       -moz-border-radius:3px;\
       -webkit-border-radius:3px;\
       border-radius:3px;\
       -moz-box-shadow: 0 1px 2px #d1d1d1;\
       -webkit-box-shadow: 0 1px 2px #d1d1d1;\
       box-shadow: 0 1px 2px #d1d1d1;\
    }';
    document.getElementsByTagName('head')[0].appendChild(style);

      var irame = '<div id="chartwrap" style="display:none;position:absolute;top:70px;left: 20px;margin:10px;padding:11px;z-index:100000000">' +
      '<iframe width="600" height="371" id="chart" seamless frameborder="0" scrolling="no"'+
'src="https://docs.google.com/spreadsheets/d/1pAc6mpN7HA3qodHQb1xfNF8hoagqv1S0E5iuWHzK4NA/pubchart?oid=382175829&amp;format=interactive">'+
      '</iframe>'+
      '<div id="chartx" onclick="$(\'#chartwrap\').toggle()" style="float:right;color:#444;cursor:pointer;">&#10006;</div>'+
          '<a onclick="var frame=$(\'#chart\')[0]; frame.src=frame.src;" style="float:right;" href="#"><img style="height:15px;top:30px;position:absolute;"src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQk2jo2S0msb33xNT8p_CMALSl_5LisW4ylCVouEIGvFYU0SQOo"></a>'+
          '<a style="height:15px;top:50px;float:right;position:absolute;" href="https://docs.google.com/spreadsheets/d/1pAc6mpN7HA3qodHQb1xfNF8hoagqv1S0E5iuWHzK4NA/edit#gid=0" target="_blank"><img src="https://ssl.gstatic.com/docs/spreadsheets/favicon_jfk2.png"></a>'+
      '</div>';
    $(irame).appendTo('body');

    // dodaj ikonke do wykreus
    var link =  $('#chartListLink');
     if ( link.length === 0 ){
        $('.board-header-btns.mod-left').append('<a id="chartListLink" href="#" class="board-header-btn" onclick="$(\'#chartwrap\').toggle()" >\
        <span class="board-header-btn-icon icon-sm"><img src="chrome-extension://jdbcdblgjdpmfninkoogcfpnkjmndgje/images/burndown_for_trello_icon_12x12.png" height="22" width="22" /></span>\
        <span class="">Burndown chart</span>\
        </a>');
     }

  }


/* wykonanie ww fct */
setTimeout(addBugzillaBadge, 1500);
setInterval(addBugzillaBadge, 5000);
setInterval(createBugListLink, 3000);


loadScript("https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js", createChartLink );



