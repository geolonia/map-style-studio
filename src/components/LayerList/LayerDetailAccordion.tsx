import React, { useEffect, useState } from 'react';
import { Collapse, Flex, Tooltip, Button, Input, Typography } from 'antd';
import { EditOutlined, CheckOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import type { LayerSpecification } from 'maplibre-gl';
import { useColorfulJson } from '../../utils/renderColorfulJson';

const { Text } = Typography;

type Props = {
  layer: LayerSpecification;
  editing: { layerId: string; field: 'filter' | 'paint' | 'layout' | null; value: string } | null;
  onEdit: (field: 'filter' | 'paint' | 'layout') => void;
  onResetStyle: (field: 'filter' | 'paint' | 'layout') => void;
  onSave: (field: 'filter' | 'paint' | 'layout', value: string) => void;
  onCancel: () => void;
};

const LayerDetailAccordion: React.FC<Props> = ({ layer, editing, onEdit, onResetStyle, onSave, onCancel }) => {
  const [localValue, setLocalValue] = useState<string>('');
  const [localEditing, setLocalEditing] = useState<{ layerId: string; field: 'filter' | 'paint' | 'layout' | null } | null>(null);
  const [activeKey, setActiveKey] = useState<string[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonStr = JSON.stringify((layer as any)['paint'], null, 2) || '';
  const colorful = useColorfulJson(jsonStr);

  const handleSave = (e: React.MouseEvent<HTMLElement>, field: 'filter' | 'paint' | 'layout', localValue: string) => {
    e.stopPropagation();
    onSave(field, localValue);
  };

  const handleCancel = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    onCancel();
  };

  const handleEdit = (e: React.MouseEvent<HTMLElement>, field: 'filter' | 'paint' | 'layout') => {
    e.stopPropagation();
    onEdit(field);
    setActiveKey(prev => prev.includes(field) ? prev : [...prev, field]);
  };

  const handleReset = (e: React.MouseEvent<HTMLElement>, field: 'filter' | 'paint' | 'layout') => {
    e.stopPropagation();
    onResetStyle(field);
  };


  /* --- useEffect --- */

  useEffect(() => {
    setLocalEditing(editing);
  }, [editing]);

  useEffect(() => {
    if (localEditing?.layerId === layer.id && localEditing?.field) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setLocalValue(JSON.stringify((layer as any)[localEditing.field], null, 2) || '');
    }
    // eslint-disable-next-line
  }, [localEditing?.layerId, localEditing?.field]);

  /* --- useEffect --- */


  const items = (['filter', 'paint', 'layout'] as const).map(field => ({
    key: field,
    label: (
      <Flex justify="space-between" align="center">
        <Text strong>{field}</Text>
        <Flex justify="right" align="center" gap={2}>
          {localEditing?.layerId === layer.id && localEditing?.field === field ? (
            <>
              <Tooltip title="保存">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CheckOutlined />}
                  onClick={(e) => handleSave(e, field, localValue)}
                />
              </Tooltip>
              <Tooltip title="キャンセル">
                <Button
                  type="default"
                  shape="circle"
                  icon={<CloseOutlined />}
                  onClick={handleCancel}
                />
              </Tooltip>
            </>
          ) : (
            <Tooltip title="編集">
              <Button
                type="default"
                shape="circle"
                icon={<EditOutlined />}
                onClick={(e) => handleEdit(e, field)}
              />
            </Tooltip>
          )}
          <Tooltip title="リセット">
            <Button
              type="default"
              shape="circle"
              icon={<ReloadOutlined />}
              onClick={(e) => handleReset(e, field)}
            />
          </Tooltip>
        </Flex>
      </Flex>
    ),
    children: localEditing?.layerId === layer.id && localEditing?.field === field ? (
      <Input.TextArea
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        autoSize={{ minRows: 4 }}
        style={{ backgroundColor: '#fbfbfb' }}
      />
    ) : (
      <pre style={{ whiteSpace: 'pre-wrap' }}>
        {
          field === 'paint'
            ? colorful
            : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              JSON.stringify((layer as any)[field], null, 2)
            )
        }
      </pre>
    )
  }));

  return (
    <Collapse
      ghost
      size="small"
      style={{ width: '100%', padding: 0 }}
      items={items}
      activeKey={activeKey}
      onChange={keys => setActiveKey(Array.isArray(keys) ? keys : [keys])}
    />
  );
};

export default React.memo(LayerDetailAccordion);
