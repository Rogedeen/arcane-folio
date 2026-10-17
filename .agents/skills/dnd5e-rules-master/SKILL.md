---
name: dnd5e-rules-master
description: Master rules expert for D&D 5e (2014 PHB / SRD 5.1 and 2024 Revision). Use whenever implementing, reviewing, or validating character creation, spell preparation limits, multiclassing, action economy, combat mechanics, saving throws, and rest mechanics.
---

# 🐉 D&D 5E MASTER RULES & ENGINE SPECIFICATION

This skill provides comprehensive, unambiguous reference guidelines for D&D 5e mechanics across both **2014 (SRD 5.1 / PHB)** and **2024 (Revised 5e)** rule systems.

---

## 1. SPELLCASTING & PREPARATION ARCHITECTURE

### A. Maximum Spell Level by Class & Character Level
A character **CANNOT** learn, prepare, cast, or browse above their maximum castable spell level:

1. **Full Casters (Wizard, Cleric, Druid, Bard, Sorcerer):**
   - Formula: `Math.min(9, Math.ceil(level / 2))`
   - Level 1-2: Max Level 1 Spells
   - Level 3-4: Max Level 2 Spells
   - Level 5-6: Max Level 3 Spells (e.g. Fireball)
   - Level 7-8: Max Level 4 Spells
   - Level 9-10: Max Level 5 Spells
   - Level 11-12: Max Level 6 Spells
   - Level 13-14: Max Level 7 Spells
   - Level 15-16: Max Level 8 Spells
   - Level 17-20: Max Level 9 Spells (e.g. Wish)

2. **Half Casters (Paladin, Ranger):**
   - Formula: `level < 2 ? 0 : Math.min(5, Math.ceil(level / 4))`
   - Level 1: 0 (No spellcasting yet)
   - Level 2-4: Max Level 1 Spells
   - Level 5-8: Max Level 2 Spells
   - Level 9-12: Max Level 3 Spells
   - Level 13-16: Max Level 4 Spells
   - Level 17-20: Max Level 5 Spells

3. **One-Third Casters (Eldritch Knight Fighter, Arcane Trickster Rogue):**
   - Level 1-2: 0 (No spellcasting)
   - Level 3-6: Max Level 1 Spells (Level 3 Fighter **CANNOT** cast level 2 or 3 spells!)
   - Level 7-12: Max Level 2 Spells
   - Level 13-18: Max Level 3 Spells
   - Level 19-20: Max Level 4 Spells

4. **Pact Magic (Warlock):**
   - Formula: `Math.min(5, Math.ceil(level / 2))`
   - All spell slots are of the same maximum tier (up to tier 5). Levels 6-9 are cast once per long rest via Mystic Arcanum.

### B. Spell Preparation Capacity Formula
- **Wizard:** `Math.max(1, level + intModifier)`
- **Cleric & Druid:** `Math.max(1, level + wisModifier)` (automatically have access to their entire class spell list, but must prepare up to this limit each morning)
- **Paladin:** `Math.max(1, Math.floor(level / 2) + chaModifier)`
- **Known Spells Casters (Bard, Sorcerer, Warlock, Ranger):** Do not prepare daily; they have a fixed number of known spells determined by their class level progression table.
- **Cantrips:** Cantrips (Level 0) never count against prepared limits and do not expend spell slots.

---

## 2. INVENTORY, WEAPONS & ARMOR CLASS RULES

### A. The Single Armor & Single Shield Rule
- A character may wear **at most ONE suit of armor** and carry **at most ONE shield** for AC calculations.
- Donning a new armor automatically un-equips the previous armor.
- Equipping a new shield replaces the previous shield.

### B. Armor Class (AC) Formulas
1. **Unarmored:**
   - Standard: `10 + DEX mod`
   - Barbarian Unarmored Defense: `10 + DEX mod + CON mod` (shields allowed)
   - Monk Unarmored Defense: `10 + DEX mod + WIS mod` (no shields allowed)
