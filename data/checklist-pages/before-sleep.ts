import { beforeSleepSource as sourceMarkdown } from "../checklist-source-documents";
import { createBuiltinChecklist } from "./_factory";

export const beforeSleepChecklist = createBuiltinChecklist(
  "before-sleep",
  "Before Sleep",
  "",
  [
    {
      id: "before-sleep.main",
      title: "Before Sleep",
      items: [
        { id: "before-sleep.main.water-bottle", title: "Water Bottle" },
        { id: "before-sleep.main.stuff-for-flight", title: "Stuff for Flight" },
        { id: "before-sleep.main.alarm-clock", title: "Alarm Clock" },
        { id: "before-sleep.main.data-update", title: "Data Update" },
        { id: "before-sleep.main.prep-site", title: "Prep Site" },
        { id: "before-sleep.main.learning-site", title: "Learning Site" },
        { id: "before-sleep.main.team-jobs", title: "Team Jobs" },
        { id: "before-sleep.main.quit-unnecessary-chats", title: "Quit Unnecessary Chats" },
        { id: "before-sleep.main.medicine", title: "Medicine" },
        { id: "before-sleep.main.vitamins", title: "Vitamins" },
        { id: "before-sleep.main.air-purifier", title: "Air Purifier" },
        { id: "before-sleep.main.air-conditioner", title: "Air Conditioner" },
        { id: "before-sleep.main.ceiling-fan", title: "Ceiling Fan" },
        { id: "before-sleep.main.mosquito-repellent", title: "Mosquito repellent device" },
        { id: "before-sleep.main.water-heater", title: "Water Heater" },
        { id: "before-sleep.main.water-flosser", title: "Water Flosser" },
        { id: "before-sleep.main.tooth-brushed", title: "Tooth Brushed" },
        { id: "before-sleep.main.bath", title: "Bath" },
        { id: "before-sleep.main.water", title: "Water" },
        { id: "before-sleep.main.mouth-wash", title: "Mouth Wash" },
        { id: "before-sleep.main.skin-medicine", title: "Skin Medicine" },
        { id: "before-sleep.main.charging", title: "Charging" },
        { id: "before-sleep.main.do-not-disturb", title: "Do Not Disturb" },
        { id: "before-sleep.main.lip-care", title: "Lip Care" },
        { id: "before-sleep.main.face-care", title: "Face Care" },
        { id: "before-sleep.main.unite", title: "Unite" },
      ],
    },
  ],
  sourceMarkdown,
);
