function ancestor(HTMLobj){
    while(HTMLobj.parentElement){HTMLobj=HTMLobj.parentElement}
    return HTMLobj;
}
function inTheDOM(obj){
    return ancestor(obj)===document.documentElement;
}
function createDiv(id, className, style, mouseDownEvent, mouseUpEvent) {
   return createElement('div', id, className, style, mouseDownEvent, mouseUpEvent);
}

function createElement(tag, id, className, style, mouseDownEvent, mouseUpEvent) {
    var ele = document.createElement(tag);
    if (typeof(id) !== 'undefined' && id != null)
        ele.id = id;
    if (typeof(className) !== 'undefined' && className != null)
        ele.className = className;
    if (typeof(style) !== 'undefined' && style != null)
        ele.style.cssText = style;
    if (typeof(mouseDownEvent) !== 'undefined' && mouseDownEvent != null)
        ele.addEventListener('mousedown', mouseDownEvent, false)
    if (typeof(mouseUpEvent) !== 'undefined' && mouseUpEvent != null)
        ele.addEventListener('mouseup', mouseUpEvent, false)
    return ele;
}

function checkForStyleSheet(href) {
    var styleSheets = document.styleSheets;
    for(i = 0; i < styleSheets.length; ++i) {
        if (styleSheets[i].href == href)
            return true;
    }
    return false;
}

function addCss(fileName) {

  var head = document.head
    , link = document.createElement('link')

  link.type = 'text/css'
  link.rel = 'stylesheet'
  link.href = fileName

  head.appendChild(link)
}

if (!Object.prototype.appendDiv) {
    Object.defineProperty(Object.prototype, "appendDiv", { 
        value: function(id, className, style, mouseDownEvent, mouseUpEvent) {
            return this.appendElement('div', id, className, style, mouseDownEvent, mouseUpEvent);
        },
        enumerable : false
    });
}

if (!Object.prototype.appendElement) {
    Object.defineProperty(Object.prototype, "appendElement", { 
        value: function(tag, id, className, style, mouseDownEvent, mouseUpEvent) {
            var ele = createElement(tag, id, className, style, mouseDownEvent, mouseUpEvent);
            if (this.appendChild)
                this.appendChild(ele);
            return ele;
        },
        enumerable : false
    });
}

if (!Object.prototype.insertElement) {
    Object.defineProperty(Object.prototype, "insertElement", { 
        value: function(tag, order, id, className, style, mouseDownEvent, mouseUpEvent) {
            var ele = createElement(tag, id, className, style, mouseDownEvent, mouseUpEvent);
            if (typeof(order) !== "number" || order < 1)
                order = 1;
            var refEle = this.querySelector('*:nth-child(' + order + ')');
            this.insertBefore(ele, refEle);
            return ele;
        },
        enumerable : false
    });
}

if (!Object.prototype.cloneAppend) {
    Object.defineProperty(Object.prototype, "cloneAppend", { 
        value: function(id) {
            var temp = createElement(this.parentElement.nodeName);
            temp.innerHTML = this.outerHTML.replace(/id="([\w-]+)"/g, 'id="$1' + id + '"');
            return temp.firstChild;
        },
        enumerable : false
    });
}

if (!Object.prototype.appendCloneAppend) {
    Object.defineProperty(Object.prototype, "appendCloneAppend", { 
        value: function(ele, id) {
            var temp = ele.cloneAppend(id);
            this.appendChild(temp);
            return temp;
        },
        enumerable : false
    });
}

if (!Object.prototype.appendShallowCloneAppend) {
    Object.defineProperty(Object.prototype, "appendShallowCloneAppend", { 
        value: function(ele, id, className) {
            var temp = ele.cloneNode();
            if (typeof(id) !== 'undefined' && id != null)
                temp.id += id;
            if (typeof(className) !== 'undefined' && className != null)
                temp.className += ' ' + className;
            this.appendChild(temp);
        return temp;
        },
        enumerable : false
    });
}

var HtmlElementToString = (function(ele) {
   var results = new RegExp('^(<((?!>).)*>).*(<((?!>).)*>)$', '').exec(ele.outerHTML.replace(/\n/g, ''));
   return results[1] + results[3];
});


