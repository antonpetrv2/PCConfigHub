export type ApiCategory =
  | 'complete_computer'
  | 'drive'
  | 'expansion_card'
  | 'motherboard'
  | 'cpu'
  | 'ram'
  | 'video_card'
  | 'sound_card'
  | 'storage'
  | 'floppy_drive'
  | 'optical_drive'
  | 'controller_card'
  | 'network_card'
  | 'io_card'
  | 'case'
  | 'psu'
  | 'monitor'
  | 'keyboard'
  | 'mouse'
  | 'external_module'
  | 'midi_module'
  | 'cable_adapter'
  | 'software_driver'
  | 'documentation'
  | 'other';

export const categoryLabels: Record<ApiCategory, string> = {
  complete_computer: 'Complete computer',
  drive: 'Drive',
  expansion_card: 'Expansion card',
  motherboard: 'Motherboard',
  cpu: 'CPU',
  ram: 'RAM',
  video_card: 'Video card',
  sound_card: 'Sound card',
  storage: 'Storage drive',
  floppy_drive: 'Floppy drive',
  optical_drive: 'Optical drive',
  controller_card: 'Controller card',
  network_card: 'Network card',
  io_card: 'I/O card',
  case: 'Case',
  psu: 'PSU',
  monitor: 'Monitor',
  keyboard: 'Keyboard',
  mouse: 'Mouse',
  external_module: 'External module',
  midi_module: 'MIDI module',
  cable_adapter: 'Cable / adapter',
  software_driver: 'Software / driver',
  documentation: 'Documentation',
  other: 'Other',
};

export const categoryOrder: ApiCategory[] = [
  'case',
  'cpu',
  'motherboard',
  'video_card',
  'sound_card',
  'ram',
  'psu',
  'drive',
  'expansion_card',
  'complete_computer',
  'monitor',
  'other',
];
