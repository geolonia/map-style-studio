import { Card, Space, Typography } from 'antd';
import React from 'react';

type Props = {
    lngLat: [number, number];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties: Record<string, any>[];
    point?: { x: number; y: number }; // pointをオプショナルに
    onClose: () => void;
};

const MapPopup: React.FC<Props> = ({ lngLat, properties, point, onClose }) => {
    if (!point) return null;

    const { Text } = Typography;

    return (
        <Card
            title={<strong>属性情報（{properties.length}件）</strong>}
            extra={
                <a onClick={onClose} style={{ cursor: 'pointer' }}>
                    閉じる
                </a>
            }
            style={{
                position: 'absolute',
                left: point.x,
                top: point.y,
                transform: 'translate(-50%, -100%)',
                zIndex: 1000,
                width: 360,
                maxHeight: 320
            }}
        >
            <Space direction="vertical" size={2} style={{ width: '100%', height: '100%', boxSizing: 'border-box' }}>
                <Text strong>位置:{lngLat[0].toFixed(5)}, {lngLat[1].toFixed(5)}</Text>
                <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
                    {properties.map((props, idx) => (
                        <pre
                            key={idx}
                            style={{
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                                margin: 0,
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: 4,
                                padding: 8,
                                marginBottom: 8,
                            }}
                        >
                            {JSON.stringify(props, null, 2)}
                        </pre>
                    ))}
                </div>
            </Space>
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: -10,
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderTop: '10px solid rgba(30, 30, 30, 0.95)',
                    filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.08))',
                }}
            />
        </Card>
    );
};

export default MapPopup;