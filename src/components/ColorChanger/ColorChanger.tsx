import React, { useState } from 'react';
import { Tabs } from 'antd';
import ThemeTabContent from './ThemeTabContent';
import CategoryTabContent from './CategoryTabContent';
import BrightnessSaturationTabContent from './BrightnessSaturationTabContent';

type ColorProps = {
    savePrevStyle: (newStyle: maplibregl.StyleSpecification | undefined) => void
}


const ColorChanger: React.FC<ColorProps> = ({ savePrevStyle }) => {
    const [tab, setTab] = useState<'theme' | 'category' | 'brightness-saturation'>('category');

    return (
        <div>
            <Tabs
                activeKey={tab}
                onChange={key => setTab(key as 'theme' | 'category' | 'brightness-saturation')}
                items={[
                    {
                        key: 'category',
                        label: 'カテゴリ別',
                        children: (
                            <CategoryTabContent savePrevStyle={savePrevStyle} />
                        ),
                    },
                    {
                        key: 'theme',
                        label: 'テーマ',
                        children: (
                            <ThemeTabContent savePrevStyle={savePrevStyle} />
                        ),
                    },
                    {
                        key: 'brightness-saturation',
                        label: '明度・彩度調整',
                        children: (
                            <BrightnessSaturationTabContent savePrevStyle={savePrevStyle} />
                        ),
                    }
                ]}
            />
        </div>
    );
};

export default ColorChanger;
