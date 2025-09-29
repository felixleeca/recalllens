#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { format } from 'date-fns';
import { fetchAllFDARecalls, getFDAStats } from './fda/fetcher';
import { RecallRecord } from '@recalllens/core';

const program = new Command();

program
  .name('recall-fetcher')
  .description('Fetch and normalize recall data from various sources')
  .version('0.1.0');

program
  .command('fetch')
  .description('Fetch recall data from specified sources')
  .option('-s, --sources <sources>', 'Comma-separated list of sources (fda,fsis,cpsc)', 'fda')
  .option('-o, --output <path>', 'Output directory', './public/data')
  .option('--chunk-size <size>', 'Maximum records per chunk file', '1000')
  .action(async (options) => {
    const sources = options.sources.split(',').map((s: string) => s.trim());
    const outputDir = path.resolve(options.output);
    const chunkSize = parseInt(options.chunkSize, 10);
    
    // Create output directory
    await fs.ensureDir(outputDir);
    
    // Create date-based subdirectory
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const dateDir = path.join(outputDir, dateStr);
    await fs.ensureDir(dateDir);
    
    console.log(`Fetching data for sources: ${sources.join(', ')}`);
    console.log(`Output directory: ${dateDir}`);
    
    const allRecalls: RecallRecord[] = [];
    
    // Fetch from each source
    for (const source of sources) {
      try {
        console.log(`\nFetching from ${source.toUpperCase()}...`);
        
        let recalls: RecallRecord[] = [];
        
        switch (source.toLowerCase()) {
          case 'fda':
            recalls = await fetchAllFDARecalls();
            break;
          case 'fsis':
            console.log('FSIS fetcher not implemented yet');
            break;
          case 'cpsc':
            console.log('CPSC fetcher not implemented yet');
            break;
          default:
            console.warn(`Unknown source: ${source}`);
            continue;
        }
        
        if (recalls.length > 0) {
          allRecalls.push(...recalls);
          
          // Write source-specific file
          const sourceFile = path.join(dateDir, `${source}.json`);
          await fs.writeJSON(sourceFile, recalls, { spaces: 2 });
          console.log(`Wrote ${recalls.length} ${source.toUpperCase()} recalls to ${sourceFile}`);
          
          // Write source-specific stats
          if (source === 'fda') {
            const stats = getFDAStats(recalls);
            const statsFile = path.join(dateDir, `${source}-stats.json`);
            await fs.writeJSON(statsFile, stats, { spaces: 2 });
            console.log(`Wrote ${source.toUpperCase()} stats to ${statsFile}`);
          }
        }
        
      } catch (error) {
        console.error(`Error fetching from ${source}:`, error);
      }
    }
    
    if (allRecalls.length > 0) {
      // Write merged file
      const mergedFile = path.join(dateDir, 'index.json');
      await fs.writeJSON(mergedFile, allRecalls, { spaces: 2 });
      console.log(`\nWrote ${allRecalls.length} total recalls to ${mergedFile}`);
      
      // Write chunked files if needed
      if (allRecalls.length > chunkSize) {
        const chunkDir = path.join(dateDir, 'chunks');
        await fs.ensureDir(chunkDir);
        
        for (let i = 0; i < allRecalls.length; i += chunkSize) {
          const chunk = allRecalls.slice(i, i + chunkSize);
          const chunkFile = path.join(chunkDir, `chunk-${Math.floor(i / chunkSize) + 1}.json`);
          await fs.writeJSON(chunkFile, chunk, { spaces: 2 });
        }
        
        console.log(`Wrote ${Math.ceil(allRecalls.length / chunkSize)} chunk files to ${chunkDir}`);
      }
      
      // Update latest symlink
      const latestFile = path.join(outputDir, 'latest.json');
      await fs.writeJSON(latestFile, {
        date: dateStr,
        total: allRecalls.length,
        sources: sources,
        files: {
          merged: `./${dateStr}/index.json`,
          chunks: allRecalls.length > chunkSize ? `./${dateStr}/chunks/` : undefined,
        },
      }, { spaces: 2 });
      
      console.log(`Updated latest.json with ${allRecalls.length} total recalls`);
    }
    
    console.log('\n✅ Data fetch completed!');
  });

program
  .command('validate')
  .description('Validate recall data files')
  .option('-f, --file <path>', 'Path to JSON file to validate')
  .option('-d, --directory <path>', 'Directory containing JSON files to validate')
  .action(async (options) => {
    if (options.file) {
      await validateFile(options.file);
    } else if (options.directory) {
      await validateDirectory(options.directory);
    } else {
      console.error('Please specify either --file or --directory');
      process.exit(1);
    }
  });

async function validateFile(filePath: string) {
  try {
    const data = await fs.readJSON(filePath);
    
    if (Array.isArray(data)) {
      console.log(`Validating ${data.length} records in ${filePath}...`);
      
      let validCount = 0;
      let invalidCount = 0;
      
      for (const record of data) {
        try {
          // Basic validation
          if (record.id && record.source && record.brand && record.product) {
            validCount++;
          } else {
            invalidCount++;
            console.warn('Invalid record:', record);
          }
        } catch (error) {
          invalidCount++;
          console.warn('Error validating record:', error);
        }
      }
      
      console.log(`✅ Valid: ${validCount}, ❌ Invalid: ${invalidCount}`);
    } else {
      console.error('File does not contain an array of records');
    }
  } catch (error) {
    console.error('Error reading file:', error);
  }
}

async function validateDirectory(dirPath: string) {
  try {
    const files = await fs.readdir(dirPath);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    console.log(`Found ${jsonFiles.length} JSON files in ${dirPath}`);
    
    for (const file of jsonFiles) {
      const filePath = path.join(dirPath, file);
      await validateFile(filePath);
    }
  } catch (error) {
    console.error('Error reading directory:', error);
  }
}

// Parse command line arguments
program.parse();
