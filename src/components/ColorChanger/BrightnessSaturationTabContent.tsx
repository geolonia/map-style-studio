import React, { useState, useEffect } from 'react';
import { Slider, Space, Typography } from 'antd';
import { useAtom } from 'jotai';
import { styleAtom } from '../../atom';
import { adjustStyleBrightness, adjustStyleSaturation } from '../../utils/colorAdjustUtils';

const { Text } = Typography;

type Props = {
    savePrevStyle: (newStyle: maplibregl.StyleSpecification | undefined) => void
};

const BrightnessSaturationTabContent: React.FC<Props> = ({ savePrevStyle }) => {
    const [brightness, setBrightness] = useState(0);
    const [saturation, setSaturation] = useState(0);
    const [style, setStyle] = useAtom(styleAtom);

    useEffect(() => {
        if (!style || typeof style !== 'object') { return; }
        const newStyle = adjustStyleBrightness(style, brightness);
        savePrevStyle(style);
        setStyle(newStyle);
    }, [brightness]);


    useEffect(() => {
        if (!style || typeof style !== 'object') { return; }
        const newStyle = adjustStyleSaturation(style, saturation);
        savePrevStyle(style);
        setStyle(newStyle);
    }, [saturation]);

    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>明度</Text>
            <Slider
                min={-10}
                max={10}
                value={brightness}
                onChange={setBrightness}
                style={{ marginLeft: '5%', width: '90%' }}
            />
            <Text strong>彩度</Text>
            <Slider
                min={-10}
                max={10}
                value={saturation}
                onChange={setSaturation}
                style={{ marginLeft: '5%', width: '90%' }}
            />
        </Space>
    );
};

export default BrightnessSaturationTabContent;