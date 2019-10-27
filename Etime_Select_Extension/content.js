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
        chrome.storage.sync.get(null, function(result) {
            console.log('chrome storage: ' + result.test_setting );
        });
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

var iframe = document.getElementById('unitFrame');
if (iframe != null) {
    iframe.addEventListener("load", function() {
        
        var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (innerDoc == null)
            return;

        /* Create Modal Div and attach to  */   
        var myModalLocation = innerDoc.getElementById('unitDiv');

            var modalDiv = document.createElement('div');
                modalDiv.id = "myModal";
                modalDiv.setAttribute("class", "modal");
                    var modalContent = document.createElement('div');
                    modalContent.setAttribute("class", "modal_content");                        
                        var modalSpan = document.createElement('span');
                            modalSpan.setAttribute("class", "close_modal");
                            modalSpan.innerHTML = "&times";
                            modalSpan.onclick = function () {
                                // var modal = this.parentElement.parentElement.parentElement.firstElementChild; // get myModal
                                var modal = innerDoc.getElementById('myModal');
                                modal.style.display = "none";
                            }
                        modalContent.appendChild(modalSpan);

                        var modalText = document.createElement('p');
                        modalText.innerHTML = "Project Settings for [charge num here]";
                        modalContent.appendChild(modalText);

                        var myProjectName = document.createElement('p');
                        myProjectName.innerHTML = "Custom Project Name: ";
                            var myProjectNameInput = document.createElement('input');
                            myProjectNameInput.id = "myProjectNameInput";
                            myProjectNameInput.setAttribute('class', 'native-key-bindings');
                            myProjectNameInput.setAttribute('type', 'text');
                            myProjectName.appendChild(myProjectNameInput);

                            var readProjectNameInput = document.createElement('button');
                            readProjectNameInput.textContent = "read input";
                            readProjectNameInput.onclick = function () {
                                customNameText = innerDoc.getElementById('myProjectNameInput').value;
                                console.log('got: ' + customNameText);
                            }
                            myProjectName.appendChild(readProjectNameInput);
                        modalContent.appendChild(myProjectName);

                        var myProjectNotes = document.createElement('p');
                        myProjectNotes.innerHTML = "Project Notes: ";
                            var myProjectNotesInput = document.createElement('input');
                            myProjectNotesInput.id = "myProjectNotesInput";
                            myProjectNotesInput.setAttribute('class', 'native-key-bindings');
                            myProjectNotesInput.setAttribute('type', 'text');
                            myProjectNotes.appendChild(myProjectNotesInput);
                        modalContent.appendChild(myProjectNotes);


                modalDiv.appendChild(modalContent);
            myModalLocation.appendChild(modalDiv);
        
        /* Add buttons to project name column to access modal */ 
        var projectNameColumn = innerDoc.getElementById('udtColumn0');
        if (projectNameColumn == null)
            return;      

        numchildren = projectNameColumn.children.length;
        for (i=0; i<numchildren; i++) {
            var el = innerDoc.getElementById('udt' + i + '_0');
            if (el.textContent.length > 0) {
            
                var btn = document.createElement("BUTTON");
                btn.setAttribute("class","button_styling");
                btn.innerHTML = "&#x22EE";                 
                btn.onclick = function() {
                    chrome.storage.sync.set({"test_setting": "pizza666" });
                    console.log('modal opened by: ' + this.parentElement.textContent);

                    var currentEditor = innerDoc.getElementById('editor');
                    var editorParentChildren = currentEditor.parentElement.children;
                    for (var i = 0; i < editorParentChildren.length; i++) {
                        editorParentChildren[i].style.display = "none";
                    }

                    var modal = innerDoc.getElementById('myModal');
                    modal.style.display = "block";
                    modal.focus();
                    innerDoc.getElementById('myProjectNameInput').focus();
                };
                el.appendChild(btn);
            }
                

        }

    });
}