var collingwood = (function(selector, debug) {
    if (typeof(selector) === 'undefined')
        selector = 'table.collingwood';
    if (typeof(debug) === 'undefined')
        debug = false;
    if (debug) { console.log('Running Collingwood on ' + selector); }
    var tables = document.querySelectorAll(selector);
    if (debug) { console.log('  |- found ' + tables.length); }
    for(i = 0; i < tables.length; ++i) {
        table = tables[i];
        if (debug) { console.log('  |- Running instance index ' + i); }
        if (debug) { console.log('    |- ' + HtmlElementToString(table)); }
        var tableParent = table.parentElement;
        if (tableParent.id == 'original' || tableParent.classList.contains('scrollingTableLeftSide') || tableParent.classList.contains('scrollingTableRight') || tableParent.classList.contains('scrollingTableOverflow') || table.classList.contains('scrollingTableLeftSide') || table.classList.contains('scrollingTableRight') ) {
            if (debug) { console.log('    |- Aborting, this table already has collingwood implemented.'); }
            continue;
        }
        //Force having a thead
        var headerHeight = 1; //Also calculate header height since we're already looping through them
        var tableChildren = table.children;
        var headers = table.querySelectorAll('.fixed-head');
        if (headers.length == 0)
            table.querySelectorAll('th').forEach(function(th) { if (!th.parentElement.classList.contains('fixed-head')) th.parentElement.classList.add('fixed-head');});
        var headers = table.querySelectorAll('.fixed-head');
        var thead = table.querySelector('thead');
        if (!thead)
            thead = table.insertElement('thead');
        for(j = 0; j < headers.length; ++j) {
            if (headers[j].parentElement != thead)
                thead.appendChild(headers[j]);
            var header = headers[j];
            headerHeight += header.clientHeight;        
        }
            
        headerHeight = headerHeight + 'px';
        
        var cols = table.querySelectorAll('tr:first-child>td.fixedCol');
        var colWidth = 0;
        for(j = 0; j < cols.length; ++j) {
            var col = cols[j];
            colWidth += col.clientWidth;
        }
        var colCount = cols.length;
        colWidth = colWidth + 'px';
        
        var tableContainer = tableParent.appendDiv(null, 'tableContainer collingwood');
            var stickyHeaderContainer = tableContainer.appendDiv(null, 'stickyHeaderContainer');
                var scrollingTables = stickyHeaderContainer.appendDiv(null, 'scrollingTables scrollingTableFixedHeader');
                    var scrollingTableLeftSide = scrollingTables.appendDiv(null, 'scrollingTableLeftSide');
                        var tableHeaderLeft = scrollingTableLeftSide.appendShallowCloneAppend(table, '-head-left', ' scrollingTableLeft');
                            var headerTag = 'thead'; //headers[0].parentElement.nodeName;
                            var tHeadHeaderLeft = tableHeaderLeft.appendElement(headerTag);
                                for(j = 0; j < headers.length; ++j) {
                                    var header = headers[j];
                                    var newHeader = tHeadHeaderLeft.appendCloneAppend(header, '-head-left');
                                    var cols = header.querySelectorAll('th, td');
                                    var newCols = newHeader.querySelectorAll('th, td');
                                    for(k = 0; k < cols.length; ++k) {
                                        var desiredWidth = cols[k].clientWidth;
                                        newCols[k].offset = 0;
                                        newCols[k].style.width = desiredWidth + 'px';
                                        newCols[k].style.minWidth = newCols[k].style.width;
                                        if (newCols[k].clientWidth != desiredWidth) { //compsenate for padding, margin, border, etc.
                                            var offset = (desiredWidth - newCols[k].clientWidth);
                                            if (detectIE() && tableHeaderLeft.border && tableHeaderLeft.border > 0) {
                                                offset += parseInt(tableHeaderLeft.border, 10);
                                            }
                                            var newWidth = offset + desiredWidth;
                                            newCols[k].offset = offset;
                                            newCols[k].style.width = newWidth + 'px';
                                            newCols[k].style.minWidth = newCols[k].style.width;
                                        }
                                    }
                                }
                            var tBodyLeft = headerTag == 'TBODY' ? tHeadHeaderLeft : tableHeaderLeft.appendElement('tbody');
                            tBodyLeft.className = 'scrollIndicators';
                                trBodyLeft = tBodyLeft.appendElement('tr', null, 'scrollIndicatorLeftShown scrollIndicatorRightShown');
                                    scrollIndicatorSpacer = trBodyLeft.appendElement('td');
                                    scrollIndicatorSpacer.setAttribute("colSpan", colCount);
                                    scrollIndicatorLeft = trBodyLeft.appendElement('td').appendDiv(null, 'scrollIndLft', 'left: ' + colWidth);
                                        scrollIndicatorLeft.appendDiv(null, 'scrollIndArr', 'height: ' + headerHeight, function(){scrollPannable(this, -1, true)}, function(){scrollPannable(this, 0, false)});
                                        scrollIndicatorLeft.appendDiv(null, 'shadow');
                                    scrollIndicatorRight = trBodyLeft.appendElement('td').appendDiv(null, 'scrollIndRgt');
                                        scrollIndicatorRight.appendDiv(null, 'scrollIndArr', 'height: ' + headerHeight, function(){scrollPannable(this, 1, true)}, function(){scrollPannable(this, 0, false)});
                                        scrollIndicatorRight.appendDiv(null, 'shadow');
                    var scrollingTableRightSide = scrollingTables.appendDiv(null, 'scrollingTableRightSide pannable');
                        var scrollingTableOverflow = scrollingTableRightSide.appendDiv(null, 'scrollingTableOverflow');
                            var tableHeaderRight = scrollingTableOverflow.appendShallowCloneAppend(table, '-head-right', ' scrollingTableRight');
                            var tHeadHeaderRight = tableHeaderRight.appendElement(headerTag);
                                for(j = 0; j < headers.length; ++j) {
                                    var header = headers[j];
                                    var newHeader = tHeadHeaderRight.appendCloneAppend(header, '-head-left');
                                    var cols = header.querySelectorAll('th, td');
                                    var newCols = newHeader.querySelectorAll('th, td');
                                    for(k = 0; k < cols.length; ++k) {
                                        var desiredWidth = cols[k].clientWidth;
                                        newCols[k].offset = 0;
                                        newCols[k].style.width = desiredWidth + 'px';
                                        newCols[k].style.minWidth = newCols[k].style.width;
                                        if (newCols[k].clientWidth != desiredWidth) { //compsenate for padding, margin, border, etc.
                                            var offset = (desiredWidth - newCols[k].clientWidth);
                                            if (detectIE() && tableHeaderRight.border && tableHeaderRight.border > 0) {
                                                offset += parseInt(tableHeaderRight.border, 10);
                                            }
                                            var newWidth = offset + desiredWidth;
                                            newCols[k].offset = offset;
                                            newCols[k].style.width = newWidth + 'px';
                                            newCols[k].style.minWidth = newCols[k].style.width;
                                        }
                                    }
                                }
            var tableContainers = tableContainer.appendDiv('tableContainers',  'scrollingTables');
                var original = tableContainers.appendDiv('original', 'scrollingTableLeftSide');
                    original.appendChild(table);
                var originalClone = tableContainers.appendDiv(null, 'scrollingTableRightSide pannable');
                    var scrollingTableOverflow2 = originalClone.appendDiv(null, 'scrollingTableOverflow');
                        var fullTableClone = scrollingTableOverflow2.appendCloneAppend(table, '-fullTableClone');
        //Show non-sticky header if IE
        if (detectIE()) {
            originalClone.querySelector('thead').classList.add('ieShow');;
            original.querySelector('thead').classList.add('ieShow');
            var parentSearch = tableContainer;
            do {
                styles = window.getComputedStyle(parentSearch, null);
                if (styles.position.toLowerCase() == 'fixed' && styles.overflow.toLowerCase() == 'auto') {
                    var scrollableParent = parentSearch;
                    parentSearch = null; //to exit loop safely
                    tableContainer.scrollableParent = scrollableParent;
                    scrollableParent.onscroll = function() {
                        IEscrolling();
                    };
                } else {
                    parentSearch = parentSearch.parentElement;
                }                
            } while(parentSearch != null);
        }
    }
    resizeFixedHeaders();
});

