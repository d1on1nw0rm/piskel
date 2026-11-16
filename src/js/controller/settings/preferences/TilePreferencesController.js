(function () {
  var ns = $.namespace("pskl.controller.settings.preferences");

  ns.TilePreferencesController = function (
    piskelController,
    preferencesController
  ) {
    this.piskelController = piskelController;
    this.preferencesController = preferencesController;
  };

  pskl.utils.inherit(
    ns.TilePreferencesController,
    pskl.controller.settings.AbstractSettingController
  );

  ns.TilePreferencesController.prototype.init = function () {
    // Tile mode
    var tileMode = pskl.UserSettings.get(pskl.UserSettings.SEAMLESS_MODE);
    var tileModeCheckbox = document.querySelector(".tile-mode-checkbox");
    if (tileMode) {
      tileModeCheckbox.setAttribute("checked", tileMode);
    }
    this.addEventListener(tileModeCheckbox, "change", this.onTileModeChange_);

    // Tile mask opacity
    var tileMaskOpacityInput = document.querySelector(
      ".tile-mask-opacity-input"
    );
    tileMaskOpacityInput.value = pskl.UserSettings.get(
      pskl.UserSettings.SEAMLESS_OPACITY
    );
    this.addEventListener(
      tileMaskOpacityInput,
      "change",
      this.onTileMaskOpacityChange_
    );
    this.addEventListener(
      tileMaskOpacityInput,
      "input",
      this.onTileMaskOpacityChange_
    );
    this.updateTileMaskOpacityText_(tileMaskOpacityInput.value);

    var cycleModeSelect = document.querySelector(".cycle-mode-select");
    cycleModeSelect.value = pskl.UserSettings.get(pskl.UserSettings.CYCLE_MODE);
    this.addEventListener(cycleModeSelect, "change", this.onCycleModeChange_);
  };

  ns.TilePreferencesController.prototype.onTileModeChange_ = function (evt) {
    pskl.UserSettings.set(
      pskl.UserSettings.SEAMLESS_MODE,
      evt.currentTarget.checked
    );
  };

  ns.TilePreferencesController.prototype.onCycleModeChange_ = function (evt) {
    var cycleMode = parseInt(evt.target.value, 10);
    pskl.UserSettings.set(pskl.UserSettings.CYCLE_MODE, cycleMode);
  };

  ns.TilePreferencesController.prototype.onTileMaskOpacityChange_ = function (
    evt
  ) {
    var target = evt.target;
    var opacity = parseFloat(target.value);
    if (!isNaN(opacity)) {
      pskl.UserSettings.set(pskl.UserSettings.SEAMLESS_OPACITY, opacity);
      this.updateTileMaskOpacityText_(opacity);
    } else {
      target.value = pskl.UserSettings.get(pskl.UserSettings.SEAMLESS_OPACITY);
    }
  };

  ns.TilePreferencesController.prototype.updateTileMaskOpacityText_ = function (
    opacity
  ) {
    var seamlessOpacityText = document.querySelector(".tile-mask-opacity-text");
    seamlessOpacityText.innerHTML = (opacity * 1).toFixed(2);
  };
})();
