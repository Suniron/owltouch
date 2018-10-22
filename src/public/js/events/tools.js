import L from 'leaflet';
import { bankLayerGroup, dofusCoordsToGeoCoords, map, phoenixLayerGroup } from '../map/map';
import { checkIfMapAlreadyExist, deleteAction, movementType } from '../scripts/pathMaker';

const sizeOf = require('image-size');
const path = require('path');

function bmHandler(data, coord, marker) {
  const indexBankOut = checkIfMapAlreadyExist([coord[0], coord[1]], movementType.move);
  if (indexBankOut !== null) {
    if (indexBankOut.data.bankOut) {
      deleteAction(movementType.move, indexBankOut, 'bankOut');
    } else {
      indexBankOut.data.bankOut = { mapid: data.mapIdInSide, sun: data.sunIdInside, mapIdOutSide: data.mapIdOutSide };
    }
  } else {
    movementType.move.push({
      coord: [coord[0], coord[1]],
      data: {
        bankOut: { mapid: data.mapIdInSide, sun: data.sunIdInside, mapIdOutSide: data.mapIdOutSide },
      },
      marker: {
        move: marker.addTo(map),
      },
    });
  }
}


function bpDefineCoord(coordElementId, type, data) {
  const coord = $(coordElementId).data('coord');
  const index = checkIfMapAlreadyExist([coord[0], coord[1]], movementType[type]);
  const marker = L.marker(dofusCoordsToGeoCoords([coord[0], coord[1]]), {
    icon: L.icon({
      iconUrl: path.join(__dirname, `../../../data/assets/path/${type}/${type}.png`),
      iconAnchor: [
        sizeOf(path.join(__dirname, `../../../data/assets/path/${type}/${type}.png`)).width / 2,
        sizeOf(path.join(__dirname, `../../../data/assets/path/${type}/${type}.png`)).height / 2,
      ],
      className: type,
    }),
    zIndexOffset: 10000,
    interactive: false,
  });
  if (index !== null) {
    if (index.data[type]) {
      deleteAction(movementType[type], index, type);
    } else {
      index.data[type] = data;
      index.marker[type] = marker.addTo(map);
    }
    bmHandler(data, coord, marker);
  } else if (type === 'bank') {
    movementType.bank.push({
      coord: [coord[0], coord[1]],
      data: {
        bank: {
          mapIdOutSide: data.mapIdOutSide,
          doorIdOutSide: data.doorIdOutSide,
          mapIdInSide: data.mapIdInSide,
        },
      },
      marker: {
        bank: marker.addTo(map),
      },
    });
    bmHandler(data, coord, marker);
  } else if (type === 'phoenix') {
    movementType[type].push({
      coord: [coord[0], coord[1]],
      data: {
        [type]: data,
      },
      marker: {
        [type]: marker.addTo(map),
      },
    });
  }
}


$('#defineBankCoordConfirm').on('click', () => {
  bpDefineCoord('#defineBankCoord', 'bank', {
    bank: true,
    mapIdOutSide: $('#mapIdOutSide').val(),
    doorIdOutSide: $('#doorIdOutSide').val(),
    mapIdInSide: $('#mapIdInSide').val(),
    sunIdInside: $('#sunIdInside').val(),
  });
});

$('#definePhoenixCoordConfirm').on('click', () => {
  bpDefineCoord('#definePhoenixCoord', 'phoenix', {
    phoenix: true,
    phoenixCellid: $('#phoenixCellid').val(),
  });
});

$('#phoenixPlacement').on('click', (e) => {
  $(e.currentTarget).toggleClass('selected');
  if ($(e.currentTarget).hasClass('selected')) {
    bankLayerGroup.remove();
    phoenixLayerGroup.addTo(map);
    ['top', 'bottom', 'left', 'right', 'delete', 'bankPlacement'].forEach((element) => {
      $(`#${element}`).removeClass('selected');
    });
  } else {
    phoenixLayerGroup.remove();
  }
});

$('#bankPlacement').on('click', (e) => {
  $(e.currentTarget).toggleClass('selected');
  if ($(e.currentTarget).hasClass('selected')) {
    phoenixLayerGroup.remove();
    bankLayerGroup.addTo(map);
    ['top', 'bottom', 'left', 'right', 'delete', 'phoenixPlacement'].forEach((element) => {
      $(`#${element}`).removeClass('selected');
    });
  } else {
    bankLayerGroup.remove();
  }
});

$('#delete').on('click', (e) => {
  $(e.currentTarget).toggleClass('selected');
  if ($(e.currentTarget).hasClass('selected')) {
    phoenixLayerGroup.remove();
    bankLayerGroup.remove();
    ['top', 'bottom', 'left', 'right', 'phoenixPlacement', 'bankPlacement'].forEach((element) => {
      $(`#${element}`).removeClass('selected');
    });
  }
});

$('#top, #bottom, #left, #right').on('click', (e) => {
  $(e.currentTarget).toggleClass('selected');
  if ($(e.currentTarget).hasClass('selected')) {
    phoenixLayerGroup.remove();
    bankLayerGroup.remove();
    ['delete', 'phoenixPlacement', 'bankPlacement'].forEach((element) => {
      $(`#${element}`).removeClass('selected');
    });
  }
});
