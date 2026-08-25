import React, { useState } from 'react';
import { Button, Flex, Form, Layout, Typography } from 'antd';
import './StyleEditor.css';
import MapCanvas from '../MapCanvas/MapCanvas';
import Sidebar from '../Sidebar/Sidebar';
import { Header } from 'antd/es/layout/layout';
import { useAtom } from 'jotai';
import { styleAtom } from '../../atom';
import FileImporter from '../FileImporter/FileImporter';
import StyleJsonViewer from '../StyleJsonViewer/StyleJsonViewer';
import { FileOutlined } from '@ant-design/icons';
import sampleStyle from '../../assets/sample-style.json';
import type { StyleSpecification } from 'maplibre-gl';
import StyleUrlLoader from '../StyleUrlLoader/StyleUrlLoader';
import BasicInfo from '../BasicInfo/BasicInfo';
import LayerEditor from '../LayerEditor/LayerEditor';
import SourceEditor from '../SourceEditor/SourceEditor';
import AddLayerModal from '../AddLayerModal/AddLayerModal';
import { generateColorByIndex, generatePaintWithAutoColor } from '../../utils/generateAutoColor';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const StyleEditor: React.FC = () => {
  // サイドバーの選択状態を管理
  const [selectedMenu, setSelectedMenu] = useState('layer');
  const [style, setStyle] = useAtom(styleAtom);
  const prevStyleRef = React.useRef<typeof style | null>(null);

  // style.json読み込みエラー状態
  const [loadError, setLoadError] = useState(false);

  // 新規レイヤー追加用のstate
  const [addLayerModalOpen, setAddLayerModalOpen] = useState(false);
  const [addLayerGroupType, setAddLayerGroupType] = useState<string | null>(null);
  const [addLayerForm] = Form.useForm();

  // LayerListから呼び出す用
  const handleAddLayer = (groupType: string) => {
    setAddLayerGroupType(groupType);
    setAddLayerModalOpen(true);
    addLayerForm.resetFields();
  };

  // 新規レイヤー追加処理
  const handleAddLayerOk = () => {
    addLayerForm.validateFields().then(values => {
      if (!style || typeof style === 'string') { return; }

      // ユーザーが paint を指定していない場合、自動で色を付与する
      const existingLayerCount = style?.layers?.length ?? 0;
      const layerType = addLayerGroupType ?? 'fill';
      let paint: Record<string, unknown>;
      if (values.paint) {
        paint = JSON.parse(values.paint);
      } else {
        const autoColor = generateColorByIndex(existingLayerCount);
        paint = generatePaintWithAutoColor(layerType, autoColor);
      }

      const newLayer = {
        id: values.id,
        type: layerType,
        source: values.source,
        'source-layer': values.sourceLayer,
        layout: values.layout ? JSON.parse(values.layout) : {},
        filter: values.filter ? JSON.parse(values.filter) : undefined,
        paint,
      };
      const newStyle = {
        ...style,
        layers: [...(style?.layers ?? []), newLayer]
      };
      setStyle(newStyle as StyleSpecification);
      // 必要ならsavePrevStyle(newStyle);
      setAddLayerModalOpen(false);
      // message.success('レイヤーを追加しました');
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
  }

  // style編集前に前の状態を保存する関数
  const savePrevStyle = (newStyle: typeof style) => {
    prevStyleRef.current = newStyle ? JSON.parse(JSON.stringify(newStyle)) : null;
  };

  // style.jsonダウンロード処理
  const handleDownloadStyleJson = () => {
    if (!style) { return; }
    // 日付をMMDD形式で取得
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const defaultFileName = `style_${yyyy}${mm}${dd}.json`;

    // ファイル名をユーザーに入力させる
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

  // サイドバー内で表示するコンポーネントを切り替え
  let sidebarContent = null;
  if (selectedMenu === 'basic-info') {
    sidebarContent = <BasicInfo />;
  } else if (selectedMenu === 'sources') {
    sidebarContent = <SourceEditor savePrevStyle={savePrevStyle} />;
  } else if (selectedMenu === 'layer') {
    sidebarContent = <LayerEditor savePrevStyle={savePrevStyle} addLayer={handleAddLayer} />;
  } else if (selectedMenu === 'style') {
    sidebarContent = <StyleJsonViewer savePrevStyle={savePrevStyle} />;
  }

  return (
    <Layout className="layer-editor-root">
      <Header>
        <Flex justify='space-between' align='center' style={{ width: '100%', height: '100%' }}>
          <Title level={3} style={{color: '#fff', lineHeight: 1, margin: 0}}>map style studio</Title>
          { style && 
            <Flex gap={8}>
              <Button type="default" onClick={handleChangeStyle}>
                別のスタイルを読み込む
              </Button>
              <Button type="primary" onClick={handleDownloadStyleJson}>
                styleダウンロード
              </Button>
            </Flex>
          }
        </Flex>
      </Header>
      <Layout style={{ height: 'calc(100vh - 64px)' }}>
        <Sider
          width={ sidebarContent ? 665 : 160}
          data-testid="sidebar"
          className="layer-editor-sidebar"
        >
          <Flex justify='space-between' align='start' style={{ height: '100%' }}>
            <Sidebar selectedMenu={selectedMenu} onChangeMenu={setSelectedMenu} />
            { sidebarContent }
          </Flex>
        </Sider>
        <Layout>
          <Content
            data-testid="map"
            className="layer-editor-content"
          >
            { style ? 
              <MapCanvas />
              :
              <Flex
                vertical
                justify='center'
                align='center'
                gap={16}
                style={{ textAlign: 'center', padding: '20px', height: '100%' }}
              >
                {loadError && (
                  <Text type="danger" strong>スタイルの読み込みに失敗しました</Text>
                )}
                <Button
                  type="default" 
                  size='large'
                  icon={<FileOutlined />}
                  onClick={handleOpenSampleStyle}
                >
                  サンプルスタイルを開く
                </Button>
                <Text strong>OR</Text>
                <StyleUrlLoader setLoadError={setLoadError} />
                <Text strong>OR</Text>
                <FileImporter setLoadError={setLoadError} />
              </Flex>
            }
          </Content>
        </Layout>
      </Layout>
      <AddLayerModal
        open={addLayerModalOpen}
        onOk={handleAddLayerOk}
        onCancel={handleAddLayerCancel}
        form={addLayerForm} 
        layers={style && typeof style !== 'string' ? style?.layers : []} 
      />
    </Layout>
  );
};

export default StyleEditor;
