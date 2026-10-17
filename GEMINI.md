# 🐉 D&D 5E PROJECT INSTRUCTIONS & AGENT GUIDELINES

You are developing **DnD Beyond Killer**, a next-generation D&D 5e campaign & character sheet app.
The project adheres strictly to the rules and standards defined in `.agents/rules/dnd_experience_standards.md` and the visual layout blueprint in `docs/references/dndbeyond_ui_spec.md`.

## Core Standards You Must Always Follow:
1. **HP = 0 Death Saves Cinematic Mode:** When HP drops to 0, trigger the dramatic dying mode with animated 3D physical d20 rolling and restricted actions.
2. **Dual-Pane Inventory:** Separate "My Inventory" from "Add Items / Catalog". Equipping armor/shield MUST instantly recalculate Armor Class (AC). Equipped weapons must display in the Actions tab with their damage dice, damage type, and attack bonus.
3. **Class-Aware Character Sheet:** Never show a spellbook tab to non-casters (Fighter, Barbarian, Rogue, Monk) unless they have a caster subclass (Eldritch Knight, Arcane Trickster). Replace it with Class Features (Action Surge, Second Wind, Rage, Ki, etc.).
4. **Rich & Tangible Dice:** When rolling damage or checks, animate the transformation of dice formulas into rolled values with rolling animations and audible feedback.
5. **Legible & Atmospheric Palette:** Deep slate/parchment background (`#0f172a`, `#1e293b`), high-readability text (`#f8fafc`, `#e2e8f0`), balanced contrast without pure neon blinding glare.
6. **Level-Up Wizard & Progression:** Support Hit Die roll vs average, Subclass selection with modular caster unlock, ASI (+2 or +1/+1) or Feats, and Backstory notes.
7. **DM Encounter & Initiative Tracker:** Live Open5e monster search (`/v2/creatures/`), party stats sync (HP, AC, Passive Perception), initiative rolling, turn/round tracking, and live monster HP/conditions.
8. **2014 Rules First:** Prioritize 100% complete 2014 PHB rules over 2024 revisions until finalized.
9. **Strict Branching Workflow (Dev -> Main):** Never commit directly to `main`. At the end of every feature development / turn, always verify tests (`npx vitest run`), ensure zero TypeScript errors (`npx tsc --noEmit`), and commit & push all changes to GitHub on the `dev` branch (`git checkout dev ; git add . ; git commit -m '...' ; git push origin dev`). Merging to `main` must only occur after verification and approval, ensuring production stays rock-solid for live users.
10. **Strict D&D 5e Rule Compliance:** Always refer to and update `docs/references/dnd5e_rules_compliance_roadmap.md` and `.agents/skills/dnd5e-rules-master/SKILL.md`. Every mechanic (spellcasting type, weapon damage bonus, resting hit dice, encumbrance, concentration) must strictly obey official 5e rules.

