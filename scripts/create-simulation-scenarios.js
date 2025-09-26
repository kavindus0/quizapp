#!/usr/bin/env node

/**
 * Script to create sample simulation scenarios in the database
 * Run this with: node scripts/create-simulation-scenarios.js
 */

async function createSampleSimulationScenarios() {
    try {
        // Import necessary modules
        const { execSync } = require('child_process');

        console.log('🚀 Creating sample simulation scenarios...');

        // Run the Convex mutation to create sample scenarios
        const result = execSync('npx convex run simulations:createSampleSimulationScenarios', {
            encoding: 'utf8',
            cwd: process.cwd()
        });

        console.log('✅ Sample scenarios created successfully!');
        console.log(result);

    } catch (error) {
        console.error('❌ Failed to create sample scenarios:');
        console.error(error.message);
        process.exit(1);
    }
}

// Check if we're being run directly
if (require.main === module) {
    createSampleSimulationScenarios();
}

module.exports = { createSampleSimulationScenarios };