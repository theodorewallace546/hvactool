/*
 * EM Pricing Catalog — default pricing profile for the quote engine.
 *
 * Ported directly from EM Energy & Air's own em-shared-pricing.js (the
 * authoritative source per the 2026-04-11 tools audit) so the new quote
 * engine matches the real business rules instead of re-deriving them.
 *
 * This file is the swap point for Phase 2 (goal.txt): a different company
 * gets its own pricing-catalog.js with its own DB_BASE/SELECT_OPTS/
 * CUSTOMER_DEFAULTS, loaded in place of this one. Nothing else in the app
 * should need to change.
 */
window.EM_PRICING = (() => {
  const DB_BASE = [
  // HVAC DUCT WORK
  {n:'Air Ducts Installation', c:180, u:'per_unit', h:'$180 per duct run'},
  {n:'Air Duct Replacement', c:180, u:'per_unit', h:'$180 per duct run'},
  {n:'Air Ducts Replacement', c:180, u:'per_unit', h:'$180 per duct run'},
  {n:'Vent Boots Installation', c:15, u:'per_unit', h:'$15 per vent boot'},
  {n:'Plenum Installation', c:150, u:'per_unit', h:'$150 each'},
  {n:'Installation of New Return Line', c:300, u:'per_unit', h:'$300 each'},
  {n:'New Return Line Installation', c:300, u:'per_unit', h:'$300 each'},
  {n:'New Duct Line Installation', c:230, u:'per_unit', h:'$230 each'},
  {n:'Flue Pipe Installation', c:150, u:'per_unit', h:'$150 each'},
  {n:'Air Duct Repair', c:0, u:'variable', h:'$0 EM cost by default — charged revenue is pure profit unless overridden'},
  {n:'Air Ducts Removal and Disposal', c:0, u:'per_unit', h:'$0 EM cost — charged revenue is pure profit'},
  {n:'Disconnected Air Ducts Removal', c:0, u:'variable', h:'$0 EM cost by default — charged revenue is pure profit unless overridden'},
  {n:'Air Ducts Insulation Replacement', c:50, u:'per_unit', h:'$50 each'},
  {n:'Duct Joints Insulation Replacement', c:15, u:'per_unit', h:'$15 each, free if ducts are replaced'},
  {n:'Damper Installation', c:50, u:'per_unit', h:'$50 each'},
  {n:'Exhaust Pipe Installation', c:150, u:'per_unit', h:'$150 each'},
  {n:'HVAC filtration unit', c:100, u:'per_unit', h:'$100 each'},
  {n:'Insulation for HVAC Air Distribution System Components', c:15, u:'per_unit', h:'$15 each, free if ducts are replaced'},
  {n:'Territorial Zoning', c:2500, u:'variable', h:'Base cost $2,500, override if needed'},
  // HVAC CENTRAL AC / HEAT PUMP
  {n:'A/C Installation', c:null, u:'by_ac_tonnage', h:'Defaults to basic Payne 1-stage for the quoted tonnage unless the quote explicitly selects an upgrade. Carrier 1-stage = Payne +$900. Carrier 37MURA = premium. Amana = 37MURA −$1,200.'},
  {n:'Furnace Installation', c:null, u:'by_furnace_tonnage', h:'All prices reference Payne base. Carrier +$500/unit · 95%/96% eff +$600/unit · 2-stage +$500/unit. Optional upgrade text does not change the default unless actually selected.'},
  {n:'Heat Pump Installation', c:null, u:'by_hp_tonnage', h:'Select system and tonnage. Amana is $1,200 less than Carrier 37MURA.'},
  {n:'Heat Pump Installation - 37MURA', c:null, u:'by_hp_tonnage', h:'Select tonnage'},
  {n:'Heat Pump Replacement - 37MURA', c:null, u:'by_hp_tonnage', h:'Select tonnage'},
  {n:'Air Handler - Attic Installation', c:1000, u:'per_unit', h:'$1,000 each'},
  {n:'Thermostat Installation', c:250, u:'per_unit', h:'Nest $250, override for Ecobee if needed'},
  {n:'HVAC Repair', c:null, u:'variable', h:'Enter manually'},
  {n:'HVAC System Deep Cleaning', c:32, u:'per_vent', h:'With negative air: $32 per vent; without negative air: $250 flat'},
  {n:'Furnace Deep Cleaning', c:250, u:'per_unit', h:'$250 each'},
  {n:'Furnace Removal & Disposal', c:0, u:'variable', h:'$0 EM cost — any charged revenue is pure profit'},
  {n:'A/C Removal & Disposal', c:0, u:'variable', h:'$0 EM cost — any charged revenue is pure profit'},
  // MINI SPLITS
  {n:'MiniSplit Ductless Heat Pump Installation', c:null, u:'by_minisplit_btu', h:'FTXV = cost per air handler in a multi-zone system. RXC = cost for a single-zone system. Select series and BTU.'},
  {n:'MiniSplit Ductless Heat Pump', c:null, u:'by_minisplit_btu', h:'FTXV = cost per air handler in a multi-zone system. RXC = cost for a single-zone system. Select series and BTU.'},
  // ELECTRICAL
  {n:'Electricity Panel Upgrade', c:4300, u:'per_unit', h:'$4,300 each, city fees excluded'},
  {n:'Electrical', c:null, u:'variable', h:'Enter manually'},
  {n:'Power Outlet Installation', c:200, u:'per_unit', h:'$200 each'},
  {n:'Bathroom Exhaust Fan Installation', c:500, u:'per_unit', h:'$500 each'},
  {n:'Bathroom Exhaust Fan Cleaning', c:40, u:'per_unit', h:'$40 each'},
  {n:'Bathroom Fan Exhaust Pipe Installation', c:35, u:'per_unit', h:'$35 each'},
  {n:'Dryer Exhaust Pipe Replacement', c:100, u:'per_unit', h:'$100 each'},
  // INSULATION
  {n:'Attic Insulation Removal', c:1.05, u:'per_sqft', h:'Removal alone: $1.05/sqft. With install, removal portion drops to $0.30/sqft for blown-in or $0.50/sqft for batts.'},
  {n:'Attic Insulation Installation', c:null, u:'by_attic_insulation_install', h:'Select insulation type / R-value'},
  {n:'Attic Insulation Enhancement', c:1.4, u:'per_sqft', h:'R-30 blown in atop existing'},
  {n:'Attic Insulation Replacement', c:1.85, u:'per_sqft', h:'R-38 blown in replacement'},
  {n:'Ceiling Insulation Installation', c:null, u:'by_ceiling_insulation_install', h:'Select R-value'},
  {n:'Crawl Space Subfloor Insulation Removal', c:1.05, u:'per_sqft', h:'Removal alone: $1.05/sqft. Combined with subfloor install, removal portion drops to $0.40/sqft.'},
  {n:'Subfloor Insulation Installation', c:null, u:'by_subfloor_insulation_install', h:'Select insulation type / R-value'},
  {n:'Subfloor Insulation Installation - Batts R-19 24"', c:1.37, u:'per_sqft', h:'Auto-calculates from QTY square footage'},
  {n:'Subfloor Insulation Installation Batts R-19 16"', c:1.37, u:'per_sqft', h:'Auto-calculates from QTY square footage'},
  {n:'Subfloor Insulation Repair', c:1.77, u:'per_sqft', h:'Auto-calculates from QTY square footage'},
  {n:'Crawl Space Wall Insulation', c:1.37, u:'per_sqft', h:'Auto-calculates from QTY square footage'},
  {n:'Attic Walls Insulation Installation', c:1.27, u:'per_sqft', h:'Auto-calculates from QTY square footage'},
  {n:'Walls Insulation Installation', c:1.2, u:'per_sqft', h:'Auto-calculates from QTY square footage'},
  {n:'Walls (Exposed) Insulation Installation', c:null, u:'by_exposed_walls_insulation', h:'Select exposed-wall R-value'},
  {n:'Skylight Insulation Installation', c:1.27, u:'per_sqft', h:'Auto-calculates from QTY square footage'},
  {n:'Radiant Barrier Installation', c:0.9, u:'per_sqft', h:'Auto-calculates from QTY square footage'},
  {n:'Spray Foam Insulation Installation', c:null, u:'by_spray_foam', h:'Select closed-cell thickness'},
  {n:'Air Sealing (Attic)', c:0, u:'per_unit', h:'$0 EM cost — charged revenue is pure profit'},
  {n:'Air Sealing (crawl space)', c:0, u:'per_unit', h:'$0 EM cost — charged revenue is pure profit'},
  {n:'Baffles Installation', c:50, u:'flat_cost', h:'Flat cost $50'},
  {n:'Boots Insulation Installation', c:15, u:'per_unit', h:'$15 each'},
  {n:'Boots Air Sealing', c:0, u:'variable', h:'$0 EM cost by default — charged revenue is pure profit unless overridden'},
  // VAPOR BARRIER / CRAWL SPACE
  {n:'Vapor Barrier Installation', c:null, u:'by_vapor_barrier', h:'Select 10mil, 12mil, or 20mil'},
  {n:'Vapor Barrier Installation - 10mil', c:0.9, u:'per_sqft', h:'Auto-calculates from QTY square footage'},
  {n:'Vapor Barrier Installation - 12mil', c:1.05, u:'per_sqft', h:'Auto-calculates from QTY square footage'},
  {n:'Vapor Barrier Installation - 20mil', c:1.3, u:'per_sqft', h:'Auto-calculates from QTY square footage'},
  {n:'Vapor Barrier Removal', c:350, u:'flat_cost', h:'Flat cost $350'},
  {n:'Crawl Space Clean Up', c:175, u:'flat_cost', h:'Always $175 flat cost'},
  {n:'Crawl Space Door Replacement', c:340, u:'per_unit', h:'$340 each'},
  {n:'Crawl Space Restoration', c:1000, u:'flat_cost', h:'Flat cost $1,000'},
  {n:'Crawl Space Encapsulation', c:1400, u:'flat_cost', h:'Flat cost $1,400'},
  {n:'French Drain Installation', c:null, u:'by_drain_length', h:'Select drain length'},
  {n:'Sump Pump Installation', c:2000, u:'per_unit', h:'$2,000 each'},
  {n:'Trenching', c:10, u:'per_lnft', h:'Auto-calculates from QTY linear footage'},
  // ASBESTOS
  {n:'Asbestos Abatement', c:null, u:'by_asbestos_tier', h:'Select boot count tier'},
  {n:'Asbestos Air Ducts Abatement', c:null, u:'by_asbestos_air_ducts', h:'Select duct-count tier'},
  {n:'Asbestos Boots Abatement', c:875, u:'flat_cost', h:'Less than 7 boots — $875. Auto-set to $0 when asbestos duct abatement is also on this order (boot removal is included).'},
  {n:'Asbestos Encapsulation', c:40, u:'flat_cost', h:'Flat cost $40'},
  // DRYWALL / ACCESS
  {n:'Drywall Repair', c:3.25, u:'per_sqft', h:'Auto-calculates from QTY square footage'},
  {n:'Drywall Hatch Piece Replacement', c:25, u:'per_unit', h:'$25 each'},
  {n:'Sheet Rock Installation', c:9, u:'per_sqft', h:'Auto-calculates from QTY square footage'},
  {n:'Attic Access Hatch Creation', c:350, u:'per_unit', h:'$350 each'},
  {n:'Attic ladder installation (55" long)', c:800, u:'per_unit', h:'$800 each'},
  {n:'Attic ladder installation (35" long)', c:1700, u:'per_unit', h:'$1,700 each'},
  // ROOF / VENTILATION
  {n:'Creation of Roof Vents', c:112, u:'per_unit', h:'$112 each'},
  {n:'Roof Exhaust Vent Creation', c:250, u:'per_unit', h:'$250 each'},
  {n:'Attic Fan Installation (Roof Mounted)', c:500, u:'per_unit', h:'$500 each'},
  {n:'Attic Fan Installation', c:226, u:'per_unit', h:'$226 each, excludes power outlet'},
  {n:'Whole House Fan Installation', c:1200, u:'per_unit', h:'Base cost $1,200, override for size changes'},
  {n:'Gable Vent Installation', c:225, u:'per_unit', h:'$225 each'},
  {n:'Creation of New Vent (Register)', c:50, u:'per_unit', h:'$50 each'},
  {n:'Sloped Roof Installation', c:4, u:'per_sqft', h:'Auto-calculates from QTY square footage'},
  {n:'Flat Roof Installation', c:5, u:'per_sqft', h:'Auto-calculates from QTY square footage'},
  {n:'Roof Removal', c:1.5, u:'per_sqft', h:'Auto-calculates from QTY square footage'},
  {n:'Flat Roof Removal', c:2.5, u:'per_sqft', h:'Auto-calculates from QTY square footage'},
  {n:'Roof Repair', c:null, u:'variable', h:'Enter manually'},
  {n:'Gable Vent Screen Replacement', c:0, u:'variable', h:'$0 EM cost by default — charged revenue is pure profit unless overridden'},
  // CLEANING
  {n:'Dryer Vent Deep Cleaning', c:50, u:'per_unit', h:'$50 each'},
  {n:'Vents Cleaning', c:50, u:'flat_cost', h:'Flat cost $50'},
  // RODENT / MOLD / OTHER
  {n:'Rodent Proofing (Attic)', c:60, u:'rodent_flat', h:'$60 EM cost flat total — regardless of how many RP lines on the order'},
  {n:'Rodent Proofing (Crawl Space)', c:60, u:'rodent_flat', h:'$60 EM cost flat total — regardless of how many RP lines on the order'},
  {n:'Rodent Proofing (Garage)', c:60, u:'rodent_flat', h:'$60 EM cost flat total — regardless of how many RP lines on the order'},
  {n:'Internal Rodent Exclusion', c:60, u:'rodent_flat', h:'$60 EM cost flat total — regardless of how many RP lines on the order'},
  {n:'Internal Rodent Proofing - Attic', c:60, u:'rodent_flat', h:'$60 EM cost flat total — regardless of how many RP lines on the order'},
  {n:'Rodent Exclusion', c:60, u:'rodent_flat', h:'$60 EM cost flat total — regardless of how many RP lines on the order'},
  {n:'Rodent Traps Placement', c:25, u:'flat_cost', h:'Flat cost $25'},
  {n:'Fungus & Mold Prevention', c:50, u:'flat_cost', h:'Flat cost $50'},
  {n:'Mold Treatment', c:800, u:'flat_cost', h:'Flat cost $800'},
  {n:'Mold Treatment - Crawl Space', c:800, u:'flat_cost', h:'Flat cost $800'},
  {n:'Sanitizing & Disinfecting (Attic)', c:0, u:'variable', h:'$0 EM cost — charged revenue is pure profit'},
  {n:'Sanitizing & Disinfecting (Crawl Space)', c:0, u:'variable', h:'$0 EM cost — charged revenue is pure profit'},
  {n:'Termite Treatment', c:50, u:'variable', h:'Base cost $50, override if needed'},
  {n:'Plywood Installation', c:5, u:'per_sqft', h:'Auto-calculates from QTY square footage'},
  {n:'Plywood Removal', c:0.5, u:'per_sqft', h:'Auto-calculates from QTY square footage'},
  {n:'Attic Clean Up', c:175, u:'variable', h:'Base cost $175, override to $0 EM cost when insulation is removed on the same order'},
  {n:'Garage Attic Clean Up', c:175, u:'flat_cost', h:'EM cost drops to $0 with attic insulation replacement on the same order'},
  {n:'Mesh Installation Above Gap Between Walls', c:0, u:'variable', h:'$0 EM cost by default — charged revenue is pure profit unless overridden'},
  {n:'Noise Reducer', c:null, u:'variable', h:'Enter manually'},
  {n:'Kitchen Remodel', c:null, u:'variable', h:'Enter manually'},
  {n:'Plumbing Repair', c:null, u:'variable', h:'Enter manually'},
  {n:'Misc. Services', c:null, u:'variable', h:'Enter manually'},
  {n:'Handyman', c:null, u:'variable', h:'Enter manually'},
  {n:'Service Call', c:null, u:'variable', h:'Enter manually'},
  {n:'Package Price', c:0, u:'no_cost', h:'Revenue adjustment — reduces profit dollar-for-dollar'},
  // WATER HEATER / PLUMBING
  {n:'Gas Water Heater Replacement', c:1500, u:'per_unit', h:'$1,500 each'},
  {n:'Tankless Water Heater Installation', c:3700, u:'variable', h:'Base cost $3,700, add permit if needed'},
  {n:'Water Heater Heat Pump Replacement', c:4300, u:'variable', h:'Base cost $4,300, add permit if needed'},
  // GUTTERS
  {n:'Gutters Service', c:350, u:'per_unit', h:'Up to 120 linear ft'},
  {n:'Gutter Cleaning and Guards Installation', c:5, u:'per_lnft', h:'Auto-calculates from QTY linear footage'},
  // ADMIN / MISC
  {n:'Permit Administration', c:0, u:'variable', h:'$0 EM cost by default — charged revenue is pure profit unless overridden'},
  {n:'City Permit Fee', c:null, u:'none', h:'Pass-through, excluded from EM cost'},
  {n:'Discount', c:0, u:'no_cost', h:'Pure cost line — reduces profit dollar-for-dollar'},
  {n:'Tax', c:null, u:'none', h:'Pass-through'},
  {n:'Title 24 Certificate', c:null, u:'by_title24', h:'Select HERS test or exemption'},
  {n:'Title 24 Certificate (hers test)', c:350, u:'flat_cost', h:'Flat cost $350'},
  {n:'Title 24 Certificate (exemption)', c:150, u:'flat_cost', h:'Flat cost $150'},
  ];

  const SELECT_OPTS = {
  by_ac_tonnage: [
    ['— select model / tonnage —', ''],
    ['Payne PA5S  2 Ton',              6000],
    ['Payne PA5S  2.5 Ton',            6250],
    ['Payne PA5S  3 Ton',              6500],
    ['Payne PA5S  3.5 Ton',            6750],
    ['Payne PA5S  4 Ton',              7000],
    ['Payne PA5S  5 Ton',              7400],
    ['Carrier 1-stage  2 Ton',         6900],
    ['Carrier 1-stage  2.5 Ton',       7150],
    ['Carrier 1-stage  3 Ton',         7400],
    ['Carrier 1-stage  3.5 Ton',       7650],
    ['Carrier 1-stage  4 Ton',         7900],
    ['Carrier 1-stage  5 Ton',         8300],
    ['Carrier 37MURA (AC)  2 Ton',     8500],
    ['Carrier 37MURA (AC)  2.5 Ton',   8750],
    ['Carrier 37MURA (AC)  3 Ton',     9000],
    ['Carrier 37MURA (AC)  3.5 Ton',   9250],
    ['Carrier 37MURA (AC)  4 Ton',     9500],
    ['Carrier 37MURA (AC)  5 Ton',     10000],
    ['Amana (AC)  2 Ton',              7300],
    ['Amana (AC)  2.5 Ton',            7550],
    ['Amana (AC)  3 Ton',              7800],
    ['Amana (AC)  3.5 Ton',            8050],
    ['Amana (AC)  4 Ton',              8300],
    ['Amana (AC)  5 Ton',              8800],
  ],
  by_hp_tonnage: [
    ['— select model / tonnage —', ''],
    ['Payne  2 Ton',              9500],
    ['Payne  2.5 Ton',            9750],
    ['Payne  3 Ton',              10000],
    ['Payne  3.5 Ton',            10250],
    ['Payne  4 Ton',              10500],
    ['Payne  5 Ton',              11000],
    ['Carrier 37MURA  2 Ton',     11500],
    ['Carrier 37MURA  2.5 Ton',   11750],
    ['Carrier 37MURA  3 Ton',     12000],
    ['Carrier 37MURA  3.5 Ton',   12250],
    ['Carrier 37MURA  4 Ton',     12500],
    ['Carrier 37MURA  5 Ton',     13000],
    ['Amana (HP)  2 Ton',         10300],
    ['Amana (HP)  2.5 Ton',       10550],
    ['Amana (HP)  3 Ton',         10800],
    ['Amana (HP)  3.5 Ton',       11050],
    ['Amana (HP)  4 Ton',         11300],
    ['Amana (HP)  5 Ton',         11800],
  ],
  by_furnace_tonnage: [
    ['— select furnace mode / tonnage —', ''],
    ['Payne 80% 1-stage  2–2.5 Ton', 3000],
    ['Payne 95–96% 1-stage  2–2.5 Ton', 3600],
    ['Payne 80% 2-stage  2–2.5 Ton', 3500],
    ['Payne 95–96% 2-stage  2–2.5 Ton', 4100],
    ['Carrier 80% 1-stage  2–2.5 Ton', 3500],
    ['Carrier 95–96% 1-stage  2–2.5 Ton', 4100],
    ['Carrier 80% 2-stage  2–2.5 Ton', 4000],
    ['Carrier 95–96% 2-stage  2–2.5 Ton', 4600],
    ['Payne 80% 1-stage  3 Ton', 3200],
    ['Payne 95–96% 1-stage  3 Ton', 3800],
    ['Payne 80% 2-stage  3 Ton', 3700],
    ['Payne 95–96% 2-stage  3 Ton', 4300],
    ['Carrier 80% 1-stage  3 Ton', 3700],
    ['Carrier 95–96% 1-stage  3 Ton', 4300],
    ['Carrier 80% 2-stage  3 Ton', 4200],
    ['Carrier 95–96% 2-stage  3 Ton', 4800],
    ['Payne 80% 1-stage  3.5 Ton', 3400],
    ['Payne 95–96% 1-stage  3.5 Ton', 4000],
    ['Payne 80% 2-stage  3.5 Ton', 3900],
    ['Payne 95–96% 2-stage  3.5 Ton', 4500],
    ['Carrier 80% 1-stage  3.5 Ton', 3900],
    ['Carrier 95–96% 1-stage  3.5 Ton', 4500],
    ['Carrier 80% 2-stage  3.5 Ton', 4400],
    ['Carrier 95–96% 2-stage  3.5 Ton', 5000],
    ['Payne 80% 1-stage  4 Ton', 3700],
    ['Payne 95–96% 1-stage  4 Ton', 4300],
    ['Payne 80% 2-stage  4 Ton', 4200],
    ['Payne 95–96% 2-stage  4 Ton', 4800],
    ['Carrier 80% 1-stage  4 Ton', 4200],
    ['Carrier 95–96% 1-stage  4 Ton', 4800],
    ['Carrier 80% 2-stage  4 Ton', 4700],
    ['Carrier 95–96% 2-stage  4 Ton', 5300],
    ['Payne 80% 1-stage  5 Ton', 4000],
    ['Payne 95–96% 1-stage  5 Ton', 4600],
    ['Payne 80% 2-stage  5 Ton', 4500],
    ['Payne 95–96% 2-stage  5 Ton', 5100],
    ['Carrier 80% 1-stage  5 Ton', 4500],
    ['Carrier 95–96% 1-stage  5 Ton', 5100],
    ['Carrier 80% 2-stage  5 Ton', 5000],
    ['Carrier 95–96% 2-stage  5 Ton', 5600],
  ],
  by_minisplit_btu: [
    ['— select series / BTU —', ''],
    ['Daikin FTXV  7k BTU',   3100],
    ['Daikin FTXV  9k BTU',   3200],
    ['Daikin FTXV  12k BTU',  3300],
    ['Daikin FTXV  18k BTU',  4000],
    ['Daikin FTXV  24k BTU',  4500],
    ['Daikin 115V  9k BTU',   2800],
    ['Daikin 115V  12k BTU',  3000],
    ['Daikin RXC   9k BTU',   3400],
    ['Daikin RXC   12k BTU',  3600],
    ['Daikin RXC   18k BTU',  4200],
    ['Daikin RXC   24k BTU',  4800],
  ],
  by_drain_length: [
    ['— select length —', ''],
    ['10 ft', 1150],
    ['15 ft', 1400],
    ['25 ft', 2200],
  ],
  by_asbestos_tier: [
    ['— select tier —', ''],
    ['< 6 Boots',   875],
    ['7 – 9 Boots', 1100],
    ['10+ Boots',   1400],
  ],
  by_asbestos_air_ducts: [
    ['— select tier —', ''],
    ['< 6 Air Ducts', 1475],
    ['6 – 9 Air Ducts', 1650],
    ['10 – 12 Air Ducts', 1850],
  ],
  by_title24: [
    ['— select type —', ''],
    ['HERS test', 350],
    ['Exemption', 150],
  ],
  by_vapor_barrier: [
    ['— select barrier thickness —', ''],
    ['10mil', 0.9],
    ['12mil', 1.05],
    ['20mil', 1.3],
  ],
  by_attic_insulation_install: [
    ['— select insulation type / R-value —', ''],
    ['R-13 batts', 1.1],
    ['R-15 batts', 1.4],
    ['R-19 batts', 1.27],
    ['R-30 blown in', 1.4],
    ['R-38 blown in', 1.55],
    ['R-44 blown in', 1.65],
    ['R-49 blown in', 1.95],
    ['R-30 batts', 1.64],
    ['R-38 batts', 1.74],
    ['R-49 batts', 2.5],
  ],
  by_ceiling_insulation_install: [
    ['— select R-value —', ''],
    ['R-30 batts', 1.63],
    ['R-38 batts', 1.74],
  ],
  by_exposed_walls_insulation: [
    ['— select R-value —', ''],
    ['R-13', 1.27],
    ['R-15', 1.5],
    ['R-19', 1.37],
    ['R-21', 1.6],
  ],
  by_subfloor_insulation_install: [
    ['— select insulation type / R-value —', ''],
    ['R-30', 1.73],
    ['Batts R-19 24"', 1.37],
    ['Batts R-19 16"', 1.37],
  ],
  by_spray_foam: [
    ['— select closed-cell thickness —', ''],
    ['Closed Cell 2"', 3.5],
    ['Closed Cell 3"', 4.5],
    ['Closed Cell 4.5"', 6],
    ['Closed Cell 5.5"', 7],
  ],
  };

  // Default customer-charged amounts for lines whose EM cost is $0 or flat,
  // where "cost / (1 - margin)" doesn't produce a meaningful number.
  // Confirmed directly by Theo — not derived from EM cost.
  const CUSTOMER_DEFAULTS = {
    'Furnace Removal & Disposal': 450,
    'A/C Removal & Disposal': 450,
    'Air Sealing (Attic)': 150,
    'Air Sealing (crawl space)': 150,
    'Sanitizing & Disinfecting (Attic)': 100,
    'Sanitizing & Disinfecting (Crawl Space)': 100,
    'Attic Clean Up': 300,
    'Garage Attic Clean Up': 300,
  };
  const RODENT_CUSTOMER_DEFAULT = 100; // applies to any 'rodent_flat' unit line

  const FLAT_UNITS = new Set(['flat_cost']);
  const RODENT_UNITS = new Set(['rodent_flat']);
  const SQFT_UNITS = new Set(['per_sqft']);
  const SELECT_UNIT_TYPES = new Set(Object.keys(SELECT_OPTS));
  // Select-based catalog items whose chosen value is a per-unit/per-sqft
  // RATE that must be multiplied by qty (insulation, vapor barrier, HVAC
  // systems) vs. the ones whose value is already an absolute dollar amount
  // for the tier (asbestos tiers, Title 24, drain length) — ported from
  // em-quote-builder.html's SELECT_QTY_MULT.
  const SELECT_QTY_MULT = new Set(['by_ac_tonnage','by_hp_tonnage','by_furnace_tonnage','by_minisplit_btu','by_vapor_barrier','by_attic_insulation_install','by_ceiling_insulation_install','by_exposed_walls_insulation','by_subfloor_insulation_install','by_spray_foam']);

  function findEntry(name) {
    return DB_BASE.find(e => e.n === name) || null;
  }

  // Raw EM cost before any combo-rule adjustment.
  function baseCost(entryName, qty, selectLabel) {
    const e = findEntry(entryName);
    if (!e) return null;
    if (SELECT_UNIT_TYPES.has(e.u)) {
      const opts = SELECT_OPTS[e.u] || [];
      const opt = opts.find(([label]) => label === selectLabel);
      if (!opt || opt[1] === '') return null;
      return SELECT_QTY_MULT.has(e.u) ? opt[1] * (qty || 1) : opt[1];
    }
    if (e.c === null) return null; // variable/manual entry
    if (FLAT_UNITS.has(e.u) || RODENT_UNITS.has(e.u)) return e.c;
    if (e.u === 'none' || e.u === 'no_cost') return 0;
    return e.c * (qty || 1); // per_unit, per_sqft, per_lnft, per_vent
  }

  // Suggested customer price for a given EM cost at a target gross margin.
  // Gross margin convention (confirmed from em-quote-builder.html): margin = profit / revenue.
  // revenue = cost / (1 - marginPct). NOT cost * (1 + marginPct) — that would be markup, a different number.
  function suggestedPrice(cost, marginPct) {
    if (cost === null || cost === undefined) return null;
    const m = Math.min(Math.max(marginPct, 0), 0.95); // guard against /0 or negative
    if (cost === 0) return 0; // real $0-cost lines fall through to CUSTOMER_DEFAULTS instead
    return cost / (1 - m);
  }

  function defaultCustomerPrice(entryName, unit, cost, marginPct) {
    if (RODENT_UNITS.has(unit)) return RODENT_CUSTOMER_DEFAULT;
    if (Object.prototype.hasOwnProperty.call(CUSTOMER_DEFAULTS, entryName)) {
      return CUSTOMER_DEFAULTS[entryName];
    }
    if (cost === 0 || cost === null) return 0; // no confident default — rep sets manually
    return Math.round(suggestedPrice(cost, marginPct) * 100) / 100;
  }

  // Applies EM's cross-item bundling rules to a working list of quote line
  // items. Ported from em-quote-builder.html's postProcess(). Mutates and
  // returns the array; sets item.effectiveCost when a combo rule overrides
  // the standalone cost.
  function applyComboRules(items) {
    const rpItems = items.filter(i => i.unit === 'rodent_flat');
    rpItems.forEach((it, idx) => { it.effectiveCost = idx === 0 ? 60 : 0; });

    const hasDuctAbatement = items.some(i => i.name.toLowerCase().includes('asbestos air duct'));
    items.forEach(i => {
      if (i.name === 'Asbestos Boots Abatement' || i.name === 'Asbestos Abatement') {
        if (hasDuctAbatement) i.effectiveCost = 0;
      }
    });

    const atticInstall = items.find(i => /attic insulation install|attic insulation replac|attic insulation enhanc/i.test(i.name));
    const subfloorInstall = items.some(i => /subfloor insulation install/i.test(i.name));

    items.forEach(i => {
      if (/attic insulation removal/i.test(i.name)) {
        if (atticInstall) {
          const isBatts = /batt/i.test(atticInstall.selectLabel || atticInstall.name || '');
          const rate = isBatts ? 0.50 : 0.30;
          i.effectiveCost = rate * i.qty;
        }
      }
      if (/crawl space subfloor insulation removal/i.test(i.name)) {
        if (subfloorInstall) i.effectiveCost = 0.40 * i.qty;
      }
      if (/^(garage )?attic clean up$/i.test(i.name)) {
        if (atticInstall) i.effectiveCost = 0;
      }
    });

    return items;
  }

  function effectiveCost(item) {
    return item.effectiveCost !== undefined ? item.effectiveCost : item.baseCost;
  }

  return {
    DB_BASE, SELECT_OPTS, CUSTOMER_DEFAULTS, RODENT_CUSTOMER_DEFAULT,
    FLAT_UNITS, RODENT_UNITS, SQFT_UNITS, SELECT_UNIT_TYPES, SELECT_QTY_MULT,
    findEntry, baseCost, suggestedPrice, defaultCustomerPrice,
    applyComboRules, effectiveCost,
  };
})();
