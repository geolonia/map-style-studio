import { type StyleSpecification } from 'maplibre-gl';

export function useCreateEmptyStyle() {

  return {
    emptyStyle: {
       version: 8,
       name: 'New Style',
       sources: {},
       layers: [],
       sprite: '',
       glyphs: ''
    } as StyleSpecification
  };
}
