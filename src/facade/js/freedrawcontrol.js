/**
 * @module M/control/FreeDrawControl
 */

import FreeDrawImplControl from 'impl/freedrawcontrol';
import template from 'templates/freedraw';
import vanillaColorPicker from './vanilla-color-picker';

export default class FreeDrawControl extends M.Control {
  /**
   * @classdesc
   * Main constructor of the class. Creates a PluginControl
   * control
   *
   * @constructor
   * @extends {M.Control}
   * @api stable
   */
  constructor() {
    // 1. checks if the implementation can create PluginControl
    if (M.utils.isUndefined(FreeDrawImplControl)) {
      M.exception('La implementación usada no puede crear controles FreeDrawControl');
    }
    // 2. implementation of this control
    const impl = new FreeDrawImplControl();
    super(impl, 'FreeDraw');
    this.editLayer = new M.layer.Vector({
      name: 'freeDrawLayer',
      source: {},
    });
    this.impl = impl;
  }

  /**
   * This function creates the view
   *
   * @public
   * @function
   * @param {M.Map} map to add the control
   * @api stable
   */
  createView(map) {
    this.facadeMap_ = map;
    map.addLayers(this.editLayer);
    return new Promise((success, fail) => {
      const html = M.template.compileSync(template);
      this.template_ = html;
      this.template_.querySelector('div#colorPicker').addEventListener('change', e => this.changeColor_(e));
      this.template_.querySelector('#text').addEventListener('click', e => this.manageDraw_(e));
      this.template_.querySelector('#point').addEventListener('click', e => this.manageDraw_(e));
      this.template_.querySelector('#polygon').addEventListener('click', e => this.manageDraw_(e));
      this.template_.querySelector('#lineString').addEventListener('click', e => this.manageDraw_(e));
      this.template_.querySelector('#eliminar').addEventListener('click', e => this.removeFeatures_(e));
      // Se captura evento con el fin de borrar el popup vacio.
      document.addEventListener('DOMNodeInserted', e => this.handleOnRemovePopup(e));
      if (this.editLayer.getImpl().getOL3Layer()) { // Cambiar el color si se ha dibujado algo
        this.impl.setStyle('#ffcc33', this.editLayer.getImpl().getOL3Layer());
      }
      success(this.template_);
    });
  }

  /**
   * This function prevent to show empty popup
   *
   * @public
   * @function
   * @api stable
   */
  handleOnRemovePopup(e) {
    const facadeMap = this.facadeMap_;
    const currentPopup = this.facadeMap_ ? this.facadeMap_.getPopup() : null;
    const contextOfPopup = currentPopup ? currentPopup.getContent() : null;
    if (facadeMap && currentPopup !== null &&
      contextOfPopup !== null && contextOfPopup.innerText.trim().length === 0) {
      this.facadeMap_.removePopup(this.facadeMap_.getPopup());
    }

    // Move the div of the picker Color correctly to be able
    // to select the color when the position is down.
    const positionPanel = this.getPanel() && this.getPanel().position;
    const elementPickerColor = document.querySelector('div#idTrack');
    if (elementPickerColor && (positionPanel === '.m-bottom.m-right' || positionPanel === '.m-bottom.m-left')) {
      elementPickerColor.style.top = '-10rem';
    }
  }

  /**
   * This function is called on the control activation
   *
   * @public
   * @function
   * @api stable
   */
  activate() {
    super.activate();
  }
  /**
   * This function is called on the control deactivation
   *
   * @public
   * @function
   * @api stable
   */
  // deactivate() {
  //   super.deactivate();
  // }

  /**
   * This function gets activation button
   *
   * @public
   * @function
   * @param {HTML} html of control
   * @api stable
   */
  getActivationButton(html) {
    return html.querySelector('.m-freedraw button');
  }

  /**
   * This function compares controls
   *
   * @public
   * @function
   * @param {M.Control} control to compare
   * @api stable
   */
  equals(control) {
    return control instanceof FreeDrawControl;
  }

