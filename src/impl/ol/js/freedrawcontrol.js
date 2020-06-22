/**
 * @module M/impl/control/FreeDrawControl
 */
export default class FreeDrawControl extends M.impl.Control {
  /**
   * This function adds the control to the specified map
   *
   * @public
   * @function
   * @param {M.Map} map to add the plugin
   * @param {HTMLElement} html of the plugin
   * @api stable
   */
  addTo(map, html) {
    // obtengo la interacción por defecto del dblclick para manejarla
    const olMap = map.getMapImpl();
    olMap.getInteractions().forEach((interaction) => {
      if (interaction instanceof ol.interaction.DoubleClickZoom) {
        this.dblClickInteraction_ = interaction;
      }
    });
    this.facadeMap_ = map;
    // super addTo - don't delete
    super.addTo(map, html);
  }

  // Add your own functions
  activateClick(map) {
    // desactivo el zoom al dobleclick
    this.dblClickInteraction_.setActive(false);

    // añado un listener al evento dblclick
    const olMap = map.getMapImpl();
    olMap.on('dblclick', (evt) => {
      // disparo un custom event con las coordenadas del dobleclick
      const customEvt = new CustomEvent('mapclicked', {
        detail: evt.coordinate,
        bubbles: true,
      });
      map.getContainer().dispatchEvent(customEvt);
    });
  }

  deactivateClick(map) {
    // activo el zoom al dobleclick
    this.dblClickInteraction_.setActive(true);

    // elimino el listener del evento
    map.getMapImpl().removeEventListener('dblclick');
  }

  /**
   * This function checks if an interaction is
   * an instance of Draw or Modify
   */
  isInteractionInstanceOfDrawOrModify(interaction) {
    if (interaction instanceof ol.interaction.Draw ||
      interaction instanceof ol.interaction.Modify) {
      return true;
    }
    return false;
  }

  /**
   * This function creates a new ol.interaction.Draw object
   * @param {*} features
   * @param {*} type
   */
  createNewDrawInteraction(olLayer, type) {
    const newDraw = new ol.interaction.Draw({
      source: olLayer.getSource(),
      type,
    });
    return newDraw;
  }

  /**
   * This function creates a new ol.interaction.Modify object
   * @param {*} features
   */
  createNewModifyInteraction(olLayer) {
    return new ol.interaction.Modify({
      source: olLayer.getSource(),
      deleteCondition: (event) => {
        return ol.events.condition.shiftKeyOnly(event) &&
          ol.events.condition.singleClick(event);
      },
    });
  }

  removeInteraction(interaction) {
    if (interaction instanceof ol.interaction.Draw ||
      interaction instanceof ol.interaction.Modify) {
      this.facadeMap_.getMapImpl().removeInteraction(interaction);
    }
  }

  setStyle(color, olLayer) {
    if (olLayer) {
      olLayer.setStyle(this.getStyle1(color));
    }
  }

  getStyle1(color) {
    const newStyle = new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.5)',
      }),
      stroke: new ol.style.Stroke({
        color,
        width: 2,
      }),
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color,
        }),
      }),
    });
    return newStyle;
  }

  getStyle2(text, font, sizeFont, bold, cursive, colorFont, sizeBorder, colorBorder) {
    return new ol.style.Style({
      text: new ol.style.Text({
        text,
        font: `${bold} ${cursive} ${sizeFont}px ${font}`,
        fill: new ol.style.Fill({
          color: colorFont,
        }),
        stroke: new ol.style.Stroke({
          color: colorBorder,
          width: sizeBorder,
        }),
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(213, 0, 110, 0)',
        width: 0,
      }),
      fill: new ol.style.Fill({
        color: 'rgba(213, 0, 110, 0)',
      }),
    });
  }
}
