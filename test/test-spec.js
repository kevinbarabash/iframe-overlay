/*global describe, beforeEach, afterEach, it */

describe("Iframe Overlay", function () {
    var iframe, listener, overlay;

    beforeEach(function (done) {
        iframe = document.createElement("iframe");
        iframe.onload = function () {
            done();
        };
        iframe.setAttribute("src", "iframe.html");

        var container = document.querySelector("#container");
        container.appendChild(iframe);

        iframeOverlay.createOverlay(iframe);
        overlay = document.querySelector(".overlay");
    });

    afterEach(function () {
        $(".wrapper").remove();
        $(document).off("message", listener);
    });

    describe("Mouse Events", function () {
        function testMouseEvent(name) {
            it("should transmit " + name + " events", function (done) {
                listener = function (e) {
                    var data = e.originalEvent.data;

                    expect(data.type).to.be(name);
                    expect(data.x).to.be(200);
                    expect(data.y).to.be(100);
                    expect(data.shiftKey).to.be(true);
                    expect(data.altKey).to.be(true);
                    expect(data.metaKey).to.be(true);
                    expect(data.ctrlKey).to.be(true);

                    $(window).off("message", listener);
                    done();
                };
                $(window).on("message", listener);

                EventSim.simulate(overlay, name, { clientX: 200, clientY: 100, shiftKey: true, altKey: true, metaKey: true, ctrlKey: true });
            });
        }

        var mouseEvents = ["click", "dblclick", "mousedown", "mousemove", "mouseover", "mouseout"];
        mouseEvents.forEach(testMouseEvent);

        it("should transmit mouseup events", function (done) {
            listener = function (e) {
                var data = e.originalEvent.data;

                if (data.type === "mouseup") {
                    expect(data.type).to.be("mouseup");
                    expect(data.x).to.be(200);
                    expect(data.y).to.be(100);
                    expect(data.shiftKey).to.be(true);
                    expect(data.altKey).to.be(true);
                    expect(data.metaKey).to.be(true);
                    expect(data.ctrlKey).to.be(true);

                    $(window).off("message", listener);
                    done();
                }
            };
            $(window).on("message", listener);

            EventSim.simulate(overlay, "mousedown", { clientX: 200, clientY: 100, shiftKey: true, altKey: true, metaKey: true, ctrlKey: true });
            EventSim.simulate(window, "mouseup", { clientX: 200, clientY: 100, shiftKey: true, altKey: true, metaKey: true, ctrlKey: true });
        });
    });

    describe("Keyboard Events", function () {
        function testKeyboardEvent(name) {
            it("should transmit " + name + " events", function (done) {
                listener = function (e) {
                    var data = e.originalEvent.data;

                    expect(data.type).to.be(name);
                    expect(data.keyCode).to.be(65);
                    expect(data.shiftKey).to.be(true);
                    expect(data.altKey).to.be(true);
                    expect(data.metaKey).to.be(true);
                    expect(data.ctrlKey).to.be(true);

                    $(window).off("message", listener);
                    done();
                };
                $(window).on("message", listener);

                EventSim.simulate(overlay, name, { keyCode: 65, shiftKey: true, altKey: true, metaKey: true, ctrlKey: true });
            });
        }

        var mouseEvents = ["keydown", "keyup", "keypress"];
        mouseEvents.forEach(testKeyboardEvent);
    });
});
