function selectElement(e) {
    var x = e.clientX, y = e.clientY,
        elementMouseIsOver = document.elementsFromPoint(x, y);

    // get the raw text inside selected element
    var raw_text = elementMouseIsOver[0].textContent;
    // console.log(elementMouseIsOver[0]); // for debug
    
    // select raw text if not empty and of proper class name
    if (raw_text.length > 0 && elementMouseIsOver[0].className === "u") {
        window.getSelection().selectAllChildren(elementMouseIsOver[0]);
    }
}

$(window).click(selectElement);

