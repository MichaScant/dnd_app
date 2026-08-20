import { createFileRoute } from "@tanstack/react-router";
import { CharacterManager } from "@/components/character/CharacterManager";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Grimoire — D&D Character Manager" },
      {
        name: "description",
        content:
          "Manage multiple D&D characters with homebrew spells, abilities, classes, custom leveling, and dynamic buffs and debuffs.",
      },
      { property: "og:title", content: "Grimoire — D&D Character Manager" },
      {
        property: "og:description",
        content: "Dark-themed character manager for homebrew D&D campaigns.",
      },
    ],
  }),
  component: CharacterManager,
  ssr: false,
});
