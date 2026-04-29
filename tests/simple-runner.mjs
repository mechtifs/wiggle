#!/usr/bin/env node

// Simple test runner for the new effect classes
import { SpotlightEffect, LaserPointerEffect, TrailEffect, ArrowGuideEffect } from '../effect.js';

console.log('Testing new effect classes...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
        passed++;
    } catch (error) {
        console.log(`✖ ${name}`);
        console.log(`  ${error.message}`);
        failed++;
    }
}

// Test SpotlightEffect
console.log('SpotlightEffect tests:');
test('should initialize with default values', () => {
    const effect = new SpotlightEffect();
    if (effect.spotlightColor !== '#ffff00') throw new Error(`Expected #ffff00, got ${effect.spotlightColor}`);
    if (effect.spotlightSize !== 150) throw new Error(`Expected 150, got ${effect.spotlightSize}`);
    if (effect.spotlightOpacity !== 0.8) throw new Error(`Expected 0.8, got ${effect.spotlightOpacity}`);
});

test('should update spotlight color', () => {
    const effect = new SpotlightEffect();
    effect.spotlightColor = '#ff0000';
    if (effect.spotlightColor !== '#ff0000') throw new Error(`Expected #ff0000, got ${effect.spotlightColor}`);
});

test('should update spotlight size', () => {
    const effect = new SpotlightEffect();
    effect.spotlightSize = 200;
    if (effect.spotlightSize !== 200) throw new Error(`Expected 200, got ${effect.spotlightSize}`);
});

// Test LaserPointerEffect
console.log('\nLaserPointerEffect tests:');
test('should initialize with default values', () => {
    const effect = new LaserPointerEffect();
    if (effect.laserColor !== '#ff0000') throw new Error(`Expected #ff0000, got ${effect.laserColor}`);
    if (effect.laserThickness !== 4) throw new Error(`Expected 4, got ${effect.laserThickness}`);
    if (effect.laserLength !== 100) throw new Error(`Expected 100, got ${effect.laserLength}`);
});

test('should update laser color', () => {
    const effect = new LaserPointerEffect();
    effect.laserColor = '#00ff00';
    if (effect.laserColor !== '#00ff00') throw new Error(`Expected #00ff00, got ${effect.laserColor}`);
});

// Test TrailEffect
console.log('\nTrailEffect tests:');
test('should initialize with default values', () => {
    const effect = new TrailEffect();
    if (effect.trailColor !== '#00ff00') throw new Error(`Expected #00ff00, got ${effect.trailColor}`);
    if (effect.trailLength !== 15) throw new Error(`Expected 15, got ${effect.trailLength}`);
    if (effect.fadeDuration !== 2000) throw new Error(`Expected 2000, got ${effect.fadeDuration}`);
});

// Test ArrowGuideEffect
console.log('\nArrowGuideEffect tests:');
test('should initialize with default values', () => {
    const effect = new ArrowGuideEffect();
    if (effect.arrowColor !== '#00ffff') throw new Error(`Expected #00ffff, got ${effect.arrowColor}`);
    if (effect.arrowSize !== 30) throw new Error(`Expected 30, got ${effect.arrowSize}`);
});

console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log('='.repeat(50));