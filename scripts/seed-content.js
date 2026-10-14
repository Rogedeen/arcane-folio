import fs from 'fs';
import path from 'path';

const SPELLS_DATA = [
  // Cantrips (0)
  { slug: 'acid-splash', name: 'Acid Splash', level: 0, school: 'Conjuration', castingTime: '1 action', range: '60 feet', components: 'V, S', duration: 'Instantaneous', description: 'You hurl a bubble of acid. Choose one or two creatures within 5 feet of each other. Target must succeed on a DEX save or take 1d6 acid damage.', classes: ['sorcerer', 'wizard'] },
  { slug: 'blade-ward', name: 'Blade Ward', level: 0, school: 'Abjuration', castingTime: '1 action', range: 'Self', components: 'V, S', duration: '1 round', description: 'You extend your hand and trace a sigil of guarding. You gain resistance against bludgeoning, piercing, and slashing damage dealt by weapon attacks.', classes: ['bard', 'sorcerer', 'warlock', 'wizard'] },
  { slug: 'chill-touch', name: 'Chill Touch', level: 0, school: 'Necromancy', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: '1 round', description: 'You create a ghostly skeletal hand. Ranged spell attack deals 1d8 necrotic damage and target cannot regain hit points until the start of your next turn.', classes: ['sorcerer', 'warlock', 'wizard'] },
  { slug: 'dancing-lights', name: 'Dancing Lights', level: 0, school: 'Evocation', castingTime: '1 action', range: '120 feet', components: 'V, S, M', duration: 'Concentration, up to 1 minute', description: 'You create up to four torch-sized lights within range, making them shed dim light in a 10-foot radius.', classes: ['bard', 'sorcerer', 'wizard'] },
  { slug: 'fire-bolt', name: 'Fire Bolt', level: 0, school: 'Evocation', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous', description: 'You hurl a mote of fire at a creature or object within range. Make a ranged spell attack. On a hit, the target takes 1d10 fire damage.', classes: ['sorcerer', 'wizard'] },
  { slug: 'guidance', name: 'Guidance', level: 0, school: 'Divination', castingTime: '1 action', range: 'Touch', components: 'V, S', duration: 'Concentration, up to 1 minute', description: 'You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice.', classes: ['cleric', 'druid'] },
  { slug: 'light', name: 'Light', level: 0, school: 'Evocation', castingTime: '1 action', range: 'Touch', components: 'V, M', duration: '1 hour', description: 'You touch one object that is no larger than 10 feet in any dimension. The object sheds bright light in a 20-foot radius and dim light for an additional 20 feet.', classes: ['bard', 'cleric', 'sorcerer', 'wizard'] },
  { slug: 'mage-hand', name: 'Mage Hand', level: 0, school: 'Conjuration', castingTime: '1 action', range: '30 feet', components: 'V, S', duration: '1 minute', description: 'A spectral, floating hand appears at a point you choose within range. You can use your action to control the hand to manipulate objects or open doors.', classes: ['bard', 'sorcerer', 'warlock', 'wizard'] },
  { slug: 'mending', name: 'Mending', level: 0, school: 'Transmutation', castingTime: '1 minute', range: 'Touch', components: 'V, S, M', duration: 'Instantaneous', description: 'This spell repairs a single break or tear in an object you touch, such as a broken chain link, two halves of a broken key, or a torn cloak.', classes: ['bard', 'cleric', 'druid', 'sorcerer', 'wizard'] },
  { slug: 'message', name: 'Message', level: 0, school: 'Transmutation', castingTime: '1 action', range: '120 feet', components: 'V, S, M', duration: '1 round', description: 'You point your finger toward a creature within range and whisper a message. The target hears the message and can reply in a whisper that only you can hear.', classes: ['bard', 'sorcerer', 'wizard'] },
  { slug: 'poison-spray', name: 'Poison Spray', level: 0, school: 'Conjuration', castingTime: '1 action', range: '10 feet', components: 'V, S', duration: 'Instantaneous', description: 'You extend your hand toward a creature within range and project a puff of noxious gas. The target must succeed on a CON save or take 1d12 poison damage.', classes: ['druid', 'sorcerer', 'warlock', 'wizard'] },
  { slug: 'prestidigitation', name: 'Prestidigitation', level: 0, school: 'Transmutation', castingTime: '1 action', range: '10 feet', components: 'V, S', duration: 'Up to 1 hour', description: 'This spell is a minor magical trick that novice spellcasters use for practice. Create sparks, clean items, chill or warm food.', classes: ['bard', 'sorcerer', 'warlock', 'wizard'] },
  { slug: 'ray-of-frost', name: 'Ray of Frost', level: 0, school: 'Evocation', castingTime: '1 action', range: '60 feet', components: 'V, S', duration: 'Instantaneous', description: 'A frigid beam of blue-white light streaks toward a creature within range. Ranged spell attack deals 1d8 cold damage and reduces speed by 10 ft.', classes: ['sorcerer', 'wizard'] },
  { slug: 'resistance', name: 'Resistance', level: 0, school: 'Abjuration', castingTime: '1 action', range: 'Touch', components: 'V, S, M', duration: 'Concentration, up to 1 minute', description: 'You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one saving throw of its choice.', classes: ['cleric', 'druid'] },
  { slug: 'sacred-flame', name: 'Sacred Flame', level: 0, school: 'Evocation', castingTime: '1 action', range: '60 feet', components: 'V, S', duration: 'Instantaneous', description: 'Flame-like radiance descends on a creature that you can see within range. Target must succeed on a DEX save or take 1d8 radiant damage.', classes: ['cleric'] },
  { slug: 'shocking-grasp', name: 'Shocking Grasp', level: 0, school: 'Evocation', castingTime: '1 action', range: 'Touch', components: 'V, S', duration: 'Instantaneous', description: 'Lightning springs from your hand to deliver a shock to a creature you try to touch. Deals 1d8 lightning damage and target cannot take reactions.', classes: ['sorcerer', 'wizard'] },
  { slug: 'thaumaturgy', name: 'Thaumaturgy', level: 0, school: 'Transmutation', castingTime: '1 action', range: '30 feet', components: 'V', duration: 'Up to 1 minute', description: 'You manifest a minor wonder, a sign of supernatural power. Boom your voice, cause flames to flicker, or slam doors shut.', classes: ['cleric'] },
  { slug: 'true-strike', name: 'True Strike', level: 0, school: 'Divination', castingTime: '1 action', range: '30 feet', components: 'S', duration: 'Concentration, up to 1 round', description: 'You point a finger at a target in range. On your next turn, you gain advantage on your first attack roll against the target.', classes: ['bard', 'sorcerer', 'warlock', 'wizard'] },
  { slug: 'vicious-mockery', name: 'Vicious Mockery', level: 0, school: 'Enchantment', castingTime: '1 action', range: '60 feet', components: 'V', duration: 'Instantaneous', description: 'You unleash a string of insults laced with subtle enchantments. Target must succeed on a WIS save or take 1d4 psychic damage and disadvantage on next attack.', classes: ['bard'] },
  { slug: 'eldritch-blast', name: 'Eldritch Blast', level: 0, school: 'Evocation', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous', description: 'A beam of crackling energy streaks toward a creature within range. Make a ranged spell attack. On a hit, the target takes 1d10 force damage.', classes: ['warlock'] },

  // 1st Level
  { slug: 'burning-hands', name: 'Burning Hands', level: 1, school: 'Evocation', castingTime: '1 action', range: 'Self (15-foot cone)', components: 'V, S', duration: 'Instantaneous', description: 'As you hold your hands with thumbs touching, a thin sheet of flames shoots forth. Each creature in a 15-foot cone takes 3d6 fire damage (DEX save half).', classes: ['sorcerer', 'wizard'] },
  { slug: 'charm-person', name: 'Charm Person', level: 1, school: 'Enchantment', castingTime: '1 action', range: '30 feet', components: 'V, S', duration: '1 hour', description: 'You attempt to charm a humanoid you can see within range. It must make a WIS save, and does so with advantage if you or your companions are fighting it.', classes: ['bard', 'druid', 'sorcerer', 'warlock', 'wizard'] },
  { slug: 'cure-wounds', name: 'Cure Wounds', level: 1, school: 'Evocation', castingTime: '1 action', range: 'Touch', components: 'V, S', duration: 'Instantaneous', description: 'A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier.', classes: ['bard', 'cleric', 'druid', 'paladin', 'ranger'] },
  { slug: 'detect-magic', name: 'Detect Magic', level: 1, school: 'Divination', castingTime: '1 action (ritual)', range: 'Self', components: 'V, S', duration: 'Concentration, up to 10 minutes', description: 'For the duration, you sense the presence of magic within 30 feet of you and see a faint aura around any visible creature or object bearing magic.', classes: ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'wizard'] },
  { slug: 'healing-word', name: 'Healing Word', level: 1, school: 'Evocation', castingTime: '1 bonus action', range: '60 feet', components: 'V', duration: 'Instantaneous', description: 'A creature of your choice that you can see within range regains hit points equal to 1d4 + your spellcasting ability modifier.', classes: ['bard', 'cleric', 'druid'] },
  { slug: 'magic-missile', name: 'Magic Missile', level: 1, school: 'Evocation', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous', description: 'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range, dealing 1d4 + 1 force damage each.', classes: ['sorcerer', 'wizard'] },
  { slug: 'shield', name: 'Shield', level: 1, school: 'Abjuration', castingTime: '1 reaction', range: 'Self', components: 'V, S', duration: '1 round', description: 'An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack.', classes: ['sorcerer', 'wizard'] },
  { slug: 'sleep', name: 'Sleep', level: 1, school: 'Enchantment', castingTime: '1 action', range: '90 feet', components: 'V, S, M', duration: '1 minute', description: 'This spell sends creatures into a magical slumber. Roll 5d8; the total is how many hit points of creatures this spell can affect.', classes: ['bard', 'sorcerer', 'wizard'] },
  { slug: 'thunderwave', name: 'Thunderwave', level: 1, school: 'Evocation', castingTime: '1 action', range: 'Self (15-foot cube)', components: 'V, S', duration: 'Instantaneous', description: 'A wave of thunderous force sweeps out from you. Each creature in a 15-foot cube takes 2d8 thunder damage and is pushed 10 feet away (CON save half).', classes: ['bard', 'druid', 'sorcerer', 'wizard'] },
  { slug: 'bless', name: 'Bless', level: 1, school: 'Enchantment', castingTime: '1 action', range: '30 feet', components: 'V, S, M', duration: 'Concentration, up to 1 minute', description: 'You bless up to three creatures of your choice within range. Whenever a target makes an attack roll or saving throw, it can add a d4 to the result.', classes: ['cleric', 'paladin'] },

  // 2nd Level
  { slug: 'acid-arrow', name: 'Acid Arrow', level: 2, school: 'Evocation', castingTime: '1 action', range: '90 feet', components: 'V, S, M', duration: 'Instantaneous', description: 'A shimmering green arrow streaks toward a target within range and bursts in a spray of acid. Deals 4d4 acid damage on hit, and 2d4 at the end of its next turn.', classes: ['wizard'] },
  { slug: 'hold-person', name: 'Hold Person', level: 2, school: 'Enchantment', castingTime: '1 action', range: '60 feet', components: 'V, S, M', duration: 'Concentration, up to 1 minute', description: 'Choose a humanoid that you can see within range. The target must succeed on a WIS save or be paralyzed for the duration.', classes: ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard'] },
  { slug: 'invisibility', name: 'Invisibility', level: 2, school: 'Illusion', castingTime: '1 action', range: 'Touch', components: 'V, S, M', duration: 'Concentration, up to 1 hour', description: 'A creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible as long as it is on the target.', classes: ['bard', 'sorcerer', 'warlock', 'wizard'] },
  { slug: 'lesser-restoration', name: 'Lesser Restoration', level: 2, school: 'Abjuration', castingTime: '1 action', range: 'Touch', components: 'V, S', duration: 'Instantaneous', description: 'You touch a creature and can end either one disease or one condition afflicting it. The condition can be blinded, deafened, paralyzed, or poisoned.', classes: ['bard', 'cleric', 'druid', 'paladin', 'ranger'] },
  { slug: 'misty-step', name: 'Misty Step', level: 2, school: 'Conjuration', castingTime: '1 bonus action', range: 'Self', components: 'V', duration: 'Instantaneous', description: 'Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see.', classes: ['sorcerer', 'warlock', 'wizard'] },
  { slug: 'scorching-ray', name: 'Scorching Ray', level: 2, school: 'Evocation', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous', description: 'You create three rays of fire and hurl them at targets within range. You can hurl them at one target or several. Make a ranged spell attack for each ray (2d6 fire each).', classes: ['sorcerer', 'wizard'] },
  { slug: 'shatter', name: 'Shatter', level: 2, school: 'Evocation', castingTime: '1 action', range: '60 feet', components: 'V, S, M', duration: 'Instantaneous', description: 'A sudden loud ringing noise, painfully intense, erupts from a point of your choice within range. Each creature in a 10-foot radius sphere takes 3d8 thunder damage.', classes: ['bard', 'sorcerer', 'warlock', 'wizard'] },
  { slug: 'spiritual-weapon', name: 'Spiritual Weapon', level: 2, school: 'Evocation', castingTime: '1 bonus action', range: '60 feet', components: 'V, S', duration: '1 minute', description: 'You create a floating, spectral weapon within range that lasts for the duration or until you cast this spell again. Deals 1d8 + casting mod force damage.', classes: ['cleric'] },
  { slug: 'suggestion', name: 'Suggestion', level: 2, school: 'Enchantment', castingTime: '1 action', range: '30 feet', components: 'V, M', duration: 'Concentration, up to 8 hours', description: 'You suggest a course of activity (limited to a sentence or two) and magically influence a creature you can see within range (WIS save negates).', classes: ['bard', 'sorcerer', 'warlock', 'wizard'] },
  { slug: 'web', name: 'Web', level: 2, school: 'Conjuration', castingTime: '1 action', range: '60 feet', components: 'V, S, M', duration: 'Concentration, up to 1 hour', description: 'You conjure a mass of thick, sticky webbing at a point within range. The webs fill a 20-foot cube and restrain creatures that fail a DEX save.', classes: ['sorcerer', 'wizard'] },

  // 3rd Level
  { slug: 'counterspell', name: 'Counterspell', level: 3, school: 'Abjuration', castingTime: '1 reaction', range: '60 feet', components: 'S', duration: 'Instantaneous', description: 'You attempt to interrupt a creature in the process of casting a spell. If the creature is casting a spell of 3rd level or lower, its spell fails and has no effect.', classes: ['sorcerer', 'warlock', 'wizard'] },
  { slug: 'dispel-magic', name: 'Dispel Magic', level: 3, school: 'Abjuration', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous', description: 'Choose one creature, object, or magical effect within range. Any spell of 3rd level or lower on the target ends.', classes: ['bard', 'cleric', 'druid', 'paladin', 'sorcerer', 'warlock', 'wizard'] },
  { slug: 'fireball', name: 'Fireball', level: 3, school: 'Evocation', castingTime: '1 action', range: '150 feet', components: 'V, S, M', duration: 'Instantaneous', description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame (8d6 fire, DEX save half).', classes: ['sorcerer', 'wizard'] },
  { slug: 'fly', name: 'Fly', level: 3, school: 'Transmutation', castingTime: '1 action', range: 'Touch', components: 'V, S, M', duration: 'Concentration, up to 10 minutes', description: 'You touch a willing creature. The target gains a flying speed of 60 feet for the duration.', classes: ['sorcerer', 'warlock', 'wizard'] },
  { slug: 'haste', name: 'Haste', level: 3, school: 'Transmutation', castingTime: '1 action', range: '30 feet', components: 'V, S, M', duration: 'Concentration, up to 1 minute', description: 'Choose a willing creature that you can see within range. Its speed is doubled, it gains a +2 bonus to AC, it has advantage on DEX saves, and it gains an additional action.', classes: ['sorcerer', 'wizard'] },
  { slug: 'lightning-bolt', name: 'Lightning Bolt', level: 3, school: 'Evocation', castingTime: '1 action', range: 'Self (100-foot line)', components: 'V, S, M', duration: 'Instantaneous', description: 'A stroke of lightning forming a line 100 feet long and 5 feet wide blasts out from you in a direction you choose (8d6 lightning damage, DEX save half).', classes: ['sorcerer', 'wizard'] },
  { slug: 'revivify', name: 'Revivify', level: 3, school: 'Necromancy', castingTime: '1 action', range: 'Touch', components: 'V, S, M', duration: 'Instantaneous', description: 'You touch a creature that has died within the last minute. That creature returns to life with 1 hit point.', classes: ['cleric', 'paladin'] },
  { slug: 'spirit-guardians', name: 'Spirit Guardians', level: 3, school: 'Conjuration', castingTime: '1 action', range: 'Self (15-foot radius)', components: 'V, S, M', duration: 'Concentration, up to 10 minutes', description: 'You call forth spirits to protect you. They flit around you to a distance of 15 feet. Affected creatures take 3d8 radiant or necrotic damage (WIS save half).', classes: ['cleric'] },
  { slug: 'tongues', name: 'Tongues', level: 3, school: 'Divination', castingTime: '1 action', range: 'Touch', components: 'V, M', duration: '1 hour', description: 'This spell grants the creature you touch the ability to understand and speak all spoken languages it hears.', classes: ['bard', 'cleric', 'sorcerer', 'warlock', 'wizard'] },
  { slug: 'water-breathing', name: 'Water Breathing', level: 3, school: 'Transmutation', castingTime: '1 action (ritual)', range: '30 feet', components: 'V, S, M', duration: '24 hours', description: 'This spell grants up to ten willing creatures you can see within range the ability to breathe underwater until the spell ends.', classes: ['druid', 'ranger', 'sorcerer', 'wizard'] }
];

const ITEMS_DATA = [
  // Weapons (15)
  { slug: 'dagger', name: 'Dagger', type: 'weapon', cost: '2 gp', weight: 1, description: 'A simple light finessable dagger (1d4 piercing).', properties: ['Finesse', 'Light', 'Thrown (20/60)'], quantity: 1 },
  { slug: 'shortsword', name: 'Shortsword', type: 'weapon', cost: '10 gp', weight: 2, description: 'A light, agile martial blade (1d6 piercing).', properties: ['Finesse', 'Light'], quantity: 1 },
  { slug: 'longsword', name: 'Longsword', type: 'weapon', cost: '15 gp', weight: 3, description: 'A versatile martial sword (1d8/1d10 slashing).', properties: ['Versatile'], quantity: 1 },
  { slug: 'greatsword', name: 'Greatsword', type: 'weapon', cost: '50 gp', weight: 6, description: 'A massive two-handed martial sword (2d6 slashing).', properties: ['Heavy', 'Two-Handed'], quantity: 1 },
  { slug: 'handaxe', name: 'Handaxe', type: 'weapon', cost: '5 gp', weight: 2, description: 'A simple throwing axe (1d6 slashing).', properties: ['Light', 'Thrown (20/60)'], quantity: 1 },
  { slug: 'battleaxe', name: 'Battleaxe', type: 'weapon', cost: '10 gp', weight: 4, description: 'A versatile chopping axe (1d8/1d10 slashing).', properties: ['Versatile'], quantity: 1 },
  { slug: 'greataxe', name: 'Greataxe', type: 'weapon', cost: '30 gp', weight: 7, description: 'A devastating heavy greataxe (1d12 slashing).', properties: ['Heavy', 'Two-Handed'], quantity: 1 },
  { slug: 'mace', name: 'Mace', type: 'weapon', cost: '5 gp', weight: 4, description: 'A simple blunt weapon with a flanged head (1d6 bludgeoning).', properties: [], quantity: 1 },
  { slug: 'warhammer', name: 'Warhammer', type: 'weapon', cost: '15 gp', weight: 2, description: 'A versatile martial hammer (1d8/1d10 bludgeoning).', properties: ['Versatile'], quantity: 1 },
  { slug: 'quarterstaff', name: 'Quarterstaff', type: 'weapon', cost: '2 sp', weight: 4, description: 'A simple wooden staff (1d6/1d8 bludgeoning).', properties: ['Versatile'], quantity: 1 },
  { slug: 'rapier', name: 'Rapier', type: 'weapon', cost: '25 gp', weight: 2, description: 'A martial thrusting blade favored by duelists (1d8 piercing).', properties: ['Finesse'], quantity: 1 },
  { slug: 'scimitar', name: 'Scimitar', type: 'weapon', cost: '25 gp', weight: 3, description: 'A light curved martial blade (1d6 slashing).', properties: ['Finesse', 'Light'], quantity: 1 },
  { slug: 'shortbow', name: 'Shortbow', type: 'weapon', cost: '25 gp', weight: 2, description: 'A small simple bow (1d6 piercing, range 80/320).', properties: ['Ammunition', 'Two-Handed'], quantity: 1 },
  { slug: 'longbow', name: 'Longbow', type: 'weapon', cost: '50 gp', weight: 2, description: 'A martial bow with great range (1d8 piercing, range 150/600).', properties: ['Ammunition', 'Heavy', 'Two-Handed'], quantity: 1 },
  { slug: 'light-crossbow', name: 'Light Crossbow', type: 'weapon', cost: '25 gp', weight: 5, description: 'A simple mechanical crossbow (1d8 piercing, range 80/320).', properties: ['Ammunition', 'Loading', 'Two-Handed'], quantity: 1 },

  // Armor & Shields (10)
  { slug: 'padded-armor', name: 'Padded Armor', type: 'armor', cost: '5 gp', weight: 8, description: 'Light quilted armor. AC 11 + DEX (Disadvantage on Stealth).', properties: ['Light Armor'], quantity: 1 },
  { slug: 'leather-armor', name: 'Leather Armor', type: 'armor', cost: '10 gp', weight: 10, description: 'Light boiled leather armor. AC 11 + DEX.', properties: ['Light Armor'], quantity: 1 },
  { slug: 'studded-leather', name: 'Studded Leather', type: 'armor', cost: '45 gp', weight: 13, description: 'Light leather reinforced with metal studs. AC 12 + DEX.', properties: ['Light Armor'], quantity: 1 },
  { slug: 'hide-armor', name: 'Hide Armor', type: 'armor', cost: '10 gp', weight: 12, description: 'Medium armor made from thick furs and pelts. AC 12 + DEX (max 2).', properties: ['Medium Armor'], quantity: 1 },
  { slug: 'chain-shirt', name: 'Chain Shirt', type: 'armor', cost: '50 gp', weight: 20, description: 'Medium interlocking chain armor worn under clothing. AC 13 + DEX (max 2).', properties: ['Medium Armor'], quantity: 1 },
  { slug: 'scale-mail', name: 'Scale Mail', type: 'armor', cost: '50 gp', weight: 45, description: 'Medium overlapping metal scales. AC 14 + DEX (max 2, Stealth Disadvantage).', properties: ['Medium Armor'], quantity: 1 },
  { slug: 'breastplate', name: 'Breastplate', type: 'armor', cost: '400 gp', weight: 20, description: 'Medium fitted metal chest piece. AC 14 + DEX (max 2).', properties: ['Medium Armor'], quantity: 1 },
  { slug: 'chain-mail', name: 'Chain Mail', type: 'armor', cost: '75 gp', weight: 55, description: 'Heavy interlocking steel rings. AC 16 (Stealth Disadvantage).', properties: ['Heavy Armor'], quantity: 1 },
  { slug: 'plate-armor', name: 'Plate Armor', type: 'armor', cost: '1500 gp', weight: 65, description: 'Heavy interlocking steel plates. AC 18 (Stealth Disadvantage).', properties: ['Heavy Armor'], quantity: 1 },
  { slug: 'shield', name: 'Shield', type: 'shield', cost: '10 gp', weight: 6, description: 'A sturdy wooden or metal shield that grants +2 to Armor Class.', properties: ['Shield'], quantity: 1 },

  // Potions & Scrolls (10)
  { slug: 'potion-of-healing', name: 'Potion of Healing', type: 'potion', cost: '50 gp', weight: 0.5, description: 'A magical red liquid that restores 2d4 + 2 hit points when consumed.', properties: ['Consumable'], quantity: 1 },
  { slug: 'potion-of-greater-healing', name: 'Potion of Greater Healing', type: 'potion', cost: '150 gp', weight: 0.5, description: 'Restores 4d4 + 4 hit points when consumed.', properties: ['Consumable'], quantity: 1 },
  { slug: 'potion-of-climbing', name: 'Potion of Climbing', type: 'potion', cost: '75 gp', weight: 0.5, description: 'Grants a climbing speed equal to your walking speed for 1 hour.', properties: ['Consumable'], quantity: 1 },
  { slug: 'potion-of-water-breathing', name: 'Potion of Water Breathing', type: 'potion', cost: '100 gp', weight: 0.5, description: 'You can breathe underwater for 1 hour after drinking this potion.', properties: ['Consumable'], quantity: 1 },
  { slug: 'potion-of-invisibility', name: 'Potion of Invisibility', type: 'potion', cost: '200 gp', weight: 0.5, description: 'You become invisible for 1 hour or until you attack or cast a spell.', properties: ['Consumable'], quantity: 1 },
  { slug: 'scroll-of-magic-missile', name: 'Spell Scroll (Magic Missile)', type: 'scroll', cost: '50 gp', weight: 0.1, description: 'Contains the Magic Missile spell written in arcane cipher.', properties: ['Scroll', 'Consumable'], quantity: 1 },
  { slug: 'scroll-of-shield', name: 'Spell Scroll (Shield)', type: 'scroll', cost: '50 gp', weight: 0.1, description: 'Contains the Shield spell ready to be released.', properties: ['Scroll', 'Consumable'], quantity: 1 },
  { slug: 'scroll-of-cure-wounds', name: 'Spell Scroll (Cure Wounds)', type: 'scroll', cost: '50 gp', weight: 0.1, description: 'Contains the Cure Wounds spell.', properties: ['Scroll', 'Consumable'], quantity: 1 },
  { slug: 'scroll-of-fireball', name: 'Spell Scroll (Fireball)', type: 'scroll', cost: '250 gp', weight: 0.1, description: 'A potent 3rd-level scroll containing the Fireball incantation.', properties: ['Scroll', 'Consumable'], quantity: 1 },
  { slug: 'scroll-of-revivify', name: 'Spell Scroll (Revivify)', type: 'scroll', cost: '300 gp', weight: 0.1, description: 'A sacred scroll capable of bringing the recently fallen back to life.', properties: ['Scroll', 'Consumable'], quantity: 1 },

  // Adventuring Gear (15)
  { slug: 'backpack', name: 'Backpack', type: 'gear', cost: '2 gp', weight: 5, description: 'A sturdy leather pack capable of holding 30 pounds of gear.', properties: ['Container'], quantity: 1 },
  { slug: 'bedroll', name: 'Bedroll', type: 'gear', cost: '1 gp', weight: 7, description: 'A wool roll used for sleeping comfortably in the wilderness.', properties: [], quantity: 1 },
  { slug: 'rope-hempen', name: 'Rope, Hempen (50 feet)', type: 'gear', cost: '1 gp', weight: 10, description: '50 feet of hemp rope with 2 hit points and can burst with DC 17 STR check.', properties: [], quantity: 1 },
  { slug: 'torch', name: 'Torch', type: 'gear', cost: '1 cp', weight: 1, description: 'Burns for 1 hour, providing bright light in a 20-foot radius and dim light for 20 more feet.', properties: [], quantity: 1 },
  { slug: 'rations-1-day', name: 'Rations (1 day)', type: 'gear', cost: '5 sp', weight: 2, description: 'Dry foods suitable for extended travel, including jerky, dried fruit, hardtack, and nuts.', properties: [], quantity: 1 },
  { slug: 'waterskin', name: 'Waterskin', type: 'gear', cost: '2 sp', weight: 5, description: 'A leather container that holds up to 4 pints of liquid.', properties: ['Container'], quantity: 1 },
  { slug: 'tinderbox', name: 'Tinderbox', type: 'gear', cost: '5 sp', weight: 1, description: 'Contains flint, fire steel, and tinder used to kindle a fire.', properties: [], quantity: 1 },
  { slug: 'grappling-hook', name: 'Grappling Hook', type: 'gear', cost: '2 gp', weight: 4, description: 'A metal hook tied to a rope to secure climbs.', properties: [], quantity: 1 },
  { slug: 'lantern-hooded', name: 'Lantern, Hooded', type: 'gear', cost: '5 gp', weight: 2, description: 'Casts bright light in a 30-foot radius and dim light for 30 more feet. Hood can reduce light.', properties: [], quantity: 1 },
  { slug: 'flask-of-oil', name: 'Flask of Oil', type: 'gear', cost: '1 sp', weight: 1, description: 'Can fuel a lantern or be thrown as an improvised splash weapon.', properties: [], quantity: 1 },
  { slug: 'crowbar', name: 'Crowbar', type: 'gear', cost: '2 gp', weight: 5, description: 'Grants advantage to Strength checks where leverage can be applied.', properties: [], quantity: 1 },
  { slug: 'piton', name: 'Piton (x10)', type: 'gear', cost: '5 sp', weight: 2.5, description: 'Metal spikes driven into rock or masonry to secure climbing ropes.', properties: [], quantity: 1 },
  { slug: 'healers-kit', name: 'Healer\'s Kit', type: 'gear', cost: '5 gp', weight: 3, description: 'A leather pouch containing bandages and salves. Has 10 uses to stabilize a dying creature.', properties: [], quantity: 1 },
  { slug: 'thieves-tools', name: 'Thieves\' Tools', type: 'gear', cost: '25 gp', weight: 1, description: 'Lock picks, small blades, and mirrors used to pick locks and disarm traps.', properties: ['Tool'], quantity: 1 },
  { slug: 'mess-kit', name: 'Mess Kit', type: 'gear', cost: '2 sp', weight: 1, description: 'A tin box containing a cup, cutlery, and cooking tin.', properties: [], quantity: 1 }
];

function seed() {
  console.log('Seeding 50 Spells and 50 Items...');

  // 1. Spells
  SPELLS_DATA.forEach((sp) => {
    const dir = path.resolve(`content/spells/${sp.level}`);
    fs.mkdirSync(dir, { recursive: true });
    const full = {
      ...sp,
      source: 'SRD 5.1',
      source_ref: `SRD 5.1, Spells: ${sp.name}`,
      license: 'CC-BY-4.0'
    };
    fs.writeFileSync(path.join(dir, `${sp.slug}.json`), JSON.stringify(full, null, 2), 'utf8');
  });

  // 2. Items
  ITEMS_DATA.forEach((item) => {
    const dir = path.resolve(`content/items/${item.type}`);
    fs.mkdirSync(dir, { recursive: true });
    const full = {
      ...item,
      source: 'SRD 5.1',
      source_ref: `SRD 5.1, Equipment: ${item.name}`,
      license: 'CC-BY-4.0'
    };
    fs.writeFileSync(path.join(dir, `${item.slug}.json`), JSON.stringify(full, null, 2), 'utf8');
  });

  console.log(`Successfully generated ${SPELLS_DATA.length} Spells and ${ITEMS_DATA.length} Items!`);
}

seed();
