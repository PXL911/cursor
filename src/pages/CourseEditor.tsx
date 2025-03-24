import React, { useState, useRef, useEffect } from 'react';
import { Button, Space, message, Slider } from 'antd';
import {
  SaveOutlined,
  SendOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  UndoOutlined,
  RedoOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ScissorOutlined,
  SoundOutlined,
  FontSizeOutlined,
  PictureOutlined,
  StarOutlined,
  AppstoreOutlined
} from '@ant-design/icons';

interface CourseEditorProps {
  file: File;
  onSave?: (editedFile: File) => void;
  onPublish?: (editedFile: File) => void;
}

const CourseEditor: React.FC<CourseEditorProps> = ({ file, onSave, onPublish }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editHistory, setEditHistory] = useState<string[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string>('');

  useEffect(() => {
    // 创建视频URL并在组件卸载时清理
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSave = () => {
    if (onSave) {
      onSave(file);
    }
  };

  const handlePublish = () => {
    if (onPublish) {
      onPublish(file);
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    requestAnimationFrame(() => {
      setCurrentTime(video.currentTime);
    });
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setDuration(video.duration);
    setCurrentTime(0);
  };

  const handleSliderChange = (value: number) => {
    if (videoRef.current) {
      const video = videoRef.current;
      video.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(error => {
          console.error('视频播放失败:', error);
          setIsPlaying(false);
          message.error('视频播放失败，请重试');
        });
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      message.info('已撤销上一步操作');
    }
  };

  const handleRedo = () => {
    if (currentHistoryIndex < editHistory.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
      message.info('已重做操作');
    }
  };

  const formatTime = (seconds: number | undefined): string => {
    if (typeof seconds !== 'number') return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ 
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#fff'
    }}>
      {/* 顶部按钮 */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '24px'
      }}>
        <Space>
          <Button 
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            style={{
              background: 'linear-gradient(45deg, #a6c0fe, #c2a8fd)',
              border: 'none'
            }}
          >
            保存到草稿箱
          </Button>
          <Button 
            type="primary"
            icon={<SendOutlined />}
            onClick={handlePublish}
            style={{
              background: 'linear-gradient(45deg, #a6c0fe, #c2a8fd)',
              border: 'none'
            }}
          >
            发布
          </Button>
        </Space>
      </div>

      {/* 视频预览区域 */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '24px',
        position: 'relative'
      }}>
        <video
          ref={videoRef}
          style={{ 
            width: '100%',
            height: 'calc(100vh - 300px)',
            objectFit: 'contain'
          }}
          src={videoUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleVideoEnded}
          playsInline
          preload="auto"
        />

        {/* 进度条和控制按钮 */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(45deg, #a6c0fe, #c2a8fd)',
          padding: '16px',
          borderRadius: '0 0 8px 8px'
        }}>
          <Slider
            value={currentTime}
            min={0}
            max={duration}
            step={0.1}
            onChange={handleSliderChange}
            tooltip={{ formatter: formatTime }}
            style={{ marginBottom: '16px' }}
            trackStyle={{ backgroundColor: '#fff' }}
            railStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
            handleStyle={{ borderColor: '#fff', backgroundColor: '#fff' }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Button 
                type="text"
                icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={togglePlay}
                style={{ 
                  color: '#fff',
                  fontSize: '24px',
                  padding: '8px',
                  height: 'auto'
                }}
              />
              <span style={{ color: '#fff', fontSize: '14px' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div style={{ 
              display: 'flex',
              gap: '16px'
            }}>
              <Button 
                type="text"
                icon={<UndoOutlined />}
                onClick={handleUndo}
                style={{ 
                  color: '#fff',
                  fontSize: '20px',
                  padding: '8px',
                  height: 'auto'
                }}
              />
              <Button 
                type="text"
                icon={<RedoOutlined />}
                onClick={handleRedo}
                style={{ 
                  color: '#fff',
                  fontSize: '20px',
                  padding: '8px',
                  height: 'auto'
                }}
              />
              <Button 
                type="text"
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={toggleFullscreen}
                style={{ 
                  color: '#fff',
                  fontSize: '20px',
                  padding: '8px',
                  height: 'auto'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 底部编辑工具 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        padding: '16px',
        borderTop: '1px solid #f0f0f0'
      }}>
        <Button 
          type="text" 
          icon={<ScissorOutlined />}
          onClick={() => message.info('进入剪辑模式')}
        >
          剪辑
        </Button>
        <Button 
          type="text" 
          icon={<SoundOutlined />}
          onClick={() => message.info('进入音频编辑')}
        >
          音频
        </Button>
        <Button 
          type="text" 
          icon={<FontSizeOutlined />}
          onClick={() => message.info('添加文本')}
        >
          文本
        </Button>
        <Button 
          type="text" 
          icon={<PictureOutlined />}
          onClick={() => message.info('添加贴纸')}
        >
          贴纸
        </Button>
        <Button 
          type="text" 
          icon={<StarOutlined />}
          onClick={() => message.info('添加特效')}
        >
          特效
        </Button>
        <Button 
          type="text" 
          icon={<FontSizeOutlined />}
          onClick={() => message.info('添加字幕')}
        >
          字幕
        </Button>
        <Button 
          type="text" 
          icon={<AppstoreOutlined />}
          onClick={() => message.info('选择模板')}
        >
          模板
        </Button>
      </div>
    </div>
  );
};

export default CourseEditor; 