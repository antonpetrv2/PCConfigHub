import type { ApiCategory } from "@/lib/api/types";

export const categoryLabels: Record<ApiCategory, string> = {
  complete_computer: "Complete computer",
  drive: "Drive",
  expansion_card: "Expansion card",
  motherboard: "Motherboard",
  cpu: "CPU",
  ram: "RAM",
  video_card: "Video card",
  sound_card: "Sound card",
  storage: "Storage drive",
  floppy_drive: "Floppy drive",
  optical_drive: "Optical drive",
  controller_card: "Controller card",
  network_card: "Network card",
  io_card: "I/O card",
  case: "Case",
  psu: "PSU",
  monitor: "Monitor",
  keyboard: "Keyboard",
  mouse: "Mouse",
  external_module: "External module",
  midi_module: "MIDI module",
  cable_adapter: "Cable / adapter",
  software_driver: "Software / driver",
  documentation: "Documentation",
  other: "Other",
};

export const categoryOrder: ApiCategory[] = [
  "case",
  "cpu",
  "motherboard",
  "video_card",
  "sound_card",
  "ram",
  "psu",
  "drive",
  "expansion_card",
  "complete_computer",
  "monitor",
  "other",
];

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "multiselect"
  | "boolean";

export type CatalogField = {
  key: string;
  label: string;
  type?: FieldType;
  options?: string[];
  placeholder?: string;
};

export const conditionLabels = {
  working: "Working",
  partially_working: "Partially working",
  untested: "Untested",
  for_repair: "For repair",
  dead: "Dead",
};

export const conditionOrder = [
  "working",
  "partially_working",
  "untested",
  "for_repair",
  "dead",
] as const;

export const generalFields: CatalogField[] = [
  { key: "yearEra", label: "Year / approximate era", placeholder: "1993, late 486 era, early 1980s" },
  { key: "countryOfOrigin", label: "Country of origin" },
  { key: "serialNumber", label: "Serial number" },
  { key: "inventoryNumber", label: "Inventory number" },
  { key: "location", label: "Location / storage box" },
  { key: "acquisitionDate", label: "Acquisition date", type: "date" },
  { key: "source", label: "Source" },
  { key: "purchasePrice", label: "Purchase price", type: "number" },
  { key: "estimatedValue", label: "Estimated collector value", type: "number" },
  { key: "notes", label: "Notes", type: "textarea" },
];

const busOptions = ["ISA 8-bit", "ISA 16-bit", "VLB", "PCI", "AGP", "PCIe", "PC/104"];
const testedOptions = ["Working", "Partially tested", "Untested", "Failed", "Needs retest"];