window.onresize = function (event) {
    resizeFixedHeaders();
};

window.onscroll = function() {
    IEscrolling();
};

var scrollPannable = (function () {
    var targetTracker = {};
    var containerTracker = {};
    var mouseTracker = {};
    return function (target, dir, mouseDown) {
        if (typeof(mouseDown) === 'boolean')
            mouseTracker[target] = mouseDown;
        if (!mouseTracker[target] || !inTheDOM(target))
            return;
        if (!targetTracker[target] || !inTheDOM(targetTracker[target])) {
            var tableContainerCollingwood = target.parentElement;
            while (!(tableContainerCollingwood.classList.contains('tableContainer') && tableContainerCollingwood.classList.contains('collingwood')))
                tableContainerCollingwood = tableContainerCollingwood.parentElement;
            targetTracker[target] = tableContainerCollingwood.querySelectorAll('.pannable');
            containerTracker[target] = tableContainerCollingwood;
        }
        targetTracker[target].forEach(function(e) {e.scrollLeft += dir * 8});
        checkScrollArrows(containerTracker[target]);
        setTimeout(function() {scrollPannable(target, dir);}, 1);
    }
})();

function resizeFixedHeaders() {
    var containers = document.querySelectorAll('div.tableContainer.collingwood');
    for (i = 0; i < containers.length; ++i) {
        var container = containers[i];
        var stickyLeftTable = container.querySelector('.stickyHeaderContainer>.scrollingTables>.scrollingTableLeftSide>table');
        var stickyLeft = stickyLeftTable.querySelectorAll('.fixed-head');
        var stickyRightTable = container.querySelector('.stickyHeaderContainer>.scrollingTables>.scrollingTableRightSide table');
        var stickyRight = stickyRightTable.querySelectorAll('.fixed-head');
        if (stickyLeft.length != stickyRight.length) {
            continue;
        }
        var originalTable = container.querySelector('#original>table');
        var originalWidth = window.getComputedStyle(originalTable, null).width;
        stickyLeftTable.style.width = originalWidth;
        stickyRightTable.style.width = originalWidth;
        var original = originalTable.querySelectorAll('.fixed-head');
        for (j = 0; j < stickyLeft.length; ++j) {
            var stickyLeftCols = stickyLeft[j].querySelectorAll('th, td');
            var stickyRightCols = stickyRight[j].querySelectorAll('th, td');
            var originalCols = original[j].querySelectorAll('th, td');
            for (k = 0; k < stickyLeftCols.length; ++k) {
                if (false && detectIE()) {
                    var originalStyle = window.getComputedStyle(originalCols[k], null);
                    for(var propertyName in originalStyle) {
                        //if (propertyName.startsWith('border')) {
                            stickyLeftCols[k].style[propertyName] = originalStyle[propertyName];
                            stickyRightCols[k].style[propertyName] = originalStyle[propertyName];
                        //}
                    }
                
                    window.getComputedStyle(document.querySelector("#original table"), null)
                }
                var width = originalCols[k].clientWidth + stickyLeftCols[k].offset;
                stickyLeftCols[k].style.width = width + 'px';
                stickyLeftCols[k].style.minWidth = stickyLeftCols[k].style.width;
                stickyRightCols[k].style.width = stickyLeftCols[k].style.width;
                stickyRightCols[k].style.minWidth = stickyLeftCols[k].style.width;
            }
        }
        
        //Left arrow alignment
        var cols = originalTable.querySelectorAll('tr:first-child>td.fixedCol');
        var colWidth = 0;
        for(j = 0; j < cols.length; ++j) {
            var col = cols[j];
            colWidth += col.clientWidth;
        }
        var colCount = cols.length;
        colWidth = colWidth + 'px';
        container.querySelector('.scrollIndLft').style.left = colWidth;
        
        checkScrollArrows(container);
    }
    IEscrolling();
};

