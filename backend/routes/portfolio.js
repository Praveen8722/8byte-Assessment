import express from "express";
import sectors from "../data/sectors.js";
import { computeValuations } from "../utils/helpers.js";

const router = express.Router();

// Get valuations
router.get("/valuations", (req, res) => {
  res.json(computeValuations(sectors));
});

// Add stock
router.post("/stock", (req, res) => {
  const { sector, id, particulars, purchasePrice, qty, cmp } = req.body;
  let sectorObj = sectors.find(s => s.sector === sector);
  if (!sectorObj) {
    sectorObj = { sector, stocks: [] };
    sectors.push(sectorObj);
  }
  sectorObj.stocks.push({
    id,
    particulars,
    purchasePrice: Number(purchasePrice),
    qty: Number(qty),
    cmp: Number(cmp)
  });
  req.io.emit("valuations", computeValuations(sectors)); // push update
  res.json({ success: true });
});

// Update stock
router.put("/stock/:id", (req, res) => {
  const stockId = req.params.id;
  const { particulars, purchasePrice, qty, cmp } = req.body;
  for (const sector of sectors) {
    const stock = sector.stocks.find(s => s.id === stockId);
    if (stock) {
      stock.particulars = particulars;
      stock.purchasePrice = Number(purchasePrice);
      stock.qty = Number(qty);
      stock.cmp = Number(cmp);
      req.io.emit("valuations", computeValuations(sectors));
      return res.json({ success: true });
    }
  }
  res.status(404).json({ success: false, message: "Stock not found" });
});

// Delete stock
router.delete("/stock/:id", (req, res) => {
  const stockId = req.params.id;
  for (const sector of sectors) {
    const index = sector.stocks.findIndex(s => s.id === stockId);
    if (index !== -1) {
      sector.stocks.splice(index, 1);
      req.io.emit("valuations", computeValuations(sectors));
      return res.json({ success: true });
    }
  }
  res.status(404).json({ success: false, message: "Stock not found" });
});

export default router;
