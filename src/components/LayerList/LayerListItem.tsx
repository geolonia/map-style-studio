import React from 'react';
import { Flex, Tooltip, Button, Typography, Space } from 'antd';
import { EyeOutlined, DeleteOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import type { LayerSpecification } from 'maplibre-gl';
import LayerDetailAccordion from './LayerDetailAccordion';
import { useLayerVisibility } from '../../hooks/useLayerVisibility';
import { useAtomValue } from 'jotai';
import { mapAtom } from '../../atom';

const { Title, Text } = Typography;

type Props = {
  layer: LayerSpecification;
  editing: { layerId: string; field: 'filter' | 'paint' | 'layout' | null; value: string } | null;
  onEdit: (field: 'filter' | 'paint' | 'layout') => void;
  onResetStyle: (field: 'filter' | 'paint' | 'layout') => void;
  onDeleteLayer: (layerId: string) => void;
  onSave: (field: 'filter' | 'paint' | 'layout', value: string) => void;
  onCancel: () => void;
};

const LayerListItem: React.FC<Props> = ({ layer, editing, onEdit, onResetStyle, onDeleteLayer, onSave, onCancel }) => {
  const mapRef = useAtomValue(mapAtom);
  const { isVisible, toggleVisibility } = useLayerVisibility(mapRef, layer.id);

  return (
    <Space size='middle' direction="vertical" style={{ width: '100%', padding: '10px 0 0' }}>
      <Flex justify="space-between" align="center" gap={4}>
        <Title level={4} style={{ margin: 0 }}>{layer.id}</Title>
        <Flex justify="right" align="center" gap={2}>
          <Tooltip title={isVisible ? '非表示' : '表示'}>
            <Button
              type="default"
              shape="circle"
              icon={isVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={toggleVisibility}
            />
          </Tooltip>
          <Tooltip title="削除">
            <Button
              type="default"
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() => onDeleteLayer(layer.id)}
            />
          </Tooltip>
        </Flex>
      </Flex>
      <span>
        {'source' in layer && (
          <>
            <Text strong>source: </Text><Text code>{String(layer.source)}</Text>
          </>
        )}
        {('source-layer' in layer) && (
          <>
            {' / '}
            <Text strong>source-layer: </Text><Text code>{String(layer['source-layer'])}</Text>
          </>
        )}
      </span>
      <LayerDetailAccordion
        layer={layer}
        editing={editing}
        onEdit={onEdit}
        onResetStyle={onResetStyle}
        onSave={onSave}
        onCancel={onCancel}
      />
    </Space>
  )
};

export default React.memo(LayerListItem);
