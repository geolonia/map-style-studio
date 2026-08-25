export type EditingType = { 
  layerId: string; 
  field: FieldType | null; 
  value: string 
};

export type FieldType = 'filter' | 'paint' | 'layout';
