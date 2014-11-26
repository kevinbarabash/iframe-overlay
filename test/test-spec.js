/*global describe, beforeEach, afterEach, it */

describe("Iframe Overlay", function () {
    var iframe;

    beforeEach(function () {
        iframe = $("<iframe></iframe>").attr({
            width: 400,
            height: 400,
            src: "../example/inner.html"
        }).appendTo(document.body).get(0);
    });

    afterEach(function () {
        $(iframe).remove();
    });

    it("shouldn't fail", function () {
        expect(true).to.be(true);
    });

});