import { useState } from 'react';

import Skeleton from '@mui/material/Skeleton';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // 닫기 아이콘
import { type IImageElement } from 'client-types/';

import { FrameElement } from './Frame';

interface Props {
  element: IImageElement;
}

const ImageElement = ({ element }: Props) => {
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // 모달 닫기
  const handleClose = () => setOpen(false);

  if (!element.url) {
    return null;
  }

  return (
    <>
      <FrameElement>
        {/* 이미지가 로딩 중일 때 보여줄 Skeleton */}
        {loading && <Skeleton variant="rectangular" width="100%" height={200} />}

        <img
          className={`${element.display}-image`}
          src={element.url}
          onLoad={() => setLoading(false)}
          onClick={() => {
            if (element.display === 'inline') {
              setOpen(true);
            }
          }}
          style={{
            objectFit: 'cover',
            maxWidth: '100%',
            margin: 'auto',
            height: 'auto',
            display: 'block',
            cursor: element.display === 'inline' ? 'pointer' : 'default'
          }}
          alt={element.name}
          loading="lazy"
        />
      </FrameElement>

      {/* 이미지 확대 모달 */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"   // 'large' 사이즈로 설정
      >
        <DialogTitle sx={{ position: 'relative' }}>
          {element.name}
          {/* 상단 오른쪽 닫기 버튼 */}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <img
            src={element.url}
            alt={element.name}
            style={{
              maxWidth: '100%',
              height: 'auto'
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export { ImageElement };
