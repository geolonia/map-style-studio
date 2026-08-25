import React, { useState, useEffect, useRef } from 'react';
import { Slider, Space, Typography } from 'antd';
import { useAtom } from 'jotai';
import type { StyleSpecification } from 'maplibre-gl';
import { styleAtom } from '../../atom';
import { applyAppearanceAdjustments } from '../../utils/colorAdjustUtils';

const { Text } = Typography;

type Props = {
    savePrevStyle: (newStyle: maplibregl.StyleSpecification | undefined) => void
};

const BrightnessSaturationTabContent: React.FC<Props> = ({ savePrevStyle }) => {
    const [brightness, setBrightness] = useState(0);
    const [saturation, setSaturation] = useState(0);
    const [style, setStyle] = useAtom(styleAtom);
    // 調整の基準となる、明度・彩度を当てる前のスタイル
    const baseStyleRef = useRef<StyleSpecification | null>(null);

    useEffect(() => {
        if (!style || typeof style !== 'object') { return; }

        // どちらも0のときは調整していない状態。ここを基準スタイルとして控える。
        if (brightness === 0 && saturation === 0) {
            const base = baseStyleRef.current;
            if (!base) {
                baseStyleRef.current = style;
                return;
            }
            // 0に戻したら基準スタイルへ戻す
            if (style !== base) {
                savePrevStyle(style);
                setStyle(base);
            }
            return;
        }

        const base = baseStyleRef.current;
        if (!base) { return; }

        // 現在のスタイルに重ねると調整が累積するため、常に基準スタイルから作り直す
        savePrevStyle(style);
        setStyle(applyAppearanceAdjustments(base, brightness, saturation));
    }, [brightness, saturation]);

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