  manageDraw_(evt) {
    let isTheSame = false;
    const value = evt.target.getAttribute('data-geometry-type');

    isTheSame = this.manageActivatedDeactivated(evt.target);
    const arrayInteractions = [].concat(this.facadeMap_.getMapImpl().getInteractions().getArray());

    arrayInteractions.forEach((interaction) => {
      if (this.getImpl().isInteractionInstanceOfDrawOrModify(interaction)) {
        if (interaction && interaction.J && interaction.J === value) {
          isTheSame = true;
        }
        this.facadeMap_.getMapImpl().removeInteraction(interaction);
      }
    });

    if (!isTheSame) {
      let olLayer = this.editLayer.getImpl().getOL3Layer();
      if (!olLayer) {
        olLayer = this.map_.getLayers().find(l => l.name === 'freeDrawLayer').getImpl().getOL3Layer();
        this.editLayer = this.map_.getLayers().find(l => l.name === 'freeDrawLayer');
      }
      let draw = null;
      draw = this.getImpl()
        .createNewDrawInteraction(olLayer, value);

      this.facadeMap_.getMapImpl().addInteraction(draw);

      const modify = this.getImpl()
        .createNewModifyInteraction(olLayer);

      this.facadeMap_.getMapImpl().addInteraction(modify);

      if (evt.target.id === 'text') {
        draw.on('drawend', (event) => {
          M.dialog.info(
            `<div style="padding-bottom: 15px;">
              <div style=" padding-bottom: 6px;">
                <pan>Texto:<input type="text" style="width:97%" id="m-feature-freedrawing-ftext"></pan>
              </div>
              <div style="max-width: 99%">
                <select style=" margin-right: 6px;" id="m-feature-freedrawing-ffont">
                  <option>Arial</option>
                  <option>Comic Sans MS</option>
                  <option>Courier</option>
                  <option>Monospace</option>
                  <option>Sans-serif</option>
                  <option>Times New Roman</option>
                  <option>Verdana</option>
                </select>
                <input type="number" style="width: 50px;margin-right: 6px;" min="12" max="48" value="12"
                  id="m-feature-freedrawing-fsizefont">
                <button id="m-feature-freedrawing-fbold" style="font-weight: bold;margin-right: 6px;">N</button>
                <button id="m-feature-freedrawing-fcursive" style="font-style:italic;margin-right: 6px;">C</button>
                <div class="just-picker-font" style="width: 22px;height: 19px;border: 1px solid black;
                  display: inline-block;position: absolute;background-color: rgb(0, 0, 0);"
                  id="m-feature-freedrawing-fcolorfont"></div>
              </div>
            </div>
            <div>
              <span>Borde:</span><br>
              <input type="number" style="width: 50px;margin-right: 6px;" min="1" max="10" value="1"
                id="m-feature-freedrawing-fsizeborder">
              <div class="just-picker-border" style="width: 22px; height: 19px;border: 1px solid black;
                display: inline-block;position: absolute; background-color: rgb(0, 0, 0);"
                id="m-feature-freedrawing-fcolorborder"></div>
            </div>`,
            'AÑADIR TEXTO',
          );
          const dialog = document.querySelector('div.m-dialog');
          // change style popup
          dialog.querySelector('div.m-title').style.backgroundColor = '#d5006e';
          dialog.querySelector('div.m-button>button').style.backgroundColor = '#d5006e';
          const okButton = document.querySelector('div.m-button > button');
          okButton.parentNode.innerHTML += '';
          okButton.addEventListener('click', () => {
            dialog.parentNode.removeChild(dialog);
          });

          let bold = document.querySelector('button#m-feature-freedrawing-fbold');
          let cursive = document.querySelector('button#m-feature-freedrawing-fcursive');
          bold.addEventListener('click', () => {
            bold.classList.toggle('m-freedrawig-dialog-button-active');
          });
          cursive.addEventListener('click', () => {
            cursive.classList.toggle('m-freedrawig-dialog-button-active');
          });

          document.querySelector('div.m-dialog>div.m-modal>div.m-content>div.m-button>button').addEventListener('click', () => {
            const text = document.querySelector('input#m-feature-freedrawing-ftext').value;
            const font = document.querySelector('select#m-feature-freedrawing-ffont').value;
            const sizeFont = document.querySelector('input#m-feature-freedrawing-fsizefont').value;
            bold = document.querySelector('button#m-feature-freedrawing-fbold').classList.length;
            cursive = document.querySelector('button#m-feature-freedrawing-fcursive').classList.length;
            const colorFont = document.querySelector('div#m-feature-freedrawing-fcolorfont').style.backgroundColor;
            const sizeBorder = document.querySelector('input#m-feature-freedrawing-fsizeborder').value;
            const colorBorder = document.querySelector('div#m-feature-freedrawing-fcolorborder').style.backgroundColor;
            this.setContent_(
              event.feature,
              text,
              font,
              sizeFont,
              bold,
              cursive,
              colorFont,
              sizeBorder,
              colorBorder,
            );
            dialog.parentNode.removeChild(dialog);
          });
          const pickerFont = vanillaColorPicker(document.querySelector('div.just-picker-font'));
          pickerFont.on('colorChosen', (color, targetElem) => {
            const varTargetElem = targetElem;
            varTargetElem.style.backgroundColor = color;
          });
          pickerFont.set('customColors', ['#fd5308', '#fb9902', '#ffcc33', '#fefe33', '#d0ea2b', '#66b032', '#0391ce', '#0247fe', '#3d01a4', '#8601af', '#a7194b', '#fe2712', '#000000', '#ffffff']);
          const pickerBorder = vanillaColorPicker(document.querySelector('div.just-picker-border'));
          pickerBorder.on('colorChosen', (color, targetElem) => {
            const varTargetElem = targetElem;
            varTargetElem.style.backgroundColor = color;
          });
          pickerBorder.set('customColors', ['#fd5308', '#fb9902', '#ffcc33', '#fefe33', '#d0ea2b', '#66b032', '#0391ce', '#0247fe', '#3d01a4', '#8601af', '#a7194b', '#fe2712', '#000000', '#ffffff']);
        });
      }
    }
    isTheSame = false;
  }

