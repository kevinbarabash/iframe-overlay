var Poster = require("../node_modules/poster/lib/poster");
var EventSim = require("../node_modules/eventsim/lib/eventsim");
function createOverlay(iframe) {
    var wrapper = document.createElement("span");
    wrapper.setAttribute("style", "position:relative;padding:0;margin:0;display:inline-block;");
    wrapper.setAttribute("class", "wrapper");
    var overlay = document.createElement("span");
    overlay.setAttribute("style", "position:absolute;left:0;top:0;width:100%;height:100%;");
    overlay.setAttribute("class", "overlay");
    overlay.setAttribute("tabindex", "0");
    var parent = iframe.parentElement;
    parent.insertBefore(wrapper, iframe);
    wrapper.appendChild(iframe);
    wrapper.appendChild(overlay);
    var state = {
        down: false,
        paused: false
    };
    var poster = new Poster(iframe.contentWindow);
    function postMouseEvent(e) {
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
    function postKeyboardEvent(e) {
        poster.post("keyboard", {
            type: e.type,
            keyCode: e.keyCode,
            shiftKey: e.shiftKey,
            altKey: e.altKey,
            ctrlKey: e.ctrlKey,
            metaKey: e.metaKey
        });
    }
    overlay.addEventListener("click", function (e) { return postMouseEvent(e); });
    overlay.addEventListener("dblclick", function (e) { return postMouseEvent(e); });
    overlay.addEventListener("mouseover", function (e) { return postMouseEvent(e); });
    overlay.addEventListener("mouseout", function (e) { return postMouseEvent(e); });
    overlay.addEventListener("mousedown", function (e) {
        state.down = true;
        if (!state.paused) {
            postMouseEvent(e);
            overlay.focus();
            e.preventDefault();
        }
    });
    overlay.addEventListener("mousemove", function (e) {
        if (!state.down) {
            if (!state.paused) {
                postMouseEvent(e);
            }
        }
    });
    window.addEventListener("mousemove", function (e) {
        if (state.down) {
            if (!state.paused) {
                postMouseEvent(e);
            }
        }
    });
    window.addEventListener("mouseup", function (e) {
        if (state.down) {
            state.down = false;
            if (!state.paused) {
                postMouseEvent(e);
            }
        }
    });
    overlay.addEventListener("keydown", function (e) {
        if (!state.paused) {
            postKeyboardEvent(e);
        }
    });
    overlay.addEventListener("keypress", function (e) {
        if (!state.paused) {
            postKeyboardEvent(e);
        }
    });
    overlay.addEventListener("keyup", function (e) {
        if (!state.paused) {
            postKeyboardEvent(e);
        }
    });
    return state;
}
exports.createOverlay = createOverlay;
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
exports.createRelay = createRelay;
