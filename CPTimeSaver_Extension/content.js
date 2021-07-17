/* global includes/helper functions */

// console.log('welcome to CPTimeSaver');

// // Import JQuery 3.6.0 if not present
// var script = document.createElement('script');
// script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
// script.type = 'text/javascript';
// document.getElementsByTagName('head')[0].appendChild(script);
// console.log('loading jQuery Version 3.6.0');

function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForAddedNode(params) {
    new MutationObserver(function(mutations) {
        var el = document.getElementById(params.id);
        if (el) {
            this.disconnect();
            params.done(el);
        }
    }).observe(params.parent || document, {
        subtree: !!params.recursive || !params.parent,
        childList: true,
    });
}

function simulateKeyPress(character) {
    var keyCode;
    if (character.length > 1) {
        if (character=='tab') {
            keyCode = 9;
        } else if (character == 'enter') {
            keyCode = 13;
        }

    } else {
        keyCode = character.charCodeAt(0);
    }
    jQuery.event.trigger({ type : 'keypress', which : keyCode });
}


/* Attach Mutation Observers */
var currentMonth = $('#END_DT').val();
function onMonthChange(mutations) {
    if (($('#pleaseWaitImage').css('visibility')) == 'hidden') {
        if ($('#END_DT').val() != currentMonth) {
            currentMonth = $('#END_DT').val();
            console.log('month changed');
            calcSurplus();
        }
        
    }
    // mutations.forEach(function(mutationRecord) {
    //     console.log(`style changed: ${mutationRecord.oldValue}`);
    // });
}
var monthObserver = new MutationObserver(onMonthChange);

/* @TODO: disable shortcut intercepting  */

/* @Feature: fast navigate to timesheet from main login page */
// @TODO instead of jump to page maybe explore a different settings location other than popup.html?

$(document).ready( function() {
    if (window.location.pathname=='/cploginform.htm') {
        console.log('loginform');
        go2MasterPage();
    } else if (window.location.pathname=='/masterPage.htm') {
        console.log('masterpage');
        go2Timesheet();
        monthObserver.observe($('#pleaseWaitImage')[0], { attributes : true, attributeFilter : ['style'] });
    }
});
function go2MasterPage() {
    var myScript = document.createElement("script");
    myScript.innerHTML = 
      `
      function attemptInputUserInfo() {
          setTimeout(function() {
            console.log('attempting to open enter username...');
            if (document.getElementById("USER") != null ) {
                document.getElementById("USER").value = "pwolfe8";
                document.getElementById("USER").onchange();
            } else {
                attemptInputUserInfo();
            }
          }, 500);
      }
      attemptInputUserInfo();
      `;
    document.body.appendChild(myScript);
}
function go2Timesheet() {
    var myScript = document.createElement("script");
    myScript.id = 'attemptScript';
    myScript.innerHTML = 
      `
      var attemptBuildMax = 15;
      var attemptClickMax = 15;
      var attemptBuildCtr = 0;
      var attemptClickCtr = 0;
      function attemptBuild() {
        setTimeout(function() {
            console.log('attempting to open fav menu...');
            attemptBuildCtr++;
            if (typeof ProductNav.myMnu != 'undefined') {
                ProductNav.buildMyMenu(MyMenuMgr.myMenuArray);
                ProductNav.myMnu.style.visibility='visible';
                attemptClick();
            } else if (attemptBuildCtr < attemptBuildMax) {
                attemptBuild();
            }
        }, 500);
      }
      function attemptClick() {
        setTimeout(function() {
            attemptClickCtr++;
            console.log('attempting to click timesheet in fav menu...');
            if (document.getElementById('myMnuLbl0') != null) {
                document.getElementById('myMnuLbl0').click();
                attemptMaximize();
            } else if (attemptClickCtr < attemptClickMax) {
                attemptClick();
            }
          }, 500);
      }
      function attemptMaximize() {
        setTimeout(function() {
            console.log('attempting to click maximize button...');
            if (document.getElementById('rsMaxImg') != null) {
                document.getElementById('rsMaxImg').click();
                // check to see if still says maximize. otherwise recurse. (should switch to restore)
                setTimeout(function() {
                    if (document.getElementById('rsMaxImg').parentElement.title == 'Maximize') {
                        attemptMaximize();
                    } else {
                        // scroll right once and finish
                        // setTimeout(function() {
                        //     attemptScrollRight();
                        // }, 1000);
                    }
                }, 100);
            } else {
                attemptMaximize();
            }
          }, 500);
      }
      function attemptScrollRight() {
        console.log('attempting to scroll right');

        document.getElementById('rft2').click()
        RSEvt.curSqlRS.srsTbl._scrR();
      }
      attemptBuild();
      `;
    setTimeout(function() {
        document.body.appendChild(myScript);
    }, 500);
}

