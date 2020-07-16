/**
 * @module M/plugin/FreeDraw
 */
import 'assets/css/freedraw';
import 'assets/css/tinycolorpicker';
import tinycolorpicker from './tinycolorpicker.min';
import FreeDrawControl from './freedrawcontrol';
import api from '../../api';

export default class FreeDraw extends M.Plugin {
  /**
   * @classdesc
   * Main facade plugin object. This class creates a plugin
   * object which has an implementation Object
   *
   * @constructor
   * @extends {M.Plugin}
   * @param {Object} impl implementation object
   * @api stable
   */
  constructor(options = {}) {
    super();
    /**
     * Facade of the map
     * @private
     * @type {M.Map}
     */
    this.map_ = null;

    /**
     * Array of controls
     * @private
     * @type {Array<M.Control>}
     */
    this.controls_ = [];

    /**
     * Position of the Plugin
     * Posible values: TR | TL | BL | BR
     * @type {Enum}
     */
    this.position_ = options.position || 'TL';
    // Adds class if closing arrow has to point left
    if (this.position_ === 'TL' || this.position_ === 'BL') {
      this.positionClass_ = 'left';
    }

    /**
     * Metadata from api.json
     * @private
     * @type {Object}
     */
    this.metadata_ = api.metadata;
  }

  /**
   * This function adds this plugin into the map
   *
   * @public
   * @function
   * @param {M.Map} map the map to add the plugin
   * @api stable
   */
  addTo(map) {
    this.map_ = map;
    this.control_ = new FreeDrawControl();

    this.control_.on(M.evt.ADDED_TO_PANEL, () => {
      const picker = document.querySelector('#colorPicker');
      tinycolorpicker(picker);
    });

    this.controls_.push(this.control_);
    this.map_ = map;
    this.panel_ = new M.ui.Panel('panelFreeDraw', { // M.plugin.freedraw.NAMETOOLS
      collapsible: true,
      className: `m-freedrawing-tools ${this.positionClass_}`,
      collapsedButtonClass: 'g-cartografia-editar2',
      position: M.ui.position[this.position_],
      tooltip: 'Dibujo',
    });

    this.panel_.addControls(this.controls_);
    map.addPanels(this.panel_);
  }

  /**
   * This function destroys this plugin
   *
   * @public
   * @function
   * @api stable
   */
  destroy() {
    if (this.control_) {
      this.control_.desactivateButtoms();
      // eslint-disable-next-line no-underscore-dangle
      this.control_.removeFeatures_();
      this.map_.removeControls([this.control_]);
      [this.control_, this.panel_, this.map_] = [null, null, null];
    }
  }

  /**
   * This function return the control of plugin
   *
   * @public
   * @function
   * @api stable
   */
  getControls() {
    const aControl = [];
    aControl.push(this.control_);
    return aControl;
  }

  /**
   * @getter
   * @public
   */
  get name() {
    return 'freedraw';
  }

  /**
   * This function gets metadata plugin
   *
   * @public
   * @function
   * @api stable
   */
  getMetadata() {
    return this.metadata_;
  }
}
