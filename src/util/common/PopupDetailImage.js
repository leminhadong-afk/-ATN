import "./style-popup-detail-image.css";

const PopupDetailImage = ({ url, onClose }) => {
  return (
    <div className="fullscreen-popup">
      <div className="popup-content">
        <span className="close-button" onClick={onClose}>
          X
        </span>
        <img src={url} alt="LargeImage" className="fullscreen-image" />
      </div>
    </div>
  );
};

export default PopupDetailImage;
