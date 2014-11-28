var Poster = require("../node_modules/poster/lib/poster");

function createIframeOverlay(iframe) {
    var wrapper = $("<span></span>").css({
        position: "relative",
        padding: 0,
        margin: 0,
        display: "inline-block"
    }).addClass("wrapper").get(0);

    var overlay = $("<span></span>").css({
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%"
    }).addClass("overlay").get(0);

    var parent = iframe.parentElement;

    parent.insertBefore(wrapper, iframe);
    wrapper.appendChild(iframe);
    wrapper.appendChild(overlay);

    var state = {
        down: false,
        paused: false
    };

    var poster = new Poster(iframe.contentWindow);

    overlay.addEventListener("mousedown", function (e) {
        state.down = true;
        if (!state.paused) {
            var bounds = wrapper.getBoundingClientRect();
            poster.post("mouse", {
                type: "mousedown",
                x: e.pageX - bounds.left,
                y: e.pageY - bounds.top
            });
            e.preventDefault();
        }
    });

    overlay.addEventListener("mousemove", function (e) {
        if (!state.down) {
            if (!state.paused) {
                var bounds = wrapper.getBoundingClientRect();
                poster.post("mouse", {
                    type: "mousemove",
                    x: e.pageX - bounds.left,
                    y: e.pageY - bounds.top
                });
            }
        }
    });

    window.addEventListener("mousemove", function (e) {
        if (state.down) {
            if (!state.paused) {
                var bounds = wrapper.getBoundingClientRect();
                poster.post("mouse", {
                    type: "mousemove",
                    x: e.pageX - bounds.left,
                    y: e.pageY - bounds.top
                });
            }
        }
    });

    window.addEventListener("mouseup", function (e) {
        if (state.down) {
            if (!state.paused) {
                var bounds = wrapper.getBoundingClientRect();
                poster.post("mouse", {
                    type: "mouseup",
                    x: e.pageX - bounds.left,
                    y: e.pageY - bounds.top
                });
            }
            state.down = false;
        }
    });

    return state;
}

module.exports = createIframeOverlay;
