var Concrete = {},
    idCounter = 0;

Concrete.PIXEL_RATIO = (function () {
    return (window && window.devicePixelRatio) || 1;
})();

////////////////////////////////////////////////////////////// VIEWPORT //////////////////////////////////////////////////////////////

/**
 * Concrete Viewport constructor
 * @param {Object} config
 * @param {Integer} config.width - viewport width in pixels
 * @param {Integer} config.height - viewport height in pixels
 */
Concrete.Viewport = function (config) {
    if (!config) {
        config = {};
    }

    this.container = config.container;
    this.layers = [];
    this.id = idCounter++;
    this.scene = new Concrete.Scene();

    this.setSize(config.width || 0, config.height || 0);

    // clear container
    config.container.innerHTML = '';
    config.container.appendChild(this.scene.canvas);
};

Concrete.Viewport.prototype = {

    /**
     * add layer
     * @param {Concrete.Layer} layer
     * @returns {Concrete.Viewport}
     */
    add: function (layer) {
        this.layers.push(layer);
        layer.setSize(layer.width || this.width, layer.height || this.height);
        layer.viewport = this;
        return this;
    },

    /**
     * set viewport size
     * @param {Integer} width - viewport width in pixels
     * @param {Integer} height - viewport height in pixels
     * @param {Boolean} cascade - True if the new size should be applied to all layers
     * @returns {Concrete.Viewport}
     */
    setSize: function (width, height, cascade) {
        this.width = width;
        this.height = height;
        this.scene.setSize(width, height);
        if (cascade) {
            this.layers.forEach(function (layer) {
                layer.setSize(width, height);
            });
        }
        return this;
    },

    /**
     * destroy viewport
     */
    destroy: function () {
        // destroy layers
        this.layers.forEach(function (layer) {
            layer.destroy();
        });

        // clear dom
        this.container.innerHTML = '';
    },

    /**
     * composite all layers onto visible canvas
     */
    render: function () {
        var scene = this.scene;

        scene.clear();

        this.layers.forEach(function (layer) {
            if (layer.visible) {
                scene.context.drawImage(layer.scene.canvas, layer.x, layer.y, layer.width, layer.height);
            }
        });
    }
};

////////////////////////////////////////////////////////////// LAYER //////////////////////////////////////////////////////////////

/**
 * Concrete Layer constructor
 * @param {Object} config
 * @param {Integer} [config.x]
 * @param {Integer} [config.y]
 * @param {Integer} [config.width] - viewport width in pixels
 * @param {Integer} [config.height] - viewport height in pixels
 */
Concrete.Layer = function (config) {
    if (!config) {
        config = {};
    }

    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.visible = true;

    this.id = idCounter++;
    this.scene = new Concrete.OffScreenScene({
        contextType: config.contextType
    });

    if (config.x && config.y) {
        this.setPosition(config.x, config.y);
    }

    if (config.width && config.height) {
        this.setSize(config.width, config.height);
    }
};

Concrete.Layer.prototype = {

    /**
     * set layer position
     * @param {Number} x
     * @param {Number} y
     * @returns {Concrete.Layer}
     */
    setPosition: function (x, y) {
        this.x = x;
        this.y = y;

        return this;
    },

    /**
     * set layer size
     * @param {Number} width
     * @param {Number} height
     * @returns {Concrete.Layer}
     */
    setSize: function (width, height) {
        this.width = width;
        this.height = height;
        this.scene.setSize(width, height);

        return this;
    },

    /**
     * move up
     * @returns {Concrete.Layer}
     */
    moveUp: function () {
        var index = this.getIndex(),
            viewport = this.viewport,
            layers = viewport.layers;

        if (index < layers.length - 1) {
            // swap
            layers[index] = layers[index + 1];
            layers[index + 1] = this;
        }

        return this;
    },

    /**
     * move down
     * @returns {Concrete.Layer}
     */
    moveDown: function () {
        var index = this.getIndex(),
            viewport = this.viewport,
            layers = viewport.layers;

        if (index > 0) {
            // swap
            layers[index] = layers[index - 1];
            layers[index - 1] = this;
        }

        return this;
    },

    /**
     * move to top
     * @returns {Concrete.Layer}
     */
    moveToTop: function () {
        var index = this.getIndex(),
            viewport = this.viewport,
            layers = viewport.layers;

        layers.splice(index, 1);
        layers.push(this);

        return this;
    },

    /**
     * move to bottom
     * @returns {Concrete.Layer}
     */
    moveToBottom: function () {
        var index = this.getIndex(),
            viewport = this.viewport,
            layers = viewport.layers;

        layers.splice(index, 1);
        layers.unshift(this);

        return this;
    },

    /**
     * get layer index from viewport layers
     * @returns {Number|null}
     */
    getIndex: function () {
        var layers = this.viewport.layers,
            len = layers.length,
            n = 0,
            layer;

        for (n = 0; n < len; n++) {
            layer = layers[n];
            if (this.id === layer.id) {
                return n;
            }
        }

        return null;
    },

    /**
     * destroy
     */
    destroy: function () {
        // remove self from layers array
        this.viewport.layers.splice(this.getIndex(), 1);
    }
};

