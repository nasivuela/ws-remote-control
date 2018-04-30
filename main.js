(function () {
  'use strict';

  let dPad;
  let dControl;
  const dControlDimensions = 60;

  // Find nodes
  const getPad = () => {
    dPad = document.getElementById("d-pad");
  }

  const getControl = () => {
    dControl = document.getElementById("d-control");
  }

  // Center
  const centerControl = ({ parentNode, node, nodeDimension }) => {
    const parentCenterX = parentNode.offsetWidth / 2;
    const parentCenterY = parentNode.offsetHeight / 2;
    translateNode({
      node,
      x: parentCenterX - nodeDimension / 2,
      y: parentCenterY - nodeDimension / 2,
    });
    showNode({ node });
  }

  // Get position
  const getPosition = ({ parentSize, size, axis }) =>
    axis < dControlDimensions
      ? 0
      : axis > parentSize
        ? parentSize - size
        : axis - size;

  // Styles
  const translateNode = ({ node, x, y }) =>
    node.style.transform = `translate3d(${x}px, ${y}px, 0)`;

  const showNode = ({ node }) =>
    node.style.opacity = 1;

  // Touch handlers
  const touchStartHandler = (e) => {
    e.preventDefault();
    dControl.classList.add("dragged");
  }

  const touchEndHandler = (e) => {
    e.preventDefault();
    throttle.cancel();

    dControl.classList.remove("dragged");
    centerControl({
      parentNode: dPad,
      node: dControl,
      nodeDimension: dControlDimensions,
    });
  }

  const touchMoveHandler = (e) => {
    e.preventDefault();
    const parentWidth = e.target.parentNode.offsetWidth;
    const parentHeight = e.target.parentNode.offsetWidth;
    const x = e.changedTouches[0].pageX;
    const y = e.changedTouches[0].pageY;
    const halfParent = parentWidth / 2;
    const coordinate = x > halfParent
      ? y < halfParent
        ? 'f'
        : 'l'
      : y > halfParent
        ? 'b'
        : 'r';

    sendPosition(coordinate);

    translateNode({
      node: e.target,
      x: getPosition({ parentSize: parentWidth, size: dControlDimensions, axis: x }),
      y: getPosition({ parentSize: parentHeight, size: dControlDimensions, axis: y })
    });
  }

  const initTouch = () => {
    throttle = _.throttle(touchMoveHandler, 100)
    dControl.addEventListener("touchstart", touchStartHandler, false);
    dControl.addEventListener("touchend", touchEndHandler, false);
    dControl.addEventListener("touchmove", throttle, false);
  }

  // Document READY
  function documentReady() {
    getPad();
    getControl();
    centerControl({
      parentNode: dPad,
      node: dControl,
      nodeDimension: dControlDimensions,
    });
    initTouch();
  }

  document.addEventListener("DOMContentLoaded", documentReady);

  // WS
  let connected = false;
  const connection = new WebSocket('ws://spider/ws');

  connection.onopen = () => {
    connected = true;
  }

  const sendPosition = (pos) => {
    if (!connected) { return }
    connection.send(pos);
  }

  // Log errors
  connection.onerror = function (error) {
    console.log('WebSocket Error ' + error);
  };

  // Log messages from the server
  connection.onmessage = function (e) {
    console.log('Server: ' + e.data);
  };

})();
