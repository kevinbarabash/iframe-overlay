/**
 * Creates an overlay on top of an iframe that intercepts and retriggers mouse
 * events.  The purpose of this is two-fold:
 * - provide better user experience when a drag operation leaves iframe's bounds
 * - allow events to be filtered to toggle interactivity without having to modify
 *   the code runing inside the iframe
 */

import Poster = require("../node_modules/poster/lib/poster");
import EventSim = require("../node_modules/eventsim/lib/eventsim");

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

    var state = {
        down: false,
        paused: false
    };

    var poster:Poster = new Poster(iframe.contentWindow);

    function postMouseEvent(e: MouseEvent) {
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

    function postKeyboardEvent(e: KeyboardEvent) {
        poster.post("keyboard", {
            type: e.type,
            keyCode: e.keyCode,
            shiftKey: e.shiftKey,
            altKey: e.altKey,
            ctrlKey: e.ctrlKey,
            metaKey: e.metaKey
        });
    }

    overlay.addEventListener("click", e => postMouseEvent(e), true);
    overlay.addEventListener("dblclick", e => postMouseEvent(e), true);
    overlay.addEventListener("mouseover", e => postMouseEvent(e), true);
    overlay.addEventListener("mouseout", e => postMouseEvent(e), true);

    overlay.addEventListener("mousedown", e => {
        state.down = true;
        if (!state.paused) {
            postMouseEvent(e);
            overlay.focus();
            e.preventDefault();
        }
    }, true);

    overlay.addEventListener("mousemove", e => {
        if (!state.down) {
            if (!state.paused) {
                postMouseEvent(e);
            }
        }
    }, true);

    window.addEventListener("mousemove", e => {
        if (state.down) {
            if (!state.paused) {
                postMouseEvent(e);
            }
        }
    }, true);

    window.addEventListener("mouseup", e => {
        if (state.down) {
            state.down = false;
        }
        if (!state.paused) {
            postMouseEvent(e);
        }
    }, true);

    overlay.addEventListener("keydown", e => {
        if (!state.paused) {
            postKeyboardEvent(e);
        }
    }, true);

    overlay.addEventListener("keypress", e => {
        if (!state.paused) {
            postKeyboardEvent(e);
        }
    }, true);

    overlay.addEventListener("keyup", e => {
        if (!state.paused) {
            postKeyboardEvent(e);
        }
    }, true);

    return state;
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
