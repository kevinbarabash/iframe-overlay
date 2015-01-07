"use strict";

/**
 * Creates an overlay on top of an iframe that intercepts and retriggers mouse
 * events.  The purpose of this is two-fold:
 * - provide better user experience when a drag operation leaves iframe's bounds
 * - allow events to be filtered to toggle interactivity without having to modify
 *   the code runing inside the iframe
 */

var Poster = require("poster");
var EventSim = require("eventsim");
var LinkedList = require("basic-ds").LinkedList;

function createOverlay(iframe) {
    var wrapper = document.createElement("span");
    wrapper.setAttribute("style", "position:relative;padding:0;margin:0;display:inline-block;");
    wrapper.setAttribute("class", "wrapper");

    var overlay = document.createElement("span");
    overlay.setAttribute("style", "position:absolute;left:0;top:0;width:100%;height:100%;");
    overlay.setAttribute("class", "overlay");
    overlay.setAttribute("tabindex", "0"); // allwos the span to have focus

    var parent = iframe.parentElement;
    parent.insertBefore(wrapper, iframe);
    wrapper.appendChild(iframe);
    wrapper.appendChild(overlay);

    var down = false;
    var paused = false;
    var queue = new LinkedList();

    var poster = new Poster(iframe.contentWindow);

    function postMouseEvent(e) {
        if (paused) {
            e.timestamp = Date.now(); // Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=238041
            queue.push_front(e);
        } else {
            var bounds = wrapper.getBoundingClientRect();
            poster.post("mouse", {
                type: e.type,
                x: e.pageX - bounds.left,
                y: e.pageY - bounds.top,
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                metaKey: e.metaKey
            });
        }
    }

    function postKeyboardEvent(e) {
        if (paused) {
            e.timestamp = Date.now(); // Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=238041
            queue.push_front(e);
        } else {
            poster.post("keyboard", {
                type: e.type,
                keyCode: e.keyCode,
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                metaKey: e.metaKey
            });
        }
    }

    overlay.addEventListener("click", function (e) {
        return postMouseEvent(e);
    });
    overlay.addEventListener("dblclick", function (e) {
        return postMouseEvent(e);
    });
    overlay.addEventListener("mouseover", function (e) {
        return postMouseEvent(e);
    });
    overlay.addEventListener("mouseout", function (e) {
        return postMouseEvent(e);
    });

    overlay.addEventListener("mousedown", function (e) {
        down = true;
        postMouseEvent(e);
    });

    overlay.addEventListener("mousemove", function (e) {
        if (!down) {
            postMouseEvent(e);
        }
    });

    window.addEventListener("mousemove", function (e) {
        if (down) {
            e.preventDefault();
            postMouseEvent(e);
        }
    });

    window.addEventListener("mouseup", function (e) {
        if (down) {
            down = false;
            postMouseEvent(e);
        }
    });

    overlay.addEventListener("keydown", function (e) {
        return postKeyboardEvent(e);
    });
    overlay.addEventListener("keypress", function (e) {
        return postKeyboardEvent(e);
    });
    overlay.addEventListener("keyup", function (e) {
        return postKeyboardEvent(e);
    });

    var keyEventRegex = /key(up|down|press)/;
    var mouseEventRegex = /click|dblclick|mouse(up|down|move|over|out)/;

    return {
        pause: function pause() {
            paused = true;
        },
        resume: function resume() {
            if (!paused) {
                // guard against multiple calls to resume()
                return;
            }
            paused = false;

            function pop() {
                if (paused) {
                    return; // if something has paused use since we posted the last event return
                }

                var e = queue.pop_back();
                if (!e) {
                    return;
                }

                if (e instanceof MouseEvent) {
                    postMouseEvent(e);
                } else if (e instanceof KeyboardEvent) {
                    postKeyboardEvent(e);
                } else if (mouseEventRegex.test(e.type)) {
                    postMouseEvent(e);
                } else if (keyEventRegex.test(e.type)) {
                    postKeyboardEvent(e);
                }

                if (queue.last && queue.last.value) {
                    var next = queue.last.value; // TODO: change last to lastNode
                    var delay = next.timestamp - e.timestamp; // Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=238041
                    setTimeout(pop, delay);
                }
            }
            pop();
        }
    };
}

function createRelay(element) {
    var poster = new Poster(window.parent);

    poster.listen("mouse", function (e) {
        EventSim.simulate(element, e.type, {
            clientX: e.x,
            clientY: e.y,
            altKey: e.altKey,
            shiftKey: e.shiftKey,
            metaKey: e.metaKey,
            ctrlKey: e.ctrlKey
        });
    });

    poster.listen("keyboard", function (e) {
        EventSim.simulate(element, e.type, {
            keyCode: e.keyCode,
            altKey: e.altKey,
            shiftKey: e.shiftKey,
            metaKey: e.metaKey,
            ctrlKey: e.ctrlKey
        });
    });
}


exports.createOverlay = createOverlay;
exports.createRelay = createRelay;