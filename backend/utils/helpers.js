const MAX_MOVE_PERCENT = 1.5;

// Random price movement
export function randomPriceMove(currentPrice) {
  const sign = Math.random() < 0.5 ? -1 : 1;
  const magnitude = Math.random() * MAX_MOVE_PERCENT;
  return Math.max(0.01, Math.round(currentPrice * (1 + (sign * magnitude) / 100) * 100) / 100);
}

// Compute valuations
export function computeValuations(sectors) {
  const result = { sectors: [], totals: { totalInvestment: 0, totalPresentValue: 0, totalGainLoss: 0 }, timestamp: new Date().toISOString() };

  for (const sector of sectors) {
    const sectorOut = { sector: sector.sector, stocks: [] };
    for (const s of sector.stocks) {
      const investment = s.purchasePrice * s.qty;
      const presentValue = s.cmp * s.qty;
      const gainLoss = presentValue - investment;
      const gainLossPercent = investment === 0 ? 0 : (gainLoss / investment) * 100;
      sectorOut.stocks.push({
        id: s.id,
        particulars: s.particulars,
        purchasePrice: s.purchasePrice,
        qty: s.qty,
        investment,
        liveCMP: s.cmp,
        presentValue: Math.round(presentValue * 100) / 100,
        gainLoss: Math.round(gainLoss * 100) / 100,
        gainLossPercent: Math.round(gainLossPercent * 100) / 100,
      });
      result.totals.totalInvestment += investment;
      result.totals.totalPresentValue += presentValue;
      result.totals.totalGainLoss += gainLoss;
    }
    result.sectors.push(sectorOut);
  }

  result.totals.totalInvestment = Math.round(result.totals.totalInvestment * 100) / 100;
  result.totals.totalPresentValue = Math.round(result.totals.totalPresentValue * 100) / 100;
  result.totals.totalGainLoss = Math.round(result.totals.totalGainLoss * 100) / 100;

  // portfolio percent
  for (const sector of result.sectors) {
    for (const s of sector.stocks) {
      s.portfolioPercent = result.totals.totalPresentValue === 0 ? 0 : Math.round((s.presentValue / result.totals.totalPresentValue) * 10000) / 100;
    }
  }

  return result;
}

// Simulate market tick
export function tickMarket(sectors) {
  for (const sector of sectors) {
    for (const s of sector.stocks) {
      s.cmp = randomPriceMove(s.cmp);
    }
  }
}
