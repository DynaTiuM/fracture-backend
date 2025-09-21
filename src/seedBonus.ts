import { connectDB } from './config/db';
import dotenv from 'dotenv';
import Bonus from './models/Bonus'; // adapte le chemin si besoin

dotenv.config();

async function seedBonuses() {

  await connectDB();
  await Bonus.deleteMany({});

  const bonuses = [
    // COMMON - 50%
    {
      name: 'Crystal Shard',
      rarity: 'common',
      probability: 17,
      description: '+10 points, -3 crystal durability'
    },
    {
      name: 'Energy Potion',
      rarity: 'common',
      probability: 17,
      description: '+5 points, no drawback'
    },
    {
      name: 'Guardian Bucket',
      rarity: 'common',
      probability: 16,
      description: 'Protects 2 players or 1 player + gives +2 points'
    },

    // RARE - 25%
    {
      name: 'Thorns of Discord',
      rarity: 'rare',
      probability: 10,
      description: 'Target player: next "absorb" gives 0 points and damages the crystal'
    },
    {
      name: 'Hand of Forgetfulness',
      rarity: 'rare',
      probability: 7,
      description: 'Erases the best item owned by a player ≤ epic'
    },
    {
      name: 'Revealing Shard',
      rarity: 'rare',
      probability: 8,
      description: 'Reveals the action of a targeted player + bonus +3 points'
    },

    // EPIC - 19%
    {
      name: 'Lantern of Souls',
      rarity: 'epic',
      probability: 5,
      description: 'Reveals the actions of 2 players who have already played today'
    },
    {
      name: 'Veil of Illusion',
      rarity: 'epic',
      probability: 5,
      description: 'Protects your action from any revelation'
    },
    {
      name: 'Seed of Chaos',
      rarity: 'epic',
      probability: 4,
      description: 'Randomly gives +20 or -20 points to a player'
    },
    {
      name: 'Mirror of the Day',
      rarity: 'epic',
      probability: 5,
      description: 'Inverts points earned today: 5 instead of 0, 2 instead of -2'
    },

    // LEGENDARY - 4%
    {
      name: 'Seal of the Guardian',
      rarity: 'legendary',
      probability: 2,
      description: 'Protects the crystal for one day; each "absorb" gives 50% of its gain to the holder'
    },
    {
      name: 'Broken Clock',
      rarity: 'legendary',
      probability: 2,
      description: 'Gives 2 actions tomorrow but not the same action twice'
    },

    // MYTHIC - 2%
    {
      name: 'Crystal Eclipse',
      rarity: 'mythic',
      probability: 1,
      description: 'Steals all points earned today by other players'
    },
    {
      name: 'Ritual of the Void',
      rarity: 'mythic',
      probability: 1,
      description: 'Sacrifices your score to 0; crystal falls to 1% durability'
    },
  ];

  await Bonus.insertMany(bonuses);
  console.log('Bonuses seeded!');
  process.exit(0);
}

seedBonuses().catch(err => console.error(err));