// function go2Timesheet2() {
//     var myScript = document.createElement("script");
//     myScript.id = 'attemptScript';
//     myScript.innerHTML = 
//       `
//       function wait2ClickElement() {
//         console.log('waiting for ' + namestr);
//         setTimeout(function() {
//             if (document.getElementById(namestr)==null) {
//                 wait2ClickElement(namestr);
//             } else {
//                 console.log('found! clicking...');
//                 document.getElementById(namestr).click()
//             }
//           }, 500);
//       }
//       var namestr = 'mymenu';
//       wait2ClickElement(namestr);
//       namestr = 'myMnuLbl0';
//       wait2ClickElement(namestr);
//       namestr = 'rsMaxImg';
//       wait2ClickElement(namestr);
//       `;
//     setTimeout(function() {
//         document.body.appendChild(myScript);
//     }, 200);
// }


/* @Feature: Calculate Surplus Hours Worked */
// @TODO scroll control to move to and find last entered hours
// global var scroll left/right: 
//      RSEvt.curSqlRS.srsTbl._scrL();
//      RSEvt.curSqlRS.srsTbl._scrR();
// @TODO fix month change calculation bug (may be fixed by auto-scroll)

function scrollRight() {
    document.getElementById('rft2').click()
    RSEvt.curSqlRS.srsTbl._scrR();
}

// function scrollRight() {
//     if (!$('#scrollRightScriptDiv').length) {
//         createScrollRight();
//     }
//     $('#scrollRightScriptDiv').click();
// }
// function createScrollRight() {
//     var myScript = document.createElement("script");
//     myScript.id = 'attemptScrollRightScript';
//     myScript.innerHTML = 
//       `function attemptScrollRight() {
//         document.getElementById('track1').click();
//         RSEvt.curSqlRS.srsTbl._scrR();
//       }
//       `;
//     var myScriptDiv = document.createElement("div");
//     myScriptDiv.id = 'attemptScrollRightScriptDiv';
//     myScriptDiv.onchange = attemptScrollRight();
//     console.log('appending script and div')
//     document.body.appendChild(myScript);
//     document.body.appendChild(myScriptDiv);
//     setTimeout(function() {}, 500);
// }

var daysInMonth = null;
var currentTotalHours = null;
var lastTotalHours = null;
var originalPrintText = null;
var lastTotalHours = null;
var calculatedSurplusHours = 'XX';

function isWeekday(dayNumber) {
    // get year and month from the end date on page
    var spl = $('#END_DT').val().split('/');
    var dayIdx = new Date(`${spl[0]}/${dayNumber}/${spl[2]}`).getDay();
    return (dayIdx != 0) && (dayIdx != 6);
}

function getNumWorkdaysSoFar(){
    // get today's date and override if input val doesn't match
    var todayDateNum = new Date().getDate();
    if ($('#surpHrsRefDate').length) {
        var inVal = parseInt($('#surpHrsRefDate').val());
        if (inVal != todayDateNum) {
            todayDateNum = inVal;
        }
    }

    var workdayCtr = 0;
    for (i=1; i<=todayDateNum; i++) {
        if (isWeekday(i)) {
            workdayCtr++;
        }
    }
    return workdayCtr;
}

