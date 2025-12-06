'use client';
import { useRef, useState, useEffect } from 'react';

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 1280, height: 720 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setIsCameraOn(true);
      }
    } catch (err) {
      alert("Không thể mở camera: " + err.message);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Kích thước video thực tế
    const vWidth = video.videoWidth;
    const vHeight = video.videoHeight;

    // Tỷ lệ khung hình mong muốn (ví dụ khung hình chữ nhật ở giữa màn hình)
    // Giả sử khung trên UI chiếm 80% chiều rộng và tỷ lệ 1.6 (giống thẻ ID)
    const cropWidth = vWidth * 0.8; 
    const cropHeight = cropWidth / 1.58; 
    const startX = (vWidth - cropWidth) / 2;
    const startY = (vHeight - cropHeight) / 2;

    // Set canvas size bằng kích thước crop (để ảnh đầu ra chỉ chứa phần trong khung)
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Cắt ảnh từ video (sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    ctx.drawImage(video, startX, startY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    // Chuyển thành Blob để upload
    canvas.toBlob((blob) => {
      const file = new File([blob], "id_card.jpg", { type: "image/jpeg" });
      onCapture(file);
      
      // Stop stream sau khi chụp
      stream.getTracks().forEach(track => track.stop());
      setIsCameraOn(false);
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {!isCameraOn ? (
        <button 
          onClick={startCamera}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-4 hover:bg-blue-700"
        >
          Mở Máy Ảnh
        </button>
      ) : (
        <div className="relative w-full aspect-[3/4] bg-black rounded-lg overflow-hidden">
          {/* Video Feed */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Khung (Guide Box) - Dùng CSS Absolute để căn giữa */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-yellow-400 w-[80%] aspect-[1.58/1] rounded-md shadow-[0_0_0_999px_rgba(0,0,0,0.5)]">
               <div className="absolute top-0 left-0 bg-yellow-400 text-black text-xs px-1">Đặt CCCD vào khung</div>
            </div>
          </div>

          {/* Nút chụp */}
          <button 
            onClick={captureImage}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-4 shadow-lg active:scale-95"
          >
            <div className="w-4 h-4 bg-red-600 rounded-full"></div>
          </button>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}