function IEscrolling() {
    if (!detectIE()) {
        return;
    }
    //IE doesn't support sticky so the sticky header will have to use fixed and be turn on and off based on scrolling
    //Likewise the non-sticky header has to be controlled with the opposite conditions (Set in Collingwood function)
    var containers = document.querySelectorAll('div.tableContainer.collingwood');
    for (i = 0; i < containers.length; ++i) {
        var container = containers[i];
        var stickyHeaderContainer = container.querySelector('.stickyHeaderContainer');
        var showSticky = container.getBoundingClientRect().top <= 0;
        if (container.scrollableParent) {
            showSticky = container.getBoundingClientRect().top <= container.scrollableParent.getBoundingClientRect().top;
            stickyHeaderContainer.style.top = container.scrollableParent.getBoundingClientRect().top + 'px';
        }
        var tableContainers = container.querySelector('#tableContainers.scrollingTables');
        //Show/Hide sticky header
        stickyHeaderContainer.style.display = showSticky ? 'block' : 'none';
        stickyHeaderContainer.style.width = tableContainers.getBoundingClientRect().width + 'px';        
    }
}

function checkScrollArrows(container) {
    var scrollingTableOverflow = container.querySelector('div.scrollingTableOverflow').parentElement;
    var hideScroll = scrollingTableOverflow.scrollWidth - scrollingTableOverflow.clientWidth <= 10;
    var hideLftScroll = hideScroll;
    var hideRgtScroll = hideScroll;
    if (!hideScroll) {
        if (scrollingTableOverflow.scrollLeft == 0)
            hideLftScroll = true;
        if (scrollingTableOverflow.scrollLeft == scrollingTableOverflow.scrollWidth - scrollingTableOverflow.clientWidth)
            hideRgtScroll = true;
    }
    container.querySelector('div.scrollIndLft').style.display = hideLftScroll ? 'none' : 'block';
    container.querySelector('div.scrollIndRgt').style.display = hideRgtScroll ? 'none' : 'block';
}