////////////////////////////////////////////////////////////// SCENE //////////////////////////////////////////////////////////////

/**
 * Concrete Scene constructor
 * @param {Object} config
 * @param {Integer} [config.width] - canvas width in pixels
 * @param {Integer} [config.height] - canvas height in pixels
 */
Concrete.Scene = function (config) {
    if (!config) {
        config = {};
    }

    this.width = 0;
    this.height = 0;
    this.contextType = config.contextType || '2d';

    this.id = idCounter++;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'concrete-scene-canvas';
    this.canvas.style.display = 'inline-block';
    this.context = this.canvas.getContext(this.contextType);
};

Concrete.Scene.prototype = {

    /**
     * set scene size
     * @param {Number} width
     * @param {Number} height
     * @returns {Concrete.Scene}
     */
    setSize: function (width, height) {
        this.width = width;
        this.height = height;

        this.id = idCounter++;
        this.canvas.width = width * Concrete.PIXEL_RATIO;
        this.canvas.style.width = width + 'px';
        this.canvas.height = height * Concrete.PIXEL_RATIO;
        this.canvas.style.height = height + 'px';

        if (this.contextType === '2d' && Concrete.PIXEL_RATIO !== 1) {
            this.context.scale(Concrete.PIXEL_RATIO, Concrete.PIXEL_RATIO);
        }

        return this;
    },

    /**
     * clear scene
     * @returns {Concrete.Scene}
     */
    clear: function () {
        var context = this.context;

        if (this.contextType === '2d') {
            context.clearRect(0, 0, this.width * Concrete.PIXEL_RATIO, this.height * Concrete.PIXEL_RATIO);
        } else {
            context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
        }

        return this;
    },

    /**
     * convert scene into an image
     * @param {Function} callback
     */
    toImage: function (callback) {
        var that = this,
            imageObj = new Image(),
            dataURL = this.canvas.toDataURL('image/png');

        imageObj.onload = function () {
            imageObj.width = that.width;
            imageObj.height = that.height;
            callback(imageObj);
        };
        imageObj.src = dataURL;
    },

    /**
     * download scene as an image
     * @param {Object} config
     * @param {String} config.fileName
     */
    download: function (config) {
        this.canvas.toBlob(function (blob) {
            var anchor = document.createElement('a'),
                dataUrl = URL.createObjectURL(blob),
                fileName = config.fileName || 'canvas.png',
                evtObj;

            // set a attributes
            anchor.setAttribute('href', dataUrl);
            anchor.setAttribute('target', '_blank');
            anchor.setAttribute('download', fileName);

            // simulate click
            if (document.createEvent) {
                evtObj = document.createEvent('MouseEvents');
                evtObj.initEvent('click', true, true);
                anchor.dispatchEvent(evtObj);
            }
            else if (anchor.click) {
                anchor.click();
            }
        });
    }
};

/////////////////////////////////////////////////////////// OFFSCREENSCENE ///////////////////////////////////////////////////////////

/**
 * Concrete Scene constructor
 * @param {Object} config
 * @param {Integer} [config.width] - canvas width in pixels
 * @param {Integer} [config.height] - canvas height in pixels
 */
Concrete.OffScreenScene = function (config) {
    if (!config) {
        config = {};
    }

    this.contextType = config.contextType || '2d';

    this.id = idCounter++;
    this.canvas = window.OffscreenCanvas ? new OffscreenCanvas(0, 0) : document.createElement('canvas');
    this.context = this.canvas.getContext(this.contextType);
};

Concrete.OffScreenScene.prototype = {

    /**
     * set scene size
     * @param {Number} width
     * @param {Number} height
     * @returns {Concrete.Scene}
     */
    setSize: function (width, height) {
        this.width = width;
        this.height = height;

        this.canvas.width = width * Concrete.PIXEL_RATIO;
        this.canvas.height = height * Concrete.PIXEL_RATIO;

        if (this.contextType === '2d' && Concrete.PIXEL_RATIO !== 1) {
            this.context.scale(Concrete.PIXEL_RATIO, Concrete.PIXEL_RATIO);
        }

        return this;
    },

    /**
     * clear scene
     * @returns {Concrete.Scene}
     */
    clear: function () {
        var context = this.context;
        if (this.contextType === '2d') {
            context.clearRect(0, 0, this.width * Concrete.PIXEL_RATIO, this.height * Concrete.PIXEL_RATIO);
        } else {
            context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
        }

        return this;
    }
};

// export
(function (global) {
    'use strict';

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define(function () { return Concrete; });
    // CommonJS and Node.js module support.
    } else if (typeof exports !== 'undefined') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Concrete;
        }
        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.Concrete = Concrete;
    } else {
        global.Concrete = Concrete;
    }
})(this);
