/**
 * @provide pskl.tools.drawing.BaseTool
 *
 * @require pskl.utils
 */
(function () {
  var ns = $.namespace("pskl.tools.drawing");

  ns.BaseTool = function () {
    pskl.tool.Tool.call(this);
    this.toolId = "tool-base";
  };

  pskl.utils.inherit(ns.BaseTool, pskl.tools.Tool);

  ns.BaseTool.prototype.applyToolAt = function (
    col,
    row,
    frame,
    overlay,
    event
  ) {};

  ns.BaseTool.prototype.moveToolAt = function (
    col,
    row,
    frame,
    overlay,
    event
  ) {};

  ns.BaseTool.prototype.replay = Constants.ABSTRACT_FUNCTION;

  ns.BaseTool.prototype.supportsDynamicPenSize = function () {
    return false;
  };

  ns.BaseTool.prototype.getToolColor = function () {
    if (pskl.app.mouseStateService.isRightButtonPressed()) {
      return pskl.app.selectedColorsService.getSecondaryColor();
    }
    return pskl.app.selectedColorsService.getPrimaryColor();
  };

  ns.BaseTool.prototype.isCycleMode_ = function () {
    return pskl.UserSettings.get("CYCLE_MODE") > 0;
  };

  ns.BaseTool.prototype.wrapCoords_ = function (frame, col, row) {
    if (!this.isCycleMode_()) {
      return { col: col, row: row };
    }
    return {
      col: pskl.utils.Math.mod(col, frame.getWidth()),
      row: pskl.utils.Math.mod(row, frame.getHeight())
    };
  };

  ns.BaseTool.prototype.setWrappedPixel_ = function (
    targetFrame,
    col,
    row,
    color,
    wrap
  ) {
    var x = wrap ? pskl.utils.Math.mod(col, targetFrame.getWidth()) : col;
    var y = wrap ? pskl.utils.Math.mod(row, targetFrame.getHeight()) : row;
    targetFrame.setPixel(x, y, color);
  };

  ns.BaseTool.prototype.moveUnactiveToolAt = function (
    col,
    row,
    frame,
    overlay,
    event
  ) {
    var coords = this.wrapCoords_(frame, col, row);
    if (overlay.containsPixel(coords.col, coords.row)) {
      this.updateHighlightedPixel(frame, overlay, coords.col, coords.row);
    } else {
      this.hideHighlightedPixel(overlay);
    }
  };

  ns.BaseTool.prototype.updateHighlightedPixel = function (
    frame,
    overlay,
    col,
    row
  ) {
    if (
      !isNaN(this.highlightedPixelCol) &&
      !isNaN(this.highlightedPixelRow) &&
      (this.highlightedPixelRow != row || this.highlightedPixelCol != col)
    ) {
      // Clean the previously highlighted pixel:
      overlay.clear();
    }

    var frameColor = pskl.utils.intToColor(frame.getPixel(col, row));
    var highlightColor = this.getHighlightColor_(frameColor);
    var size = this.supportsDynamicPenSize()
      ? pskl.app.penSizeService.getPenSize()
      : 1;
    pskl.PixelUtils.resizePixel(col, row, size).forEach(function (point) {
      overlay.setPixel(point[0], point[1], highlightColor);
    });

    this.highlightedPixelCol = col;
    this.highlightedPixelRow = row;
  };

  ns.BaseTool.prototype.getHighlightColor_ = function (frameColor) {
    if (!frameColor) {
      return Constants.TOOL_HIGHLIGHT_COLOR_DARK;
    }

    var luminance = window.tinycolor(frameColor).toHsl().l;
    if (luminance > 0.5) {
      return Constants.TOOL_HIGHLIGHT_COLOR_DARK;
    } else {
      return Constants.TOOL_HIGHLIGHT_COLOR_LIGHT;
    }
  };

  ns.BaseTool.prototype.hideHighlightedPixel = function (overlay) {
    if (
      this.highlightedPixelRow !== null &&
      this.highlightedPixelCol !== null
    ) {
      overlay.clear();
      this.highlightedPixelRow = null;
      this.highlightedPixelCol = null;
    }
  };

  ns.BaseTool.prototype.releaseToolAt = function (
    col,
    row,
    frame,
    overlay,
    event
  ) {};

  /**
   * Does the tool support the ALT modifier. To be overridden by subclasses.
   *
   * @return {Boolean} true if the tool supports ALT.
   */
  ns.BaseTool.prototype.supportsAlt = function () {
    return false;
  };
})();
