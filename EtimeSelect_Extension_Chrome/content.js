/* Debug Statements */
var DEBUG_STATEMENTS = true;
function debug_log( text ) {
    if (DEBUG_STATEMENTS)
        console.log(text)
}

/* Select the Unselectable Charge Numbers */
function selectElement(e) {
    var x = e.clientX;
    var y = e.clientY;
    var elementMouseIsOver = document.elementsFromPoint(x, y);
    if (elementMouseIsOver == null || elementMouseIsOver[0] == null)
        return null;

    // get the raw text inside selected element
    var raw_text = elementMouseIsOver[0].textContent;
    
    
    // select raw text if not empty and of proper class name
    if (raw_text.length > 0 && elementMouseIsOver[0].className === "u") 
    // if (raw_text.length > 0 && elementMouseIsOver[0].parentElement.id === "udtColumn1" )
    {
        window.getSelection().selectAllChildren(elementMouseIsOver[0]);
    }
}
$(window).click(selectElement);


/* Calculate Surplus Hours Worked */

function isWorkday(innerDoc, date_num) {
    if (innerDoc == null)
        return null;
    
    // hrsHeaderTextX is format, where X is (date_num - 1)
    var id_str = 'hrsHeaderText' + (date_num - 1);
    var hrsHeaderBox = innerDoc.getElementById(id_str);
    if (hrsHeaderBox == null)
        return null;

    var txt = hrsHeaderBox.textContent
    var dayStr = txt.slice(0, 3);
    
    var isTrue = true;
    if (dayStr == 'Sat' || dayStr == 'Sun')
        isTrue = false;
    
    return isTrue;

}

function dayHoursEmpty(innerDoc, date_num) {
    if (innerDoc == null)
        return null;

    //DT2_x is format, where X is (date_num - 1)
    var id_str = 'DT2_' + (date_num - 1);
    var totalDayHoursBox = innerDoc.getElementById(id_str);
    if (totalDayHoursBox == null)
        return null;

    if (totalDayHoursBox.textContent == '')
        return true;
    else 
        return false;

}

var daysInMonth = null;
var currentTotalHours = null;
var lastTotalHours = null;

var originalPrintText = null;
var lastTotalHours = null;
var calculatedSurplusHours = 'calculating...';

// every interval grab info, calculate, and update text
setInterval(function() {
        
    // grab inner doc 
        var iframe = document.getElementById('unitFrame');
        if (iframe == null)
            return;
        var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (innerDoc == null)
            return;
        
        
        // grab total hours worked so far
        var currentTotalHoursBox = innerDoc.getElementById('grandTotal2');
        if (currentTotalHoursBox == null)
            return;
        currentTotalHours = currentTotalHoursBox.textContent;
        // end function if total hours is same as last updated ones

        if (lastTotalHours == null){
            lastTotalHours == currentTotalHours;
        }
        else if (currentTotalHours == lastTotalHours){
            return;
        } else {
            lastTotalHours = currentTotalHours;
        }
        
        // get print location box & original text content
        var printLocation = innerDoc.getElementById('headerValueLabel');
        if (printLocation == null)
            return;
        if (originalPrintText == null) {
            originalPrintText = printLocation.textContent;
        }
        
        // get box for month period total for num days in month and also to print to it
        var monthPeriodEndBox = innerDoc.getElementById('endingDateSpan');
        if (monthPeriodEndBox == null)
            return;
        daysInMonth = monthPeriodEndBox.textContent.split(' ')[1].split(',')[0]; // get number of days in month

        
        // main calculation 
        var foundLastEnteredDay = false;
        var numWorkdaysSoFar = 0;
        for (i=daysInMonth; i>0; i--) {
            // check if found last day
            if (!foundLastEnteredDay){
                // check if that days total hours is empty
                if ( !dayHoursEmpty(innerDoc, i) && isWorkday(innerDoc,i) ){
                    foundLastEnteredDay = true;
                    numWorkdaysSoFar++;
                }
            } 
            // count workdays until last entered day
            else {
                if ( isWorkday(innerDoc, i) ) {
                    numWorkdaysSoFar++;
                }
            }
        }

        // final calc
        calculatedSurplusHours =  currentTotalHours - numWorkdaysSoFar * 8;
        // debug_log('work days so far: ' + numWorkdaysSoFar + ', current total: ' + currentTotalHours + ', surplus: ' + calculatedSurplusHours );
        printLocation.textContent =  'Surplus Hours: ' + calculatedSurplusHours + '\xa0\xa0\xa0\xa0|\xa0\xa0\xa0\xa0' + originalPrintText;
        
}, 1000); // trigger every 1 second(s)



/* Enable Custom Charge Number Names & Project Notes */

function ApplyCustomName(innerDoc, calledBy, customName) {
    innerDoc.getElementById(calledBy + '_projectNameSpan').textContent = customName;
}