  deactivate(target) {
    const arrayInteractions = [].concat(this.facadeMap_.getMapImpl().getInteractions().getArray());
    arrayInteractions.forEach((interaction) => {
      this.getImpl().removeInteraction(interaction);
    });
  }

  manageActivatedDeactivated(target) {
    let isTheSame = false;
    const panel = document.querySelector('.m-freedrawing-tools-panel');
    const elements = panel.querySelectorAll('.activated');
    if (elements && elements != null && elements.length) {
      for (let i = 0; i < elements.length; i += 1) {
        const elementAux = elements[0];
        if (elementAux.className === target.className) {
          isTheSame = true;
        }
        elementAux.className = elementAux.className.replace(/\bactivated\b/, '');
      }
    }
    if (!isTheSame) {
      // eslint-disable-next-line no-param-reassign
      target.className = `${target.className} activated`;
    }
    return isTheSame;
  }

  desactivateButtoms() {
    const panel = document.querySelector('.m-freedrawing-tools-panel');
    const elements = panel.querySelectorAll('.activated');
    if (elements && elements != null && elements.length) {
      for (let i = 0; i < elements.length; i += 1) {
        const evt = { target: elements[0] };
        this.manageDraw_(evt);
      }
    }
  }

  removeFeatures_() {
    this.editLayer.clear();
  }

  destroy() {
    this.facadeMap_.getMapImpl().removeControl(this);
    this.facadeMap_ = null;
  }

  changeColor_() {
    let olLayer = this.editLayer.getImpl().getOL3Layer();
    if (!olLayer) {
      olLayer = this.map_.getLayers().find(l => l.name === 'freeDrawLayer').getImpl().getOL3Layer();
      this.editLayer = this.map_.getLayers().find(l => l.name === 'freeDrawLayer');
    }
    const color = this.template_.querySelector('div#colorPicker>input.colorInput').value;
    this.impl.setStyle(color, olLayer);
  }

  setContent_(feature, text, font, sizeFont, bold, cursive, colorFont, sizeBorder, colorBorder) {
    // eslint-disable-next-line no-param-reassign
    if (M.utils.isNullOrEmpty(text)) text = 'Texto';
    // eslint-disable-next-line no-param-reassign
    bold = bold > 0 ? 'bold' : '';
    // eslint-disable-next-line no-param-reassign
    cursive = cursive > 0 ? 'italic' : '';
    feature.setStyle(this.impl.getStyle2(
      text,
      font,
      sizeFont,
      bold,
      cursive,
      colorFont,
      sizeBorder,
      colorBorder,
    ));
  }
}
