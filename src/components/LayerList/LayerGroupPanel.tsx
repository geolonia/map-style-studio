import React from 'react';
import { Collapse, Flex, Tooltip, Button, Typography, List } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import LayerListItem from './LayerListItem';
import type { LayerSpecification } from 'maplibre-gl';
import type { EditingType, FieldType } from './LayerList.types';

const { Text } = Typography;

type Props = {
    layerGroups: {
        type: string;
        label: string;
        layers: LayerSpecification[];
    }[];
    group: {
        type: string;
        label: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        layers: any[];
    };
    editing: EditingType | null;
    onEdit: (layerId: string, field: FieldType) => void;
    onResetStyle: (field: FieldType) => void;
    onDeleteLayer: (layerId: string) => void;
    onSave: (layerId: string, field: FieldType, value: string) => void;
    onCancel: () => void;
    onDeleteAllLayers: (groupType: string) => void;
    onAddLayer: (groupType: string) => void;
};

const LayerGroupPanel: React.FC<Props> = ({
  layerGroups,
  group,
  editing,
  onEdit,
  onResetStyle,
  onDeleteLayer,
  onSave,
  onCancel,
  onDeleteAllLayers,
  onAddLayer
}) => {
  const items = [
    {
      key: group.type,
      label: (
        <Flex justify="space-between" align="center" gap={4}>
          <Text strong>{group.label}</Text>
          <Flex justify="right" align="center" gap={4}>
            <Text strong>{`${group.layers ? group.layers.length : 0}件`}</Text>
            <Tooltip title="全レイヤー削除">
              <Button
                danger
                type="default"
                icon={<DeleteOutlined />}
                onClick={() => onDeleteAllLayers(group.type)}
              />
            </Tooltip>
            <Tooltip title="レイヤーを追加">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => onAddLayer(group.type)}
              />
            </Tooltip>
          </Flex>
        </Flex>
      ),
      children: (
        <List
          style={{ width: '100%', padding: 0 }}
          size="small"
          dataSource={group.layers}
          renderItem={item => (
            <List.Item style={{ width: '100%', padding: 0 }}>
              <LayerListItem
                layer={item}
                editing={editing}
                onEdit={field => onEdit(item.id, field)}
                onResetStyle={field => onResetStyle(field)}
                onDeleteLayer={() => onDeleteLayer(item.id)}
                onSave={(field, value) => onSave(item.id, field, value)}
                onCancel={onCancel}
              />
            </List.Item>
          )}
          locale={{ emptyText: null }}
        />
      )
    }
  ];

  return (
    <Collapse
      defaultActiveKey={layerGroups.map(g => g.type)}
      style={{ width: '100%', padding: 0 }}
      items={items}
    />
  );
};

export default LayerGroupPanel;