function calcSurplus() {

    // only run if we're on the timesheet page 
    if (!$('#SCHEDULE_DESC_AND_P_TEXT').length) { // (check if can't find monhtly hours box)
        console.log('can\'t find monthly hours. not doing calculation...');
        return;
    }

    // init custom charge nums if not populated 
    firstTimePopulateCustomChargenumDescription();

    // check if total hours have changed to see if new calculation is needed
    if (!$('#rft2').find('span:first').text().length) {
        console.log('current total hours not present. not doing calculation...')
        return;
    }
    currentTotalHours = parseFloat($('#rft2').find('span:first').text());

    // update last total hours
    if (lastTotalHours == null){
        lastTotalHours == currentTotalHours;
    }
    else if (currentTotalHours == lastTotalHours) {
        // do no calcuation if no change in total hours
        return;
    } else {
        lastTotalHours = currentTotalHours;
    }

    // create span to print surplus hours on if doesn't exist yet
    if (!$('#surplusHours').length) {
        var printSpanInstance = $(`<span id="surplusHours" class="sbtskLnk" style="color: green; padding-left: 7px; padding-right: 7px; font-size: 8pt; letter-spacing: 0.254px;">Surplus Hours: XX</span>`);
        $('.subtaskTbl:first').append(printSpanInstance);
    }
    // create input to set current day to calc surplus hours based on if doesn't exist yet
    if (!$('#surpHrsDateSpan').length) {
        var currentWorkDate = new Date().getDate();
        var currentWorkDateInput = `<span id="surpHrsDateSpan" class="sbtskLnk" style="color: black;padding-left: 3px; padding-right: 3px; font-size: 8pt; letter-spacing: 0.254px;">Day Of Month:<input id="surpHrsRefDate" value="${currentWorkDate}" onfocusout="calcSurplus()" type="text" maxlength="2" style="width: 20px;"></input> </span>`;
        $('.subtaskTbl:first').append(currentWorkDateInput);
    }

    // get number of days in the month
    daysInMonth = parseInt($('#END_DT').val().split('/')[1]);
    // console.log(`days in month: ${daysInMonth}`);

    // Count number of workdays that should have hours filled 
    var firstDayDivOffset = 26;
    var foundLastEnteredDay = false;
    var numWorkdaysSoFar = getNumWorkdaysSoFar(); // 0;
    // for (dayNum=daysInMonth; dayNum > 0; dayNum--) { // count from end of month to beginning
    //     // retrieve num hours on this day
    //     var hasHours = $('#tot2').children('div').eq(firstDayDivOffset+dayNum).text().length > 0;
    //     var isWorkday = isWeekday(dayNum);
    //     var hours = parseFloat($('#tot2').children('div').eq(firstDayDivOffset+dayNum).text());
    //     // console.log(`day: ${dayNum} hours: ${hours} hasHours: ${hasHours} isWorkday: ${isWorkday}`);
    //     // check if found last day yet first
    //     if (!foundLastEnteredDay) {     
    //         // check if day has hours
    //         if (hasHours) {         
    //             // check if the hours are greater than zero
    //             var hours = parseFloat($('#tot2').children('div').eq(firstDayDivOffset+dayNum).text());
    //             if (hours > 0) {
    //                 // check if it's a workday
    //                 if (isWorkday) {        
    //                     // flip flag for found first day and increment workday counter
    //                     foundLastEnteredDay = true;
    //                     numWorkdaysSoFar++;
    //                 }
    //             }
    //         }
    //     } else if (isWorkday) {         // count workdays until last entered day
    //         numWorkdaysSoFar++;         // increment workday counter
    //     }
    // }

    // final calc & set text/color
    // var expectedMonthTotal = parseInt($('#SCHEDULE_DESC_AND_P_TEXT')[0].value.split(' ')[1]);
    calculatedSurplusHours =  currentTotalHours - numWorkdaysSoFar * 8;
    var surplusHoursColor = calculatedSurplusHours >= 0 ? 'green' : 'red';
    console.log('work days so far: ' + numWorkdaysSoFar + ', current total: ' + currentTotalHours + ', surplus: ' + calculatedSurplusHours );
    $('#surplusHours').text(`Surplus Hours ${calculatedSurplusHours}`);
    $('#surplusHours').css('color', surplusHoursColor);

    // console.log('attempting to scroll right...');
    // attemptScrollRight();
    // scrollRight();
}

