import React, { useState } from 'react';
import { Upload, Card, List, Button, message, Modal, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import { useNavigate } from 'react-router-dom';
import CourseEditor from './CourseEditor';

const { Dragger } = Upload;
const { Title } = Typography;

interface Course {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'image' | 'text' | 'document';
  status: 'draft' | 'published';
  createTime: string;
  file?: File;
  originalId?: string; // 用于追踪原始文件
  draftVersion?: number; // 草稿版本号
}

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [drafts, setDrafts] = useState<Course[]>([]);
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isPublishModalVisible, setIsPublishModalVisible] = useState(false);
  const [justPublishedCourse, setJustPublishedCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const navigate = useNavigate();

  const allowedFileTypes = [
    // 视频
    '.mp4', '.avi', '.mov', '.flv', '.wmv', '.mkv', '.3gp',
    // 音频
    '.mp3', '.wav', '.aac', '.flac', '.wma', '.ogg',
    // 图片
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg',
    // 文档
    '.txt', '.doc', '.docx', '.pdf', '.rtf', '.html', '.md',
    '.dot', '.dotx', '.xls', '.xlsx', '.xlt', '.xltx', '.xlsm',
    '.ppt', '.pptx', '.pot', '.potx', '.ppsx'
  ];

  const getFileType = (fileName: string): 'video' | 'audio' | 'image' | 'text' | 'document' => {
    const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
    if (['.mp4', '.avi', '.mov', '.flv', '.wmv', '.mkv', '.3gp'].includes(ext)) return 'video';
    if (['.mp3', '.wav', '.aac', '.flac', '.wma', '.ogg'].includes(ext)) return 'audio';
    if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'].includes(ext)) return 'image';
    if (['.txt', '.md'].includes(ext)) return 'text';
    return 'document';
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    accept: allowedFileTypes.join(','),
    customRequest: ({ file, onSuccess }) => {
      setTimeout(() => {
        onSuccess?.("ok");
      }, 0);
    },
    beforeUpload: (file) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedFileTypes.includes(ext)) {
        message.error('不支持的文件类型！');
        return false;
      }
      return true;
    },
    onChange(info) {
      const { status, name, originFileObj } = info.file;
      if (status === 'done' && originFileObj) {
        message.success(`${name} 上传成功`);
        const newDraft: Course = {
          id: Date.now().toString(),
          title: name,
          type: getFileType(name),
          status: 'draft',
          createTime: new Date().toLocaleString(),
          file: originFileObj,
        };
        setDrafts(prevDrafts => [...prevDrafts, newDraft]);
      } else if (status === 'error') {
        message.error(`${name} 上传失败`);
      }
    },
  };

  const handleDelete = (courseId: string) => {
    setCourses(courses.filter(course => course.id !== courseId));
    setDrafts(drafts.filter(draft => draft.id !== courseId));
  };

  const handlePublish = (courseId: string) => {
    const courseToPublish = drafts.find(draft => draft.id === courseId) || 
                          courses.find(course => course.id === courseId);
    if (courseToPublish) {
      const publishedCourse: Course = { 
        ...courseToPublish, 
        status: 'published' as const 
      };
      setCourses([...courses, publishedCourse]);
      setJustPublishedCourse(publishedCourse);
      setIsPublishModalVisible(true);
    }
  };

  const handleSaveAsDraft = (file: File, originalCourse: Course) => {
    // 查找同一原始文件的最大草稿版本号
    const relatedDrafts = drafts.filter(d => d.originalId === originalCourse.id);
    const maxVersion = Math.max(0, ...relatedDrafts.map(d => d.draftVersion || 0));
    const newVersion = maxVersion + 1;

    // 创建新的草稿
    const fileName = originalCourse.title;
    const fileExt = fileName.slice(fileName.lastIndexOf('.'));
    const fileNameWithoutExt = fileName.slice(0, fileName.lastIndexOf('.'));
    const newDraft: Course = {
      id: Date.now().toString(),
      title: `${fileNameWithoutExt}-草稿${newVersion}${fileExt}`,
      type: originalCourse.type,
      status: 'draft',
      createTime: new Date().toLocaleString(),
      file: file,
      originalId: originalCourse.id,
      draftVersion: newVersion,
    };

    setDrafts(prevDrafts => [...prevDrafts, newDraft]);
    setIsEditorVisible(false);
    message.success('已保存到草稿箱');
  };

  const handleDraftClick = (draft: Course) => {
    if (draft.file) {
      setSelectedCourse(draft);
      setCurrentFile(draft.file);
      setIsEditorVisible(true);
    }
  };

  const handlePublishModalContinueEdit = () => {
    setIsPublishModalVisible(false);
    if (justPublishedCourse) {
      setSelectedCourse(justPublishedCourse);
      setCurrentFile(justPublishedCourse.file || null);
      setIsEditorVisible(true);
    }
  };

  const handlePublishModalViewList = () => {
    setIsPublishModalVisible(false);
  };

  const handlePublishFromEditor = (editedFile: File) => {
    if (selectedCourse) {
      const publishedCourse: Course = {
        ...selectedCourse,
        status: 'published' as const,
        file: editedFile
      };
      setCourses([...courses, publishedCourse]);
      setJustPublishedCourse(publishedCourse);
      setIsPublishModalVisible(true);
      setIsEditorVisible(false);
    }
  };

  const renderCourseCard = (course: Course) => (
    <Card
      style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      bodyStyle={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}
      actions={[
        <Button 
          type="link" 
          icon={<EditOutlined />} 
          onClick={() => handleDraftClick(course)}
          style={{
            border: 'none',
            boxShadow: 'none',
            transition: 'all 0.3s',
            margin: '0 auto',
            width: '100%',
            height: '100%'
          }}
          className="custom-action-button"
        >
          编辑
        </Button>,
        <Button 
          type="link" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleDelete(course.id)}
          style={{
            border: 'none',
            boxShadow: 'none',
            transition: 'all 0.3s',
            margin: '0 auto',
            width: '100%',
            height: '100%'
          }}
          className="custom-action-button"
        >
          删除
        </Button>,
        course.status === 'draft' && (
          <Button 
            type="primary" 
            onClick={() => handlePublish(course.id)}
            style={{
              background: 'linear-gradient(45deg, #a6c0fe, #c2a8fd)',
              border: 'none',
              boxShadow: 'none',
              transition: 'all 0.3s',
              margin: '0 auto',
              width: '100%',
              height: '100%'
            }}
            className="custom-action-button"
          >
            发布
          </Button>
        ),
      ].filter(Boolean)}
    >
      <Card.Meta
        title={course.title}
        description={`类型: ${course.type === 'video' ? '视频' : 
          course.type === 'audio' ? '音频' :
          course.type === 'image' ? '图片' :
          course.type === 'text' ? '文本' : '文档'}`}
      />
    </Card>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Card title="上传课程">
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <PlusOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持视频、音频、图片、文本和文档文件
            </p>
          </Dragger>
        </Card>

        <Card title="草稿箱">
          <List
            grid={{ 
              gutter: [16, 16],
              xs: 1,
              sm: 2,
              md: 3,
              lg: 4,
              xl: 4,
              xxl: 4
            }}
            dataSource={drafts}
            renderItem={draft => (
              <List.Item>
                {renderCourseCard(draft)}
              </List.Item>
            )}
          />
        </Card>

        <Card title="已发布">
          <List
            grid={{ 
              gutter: [16, 16],
              xs: 1,
              sm: 2,
              md: 3,
              lg: 4,
              xl: 4,
              xxl: 4
            }}
            dataSource={courses}
            renderItem={course => (
              <List.Item>
                {renderCourseCard(course)}
              </List.Item>
            )}
          />
        </Card>
      </Space>

      <Modal
        title="编辑课程"
        open={isEditorVisible}
        onCancel={() => setIsEditorVisible(false)}
        width={800}
        footer={null}
      >
        {currentFile && selectedCourse && (
          <CourseEditor 
            file={currentFile} 
            onSave={(editedFile) => handleSaveAsDraft(editedFile, selectedCourse)}
            onPublish={handlePublishFromEditor}
          />
        )}
      </Modal>

      <Modal
        title="发布成功"
        open={isPublishModalVisible}
        onCancel={() => setIsPublishModalVisible(false)}
        footer={null}
        centered
      >
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p style={{ fontSize: '16px', marginBottom: '24px' }}>已成功发布</p>
          <Space>
            <Button type="primary" onClick={handlePublishModalContinueEdit}>
              继续编辑
            </Button>
            <Button onClick={handlePublishModalViewList}>
              查看发布列表
            </Button>
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default CourseManagement; 