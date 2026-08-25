import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import type { StyleSpecification } from 'maplibre-gl';

import BrightnessSaturationTabContent from '../../src/components/ColorChanger/BrightnessSaturationTabContent';
import { styleAtom } from '../../src/atom';
import { applyAppearanceAdjustments } from '../../src/utils/colorAdjustUtils';

const baseStyle = (): StyleSpecification => ({
  version: 8,
  sources: {},
  layers: [{ id: 'fill-layer', type: 'fill', paint: { 'fill-color': '#806040' } }],
}) as StyleSpecification;

const fillColor = (style: unknown) =>
  (style as StyleSpecification)?.layers?.[0]?.paint?.['fill-color'];

const setup = (initialStyle?: StyleSpecification) => {
  const store = createStore();
  if (initialStyle) { store.set(styleAtom, initialStyle); }
  const savePrevStyle = jest.fn();

  render(
    <Provider store={store}>
      <BrightnessSaturationTabContent savePrevStyle={savePrevStyle} />
    </Provider>,
  );

  const brightnessSlider = screen.getAllByRole('slider')[0];
  const nudge = (times: number) => {
    for (let i = 0; i < times; i++) {
      fireEvent.keyDown(brightnessSlider, { key: 'ArrowRight', keyCode: 39 });
    }
  };

  return { store, savePrevStyle, nudge };
};

describe('BrightnessSaturationTabContent', () => {
  it('マウントしただけではスタイルも Undo 履歴も書き換えないこと', () => {
    const { store, savePrevStyle } = setup(baseStyle());
    expect(fillColor(store.get(styleAtom))).toBe('#806040');
    expect(savePrevStyle).not.toHaveBeenCalled();
  });

  it('スライダーを動かすと基準スタイルから調整した色になること', () => {
    const { store, nudge } = setup(baseStyle());
    nudge(1);
    expect(fillColor(store.get(styleAtom)))
      .toBe(fillColor(applyAppearanceAdjustments(baseStyle(), 1, 0)));
  });

  it('続けて動かしても調整が累積しないこと', () => {
    const { store, nudge } = setup(baseStyle());
    nudge(1);
    nudge(1);
    expect(fillColor(store.get(styleAtom)))
      .toBe(fillColor(applyAppearanceAdjustments(baseStyle(), 2, 0)));
  });

  it('style が後から設定された場合でも調整できること', () => {
    const { store, nudge } = setup();
    act(() => {
      store.set(styleAtom, baseStyle());
    });
    nudge(1);
    expect(fillColor(store.get(styleAtom)))
      .toBe(fillColor(applyAppearanceAdjustments(baseStyle(), 1, 0)));
  });

  it('外部からスタイルが差し替わったら、それを新しい基準として調整すること', () => {
    const { store, nudge } = setup(baseStyle());
    nudge(1);

    const replaced = {
      ...baseStyle(),
      layers: [{ id: 'fill-layer', type: 'fill', paint: { 'fill-color': '#204060' } }],
    } as StyleSpecification;
    act(() => {
      store.set(styleAtom, replaced);
    });

    nudge(1);
    expect(fillColor(store.get(styleAtom)))
      .toBe(fillColor(applyAppearanceAdjustments(replaced, 1, 0)));
  });
});
