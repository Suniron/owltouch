/*
 * L.Control.Miscellaneous is used for displaying toggling miscellaneous resource buttons.
 */
import L from 'leaflet';
import sizeOf from 'image-size';
import {
  dofusCoordsToGeoCoords,
  map,
  json,
  hint,
  mcgLayerSupportGroup,
  mapTileLayer,
} from '../map';

const path = require('path');
const fs = require('fs');

L.Control.Miscellaneous = L.Control.extend({
  options: {
    position: 'topleft',
  },

  onAdd() {
    this.menuToggle = false;
    this.visible = [];
    this.prof = 'misc';
    this.resources = ['Misc', 'Class', 'Dungeon', 'Lair', 'Market', 'Workshop', 'Water'];
    const className = 'leaflet-control-miscellaneous container-resources';
    this.container = L.DomUtil.create('div', className);
    const container = this.container;
    container.style.marginTop = '0px';
    L.DomEvent.addListener(container, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(container, 'click', L.DomEvent.stop);
    L.DomEvent.addListener(container, 'mousemove', L.DomEvent.stop);

    this.aButton = L.DomUtil.create('a', 'misc-control dark', container);
    this.aButton.setAttribute('href', '#');
    this.aButton.setAttribute('title', 'Divers');
    this.aButton.style.borderTop = '2px solid #212529';
    this.imgButton = L.DomUtil.create('img', 'no-class', this.aButton);
    this.imgButton.setAttribute('src', './data/assets/misc/Hint.png');

    L.DomEvent.addListener(this.aButton, 'click', this.click, this);

    map.on('move', this.close, this);
    map.on('click', this.close, this);

    this.magicContainer = L.DomUtil.create('div', 'container-resources-magic', container);

    this.buttons = [];
    const resourcesLength = this.resources.length;
    for (let i = 0; i < resourcesLength; i += 1) {
      const aMagicButton = L.DomUtil.create(
        'a',
        `scale-border-in-out ${this.resources[i]}`,
        this.magicContainer,
      );
      aMagicButton.setAttribute('href', '#');
      // aMagicButton.setAttribute('title', i18next.t(this.prof + "." + this.resources[i]));
      const imgMagicButton = L.DomUtil.create('img', 'no-class', aMagicButton);
      imgMagicButton.setAttribute(
        'src',
        path.join(__dirname, `../../../../data/assets/misc/${this.resources[i]}.png`),
      );
      L.DomEvent.addListener(aMagicButton, 'click', this.toggle, this);
    }

    for (let j = 0; j < resourcesLength; j += 1) {
      json[this.resources[j]] = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, `../../../../data/json/miscellaneous/${this.resources[j]}.json`),
        ),
      );
      hint[this.resources[j]] = L.layerGroup();
      Object.keys(json[this.resources[j]]).forEach((key) => {
        if (
          json[this.resources[j]][key].worldMapId ===
          mapTileLayer.getTileLayer().worldMap
        ) {
          L.marker(
            dofusCoordsToGeoCoords([
              json[this.resources[j]][key].posX,
              json[this.resources[j]][key].posY,
            ]),
            {
              icon: L.icon({
                iconUrl: path.join(
                  __dirname,
                  `../../../../data/assets/hint/${json[this.resources[j]][key].gfx}.png`,
                ),
                iconAnchor: [
                  sizeOf(
                    path.join(
                      __dirname,
                      `../../../../data/assets/hint/${json[this.resources[j]][key].gfx}.png`,
                    ),
                  ).width / 2,
                  sizeOf(
                    path.join(
                      __dirname,
                      `../../../../data/assets/hint/${json[this.resources[j]][key].gfx}.png`,
                    ),
                  ).height / 2,
                ],
              }),
              interactive: false,
            },
          ).addTo(hint[this.resources[j]]);
        }
      });
      mcgLayerSupportGroup.checkIn([hint[this.resources[j]]]);
    }
    return container;
  },

  click(evt) {
    if (evt.ctrlKey) {
      for (let i = 0; i < this.resources.length; i += 1) {
        if (this.visible[i]) {
          continue;
        }
        $(this.magicContainer.children[i])[0].click();
      }
      return;
    }
    if (evt.altKey) {
      for (let j = 0; j < this.resources.length; j += 1) {
        if (this.visible[j]) {
          $(this.magicContainer.children[j])[0].click();
        } else {
          continue;
        }
      }
      return;
    }
    if (this.menuToggle === false) {
      L.DomUtil.addClass(this.aButton, 'container-resources-open');
      L.DomUtil.addClass(this.magicContainer, 'in');
      this.menuToggle = true;
    } else {
      this.close();
    }
  },
  close() {
    L.DomUtil.removeClass(this.magicContainer, 'in');
    L.DomUtil.removeClass(this.aButton, 'container-resources-open');
    this.menuToggle = false;
  },
  toggle(a) {
    for (let i = 0; i < this.resources.length; i += 1) {
      if (L.DomUtil.hasClass(a.currentTarget, this.resources[i])) {
        if (this.visible[i]) {
          hint[this.resources[i]].removeFrom(map);
          L.DomUtil.removeClass(a.currentTarget, 'selected');
          this.visible[i] = false;
        } else {
          hint[this.resources[i]].addTo(map);
          L.DomUtil.addClass(a.currentTarget, 'selected');
          this.visible[i] = true;
        }
        break;
      }
    }
  },

  onRemove() {
    map.off('move', this.close, this);
    map.off('click', this.close, this);
    // todo remove toggle listeners?
  },
});

// constructor registration
L.control.miscellaneous = function (options) {
  return new L.Control.Miscellaneous(options);
};
