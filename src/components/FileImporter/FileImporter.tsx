import React, { useState } from 'react';
import { Space, message, Upload, Typography, type UploadProps, Row, Col, Spin } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import './FileImporter.css';
import { useSetAtom } from 'jotai';
import { styleAtom } from '../../atom';

const { Text } = Typography;
const { Dragger } = Upload;

type Props = {
  setLoadError: React.Dispatch<React.SetStateAction<boolean>>;
  onShowStyleEditor?: () => void;
};

const FileImporter: React.FC<Props> = ({ setLoadError }) => {
  const setStyle = useSetAtom(styleAtom);
  const [spinning, setSpinning] = useState(false);

  const props: UploadProps = {
    name: 'file',
    accept: '.json',
    multiple: false,
    beforeUpload(file) {
      const isJson = file.name.endsWith('.json');
      if (!isJson) {
        message.error('JSONファイルのみアップロードできます');
        setLoadError(true);
      }
      return isJson || Upload.LIST_IGNORE;
    },
    customRequest({ file, onSuccess }) {
      setSpinning(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          setStyle(json);
          setLoadError(false);
          if (onSuccess) { onSuccess("ok"); }
        } catch {
          message.error('style.jsonの読み込みに失敗しました');
          setLoadError(true);
        } finally {
          setSpinning(false);
        }
      };
      reader.readAsText(file as File);
    }
  };

  return (
    <Row justify="center" align="middle">
      <Col>
        <div className="file-importer-container">
          <Dragger {...props} showUploadList={false} style={{ backgroundColor: 'transparent' }}>
            {spinning ?
              <Spin spinning={spinning} tip="styleを読み込んでいます" />
              :
              <Space direction="vertical">
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <Text strong>クリックまたはファイルをドラッグしてアップロード</Text>
                <Text type="secondary">地図スタイルをインポートするには、JSONファイルを選択してください。</Text>
              </Space>
            }
          </Dragger>
        </div>
      </Col>
    </Row>
  );
};

export default FileImporter;
