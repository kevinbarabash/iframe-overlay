/**
 * Creates an overlay on top of an iframe that intercepts and retriggers mouse
 * events.  The purpose of this is two-fold:
 * - provide better user experience when a drag operation leaves iframe's bounds
 * - allow events to be filtered to toggle interactivity without having to modify
 *   the code runing inside the iframe
 */

import Poster = require("../node_modules/poster/lib/poster");
import EventSim = require("../node_modules/eventsim/lib/eventsim");
import basic = require("../node_modules/basic-ds/lib/basic");

export function createOverlay(iframe) {

    var wrapper = document.createElement("span");
    wrapper.setAttribute("style", "position:relative;padding:0;margin:0;display:inline-block;");
    wrapper.setAttribute("class", "wrapper");

    var overlay = document.createElement("span");
    overlay.setAttribute("style", "position:absolute;left:0;top:0;width:100%;height:100%;");
    overlay.setAttribute("class", "overlay");
    overlay.setAttribute("tabindex", "0");    // allwos the span to have focus

    var parent = iframe.parentElement;
    parent.insertBefore(wrapper, iframe);
    wrapper.appendChild(iframe);
    wrapper.appendChild(overlay);

    var down = false;
    var paused = false;
    var queue = new basic.LinkedList<Event>();

    var poster:Poster = new Poster(iframe.contentWindow);

    function postMouseEvent(e: MouseEvent) {
        if (paused) {
            e["timestamp"] = Date.now();    // Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=238041
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

    function postKeyboardEvent(e: KeyboardEvent) {
        if (paused) {
            e["timestamp"] = Date.now();    // Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=238041
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

    overlay.addEventListener("click", e => postMouseEvent(e));
    overlay.addEventListener("dblclick", e => postMouseEvent(e));
    overlay.addEventListener("mouseover", e => postMouseEvent(e));
    overlay.addEventListener("mouseout", e => postMouseEvent(e));

    overlay.addEventListener("mousedown", e => {
        down = true;
        postMouseEvent(e);
    });

    overlay.addEventListener("mousemove", e => {
        if (!down) {
            postMouseEvent(e);
        }
    });

    window.addEventListener("mousemove", e => {
        if (down) {
            e.preventDefault();
            postMouseEvent(e);
        }
    });

    window.addEventListener("mouseup", e => {
        if (down) {
            down = false;
            postMouseEvent(e);
        }
    });

    overlay.addEventListener("keydown", e => postKeyboardEvent(e));
    overlay.addEventListener("keypress", e => postKeyboardEvent(e));
    overlay.addEventListener("keyup", e => postKeyboardEvent(e));

    var keyEventRegex = /key(up|down|press)/;
    var mouseEventRegex = /click|dblclick|mouse(up|down|move|over|out)/;

    return {
        pause() {
            paused = true;
        },
        resume() {
            if (!paused) {  // guard against multiple calls to resume()
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
                    postMouseEvent(<MouseEvent> e);
                } else if (e instanceof KeyboardEvent) {
                    postKeyboardEvent(<KeyboardEvent> e);
                } else if (mouseEventRegex.test(e.type)) {
                    postMouseEvent(<MouseEvent> e);
                } else if (keyEventRegex.test(e.type)) {
                    postKeyboardEvent(<KeyboardEvent> e);
                }

                if (queue.last && queue.last.value) {
                    var next = queue.last.value;  // TODO: change last to lastNode
                    var delay = next["timestamp"] - e["timestamp"]; // Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=238041
                    setTimeout(pop, delay);
                }
            }
            pop();
        }
    };
}

export function createRelay(element: EventTarget) {
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
