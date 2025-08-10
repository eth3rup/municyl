
import dataServiceInstance from './dataService';
import { openDataApiService } from './openDataApiService';
import { storage } from './storage';

export const dataService = dataServiceInstance;
export const openData = openDataApiService;
export const cache = storage;
