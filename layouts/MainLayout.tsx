import React, { useState } from 'react';
import { Layout, Menu, Button, Modal } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  CustomerServiceOutlined,
  ToolOutlined,
  BarChartOutlined,
  SettingOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

const { Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { role, setRole } = useUserStore();
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(true);

  const handleRoleChange = (newRole: 'manager' | 'director') => {
    setRole(newRole);
    setIsRoleModalVisible(false);
  };

  const menuItems = [
    {
      key: 'smart-service',
      icon: <TeamOutlined />,
      label: '智能驻场',
      children: [
        { key: 'customer-success', label: '客户成功' },
        { key: 'online-service', label: '在线客服' },
        { key: 'maintenance', label: '运维工程师' },
      ],
    },
    {
      key: 'workspace',
      icon: <UserOutlined />,
      label: '我的工作台',
      children: role === 'manager' 
        ? [
            { key: 'user-management', label: '用户管理' },
            { key: 'course-management', label: '课程管理' },
            { key: 'learning-records', label: '学习记录' },
            { key: 'data-statistics', label: '数据统计' },
            { key: 'system-maintenance', label: '系统维护' },
          ]
        : [
            { key: 'training-plan', label: '培训计划' },
            { key: 'course-management', label: '课程管理' },
            { key: 'data-analysis', label: '数据分析' },
          ],
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Modal
        title="选择身份"
        open={isRoleModalVisible}
        closable={false}
        footer={null}
        centered
        style={{ 
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        transitionName=""
        maskTransitionName=""
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Button
            type="primary"
            style={{ 
              margin: '10px',
              background: 'linear-gradient(45deg, #a6c0fe, #c2a8fd)',
              border: 'none',
              transition: 'all 0.3s ease',
            }}
            onClick={() => handleRoleChange('manager')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            培训经理
          </Button>
          <Button
            type="primary"
            style={{ 
              margin: '10px',
              background: 'linear-gradient(45deg, #a6c0fe, #c2a8fd)',
              border: 'none',
              transition: 'all 0.3s ease',
            }}
            onClick={() => handleRoleChange('director')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            培训总监
          </Button>
        </div>
      </Modal>

      <Sider
        width={250}
        style={{
          background: 'linear-gradient(180deg, #a6c0fe, #c2a8fd)',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ 
          height: 32, 
          margin: 16, 
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '24px',
          color: '#fff',
          fontSize: '18px',
          fontWeight: 'bold',
        }}>
          导航索引
        </div>
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={['course-management']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
          }}
        />
        <Button
          type="text"
          icon={<SwapOutlined />}
          style={{
            position: 'absolute',
            bottom: 20,
            left: 0,
            right: 0,
            color: '#fff',
            textAlign: 'center',
            border: 'none',
            background: 'transparent',
            transition: 'all 0.3s ease',
          }}
          onClick={() => setIsRoleModalVisible(true)}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          切换身份
        </Button>
      </Sider>
      <Layout style={{ marginLeft: 250 }}>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 