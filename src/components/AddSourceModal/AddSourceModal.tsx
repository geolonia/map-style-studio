import React, { useState } from 'react';
import { Modal, Space, Select, Input, message, Typography } from 'antd';
import type { SourceSpecification } from 'maplibre-gl';
import { validateSourceId, validateUrl, validateTileUrl, validateZoomLevel } from '../../lib/validators';

const { Text } = Typography;

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

type ValidationErrors = {
  sourceId?: string;
  url?: string;
  tiles?: string;
  minzoom?: string;
  maxzoom?: string;
};

const AddSourceModal: React.FC<AddSourceModalProps> = ({ open, onOk, onCancel }) => {
  const [newSource, setNewSource] = useState(initialState);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleChange = (key: string, value: string | number | string[] | undefined) => {
    setNewSource(prev => ({
      ...prev,
      [key]: value,
    }));
    // 入力時にそのフィールドのエラーをクリア
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const handleOk = () => {
    const newErrors: ValidationErrors = {};

    if (!newSource.type) {
      message.error('typeを選択してください');
      return;
    }

    const sourceIdResult = validateSourceId(newSource.sourceId);
    if (!sourceIdResult.valid) {
      newErrors.sourceId = sourceIdResult.message;
    }

    // URL バリデーション
    if (newSource.url && newSource.type !== 'video') {
      const urlResult = validateUrl(newSource.url);
      if (!urlResult.valid) {
        newErrors.url = urlResult.message;
      }
    }

    // tiles バリデーション
    if (Array.isArray(newSource.tiles) && newSource.tiles.length > 0) {
      for (const tile of newSource.tiles) {
        const tileResult = validateTileUrl(tile);
        if (!tileResult.valid) {
          newErrors.tiles = tileResult.message;
          break;
        }
      }
    }

    // minzoom バリデーション
    const minzoomResult = validateZoomLevel(newSource.minzoom);
    if (!minzoomResult.valid) {
      newErrors.minzoom = minzoomResult.message;
    }

    // maxzoom バリデーション
    const maxzoomResult = validateZoomLevel(newSource.maxzoom);
    if (!maxzoomResult.valid) {
      newErrors.maxzoom = maxzoomResult.message;
    }

    // minzoom <= maxzoom チェック
    if (newSource.minzoom !== undefined && newSource.maxzoom !== undefined
      && !newErrors.minzoom && !newErrors.maxzoom
      && newSource.minzoom > newSource.maxzoom) {
      newErrors.minzoom = 'minzoomはmaxzoom以下にしてください';
    }

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }

    const { sourceId, ...sourceSpec } = newSource;
    onOk(sourceId, sourceSpec as SourceSpecification);
    setNewSource(initialState);
    setErrors({});
  };

  return (
    <Modal
      open={open}
      onOk={handleOk}
      onCancel={() => {
        setNewSource(initialState);
        setErrors({});
        onCancel();
      }}
      okText="追加"
      title="新しいソースを追加"
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <div>
          <Input
            addonBefore="source名"
            placeholder="source名を入力"
            value={newSource.sourceId}
            onChange={e => handleChange('sourceId', e.target.value)}
            status={errors.sourceId ? 'error' : undefined}
          />
          {errors.sourceId && <Text type="danger" style={{ fontSize: 12 }}>{errors.sourceId}</Text>}
        </div>
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
          <div>
            <Input
              addonBefore={newSource.type === 'geojson' ? "data" : "url"}
              placeholder={"url" + (newSource.type === 'geojson' ? "またはdataを指定" : "")}
              value={newSource.url ?? ''}
              onChange={e => handleChange('url', e.target.value)}
              status={errors.url ? 'error' : undefined}
            />
            {errors.url && <Text type="danger" style={{ fontSize: 12 }}>{errors.url}</Text>}
          </div>
        )}
        {(newSource.type !== 'geojson' && newSource.type !== 'image') && (
          <div>
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
              status={errors.tiles ? 'error' : undefined}
            />
            {errors.tiles && <Text type="danger" style={{ fontSize: 12 }}>{errors.tiles}</Text>}
          </div>
        )}
        <Input
          addonBefore="attribution"
          placeholder="attribution"
          value={newSource.attribution ?? ''}
          onChange={e => handleChange('attribution', e.target.value)}
        />
        <div>
          <Input
            addonBefore="minzoom"
            placeholder="minzoom (0〜24)"
            type="number"
            value={newSource.minzoom ?? ''}
            onChange={e => handleChange('minzoom', e.target.value === '' ? undefined : Number(e.target.value))}
            status={errors.minzoom ? 'error' : undefined}
          />
          {errors.minzoom && <Text type="danger" style={{ fontSize: 12 }}>{errors.minzoom}</Text>}
        </div>
        <div>
          <Input
            addonBefore="maxzoom"
            placeholder="maxzoom (0〜24)"
            type="number"
            value={newSource.maxzoom ?? ''}
            onChange={e => handleChange('maxzoom', e.target.value === '' ? undefined : Number(e.target.value))}
            status={errors.maxzoom ? 'error' : undefined}
          />
          {errors.maxzoom && <Text type="danger" style={{ fontSize: 12 }}>{errors.maxzoom}</Text>}
        </div>
      </Space>
    </Modal>
  );
};

export default AddSourceModal;
