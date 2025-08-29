import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography,
  Box, CircularProgress, Button, Dialog,
  DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, InputLabel, FormControl
} from "@mui/material";
import socket from "../api/socket";

const PortfolioTable = () => {
  const [data, setData] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [form, setForm] = useState({
    sector: "",
    id: "",
    particulars: "",
    purchasePrice: "",
    qty: "",
    cmp: ""
  });
  const [editStockId, setEditStockId] = useState(null);

  useEffect(() => {
    socket.on("valuations", (snapshot) => setData(snapshot));
    return () => socket.off("valuations");
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async () => {
    await fetch("http://localhost:4000/api/portfolio/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setAddDialogOpen(false);
    setForm({ sector: "", id: "", particulars: "", purchasePrice: "", qty: "", cmp: "" });
  };

  const handleEdit = (stock, sector) => {
    setForm({
      sector,
      id: stock.id,
      particulars: stock.particulars,
      purchasePrice: stock.purchasePrice,
      qty: stock.qty,
      cmp: stock.liveCMP
    });
    setEditStockId(stock.id);
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    await fetch(`http://localhost:4000/api/portfolio/stock/${editStockId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditDialogOpen(false);
    setForm({ sector: "", id: "", particulars: "", purchasePrice: "", qty: "", cmp: "" });
    setEditStockId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stock?")) return;
    await fetch(`http://localhost:4000/api/portfolio/stock/${id}`, { method: "DELETE" });
  };

  if (!data) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          📊 Live Portfolio Dashboard
        </Typography>
        <Button variant="contained" onClick={() => setAddDialogOpen(true)}>➕ Add Stock</Button>
      </Box>

      {data.sectors.map((sector) => (
        <Box key={sector.sector} mt={4}>
          <Typography variant="h6" gutterBottom>{sector.sector}</Typography>
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell><b>Particulars</b></TableCell>
                  <TableCell align="right"><b>Purchase Price</b></TableCell>
                  <TableCell align="right"><b>Qty</b></TableCell>
                  <TableCell align="right"><b>Investment</b></TableCell>
                  <TableCell align="right"><b>Live CMP</b></TableCell>
                  <TableCell align="right"><b>Present Value</b></TableCell>
                  <TableCell align="right"><b>Gain/Loss</b></TableCell>
                  <TableCell align="right"><b>Gain/Loss %</b></TableCell>
                  <TableCell align="right"><b>Portfolio %</b></TableCell>
                  <TableCell align="right"><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sector.stocks.map((stock) => (
                  <TableRow key={stock.id}>
                    <TableCell>{stock.particulars}</TableCell>
                    <TableCell align="right">{stock.purchasePrice}</TableCell>
                    <TableCell align="right">{stock.qty}</TableCell>
                    <TableCell align="right">{stock.investment}</TableCell>
                    <TableCell align="right">{stock.liveCMP}</TableCell>
                    <TableCell align="right">{stock.presentValue}</TableCell>
                    <TableCell align="right" sx={{ color: stock.gainLoss >= 0 ? "green" : "red" }}>
                      {stock.gainLoss}
                    </TableCell>
                    <TableCell align="right" sx={{ color: stock.gainLossPercent >= 0 ? "green" : "red" }}>
                      {stock.gainLossPercent}%
                    </TableCell>
                    <TableCell align="right">{stock.portfolioPercent}%</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => handleEdit(stock, sector.sector)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => handleDelete(stock.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}

      {/* Summary */}
      <Box mt={4} p={2} bgcolor="#f0f0f0" borderRadius={2}>
        <Typography variant="h6">Portfolio Summary</Typography>
        <Typography>Total Investment: ₹{data.totals.totalInvestment}</Typography>
        <Typography>Total Present Value: ₹{data.totals.totalPresentValue}</Typography>
        <Typography sx={{ color: data.totals.totalGainLoss >= 0 ? "green" : "red" }}>
          Total Gain/Loss: ₹{data.totals.totalGainLoss}
        </Typography>
      </Box>

      {/* Add Stock Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} disableEnforceFocus>
        <DialogTitle>Add New Stock</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <FormControl>
            <InputLabel>Sector</InputLabel>
            <Select name="sector" value={form.sector} onChange={handleChange}>
              {data.sectors.map((s) => (
                <MenuItem key={s.sector} value={s.sector}>{s.sector}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Stock ID" name="id" value={form.id} onChange={handleChange}/>
          <TextField label="Particulars" name="particulars" value={form.particulars} onChange={handleChange}/>
          <TextField label="Purchase Price" type="number" name="purchasePrice" value={form.purchasePrice} onChange={handleChange}/>
          <TextField label="Quantity" type="number" name="qty" value={form.qty} onChange={handleChange}/>
          <TextField label="CMP" type="number" name="cmp" value={form.cmp} onChange={handleChange}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Stock Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} disableEnforceFocus>
        <DialogTitle>Edit Stock</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Stock ID" name="id" value={form.id} disabled/>
          <TextField label="Particulars" name="particulars" value={form.particulars} onChange={handleChange}/>
          <TextField label="Purchase Price" type="number" name="purchasePrice" value={form.purchasePrice} onChange={handleChange}/>
          <TextField label="Quantity" type="number" name="qty" value={form.qty} onChange={handleChange}/>
          <TextField label="CMP" type="number" name="cmp" value={form.cmp} onChange={handleChange}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PortfolioTable;
