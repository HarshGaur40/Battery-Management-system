"use client";
import { useState, useEffect, useRef } from "react";
import Light from "./Light";
import InputView from "./InputView";

type BatteryCell = {
  charge: number;
  usageCycle: number;
  temperature: number;
};

export default function VehicleView() {
  const [lightsOn, setLightsOn] = useState<boolean>(false);
  const [cells, setCells] = useState<BatteryCell[]>([]);
  const [selectedCell, setSelectedCell] = useState<BatteryCell | null>(null);
  const [isTraveling, setIsTraveling] = useState<boolean>(false);
  const [leftTemperature, setLeftTemperature] = useState(0);
  const [rightTemperature, setRightTemperature] = useState(0);

  const initialTemperatureRef = useRef(leftTemperature); // Track the initial temperature

  // Utility function to generate initial battery cells
  const generateCells = () =>
    Array.from({ length: 100 }).map(() => ({
      charge: 100,
      usageCycle: 0,
      temperature: Math.floor(Math.random() * 30 + 15),
    }));

  // Function to select the best cell based on usage cycles and temperature
  const selectBestCell = () => {
    const eligibleCells = cells
      .filter((cell) => cell.charge > 0) // Ensure cell has some charge left
      .sort((a, b) => {
        // Sort by usage cycle (ascending)
        if (a.usageCycle !== b.usageCycle) {
          return a.usageCycle - b.usageCycle;
        }
        // If usage cycle is the same, sort by charge (descending)
        if (a.charge !== b.charge) {
          return b.charge - a.charge;
        }
        // If both usage cycle and charge are the same, sort by temperature (ascending)
        return a.temperature - b.temperature;
      });

    setSelectedCell(eligibleCells[0] || null); // Select the best cell or null
  };

  // Update cells' values every 10 seconds if traveling
  useEffect(() => {
    if (!isTraveling || !selectedCell) return;

    const interval = setInterval(() => {
      if (selectedCell) {
        // Decrease the charge and increase temperature for the selected cell
        setCells((prevCells) => {
          const updatedCells = prevCells.map((cell) => {
            if (cell === selectedCell) {
              const newCharge = cell.charge - 10; // Decrease charge by 10%
              const newTemperature = cell.temperature + 3; // Increase temperature by 3°C
              const newUsageCycle = cell.usageCycle + 1; // Increase usage cycle

              return {
                ...cell,
                charge: newCharge > 0 ? newCharge : 0, // Ensure charge does not go below 0
                temperature: newTemperature,
                usageCycle: newUsageCycle,
              };
            }
            return cell;
          });
          return updatedCells;
        });

        // Update temperatures based on the selected cell's temperature
        setLeftTemperature((prevTemp) => selectedCell.temperature + 3);
        setRightTemperature((prevTemp) => selectedCell.temperature + 3);

        // Check if the charge has dropped below 70% or if the temperature increase exceeds 8°C
        if (selectedCell.charge <= 70) {
          // Select a new best cell when the charge is <= 70%
          selectBestCell(); // Select a new best cell based on charge, cycles, and temperature
        }else{}
      }
    }, 3000); // Update every 10 seconds (1 km)

    return () => clearInterval(interval); // Clean up interval on component unmount
  }, [isTraveling, selectedCell, cells]); // Dependency array includes relevant state variables

  // Start traveling and select the best cell
  const handleStartTravel = () => {
    setIsTraveling(true);
    selectBestCell();
  };

  // Stop traveling
  const handleStopTravel = () => {
    setIsTraveling(false);
  };

  // Generate initial cells when the component mounts
  useEffect(() => {
    setCells(generateCells());
  }, []);

  const getChargeColor = (charge: number) => {
    if (charge < 20) return "bg-[#FF4C4C]";
    if (charge >= 20 && charge < 40) return "bg-[#FFA94C]";
    if (charge >= 40 && charge < 60) return "bg-[#FFD700]";
    if (charge >= 60 && charge < 80) return "bg-[#A3E635]";
    return "bg-[#4CAF50]";
  };

  return (
    <div className="vehicle-container">
      <div className="flex flex-col items-center w-[6%]">
        <input
          type="range"
          min="0"
          max="100"
          value={leftTemperature}
          onChange={(e) => setLeftTemperature(parseInt(e.target.value))}
          className="w-30 h-48 transform rotate-90"
        />
        <span className="mt-2">{leftTemperature}°C</span>
      </div>
      <div className="vehicle-body">
        <div className="vehicle-section engine">
          <div className="wheel wheel-left"></div>Engine
          <div className="wheel wheel-right"></div>
        </div>

        <div className="vehicle-section battery">
          <div className="grid gap-5 z-10">
            {cells.map((cell, index) => {
              const chargeColor = getChargeColor(cell.charge);
              const isSelected = selectedCell === cell;
              return (
                <div
                  key={index}
                  className={`battery-icon_wrapper lvl${index + 1} relative w-[34px] h-[30px] border-2 ${isSelected ? "border-blue-500" : "border-[#333]"
                    } rounded-md flex flex-col justify-end items-center group`}
                >
                  <div className="absolute top-[-5px] left-1/2 transform -translate-x-1/2 bg-white rounded-[6px] w-[12px] h-[3px]" />
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-white font-semibold">
                    {cell.charge}%
                  </span>
                  <div
                    className={`w-full ${chargeColor} rounded-b-md ${cell.charge > 94 ? "rounded-t-md" : ""
                      }`}
                    style={{ height: `${cell.charge}%` }}
                  ></div>
                  {/* Tooltip for Charge, Cycle, and Temperature */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-max bg-gray-700 text-white text-sm rounded py-1 px-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Charge: {cell.charge}%, Cycles: {cell.usageCycle}, Temperature: {cell.temperature}°C
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="vehicle-section baggage">
          <div className="wheel wheel-rear-left"></div>Baggage
          <div className="wheel wheel-rear-right"></div>
        </div>
        <div className="front-label">Front</div>
        <div className="back-label">Rear</div>

        <Light position="front-left" isOn={lightsOn} />
        <Light position="front-right" isOn={lightsOn} />
        <Light position="rear-left" isOn={lightsOn} />
        <Light position="rear-right" isOn={lightsOn} />
      </div>
      <div className="flex flex-col items-center w-[6%]">
        <input
          type="range"
          min="0"
          max="100"
          value={rightTemperature}
          onChange={(e) => setRightTemperature(parseInt(e.target.value))}
          className="w-30 h-48 transform rotate-90"
        />
        <span className="mt-2">{rightTemperature}°C</span>
      </div>

      <InputView
        onStartTravel={handleStartTravel}
        onStopTravel={handleStopTravel}
        isTraveling={isTraveling}
      />
    </div>
  );
}
