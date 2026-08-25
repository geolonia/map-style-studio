import React, { useState } from 'react';
import { Modal, Space, Select, Input, message } from 'antd';
import type { SourceSpecification } from 'maplibre-gl';

const SOURCE_TYPES = [
  { label: 'vector', value: 'vector' },
  { label: 'raster', value: 'raster' },
  { label: 'geojson', value: 'geojson' },
  { label: 'raster-dem', value: 'raster-dem' },
  { label: 'image', value: 'image' },
  { label: 'video', value: 'video' },
];

type AddSourceModalProps = {
  open: boolean;
  onOk: (sourceId: string, newSource: SourceSpecification) => void;
  onCancel: () => void;
};

const initialState = {
  sourceId: '',
  type: 'vector',
  url: '',
  attribution: '',
  tiles: [],
  minzoom: undefined,
  maxzoom: undefined,
};

const AddSourceModal: React.FC<AddSourceModalProps> = ({ open, onOk, onCancel }) => {
  const [newSource, setNewSource] = useState(initialState);

  const handleChange = (key: string, value: string | number | string[] | undefined) => {
    setNewSource(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleOk = () => {
    if (!newSource.type) {
      message.error('typeを選択してください');
      return;
    }
    if (!newSource.sourceId || newSource.sourceId.trim() === '') {
      message.error('source名を入力してください');
      return;
    }
    const { sourceId, ...sourceSpec } = newSource;
    console.log('追加するソース:', sourceId, sourceSpec, newSource);
    onOk(sourceId, sourceSpec as SourceSpecification);
    setNewSource(initialState);
  };

  return (
    <Modal
      open={open}
      onOk={handleOk}
      onCancel={() => {
        setNewSource(initialState);
        onCancel();
      }}
      okText="追加"
      title="新しいソースを追加"
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Input
          addonBefore="source名"
          placeholder="source名を入力"
          value={newSource.sourceId}
          onChange={e => handleChange('sourceId', e.target.value)}
        />
        <div>
          <label>type</label>
          <Select
            style={{ width: 120, marginLeft: 8 }}
            value={newSource.type}
            options={SOURCE_TYPES}
            onChange={v => handleChange('type', v)}
            allowClear
          />
        </div>
        {(newSource.type !== 'video') && (
          <Input
            addonBefore={newSource.type === 'geojson' ? "data" : "url"}
            placeholder={"url" + (newSource.type === 'geojson' ? "またはdataを指定" : "")}
            value={newSource.url ?? ''}
            onChange={e => handleChange('url', e.target.value)}
          />
        )}
        {(newSource.type !== 'geojson' && newSource.type !== 'image') && (
          <Input
            addonBefore={newSource.type === 'video' ? "urls" : "tiles"}
            placeholder="カンマ区切りで複数指定"
            value={Array.isArray(newSource.tiles) ? newSource.tiles.join(',') : ''}
            onChange={e =>
              handleChange(
                'tiles',
                e.target.value
                  ? e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
                  : []
              )
            }
          />
        )}
        <Input
          addonBefore="attribution"
          placeholder="attribution"
          value={newSource.attribution ?? ''}
          onChange={e => handleChange('attribution', e.target.value)}
        />
        <Input
          addonBefore="minzoom"
          placeholder="minzoom"
          type="number"
          value={newSource.minzoom ?? ''}
          onChange={e => handleChange('minzoom', e.target.value === '' ? undefined : Number(e.target.value))}
        />
        <Input
          addonBefore="maxzoom"
          placeholder="maxzoom"
          type="number"
          value={newSource.maxzoom ?? ''}
          onChange={e => handleChange('maxzoom', e.target.value === '' ? undefined : Number(e.target.value))}
        />
      </Space>
    </Modal>
  );
};

export default AddSourceModal;
