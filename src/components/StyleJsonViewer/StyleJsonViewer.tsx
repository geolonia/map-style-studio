import React, { useState } from 'react';
import { Button, Card, Input, message, Space, Tooltip, Typography } from 'antd';
import { useAtom } from 'jotai';
import { styleAtom } from '../../atom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { validateJson } from '../../lib/validators';

const { Text } = Typography;

type StyleJsonViewerProps = {
    savePrevStyle: (newStyle: maplibregl.StyleSpecification | undefined) => void
}

const StyleJsonViewer: React.FC<StyleJsonViewerProps> = ({ savePrevStyle }) => {
  const [style, setStyle] = useAtom(styleAtom);
  const [editing, setEditing] = useState(false);
  const [code, setCode] = useState(() => JSON.stringify(style, null, 2));
  const [jsonError, setJsonError] = useState<string | undefined>(undefined);

  // 編集モード切替時に最新のstyleを反映
  const handleEdit = () => {
    setCode(JSON.stringify(style, null, 2));
    setJsonError(undefined);
    setEditing(true);
  };

  const handleSave = () => {
    const result = validateJson(code);
    if (!result.valid) {
      setJsonError(result.message);
      message.error(result.message ?? 'JSONの形式が正しくありません');
      return;
    }
    try {
      const parsed = JSON.parse(code);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setJsonError('style.json はオブジェクトである必要があります');
        message.error('style.json はオブジェクトである必要があります');
        return;
      }
      setStyle(parsed);
      setEditing(false);
      setJsonError(undefined);
      message.success('style.jsonを更新しました');
      savePrevStyle(parsed);
    } catch {
      setJsonError('JSONの形式が正しくありません');
      message.error('JSONの形式が正しくありません');
    }
  };

  const handleCancel = () => {
    setCode(JSON.stringify(style, null, 2));
    setJsonError(undefined);
    setEditing(false);
  };

  return (
    <Card className='editor-card' id='layer-editor' size='small'>
      <Space style={{ width: '100%', height: '40px' }} direction="horizontal" align="center">{
        editing ? (
          <>
            <Tooltip title="保存">
              <Button
                type="primary"
                shape="circle"
                icon={<CheckOutlined />}
                onClick={handleSave}
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
              onClick={handleEdit}
            />
          </Tooltip>
        )
      }</Space>
      <div style={{ width: '100%', maxHeight: 'calc(100% - 40px)', overflowY: 'scroll' }}>
        {editing ? (
          <div>
            {jsonError && <Text type="danger" style={{ fontSize: 12, display: 'block', marginBottom: 4, padding: '0 4px' }}>{jsonError}</Text>}
            <Input.TextArea
              value={code}
              onChange={e => { setCode(e.target.value); setJsonError(undefined); }}
              autoSize={{ minRows: 20 }}
              status={jsonError ? 'error' : undefined}
              style={{
                width: '100%',
                fontSize: 14,
                background: '#1e1e1e',
                color: '#fff',
                border: 'none',
              }}
            />
          </div>
        ) : (
          <SyntaxHighlighter language="json" style={vscDarkPlus}>
            {JSON.stringify(style, null, 2)}
          </SyntaxHighlighter>
        )}
      </div>
    </Card>
  );
};

export default StyleJsonViewer;
