import React from 'react';
import { Modal, Form, Input, Select, type FormInstance } from 'antd';
import type { LayerSpecification } from 'maplibre-gl';

type AddLayerModalProps = {
  open: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: FormInstance<any>;
  onOk: () => void;
  onCancel: () => void;
  layers: LayerSpecification[];
};

const AddLayerModal: React.FC<AddLayerModalProps> = ({
  open,
  form,
  onOk,
  onCancel,
  layers,
}) => (
  <Modal
    open={open}
    title="新規レイヤーを追加"
    onOk={onOk}
    onCancel={onCancel}
    okText="追加"
    cancelText="キャンセル"
  >
    <Form form={form} layout="vertical">
      <Form.Item
        label="既存レイヤーからコピー"
        name="copyLayerId"
        tooltip="既存レイヤーを選択すると、その内容をコピーして編集できます"
      >
        <Select
          allowClear
          placeholder="コピー元レイヤーを選択"
          onChange={layerId => {
            const layer = layers.find(l => l.id === layerId);
            if (layer) {
              console.log('コピーするレイヤー:', (layer as { 'source-layer': string })['source-layer']);
              // コピー内容をフォームにセット
              form.setFieldsValue({
                id: `${layer.id}_copy`,
                source: 'source' in layer ? (layer as { source: string }).source : '',
                sourceLayer: (layer as { 'source-layer': string })['source-layer'] ?? '',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                filter: 'filter' in layer && (layer as any).filter ? JSON.stringify((layer as any).filter, null, 2) : '',
                paint: layer.paint ? JSON.stringify(layer.paint, null, 2) : '',
                layout: layer.layout ? JSON.stringify(layer.layout, null, 2) : '',
              });
            }
          }}
        >
          {layers && layers.map(layer => (
            <Select.Option key={layer.id} value={layer.id}>
              {layer.id}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label="レイヤーID"
        name="id"
        rules={[{ required: true, message: 'レイヤーIDを入力してください' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="source"
        name="source"
        rules={[{ required: true, message: 'sourceを入力してください' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="source-layer"
        name="sourceLayer"
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="filter (JSON形式)"
        name="filter"
        tooltip='例: ["==", "class", "A"]'
      >
        <Input.TextArea rows={2} placeholder='["==", "class", "A"]' />
      </Form.Item>
      <Form.Item
        label="paint (JSON形式)"
        name="paint"
        tooltip='例: {"circle-color": "#ff0000"}'
      >
        <Input.TextArea rows={2} placeholder='{"circle-color": "#ff0000"}' />
      </Form.Item>
      <Form.Item
        label="layout (JSON形式)"
        name="layout"
        tooltip='例: {"icon-image": "my-icon"}'
      >
        <Input.TextArea rows={2} placeholder='{"icon-image": "my-icon"}' />
      </Form.Item>
    </Form>
  </Modal>
);

export default AddLayerModal;
