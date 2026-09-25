import landlordList from '../landlord-list.mjs';
import landlordDetail from '../landlord-detail.mjs';
import landlordNew from '../landlord-new.mjs';
import extraction from '../extraction.mjs';
import headLeaseDetail from '../head-lease-detail.mjs';
import headLeaseIndex from '../head-lease-index.mjs';
import buildingList from '../building-list.mjs';
import buildingDetail from '../building-detail.mjs';
import roomsNew from '../rooms-new.mjs';
import roomList from '../room-list.mjs';
import roomDetail from '../room-detail.mjs';

export const routes = [
  ['/landlords', landlordList, { menu: 'UI-02', perm: 'landlord.view' }],
  ['/landlords/new', landlordNew, { menu: 'UI-02', perm: 'landlord.create' }],
  ['/landlords/import', extraction, { menu: 'UI-03', perm: 'extraction.run' }],
  ['/landlords/:id', landlordDetail, { menu: 'UI-02', perm: 'landlord.view' }],
  ['/head-leases', headLeaseIndex, { menu: 'UI-03', perm: 'headLease.view' }],
  ['/head-leases/:id', headLeaseDetail, { menu: 'UI-03', perm: 'headLease.view' }],
  ['/buildings', buildingList, { menu: 'UI-04', perm: 'building.view' }],
  ['/buildings/:id', buildingDetail, { menu: 'UI-04', perm: 'building.view' }],
  ['/rooms', roomList, { menu: 'UI-05', perm: 'room.view' }],
  ['/rooms/new', roomsNew, { menu: 'UI-05', perm: 'room.create' }],
  ['/rooms/:id', roomDetail, { menu: 'UI-05', perm: 'room.view' }],
];
export const perms = {};
export const chips = {};
export const search = [];
