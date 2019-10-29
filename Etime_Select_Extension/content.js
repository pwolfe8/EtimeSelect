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
                if (!dayHoursEmpty(innerDoc, i)){
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
        // console.log('work days so far: ' + numWorkdaysSoFar + ', current total: ' + currentTotalHours + ', surplus: ' + calculatedSurplusHours );
        printLocation.textContent =  'Surplus Hours: ' + calculatedSurplusHours + '\xa0\xa0\xa0\xa0|\xa0\xa0\xa0\xa0' + originalPrintText;
        
}, 1000); // trigger every 1 second(s)



/* Enable Custom Charge Number Names */

function HideEtimeEditor(innerDoc) {
    var etimeEditor = innerDoc.getElementById('editor');
    var editorParentChildren = etimeEditor.parentElement.children;
    for (var i = 0; i < editorParentChildren.length; i++) {
        editorParentChildren[i].style.display = "none";
    }
}

function ShowEtimeEditor(innerDoc) {
    var etimeEditor = innerDoc.getElementById('editor');
    var editorParentChildren = etimeEditor.parentElement.children;
    for (var i = 0; i < editorParentChildren.length; i++) {
        editorParentChildren[i].style.display = "inline";
    }
}

// function SaveProjectVariableAsync(key_append, value) {
//     // save project specific value 
//     chrome.storage.sync.get(null, function(result) {
//         // project retrieved by what the modal overlay was called by
//         var projectVarKey = result.calledBy + '_' + key_append;
//         console.log('saving ' + value + ' to ' + projectVarKey );
//         var newEntry = {};
//         newEntry[projectVarKey] = value;
//         chrome.storage.sync.set(newEntry);

//     });
// }

// function GetProjectVariableAsync(key_append) {
//     // get project specific value
//     chrome.storage.sync.get(null, function(result) {
//         // project retrieved by what the modal overlay was called by
//         var projectVarKey = result.calledBy + '_' + key_append;
//         console.log('function retrieving value from ' + projectVarKey + ': ' + result[projectVarKey]);
//         return result[projectVarKey];
//     });
// }

function ReplaceOriginalWithCustomName(innerDoc, calledBy, originalName) {

    var projectVarKey = calledBy + "_originalName";
    var newEntry = {};
    newEntry[projectVarKey] = originalName;
    chrome.storage.sync.set(newEntry, function() {
        console.log('saved original name ' + originalName + ' to ' + calledBy + "_originalName");
        
        // also get custom name and replace now
        var  projectVarKey = calledBy + '_customName';
        chrome.storage.sync.get(projectVarKey, function(result) {
            var customName = result[projectVarKey];
            if (customName) {
                console.log('applying custom name ' + customName + ' to ' + calledBy);
                
                //modify text before button with custom name
                innerDoc.getElementById(calledBy + '_projectNameSpan').textContent = customName;
                // var currentInsides = innerDoc.getElementById(calledBy).innerHTML;
                // var newInsides = customName + '<button' + currentInsides.split('<button')[1];
                // console.log('old insides: ' + currentInsides);
                // console.log('new insides: ' + newInsides);
                // innerDoc.getElementById(calledBy).innerHTML = newInsides;

            } else {
                console.log('custom name not yet defined for ' + calledBy);
            }
        });
    });


    
}


