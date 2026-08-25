import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Input, Spin } from 'antd';
import { useAtom, useAtomValue } from 'jotai';
import { mapAtom, styleAtom } from '../../atom';
import { groupLayersByType } from '../../utils/layerControl';
import LayerGroupPanel from './LayerGroupPanel';
import { isLayerMatched } from '../../utils/searchHelpers';
import {
  List,
  type RowComponentProps
} from "react-window";
import type { EditingType, FieldType } from './LayerList.types';
import './LayerList.css';


type LayerGroup = {
  type: string;
  label: string;
  layers: maplibregl.LayerSpecification[];
};

type RowProps = {
  layerGroups: LayerGroup[];
  editing: EditingType | null;
  handleEdit: (layerId: string, field: FieldType) => void;
  handleResetStyle: (layerId: string, field: FieldType) => void;
  handleDeleteLayer: (layerId: string) => void;
  handleSave: (layerId: string, field: FieldType, value: string) => void;
  handleCancel: () => void;
  handleDeleteAllLayers: (groupType: string) => void;
  addLayer: (groupType: string) => void;
  filteredGroups: LayerGroup[];
};

function rowHeight() {
  return 120;
}

function RowComponent({ index, filteredGroups, layerGroups, editing, handleEdit, handleResetStyle, handleDeleteLayer, handleSave, handleCancel, handleDeleteAllLayers, addLayer }: RowComponentProps<RowProps>) {
  const group = filteredGroups[index];
  return (
    <div style={{marginBottom: '12px'}} key={group.type}>
      <LayerGroupPanel
        layerGroups={layerGroups}
        group={group}
        editing={editing}
        onEdit={handleEdit}
        onResetStyle={(field) => handleResetStyle(group.layers[0].id, field)}
        onDeleteLayer={handleDeleteLayer}
        onSave={handleSave}
        onCancel={handleCancel}
        onDeleteAllLayers={() => handleDeleteAllLayers(group.type)}
        onAddLayer={() => addLayer(group.type)}
      />
    </div>
  );
}


type LayerListProps = {
    savePrevStyle: (newStyle: maplibregl.StyleSpecification | undefined) => void;
  addLayer: (groupType: string) => void;
}

const LayerList: React.FC<LayerListProps> = ({ savePrevStyle, addLayer }) => {
    const [style, setStyle] = useAtom(styleAtom);
    const map = useAtomValue(mapAtom);
    const layers = useMemo(() => (typeof style !== 'string' && style?.layers) ? style?.layers : [], [style]);
    const grouped = groupLayersByType(layers);

    const [loading, setLoading] = useState<'idle' | 'loading' | 'loaded'>('idle');

    const layerGroups = useMemo(() => [
        { type: 'circle', label: 'circle', layers: grouped.point },
        { type: 'symbol', label: 'symbol', layers: grouped.symbol },
        { type: 'line', label: 'line', layers: grouped.line },
        { type: 'fill', label: 'fill', layers: grouped.fill },
        { type: 'other', label: 'other', layers: grouped.other },
    ], [grouped]);

    const [editing, setEditing] = useState<{
        layerId: string;
        field: 'filter' | 'paint' | 'layout' | null;
        value: string;
    } | null>(null);

    const [search, setSearch] = useState('');

    // 検索ワードでフィルタリング
    const filteredGroups = useMemo(() => (
        search === ''
            ? layerGroups
            : layerGroups
                .map(group => ({
                    ...group,
                    layers: group.layers?.filter(layer => isLayerMatched(layer, search)),
                }))
                .filter(group => (group.layers ?? []).length > 0)
    ), [layerGroups, search]);

    // 編集開始
    const handleEdit = useCallback((layerId: string, field: 'filter' | 'paint' | 'layout') => {
        if (typeof style === 'string') { return; }
        setEditing({ layerId, field, value: '' });
        savePrevStyle(style);
    }, []);

    // 編集保存
    const handleSave = useCallback((layerId: string, field: 'filter' | 'paint' | 'layout', value: string) => {
        if (typeof style === 'string') { return; }
        try {
            const newValue = value ? JSON.parse(value) : undefined;
            const nowLngLat = map?.getCenter()
                ? [map.getCenter().lng, map.getCenter().lat]
                : style?.center;
            const nowZoom = map?.getZoom() ?? style?.zoom;
            const newStyle = {
                ...style!,
                center: nowLngLat,
                zoom: nowZoom,
                layers: layers.map((l) =>
                    l.id === layerId
                    ? {
                        ...l,
                        [field]: newValue,
                        layout: field === 'layout'
                            ? (newValue ?? {})
                            : (l.layout === undefined ? {} : l.layout)
                        }
                    : l
                )
            };
            setStyle(newStyle as maplibregl.StyleSpecification);
            savePrevStyle(newStyle as maplibregl.StyleSpecification);
            setEditing(null);
        } catch {
            // エラー処理
        }
    }, [layers, style, map, setStyle, savePrevStyle]);

    // リセット処理（filter/paint/layoutをundefinedにする）
    const handleResetStyle = useCallback((layerId: string, field: FieldType) => {
        if( typeof style === 'string' ) { return; }
        const newStyle = { ...style!, layers: layers.map((l) =>
            l.id === layerId
                ? {
                    ...l,
                    [field]:
                        field === 'filter' ? [] :
                        field === 'paint' || field === 'layout' ? {} :
                        undefined
                }
                : l
        )};
        setStyle(newStyle);
        savePrevStyle(newStyle);
    }, [layers, style, setStyle, savePrevStyle]);

    // レイヤー削除処理
    const handleDeleteLayer = useCallback((layerId: string) => {
        if (typeof style === 'string') { return; }
        const newStyle = { ...style!, layers: layers.filter((l) => l.id !== layerId) };
        setStyle(newStyle);
        savePrevStyle(newStyle);
    }, [layers, style, setStyle, savePrevStyle]);

    // 編集キャンセル
    const handleCancel = useCallback(() => setEditing(null), []);

    // 全レイヤー削除
    const handleDeleteAllLayers = useCallback((groupType: string) => {
        if (typeof style === 'string') { return; }

        const newStyle = {
            ...style!,
            layers: layers.filter(l => 
                groupType === 'other' ? 
                    layerGroups.some(g => g.type === l.type && g.layers.includes(l)) === true
                :
                    l.type !== groupType
            )
        };

        setStyle(newStyle);
        savePrevStyle(newStyle);
    }, [layers, style, setStyle, savePrevStyle]);


    // 読み込み開始
    useEffect(() => {
        if(style && loading === 'idle' && layers && layers.length === 0) { setLoading('loading'); }
    }, [style, loading]);

    // 読み込みをoffにする
    useEffect(() => {
        if (loading === 'loading' && layers && layers.length > 0) {
            setLoading('loaded');
        }
    }, [layers, loading]);

    return (
        <Spin spinning={loading === 'loading'} tip="レイヤーを読み込み中..." style={{ width: '100%' }}>
            <Input
                size="large"
                placeholder="レイヤー名、色、属性情報等で検索"
                value={search}
                onChange={e => setSearch(e.target.value)}
                allowClear
            />
            <List<RowProps>
                rowComponent={RowComponent}
                rowCount={filteredGroups.length}
                rowHeight={rowHeight}
                rowProps={{
                    layerGroups,
                    editing,
                    handleEdit,
                    handleResetStyle,
                    handleDeleteLayer,
                    handleSave,
                    handleCancel,
                    handleDeleteAllLayers,
                    addLayer,
                    filteredGroups
                }}
                className='layer-list'
            />
        </Spin>
    );
};

export default LayerList;
