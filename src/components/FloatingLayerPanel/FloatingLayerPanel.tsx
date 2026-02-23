import React, { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import LayerEditor from '../LayerEditor/LayerEditor';
import type { StyleSpecification } from 'maplibre-gl';
import './FloatingLayerPanel.css';

type Props = {
  savePrevStyle: (newStyle: StyleSpecification | undefined) => void;
  addLayer: (groupType: string) => void;
};

const FloatingLayerPanel: React.FC<Props> = ({ savePrevStyle, addLayer }) => {
  const [visible, setVisible] = useState(true);

  return (
    <>
      <Tooltip title={visible ? 'パネルを閉じる' : 'パネルを開く'} placement="right">
        <Button
          className="panel-toggle-button"
          type="text"
          icon={visible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          onClick={() => setVisible(!visible)}
          style={{ left: visible ? 480 : 12 }}
        />
      </Tooltip>
      <div
        className={`floating-layer-panel ${visible ? 'visible' : 'hidden'}`}
        data-testid="floating-layer-panel"
      >
        <LayerEditor savePrevStyle={savePrevStyle} addLayer={addLayer} />
      </div>
    </>
  );
};

export default FloatingLayerPanel;
