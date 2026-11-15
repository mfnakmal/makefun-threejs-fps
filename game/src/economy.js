// Tactical Buy Economy System for KILNFIRE
// Implements Counter-Strike / Valorant competitive cash flow, loss streak bonuses, and buy store.
export const ECONOMY_RULES = {
  startMoney: 800,
  maxMoney: 9000,
  winBonus: 3250,
  lossBase: 1400,
  lossStreakBonus: 500,
  lossCap: 2400,
  killBonus: 300,
  bombPlantBonus: 300,
  bombDefuseBonus: 300,
  armorPrice: 1000,
  armorShield: 50,
};

export function createEconomy() {
  let playerMoney = ECONOMY_RULES.startMoney;
  let lossStreak = 0;

  return {
    getMoney() {
      return playerMoney;
    },
    setMoney(amt) {
      playerMoney = Math.max(0, Math.min(ECONOMY_RULES.maxMoney, amt));
    },
    addReward(type) {
      if (type === 'kill') {
        playerMoney = Math.min(ECONOMY_RULES.maxMoney, playerMoney + ECONOMY_RULES.killBonus);
      } else if (type === 'plant') {
        playerMoney = Math.min(ECONOMY_RULES.maxMoney, playerMoney + ECONOMY_RULES.bombPlantBonus);
      } else if (type === 'defuse') {
        playerMoney = Math.min(ECONOMY_RULES.maxMoney, playerMoney + ECONOMY_RULES.bombDefuseBonus);
      }
    },
    awardRoundResult(won) {
      if (won) {
        lossStreak = 0;
        playerMoney = Math.min(ECONOMY_RULES.maxMoney, playerMoney + ECONOMY_RULES.winBonus);
      } else {
        const bonus = Math.min(
          ECONOMY_RULES.lossCap,
          ECONOMY_RULES.lossBase + lossStreak * ECONOMY_RULES.lossStreakBonus,
        );
        lossStreak += 1;
        playerMoney = Math.min(ECONOMY_RULES.maxMoney, playerMoney + bonus);
      }
    },
    canAfford(price) {
      return playerMoney >= price;
    },
    purchase(price) {
      if (playerMoney >= price) {
        playerMoney -= price;
        return true;
      }
      return false;
    },
    reset() {
      playerMoney = ECONOMY_RULES.startMoney;
      lossStreak = 0;
    },
  };
}

