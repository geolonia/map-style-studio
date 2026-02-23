import './App.css'
import { ConfigProvider, theme } from 'antd'
import StyleEditor from './components/StyleEditor/StyleEditor'

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1668dc',
          borderRadius: 8,
          colorBgContainer: 'rgba(30, 30, 30, 0.9)',
          colorBgElevated: 'rgba(40, 40, 40, 0.95)',
          colorBorder: 'rgba(255, 255, 255, 0.12)',
          colorText: 'rgba(255, 255, 255, 0.88)',
          colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
        },
        components: {
          Card: {
            colorBgContainer: 'transparent',
          },
          Tabs: {
            colorBgContainer: 'transparent',
          },
          Collapse: {
            colorBgContainer: 'transparent',
            headerBg: 'rgba(255, 255, 255, 0.04)',
          },
          Input: {
            colorBgContainer: 'rgba(0, 0, 0, 0.3)',
          },
          Modal: {
            contentBg: 'rgba(30, 30, 30, 0.98)',
            headerBg: 'rgba(30, 30, 30, 0.98)',
          },
        },
      }}
    >
      <StyleEditor />
    </ConfigProvider>
  )
}

export default App
