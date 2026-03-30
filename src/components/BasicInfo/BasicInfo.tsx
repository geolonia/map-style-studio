import React, { useCallback, useEffect } from 'react';
import { Input, Button, Form, Space, message, Card } from 'antd';
import { useAtom } from 'jotai';
import { styleAtom } from '../../atom';
import { validateCoordinates, validateZoomLevel } from '../../lib/validators';

const BasicInfo: React.FC = () => {
    const [style, setStyle] = useAtom(styleAtom);

    // フォーム初期値
    const [form] = Form.useForm();
    useEffect(() => {
        if (style && typeof style === 'object') {
            form.setFieldsValue({
                name: style.name ?? '',
                center: style.center ? style.center.join(',') : '',
                zoom: style.zoom ?? '',
            });
        }
    }, [style, form]);

    // 保存処理
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSave = useCallback((values: any) => {
        try {
            if(!style || typeof style !== 'object') {
                message.error('スタイルが正しく読み込まれていません');
                return;
            }
            const newStyle = {
                ...style!,
                name: values.name,
                center: values.center
                    ? values.center.split(',').map((v: string) => Number(v.trim()))
                    : style?.center,
                zoom: values.zoom !== '' ? Number(values.zoom) : style?.zoom,
            };
            setStyle(newStyle);
            message.success('基本情報を保存しました');
        } catch {
            message.error('保存に失敗しました');
        }
    }, [style, setStyle]);

    return (
        <Card className='editor-card' size='small'>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                style={{ margin: '0 auto', padding: 24 }}
            >
                <Form.Item label="スタイル名" name="name">
                    <Input placeholder="style.jsonのname" />
                </Form.Item>
                <Form.Item
                    label="中心座標(center)"
                    name="center"
                    rules={[{
                        validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            const result = validateCoordinates(value);
                            return result.valid ? Promise.resolve() : Promise.reject(new Error(result.message));
                        }
                    }]}
                >
                    <Input placeholder="例: 139.767,35.681" />
                </Form.Item>
                <Form.Item
                    label="ズーム(zoom)"
                    name="zoom"
                    rules={[{
                        validator: (_, value) => {
                            if (value === '' || value === undefined || value === null) return Promise.resolve();
                            const result = validateZoomLevel(Number(value));
                            return result.valid ? Promise.resolve() : Promise.reject(new Error(result.message));
                        }
                    }]}
                >
                    <Input type="number" placeholder="例: 10" />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            保存
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default BasicInfo;
