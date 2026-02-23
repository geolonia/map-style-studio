import React from 'react';
import { Button, Flex, Typography } from 'antd';
import { DownloadOutlined, FolderOpenOutlined } from '@ant-design/icons';
import './FloatingToolbar.css';

const { Title } = Typography;

type Props = {
  hasStyle: boolean;
  onChangeStyle: () => void;
  onDownload: () => void;
};

const FloatingToolbar: React.FC<Props> = ({ hasStyle, onChangeStyle, onDownload }) => {
  return (
    <div className="floating-toolbar">
      <Flex justify="space-between" align="center" style={{ width: '100%' }}>
        <Title level={4} style={{ color: '#fff', margin: 0, letterSpacing: '0.5px' }}>
          map style studio
        </Title>
        {hasStyle && (
          <Flex gap={8}>
            <Button
              type="text"
              icon={<FolderOpenOutlined />}
              onClick={onChangeStyle}
              className="toolbar-button-text"
            >
              別のスタイル
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={onDownload}
            >
              ダウンロード
            </Button>
          </Flex>
        )}
      </Flex>
    </div>
  );
};

export default FloatingToolbar;
