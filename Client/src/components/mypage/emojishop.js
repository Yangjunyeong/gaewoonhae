import "./emojishop.css";
import emoji1 from "../../assets/emoji/emoji1.png";
import emoji2 from "../../assets/emoji/emoji2.png";
import emoji3 from "../../assets/emoji/emoji3.png";
import emoji4 from "../../assets/emoji/emoji4.png";
import { useEffect, useState, useRef } from "react";
import { emojiShopAction } from "../../features/Actions/emojiprocessing";
import { useDispatch, useSelector } from "react-redux";
import BuyBtn from "../modal/Buymodal";
import Webcam from "react-webcam";
import {
  loadHaarFaceModels,
  detectHaarFace,
} from "../../features/openvidu_opencv/opencv/haarFaceDetection"; // 얼굴인식 컴포넌트
import cv from "@techstark/opencv-js";


const Myemojipage = () => {
  // 유저 Id
  const userId = useSelector((state) => state.auth.user.userId);
  // 유저 포인트
  const userPoint = useSelector((state) => state.auth.user.point);
  // 유저 이모지 id
  const userEmojiId = useSelector((state) => state.auth.user.emojiId);
  // 이모지 가격 리스트
  const emojiPriceList = useSelector((state) => state.emoji.emoji.emojiPrice);
  // const nickname = useSelector((state) => state.auth.user.nickname);
  // 구입한 이모지 리스트
  const saveEmoji = useSelector((state) => state.auth.user.saveEmoji) ?? [1];

  const webcamRef = useRef();
  const imgRef = useRef();
  const faceImgRef = useRef();
  const emoji = useRef();
  const selectedEmojiRef = useRef(null);

  // 비디오 종료 조건
  const stopVideo = useRef(false);

  //선택된 이모지 이미지정보
  const [selectedEmoji, setSelectedEmoji] = useState(emoji1);
  //선택된 이모지 id값 - 실행시 유저의 이모지 id값을 가져온다.
  const [selectEmojiId, setSelectEmojiId] = useState(userEmojiId);
  // 선택된 이모지 가격정보
  const [selectPrice, setSelectPrice] = useState(0);
  

  // 이모지 선택시 정보 변경
  const handleEmojiClick = (emoji, num) => {
    setSelectedEmoji(emoji);
    setSelectEmojiId(num);
    setSelectPrice(emojiPriceList[num - 1]);

    selectedEmojiRef.current = emoji;
  };

  // 이모지 선택 취소
  const emojiCancel = () => {
    setSelectedEmoji(null);
    setSelectEmojiId(userEmojiId);
    setSelectPrice(0);

    selectedEmojiRef.current = null;
  };

  // 언마운트시에 비디오 종료
  const onUnmount = () => {
    stopVideo.current = true
    console.log('언마운트 성공')
  }

  // 이모지 리스트 서버에 요청
  useEffect(() => {
    emojiShopdata();
    init();

    return onUnmount  

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = async () => {
    await loadHaarFaceModels(); //opencv : 학습 데이터 import
    nextTick();
    console.log("init실행")
  };

  const nextTick = () => {
    detectFace(); // 2번함수 실행
    if (!stopVideo.current) {
      console.log(stopVideo.current,'확인')
      requestAnimationFrame(async () => {
        nextTick(); // 반복
      })
      console.log('진행중',stopVideo.current)
    } else {
      console.log('종료',stopVideo.current)
    }
  };

  const detectFace = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot(); // 웹캠 화면 캡쳐
    if (!imageSrc) return;

    return new Promise((resolve) => {
      imgRef.current.src = imageSrc;
      imgRef.current.onload = async () => {
        try {
          const img = cv.imread(imgRef.current);

          if (selectedEmojiRef.current !== null) {
            emoji.current.src = selectedEmojiRef.current; // 이모지
            const emo = cv.imread(emoji.current);

            detectHaarFace(img, emo); // opencv : loadHaarFaceModels()로 화면인식을 학습 => 포인트에 이모지 씌우기
          }
          cv.imshow(faceImgRef.current, img);

          img.delete(); // 이미지 초기화
          resolve();
        } catch (error) {
          console.log(error, "detectFace() 에러");
          resolve();
        }
      };
    });
  };

  const dispatch = useDispatch();
  const emojiShopdata = async () => {
    dispatch(emojiShopAction.emojiShopdata());
  };

  //구입 모달
  const [LobbymodalOpen, setLobbyModalOpen] = useState(false);

  // 모달 입장
  const showLobbyModal = () => {
    setLobbyModalOpen(true);
  };

  return (
    <div className="mypage-body2">
      <div className="emoji-shop">
        <h3 className="emoji-title1">이모지 상점 {saveEmoji}</h3>
        <h3 className="emoji-title2">
          보유 포인트: <span>{userPoint}</span>
          <span>C</span>
        </h3>
      </div>
      <div className="emoji-body">
        <div className="emoji-left">
            {/* 영상 */}
            <div className="emoji-video">
              <img className="inputImage" alt="input" ref={imgRef} style={{ display: "none" }} />
              <canvas
                id="canvas1"
                className="outputImage"
                ref={faceImgRef}
                style={{ width: "22vw", borderRadius: "10px" }}
                
              />
              <img className="emoji" alt="input" ref={emoji} style={{ display: "none" }}></img>
              <Webcam
                ref={webcamRef}
                className="webcam"
                mirrored
                screenshotFormat="image/jpeg"
                style={{ width: "22vw", visibility: "hidden" ,display:"flex", position:"absolute" }}
              />
            </div>
            {/* 이모지 선택 */}
            <div className="select-emoji">
              <div className="pick-emoji">
                <div className="emoji-img">
                  {selectedEmoji ? (
                    <img className="selected-emoji" src={selectedEmoji} alt="" />
                  ) : (
                    <p className="selected-emoji">선택된 이모지 없음</p>
                  )}
                </div>
                <div>
                  <div className="emoji-id"><span>이모지id :</span> <span>{selectEmojiId}</span></div>
                  <div className="emoji-price"><span>price :</span> <span>{selectPrice}c</span></div>
                </div>
              </div>
            </div>
        </div>
        <div className="emoji-right">
          {/* 이모지 종류 리스트 */}
          <div className="emojicomp">
            <img
              className="emoji-size"
              src={emoji1}
              onClick={() => handleEmojiClick(emoji1, 1)}
              alt=""
            />
            <img
              className="emoji-size"
              src={emoji2}
              onClick={() => handleEmojiClick(emoji2, 2)}
              alt=""
            />
            <img
              className="emoji-size"
              src={emoji3}
              onClick={() => handleEmojiClick(emoji3, 3)}
              alt=""
            />
            <img
              className="emoji-size"
              src={emoji4}
              onClick={() => handleEmojiClick(emoji3, 3)}
              alt=""
            />
          </div>
        </div>
      </div>
      <div className="select-button">
        <div className="sellect-btn btnpos" onClick={emojiCancel}>
          취소
        </div>
        <div className="sellect-btn" onClick={() => showLobbyModal()}>
          구입
        </div>
      </div>
      {LobbymodalOpen && (
        <BuyBtn
          userPoint={userPoint}
          userId={userId}
          selectEmojiId={selectEmojiId}
          setModalOpen={setLobbyModalOpen}
          selectPrice={selectPrice}
          EmojiList={saveEmoji}
        />
      )}
    </div>
  );
};

export default Myemojipage;