var iframe = document.getElementById('unitFrame');
if (iframe != null) {
    iframe.addEventListener("load", function() {
        
        var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (innerDoc == null)
            return;

        // debug print current chrome sync storage
        console.log("Current Chrome Sync Storage: ");
        chrome.storage.sync.get(null, function(result) {
            console.log(result);
        });
        // TODO: find a way to reset sync storage

        /* create & inject modal to inner doc */   
        var myModalLocation = innerDoc.getElementById('unitDiv');
            // create modal 
            var modalDiv = document.createElement('div');
                modalDiv.id = "myModal";
                modalDiv.setAttribute("class", "modal");
                    // modal state "calledBy" for storing button that opened the modal
                    
                    var modalState = document.createElement('data');
                    modalState.id = "calledBy";
                    modalDiv.appendChild(modalState);
                    
                    

                    // modal content div for formatting
                    var modalContent = document.createElement('div');
                    modalContent.setAttribute("class", "modal_content");      
                        // modal span for close button                  
                        var modalSpan = document.createElement('span');
                            modalSpan.setAttribute("class", "close_modal");
                            modalSpan.innerHTML = "&times";
                            modalSpan.onclick = function () {
                                var modal = innerDoc.getElementById('myModal');
                                modal.style.display = "none";
                                
                                ShowEtimeEditor(innerDoc);
                            }
                        modalContent.appendChild(modalSpan);

                        // modal header
                        var modalHeader = document.createElement('p');
                        modalHeader.innerHTML = "Project Settings for [charge num here]";
                        modalContent.appendChild(modalHeader);

                        // Project Name Change Form
                        var myProjectName = document.createElement('p');
                        myProjectName.innerHTML = "Custom Project Name: ";
                            var myProjectNameInput = document.createElement('input');
                            myProjectNameInput.id = "myProjectNameInput";
                            myProjectNameInput.setAttribute('type', 'text');
                            myProjectName.appendChild(myProjectNameInput);

                            var readProjectNameInput = document.createElement('button');
                            readProjectNameInput.textContent = "save";
                            readProjectNameInput.onclick = function () {
                                // save custom name
                                var customNameText = innerDoc.getElementById('myProjectNameInput').value;
                                
                                // SaveProjectVariableAsync('customName', customNameText);
                                // chrome.storage.sync.get(null, function(result) {
                                //     var projectVarKey = result.calledBy + '_customName';
                                //     console.log('saving ' + customNameText + ' to ' + projectVarKey );
                                //     var newEntry = {};
                                //     newEntry[projectVarKey] = customNameText;
                                //     chrome.storage.sync.set(newEntry);
                                // });

                                // apply name
                                // chrome.storage.sync.get(null, function(result) {
                                //     var projectVarKey = result.calledBy + '_customName';
                                //     console.log('retrieved save: ' + result[projectVarKey]);
                                // });

                            }
                            myProjectName.appendChild(readProjectNameInput);
                        modalContent.appendChild(myProjectName);

                        // Original Project Name Form
                        var originalProjectName = document.createElement('p');
                        originalProjectName.id = "originalProjectName";
                        // originalProjectNamePar.innerHTML = "Original Project Name: "; // innerhtml set by button initializations 
                        modalContent.appendChild(originalProjectName);

                        var myProjectNotes = document.createElement('span');
                        myProjectNotes.innerHTML = "Project Notes: </br>";
                            var myProjectNotesTextArea = document.createElement('textarea');
                            myProjectNotesTextArea.id = "myProjectNotesTextArea";
                            myProjectNotesTextArea.setAttribute("rows", "8");
                            myProjectNotesTextArea.setAttribute("cols", "40");
                            myProjectNotes.appendChild(myProjectNotesTextArea);

                            var newline = document.createElement('span');
                            newline.innerHTML = "</br>";
                            myProjectNotes.appendChild(newline);

                            var saveProjectNotes = document.createElement('button');
                            saveProjectNotes.textContent = "save notes";
                            saveProjectNotes.onclick = function () {
                                var customNotesText = innerDoc.getElementById('myProjectNotesTextArea').value;
                                console.log('got notes: ' + customNotesText);
                            }
                            myProjectNotes.appendChild(saveProjectNotes);

                        modalContent.appendChild(myProjectNotes);

            modalDiv.appendChild(modalContent);
        myModalLocation.appendChild(modalDiv);

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

                    HideEtimeEditor(innerDoc);

                    var modal = innerDoc.getElementById('myModal');
                    modal.style.display = "block";
                    modal.focus();
                    innerDoc.getElementById('myProjectNameInput').focus();

                    var modalState = innerDoc.getElementById('calledBy');
                    modalState.setAttribute("value", this.parentElement.id);
                    console.log('myModal opened by: ' + modalState.value);

                    // Fill Modal with Project Relavant info
                    // load
                    // innerDoc.getElementById('originalProjectName').innerHTML = "Original Project Name: " + originalNameText;
                };
                el.appendChild(btn);
            }

        }

    });
}



/* TODO: Attempt to enable backspace key & later enter key */
// $(window).on("keydown", function(e, t) {
//     console.log("keycode: " + e.keyCode);
//     if (e.keyCode == 8)  { // && (!/^input$/i.test(t.tagName) || t.disabled || t.readOnly))
//         e.stopEvent();
//     }
// });

