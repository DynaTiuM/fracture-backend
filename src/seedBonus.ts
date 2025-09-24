import { connectDB } from './config/db';
import dotenv from 'dotenv';
import Bonus from './models/Bonus';

dotenv.config();

async function seedBonuses() {

  await connectDB();
  await Bonus.deleteMany({});

  const bonus = [
    // COMMON - 50%
    {
      id:'1',
      name: 'Crystal Shard',
      rarity: 'common',
      probability: 17,
      description: '+10 points, -3 crystal durability',
      trigger: 'IMMEDIATE'
    },
    {
      id:'2',
      name: 'Energy Potion',
      rarity: 'common',
      probability: 17,
      description: '+5 points, no drawback',
      trigger: 'IMMEDIATE'
    },
    {
      id:'3',
      name: 'Guardian Bucket',
      rarity: 'common',
      probability: 16,
      description: 'Protect 2 players, OR protect 1 player and gain +2 points.',
      trigger: 'ON_PLAY',
      targetMode: 'multiple'
    },

    // RARE - 25%
    {
      id:'4',
      name: 'Thorns of Discord',
      rarity: 'rare',
      probability: 10,
      description: 'Curse a player: if they choose the action "absorb", it gives them 0 points and damages the crystal',
      trigger: 'ON_PLAY',
      targetMode: 'single'
    },
    {
      id:'5',
      name: 'Hand of Forgetfulness',
      rarity: 'rare',
      probability: 7,
      description: 'Erases the best item ≤ epic owned by a player',
      trigger: 'ON_OPEN',
      targetMode: 'single'
    },
    {
      id:'6',
      name: 'Revealing Shard',
      rarity: 'rare',
      probability: 8,
      description: 'Reveals the action of a targeted player who has already played today and grants +3 points',
      trigger: 'IMMEDIATE',
      targetMode: 'single'
    },

    // EPIC - 18%
    {
      id:'7',
      name: 'Lantern of Souls',
      rarity: 'epic',
      probability: 5,
      description: 'Reveals the actions of 2 targeted players who have already played today and grants +3 points',
      trigger: 'IMMEDIATE',
      targetMode: 'multiple'
    },
    {
      id:'8',
      name: 'Veil of Illusion',
      rarity: 'epic',
      probability: 5,
      description: 'Protects your action from any revelation',
      trigger: 'IMMEDIATE'
    },
    {
      id:'9',
      name: 'Seed of Chaos',
      rarity: 'epic',
      probability: 4,
      description: 'Randomly gives +20 or -20 points to a targeted player that already played today.',
      trigger: 'IMMEDIATE',
      targetMode: 'single'
    },
    {
      id:'10',
      name: 'Mirror of the Day',
      rarity: 'epic',
      probability: 4,
      description: 'Inverts points earned today for every players: -5 instead of 5 for absorb, 2 instead of -2 for repair, and 5 instead of 0 for hold.',
      trigger: 'IMMEDIATE'
    },

    // LEGENDARY - 4%
    {
      id:'11',
      name: 'Seal of the Guardian',
      rarity: 'legendary',
      probability: 2,
      description: 'Protects the crystal for one day; each absorb action by other players gives its points to you.',
      trigger: 'ON_OPEN'
    },
    {
      id:'12',
      name: 'Power Spike',
      rarity: 'legendary',
      probability: 2,
      description: '+30 points, -15 crystal durability',
      trigger: 'IMMEDIATE'
    },

    // MYTHIC - 3%
    {
      id:'13',
      name: 'Crystal Eclipse',
      rarity: 'mythic',
      probability: 1,
      description: 'Steals all points earned today by other players (negative points included!)',
      trigger: 'IMMEDIATE'
    },
    {
      id:'14',
      name: 'Ritual of the Void',
      rarity: 'mythic',
      probability: 1,
      description: 'Sacrifices your score to 0; crystal falls to 1% durability',
      trigger: 'ON_OPEN'
    },
    {
      id:'15',
      name: 'All or Nothing',
      rarity: 'legendary',
      probability: 2,
      description: '+50 points, -45 crystal durability',
      trigger: 'IMMEDIATE'
    },
  ];

  await Bonus.insertMany(bonus);
  console.log('Bonuses seeded!');
  process.exit(0);
}

seedBonuses().catch(err => console.error(err));