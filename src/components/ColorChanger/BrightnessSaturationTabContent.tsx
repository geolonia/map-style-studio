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
    // 自分が書き込んだスタイル。外部からの更新と区別するために持つ。
    const appliedStyleRef = useRef<StyleSpecification | null>(null);

    // style は遅れて入ることも、他の編集で差し替わることもある。
    // 自分の書き込み以外で変わったときは、それを新しい基準スタイルにする。
    useEffect(() => {
        if (!style || typeof style !== 'object') { return; }
        if (style === appliedStyleRef.current) { return; }
        baseStyleRef.current = style;
        setBrightness(0);
        setSaturation(0);
    }, [style]);

    useEffect(() => {
        if (!style || typeof style !== 'object') { return; }
        const base = baseStyleRef.current;
        if (!base) { return; }

        // どちらも0なら調整していない状態。基準スタイルへ戻すだけにする。
        if (brightness === 0 && saturation === 0) {
            if (style !== base) {
                savePrevStyle(style);
                appliedStyleRef.current = base;
                setStyle(base);
            }
            return;
        }

        // 現在のスタイルに重ねると調整が累積するため、常に基準スタイルから作り直す
        const adjusted = applyAppearanceAdjustments(base, brightness, saturation);
        savePrevStyle(style);
        appliedStyleRef.current = adjusted;
        setStyle(adjusted);
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