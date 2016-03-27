/*
 * Candy v0.1.0
 * A sweet, fat free, HTML5 canvas library for all ages.
 * Release Date: 3-26-2016
 * https://github.com/ericdrowell/candy
 * Licensed under the MIT or GPL Version 2 licenses.
 *
 * Copyright (C) 2016 Eric Rowell @ericdrowell
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function() {
  var Candy = {},
      idCounter = 0;

  Candy.pixelRatio = (function() {
    // client browsers
    if (window && window.navigator && window.navigator.userAgent && !/PhantomJS/.test(window.navigator.userAgent)) {
      return 2;
    }
    // headless browsers
    else {
      return 1;
    }
  })();

  Candy.wrappers = [];

  ////////////////////////////////////////////////////////////// WRAPPER //////////////////////////////////////////////////////////////
  
  Candy.Wrapper = function(config) {
    if (!config) {
      config = {};
    }
    this.width = config.width;
    this.height = config.height;
    this.layers = []; 
    this.id = idCounter++;

    this.container = document.createElement('div');
    this.container.className = 'candy-container';
    this.container.style.display = 'inline-block';
    this.container.style.position = 'relative';
    this.setSize(this.width, this.height);

    // clear container
    config.container.innerHTML = '';
    config.container.appendChild(this.container);

    Candy.wrappers.push(this);
  };

  Candy.Wrapper.prototype = {
    add: function(layer) {
      this.layers.push(layer);
      layer.setSize(layer.width || this.width, layer.height || this.height);
      layer.wrapper = this;
      this.container.appendChild(layer.container);
    },
    insert: function() {

    },
    setSize: function(width, height) {
      this.width = width;
      this.height = height;
      this.container.style.width = this.width + 'px';
      this.container.style.height = this.height + 'px';
    },
    clear: function() {
      this.clearScene();
      this.clearHit();
    },
    clearScene: function() {
      this.layers.forEach(function(layer) {
        layer.clearScene();
      });
    },
    clearHit: function() {
      this.layers.forEach(function(layer) {
        layer.clearHit();
      });
    },
    getIntersection: function() {

    },
    toImage: function() {

    },
    toCanvas: function() {

    },
    download: function() {

    },
    destroy: function() {

    }
  };

  ////////////////////////////////////////////////////////////// LAYER //////////////////////////////////////////////////////////////
  
  Candy.Layer = function(config) {
    if (!config) {
      config = {};
    }
    this.width = config.width || 0;
    this.height = config.height || 0;
    this.x = config.x || 0;
    this.y = config.y || 0;

    this.id = idCounter++;
    this.hitCanvas = new Candy.HitCanvas();
    this.sceneCanvas = new Candy.SceneCanvas();

    this.container = document.createElement('div');
    this.container.className = 'candy-layer';
    this.container.style.display = 'inline-block';
    this.container.style.position = 'absolute';
    this.container.style.left = this.x + 'px';
    this.container.style.top = this.y + 'px';
    this.container.appendChild(this.hitCanvas.canvas);
    this.container.appendChild(this.sceneCanvas.canvas);

    if (this.width && this.height) {
      this.setSize(this.width, this.height);
    }
  };

  Candy.Layer.prototype = {
    setX: function(x) {
      this.container.style.left = x + 'px';
    },
    setY: function() {
      this.container.style.top = y + 'px';
    },
    setSize: function(width, height) {
      this.width = width;
      this.container.style.width = width + 'px';
      this.height = height;
      this.container.style.height = height + 'px';

      this.sceneCanvas.setSize(width, height);
      this.hitCanvas.setSize(width, height);
    },
    clear: function() {
      this.sceneCanvas.clear();
      this.hitCanvas.clear();
    },
    moveUp: function() {

    },
    moveDown: function() {

    },
    moveToTop: function() {
      var index = this.getIndex(),
          wrapper = this.wrapper,
          layers = wrapper.layers;

      layers.splice(index, 1);
      layers.push(this);

      wrapper.container.removeChild(this.container);
      wrapper.container.appendChild(this.container);
    },
    moveToBottom: function() {
      var index = this.getIndex(),
          wrapper = this.wrapper,
          layers = wrapper.layers;

      layers.splice(index, 1);
      layers.unshift(this);

      wrapper.container.removeChild(this.container);
      wrapper.container.insertBefore(this.container, wrapper.container.firstChild);
    },
    moveTo: function() {

    },
    getIndex: function() {
      var layers = this.wrapper.layers,
          len = layers.length,
          n = 0,
          layer;

      for (n=0; n<len; n++) {
        layer = layers[n];
        if (this.id === layer.id) {
          return n;
        }
      }

      return null;
    },
    destroy: function() {

    }
  };

  ////////////////////////////////////////////////////////////// SCENE CANVAS //////////////////////////////////////////////////////////////
  
  Candy.SceneCanvas = function(config) {
    if (!config) {
      config = {};
    }

    this.width = config.width || 0;
    this.height = config.height || 0;

    this.id = idCounter++;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'candy-scene-canvas';
    this.canvas.style.display = 'inline-block';
    this.canvas.style.position = 'absolute';
    this.context = this.canvas.getContext('2d');

    if (this.width && this.height) {
      this.setSize(this.width, this.height);
    }
  };

  Candy.SceneCanvas.prototype = {
    setSize: function(width, height) {
      this.width = width;
      this.height = height;

      this.id = idCounter++;
      this.canvas.width = width * Candy.pixelRatio;
      this.canvas.style.width = width + 'px';
      this.canvas.height = height * Candy.pixelRatio;
      this.canvas.style.height = height + 'px'; 

      if (Candy.pixelRatio !== 1) {
        this.context.scale(Candy.pixelRatio, Candy.pixelRatio);
      }
    },
    clear: function() {
      this.context.clearRect(0, 0, this.width * Candy.pixelRatio, this.height * Candy.pixelRatio);
    },
    toImage: function(callback) {
      var that = this,
          dataURL = this.canvas.toDataURL(),
          imageObj = new Image();

      imageObj.onload = function() {
        imageObj.width = that.width;
        imageObj.height = that.height;
        callback(imageObj);
      };
      imageObj.src = dataURL;
    },
  };

  ////////////////////////////////////////////////////////////// HIT CANVAS //////////////////////////////////////////////////////////////
  
  Candy.HitCanvas = function(config) {
    if (!config) {
      config = {};
    }

    this.width = config.width || 0;
    this.height = config.height || 0;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'candy-hit-canvas';
    this.canvas.style.display = 'none';
    this.canvas.style.position = 'absolute';
    this.context = this.canvas.getContext('2d');

    if (this.width && this.height) {
      this.setSize(this.width, this.height);
    }
  };

  Candy.HitCanvas.prototype = {
    setSize: function(width, height) {
      this.width = width;
      this.height = height;

      this.canvas.width = width;
      this.canvas.style.width = width + 'px';
      this.canvas.height = height;
      this.canvas.style.height = height + 'px';
    },
    clear: function() {
      this.context.clearRect(0, 0, this.width, this.height);
    },
    getIntersection: function() {

    }
  };

  // export
  window.Candy = Candy;
})();