export const categoryFields: Partial<Record<ApiCategory, CatalogField[]>> = {
  motherboard: [
    { key: "cpuType", label: "Socket / CPU type" },
    { key: "chipset", label: "Chipset" },
    { key: "busSlots", label: "Bus slots", type: "multiselect", options: ["ISA 8-bit", "ISA 16-bit", "VLB", "PCI", "AGP", "PC/104"] },
    { key: "bios", label: "BIOS type and version" },
    { key: "ramTypes", label: "Supported RAM types", type: "multiselect", options: ["DRAM", "FPM", "EDO", "SDRAM", "DDR", "DDR2", "DDR3", "DDR4", "DDR5", "proprietary"] },
    { key: "cache", label: "Cache information" },
    { key: "formFactor", label: "Form factor", type: "select", options: ["XT", "AT", "Baby AT", "LPX", "ATX", "proprietary", "PC/104"] },
    { key: "powerConnectors", label: "Power connectors", type: "multiselect", options: ["AT", "ATX", "ATX12V", "proprietary"] },
    { key: "battery", label: "Battery type / leakage status" },
    { key: "knownIssues", label: "Known issues", type: "textarea" },
    { key: "testedStatus", label: "Tested status", type: "select", options: testedOptions },
  ],
  cpu: [
    { key: "architecture", label: "Architecture / generation" },
    { key: "clockSpeed", label: "Clock speed" },
    { key: "socket", label: "Socket" },
    { key: "fpuPresent", label: "FPU present", type: "boolean" },
    { key: "voltage", label: "Voltage" },
    { key: "cache", label: "Cache" },
    { key: "testedStatus", label: "Tested status", type: "select", options: testedOptions },
  ],
  case: [
    { key: "caseStyle", label: "Case style", type: "select", options: ["desktop", "tower", "mini tower", "rackmount", "portable", "laptop"] },
    { key: "supportedFormFactor", label: "Supported motherboard form factor", options: ["XT", "AT", "Baby AT", "LPX", "ATX", "proprietary", "PC/104"] },
    { key: "psuType", label: "PSU type", type: "select", options: ["AT", "ATX", "proprietary"] },
    { key: "driveBays", label: "Drive bays" },
    { key: "turboDisplay", label: "Turbo button/display", type: "boolean" },
    { key: "keyLock", label: "Key lock", type: "boolean" },
    { key: "resetButton", label: "Reset button", type: "boolean" },
    { key: "rustYellowing", label: "Rust/yellowing condition" },
    { key: "originality", label: "Originality / modifications", type: "textarea" },
  ],
  video_card: [
    { key: "busType", label: "Bus type", type: "select", options: ["ISA", "VLB", "PCI", "AGP", "PCIe"] },
    { key: "chipset", label: "Chipset" },
    { key: "videoMemory", label: "Video memory" },
    { key: "outputs", label: "Outputs" },
    { key: "standards", label: "Supported standards", type: "multiselect", options: ["MDA", "CGA", "EGA", "VGA", "SVGA", "Hercules", "Glide", "Direct3D", "OpenGL"] },
    { key: "testedResolutions", label: "Tested resolutions" },
    { key: "driverAvailability", label: "Driver availability" },
  ],
  expansion_card: [
    { key: "busType", label: "Bus type", type: "select", options: busOptions },
    { key: "chipset", label: "Chipset" },
    { key: "function", label: "Function" },
    { key: "ports", label: "Ports" },
    { key: "driverAvailability", label: "Driver availability" },
    { key: "dosCompatibility", label: "DOS compatibility" },
    { key: "windowsCompatibility", label: "Windows compatibility" },
  ],
  sound_card: [
    { key: "busType", label: "Bus type", type: "select", options: busOptions },
    { key: "chipset", label: "Chipset" },
    { key: "oplFm", label: "OPL/FM synthesis" },
    { key: "midiHeader", label: "MIDI / WaveBlaster header", type: "boolean" },
    { key: "gameport", label: "Gameport", type: "boolean" },
    { key: "dosCompatibility", label: "DOS compatibility" },
    { key: "windowsCompatibility", label: "Windows compatibility" },
  ],
  storage: [
    { key: "interface", label: "Interface", type: "select", options: ["MFM", "RLL", "IDE", "SCSI", "SATA", "CF", "SD", "USB", "PCMCIA"] },
    { key: "capacity", label: "Capacity" },
    { key: "workingCondition", label: "Working condition" },
    { key: "spinUpStatus", label: "Noise / spin-up status" },
    { key: "badSectors", label: "Bad sectors" },
    { key: "bootTested", label: "Boot tested", type: "boolean" },
  ],
  drive: [
    { key: "interface", label: "Interface", type: "select", options: ["MFM", "RLL", "IDE", "SCSI", "SATA", "CF", "SD", "USB", "PCMCIA"] },
    { key: "driveType", label: "Drive type", type: "select", options: ["Hard disk", "SSD", "Floppy", "Optical", "Tape", "Flash adapter"] },
    { key: "capacity", label: "Capacity" },
    { key: "workingCondition", label: "Working condition" },
    { key: "spinUpStatus", label: "Noise / spin-up status" },
    { key: "badSectors", label: "Bad sectors" },
    { key: "bootTested", label: "Boot tested", type: "boolean" },
  ],
  complete_computer: [
    { key: "cpu", label: "CPU" },
    { key: "ram", label: "RAM" },
    { key: "storage", label: "Storage" },
    { key: "video", label: "Video" },
    { key: "sound", label: "Sound" },
    { key: "operatingSystem", label: "Operating system" },
    { key: "ports", label: "Ports" },
    { key: "expansionCards", label: "Expansion cards", type: "textarea" },
    { key: "monitorUsed", label: "Monitor used" },
    { key: "testedSoftware", label: "Tested games/software", type: "textarea" },
    { key: "benchmarks", label: "Benchmark results", type: "textarea" },
    { key: "knownIssues", label: "Known issues", type: "textarea" },
    { key: "restorationNotes", label: "Restoration notes", type: "textarea" },
  ],
};

export const getCategoryFields = (category: ApiCategory) =>
  categoryFields[category] ?? [
    { key: "interface", label: "Interface / connector" },
    { key: "compatibility", label: "Compatibility" },
    { key: "testedStatus", label: "Tested status", type: "select", options: testedOptions },
    { key: "knownIssues", label: "Known issues", type: "textarea" },
  ];
