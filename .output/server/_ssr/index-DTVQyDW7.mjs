import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { c as create, p as persist } from "../_libs/zustand.mjs";
import { S as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { R as Root$1, V as Viewport, C as Corner, S as ScrollAreaScrollbar, a as ScrollAreaThumb } from "../_libs/radix-ui__react-scroll-area.mjs";
import { R as Root$2 } from "../_libs/radix-ui__react-label.mjs";
import { C as Checkbox$1, a as CheckboxIndicator } from "../_libs/radix-ui__react-checkbox.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { R as Root, P as Portal, C as Content$1, a as Close, T as Title, D as Description, O as Overlay } from "../_libs/radix-ui__react-dialog.mjs";
import { R as Root2, L as List, T as Trigger, C as Content } from "../_libs/radix-ui__react-tabs.mjs";
import { S as ScrollText, F as Flame, a as Sparkles, Z as Zap, C as Crown, b as Swords, P as Plus, H as Heart, c as Shield, d as Footprints, e as Star, f as ShieldPlus, g as ShieldOff, B as BookmarkPlus, h as BookMarked, T as Trash2, W as WandSparkles, i as Brain, j as TrendingUp, k as Skull, l as Check, X } from "../_libs/lucide-react.mjs";

import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/tslib.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
const STAT_KEYS = ["str", "dex", "con", "int", "wis", "cha"];
const STAT_LABELS = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma"
};
const DEFAULT_SKILLS = [
  "Acrobatics",
  "Animal Handling",
  "Arcana",
  "Athletics",
  "Deception",
  "History",
  "Insight",
  "Intimidation",
  "Investigation",
  "Medicine",
  "Nature",
  "Perception",
  "Performance",
  "Persuasion",
  "Religion",
  "Sleight of Hand",
  "Stealth",
  "Survival"
];
const MOD_TARGET_LABELS = {
  stat: "Ability Score",
  ac: "Armor Class",
  dc: "Spell Save DC",
  spellAttack: "Spell Attack",
  weaponAttack: "Weapon Attack (Hit)",
  damage: "Damage",
  save: "Saving Throw",
  skill: "Skill Check",
  extraAction: "Extra Action"
};
const SKILL_ABILITY = {
  Acrobatics: "dex",
  "Animal Handling": "wis",
  Arcana: "int",
  Athletics: "str",
  Deception: "cha",
  History: "int",
  Insight: "wis",
  Intimidation: "cha",
  Investigation: "int",
  Medicine: "wis",
  Nature: "int",
  Perception: "wis",
  Performance: "cha",
  Persuasion: "cha",
  Religion: "int",
  "Sleight of Hand": "dex",
  Stealth: "dex",
  Survival: "wis"
};
const blankStats = () => ({
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10
});
const blankSaves = () => ({
  str: false,
  dex: false,
  con: false,
  int: false,
  wis: false,
  cha: false
});
const createCharacter = (name = "New Adventurer") => ({
  id: crypto.randomUUID(),
  name,
  race: "",
  classSummary: "",
  level: 1,
  xp: 0,
  hp: 10,
  maxHp: 10,
  ac: 10,
  speed: 30,
  stats: blankStats(),
  savingThrows: blankSaves(),
  skillProficiencies: [],
  skillExpertise: [],
  proficiencyBonus: 2,
  concentrationMax: 1,
  classes: [],
  spells: [],
  abilities: [],
  effects: [],
  levelTable: [],
  notes: ""
});
const modifier = (score) => Math.floor((score - 10) / 2);
const formatMod = (m) => m >= 0 ? `+${m}` : `${m}`;
const patchChar = (chars, id, fn) => chars.map((c) => c.id === id ? fn(c) : c);
const useStore = create()(
  persist(
    (set) => ({
      characters: [],
      activeId: null,
      savedEffects: [],
      addCharacter: (name) => {
        const c = createCharacter(name);
        set((s) => ({ characters: [...s.characters, c], activeId: c.id }));
        return c.id;
      },
      removeCharacter: (id) => set((s) => {
        const remaining = s.characters.filter((c) => c.id !== id);
        return {
          characters: remaining,
          activeId: s.activeId === id ? remaining[0]?.id ?? null : s.activeId
        };
      }),
      setActive: (id) => set({ activeId: id }),
      update: (id, patch) => set((s) => ({
        characters: patchChar(s.characters, id, (c) => ({ ...c, ...patch }))
      })),
      setStat: (id, stat, value) => set((s) => ({
        characters: patchChar(s.characters, id, (c) => ({
          ...c,
          stats: { ...c.stats, [stat]: value }
        }))
      })),
      toggleSave: (id, stat) => set((s) => ({
        characters: patchChar(s.characters, id, (c) => ({
          ...c,
          savingThrows: { ...c.savingThrows, [stat]: !c.savingThrows[stat] }
        }))
      })),
      toggleSkill: (id, skill) => set((s) => ({
        characters: patchChar(s.characters, id, (c) => ({
          ...c,
          skillProficiencies: c.skillProficiencies.includes(skill) ? c.skillProficiencies.filter((k) => k !== skill) : [...c.skillProficiencies, skill]
        }))
      })),
      cycleSkill: (id, skill) => set((s) => ({
        characters: patchChar(s.characters, id, (c) => {
          const prof = c.skillProficiencies.includes(skill);
          const exp = (c.skillExpertise ?? []).includes(skill);
          if (!prof && !exp) {
            return {
              ...c,
              skillProficiencies: [...c.skillProficiencies, skill]
            };
          }
          if (prof && !exp) {
            return {
              ...c,
              skillExpertise: [...c.skillExpertise ?? [], skill]
            };
          }
          return {
            ...c,
            skillProficiencies: c.skillProficiencies.filter(
              (k) => k !== skill
            ),
            skillExpertise: (c.skillExpertise ?? []).filter(
              (k) => k !== skill
            )
          };
        })
      })),
      addEffect: (id, e) => {
        let added = false;
        const key = e.name.trim().toLowerCase();
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => {
            if (c.effects.some((ex) => ex.name.trim().toLowerCase() === key))
              return c;
            added = true;
            return {
              ...c,
              effects: [...c.effects, { ...e, id: crypto.randomUUID() }]
            };
          })
        }));
        return added;
      },
      removeEffect: (id, eid) => set((s) => ({
        characters: patchChar(s.characters, id, (c) => ({
          ...c,
          effects: c.effects.filter((e) => e.id !== eid)
        }))
      })),
      saveEffectToLibrary: (e) => set((s) => ({
        savedEffects: [...s.savedEffects, { ...e, id: crypto.randomUUID() }]
      })),
      removeSavedEffect: (sid) => set((s) => ({
        savedEffects: s.savedEffects.filter((e) => e.id !== sid)
      })),
      addSpell: (id, sp) => set((st) => ({
        characters: patchChar(st.characters, id, (c) => ({
          ...c,
          spells: [...c.spells, { ...sp, id: crypto.randomUUID() }]
        }))
      })),
      removeSpell: (id, sid) => set((st) => ({
        characters: patchChar(st.characters, id, (c) => ({
          ...c,
          spells: c.spells.filter((x) => x.id !== sid)
        }))
      })),
      addAbility: (id, a) => set((s) => ({
        characters: patchChar(s.characters, id, (c) => ({
          ...c,
          abilities: [...c.abilities, { ...a, id: crypto.randomUUID() }]
        }))
      })),
      removeAbility: (id, aid) => set((s) => ({
        characters: patchChar(s.characters, id, (c) => ({
          ...c,
          abilities: c.abilities.filter((x) => x.id !== aid)
        }))
      })),
      addClass: (id, cl) => set((s) => ({
        characters: patchChar(s.characters, id, (c) => ({
          ...c,
          classes: [...c.classes, { ...cl, id: crypto.randomUUID() }]
        }))
      })),
      removeClass: (id, cid) => set((s) => ({
        characters: patchChar(s.characters, id, (c) => ({
          ...c,
          classes: c.classes.filter((x) => x.id !== cid)
        }))
      })),
      setLevelTable: (id, table) => set((s) => ({
        characters: patchChar(s.characters, id, (c) => ({
          ...c,
          levelTable: table
        }))
      }))
    }),
    { name: "grimoire-characters-v1" }
  )
);
const useActiveCharacter = () => {
  const characters = useStore((s) => s.characters);
  const activeId = useStore((s) => s.activeId);
  return characters.find((c) => c.id === activeId) ?? null;
};
const concentrationCount = (effects) => effects.filter((e) => e.concentration).length;
const effectiveStats = (base, effects) => {
  const out = { ...base };
  for (const e of effects) {
    for (const m of e.modifiers) {
      const target = m.target ?? "stat";
      if (target === "stat" && m.stat) {
        out[m.stat] = (out[m.stat] ?? 0) + m.delta;
      }
    }
  }
  return out;
};
const sumEffectBonus = (effects, target) => {
  let total = 0;
  for (const e of effects) {
    for (const m of e.modifiers) {
      if (m.target === target) total += m.delta;
    }
  }
  return total;
};
const sumSaveBonus = (effects, stat) => {
  let total = 0;
  for (const e of effects) {
    for (const m of e.modifiers) {
      if (m.target === "save" && m.stat === stat) total += m.delta;
    }
  }
  return total;
};
const sumSkillBonus = (effects, skill) => {
  let total = 0;
  for (const e of effects) {
    for (const m of e.modifiers) {
      if (m.target === "skill" && m.skill === skill) total += m.delta;
    }
  }
  return total;
};
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = reactExports.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const Input = reactExports.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const ScrollArea = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Root$1,
  {
    ref,
    className: cn("relative overflow-hidden", className),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Viewport, { className: "h-full w-full rounded-[inherit]", children }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollBar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Corner, {})
    ]
  }
));
ScrollArea.displayName = Root$1.displayName;
const ScrollBar = reactExports.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  ScrollAreaScrollbar,
  {
    ref,
    orientation,
    className: cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
  }
));
ScrollBar.displayName = ScrollAreaScrollbar.displayName;
function CharacterSidebar() {
  const { characters, activeId, setActive, addCharacter, removeCharacter } = useStore();
  const [newName, setNewName] = reactExports.useState("");
  const create2 = () => {
    addCharacter(newName.trim() || "New Adventurer");
    setNewName("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "w-72 shrink-0 border-r border-border bg-card/40 backdrop-blur-sm flex flex-col h-screen sticky top-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 border-b border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-xl text-gradient-ember", children: "Grimoire" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Adventurer's Codex" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border-b border-border space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: newName,
          onChange: (e) => setNewName(e.target.value),
          placeholder: "Character name…",
          onKeyDown: (e) => e.key === "Enter" && create2(),
          className: "bg-input/60 border-border"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: create2, className: "w-full", variant: "default", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        " Forge new hero"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 space-y-1", children: [
      characters.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground p-4 text-center", children: "No heroes yet. Forge one above." }),
      characters.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        CharacterRow,
        {
          c,
          active: c.id === activeId,
          onSelect: () => setActive(c.id),
          onRemove: () => removeCharacter(c.id)
        },
        c.id
      ))
    ] }) })
  ] });
}
function CharacterRow({
  c,
  active,
  onSelect,
  onRemove
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      onClick: onSelect,
      className: cn(
        "group cursor-pointer rounded-md px-3 py-2.5 border transition-all",
        active ? "bg-primary/10 border-primary/40 ember-glow" : "border-transparent hover:bg-muted hover:border-border"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-sm truncate", children: c.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground truncate", children: [
              "Lv ",
              c.level,
              " ",
              c.race,
              " ",
              c.classSummary || "—"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                if (confirm(`Delete ${c.name}?`)) onRemove();
              },
              className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition",
              "aria-label": "Delete",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skull, { className: "h-3 w-3" }),
            c.hp,
            "/",
            c.maxHp
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "AC ",
            c.ac
          ] })
        ] })
      ]
    }
  );
}
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Root$2, { ref, className: cn(labelVariants(), className), ...props }));
Label.displayName = Root$2.displayName;
const Textarea = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
const Checkbox = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Checkbox$1,
  {
    ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckboxIndicator, { className: cn("grid place-content-center text-current"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = Checkbox$1.displayName;
function OverviewTab({ c }) {
  const { update, setStat, toggleSave, cycleSkill } = useStore();
  const effective = effectiveStats(c.stats, c.effects);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "grimoire-card p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Name", className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: c.name,
          onChange: (e) => update(c.id, { name: e.target.value })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Race", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: c.race,
          onChange: (e) => update(c.id, { race: e.target.value }),
          placeholder: "Tiefling…"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Class", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: c.classSummary,
          onChange: (e) => update(c.id, { classSummary: e.target.value }),
          placeholder: "Warlock 3 / Bard 2"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Level", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          type: "number",
          value: c.level,
          onChange: (e) => update(c.id, { level: +e.target.value || 1 })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "XP", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          type: "number",
          value: c.xp,
          onChange: (e) => update(c.id, { xp: +e.target.value || 0 })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Proficiency Bonus", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          type: "number",
          value: c.proficiencyBonus,
          onChange: (e) => update(c.id, { proficiencyBonus: +e.target.value || 2 })
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Concentration", children: (() => {
        const current = concentrationCount(c.effects);
        const max = c.concentrationMax ?? 1;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `text-2xl font-display tabular-nums ${current > max ? "text-destructive" : current > 0 ? "text-primary" : ""}`,
              children: current
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "/" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              min: 1,
              value: max,
              onChange: (e) => update(c.id, {
                concentrationMax: Math.max(1, +e.target.value || 1)
              }),
              className: "w-16 text-center",
              "aria-label": "Maximum concentration"
            }
          )
        ] });
      })() })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        VitalCard,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4 w-4" }),
          label: "Hit Points",
          accent: "ember",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(HpInput, { value: c.hp, onCommit: (v) => update(c.id, { hp: v }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "/" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              HpInput,
              {
                value: c.maxHp,
                onCommit: (v) => update(c.id, { maxHp: v })
              }
            )
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(VitalCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4" }), label: "Armor Class", children: (() => {
        const acBonus = sumEffectBonus(c.effects, "ac");
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              value: c.ac,
              onChange: (e) => update(c.id, { ac: +e.target.value || 0 }),
              className: `text-center text-2xl font-display h-12 ${acBonus !== 0 ? "pr-12" : ""}`
            }
          ),
          acBonus !== 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              className: `absolute right-2 top-1/2 -translate-y-1/2 text-sm font-display tabular-nums ${acBonus > 0 ? "text-primary" : "text-destructive"}`,
              title: `Base ${c.ac}, ${acBonus > 0 ? `+${acBonus}` : acBonus} from effects = ${c.ac + acBonus}`,
              children: [
                "= ",
                c.ac + acBonus
              ]
            }
          )
        ] });
      })() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(VitalCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Footprints, { className: "h-4 w-4" }), label: "Speed", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          type: "number",
          value: c.speed,
          onChange: (e) => update(c.id, { speed: +e.target.value || 0 }),
          className: "text-center text-2xl font-display h-12"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        VitalCard,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
          label: "Active Effects",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-display h-12 flex items-center justify-center text-primary", children: c.effects.length })
        }
      ),
      (() => {
        const extraActions = sumEffectBonus(c.effects, "extraAction");
        if (extraActions === 0) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(VitalCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4" }), label: "Actions", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-display h-12 flex items-center justify-center text-primary", children: [
          1 + extraActions,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground ml-1.5", children: [
            "(",
            extraActions > 0 ? `+${extraActions}` : extraActions,
            ")"
          ] })
        ] }) });
      })()
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grimoire-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg mb-1", children: "Ability Scores" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-4", children: "Base values; buffs and debuffs apply automatically." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3", children: STAT_KEYS.map((k) => {
        const base = c.stats[k];
        const eff = effective[k];
        const diff = eff - base;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-lg border border-border bg-secondary/40 p-3 text-center relative overflow-hidden",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: STAT_LABELS[k] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  value: base,
                  onChange: (e) => setStat(c.id, k, +e.target.value || 0),
                  className: "my-2 text-center text-2xl font-display h-12 bg-background/40"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `text-lg font-display ${diff > 0 ? "text-primary" : diff < 0 ? "text-destructive" : ""}`,
                  children: formatMod(modifier(eff))
                }
              ),
              diff !== 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `text-[10px] mt-0.5 ${diff > 0 ? "text-primary" : "text-destructive"}`,
                  children: [
                    "(",
                    eff,
                    " ",
                    diff > 0 ? `+${diff}` : diff,
                    ")"
                  ]
                }
              )
            ]
          },
          k
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grimoire-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg mb-4", children: "Saving Throws" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: STAT_KEYS.map((k) => {
          const mod = modifier(effective[k]) + (c.savingThrows[k] ? c.proficiencyBonus : 0) + sumSaveBonus(c.effects, k);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "label",
            {
              className: "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Checkbox,
                  {
                    checked: c.savingThrows[k],
                    onCheckedChange: () => toggleSave(c.id, k)
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-sm", children: STAT_LABELS[k] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-primary", children: formatMod(mod) })
              ]
            },
            k
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grimoire-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg mb-1", children: "Skill Proficiencies" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mb-3", children: "Click to cycle: none → proficient → expertise." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-1", children: DEFAULT_SKILLS.map((s) => {
          const ability = SKILL_ABILITY[s] ?? "int";
          const isProf = c.skillProficiencies.includes(s);
          const isExp = (c.skillExpertise ?? []).includes(s);
          const pbMult = isExp ? 2 : isProf ? 1 : 0;
          const bonus = modifier(effective[ability]) + pbMult * c.proficiencyBonus + sumSkillBonus(c.effects, s);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => cycleSkill(c.id, s),
              className: "flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted/50 text-left",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `inline-flex h-4 w-4 items-center justify-center rounded-sm border ${isExp ? "border-primary bg-primary/30 text-primary" : isProf ? "border-primary bg-primary/20 text-primary" : "border-border bg-background/40"}`,
                    "aria-hidden": true,
                    children: isExp ? /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 fill-current" }) : isProf ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary" }) : null
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-1", children: [
                  s,
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground ml-1 uppercase", children: [
                    "(",
                    ability,
                    ")"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `font-display tabular-nums ${isExp ? "text-primary" : isProf ? "text-primary/80" : "text-muted-foreground"}`,
                    children: formatMod(bonus)
                  }
                )
              ]
            },
            s
          );
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grimoire-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg mb-3", children: "Notes & Backstory" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          rows: 6,
          value: c.notes,
          onChange: (e) => update(c.id, { notes: e.target.value }),
          placeholder: "Born under a blood moon…"
        }
      )
    ] })
  ] });
}
function Field({
  label,
  children,
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block", children: label }),
    children
  ] });
}
function VitalCard({
  icon,
  label,
  children,
  accent
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `grimoire-card p-4 ${accent === "ember" ? "ember-glow" : ""}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground mb-2", children: [
          icon,
          " ",
          label
        ] }),
        children
      ]
    }
  );
}
function HpInput({
  value,
  onCommit
}) {
  const [draft, setDraft] = reactExports.useState(String(value));
  reactExports.useEffect(() => {
    setDraft(String(value));
  }, [value]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Input,
    {
      type: "number",
      value: draft,
      onChange: (e) => setDraft(e.target.value),
      onBlur: () => onCommit(Number(draft) || 0),
      onKeyDown: (e) => {
        if (e.key === "Enter") {
          onCommit(Number(draft) || 0);
          e.target.blur();
        }
      },
      className: "text-center text-2xl font-display h-12 min-w-[5.5rem]"
    }
  );
}
const TARGET_OPTIONS = [
  "stat",
  "ac",
  "dc",
  "weaponAttack",
  "spellAttack",
  "damage",
  "save",
  "skill",
  "extraAction"
];
function expandMods(mods) {
  const out = [];
  for (const m of mods) {
    const target = m.target ?? "stat";
    if ((target === "stat" || target === "save") && m.stat === "all") {
      for (const k of STAT_KEYS) {
        out.push({ target, stat: k, delta: m.delta, note: m.note });
      }
    } else {
      out.push({
        target,
        stat: m.stat === "all" ? void 0 : m.stat,
        skill: m.skill,
        delta: m.delta,
        note: m.note
      });
    }
  }
  return out;
}
function modifierLabel(m) {
  const target = m.target ?? "stat";
  const sign = m.delta >= 0 ? `+${m.delta}` : `${m.delta}`;
  switch (target) {
    case "stat":
      return `${(STAT_LABELS[m.stat ?? "str"] ?? "STR").slice(0, 3).toUpperCase()} ${sign}`;
    case "save":
      return `${(STAT_LABELS[m.stat ?? "str"] ?? "STR").slice(0, 3).toUpperCase()} SAVE ${sign}`;
    case "skill":
      return `${m.skill ?? "Skill"} ${sign}`;
    case "ac":
      return `AC ${sign}`;
    case "dc":
      return `DC ${sign}`;
    case "spellAttack":
      return `Spell Hit ${sign}`;
    case "weaponAttack":
      return `Weapon Hit ${sign}`;
    case "damage":
      return `DMG ${sign}`;
    case "extraAction":
      return `Action ${sign}`;
  }
}
function ModifierEditor({
  mods,
  onChange,
  emptyHint = "No modifiers. Add some if this changes ability scores, AC, DC, saves, attack rolls, damage, or skills."
}) {
  const addMod = () => onChange([...mods, { target: "stat", stat: "str", delta: 0 }]);
  const updateMod = (i, patch) => onChange(
    mods.map((x, idx) => {
      if (idx !== i) return x;
      const next = { ...x, ...patch };
      if (patch.target) {
        if (patch.target === "stat" || patch.target === "save") {
          next.stat = next.stat ?? "str";
          next.skill = void 0;
        } else if (patch.target === "skill") {
          next.skill = next.skill ?? DEFAULT_SKILLS[0];
          next.stat = void 0;
        } else {
          next.stat = void 0;
          next.skill = void 0;
        }
      }
      return next;
    })
  );
  const removeMod = (i) => onChange(mods.filter((_, idx) => idx !== i));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Modifiers" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "outline", onClick: addMod, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
        " Add modifier"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      mods.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic", children: emptyHint }),
      mods.map((m, i) => {
        const target = m.target ?? "stat";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex flex-wrap items-center gap-2 bg-secondary/40 rounded-md p-2 border border-border",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "select",
                {
                  value: target,
                  onChange: (e) => updateMod(i, { target: e.target.value }),
                  className: "bg-input border border-border rounded-md px-2 py-1.5 text-sm flex-1 min-w-[10rem]",
                  children: TARGET_OPTIONS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: MOD_TARGET_LABELS[t] }, t))
                }
              ),
              (target === "stat" || target === "save") && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: m.stat ?? "str",
                  onChange: (e) => updateMod(i, { stat: e.target.value }),
                  className: "bg-input border border-border rounded-md px-2 py-1.5 text-sm flex-1 min-w-[8rem]",
                  children: [
                    STAT_KEYS.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: STAT_LABELS[k] }, k)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Stats" })
                  ]
                }
              ),
              target === "skill" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "select",
                {
                  value: m.skill ?? DEFAULT_SKILLS[0],
                  onChange: (e) => updateMod(i, { skill: e.target.value }),
                  className: "bg-input border border-border rounded-md px-2 py-1.5 text-sm flex-1 min-w-[10rem]",
                  children: DEFAULT_SKILLS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s }, s))
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  value: m.delta,
                  onChange: (e) => updateMod(i, { delta: +e.target.value || 0 }),
                  className: "w-24 text-center",
                  placeholder: "±"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  size: "icon",
                  variant: "ghost",
                  onClick: () => removeMod(i),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
                }
              )
            ]
          },
          i
        );
      })
    ] })
  ] });
}
function EffectsTab({ c }) {
  const { addEffect, removeEffect, saveEffectToLibrary, removeSavedEffect } = useStore();
  const savedEffects = useStore((s) => s.savedEffects);
  const [kind, setKind] = reactExports.useState("buff");
  const [name, setName] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [duration, setDuration] = reactExports.useState("");
  const [mods, setMods] = reactExports.useState([]);
  const buildPayload = () => {
    if (!name.trim()) return null;
    return {
      kind,
      name: name.trim(),
      description: description.trim(),
      duration: duration.trim() || void 0,
      modifiers: expandMods(mods)
    };
  };
  const clearForm = () => {
    setName("");
    setDescription("");
    setDuration("");
    setMods([]);
  };
  const notifyApplied = (name2, added) => {
    if (added) toast.success(`Applied ${name2}`);
    else toast.warning(`${name2} is already active`);
  };
  const submit = () => {
    const payload = buildPayload();
    if (!payload) return;
    notifyApplied(payload.name, addEffect(c.id, payload));
    clearForm();
  };
  const saveAndApply = () => {
    const payload = buildPayload();
    if (!payload) return;
    saveEffectToLibrary(payload);
    notifyApplied(payload.name, addEffect(c.id, payload));
    clearForm();
  };
  const saveOnly = () => {
    const payload = buildPayload();
    if (!payload) return;
    saveEffectToLibrary(payload);
    toast.success(`Saved ${payload.name} to library`);
    clearForm();
  };
  const applySaved = (e) => {
    notifyApplied(
      e.name,
      addEffect(c.id, {
        kind: e.kind,
        name: e.name,
        description: e.description,
        duration: e.duration,
        modifiers: e.modifiers
      })
    );
  };
  const buffs = c.effects.filter((e) => e.kind === "buff");
  const debuffs = c.effects.filter((e) => e.kind === "debuff");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grimoire-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg mb-4", children: "Inscribe new effect" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: kind === "buff" ? "default" : "outline",
                onClick: () => setKind("buff"),
                className: "flex-1",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldPlus, { className: "h-4 w-4 mr-1.5" }),
                  " Buff"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: kind === "debuff" ? "destructive" : "outline",
                onClick: () => setKind("debuff"),
                className: "flex-1",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldOff, { className: "h-4 w-4 mr-1.5" }),
                  " Debuff"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Duration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              className: "mt-1.5",
              value: duration,
              onChange: (e) => setDuration(e.target.value),
              placeholder: "1 minute, 3 rounds…"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              className: "mt-1.5",
              value: name,
              onChange: (e) => setName(e.target.value),
              placeholder: "Bless, Poisoned, Bardic Inspiration…"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              className: "mt-1.5",
              rows: 3,
              value: description,
              onChange: (e) => setDescription(e.target.value),
              placeholder: "What does this effect do?"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          ModifierEditor,
          {
            mods,
            onChange: setMods,
            emptyHint: "No modifiers. Add some if this effect changes ability scores, AC, DC, saves, attack rolls, damage, or skills."
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: submit, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1.5" }),
          " Apply effect"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: saveAndApply, variant: "secondary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BookmarkPlus, { className: "h-4 w-4 mr-1.5" }),
          " Apply & save to library"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: saveOnly, variant: "outline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BookMarked, { className: "h-4 w-4 mr-1.5" }),
          " Save to library"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grimoire-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg mb-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BookMarked, { className: "h-4 w-4" }),
        " Effect Library"
      ] }),
      savedEffects.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic", children: "Saved buffs & debuffs land here, ready to reapply to any adventurer." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: savedEffects.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "border border-border rounded-md p-3 bg-background/40",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-display flex items-center gap-2", children: [
                  e.name,
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${e.kind === "buff" ? "border-primary/40 text-primary" : "border-destructive/40 text-destructive"}`,
                      children: e.kind
                    }
                  )
                ] }),
                e.duration && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: e.duration })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => removeSavedEffect(e.id),
                  className: "text-muted-foreground hover:text-destructive",
                  "aria-label": "Remove from library",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                }
              )
            ] }),
            e.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-2 text-muted-foreground line-clamp-2", children: e.description }),
            e.modifiers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1.5 mt-2", children: [
              e.modifiers.slice(0, 6).map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "text-[11px] font-mono px-2 py-0.5 rounded border border-border text-muted-foreground",
                  children: modifierLabel(m)
                },
                i
              )),
              e.modifiers.length > 6 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground", children: [
                "+",
                e.modifiers.length - 6,
                " more"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "secondary",
                className: "mt-3 w-full",
                onClick: () => applySaved(e),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "h-3.5 w-3.5 mr-1.5" }),
                  " Apply to",
                  " ",
                  c.name || "character"
                ]
              }
            )
          ]
        },
        e.id
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        EffectColumn,
        {
          title: "Buffs",
          emptyText: "No blessings active.",
          items: buffs,
          onRemove: (id) => removeEffect(c.id, id),
          accent: "primary"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        EffectColumn,
        {
          title: "Debuffs",
          emptyText: "No afflictions active.",
          items: debuffs,
          onRemove: (id) => removeEffect(c.id, id),
          accent: "destructive"
        }
      )
    ] })
  ] });
}
function EffectColumn({
  title,
  items,
  emptyText,
  onRemove,
  accent
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grimoire-card p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "h3",
      {
        className: `font-display text-lg mb-3 ${accent === "primary" ? "text-primary" : "text-destructive"}`,
        children: title
      }
    ),
    items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic", children: emptyText }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: items.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "border border-border rounded-md p-3 bg-background/40",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display", children: e.name }),
              e.duration && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: e.duration })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => onRemove(e.id),
                className: "text-muted-foreground hover:text-destructive",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
              }
            )
          ] }),
          e.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-2 text-muted-foreground", children: e.description }),
          e.modifiers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 mt-2", children: e.modifiers.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `text-[11px] font-mono px-2 py-0.5 rounded border ${m.delta >= 0 ? "border-primary/40 bg-primary/10 text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`,
              children: modifierLabel(m)
            },
            i
          )) })
        ]
      },
      e.id
    )) })
  ] });
}
const Dialog = Root;
const DialogPortal = Portal;
const DialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = Overlay.displayName;
const DialogContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Content$1,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = Content$1.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
const DialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = Title.displayName;
const DialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = Description.displayName;
const SCHOOLS = [
  "Abjuration",
  "Conjuration",
  "Divination",
  "Enchantment",
  "Evocation",
  "Illusion",
  "Necromancy",
  "Transmutation",
  "Homebrew"
];
const blankForm = {
  name: "",
  level: 0,
  school: "Evocation",
  castingTime: "1 Action",
  range: "60 ft",
  duration: "Instantaneous",
  description: "",
  concentration: false
};
function SpellsTab({ c }) {
  const { addSpell, removeSpell, addEffect, removeEffect } = useStore();
  const [form, setForm] = reactExports.useState(blankForm);
  const [mods, setMods] = reactExports.useState([]);
  const [dialog, setDialog] = reactExports.useState(null);
  const max = c.concentrationMax ?? 1;
  const activeConc = c.effects.filter((e) => e.concentration);
  const isActive = (name) => c.effects.some(
    (e) => e.name.trim().toLowerCase() === name.trim().toLowerCase()
  );
  const submit = () => {
    if (!form.name.trim()) return;
    addSpell(c.id, {
      ...form,
      name: form.name.trim(),
      modifiers: expandMods(mods)
    });
    setForm(blankForm);
    setMods([]);
  };
  const applySpellEffect = (s, concentrating) => {
    const added = addEffect(c.id, {
      kind: "buff",
      name: s.name,
      description: s.description,
      duration: s.duration,
      modifiers: s.modifiers ?? [],
      concentration: concentrating
    });
    if (added)
      toast.success(`Cast ${s.name}`, {
        description: concentrating ? "Concentrating" : void 0
      });
    else toast.warning(`${s.name} is already active`);
    return added;
  };
  const cast = (s) => {
    if (isActive(s.name)) {
      toast.warning(`${s.name} is already active`);
      return;
    }
    if (s.concentration) setDialog({ spell: s, stage: "ask" });
    else applySpellEffect(s, false);
  };
  const castNotConcentrating = () => {
    if (!dialog) return;
    applySpellEffect(dialog.spell, false);
    setDialog(null);
  };
  const castConcentrating = () => {
    if (!dialog) return;
    if (concentrationCount(c.effects) >= max) {
      setDialog({ ...dialog, stage: "drop" });
      return;
    }
    applySpellEffect(dialog.spell, true);
    setDialog(null);
  };
  const dropAndCast = (effectId) => {
    if (!dialog) return;
    removeEffect(c.id, effectId);
    applySpellEffect(dialog.spell, true);
    setDialog(null);
  };
  const grouped = c.spells.reduce((acc, s) => {
    (acc[s.level] ??= []).push(s);
    return acc;
  }, {});
  const levels = Object.keys(grouped).map(Number).sort((a, b) => a - b);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grimoire-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-primary" }),
        " Inscribe homebrew spell"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-6 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase text-muted-foreground", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.name,
              onChange: (e) => setForm({ ...form, name: e.target.value }),
              placeholder: "Ember Lance"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase text-muted-foreground", children: "Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              min: 0,
              max: 9,
              value: form.level,
              onChange: (e) => setForm({ ...form, level: +e.target.value || 0 })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase text-muted-foreground", children: "School" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: form.school,
              onChange: (e) => setForm({ ...form, school: e.target.value }),
              className: "w-full bg-input border border-border rounded-md px-3 py-2 text-sm",
              children: SCHOOLS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: s }, s))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase text-muted-foreground", children: "Casting Time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.castingTime,
              onChange: (e) => setForm({ ...form, castingTime: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase text-muted-foreground", children: "Range" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.range,
              onChange: (e) => setForm({ ...form, range: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase text-muted-foreground", children: "Duration" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.duration,
              onChange: (e) => setForm({ ...form, duration: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-6 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              id: "spell-concentration",
              checked: form.concentration,
              onCheckedChange: (v) => setForm({ ...form, concentration: !!v })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Label,
            {
              htmlFor: "spell-concentration",
              className: "text-sm cursor-pointer flex items-center gap-1.5",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "h-3.5 w-3.5 text-primary" }),
                " Requires concentration"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase text-muted-foreground", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              rows: 3,
              value: form.description,
              onChange: (e) => setForm({ ...form, description: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          ModifierEditor,
          {
            mods,
            onChange: setMods,
            emptyHint: "No modifiers. Add some if casting this spell should change ability scores, AC, DC, saves, attack rolls, damage, or skills."
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: submit, className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1.5" }),
        " Add spell"
      ] })
    ] }),
    levels.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grimoire-card p-12 text-center text-muted-foreground italic", children: "The spellbook is empty. Scribe your first incantation above." }) : levels.map((lvl) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grimoire-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-display text-sm uppercase tracking-widest text-primary mb-3", children: lvl === 0 ? "Cantrips" : `Level ${lvl}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: grouped[lvl].map((s) => {
        const hasMods = !!s.modifiers?.length;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "border border-border rounded-md p-3 bg-background/40",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-display flex items-center gap-2", children: [
                    s.name,
                    s.concentration && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-primary/40 text-primary flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "h-3 w-3" }),
                      " Conc."
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: s.school })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => removeSpell(c.id, s.id),
                    className: "text-muted-foreground hover:text-destructive",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-[11px] text-muted-foreground mt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block uppercase text-[9px]", children: "Cast" }),
                  s.castingTime
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block uppercase text-[9px]", children: "Range" }),
                  s.range
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block uppercase text-[9px]", children: "Dur" }),
                  s.duration
                ] })
              ] }),
              s.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-2 text-muted-foreground whitespace-pre-wrap", children: s.description }),
              hasMods && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 mt-2", children: s.modifiers.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `text-[11px] font-mono px-2 py-0.5 rounded border ${m.delta >= 0 ? "border-primary/40 bg-primary/10 text-primary" : "border-destructive/40 bg-destructive/10 text-destructive"}`,
                  children: modifierLabel(m)
                },
                i
              )) }),
              (hasMods || s.concentration) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "secondary",
                  className: "mt-3 w-full",
                  onClick: () => cast(s),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "h-3.5 w-3.5 mr-1.5" }),
                    " Cast",
                    s.concentration ? "" : " (apply as effect)"
                  ]
                }
              )
            ]
          },
          s.id
        );
      }) })
    ] }, lvl)),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!dialog, onOpenChange: (open) => !open && setDialog(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      dialog?.stage === "ask" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "h-4 w-4 text-primary" }),
            " Are you concentrating on ",
            dialog.spell.name,
            "?"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
            "If you cast this spell, answer Yes. If someone else cast it on you, they hold concentration — answer No and it won't count against your limit (",
            concentrationCount(c.effects),
            "/",
            max,
            ")."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 sm:gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: castNotConcentrating, children: "No, someone else is" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: castConcentrating, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "h-4 w-4 mr-1.5" }),
            " Yes, I'm concentrating"
          ] })
        ] })
      ] }),
      dialog?.stage === "drop" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
            "Concentration limit reached (",
            concentrationCount(c.effects),
            "/",
            max,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
            "You can't concentrate on ",
            dialog.spell.name,
            " as well. Choose a spell to stop concentrating on — it will be dropped and",
            " ",
            dialog.spell.name,
            " applied."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 py-2", children: activeConc.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => dropAndCast(e.id),
            className: "w-full text-left border border-border rounded-md p-3 bg-background/40 hover:border-destructive hover:bg-destructive/10 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display", children: e.name }),
              e.duration && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: e.duration })
            ]
          },
          e.id
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDialog(null), children: "Cancel" }) })
      ] })
    ] }) })
  ] });
}
function AbilitiesTab({ c }) {
  const { addAbility, removeAbility } = useStore();
  const [form, setForm] = reactExports.useState({ name: "", source: "", uses: "", description: "" });
  const submit = () => {
    if (!form.name.trim()) return;
    addAbility(c.id, { ...form, name: form.name.trim() });
    setForm({ name: "", source: "", uses: "", description: "" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grimoire-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4 text-primary" }),
        " Forge homebrew ability"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase text-muted-foreground", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), placeholder: "Soul Burn" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase text-muted-foreground", children: "Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.source, onChange: (e) => setForm({ ...form, source: e.target.value }), placeholder: "Warlock 3, Racial…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase text-muted-foreground", children: "Uses" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.uses, onChange: (e) => setForm({ ...form, uses: e.target.value }), placeholder: "3 / long rest" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase text-muted-foreground", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: submit, className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1.5" }),
        " Add ability"
      ] })
    ] }),
    c.abilities.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grimoire-card p-12 text-center text-muted-foreground italic", children: "No abilities yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: c.abilities.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grimoire-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display", children: a.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
            a.source,
            a.uses && ` · ${a.uses}`
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeAbility(c.id, a.id), className: "text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] }),
      a.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-2 text-muted-foreground whitespace-pre-wrap", children: a.description })
    ] }, a.id)) })
  ] });
}
function ClassesTab({ c }) {
  const { addClass, removeClass, setLevelTable } = useStore();
  const [form, setForm] = reactExports.useState({ name: "", description: "", hitDie: "d8", primaryStat: "str" });
  const submit = () => {
    if (!form.name.trim()) return;
    addClass(c.id, { ...form, name: form.name.trim() });
    setForm({ name: "", description: "", hitDie: "d8", primaryStat: "str" });
  };
  const updateRow = (i, patch) => setLevelTable(c.id, c.levelTable.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const addRow = () => setLevelTable(c.id, [
    ...c.levelTable,
    { level: (c.levelTable[c.levelTable.length - 1]?.level ?? 0) + 1, className: c.classes[0]?.name ?? "", features: "", xpRequired: 0 }
  ]);
  const removeRow = (i) => setLevelTable(c.id, c.levelTable.filter((_, idx) => idx !== i));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grimoire-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4 w-4 text-primary" }),
        " Forge homebrew class"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase text-muted-foreground", children: "Class name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), placeholder: "Ember Walker" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase text-muted-foreground", children: "Hit die" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.hitDie, onChange: (e) => setForm({ ...form, hitDie: e.target.value }), placeholder: "d10" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase text-muted-foreground", children: "Primary stat" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: form.primaryStat,
              onChange: (e) => setForm({ ...form, primaryStat: e.target.value }),
              className: "w-full bg-input border border-border rounded-md px-3 py-2 text-sm",
              children: STAT_KEYS.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: STAT_LABELS[k] }, k))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase text-muted-foreground", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: submit, className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1.5" }),
        " Add class"
      ] }),
      c.classes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 grid grid-cols-1 md:grid-cols-2 gap-3", children: c.classes.map((cl) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-md p-3 bg-background/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display", children: cl.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
              cl.hitDie,
              " · ",
              cl.primaryStat && STAT_LABELS[cl.primaryStat]
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeClass(c.id, cl.id), className: "text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
        ] }),
        cl.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-2 text-muted-foreground whitespace-pre-wrap", children: cl.description })
      ] }, cl.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grimoire-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-primary" }),
          " Custom leveling track"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: addRow, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
          " Add level"
        ] })
      ] }),
      c.levelTable.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic", children: "Define your own milestones, XP thresholds, and feature unlocks per level." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-2 w-16", children: "Lv" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-2 w-40", children: "Class" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-2 w-28", children: "XP" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-2", children: "Features unlocked" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-2 w-10" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: c.levelTable.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: r.level, onChange: (e) => updateRow(i, { level: +e.target.value || 1 }), className: "h-8" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: r.className, onChange: (e) => updateRow(i, { className: e.target.value }), className: "h-8" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: r.xpRequired ?? 0, onChange: (e) => updateRow(i, { xpRequired: +e.target.value || 0 }), className: "h-8" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: r.features, onChange: (e) => updateRow(i, { features: e.target.value }), className: "h-8", placeholder: "Eldritch Surge, +1 ASI…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeRow(i), className: "text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) }) })
        ] }, i)) })
      ] }) })
    ] })
  ] });
}
const Tabs = Root2;
const TabsList = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  List,
  {
    ref,
    className: cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = List.displayName;
const TabsTrigger = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = Trigger.displayName;
const TabsContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content,
  {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = Content.displayName;
function CharacterManager() {
  const c = useActiveCharacter();
  const addCharacter = useStore((s) => s.addCharacter);
  const [tab, setTab] = reactExports.useState("overview");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CharacterSidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 min-w-0", children: !c ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { onCreate: () => addCharacter("New Adventurer") }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 md:p-10 max-w-6xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1", children: "Adventurer's Codex" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-4xl text-gradient-ember", children: c.name || "Unnamed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
          "Level ",
          c.level,
          " · ",
          c.race || "Unknown race",
          " · ",
          c.classSummary || "No class"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: setTab, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "bg-card/60 border border-border p-1 mb-6 h-auto flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "overview", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollText, { className: "h-4 w-4 mr-1.5" }),
            " Sheet"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "effects", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-4 w-4 mr-1.5" }),
            " Buffs & Debuffs"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "spells", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 mr-1.5" }),
            " Spells"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "abilities", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4 mr-1.5" }),
            " Abilities"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "classes", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4 w-4 mr-1.5" }),
            " Classes & Leveling"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "overview", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewTab, { c }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "effects", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EffectsTab, { c }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "spells", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SpellsTab, { c }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "abilities", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AbilitiesTab, { c }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "classes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClassesTab, { c }) })
      ] })
    ] }) })
  ] });
}
function EmptyState({ onCreate }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-screen flex items-center justify-center p-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-6xl text-gradient-ember mb-4", children: "⚔" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl mb-3", children: "The codex awaits" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-6", children: "Forge your first adventurer to begin. Each hero keeps their own homebrew spells, abilities, classes, and afflictions." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "lg", onClick: onCreate, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
      " Forge first hero"
    ] })
  ] }) });
}
const SplitComponent = CharacterManager;
export {
  SplitComponent as component
};
