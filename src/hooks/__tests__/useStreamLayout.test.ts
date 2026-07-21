// Tests for Live Stream Layout Hook
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStreamLayout } from '../useStreamLayout';

describe('useStreamLayout', () => {
  it('should calculate grid config for 1 participant', () => {
    const { result } = renderHook(() => useStreamLayout(1, 'grid'));
    expect(result.current.gridConfig).toEqual({
      columns: 1,
      rows: 1,
      maxParticipants: 1,
    });
  });

  it('should calculate grid config for 2 participants', () => {
    const { result } = renderHook(() => useStreamLayout(2, 'grid'));
    expect(result.current.gridConfig).toEqual({
      columns: 2,
      rows: 1,
      maxParticipants: 2,
    });
  });

  it('should calculate grid config for 4 participants', () => {
    const { result } = renderHook(() => useStreamLayout(4, 'grid'));
    expect(result.current.gridConfig).toEqual({
      columns: 2,
      rows: 2,
      maxParticipants: 4,
    });
  });

  it('should calculate grid config for 6 participants', () => {
    const { result } = renderHook(() => useStreamLayout(6, 'grid'));
    expect(result.current.gridConfig).toEqual({
      columns: 3,
      rows: 2,
      maxParticipants: 6,
    });
  });

  it('should calculate grid config for 9 participants', () => {
    const { result } = renderHook(() => useStreamLayout(9, 'grid'));
    expect(result.current.gridConfig).toEqual({
      columns: 3,
      rows: 3,
      maxParticipants: 9,
    });
  });

  it('should return grid template for grid layout', () => {
    const { result } = renderHook(() => useStreamLayout(4, 'grid'));
    const template = result.current.getGridTemplate();
    
    expect(template.display).toBe('grid');
    expect(template.gridTemplateColumns).toBe('repeat(2, 1fr)');
    expect(template.gridTemplateRows).toBe('repeat(2, 1fr)');
  });

  it('should return spotlight layout structure', () => {
    const { result } = renderHook(() => useStreamLayout(4, 'spotlight', 'user-1'));
    const spotlightLayout = result.current.getSpotlightLayout();
    
    expect(spotlightLayout.main.width).toBe('75%');
    expect(spotlightLayout.thumbnails.width).toBe('25%');
  });

  it('should indicate scroll needed for many participants in spotlight', () => {
    const { result } = renderHook(() => useStreamLayout(7, 'spotlight', 'user-1'));
    expect(result.current.needsScroll).toBe(true);
  });

  it('should not indicate scroll needed for few participants in spotlight', () => {
    const { result } = renderHook(() => useStreamLayout(3, 'spotlight', 'user-1'));
    expect(result.current.needsScroll).toBe(false);
  });
});
