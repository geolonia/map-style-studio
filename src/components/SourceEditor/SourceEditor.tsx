import React, { useEffect, useMemo, useState } from 'react';
import { Input, Button, Space, Typography, Card, message, Modal, List, Flex, Select } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { useAtom } from 'jotai';
import { styleAtom } from '../../atom';
import type { LayerSpecification, SourceSpecification, StyleSpecification } from 'maplibre-gl';
import AddSourceModal from '../AddSourceModal/AddSourceModal';
import { validateUrl, validateTileUrl, validateZoomLevel } from '../../lib/validators';

type SourcesProps = {
  savePrevStyle: (newStyle: maplibregl.StyleSpecification | undefined) => void;
};

const { Title, Text } = Typography;

const SOURCE_TYPES = [
  { label: 'vector', value: 'vector' },
  { label: 'raster', value: 'raster' },
  { label: 'geojson', value: 'geojson' },
  { label: 'raster-dem', value: 'raster-dem' },
  { label: 'image', value: 'image' },
  { label: 'video', value: 'video' },
];

type SourceErrors = Record<string, { url?: string; tiles?: string; minzoom?: string; maxzoom?: string }>;

const SourceEditor: React.FC<SourcesProps> = ({ savePrevStyle }) => {
  const [style, setStyle] = useAtom(styleAtom);
  const [modalOpen, setModalOpen] = useState(false);
  const [addSourceModalOpen, setAddSourceModalOpen] = useState(false);
  const [targetSourceId, setTargetSourceId] = useState<string | null>(null);
  const [referencedLayers, setReferencedLayers] = useState<LayerSpecification[]>([]);
  const [editSources, setEditSources] = useState<Record<string, Partial<SourceSpecification & { url?: string, attribution?: string, tiles?: string[] }>>>({});
  const [sourceErrors, setSourceErrors] = useState<SourceErrors>({});

  // sourcesを取得
  const sources = useMemo(() => (typeof style === 'object' && style?.sources) ?? {}, [style]);

  // 編集用state初期化
  useEffect(() => {
    const initial: Record<string, Partial<SourceSpecification>> = {};
    Object.entries(sources).forEach(([id, src]) => {
      initial[id] = { ...src };
    });
    setEditSources(initial);
  }, [sources]);

  // 入力変更
  const handleChange = (sourceId: string, key: string, value: string | string[] | number | undefined) => {
    setEditSources(prev => ({
      ...prev,
      [sourceId]: { ...prev[sourceId], [key]: value }
    }));
    // 入力時にそのフィールドのエラーをクリア
    setSourceErrors(prev => ({
      ...prev,
      [sourceId]: { ...prev[sourceId], [key]: undefined }
    }));
  };

  // 保存
  const handleSave = () => {
    try {
      if (!style || typeof style !== 'object') {
        message.error('スタイルが正しく読み込まれていません');
        return;
      }

      // バリデーション
      const newErrors: SourceErrors = {};
      let hasError = false;
      Object.entries(editSources).forEach(([id, src]) => {
        const errs: SourceErrors[string] = {};
        // URL バリデーション
        if (src.url) {
          const urlResult = validateUrl(src.url);
          if (!urlResult.valid) { errs.url = urlResult.message; hasError = true; }
        }
        // tiles バリデーション
        if (src.tiles && Array.isArray(src.tiles)) {
          for (const tile of src.tiles) {
            const tileResult = validateTileUrl(tile);
            if (!tileResult.valid) { errs.tiles = tileResult.message; hasError = true; break; }
          }
        }
        // minzoom バリデーション
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const minzoom = (src as any).minzoom;
        const minzoomResult = validateZoomLevel(minzoom);
        if (!minzoomResult.valid) { errs.minzoom = minzoomResult.message; hasError = true; }
        // maxzoom バリデーション
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const maxzoom = (src as any).maxzoom;
        const maxzoomResult = validateZoomLevel(maxzoom);
        if (!maxzoomResult.valid) { errs.maxzoom = maxzoomResult.message; hasError = true; }
        // minzoom <= maxzoom
        if (minzoom !== undefined && maxzoom !== undefined && !errs.minzoom && !errs.maxzoom && minzoom > maxzoom) {
          errs.minzoom = 'minzoomはmaxzoom以下にしてください';
          hasError = true;
        }
        if (Object.keys(errs).length > 0) newErrors[id] = errs;
      });

      if (hasError) {
        setSourceErrors(newErrors);
        message.error('入力内容にエラーがあります');
        return;
      }

      const newSources: Record<string, SourceSpecification> = {};
      Object.entries(editSources).forEach(([id, src]) => {
        // type, url, attribution など必要な項目のみ
        const { type, url, attribution, ...rest } = src;
        newSources[id] = {
          ...(type ? { type } : {}),
          ...(url ? { url } : {}),
          ...(attribution ? { attribution } : {}),
          ...rest,
        } as SourceSpecification;
      });
      const newStyle = { ...style!, sources: newSources };
      savePrevStyle(style);
      setStyle(newStyle);
      setSourceErrors({});
      message.success('sourcesを保存しました');
    } catch {
      message.error('保存に失敗しました');
    }
  };

  // ソース削除
  const handleDelete = (sourceId: string) => {
    if (!style || typeof style !== 'object') {
      message.error('スタイルが正しく読み込まれていません');
      return;
    }
    // 参照しているlayerを検索
    const layers = (style?.layers ?? []).filter(layer => {
      if ('source' in layer) { return layer.source === sourceId; }
      return false;
    });
    if (layers.length > 0) {
      setTargetSourceId(sourceId);
      setReferencedLayers(layers);
      setModalOpen(true);
      return;
    }
    // 参照レイヤーがなければ即削除
    const newSources = { ...sources };
    delete newSources[sourceId];
    const newStyle = { ...style!, sources: newSources };
    savePrevStyle(style);
    setStyle(newStyle);
    message.success(`"${sourceId}" を削除しました`);
  };

  const handleAddModalOpen = () => {
    setAddSourceModalOpen(true);
  };

  const handleAddSource = (sourceId: string, newSource: SourceSpecification) => {
    if (sourceId === '') {
      message.error('ソース名を入力してください');
      return;
    }
    const newSources = {
      ...(typeof style === 'object' ? style.sources : {}),
      [sourceId]: newSource
    };
    const newStyle = {
      ...((!style || typeof style !== 'object' || Object.keys(style).length === 0) ? {
        version: 8,
        sources: {},
        layers: [],
      } : style),
      sources: newSources,
    };
    setEditSources(prev => ({
      ...prev,
      [sourceId]: { type: 'vector', url: '', attribution: '' }
    }));
    setStyle(newStyle as StyleSpecification);
    message.success(`新しいソース "${sourceId}" を追加しました`);

  };


  // モーダルで「一緒に削除」選択時
  const handleDeleteWithLayers = () => {
    if (!targetSourceId || !style || typeof style !== 'object') { return; }
    // source削除
    const newSources = { ...sources };
    delete newSources[targetSourceId];
    // 参照レイヤーも削除
    const newLayers = (style?.layers ?? []).filter(layer => !('source' in layer && layer.source === targetSourceId));
    const newStyle = { ...style!, sources: newSources, layers: newLayers };
    savePrevStyle(style);
    setStyle(newStyle);
    message.success(`"${targetSourceId}" と参照レイヤーを削除しました`);
    setModalOpen(false);
    setTargetSourceId(null);
    setReferencedLayers([]);
  };

  // モーダルでキャンセル
  const handleCancelModal = () => {
    setModalOpen(false);
    setTargetSourceId(null);
    setReferencedLayers([]);
  };

  return (
    <Card className='editor-card scroll-y' id='layer-editor' size='small'>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {sources && Object.keys(sources).length > 0 ? (
          Object.keys(sources).map((sourceId, index) => {
            const source = editSources[sourceId] || {};
            return (
              <Space key={index} size="small" direction="vertical" style={{ width: '100%' }}>
                <Flex justify='space-between' align='center' style={{ width: '100%' }}>
                  <Title level={4} className='margin-none'>{sourceId}</Title>
                  <Button
                    type="dashed"
                    shape="circle"
                    icon={<CloseOutlined />}
                    aria-label={`${sourceId}を削除`}
                    onClick={() => handleDelete(sourceId)}
                  />
                </Flex>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <div>
                    <label>type</label>
                    <Select
                      style={{ width: 120, marginLeft: 8 }}
                      value={source.type}
                      options={SOURCE_TYPES}
                      onChange={v => handleChange(sourceId, 'type', v)}
                      allowClear
                    />
                  </div>
                  {source.tiles && Array.isArray(source.tiles) && source.tiles.length > 0 ? (
                    <div>
                      <Input
                        addonBefore="tiles"
                        placeholder="tiles（カンマ区切り可）"
                        value={Array.isArray(source.tiles) ? source.tiles.join(',') : ''}
                        onChange={e =>
                          handleChange(
                            sourceId,
                            'tiles',
                            e.target.value
                              ? e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                              : undefined
                          )
                        }
                        status={sourceErrors[sourceId]?.tiles ? 'error' : undefined}
                      />
                      {sourceErrors[sourceId]?.tiles && <Text type="danger" style={{ fontSize: 12 }}>{sourceErrors[sourceId].tiles}</Text>}
                    </div>
                  ) : (
                    (!source.type || source.type !== 'geojson') && (
                      <div>
                        <Input
                          addonBefore="url"
                          placeholder="url"
                          value={(source as Partial<SourceSpecification & { url?: string }>).url ?? ''}
                          onChange={e => handleChange(sourceId, 'url', e.target.value)}
                          status={sourceErrors[sourceId]?.url ? 'error' : undefined}
                        />
                        {sourceErrors[sourceId]?.url && <Text type="danger" style={{ fontSize: 12 }}>{sourceErrors[sourceId].url}</Text>}
                      </div>
                    )
                  )
                  }
                  <Input
                    addonBefore="attribution"
                    placeholder="attribution"
                    value={source.attribution ?? ''}
                    onChange={e => handleChange(sourceId, 'attribution', e.target.value)}
                  />
                  <div>
                    <Input
                      addonBefore="minzoom"
                      placeholder="minzoom (0〜24)"
                      type="number"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      value={(source as any).minzoom ?? ''}
                      onChange={e => handleChange(sourceId, 'minzoom', e.target.value === '' ? undefined : Number(e.target.value))}
                      status={sourceErrors[sourceId]?.minzoom ? 'error' : undefined}
                    />
                    {sourceErrors[sourceId]?.minzoom && <Text type="danger" style={{ fontSize: 12 }}>{sourceErrors[sourceId].minzoom}</Text>}
                  </div>
                  <div>
                    <Input
                      addonBefore="maxzoom"
                      placeholder="maxzoom (0〜24)"
                      type="number"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      value={(source as any).maxzoom ?? ''}
                      onChange={e => handleChange(sourceId, 'maxzoom', e.target.value === '' ? undefined : Number(e.target.value))}
                      status={sourceErrors[sourceId]?.maxzoom ? 'error' : undefined}
                    />
                    {sourceErrors[sourceId]?.maxzoom && <Text type="danger" style={{ fontSize: 12 }}>{sourceErrors[sourceId].maxzoom}</Text>}
                  </div>
                </Space>
              </Space>
            );
          })
        ) : (
          <Text type="secondary">sourcesが定義されていません</Text>
        )}
        <Button type='primary' onClick={handleSave}>保存</Button>
        <Button
          type='default'
          icon={<PlusOutlined />}
          size='large'
          onClick={() => handleAddModalOpen()}
        >ソースを追加</Button>
      </Space>
      <AddSourceModal
        open={addSourceModalOpen}
        onOk={handleAddSource}
        onCancel={() => setAddSourceModalOpen(false)}
      />
      <Modal
        open={modalOpen}
        onOk={handleDeleteWithLayers}
        onCancel={handleCancelModal}
        okText="削除"
        cancelText="キャンセル"
        title="参照レイヤーも削除しますか？"
      >
        <p>
          削除するsourceを参照しているレイヤーがあります。<br />
          下記レイヤーも一緒に削除しますか？
        </p>
        <List
          size="small"
          bordered
          dataSource={referencedLayers}
          renderItem={layer => (
            <List.Item>
              <span>{layer.id}</span>
            </List.Item>
          )}
        />
      </Modal>
    </Card>
  );
};

export default SourceEditor;