2. **Light Armor (Padded, Leather, Studded Leather):**
   - `Base AC + DEX mod`
3. **Medium Armor (Hide, Chain Shirt, Scale Mail, Breastplate, Half Plate):**
   - `Base AC + Math.min(2, DEX mod)`
4. **Heavy Armor (Ring Mail, Chain Mail, Splint, Plate):**
   - `Base AC` (DEX modifier is ignored completely)
5. **Shield:** `+2 AC` bonus if proficient and wielded.

### C. Carrying Capacity & Encumbrance
- **Carrying Capacity:** `STR score * 15 lbs`
- **Standard Encumbrance (Optional PHB):** Exceeding `STR * 5 lbs` reduces speed by 10 ft. Exceeding `STR * 10 lbs` imposes disadvantage on ability checks, attack rolls, and saving throws that use STR, DEX, or CON.

---

## 3. COMBAT ACTION ECONOMY & DEATH SAVES

### A. Turn Structure
On each turn, a creature has:
1. **Movement:** Up to their base speed (can be broken up before and after actions).
2. **One Action:** Attack, Cast a Spell, Dash, Disengage, Dodge, Help, Hide, Ready, Search, Use an Object.
3. **At Most One Bonus Action:** Granted only by specific features or spells (e.g. Second Wind, Misty Step, Healing Word).
4. **At Most One Reaction per Round:** Triggered outside or during a turn (e.g. Opportunity Attack, Shield, Counterspell).
5. **Free Object Interaction:** One per turn (e.g. drawing a weapon, opening an unlocked door).

### B. HP = 0 & Death Saving Throws
1. Dropping to 0 HP induces the **Unconscious** condition immediately.
2. At the start of each turn at 0 HP:
   - Roll 1d20 (no modifiers).
   - **1:** 2 Failures.
   - **2-9:** 1 Failure.
   - **10-19:** 1 Success.
   - **20:** Immediately regain 1 HP and regain consciousness!
3. **3 Successes:** Stable (unconscious at 0 HP, no longer rolls).
4. **3 Failures:** Character death.
5. **Damage at 0 HP:** Counts as 1 failure (critical hit from within 5 ft counts as 2 failures).
6. **Massive Damage Instant Death:** If remaining damage equals or exceeds maximum HP, the character dies instantly without death saves.

---

## 4. 2014 VS 2024 RULESET DISTINCTIONS

| Category | 2014 Rules (PHB 2014) | 2024 Revised Rules (PHB 2024) |
|---|---|---|
| **Subclass Level** | Level 1 (Cleric, Warlock, Sorcerer), Level 2 (Druid, Wizard), Level 3 (Fighter, Rogue, etc.) | **ALL classes choose subclass at Level 3** |
| **Origin Feats** | Backgrounds give roleplay features (e.g., Rustic Hospitality) | Backgrounds grant +2/+1 stats and an **Origin Feat** (e.g., Alert, Tough, Magic Initiate) |
| **Weapon Mastery** | Weapons only have properties (Finesse, Heavy, Light) | Martial classes unlock **Weapon Mastery** properties (Nick, Push, Sap, Slow, Topple, Vex, Graze, Cleave) |
| **Exhaustion** | 6 distinct deadly tiers (Disadvantage -> Half Speed -> Disadvantage Saves -> Half HP -> 0 Speed -> Death) | **-1 per exhaustion level** to all d20 tests and spell save DC, up to 10 levels (at 10 = death) |
| **Inspiration / Heroic Advantage**| Advantage on one roll (DM awards) | **Heroic Inspiration** re-rolls any die, gained via Human trait, Musician feat, or DM award |

---

## 5. LOCAL DATASET REFERENCES
The full parsed rules text from Open5e API is saved locally in:
- `src/data/open5e_srd_rules.json` (227 SRD 5.1 rules covering abilities, combat sequence, conditions, spellcasting, environments, magic items)
- `src/data/open5e_srd_2024_rules.json` (56 2024 Revised rules covering d20 tests, weapon masteries, conditions glossary)