function ReplaceOriginalWithCustomName(innerDoc, calledBy, originalName) {
    var projectVarKey = calledBy + "_originalName";
    var newEntry = {};
    newEntry[projectVarKey] = originalName;
    chrome.storage.sync.set(newEntry, function() {
        debug_log('saved original name ' + originalName + ' to ' + calledBy + "_originalName");
        
        // also get custom name and replace now
        var  projectVarKey = calledBy + '_customName';
        chrome.storage.sync.get(projectVarKey, function(result) {
            var customName = result[projectVarKey];
            if (customName) {
                debug_log('applying custom name ' + customName + ' to ' + calledBy);
                //modify text before button with custom name
                ApplyCustomName(innerDoc, calledBy, customName); //innerDoc.getElementById(calledBy + '_projectNameSpan').textContent = customName;
            } else {
                debug_log('custom name not yet defined for ' + calledBy);
            }
        });
    });
}

function popupSettings(innerDoc, button_parent_id) {
    debug_log("Settings popup opened by " + button_parent_id);

    var win = window.open("", "Title", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=400,height=300,top="+(screen.height / 2 - 150)+",left="+(screen.width / 2 - 200));
    win.document.title = "Project Settings";
    var settingsInnerHTML    = "<div id=\"settings_title\">Settings for: \"\"</div>";
    settingsInnerHTML       += "<div id=\"original_name\">Original Name: \"\"</div>";
    
    settingsInnerHTML       += "<p>Custom Project Name:</br>";
    settingsInnerHTML       += "<input id=\"custom_name_text\" type=\"text\">";
    settingsInnerHTML       += "<button id=\"save_proj_name\">Save</button>";
    settingsInnerHTML       += "</p>";

    settingsInnerHTML       += "<p>Project Related Notes:</br>";
    settingsInnerHTML       += "<textarea id=\"project_notes_text\" rows=\"8\" cols=\"50\"></textarea></br>";
    settingsInnerHTML       += "<button id=\"save_proj_notes\">Save</button>";
    settingsInnerHTML       += "</p>";

    win.document.body.innerHTML = settingsInnerHTML;

    // update settings page original and current custom name
    chrome.storage.sync.get(null, function(result) {        
        // retrieve desired variables from sync storage
        var originalNameKey = button_parent_id + "_originalName";
        var originalName = result[originalNameKey];
        var customNameKey = button_parent_id + "_customName";
        var customName = result[customNameKey];
        var projectNotesKey = button_parent_id + "_projectNotes";
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

    // set onclick for saving name
    win.document.getElementById('save_proj_name').onclick = function () {
        var customNameText = win.document.getElementById('custom_name_text').value;
        var projectVarKey = button_parent_id + '_customName';
        debug_log('saving ' + customNameText + ' to ' + projectVarKey );
        var newEntry = {};
        newEntry[projectVarKey] = customNameText;
        chrome.storage.sync.set(newEntry);

        // apply name change update
        ApplyCustomName(innerDoc, button_parent_id, customNameText);

        // apply to current settings window
        win.document.getElementById('settings_title').textContent = "Settings for: \"" + customNameText + "\"";

    }

    // set onclick for saving project notes
    win.document.getElementById('save_proj_notes').onclick = function () {
        var projectNotesText = win.document.getElementById('project_notes_text').value;
        var projectNotesKey = button_parent_id + '_projectNotes';
        debug_log('saving \"' + projectNotesText + '\" to \"' + projectNotesKey + "\"" );
        var newEntry = {};
        newEntry[projectNotesKey] = projectNotesText;
        chrome.storage.sync.set(newEntry);
    }

}

var iframe = document.getElementById('unitFrame');
if (iframe != null) {
    iframe.addEventListener("load", function() {
        
        var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (innerDoc == null)
            return;

        // debug clear sync storage
        // chrome.storage.sync.clear();

        debug_log("Current Chrome Sync Storage: ");
        chrome.storage.sync.get(null, function(result) {
            debug_log(result);
        });

        /* Add buttons to valid projects */ 
        var projectNameColumn = innerDoc.getElementById('udtColumn0');
        if (projectNameColumn == null)
            return;      

        numchildren = projectNameColumn.children.length;
        for (i=0; i<numchildren; i++) {
            var el = innerDoc.getElementById('udt' + i + '_0');
            if (el.textContent.length > 0) {
            
                // saves original name in storage & replaces with last saved custom name
                var originalNameText = el.textContent;
                var calledBy = el.id;

                // wrap existing text in a span & append back
                var projectNameSpan = document.createElement('span');
                projectNameSpan.id = calledBy + "_projectNameSpan";
                projectNameSpan.innerHTML = originalNameText;
                el.innerHTML = "";
                el.appendChild(projectNameSpan);

                // change out original for custom names
                ReplaceOriginalWithCustomName(innerDoc, calledBy, originalNameText);

                // add a button on end
                var btn = document.createElement("BUTTON");
                btn.setAttribute("class","button_styling");
                btn.innerHTML = "&#x22EE";
                btn.onclick = function() {
                    var button_parent_id = this.parentElement.id; 
                    popupSettings(innerDoc, button_parent_id);
                }
                el.appendChild(btn);
            }
        }
    });
}