// async wait for timesheet page and current hours to be present and ready for first page load calc of surplus hours
async function waitForCurrentTotalHoursBeforeCalcSurplus() {
    while (!$('#rft2').find('span:first').text().length) {
        // console.log('waiting 200 ms');
        await sleep(200);
    }
    calcSurplus();
}
waitForAddedNode({
    id: 'vg_vg_1__TMMTIMESHEET___TMMTIMESHEET',
    parent: document.querySelector('.visLayer'),
    recursive: false,
    done: function(el) {
        waitForCurrentTotalHoursBeforeCalcSurplus();   
    }
});
// also update surplus hours on change in input values
$(document).on('change', 'input', calcSurplus);


/* @Feature: Enable Custom Charge Number Names */
// $('#EXSTNG').on('load', populateCustomChargeNumDescriptions);
// $(document).on('change', 'input', populateCustomChargeNumDescriptions);

function createPopupSettings(line_idx) {

    var charge_num = $('#'+charge_num_id_str).value;
    console.log("Settings popup opened by " + charge_num);

    var win = window.open("", "Title", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=400,height=300,top="+(screen.height / 2 - 150)+",left="+(screen.width / 2 - 200));
    win.document.title = "Project Settings";
    var settingsInnerHTML    = "<div id=\"settings_title\">Settings for: \"\"</div>";
    settingsInnerHTML       += "<div id=\"original_name\">Original Name: \"\"</div>";
    
    settingsInnerHTML       += "<p>Custom Project Name:</br>";
    settingsInnerHTML       += "<input id=\"custom_name_text\" type=\"text\">";
    settingsInnerHTML       += "</p>";

    settingsInnerHTML       += "<p>Project Related Notes:</br>";
    settingsInnerHTML       += "<textarea id=\"project_notes_text\" rows=\"8\" cols=\"50\"></textarea></br>";
    settingsInnerHTML       += "<button id=\"save_proj_settings\">Save</button>"
    settingsInnerHTML       += "</p>";

    win.document.body.innerHTML = settingsInnerHTML;

    // update settings page original and current custom name
    chrome.storage.sync.get(null, function(result) {        
        // retrieve desired variables from sync storage
        var originalNameKey = charge_num + "_originalName";
        var originalName = result[originalNameKey];
        var customNameKey = charge_num + "_customName";
        var customName = result[customNameKey];
        var projectNotesKey = charge_num + "_projectNotes";
        var projectNotesSavedText = result[projectNotesKey];

        // set custom name if exists
        if (customName) {
            win.document.getElementById('settings_title').textContent = "Settings for: \"" + customName + "\"";
            win.document.getElementById('custom_name_text').value = customName;
        } else {
            win.document.getElementById('settings_title').textContent = "Settings for: \"" + originalName + "\"";
        }
        
        // set original name
        win.document.getElementById('original_name').innerText = "Original Name: \"" + originalName + "\"";
        
        // restore previously saved project notes text if it exists
        if (projectNotesSavedText)
            win.document.getElementById('project_notes_text').innerText = projectNotesSavedText;
    });

    // set onclick for saving project settings
    win.document.getElementById('save_proj_settings').onclick = function () {
        var customNameText = win.document.getElementById('custom_name_text').value;
        var projectVarKey = charge_num + '_customName';
        debug_log('saving ' + customNameText + ' to ' + projectVarKey );
        var newEntry = {};
        newEntry[projectVarKey] = customNameText;
        chrome.storage.sync.set(newEntry);

        // apply name change update
        // $('#'+charge_num_id_str).value
        // ApplyCustomName(innerDoc, parent_id, customNameText);

        // apply to current settings window
        win.document.getElementById('settings_title').textContent = "Settings for: \"" + customNameText + "\"";

        // save project notes
        var projectNotesText = win.document.getElementById('project_notes_text').value;
        var projectNotesKey = charge_num + '_projectNotes';
        debug_log('saving \"' + projectNotesText + '\" to \"' + projectNotesKey + "\"" );
        var newEntry = {};
        newEntry[projectNotesKey] = projectNotesText;
        chrome.storage.sync.set(newEntry);
    }
}

var populatedCustomChargeNums = false;
function firstTimePopulateCustomChargenumDescription() {
    // check to see if they've been populated, if not then populate
    if (populatedCustomChargeNums==false && ($('#LINE_DESC-_0_E').length > 0) ) {
        populatedCustomChargeNums = true;
        console.log('populate custom charge nums for first time!');
        // go through charge nums available
        for (i=0; i<$('#EXSTNG').children().length; i++) {
            initializeCustomChargeDescription(i);
        }
    }
}
function initializeCustomChargeDescription(line_idx) {
    // store original name and replace if custom name exists
    var originalName = $('#LINE_DESC-_'+line_idx+'_E')[0].value;
    var charge_num = $('#UDT02_ID-_'+line_idx+'_E')[0].value;
    var newEntry = {}; newEntry[charge_num + '_originalName'] = originalName;
    chrome.storage.sync.set(newEntry, function() {
        console.log(`saved original name ${originalName} to ${charge_num}_originalName`);
    });
    chrome.storage.sync.get(charge_num + '_customName', function(result) {
        var customName = result[charge_num + '_customName'];
        if (customName) {
            console.log(`applying custom name "${customName}" to ${charge_num}`);
            $(`#LINE_DESC-_${line_idx}_E`)[0].value = customName;
        } else {
            console.log('custom name not yet defined for ' + charge_num);
        }
    });

    // add custom button if doesn't exist
    addCustomChargeDescButton(line_idx);
}
function addCustomChargeDescButton(line_idx) {
    // add button if doesn't exist
    var chargenum = $('#UDT02_ID-_'+i+'_E')[0].value;
    var buttonId = `${chargenum}_button`;
    if (!$(`#${buttonId}`).length) {
        // var descButton = $(`<span id="${buttonId}" ;">Surplus Hours: XX</span>`);
        // $('.subtaskTbl:first').append(printSpanInstance);
        // add a button on end
        var btn = document.createElement("BUTTON");
        btn.setAttribute("class","text-left");
        // <div id="lookup_icon" class="lookupIcon" style="height: 16px; visibility: visible; z-index: 10000; cursor: pointer; border: 0px; background-color: transparent; position: static; margin-top: 2px; width: 18px;"></div>
        btn.setAttribute('style', 'display: inline; width: 15px; text-align: center;');
        // var imgURL = chrome.extension.getURL("icons/icon16.png");
        // btn.setAttribute('style', `background: url(${imgURL})`);
        // btn.setAttribute('style', `background: url(${imgURL})`);
        btn.innerHTML = "&#x22EE";
        // btn.onclick = function() {.
        //     createPopupSettings(line_idx);
        // }

        // append to description element
        // var imgbtn = $(`<button type="button"><span><img src="${imgURL}" /></span>&nbsp;Click Me</button>`)
        $(`#LINE_DESC-_${line_idx}_E`).parent().prepend(btn);
    }
}

// $('#EXSTNG').on('load', function() {console.log('hello there...');});

// var iframe = document.getElementById('unitFrame');
// if (iframe != null) {
//     iframe.addEventListener("load", function() {
//         var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
//         if (innerDoc == null)
//             return;
//         var projectNameColumn = innerDoc.getElementById('udtColumn0');
//         if (projectNameColumn == null)
//             return;      
//         numchildren = projectNameColumn.children.length;
//         for (i=0; i<numchildren; i++) {
//             var el = innerDoc.getElementById('udt' + i + '_0');
//             if (el.textContent.length > 0) {
//                 console.log(el.textContent);
//                 var btn = document.createElement("BUTTON");
//                 btn.setAttribute("class","button_styling");
//                 btn.innerHTML = "&#x22EE "; 
//                 el.appendChild(btn);
//                 // el.insertBefore(btn, el.firstChild);    
//                 // btn.setAttribute("onclick", alert("clicked"));
//             }
//         }
//     });
// }
  