import type { CompatibilityResult } from "@/lib/api/types";
import type { PartRecord } from "@/services/api/parts-service";

const getSpecNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const getSpecString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value : null;

const getSpecStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item) => typeof item === "string") : null;

const parsePciSlot = (value: string) => {
  const normalized = value.toLowerCase().replace(/\s+/g, " ").trim();
  const generationMatch = normalized.match(/(?:pcie|pci-e|pci express)?\s*(\d)(?:\.0)?/);
  const lanesMatch = normalized.match(/x\s*(\d+)/);

  return {
    raw: normalized,
    generation: generationMatch ? Number(generationMatch[1]) : null,
    lanes: lanesMatch ? Number(lanesMatch[1]) : null,
    isPcie:
      normalized.includes("pcie") ||
      normalized.includes("pci-e") ||
      normalized.includes("pci express") ||
      Boolean(lanesMatch),
  };
};

const hasCompatiblePciSlot = (motherboardSlots: string[], gpuSlot: string) => {
  const gpu = parsePciSlot(gpuSlot);

  return motherboardSlots.some((slot) => {
    const motherboardSlot = parsePciSlot(slot);

    if (motherboardSlot.raw === gpu.raw) {
      return true;
    }

    if (!motherboardSlot.isPcie || !gpu.isPcie) {
      return false;
    }

    if (motherboardSlot.lanes && gpu.lanes) {
      return motherboardSlot.lanes >= gpu.lanes;
    }

    // If the DB has only the PCIe generation, e.g. "4", do not reject the build
    // as incompatible. Treat it as enough signal that this is a PCIe slot family.
    return Boolean(motherboardSlot.generation && gpu.generation);
  });
};

export const checkCompatibility = (parts: PartRecord[]): CompatibilityResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const motherboard = parts.find((part) => part.category === "motherboard");
  const cpu = parts.find((part) => part.category === "cpu");
  const gpu = parts.find((part) => part.category === "gpu");
  const ram = parts.find((part) => part.category === "ram");
  const psu = parts.find((part) => part.category === "psu");
  const casePart = parts.find((part) => part.category === "case");

  const motherboardSocket = getSpecString(motherboard?.specs.socket)?.toLowerCase();
  const cpuSocket = getSpecString(cpu?.specs.socket)?.toLowerCase();
  if (motherboardSocket && cpuSocket && motherboardSocket !== cpuSocket) {
    errors.push("CPU socket does not match motherboard socket.");
  } else if (motherboard && cpu && (!motherboardSocket || !cpuSocket)) {
    warnings.push("Missing CPU or motherboard socket data for validation.");
  }

  const pciSlots = getSpecStringArray(motherboard?.specs.pciSlots)?.map((slot) =>
    slot.toLowerCase()
  );
  const gpuSlot = getSpecString(gpu?.specs.pciSlot)?.toLowerCase();
  if (pciSlots && gpuSlot && !hasCompatiblePciSlot(pciSlots, gpuSlot)) {
    errors.push("GPU PCI slot is not available on the motherboard.");
  } else if (motherboard && gpu && (!pciSlots || !gpuSlot)) {
    warnings.push("Missing PCI slot data for GPU compatibility.");
  }

  const ramType = getSpecString(ram?.specs.type)?.toLowerCase();
  const motherboardRamType = getSpecString(motherboard?.specs.ramType)?.toLowerCase();
  if (ramType && motherboardRamType && ramType !== motherboardRamType) {
    errors.push("RAM type does not match motherboard RAM type.");
  } else if (motherboard && ram && (!ramType || !motherboardRamType)) {
    warnings.push("Missing RAM type data for compatibility.");
  }

  const casePsuFormFactor = getSpecString(casePart?.specs.psuFormFactor)?.toLowerCase();
  const psuFormFactor = getSpecString(psu?.specs.formFactor)?.toLowerCase();
  if (casePsuFormFactor && psuFormFactor && casePsuFormFactor !== psuFormFactor) {
    errors.push("PSU form factor is not supported by the case.");
  } else if (casePart && psu && (!casePsuFormFactor || !psuFormFactor)) {
    warnings.push("Missing PSU form factor data for compatibility.");
  }

  const caseFormFactors = getSpecStringArray(casePart?.specs.formFactor)?.map(
    (factor) => factor.toLowerCase()
  );
  const motherboardFormFactor = getSpecString(motherboard?.specs.formFactor)?.toLowerCase();
  if (
    caseFormFactors &&
    motherboardFormFactor &&
    !caseFormFactors.includes(motherboardFormFactor)
  ) {
    errors.push("Motherboard form factor is not supported by the case.");
  } else if (casePart && motherboard && (!caseFormFactors || !motherboardFormFactor)) {
    warnings.push("Missing case or motherboard form factor data for validation.");
  }

  const gpuLength = getSpecNumber(gpu?.specs.length);
  const maxGpuLength = getSpecNumber(casePart?.specs.maxGpuLength);
  if (gpuLength && maxGpuLength) {
    if (gpuLength > maxGpuLength) {
      errors.push("GPU length exceeds case clearance.");
    } else if (gpuLength > maxGpuLength * 0.9) {
      warnings.push("GPU length is close to the case clearance limit.");
    }
  } else if (gpu && casePart && (!gpuLength || !maxGpuLength)) {
    warnings.push("Missing GPU length data for compatibility.");
  }

  const cpuTdp = getSpecNumber(cpu?.specs.tdp) ?? 0;
  const gpuTdp = getSpecNumber(gpu?.specs.tdp) ?? 0;
  const psuWattage = getSpecNumber(psu?.specs.wattage);
  const totalTdp = cpuTdp + gpuTdp;

  if (psuWattage) {
    const safeLimit = psuWattage * 0.85;
    const warnLimit = psuWattage * 0.75;

    if (totalTdp > safeLimit) {
      errors.push("Total TDP exceeds PSU safe limit.");
    } else if (totalTdp > warnLimit) {
      warnings.push("Total TDP is approaching PSU limit.");
    }
  } else if (psu && totalTdp) {
    warnings.push("Missing PSU wattage data for power validation.");
  }

  return {
    compatible: errors.length === 0,
    warnings,
    errors,
  };
};
