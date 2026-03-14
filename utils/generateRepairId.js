// // ============================================================
// // utils/generateRepairId.js
// // Auto-generates a unique, sequential repair ID (e.g. R1001)
// // ============================================================

// const RepairRequest = require("../models/RepairRequest");

// /**
//  * Generates the next repair ID in the sequence.
//  *
//  * Strategy:
//  *  - Finds the highest existing repairId numerically
//  *  - Increments by 1, starting from R1001 if the collection is empty
//  *
//  * This is more reliable than using document count (which breaks after deletions).
//  *
//  * @returns {Promise<string>} - e.g. "R1001", "R1002", ...
//  */
// const generateRepairId = async () => {
//   // Find the most recently created repair request that has a valid repairId
//   const lastRepair = await RepairRequest.findOne({
//     repairId: { $regex: /^R\d+$/ },
//   })
//     .sort({ createdAt: -1 }) // Most recent first
//     .select("repairId")
//     .lean();

//   if (!lastRepair) {
//     // First ever repair request
//     return "R1001";
//   }

//   // Extract numeric part and increment
//   const lastNumber = parseInt(lastRepair.repairId.replace("R", ""), 10);
//   const nextNumber = lastNumber + 1;

//   return `R${nextNumber}`;
// };

// module.exports = generateRepairId;

// ============================================================
// utils/generateRepairId.js
// Auto-generates a unique repair ID
// ============================================================

const RepairRequest = require("../models/RepairRequest");

const generateRepairId = async () => {
  let repairId;
  let exists = true;

  while (exists) {
    // generate unique id using timestamp
    repairId = "R" + Date.now();

    // check if already exists in database
    const repair = await RepairRequest.findOne({ repairId });

    if (!repair) {
      exists = false;
    }
  }

  return repairId;
};

module.exports = generateRepairId;