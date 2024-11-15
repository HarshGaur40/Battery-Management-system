// server.js
const express = require("express");
const app = express();
const PORT = 5000;

let cells = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  charge: Math.floor(Math.random() * 101), // random initial charge
  usageCycle: 0,
  temperature: Math.floor(Math.random() * 16) + 15, // random temperature between 15 and 30°C
}));

// Function to select the best cell based on usageCycle and temperature
function selectBestCell(cells) {
  const eligibleCells = cells.filter(cell => cell.temperature >= 20 && cell.temperature <= 30);
  eligibleCells.sort((a, b) => a.usageCycle - b.usageCycle);
  return eligibleCells.length ? eligibleCells[0] : null;
}

// Endpoint to get all cell data
app.get("/api/cells", (req, res) => {
  res.json(cells);
});

// Endpoint to start the journey and get the selected cell
app.get("/api/start-travel", (req, res) => {
  const bestCell = selectBestCell(cells);
  if (bestCell) {
    // Update cell state
    bestCell.charge = Math.max(bestCell.charge - 5, 0); // decrease charge by 5%
    bestCell.usageCycle += 1; // increment usage cycle
    res.json({ bestCell, cells });
  } else {
    res.status(404).json({ message: "No suitable cell found." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
