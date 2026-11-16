/**
 * @provide pskl.tools.drawing.Stroke
 *
 * @require pskl.utils
 */
(function () {
  var ns = $.namespace("pskl.tools.drawing");

  ns.Stroke = function () {
    this.toolId = "tool-stroke";
    this.helpText = "Stroke tool";
    this.shortcut = pskl.service.keyboard.Shortcuts.TOOL.STROKE;
    this.tooltipDescriptors = [
      { key: "shift", description: "Hold shift to draw straight lines" }
    ];

    // Stroke's first point coordinates (set in applyToolAt)
    this.startCol = null;
    this.startRow = null;
  };

  pskl.utils.inherit(ns.Stroke, ns.BaseTool);

  ns.Stroke.prototype.supportsDynamicPenSize = function () {
    return true;
  };

  /**
   * @override
   */
  ns.Stroke.prototype.applyToolAt = function (col, row, frame, overlay, event) {
    this.startCol = col;
    this.startRow = row;

    // When drawing a stroke we don't change the model instantly, since the
    // user can move his cursor to change the stroke direction and length
    // dynamically. Instead we draw the (preview) stroke in a fake canvas that
    // overlay the drawing canvas.
    // We wait for the releaseToolAt callback to impact both the
    // frame model and canvas rendering.

    // The fake canvas where we will draw the preview of the stroke:
    // Drawing the first point of the stroke in the fake overlay canvas:
    var coords = this.wrapCoords_(frame, col, row);
    overlay.setPixel(coords.col, coords.row, this.getToolColor());
  };

  ns.Stroke.prototype.moveToolAt = function (col, row, frame, overlay, event) {
    overlay.clear();

    var penSize = pskl.app.penSizeService.getPenSize();
    var isStraight = event.shiftKey;
    var color = this.getToolColor();
    if (color == Constants.TRANSPARENT_COLOR) {
      // When mousemoving the stroke tool, we draw in the canvas overlay above the drawing canvas.
      // If the stroke color is transparent, we won't be
      // able to see it during the movement.
      // We set it to a semi-opaque white during the tool mousemove allowing to see colors below the stroke.
      // When the stroke tool will be released, It will draw a transparent stroke,
      // eg deleting the equivalent of a stroke.
      color = Constants.SELECTION_TRANSPARENT_COLOR;
    }

    this.draw_(
      col,
      row,
      color,
      overlay,
      penSize,
      isStraight,
      this.isCycleMode_()
    );
  };

  /**
   * @override
   */
  ns.Stroke.prototype.releaseToolAt = function (
    col,
    row,
    frame,
    overlay,
    event
  ) {
    var penSize = pskl.app.penSizeService.getPenSize();
    var isStraight = event.shiftKey;
    var color = this.getToolColor();

    // The user released the tool to draw a line. We will compute the pixel coordinate, impact
    // the model and draw them in the drawing canvas (not the fake overlay anymore)
    var wrap = this.isCycleMode_();
    this.draw_(col, row, color, frame, penSize, isStraight, wrap);

    // For now, we are done with the stroke tool and don't need an overlay anymore:
    overlay.clear();

    this.raiseSaveStateEvent({
      col: col,
      row: row,
      startCol: this.startCol,
      startRow: this.startRow,
      color: color,
      penSize: penSize,
      isStraight: isStraight,
      wrap: wrap
    });
  };

  ns.Stroke.prototype.draw_ = function (
    col,
    row,
    color,
    targetFrame,
    penSize,
    isStraight,
    wrap
  ) {
    var linePixels;
    if (isStraight) {
      linePixels = pskl.PixelUtils.getUniformLinePixels(
        this.startCol,
        col,
        this.startRow,
        row
      );
    } else {
      linePixels = pskl.PixelUtils.getLinePixels(
        col,
        this.startCol,
        row,
        this.startRow
      );
    }

    var writePixel = function (x, y) {
      this.setWrappedPixel_(targetFrame, x, y, color, wrap);
    }.bind(this);

    //draw the square ends of the line
    pskl.PixelUtils.resizePixel(
      linePixels[0].col,
      linePixels[0].row,
      penSize
    ).forEach(function (point) {
      writePixel(point[0], point[1]);
    });
    pskl.PixelUtils.resizePixel(
      linePixels[linePixels.length - 1].col,
      linePixels[linePixels.length - 1].row,
      penSize
    ).forEach(function (point) {
      writePixel(point[0], point[1]);
    });

    //for each step along the line, draw an x centered on that pixel of size penSize
    linePixels.forEach(function (point) {
      for (var i = 0; i < penSize; i++) {
        writePixel(
          point.col - Math.floor(penSize / 2) + i,
          point.row - Math.floor(penSize / 2) + i
        );
        writePixel(
          point.col - Math.floor(penSize / 2) + i,
          point.row + Math.ceil(penSize / 2) - i - 1
        );
        //draw an additional x directly next to the first to prevent unwanted dithering
        if (i !== 0) {
          writePixel(
            point.col - Math.floor(penSize / 2) + i,
            point.row - Math.floor(penSize / 2) + i - 1
          );
          writePixel(
            point.col - Math.floor(penSize / 2) + i,
            point.row + Math.ceil(penSize / 2) - i
          );
        }
      }
    });
  };

  ns.Stroke.prototype.replay = function (frame, replayData) {
    this.startCol = replayData.startCol;
    this.startRow = replayData.startRow;
    this.draw_(
      replayData.col,
      replayData.row,
      replayData.color,
      frame,
      replayData.penSize,
      replayData.isStraight,
      replayData.wrap
    );
  };
})();
