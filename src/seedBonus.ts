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
      description: 'Protects 2 players or 1 player from crystal breaking + gives +2 points',
      trigger: 'ON_PLAY'
    },

    // RARE - 25%
    {
      id:'4',
      name: 'Thorns of Discord',
      rarity: 'rare',
      probability: 10,
      description: 'Target player: next "absorb" gives 0 points and damages the crystal',
      trigger: 'ON_PLAY'
    },
    {
      id:'5',
      name: 'Hand of Forgetfulness',
      rarity: 'rare',
      probability: 7,
      description: 'Erases the best item owned by a player ≤ epic',
      trigger: 'ON_OPEN'
    },
    {
      id:'6',
      name: 'Revealing Shard',
      rarity: 'rare',
      probability: 8,
      description: 'Reveals the action of a targeted player who have already played today + bonus +3 points',
      trigger: 'IMMEDIATE'
    },

    // EPIC - 18%
    {
      id:'7',
      name: 'Lantern of Souls',
      rarity: 'epic',
      probability: 5,
      description: 'Reveals the actions of 2 targeted players who have already played today + bonus +5 points',
      trigger: 'IMMEDIATE'
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
      description: 'Randomly gives +20 or -20 points to a player',
      trigger: 'IMMEDIATE'
    },
    {
      id:'10',
      name: 'Mirror of the Day',
      rarity: 'epic',
      probability: 4,
      description: 'Inverts points earned today: 5 instead of 0, 2 instead of -2',
      trigger: 'IMMEDIATE'
    },

    // LEGENDARY - 4%
    {
      id:'11',
      name: 'Seal of the Guardian',
      rarity: 'legendary',
      probability: 2,
      description: 'Protects the crystal for one day; each "absorb" gives its gain to the holder',
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
      description: 'Steals all points earned today by other players',
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
      description: '+50 points, -50 crystal durability',
      trigger: 'IMMEDIATE'
    },
  ];

  await Bonus.insertMany(bonus);
  console.log('Bonuses seeded!');
  process.exit(0);
}

seedBonuses().catch(err => console.error(err));
