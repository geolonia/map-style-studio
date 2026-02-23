import React, { useState } from 'react';
import { Button, Flex, Form, Typography } from 'antd';
import './StyleEditor.css';
import MapCanvas from '../MapCanvas/MapCanvas';
import { useAtom } from 'jotai';
import { styleAtom } from '../../atom';
import FileImporter from '../FileImporter/FileImporter';
import { FileOutlined } from '@ant-design/icons';
import sampleStyle from '../../assets/sample-style.json';
import type { StyleSpecification } from 'maplibre-gl';
import StyleUrlLoader from '../StyleUrlLoader/StyleUrlLoader';
import AddLayerModal from '../AddLayerModal/AddLayerModal';
import FloatingToolbar from '../FloatingToolbar/FloatingToolbar';
import FloatingLayerPanel from '../FloatingLayerPanel/FloatingLayerPanel';

const { Text } = Typography;

const StyleEditor: React.FC = () => {
  const [style, setStyle] = useAtom(styleAtom);
  const prevStyleRef = React.useRef<typeof style | null>(null);

  const [loadError, setLoadError] = useState(false);

  const [addLayerModalOpen, setAddLayerModalOpen] = useState(false);
  const [addLayerGroupType, setAddLayerGroupType] = useState<string | null>(null);
  const [addLayerForm] = Form.useForm();

  const handleAddLayer = (groupType: string) => {
    setAddLayerGroupType(groupType);
    setAddLayerModalOpen(true);
    addLayerForm.resetFields();
  };

  const handleAddLayerOk = () => {
    addLayerForm.validateFields().then(values => {
      if (!style || typeof style === 'string') { return; }
      const newLayer = {
        id: values.id,
        type: addLayerGroupType,
        source: values.source,
        'source-layer': values.sourceLayer,
        layout: values.layout ? JSON.parse(values.layout) : {},
        filter: values.filter ? JSON.parse(values.filter) : undefined,
        paint: values.paint ? JSON.parse(values.paint) : {},
      };
      const newStyle = {
        ...style,
        layers: [...(style?.layers ?? []), newLayer]
      };
      setStyle(newStyle as StyleSpecification);
      setAddLayerModalOpen(false);
    });
  };

  const handleAddLayerCancel = () => {
    setAddLayerModalOpen(false);
  };

  const handleChangeStyle = () => {
    if (style && typeof style !== 'string') {
      setStyle(undefined);
      prevStyleRef.current = null;
    }
    setLoadError(false);
  };

  const savePrevStyle = (newStyle: typeof style) => {
    prevStyleRef.current = newStyle ? JSON.parse(JSON.stringify(newStyle)) : null;
  };

  const handleDownloadStyleJson = () => {
    if (!style) { return; }
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const defaultFileName = `style_${yyyy}${mm}${dd}.json`;

    const fileName = window.prompt('保存するファイル名を入力してください', defaultFileName);
    if (!fileName) { return; }

    const blob = new Blob([JSON.stringify(style, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenSampleStyle = () => {
    setStyle(sampleStyle as unknown as StyleSpecification);
    setLoadError(false);
  };

  return (
    <div className="app-root">
      {style ? (
        <>
          <div className="map-fullscreen" data-testid="map">
            <MapCanvas />
          </div>
          <div className="overlay-container">
            <FloatingToolbar
              hasStyle={true}
              onChangeStyle={handleChangeStyle}
              onDownload={handleDownloadStyleJson}
            />
            <FloatingLayerPanel
              savePrevStyle={savePrevStyle}
              addLayer={handleAddLayer}
            />
          </div>
        </>
      ) : (
        <div className="welcome-screen">
          <Flex
            vertical
            justify="center"
            align="center"
            gap={20}
            style={{ textAlign: 'center', padding: '20px' }}
          >
            <span className="app-title">map style studio</span>
            {loadError && (
              <Text type="danger" strong>スタイルの読み込みに失敗しました</Text>
            )}
            <Button
              type="default"
              size="large"
              icon={<FileOutlined />}
              onClick={handleOpenSampleStyle}
            >
              サンプルスタイルを開く
            </Button>
            <Text style={{ color: 'rgba(255,255,255,0.45)' }}>OR</Text>
            <StyleUrlLoader setLoadError={setLoadError} />
            <Text style={{ color: 'rgba(255,255,255,0.45)' }}>OR</Text>
            <FileImporter setLoadError={setLoadError} />
          </Flex>
        </div>
      )}
      <AddLayerModal
        open={addLayerModalOpen}
        onOk={handleAddLayerOk}
        onCancel={handleAddLayerCancel}
        form={addLayerForm}
        layers={style && typeof style !== 'string' ? style?.layers : []}
      />
    </div>
  );
};

export default StyleEditor;
