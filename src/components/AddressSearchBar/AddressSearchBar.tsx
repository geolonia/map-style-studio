import React, { useState } from 'react';
import { Input, Button, message, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

type Props = {
  map: maplibregl.Map | null;
};

const AddressSearchBar: React.FC<Props> = ({ map }) => {
  const [address, setAddress] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!address || !map) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lon, lat } = data[0];
        map.flyTo({ center: [parseFloat(lon), parseFloat(lat)], zoom: 16 });
      } else {
        message.warning('住所が見つかりませんでした');
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        message.error(e.message || '検索に失敗しました');
      } else {
        message.error('検索に失敗しました');
      }
    }
    setSearching(false);
  };

  return (
    <div style={{
      position: 'absolute',
      top: 16,
      right: 16,
      zIndex: 10,
      background: 'rgba(20, 20, 20, 0.75)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: 8,
      padding: 4,
      boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      <Space>
        <Input
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="住所を入力"
          style={{ width: 200 }}
          onPressEnter={handleSearch}
          disabled={searching}
        />
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleSearch}
          loading={searching}
        >
          検索
        </Button>
      </Space>
    </div>
  );
};

export default AddressSearchBar;
