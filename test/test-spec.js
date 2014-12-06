/*global describe, beforeEach, afterEach, it */

describe("Iframe Overlay", function () {
    var iframe, listener, overlay, overlayElement;

    beforeEach(function (done) {
        iframe = document.createElement("iframe");
        iframe.onload = function () {
            done();
        };
        iframe.setAttribute("src", "iframe.html");

        var container = document.querySelector("#container");
        container.appendChild(iframe);

        overlay = iframeOverlay.createOverlay(iframe);
        overlayElement = document.querySelector(".overlay");
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

                EventSim.simulate(overlayElement, name, { clientX: 200, clientY: 100, shiftKey: true, altKey: true, metaKey: true, ctrlKey: true });
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

            EventSim.simulate(overlayElement, "mousedown", { clientX: 200, clientY: 100, shiftKey: true, altKey: true, metaKey: true, ctrlKey: true });
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

                EventSim.simulate(overlayElement, name, { keyCode: 65, shiftKey: true, altKey: true, metaKey: true, ctrlKey: true });
            });
        }

        var mouseEvents = ["keydown", "keyup", "keypress"];
        mouseEvents.forEach(testKeyboardEvent);
    });

    describe("Sequences of events", function () {
        it("should send all events if it isn't paused", function (done) {
            var eventCount = 0;
            listener = function (e) {
                eventCount++;
            };

            setTimeout(function () {
                expect(eventCount).to.be(3);
                $(window).off("message", listener); // cleanup
                done();
            }, 200);

            $(window).on("message", listener);

            EventSim.simulate(overlayElement, "mousedown", { clientX: 200, clientY: 100 });
            // pause before sending the next event otherwise there's not enough time for the listener to set the paused flag
            // in practice this is perfectly acceptable because even if a user is spamming us by mashing a physical keyboard
            // there will still be slight delays in between
            setTimeout(function () {
                EventSim.simulate(window, "mousemove", { clientX: 200, clientY: 100 });
                EventSim.simulate(window, "mouseup", { clientX: 200, clientY: 100 });
            }, 50);
        });

        it("should not send events after being paused", function (done) {
            var eventCount = 0;
            listener = function (e) {
                var data = e.originalEvent.data;
                if (data.type === "mousedown") {
                    overlay.pause();
                }
                eventCount++;
            };

            setTimeout(function () {
                expect(eventCount).to.be(1);
                $(window).off("message", listener); // cleanup
                done();
            }, 200);

            $(window).on("message", listener);

            EventSim.simulate(overlayElement, "mousedown", { clientX: 200, clientY: 100 });
            // pause before sending the next event otherwise there's not enough time for the listener to set the paused flag
            // in practice this is perfectly acceptable because even if a user is spamming us by mashing a physical keyboard
            // there will still be slight delays in between
            setTimeout(function () {
                EventSim.simulate(window, "mousemove", { clientX: 200, clientY: 100 });
                EventSim.simulate(window, "mouseup", { clientX: 200, clientY: 100 });
            }, 50);
        });

        it("should queue events and trigger then after resuming a paused instance", function (done) {
            var eventCount = 0;
            listener = function (e) {
                var data = e.originalEvent.data;
                if (data.type === "mousedown") {
                    overlay.pause();
                }
                eventCount++;
            };

            setTimeout(function () {
                expect(eventCount).to.be(3);
                $(window).off("message", listener); // cleanup
                done();
            }, 200);

            $(window).on("message", listener);

            EventSim.simulate(overlayElement, "mousedown", { clientX: 200, clientY: 100 });
            // pause before sending the next event otherwise there's not enough time for the listener to set the paused flag
            // in practice this is perfectly acceptable because even if a user is spamming us by mashing a physical keyboard
            // there will still be slight delays in between
            setTimeout(function () {
                EventSim.simulate(window, "mousemove", { clientX: 200, clientY: 100 });
                EventSim.simulate(window, "mouseup", { clientX: 200, clientY: 100 });

                setTimeout(function () {
                    overlay.resume();
                }, 30);
            }, 30);
        });

        it("should handle multiple calls to resume()", function (done) {
            var keyCode = 0;
            listener = function (e) {
                var data = e.originalEvent.data;
                keyCode = data.keyCode;
            };

            $(window).on("message", listener);

            EventSim.simulate(overlayElement, "keydown", { keyCode: 65 });
            overlay.pause();
            setTimeout(function () {
                EventSim.simulate(overlayElement, "keydown", { keyCode: 66 });
                setTimeout(function () {
                    EventSim.simulate(overlayElement, "keydown", { keyCode: 67 });
                    setTimeout(function () {
                        expect(keyCode).to.be(65);
                        overlay.resume();
                        overlay.resume();
                        setTimeout(function () {
                            expect(keyCode).to.be(66);
                            overlay.resume();
                            overlay.resume();
                            setTimeout(function () {
                                expect(keyCode).to.be(67);
                                $(window).off("message", listener); // cleanup
                                done();
                            }, 30);
                        }, 30);
                    }, 30);
                }, 30);
            }, 30);
        });
    });
});
