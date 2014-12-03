[![Build Status](https://travis-ci.org/kevinb7/iframe-overlay.svg?branch=master)](https://travis-ci.org/kevinb7/iframe-overlay)

# iframe-overlay #

An overlay which can be added over top of an iframe to control how user events are propagated to the iframe.

## How it works ##

Events are captured by an overlay that covers the iframe.  Those events are forwarded to the iframe via postMessage
using Poster <https://github.com/kevinb7/poster> and then retrigger inside the iframe using EventSim <https://github.com/kevinb7/eventsim>.

## API ##

- iframeOverlay.createOverlay(iframe)
  - called in the parent to specify which iframe to create an overlay on top of
  - returns an object wtih two properties: down and paused
    - paused controls whether or not events are being forwarded
- iframeOverlay.createRelay(element)
  - called inside the iframe to specify which element to retrigger events on

## Future Work ##

- improve the API: better naming, better way to control forwarding (maybe a delegate)
