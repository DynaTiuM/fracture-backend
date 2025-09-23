import { ActionEffect, BonusHandler } from "../game/BonusHandler";
import PlayerScoreHistory from "../models/PlayerScoreHistory";

async function applyExtraScores(bonusEffect: ActionEffect) {
  if (bonusEffect.extraScore) {
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // TODO: Verify if it works
    for (const { playerId: target, delta } of bonusEffect.extraScore) {
      await PlayerScoreHistory.updateOne(
        { playerId: target, "dailyScores.date": todayDate },
        {
          $inc: {
            "dailyScores.$.score": delta,
            weeklyScore: delta,
          },
        }
      );
    }
  }
}

export const ACTIONS_EFFECTS: Record<
  "absorb" | "repair" | "hold",
  (playerId: string) => Promise<{ crystalDelta: number; scoreDelta: number }>
> = {
  absorb: async (playerId) => {
    const crystalDeltaBase = -5;
    const scoreDeltaBase = 5;
    const bonusEffect = await BonusHandler.calculateBonusEffect(playerId, "absorb", crystalDeltaBase, scoreDeltaBase);
    await applyExtraScores(bonusEffect);
    return { crystalDelta: crystalDeltaBase  + bonusEffect.crystalDelta, scoreDelta: scoreDeltaBase + bonusEffect.scoreDelta };
  },
  repair: async (playerId) => {
    const crystalDeltaBase = 2;
    const scoreDeltaBase = -2;
    const bonusEffect = await BonusHandler.calculateBonusEffect(playerId, "repair", crystalDeltaBase, scoreDeltaBase);
    await applyExtraScores(bonusEffect);
    return { crystalDelta: crystalDeltaBase  + bonusEffect.crystalDelta, scoreDelta: scoreDeltaBase + bonusEffect.scoreDelta };
  },
  hold: async (playerId) => {
    const crystalDeltaBase = 0;
    const scoreDeltaBase = 0;
    const bonusEffect = await BonusHandler.calculateBonusEffect(playerId, "hold", crystalDeltaBase, scoreDeltaBase);
    await applyExtraScores(bonusEffect);
    return { crystalDelta: crystalDeltaBase  + bonusEffect.crystalDelta, scoreDelta: scoreDeltaBase + bonusEffect.scoreDelta };
  },
};