(function() {
    collingwoodCss = 'https://intranet.pilotpen.com/collingwood/css/collingwood.css';
    if (!checkForStyleSheet(collingwoodCss))
        addCss(collingwoodCss);
})();


if (!Object.prototype.forEach) {
    Object.defineProperty(Object.prototype, "forEach", { 
        value: function(callback) {

            var T, k;

            if (this == null) {
              throw new TypeError('this is null or not defined');
            }

            // 1. Let O be the result of calling toObject() passing the
            // |this| value as the argument.
            var O = Object(this);

            // 2. Let lenValue be the result of calling the Get() internal
            // method of O with the argument "length".
            // 3. Let len be toUint32(lenValue).
            var len = O.length >>> 0;

            // 4. If isCallable(callback) is false, throw a TypeError exception. 
            // See: http://es5.github.com/#x9.11
            if (typeof callback !== 'function') {
              throw new TypeError(callback + ' is not a function');
            }

            // 5. If thisArg was supplied, let T be thisArg; else let
            // T be undefined.
            if (arguments.length > 1) {
              T = arguments[1];
            }

            // 6. Let k be 0
            k = 0;

            // 7. Repeat, while k < len
            while (k < len) {

              var kValue;

              // a. Let Pk be ToString(k).
              //    This is implicit for LHS operands of the in operator
              // b. Let kPresent be the result of calling the HasProperty
              //    internal method of O with argument Pk.
              //    This step can be combined with c
              // c. If kPresent is true, then
              if (k in O) {

                // i. Let kValue be the result of calling the Get internal
                // method of O with argument Pk.
                kValue = O[k];

                // ii. Call the Call internal method of callback with T as
                // the this value and argument list containing kValue, k, and O.
                callback.call(T, kValue, k, O);
              }
              // d. Increase k by 1.
              k++;
            }
            // 8. return undefined
            
        },
        enumerable : false
    });
}

function detectIE() {
  var ua = window.navigator.userAgent;

  // Test values; Uncomment to check result …

  // IE 10
  // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';
  
  // IE 11
  // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
  
  // Edge 12 (Spartan)
  // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';
  
  // Edge 13
  // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  var edge = ua.indexOf('Edge/');
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
  }

  // other browser
  return false;
}