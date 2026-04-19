import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../lib/constants';
import type { Settings, Status, SortMode, ViewMode } from '../types';

const DEFAULT_SETTINGS: Settings = {
  columnSortModes: {
    wishlist: 'smart',
    applied: 'smart',
    oa: 'smart',
    interview: 'smart',
    offer: 'smart',
    closed: 'smart',
  },
  view: 'kanban',
  customComparisonDimensions: ['发展空间', '工作强度', '团队氛围', '薪资水平'],
  onboarded: false,
};

export interface UseSettingsReturn {
  settings: Settings;
  setColumnSortMode: (status: Status, mode: SortMode) => void;
  setView: (view: ViewMode) => void;
  addComparisonDimension: (dim: string) => void;
  removeComparisonDimension: (dim: string) => void;
  setOnboarded: (v: boolean) => void;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useLocalStorage<Settings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS,
  );

  const setColumnSortMode = useCallback(
    (status: Status, mode: SortMode) => {
      setSettings((prev) => ({
        ...prev,
        columnSortModes: { ...prev.columnSortModes, [status]: mode },
      }));
    },
    [setSettings],
  );

  const setView = useCallback(
    (view: ViewMode) => {
      setSettings((prev) => ({ ...prev, view }));
    },
    [setSettings],
  );

  const addComparisonDimension = useCallback(
    (dim: string) => {
      setSettings((prev) => ({
        ...prev,
        customComparisonDimensions: prev.customComparisonDimensions.includes(dim)
          ? prev.customComparisonDimensions
          : [...prev.customComparisonDimensions, dim],
      }));
    },
    [setSettings],
  );

  const removeComparisonDimension = useCallback(
    (dim: string) => {
      setSettings((prev) => ({
        ...prev,
        customComparisonDimensions: prev.customComparisonDimensions.filter(
          (d) => d !== dim,
        ),
      }));
    },
    [setSettings],
  );

  const setOnboarded = useCallback(
    (v: boolean) => {
      setSettings((prev) => ({ ...prev, onboarded: v }));
    },
    [setSettings],
  );

  return {
    settings,
    setColumnSortMode,
    setView,
    addComparisonDimension,
    removeComparisonDimension,
    setOnboarded,
  };
}
