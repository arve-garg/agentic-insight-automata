import Papa from 'papaparse';
import { DatasetRow, LoaderResult } from './types';

export async function runDataLoaderAgent(file: File): Promise<LoaderResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete(results) {
        const rawData = results.data as DatasetRow[];
        if (!rawData.length) {
          reject(new Error('Dataset is empty or invalid.'));
          return;
        }
        const headers = Object.keys(rawData[0]);
        resolve({
          rawData,
          headers,
          rowCount: rawData.length,
          columnCount: headers.length,
        });
      },
      error(err) {
        reject(new Error(`CSV parsing failed: ${err.message}`));
      },
    });
  });
}
