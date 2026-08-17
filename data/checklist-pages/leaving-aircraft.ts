import { leavingAircraftSource as sourceMarkdown } from "../checklist-source-documents";
import { createBuiltinChecklist } from "./_factory";

const item = (id: string, title: string) => ({ id: `leaving-aircraft.${id}`, title });

export const leavingAircraftChecklist = createBuiltinChecklist(
  "leaving-aircraft",
  "Leaving the Aircraft",
  "",
  [
    {
      id: "leaving-aircraft.procedures",
      title: "Procedures",
      items: [
        item("procedures.parking-brake", "Parking Brake"),
        item("procedures.logbook", "Logbook"),
        item("procedures.headset", "Headset"),
        item("procedures.voice-recorder", "Voice Recorder"),
        item("procedures.comms", "Comms"),
        item("procedures.time-log", "Time Log"),
        item("procedures.tlb", "TLB"),
        item("procedures.carbon-work", "Carbon Work"),
        item("procedures.charger", "Charger"),
        item("procedures.ipad", "iPad"),
        item("procedures.tidy-up", "Tidy up"),
        item("procedures.mission-certificate", "Mission Certificate"),
        item("procedures.passports", "Passports"),
        item("procedures.secure-procedure", "Secure Procedure"),
        item("procedures.pumps", "Pumps"),
        item("procedures.cockpit-door", "Cockpit Door"),
        item("procedures.luggage", "Luggage"),
      ],
    },
  ],
  sourceMarkdown,
);
