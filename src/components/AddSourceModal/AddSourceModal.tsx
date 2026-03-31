import React, { useState } from 'react';
import { Modal, Space, Select, Input, message, Button, Tag, Spin, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { SourceSpecification } from 'maplibre-gl';
import { useSourceLayers } from '../../hooks/useSourceLayers';

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

const { Text } = Typography;

const AddSourceModal: React.FC<AddSourceModalProps> = ({ open, onOk, onCancel }) => {
  const [newSource, setNewSource] = useState(initialState);
  const { layers: sourceLayers, loading: sourceLayersLoading, error: sourceLayersError, fetchLayers } = useSourceLayers(newSource.url);

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

  const showUrlField = newSource.type !== 'video';
  const showTilesField = newSource.type !== 'geojson' && newSource.type !== 'image';
  const isVectorType = newSource.type === 'vector';
  const hasUrl = newSource.url.trim().length > 0;

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
        {showUrlField && (
          <Space.Compact style={{ width: '100%' }}>
            <Input
              addonBefore={newSource.type === 'geojson' ? "data" : "url"}
              placeholder={"url" + (newSource.type === 'geojson' ? "またはdataを指定" : "")}
              value={newSource.url ?? ''}
              onChange={e => handleChange('url', e.target.value)}
            />
            {isVectorType && (
              <Button
                type="primary"
                icon={<SearchOutlined />}
                loading={sourceLayersLoading}
                disabled={!hasUrl}
                onClick={fetchLayers}
                aria-label="source-layerを取得"
              >
                取得
              </Button>
            )}
          </Space.Compact>
        )}
        {isVectorType && sourceLayers.length > 0 && (
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              取得された source-layer ({sourceLayers.length}件):
            </Text>
            <div style={{ marginTop: 4 }}>
              {sourceLayers.map(layer => (
                <Tag key={layer} color="blue" style={{ marginBottom: 4 }}>
                  {layer}
                </Tag>
              ))}
            </div>
          </div>
        )}
        {isVectorType && sourceLayersLoading && (
          <Spin size="small" />
        )}
        {isVectorType && sourceLayersError && (
          <Text type="danger" style={{ fontSize: 12 }}>
            {sourceLayersError}
          </Text>
        )}
        {showTilesField && (
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
