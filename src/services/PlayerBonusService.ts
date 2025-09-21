import PlayerBonus from '../models/PlayerBonus';

export class PlayerBonusService {
  async addBonusToPlayer(playerId: string, bonusId: string, dateAcquired?: Date) {
    const newPlayerBonus = await PlayerBonus.create({
        playerId,
        bonusId,
        active: false,
        dateAcquired: dateAcquired || new Date(),
    });

    return newPlayerBonus;
  }

  async getPlayerBonuses(playerId: string) {
    return await PlayerBonus.find({ playerId });
  }

  async activateBonus(playerBonusId: string, durationInMs?: number) {
    const bonus = await PlayerBonus.findById(playerBonusId);
    if (!bonus) throw new Error('Player bonus not found');

    bonus.active = true;
    if (durationInMs) {
        bonus.expiresAt = new Date(Date.now() + durationInMs);
    }
    await bonus.save();
    return bonus;
  }

  async deactivateBonus(playerBonusId: string) {
    const bonus = await PlayerBonus.findById(playerBonusId);
    if (!bonus) throw new Error('Player bonus not found');

    bonus.active = false;
    bonus.expiresAt = undefined;
    await bonus.save();
    return bonus;
  }
}

export const playerBonusService = new PlayerBonusService();
